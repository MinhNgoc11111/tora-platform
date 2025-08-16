// src/app/api/orders/route.ts  (đổi đúng đường dẫn bạn đang dùng)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpProductsCacheVersion } from "@/lib/redis";

type InItem = { productId: number; qty: number };

function normalizeItems(items: any): { productId: number; qty: number }[] {
  if (!Array.isArray(items)) return [];
  const m = new Map<number, number>();
  for (const it of items) {
    const pid = Number(it?.productId);
    const qty = Number(it?.qty);
    if (!Number.isInteger(pid) || pid <= 0) continue;
    if (!Number.isInteger(qty) || qty <= 0) continue;
    m.set(pid, (m.get(pid) ?? 0) + qty);
  }
  return Array.from(m, ([productId, qty]) => ({ productId, qty }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body?.userId || "");
    const items = normalizeItems(body?.items);
    const currency = (body?.currency as string) || "VND";
    const shippingAddr = body?.shippingAddr ?? null;
    const note = body?.note ? String(body.note) : null;

    if (!userId) {
      return NextResponse.json({ error: "MISSING_USER_ID" }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "EMPTY_ITEMS" }, { status: 400 });
    }

    // Transaction:
    // (1) Trừ kho atomically (không âm)
    // (2) Lấy giá & tính tổng
    // (3) Tạo Order
    // (4) Ghi StockLedger với refId = order.id
    const result = await prisma.$transaction(async (tx) => {
      // 0) Kiểm tra user tồn tại
      const u = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!u) throw new Error("USER_NOT_FOUND");

      const lines: Array<{ productId: number; qty: number; name: string; price: number; lineTotal: number }> = [];

      // 1) Trừ kho + 2) lấy giá
      for (const { productId, qty } of items) {
        const affected = await tx.$executeRaw`
          UPDATE "Product"
          SET stock = stock - ${qty}
          WHERE id = ${productId}
            AND isActive = 1
            AND stock >= ${qty}
        `;
        if (Number(affected) === 0) {
          throw new Error(`OOS_${productId}`);
        }

        const p = await tx.product.findUnique({
          where: { id: productId },
          select: { name: true, price: true },
        });
        if (!p) throw new Error(`NOT_FOUND_${productId}`);

        lines.push({
          productId,
          qty,
          name: p.name,
          price: p.price,
          lineTotal: p.price * qty,
        });
      }

      const totalPrice = lines.reduce((s, l) => s + l.lineTotal, 0);

      // 3) Tạo đơn hàng (snapshot line items)
      const order = await tx.order.create({
        data: {
          userId,
          items: lines,      // snapshot
          totalPrice,
          currency,
          shippingAddr,
          note: note ?? undefined,
          status: "PENDING",
        },
        select: { id: true, status: true, totalPrice: true, currency: true, createdAt: true },
      });

      // 4) Ghi ledger với refId = order.id (delta âm vì xuất kho)
      await tx.stockLedger.createMany({
        data: lines.map((l) => ({
          productId: l.productId,
          delta: -l.qty,
          reason: "ORDER",
          refId: order.id, // ⬅️ liên kết ledger với đơn
        })),
      });

      return { order, lines, totalPrice };
    });

    // ✅ invalidate cache danh sách/badges sau khi COMMIT
    try {
      await bumpProductsCacheVersion();
    } catch (e) {
      console.warn("bump cache failed (ignored):", e);
    }

    return NextResponse.json(
      {
        ok: true,
        order: result.order,
        items: result.lines,
        totalPrice: result.totalPrice,
      },
      { status: 201 }
    );
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (msg === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 400 });
    }
    if (msg.startsWith("OOS_")) {
      const productId = Number(msg.split("_")[1]);
      return NextResponse.json({ error: "OUT_OF_STOCK", productId }, { status: 409 });
    }
    console.error("create order error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
