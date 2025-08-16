"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams: URLSearchParams = useSearchParams() as unknown as URLSearchParams;


  // Hiển thị banner verified & tự xóa ?verified=1 sau 2s
  useEffect(() => {
    const verified = searchParams.get("verified") === "1";
    if (!verified) return;

    setSuccessMsg("✅ Xác thực email thành công! Hãy đăng nhập.");
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("verified");
      const qs = params.toString();
      router.replace(`/signin${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 2000);

    return () => clearTimeout(t);
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password: password.trim(),
      callbackUrl: "/",
      remember,
    });

    console.log("🔐 Kết quả signIn:", res);

    if (res?.ok && res.url) {
      router.push(res.url);
    } else {
      setErrorMsg("❌ Đăng nhập thất bại: Sai tài khoản hoặc mật khẩu.");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-center">🔐 Đăng nhập</h1>

        {successMsg && (
          <div className="text-green-600 text-sm text-center">{successMsg}</div>
        )}
        {errorMsg && (
          <div className="text-red-600 text-sm text-center">{errorMsg}</div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
          className="w-full border px-3 py-2 rounded disabled:opacity-50"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          required
          disabled={loading}
          className="w-full border px-3 py-2 rounded disabled:opacity-50"
        />

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
            />
            <span>🧠 Ghi nhớ đăng nhập</span>
          </label>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded transition ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "⏳ Đang đăng nhập..." : "👉 Đăng nhập"}
        </button>

        <div className="flex items-center justify-center gap-2">
          <div className="border-t w-full" />
          <span className="text-sm text-gray-500">hoặc</span>
          <div className="border-t w-full" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100 flex justify-center items-center gap-2"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Đăng nhập bằng Google</span>
        </button>

        <p className="text-sm text-center">
          Bạn chưa có tài khoản?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
}
