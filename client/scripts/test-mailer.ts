require("dotenv").config({ path: __dirname + "/../.env.local" });

console.log("SMTP_EMAIL:", process.env.SMTP_EMAIL);
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);
const nodemailer = require("nodemailer");

async function main() {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const testEmail = "toraplatform@gmail.com"; // ⚠️ Gmail bạn muốn nhận email test

  const info = await transporter.sendMail({
    from: `"Tora Platform Test" <${process.env.SMTP_EMAIL}>`,
    to: testEmail,
    subject: "🔒 Test gửi email xác thực thành công!",
    html: `<p>Đây là email test gửi từ hệ thống Tora Platform.</p>`,
  });

  console.log("✅ Email đã gửi:", info.messageId);
}

main().catch(console.error);
