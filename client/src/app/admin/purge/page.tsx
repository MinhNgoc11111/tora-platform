"use client";

import { useEffect, useState } from "react";

type PurgeLog = {
  id: string;
  adminEmail: string;
  targetEmail: string;
  deletedType: string;
  createdAt: string;
};

export default function AdminPurgePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [logs, setLogs] = useState<PurgeLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/purge-log");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setLogs(data.items || []);
      else setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!email.trim()) { setErr("Vui lòng nhập email."); return; }
    if (!confirm(`Bạn chắc chắn muốn xoá dữ liệu cho email: ${email}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/purge-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMsg(
          data.deleted === "pending"
            ? "✅ Đã xoá PendingUser (email chờ xác thực)."
            : "✅ Đã xoá User + token + đơn hàng liên quan."
        );
        setEmail("");
        await loadLogs(); // 🔄 refresh danh sách log
      } else {
        setErr(data.error || `Lỗi: ${res.status}`);
      }
    } catch {
      setErr("Lỗi mạng/server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <form onSubmit={handlePurge} className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h1 className="text-xl font-semibold text-center">Xoá email đã lưu</h1>
          {msg && <div className="text-green-600 text-sm text-center">{msg}</div>}
          {err && <div className="text-red-600 text-sm text-center">{err}</div>}

          <div className="flex gap-3">
            <input
              type="email"
              className="flex-1 border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang xoá..." : "Xoá ngay"}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Trang này yêu cầu tài khoản ADMIN.
          </p>
        </form>

        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Lịch sử xoá gần đây</h2>
            <button
              onClick={loadLogs}
              className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
              disabled={loadingLogs}
            >
              {loadingLogs ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có bản ghi.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">Thời gian</th>
                    <th className="px-3 py-2">Email đã xoá</th>
                    <th className="px-3 py-2">Loại</th>
                    <th className="px-3 py-2">Bởi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{r.targetEmail}</td>
                      <td className="px-3 py-2">{r.deletedType}</td>
                      <td className="px-3 py-2">{r.adminEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Hiển thị tối đa 50 bản ghi gần nhất.</p>
        </div>
      </div>
    </div>
  );
}
