import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  try {
    const id = params?.id?.trim();
    if (!id) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });

    // AuthN/AuthZ (+ dev override)
    const devOverride = process.env.NODE_ENV !== "production" && req.headers.get("x-admin-override") === "1";
    if (!devOverride) {
      const session = await getServerSession(authOptions);
      const role = (session?.user as any)?.role;
      if (!role) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
      if (!["ADMIN", "SELLER", "STAFF"].includes(role))
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const o = await tx.order.findUnique({ where: { id }, select: { id: true, status: true } });
      if (!o) throw new Error("NOT_FOUND");
      if (o.status === OrderStatus.CANCELLED || o.status === OrderStatus.REFUNDED) throw new Error("CANNOT_PAY");
      if (o.status === OrderStatus.FULFILLED) throw new Error("ALREADY_FULFILLED");
      if (o.status === OrderStatus.PAID) return { already: true, order: o };

      const n = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.PAID },
        select: { id: true, status: true, updatedAt: true },
      });
      return { already: false, order: n };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (e: any) {
    const m = String(e?.message || "");
    if (m === "NOT_FOUND")         return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    if (m === "CANNOT_PAY")        return NextResponse.json({ error: "CANNOT_PAY" }, { status: 409 });
    if (m === "ALREADY_FULFILLED") return NextResponse.json({ error: "ALREADY_FULFILLED" }, { status: 409 });
    console.error("MARK_PAID_ERROR", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
