import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET || "dev-secret";
  const header = req.headers.get("x-cron-secret");
  if (header !== secret) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const now = new Date();
  const [delPending, delVt] = await Promise.all([
    prisma.pendingUser.deleteMany({ where: { expires: { lt: now } } }),
    prisma.verificationToken.deleteMany({ where: { expires: { lt: now } } }),
  ]);

  return NextResponse.json({ ok: true, deleted: { pending: delPending.count, tokens: delVt.count } });
}
