import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Huỷ đơn: chỉ cho phép khi đơn chưa Fulfilled/Refunded.
// Khi huỷ: cộng trả tồn kho theo snapshot Order.items và ghi StockLedger: CANCEL
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        select: { id: true, status: true, items: true },
      });
      if (!order) throw new Error("NOT_FOUND");

      if (order.status === "CANCELLED") {
        // idempotent: đã huỷ trước đó → không làm gì thêm
        return { already: true, order: { id: order.id, status: order.status } };
      }
      if (order.status === "FULFILLED" || order.status === "REFUNDED") {
        throw new Error("CANNOT_CANCEL");
      }

      // Hoàn kho theo snapshot line items
      const items = Array.isArray(order.items) ? order.items : [];
      for (const li of items as any[]) {
        const productId = Number(li?.productId);
        const qty = Number(li?.qty);
        if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty <= 0) continue;

        // +qty về kho
        await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: qty } },
        });

        // Ghi ledger (delta dương vì hoàn kho)
        await tx.stockLedger.create({
          data: { productId, delta: qty, reason: "CANCEL", refId: id },
        });
      }

      // Cập nhật trạng thái đơn
      const updated = await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        select: { id: true, status: true, updatedAt: true },
      });

      return { already: false, order: updated };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }
    if (msg === "CANNOT_CANCEL") {
      return NextResponse.json({ error: "CANNOT_CANCEL" }, { status: 409 });
    }
    console.error("cancel order error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
