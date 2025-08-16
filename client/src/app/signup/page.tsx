"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // ⏱️ đếm ngược resend 5 phút
  const [resendCountdown, setResendCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();

  // Khởi tạo/RESET bộ đếm khi showSuccess bật
  useEffect(() => {
    if (!showSuccess) return;
    setResendCountdown(300);
    setCanResend(false);

    const t = setInterval(() => {
      setResendCountdown((s) => {
        if (s <= 1) {
          clearInterval(t);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [showSuccess]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // ❌ bỏ bắt buộc tick đồng ý — vì đã chuyển sang note “Bằng việc đăng ký…”
    if (!captchaToken) return setError("❌ Vui lòng xác thực reCAPTCHA.");
    if (password !== confirm) return setError("❌ Mật khẩu không khớp.");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{8,}$/;
    if (!passwordRegex.test(password)) {
      return setError(
        "❌ Mật khẩu phải có chữ hoa, thường, số và ký tự đặc biệt, ít nhất 8 ký tự."
      );
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          captchaToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.resent) {
          setError("");
          setMessage("✅ Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.");
          setShowSuccess(true);
          return;
        }
        setError("");
        setMessage("✅ Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        setShowSuccess(true);
        return;
      }

      if (res.status === 409) {
        setShowSuccess(false);
        setError("Email đã tồn tại. Vui lòng đăng nhập.");
        return;
      }

      setError(data.error || `Đăng ký thất bại (mã ${res.status}).`);
    } catch {
      setError("Lỗi mạng hoặc server. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại email xác thực qua endpoint riêng
  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setMessage("✅ Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.");
        setResendCountdown(300);
        setCanResend(false);
        setShowSuccess(true);
      } else {
        setError(data.error || "Không thể gửi lại email xác thực.");
      }
    } catch {
      setError("Lỗi mạng. Thử lại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-center flex items-center justify-center gap-2">
          <PencilSquareIcon className="w-5 h-5" />
          Đăng ký
        </h1>

        {showSuccess ? (
          <div className="text-green-600 text-sm text-center">{message}</div>
        ) : error ? (
          <div className="text-red-600 text-sm text-center">{error}</div>
        ) : null}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded pr-10"
            required
          />
          <button
            type="button"
            className="absolute top-2 right-3 cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {/* 🔽 Dòng ghi chú điều khoản + chính sách (thay cho checkbox) */}
        <div className="text-xs text-gray-600 text-center leading-5">
          Bằng việc đăng ký, bạn đã đồng ý với Tora về{" "}
          <Link
            href="/terms"
            className="font-semibold text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded-sm"
          >
            Điều khoản sử dụng
          </Link>
          {" "} &{" "}
          <Link
            href="/privacy"
            className="font-semibold text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded-sm"
          >
            Chính sách bảo mật
          </Link>.
        </div>

        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={(token) => setCaptchaToken(token)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={loading || showSuccess}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        {/* Khối resend chỉ hiện sau khi đã gửi email xác thực */}
        {showSuccess && (
          <div className="text-center space-y-2">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-60"
              >
                {resending ? "Đang gửi lại..." : "Gửi lại email xác thực"}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Bạn có thể gửi lại sau: <b>{resendCountdown}s</b>
              </p>
            )}
          </div>
        )}

        <p className="text-center text-xs">
          Đã có tài khoản?{" "}
          <Link href="/signin" className="text-blue-500 underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
