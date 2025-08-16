import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return NextResponse.json({ ok:false, error:"UNAUTHENTICATED" }, { status:401 });
  const me = await prisma.user.findUnique({ where: { email }, select: { role:true }});
  if (me?.role !== "ADMIN") return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status:403 });

  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get("limit") || "50")));
  const items = await prisma.purgeLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json({ ok:true, items });
}
