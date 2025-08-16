"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

// Helper: luôn tạo 1 URLSearchParams mới từ URL hiện tại (client-only)
const getParams = () =>
  new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

export default function ProductsPage() {
  const router = useRouter();

  // ĐỌC query từ URL hiện tại
  const read = getParams();
  const page = Math.max(1, parseInt(read.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(read.get("pageSize") ?? "24", 10));
  const q = (read.get("q") ?? "").trim();
  const order = read.get("order") ?? "newest"; // newest|price_asc|price_desc

  const api = `/api/products?page=${page}&pageSize=${pageSize}&order=${order}${
    q ? `&q=${encodeURIComponent(q)}` : ""
  }`;

  const { data, error, isLoading } = useSWR(api, fetcher, {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  const items: Product[] = data?.items ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-4 flex items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.q as HTMLInputElement;

            const sp = getParams(); // clone từ URL hiện tại
            const val = input.value.trim();
            if (val) sp.set("q", val);
            else sp.delete("q");
            sp.set("page", "1"); // reset phân trang khi tìm
            router.push(`?${sp.toString()}`);
          }}
          className="flex gap-2"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm sản phẩm…"
            className="px-3 py-2 border rounded-md w-64"
          />
          <select
            defaultValue={order}
            onChange={(e) => {
              const sp = getParams();
              sp.set("order", e.target.value);
              sp.set("page", "1");
              router.push(`?${sp.toString()}`);
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
          <button className="px-3 py-2 border rounded-md">Tìm</button>
        </form>
      </div>

      {isLoading ? (
        <div>Đang tải…</div>
      ) : error ? (
        <div className="text-red-600">Lỗi tải dữ liệu.</div>
      ) : items.length === 0 ? (
        <div>Không có sản phẩm.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => {
              const sp = getParams();
              sp.set("page", String(page - 1));
              router.push(`?${sp.toString()}`);
            }}
            className="px-3 py-2 border rounded-md disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => {
              const sp = getParams();
              sp.set("page", String(page + 1));
              router.push(`?${sp.toString()}`);
            }}
            className="px-3 py-2 border rounded-md disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
