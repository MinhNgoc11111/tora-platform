import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bumpProductsCacheVersion } from "@/lib/redis";

// Hợp lệ như enum StockReason trong Prisma
const ALLOWED_REASONS = new Set([
  "ORDER", "CANCEL", "MANUAL_IN", "MANUAL_OUT", "RETURN", "ADJUST",
]);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "INVALID_PRODUCT_ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const delta = Number(body?.delta);
    const reason = String(body?.reason || "");
    const refId = body?.refId ? String(body.refId) : undefined;
    const note = body?.note ? String(body.note) : undefined;

    if (!Number.isInteger(delta) || delta === 0) {
      return NextResponse.json({ error: "INVALID_DELTA" }, { status: 400 });
    }
    if (!ALLOWED_REASONS.has(reason)) {
      return NextResponse.json({ error: "INVALID_REASON" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.product.findUnique({
        where: { id },
        select: { id: true, stock: true, isActive: true },
      });
      if (!before) throw new Error("NOT_FOUND");

      const updated = await tx.product.update({
        where: { id },
        data: {
          stock: { increment: delta },   // tăng/giảm tồn kho
          updatedAt: new Date(),
        },
        select: { id: true, name: true, stock: true, isActive: true, updatedAt: true },
      });

      await tx.stockLedger.create({
        data: {
          productId: id,
          delta,
          reason: reason as any,
          refId,
          note,
        },
      });

      return { before, updated };
    });

    // ✅ bump cache version sau khi DB đã commit
    try {
      await bumpProductsCacheVersion();
    } catch (e) {
      console.warn("bumpProductsCacheVersion failed (ignored):", e);
    }


    return NextResponse.json(
      { ok: true, product: result.updated, previousStock: result.before.stock, delta },
      { status: 200 }
    );
  } catch (err: any) {
    if (err?.message === "NOT_FOUND") {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }
    console.error("adjust-stock error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
