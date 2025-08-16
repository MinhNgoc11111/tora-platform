// src/lib/mailer.ts
import nodemailer from "nodemailer";

/* ==========================
   Helpers & types
========================== */
type MailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

function ensureArray<T>(v: T | T[]) {
  return Array.isArray(v) ? v : [v];
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    "no-reply@example.com"
  );
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

/* ==========================
   Generic sender: Resend -> SMTP -> console
========================== */
export async function sendMail({
  to,
  subject,
  html,
  text,
  from,
}: MailInput): Promise<{ via: "resend" | "smtp" | "console" }> {
  const fromAddr = from || getFromAddress();
  const htmlBody = html ?? "";
  const textBody = text ?? stripHtml(htmlBody);

  // 1) Resend (nếu có API key)
  if (process.env.RESEND_API_KEY) {
    const { Resend } = (await import("resend")) as typeof import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const r = await resend.emails.send({
      from: fromAddr,
      to: ensureArray(to), // ✅ luôn là mảng theo SDK
      subject,
      html: htmlBody,
      text: textBody,
    });

    if ((r as any)?.error) {
      throw new Error(String((r as any).error));
    }
    return { via: "resend" };
  }

  // 2) SMTP (nếu đủ biến môi trường)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // 465 => TLS
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    if (process.env.NODE_ENV !== "production") {
      try {
        await transporter.verify();
        console.log("[mailer] SMTP verify OK");
      } catch (e) {
        console.warn("[mailer] SMTP verify failed (still trying to send):", e);
      }
    }

    await transporter.sendMail({
      from: fromAddr,
      to, // nodemailer chấp nhận string hoặc string[]
      subject,
      html: htmlBody,
      text: textBody,
    });
    return { via: "smtp" };
  }

  // 3) Fallback: log ra console (dev)
  console.log("[sendMail:console-fallback]", {
    from: fromAddr,
    to,
    subject,
    text: textBody,
    html: htmlBody,
  });
  return { via: "console" };
}

/* ==========================
   Verification email helpers
========================== */
export function buildVerifyUrl(email: string, token: string) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/verify?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const verifyUrl = buildVerifyUrl(email, token);

  if (process.env.NODE_ENV !== "production") {
    const maskedToken =
      token.length > 10 ? token.slice(0, 6) + "…" + token.slice(-4) : token;
    console.log("[mailer] baseUrl:", baseUrl);
    console.log("[mailer] verifyUrl:", verifyUrl);
    console.log("[mailer] token(masked):", maskedToken);
    console.log("[mailer] FROM:", getFromAddress());
    console.log("[mailer] providers:", {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "unset",
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER || process.env.SMTP_EMAIL,
      SMTP_PASS:
        process.env.SMTP_PASS || process.env.SMTP_PASSWORD ? "SET" : "unset",
    });
  }

  const html = `
    <div style="font-family:sans-serif;line-height:1.6">
      <h2>Xác thực email Tora Platform</h2>
      <p>Nhấn nút bên dưới để xác thực tài khoản của bạn:</p>
      <p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:8px;text-decoration:none">
          Xác thực tài khoản
        </a>
      </p>
      <p>Nếu nút không hoạt động, hãy copy liên kết này và dán vào trình duyệt:</p>
      <code>${verifyUrl}</code>
    </div>
  `;
  const text = `Xác thực email Tora Platform: ${verifyUrl}`;

  const res = await sendMail({
    to: email,
    subject: "✅ Xác thực email Tora Platform",
    html,
    text,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[mailer] sent via: ${res.via} -> ${email}`);
  }

  return res;
}
// ... phần trên giữ nguyên
export type BuiltEmail = { subject: string; html: string; text?: string };

export async function sendTemplatedEmail(input: {
  to: string | string[];
  template: BuiltEmail;
  from?: string;
}) {
  const { to, template, from } = input;
  return sendMail({
    to: Array.isArray(to) ? to.join(",") : to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    from,
  });
}
