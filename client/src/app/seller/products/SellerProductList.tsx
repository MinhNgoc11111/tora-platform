// src/app/seller/products/page.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

//Thêm component Skeleton
function SkeletonGrid({ count = 12 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-gray-100 rounded w-16" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type ProductListItem = {
  id: number | string;
  slug?: string | null;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  image?: string | null;
  category?: string | null;
  categoryId?: number | null;
  stock?: number | null;
  isActive?: boolean | null;
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

/* --------- Fallback ảnh SVG (không gọi mạng) --------- */
const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
       <defs>
         <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
           <stop offset='0%' stop-color='#f3f4f6'/>
           <stop offset='100%' stop-color='#e5e7eb'/>
         </linearGradient>
       </defs>
       <rect width='100%' height='100%' fill='url(#g)'/>
       <text x='50%' y='50%'
             dominant-baseline='middle'
             text-anchor='middle'
             font-family='Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
             font-size='64'
             font-weight='700'
             fill='#111827'
             letter-spacing='2'>Tora</text>
     </svg>`
  );

const BAD_HOSTS = new Set([
  "via.placeholder.com",
  "placehold.it",
  "placeholder.com",
]);

function toSafeSrc(raw?: string | null) {
  if (!raw) return PLACEHOLDER_SVG;
  if (raw.startsWith("data:") || raw.startsWith("/")) return raw;
  try {
    const href = new URL(raw);
    if (BAD_HOSTS.has(href.hostname)) return PLACEHOLDER_SVG;
    if (!/^https?:$/.test(href.protocol)) return PLACEHOLDER_SVG;
    return href.href;
  } catch {
    return PLACEHOLDER_SVG;
  }
}

/* ---------------------------- UI chính ---------------------------- */

const ORDER_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá ↑" },
  { value: "price_desc", label: "Giá ↓" },
  { value: "name_asc", label: "Tên A→Z" },
];

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "inStock", label: "Còn hàng" },
  { key: "lowStock", label: "Sắp hết" },
  { key: "outOfStock", label: "Hết hàng" },
  { key: "inactive", label: "Ẩn" },
] as const;


const DEBOUNCE_MS = 400;

export default function SellerProductList() {
  const router = useRouter();
  const params = useSearchParams();

  const tab = (params?.get("tab") ?? "all") as (typeof TABS)[number]["key"];
  const order = params?.get("order") ?? "newest";
  const qParam = params?.get("q") ?? "";
  const refresh = params?.get("refresh") ?? "0";
  const page = Math.max(1, Number(params?.get("page") ?? 1));
  const pageSize = [12, 24, 48].includes(Number(params?.get("pageSize")))
    ? Number(params?.get("pageSize"))
    : 24;

  // search input + debounce
  const [qInput, setQInput] = useState(qParam);
  useEffect(() => setQInput(qParam), [qParam]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== qParam) go({ q: qInput, page: "1", refresh: "0" });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  // tránh mismatch SSR/CSR khi format số
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const nf = useMemo(() => new Intl.NumberFormat("vi-VN"), []);
  const fmtPrice = (v: number | string | undefined) => nf.format(Number(v ?? 0));

  // Build URL API theo tab hiện tại + phân trang
  const apiUrl = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("perPage", String(pageSize));      // ✅ API dùng perPage
    if (qParam.trim()) p.set("q", qParam.trim());
    p.set("statusTab", tab);                 // ✅ khớp keys của TABS mới
    return `/api/seller/products/search?${p.toString()}`;
  }, [qParam, tab, page, pageSize]);

  //Prefetch route trang kế tiếp
  useEffect(() => {
    const p = new URLSearchParams(params?.toString() ?? "");
    const next = page + 1;
    p.set("page", String(next));
    p.set("refresh", "0");
    router.prefetch(`/seller/products?${p.toString()}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, qParam, order, tab, pageSize]);


  const { data, mutate, isLoading, error } = useSWR(
    [apiUrl, refresh],
    ([url]) => fetcher(url),
    { dedupingInterval: 0, revalidateOnFocus: false, revalidateIfStale: true }
  );

  const counts = data?.counts ?? { all: 0, inStock: 0, lowStock: 0, outOfStock: 0, inactive: 0 };
  const LOW = (data as any)?.meta?.lowStockThreshold ?? 5;

  const productsAll: ProductListItem[] = Array.isArray(data) ? data : data?.items ?? [];
  const products = productsAll;

  const total: number = (data as any)?.page?.total ??
    (typeof (data as any)?.total === "number" ? (data as any).total : productsAll.length);
  const totalPages = (data as any)?.page?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));


  /* --------------------------- Bulk select -------------------------- */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  useEffect(() => setSelected(new Set()), [apiUrl]);

  const toggleSel = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const selectAll = () => setSelected(new Set(products.map((p) => Number(p.id))));
  const clearSel = () => setSelected(new Set());

  /* --------------------------- Helpers --------------------------- */
  const buildParams = (updates: Record<string, string | null | undefined>) => {
    const p = new URLSearchParams(params?.toString() ?? "");
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === "") p.delete(k);
      else p.set(k, v);
    });
    return p;
  };
  const go = (updates: Record<string, string | null | undefined>) => {
    const p = buildParams(updates);
    router.replace(`/seller/products?${p.toString()}`);
  };
  const handleManualReload = () => {
    const p = buildParams({ refresh: String(Date.now()) });
    router.replace(`/seller/products?${p.toString()}`);
  };

  /* --------------------------- Thêm nút điều chỉnh tồn kho trên card --------------------------- */

  const [adjusting, setAdjusting] = useState<number | null>(null);

  async function adjustStock(id: number, delta: number, reason?: "MANUAL_IN" | "MANUAL_OUT" | "ORDER" | "CANCEL" | "RETURN" | "ADJUST", note?: string) {
    try {
      setAdjusting(id);
      const res = await fetch(`/api/products/id/${id}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta, reason: reason ?? (delta > 0 ? "MANUAL_IN" : "MANUAL_OUT"), note }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      await mutate(); // reload list
    } catch (e) {
      alert("❌ Điều chỉnh tồn kho thất bại");
      console.error(e);
    } finally {
      setAdjusting(null);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/products/id/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await mutate();
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    } catch (e) {
      alert("❌ Xoá thất bại");
      console.error(e);
    }
  };

  const bulkSetActive = async (value: boolean) => {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Bạn chắc muốn ${value ? "hiện" : "ẩn"} ${selected.size} sản phẩm đã chọn?`
      )
    )
      return;
    const ids = Array.from(selected);
    await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/products/id/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: value }),
        })
      )
    );
    clearSel();
    await mutate();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Xoá ${selected.size} sản phẩm đã chọn?`)) return;
    const ids = Array.from(selected);
    await Promise.allSettled(
      ids.map((id) => fetch(`/api/products/id/${id}`, { method: "DELETE" }))
    );
    clearSel();
    await mutate();
  };

  /* --------------------------- UI --------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">📦 Sản phẩm đã đăng</h1>
        <div className="flex gap-2">
          <Link
            href="/seller/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            ➕ Thêm mới
          </Link>
          <button onClick={handleManualReload} className="px-3 py-2 border rounded-lg">
            🔄 Reload
          </button>
        </div>
      </div>

      {/* Tabs + badges */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          active={tab === "all"}
          onClick={() => go({ tab: "all", page: "1", refresh: "0" })}
          label="Tất cả"
          badge={counts.all}
        />
        <TabButton
          active={tab === "inStock"}
          onClick={() => go({ tab: "inStock", page: "1", refresh: "0" })}
          label="Còn hàng"
          badge={counts.inStock}
        />
        <TabButton
          active={tab === "lowStock"}
          onClick={() => go({ tab: "lowStock", page: "1", refresh: "0" })}
          label={`Sắp hết (≤${LOW})`}
          badge={counts.lowStock}
        />
        <TabButton
          active={tab === "outOfStock"}
          onClick={() => go({ tab: "outOfStock", page: "1", refresh: "0" })}
          label="Hết hàng"
          badge={counts.outOfStock}
        />
        <TabButton
          active={tab === "inactive"}
          onClick={() => go({ tab: "inactive", page: "1", refresh: "0" })}
          label="Ẩn"
          badge={counts.inactive}
        />
      </div>


      {/* Filters */}
      <div className="bg-white border rounded-2xl p-3 flex flex-wrap items-center gap-3">
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Tìm theo tên/mô tả/slug…"
          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border"
        />

        <select
          value={order}
          onChange={(e) => go({ order: e.target.value, page: "1", refresh: "0" })}
          className="px-3 py-2 rounded-lg border"
        >
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={String(pageSize)}
          onChange={(e) => go({ pageSize: e.target.value, page: "1", refresh: "0" })}
          className="px-3 py-2 rounded-lg border"
          title="Số sản phẩm mỗi trang"
        >
          <option value="12">12 / trang</option>
          <option value="24">24 / trang</option>
          <option value="48">48 / trang</option>
        </select>

        <div className="text-sm text-gray-500 ml-auto">
          Tổng: {total.toLocaleString("vi-VN")}
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={selectAll}
          className="px-3 py-1.5 rounded-lg border"
          disabled={products.length === 0}
        >
          Chọn tất cả
        </button>
        <button onClick={clearSel} className="px-3 py-1.5 rounded-lg border">
          Bỏ chọn
        </button>
        <span className="text-sm text-gray-600">
          Đã chọn: {selected.size.toLocaleString("vi-VN")}
        </span>
        <span className="mx-2">•</span>
        <button
          onClick={() => bulkSetActive(true)}
          disabled={selected.size === 0}
          className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
        >
          Hiện
        </button>
        <button
          onClick={() => bulkSetActive(false)}
          disabled={selected.size === 0}
          className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
        >
          Ẩn
        </button>
        <button
          onClick={bulkDelete}
          disabled={selected.size === 0}
          className="px-3 py-1.5 rounded-lg border text-red-600 disabled:opacity-50"
        >
          Xoá
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <SkeletonGrid count={pageSize} />
      ) : error ? (

        <p className="text-red-600">Lỗi khi tải danh sách sản phẩm.</p>
      ) : products.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
          Không có sản phẩm phù hợp.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const img = toSafeSrc(p.imageUrl ?? p.image ?? "");
              const detailHref = p.slug ? `/product/${p.slug}` : `/product/${p.id}`;
              const id = Number(p.id);

              return (
                <div key={String(p.id)} className="bg-white rounded-2xl border overflow-hidden">
                  <div className="relative">

                    <Link href={detailHref}
                      onMouseEnter={() => router.prefetch(detailHref)}
                      className="block h-48 bg-gray-100">
                      <img
                        src={img}
                        alt={p.name}
                        className="object-cover h-48 w-full hover:opacity-95 transition"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_SVG;
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2 h-4 w-4"
                      checked={selected.has(id)}
                      onChange={() => toggleSel(id)}
                      title="Chọn"
                    />
                  </div>

                  <div className="p-4">
                    <Link
                      href={detailHref}
                      onMouseEnter={() => router.prefetch(detailHref)}
                      className="font-semibold hover:underline line-clamp-2"
                      title={p.name}
                    >
                      {p.name}
                    </Link>

                    {(p.category || p.categoryId) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.category ?? (p.categoryId ? `Category #${p.categoryId}` : "")}
                      </p>
                    )}

                    <p className="text-red-600 font-bold mt-1" suppressHydrationWarning>
                      {hydrated ? `${fmtPrice(p.price)}₫` : "—"}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Tồn: {p.stock ?? 0}</span>
                      <span>{p.isActive ? "Đang bán" : "Ẩn"}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        disabled={adjusting === id}
                        onClick={() => adjustStock(id, -1, "MANUAL_OUT")}
                        className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                        title="Xuất kho -1"
                      >−1</button>

                      <button
                        disabled={adjusting === id}
                        onClick={() => adjustStock(id, +1, "MANUAL_IN")}
                        className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                        title="Nhập kho +1"
                      >+1</button>

                      <button
                        disabled={adjusting === id}
                        onClick={async () => {
                          const v = prompt("Nhập số lượng ± (ví dụ 5 hoặc -3):", "5");
                          if (!v) return;
                          const n = parseInt(v, 10);
                          if (!Number.isFinite(n) || n === 0) return alert("Số không hợp lệ");
                          await adjustStock(id, n);
                        }}
                        className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                        title="Điều chỉnh tuỳ ý"
                      >±</button>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/seller/edit/${p.id}`}
                        className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm"
                      >
                        ✏️ Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(id)}
                        className="border px-3 py-1.5 rounded text-sm"
                      >
                        🗑️ Xoá
                      </button>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={detailHref}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        /product/{p.slug ?? p.id}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={(p) => go({ page: String(p), refresh: "0" })}
          />
        </>
      )}
    </div>
  );
}

/* ------------------------ Components phụ ------------------------ */

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-2 ${active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
        }`}
    >
      <span>{label}</span>
      <span
        className={`px-2 h-5 min-w-[20px] rounded-full text-xs flex items-center justify-center ${active ? "bg-white/20" : "bg-gray-100"
          }`}
      >
        {(badge ?? 0).toLocaleString("vi-VN")}
      </span>
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  const add = (v: number | "…") => pages.push(v);

  const window = 2;
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);

  if (start > 1) add(1);
  if (start > 2) add("…");
  for (let p = start; p <= end; p++) add(p);
  if (end < totalPages - 1) add("…");
  if (end < totalPages) add(totalPages);

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className="px-3 py-1.5 border rounded disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        ← Trước
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`px-3 py-1.5 border rounded ${p === page ? "bg-gray-900 text-white" : "bg-white"
              }`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="px-3 py-1.5 border rounded disabled:opacity-50"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Sau →
      </button>
    </div>
  );
}
