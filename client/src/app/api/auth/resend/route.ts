// app/api/auth/resend/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

/** ===== Cấu hình ===== */
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 phút
const RESEND_WINDOW_MS = Number(process.env.RESEND_WINDOW_MS ?? 60_000); // mỗi 60s/email/IP
const RESEND_DAILY_CAP = Number(process.env.RESEND_DAILY_CAP ?? 5);     // tối đa 5 lần/ngày/email/IP
const PRIVACY_MODE = process.env.RESEND_PRIVACY_MODE !== "false";       // true = không tiết lộ email tồn tại hay không

/** ===== Tiện ích ===== */
function hashToken(t: string) {
  return createHash("sha256").update(t).digest("hex");
}
function newToken() {
  return randomBytes(32).toString("hex"); // 64 hex
}
function getClientIp(req: Request) {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/** In-memory rate limit (đủ dùng dev/self-host; prod có thể dùng Redis) */
type Bucket = { hits: number[]; dayCount: number; dayResetAt: number };
const store = new Map<string, Bucket>();
function rateLimit(key: string, windowMs = RESEND_WINDOW_MS, dailyCap = RESEND_DAILY_CAP) {
  const now = Date.now();
  const b = store.get(key) ?? { hits: [], dayCount: 0, dayResetAt: now + 86_400_000 };
  if (now >= b.dayResetAt) { b.dayCount = 0; b.dayResetAt = now + 86_400_000; b.hits = []; }
  b.hits = b.hits.filter(ts => now - ts < windowMs);
  if (b.hits.length >= 1) return { ok: false, retryAfter: windowMs - (now - b.hits[0]) };
  if (b.dayCount >= dailyCap) return { ok: false, retryAfter: b.dayResetAt - now };
  b.hits.push(now); b.dayCount += 1; store.set(key, b);
  return { ok: true as const };
}

/** ===== Route ===== */
export async function POST(req: Request) {
  const { email: raw } = await req.json().catch(() => ({}));
  const email = String(raw || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "MISSING_EMAIL" }, { status: 400 });

  // 🔐 Rate-limit theo IP + email
  const ip = getClientIp(req);
  const rl = rateLimit(`${ip}:${email}`);
  if (!rl.ok) {
    return NextResponse.json({ error: "TOO_MANY_REQUESTS", retryAfterMs: rl.retryAfter }, { status: 429 });
  }

  try {
    // Tạo token plaintext để gửi mail + hash để lưu DB
    const token = newToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    // Flow mới: PendingUser
    const pending = await prisma.pendingUser.findFirst({ where: { email } }).catch(() => null);
    if (pending) {
      await prisma.pendingUser.update({
        where: { id: pending.id },
        data: { token: tokenHash, expires: expiresAt }, // ✅ lưu HASH
      });
      try {
        await sendVerificationEmail(email, token); // ✅ gửi PLAIN token qua email
      } catch (e) {
        console.error("[resend] mailer error:", e);
        return NextResponse.json({ error: "MAILER_ERROR" }, { status: 502 });
      }
      return NextResponse.json({ ok: true, resent: true });
    }

    // Flow cũ: đã có User nhưng chưa verify
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerified) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
      await prisma.verificationToken.create({
        data: { userId: user.id, token: tokenHash, expires: expiresAt }, // ✅ lưu HASH
      });
      try {
        await sendVerificationEmail(email, token);
      } catch (e) {
        console.error("[resend] mailer error:", e);
        return NextResponse.json({ error: "MAILER_ERROR" }, { status: 502 });
      }
      return NextResponse.json({ ok: true, resent: true, legacy: true });
    }

    // Privacy mode: không tiết lộ email tồn tại/đã verify hay chưa
    if (PRIVACY_MODE) {
      // tuỳ chọn: delay nhẹ để chống đoán (giữ timing tương tự)
      await new Promise(r => setTimeout(r, 250));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "EMAIL_NOT_FOUND_OR_ALREADY_VERIFIED" }, { status: 404 });
  } catch (e) {
    console.error("[resend] error:", e);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
