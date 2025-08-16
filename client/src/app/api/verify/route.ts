// app/api/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/token";

type Ok =
  | { ok: true; source: "pending"; created?: true; already?: true }
  | { ok: true; source: "legacy"; already?: true }
  | { ok: true; source: "fallback"; already: true };

type Err =
  | { error: "MISSING_TOKEN" | "INVALID_TOKEN" | "TOKEN_EXPIRED" | "EMAIL_MISMATCH" | "USER_NOT_FOUND" | "DB_LOCKED" | "SERVER_ERROR" };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const token: string | undefined = body?.token ? String(body.token) : undefined;
    const emailRaw: string | undefined = body?.email ? String(body.email) : undefined;
    const email = emailRaw?.trim().toLowerCase();

    if (!token) return NextResponse.json<Err>({ error: "MISSING_TOKEN" }, { status: 400 });

    const tokenHash = hashToken(token); // ✅ dùng hash

    // ===== 1) PENDING USER FLOW =====
    const pu = await prisma.pendingUser.findUnique({ where: { token: tokenHash } });
    if (pu) {
      if (pu.expires < new Date()) {
        await prisma.pendingUser.delete({ where: { id: pu.id } }).catch(() => {});
        return NextResponse.json<Err>({ error: "TOKEN_EXPIRED" }, { status: 400 });
      }

      const pendingEmail = pu.email.toLowerCase();
      if (email && email !== pendingEmail) {
        return NextResponse.json<Err>({ error: "EMAIL_MISMATCH" }, { status: 400 });
      }

      // tìm user theo email (case-insensitive cho SQLite)
      let existed = await prisma.user.findUnique({ where: { email: pendingEmail } });
      if (!existed) {
        const rows = await prisma.$queryRaw<{ id: string; emailVerified: Date | null }[]>
          `SELECT id, emailVerified FROM "User" WHERE lower("email") = ${pendingEmail} LIMIT 1`;
        existed = rows?.[0] as any;
      }

      if (existed) {
        if (existed.emailVerified) {
          await prisma.pendingUser.delete({ where: { id: pu.id } }).catch(() => {});
          return NextResponse.json<Ok>({ ok: true, source: "pending", already: true });
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: existed.id },
            data: { email: pendingEmail, password: pu.password, role: "USER", emailVerified: new Date() },
          }),
          prisma.pendingUser.delete({ where: { id: pu.id } }),
        ]);
        return NextResponse.json<Ok>({ ok: true, source: "pending" });
      }

      await prisma.$transaction([
        prisma.user.create({
          data: { email: pendingEmail, password: pu.password, role: "USER", emailVerified: new Date() },
        }),
        prisma.pendingUser.delete({ where: { id: pu.id } }),
      ]);
      return NextResponse.json<Ok>({ ok: true, source: "pending", created: true });
    }

    // ===== 2) LEGACY VERIFICATION TOKEN (userId) =====
    const vt = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    // 🔁 Fallback idempotent
    if (!vt) {
      if (email) {
        const u = await prisma.user.findUnique({ where: { email } }).catch(() => null);
        if (u?.emailVerified) {
          return NextResponse.json<Ok>({ ok: true, source: "fallback", already: true });
        }
      }
      return NextResponse.json<Err>({ error: "INVALID_TOKEN" }, { status: 400 });
    }

    if (vt.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { id: vt.id } }).catch(() => {});
      return NextResponse.json<Err>({ error: "TOKEN_EXPIRED" }, { status: 400 });
    }

    const user = vt.user;
    if (!user) {
      await prisma.verificationToken.delete({ where: { id: vt.id } }).catch(() => {});
      return NextResponse.json<Err>({ error: "USER_NOT_FOUND" }, { status: 400 });
    }

    const userEmail = user.email.toLowerCase();
    if (email && email !== userEmail) {
      return NextResponse.json<Err>({ error: "EMAIL_MISMATCH" }, { status: 400 });
    }

    if (user.emailVerified) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id } }).catch(() => {});
      return NextResponse.json<Ok>({ ok: true, source: "legacy", already: true });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
      prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json<Ok>({ ok: true, source: "legacy" });
  } catch (err: any) {
    console.error("[verify] error:", err);
    if (err?.message?.includes("database is locked") || err?.code === "SQLITE_BUSY") {
      return NextResponse.json<Err>({ error: "DB_LOCKED" }, { status: 503 });
    }
    return NextResponse.json<Err>({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
