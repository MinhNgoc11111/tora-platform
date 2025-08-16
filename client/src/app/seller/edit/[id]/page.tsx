"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

export function EditProductPage() {
  return <ProductEditForm />;
}

interface Product {
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
}

export default function ProductEditForm() {
  const params = useParams();
  const idParam = (params as any)?.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam ?? 0);

  const router = useRouter();
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    category: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/products/id/${id}`, { cache: "no-store" });

        if (!res.ok) throw new Error("Không thể tải sản phẩm");
        const data = await res.json();

        setProduct({
          name: data?.name ?? "",
          // ⚠️ Ép number vì server có thể trả Decimal/string
          price: Number(data?.price ?? 0),
          // Nếu bạn đã migrate sang categoryId, có thể bỏ field category
          category: data?.category ?? "",
          description: data?.description ?? "",
          imageUrl: data?.imageUrl ?? data?.image ?? "",
        });
      } catch (err: any) {
        alert(err?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/products/id/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          price: Number(product.price), // đảm bảo gửi number
        }),
      });

      // Debug (nếu cần)
      console.log("PUT status:", res.status);
      const text = await res.text();
      console.log("PUT response body:", text);

      if (!res.ok) throw new Error(`Cập nhật thất bại: ${res.status}`);

      // ✅ Ép trang danh sách refetch chắc chắn
      router.replace(`/seller/products?refresh=${Date.now()}`);
    } catch (err: any) {
      alert(err?.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">✏️ Sửa sản phẩm</h1>

      <label className="block mb-2">
        Tên sản phẩm:
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </label>

      <label className="block mb-2">
        Giá:
        <input
          type="number"
          name="price"
          value={Number(product.price)}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </label>

      <label className="block mb-2">
        Danh mục:
        <input
          type="text"
          name="category"
          value={product.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </label>

      <label className="block mb-2">
        Mô tả:
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </label>

      <label className="block mb-2">
        Hình ảnh URL:
        <input
          type="text"
          name="imageUrl"
          value={product.imageUrl}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
