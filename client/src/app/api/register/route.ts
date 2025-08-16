import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mailer";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  console.log("📥 Đã nhận request đăng ký với email:", email);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log("❌ Email đã tồn tại:", email);
    return NextResponse.json({ error: "Email đã tồn tại." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  console.log("✅ Đã tạo user thành công:", newUser);

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      userId: newUser.id,
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    },
  });

  console.log("🔑 Đã tạo verification token:", token);

  console.log("📧 Đang gửi mail xác thực tới:", email);
  await sendVerificationEmail(email, token);

  console.log("✅ Đã gửi mail xác thực tới:", email);

  return NextResponse.json({ message: "Vui lòng kiểm tra email để xác thực." });
}
