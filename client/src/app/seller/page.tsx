"use client";

import useSWR from "swr";
import Link from "next/link";
const fetcher = (u: string) => fetch(u, { cache: "no-store" }).then(r => r.json());

function useProductCounters() {
  const all = useSWR("/api/products/seller", fetcher);
  const active = useSWR("/api/products/seller?active=1", fetcher);
  const hidden = useSWR("/api/products/seller?active=0", fetcher);
  return {
    total: all.data?.total ?? 0,
    active: active.data?.total ?? 0,
    hidden: hidden.data?.total ?? 0,
    loading: all.isLoading || active.isLoading || hidden.isLoading,
  };
}

export default function SellerDashboard() {
  const { total, active, hidden, loading } = useProductCounters();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Tổng sản phẩm" value={loading ? "…" : total.toLocaleString("vi-VN")} href="/seller/products" />
        <Card title="Đang bán" value={loading ? "…" : active.toLocaleString("vi-VN")} href="/seller/products?tab=active" />
        <Card title="Đang ẩn" value={loading ? "…" : hidden.toLocaleString("vi-VN")} href="/seller/products?tab=hidden" />
      </div>

      <div className="bg-white border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Tác vụ nhanh</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="px-4 py-2 rounded-lg bg-indigo-600 text-white" href="/seller/add">➕ Thêm sản phẩm</Link>
          <Link className="px-4 py-2 rounded-lg bg-gray-900 text-white" href="/seller/products">Quản lý sản phẩm</Link>
          <Link className="px-4 py-2 rounded-lg bg-gray-200" href="/seller/orders">Xem đơn hàng</Link>
          <Link className="px-4 py-2 rounded-lg bg-gray-200" href="/seller/settings">Cài đặt cửa hàng</Link>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, href }: { title: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="bg-white border rounded-2xl p-4 hover:shadow-sm transition">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </Link>
  );
}
