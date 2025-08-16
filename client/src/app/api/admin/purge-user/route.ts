import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const admin = session?.user?.email?.toLowerCase();
    if (!admin) return NextResponse.json({ ok:false, error:"UNAUTHENTICATED" }, { status:401 });
    const me = await prisma.user.findUnique({ where: { email: admin }, select: { role: true }});
    if (me?.role !== "ADMIN") return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status:403 });

    const { email: raw } = await req.json().catch(() => ({}));
    const email = String(raw || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ ok:false, error:"MISSING_EMAIL" }, { status:400 });

    // Nếu có PendingUser (flow mới) → xóa pending
    // @ts-ignore (nếu dự án chưa có model)
    const pending = await prisma.pendingUser?.findUnique?.({ where: { email } }).catch(() => null);
    if (pending) {
      // @ts-ignore
      await prisma.pendingUser.delete({ where: { email } });
      await prisma.purgeLog.create({ data: { adminEmail: admin, targetEmail: email, deletedType: "pending" }});
      return NextResponse.json({ ok:true, deleted:"pending" });
    }

    // Flow lưu trong User (cũ)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok:false, error:"NOT_FOUND" }, { status:404 });

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.order.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
    await prisma.purgeLog.create({ data: { adminEmail: admin, targetEmail: email, deletedType: "user" }});

    return NextResponse.json({ ok:true, deleted:"user" });
  } catch (e) {
    console.error("[purge-user] error:", e);
    return NextResponse.json({ ok:false, error:"SERVER_ERROR" }, { status:500 });
  }
}
