// src/app/verify/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // Lấy param từ URL (client)
  const token = (sp?.get("token") || "").trim();
  const email = (sp?.get("email") || "").trim().toLowerCase();




  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState("⏳ Đang xác thực...");
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const ran = useRef(false);
  const redirectId = useRef<number | null>(null);

  // Đánh dấu đã hydrate để tránh mismatch SSR
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Đếm ngược (sau khi hydrate)
  useEffect(() => {
    if (!hydrated) return;
    const t = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1) {
          clearInterval(t);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [hydrated]);

  // Gọi API verify (email OPTIONAL) – chạy 1 lần sau khi hydrate
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setMessage("❌ Thiếu token.");
      setCanResend(true);
      return;
    }
    if (ran.current) return; // chặn Strict Mode
    ran.current = true;

    const ac = new AbortController();

    (async () => {
      try {
        const payload: Record<string, any> = { token };
        if (email) payload.email = email;

        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal: ac.signal,
        });

        let data: any = null;
        try { data = await res.json(); } catch { }

        if (res.ok && data?.ok) {
          setMessage("✅ Xác thực thành công! Đang chuyển hướng…");
          redirectId.current = window.setTimeout(() => router.push("/signin?verified=1"), 1200);
          return; // đừng rơi xuống nhánh lỗi
        }

        const err = data?.error ?? String(res.status);
        if (err === "TOKEN_EXPIRED") {
          setMessage("⛔ Mã xác thực đã hết hạn."); setCanResend(true);
        } else if (err === "INVALID_TOKEN" || err === "TOKEN_NOT_FOUND") {
          setMessage("⛔ Mã xác thực không hợp lệ hoặc đã được dùng."); setCanResend(true);
        } else if (err === "EMAIL_MISMATCH") {
          setMessage("⛔ Email trong liên kết không khớp.");
        } else {
          setMessage(`❌ Xác thực thất bại: ${err}`); setCanResend(true);
        }
      } catch {
        if (!ac.signal.aborted) setMessage("❌ Lỗi hệ thống. Vui lòng thử lại sau.");
      }
    })();

    return () => {
      ac.abort();
      if (redirectId.current) clearTimeout(redirectId.current);
    };
  }, [hydrated, token, email, router]);

  const handleResend = async () => {
    setResending(true);
    setMessage("⏳ Đang gửi lại mã xác thực…");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage("✅ Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.");
        setCountdown(300);
        setCanResend(false);
      } else {
        setMessage(`❌ Không thể gửi lại: ${data.error ?? res.status}`);
      }
    } catch {
      setMessage("❌ Lỗi mạng. Thử lại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md text-center space-y-4">
        <h1 className="text-xl font-bold">Xác thực Email</h1>
        <p className="text-gray-700">{message}</p>

        {hydrated && !canResend && countdown > 0 && (
          <p className="text-sm text-gray-500">
            ⏱️ Mã hiện tại sẽ hết hạn sau: <strong>{countdown}s</strong>
          </p>
        )}

        {hydrated && canResend && (
          <div className="space-y-2">
            <p className="text-red-500 text-sm">Bạn có thể yêu cầu gửi lại mã.</p>
            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {resending ? "Đang gửi lại…" : (email ? "Gửi lại email xác thực" : "Nhập link có email để gửi lại")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
