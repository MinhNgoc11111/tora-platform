// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mailer";
import { randomBytes } from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 phút

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const captchaToken = String(body.captchaToken || "");

  try {
    if (!email || !password || !captchaToken) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // ✅ reCAPTCHA (prod có SECRET thì mới chặn)
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (secret) {
      const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secret}&response=${captchaToken}`,
      });
      const d = await r.json();
      if (!d?.success) return NextResponse.json({ error: "Captcha thất bại" }, { status: 400 });
    }

    // ❌ Nếu đã có User đã xác thực → chặn
    const existUser = await prisma.user.findUnique({ where: { email } });
    if (existUser?.emailVerified) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
    }

    // Nếu có User CHƯA xác thực (tồn dư từ flow cũ) → xóa để chuyển sang flow Pending
    if (existUser && !existUser.emailVerified) {
      await prisma.$transaction([
        prisma.verificationToken.deleteMany({ where: { userId: existUser.id } }),
        prisma.order.deleteMany({ where: { userId: existUser.id } }),
        prisma.user.delete({ where: { id: existUser.id } }),
      ]);
    }

    const hashed = await bcrypt.hash(password, 10);
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_TTL_MS);

    // Nếu đã có PendingUser → cập nhật & resend
    const pending = await prisma.pendingUser.findUnique({ where: { email } });
    if (pending) {
      const newToken = randomBytes(32).toString("hex");
      await prisma.pendingUser.update({
        where: { email },
        data: { token: newToken, expires, password: hashed },
      });
      await sendVerificationEmail(email, newToken); // nhớ embed email trong URL
      return NextResponse.json({ ok: true, resent: true, message: "Đã gửi lại email xác thực" }, { status: 200 });
    }

    // Tạo PendingUser mới
    await prisma.pendingUser.create({ data: { email, password: hashed, token, expires } });
    await sendVerificationEmail(email, token);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      // Email đã có trong PendingUser
      return NextResponse.json({ error: "EMAIL_IN_USE_PENDING" }, { status: 409 });
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
