// src/app/seller/add/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type FormState = {
  name: string;
  price: string;          // giữ dạng string để điều khiển input
  description: string;
  categoryId: string;     // nhập số
  isActive: boolean;
};

type ImgItem = {
  id: string;
  url: string;            // URL preview (blob: hoặc http(s) hoặc /uploads/…)
  file?: File;            // nếu là file local
  uploadedUrl?: string;   // URL sau khi upload
};

const PLACEHOLDER = "/placeholder.png";

export default function SellerProductCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    isActive: true,
  });

  const [images, setImages] = useState<ImgItem[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Formatter xem trước giá trị giá tiền
  const nf = useMemo(() => new Intl.NumberFormat("vi-VN"), []);
  const pricePreview =
    form.price.trim() === "" ? "—" : nf.format(Math.trunc(Number(form.price || 0)));

  /* -------------------- ẢNH: chọn file / kéo-thả / sắp xếp -------------------- */
  const pickFiles = () => fileInputRef.current?.click();

  const pushFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list: ImgItem[] = [];
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const url = URL.createObjectURL(f);
      list.push({ id: crypto.randomUUID(), url, file: f });
    });
    setImages((prev) => [...prev, ...list]);
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    pushFiles(e.target.files);
    // reset input để chọn lại cùng một file vẫn nhận
    e.currentTarget.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    pushFiles(e.dataTransfer.files);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();

  // Drag-sort đơn giản (HTML5)
  const [dragId, setDragId] = useState<string | null>(null);
  const onDragStart = (id: string) => () => setDragId(id);
  const onDragEnter = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setImages((prev) => {
      const a = prev.findIndex((x) => x.id === dragId);
      const b = prev.findIndex((x) => x.id === overId);
      if (a < 0 || b < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(a, 1);
      next.splice(b, 0, moved);
      return next;
    });
  };

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((x) => x.id !== id));

  const makePrimary = (id: string) =>
    setImages((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [it] = next.splice(idx, 1);
      next.unshift(it);
      return next;
    });

  /* --------------------------------- SUBMIT ---------------------------------- */
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Vui lòng nhập tên sản phẩm");

    const priceInt = Math.trunc(Number(form.price || 0));
    if (!Number.isFinite(priceInt) || priceInt < 0)
      return alert("Giá không hợp lệ");

    setSaving(true);
    try {
      // 1) Upload lần lượt các ảnh là file local
      const uploaded: ImgItem[] = [];
      for (const item of images) {
        if (item.file) {
          const fd = new FormData();
          fd.append("file", item.file);
          const up = await fetch("/api/upload", { method: "POST", body: fd });
          if (!up.ok) {
            const t = await up.text();
            console.error("Upload failed:", up.status, t);
            alert("❌ Tải ảnh thất bại");
            setSaving(false);
            return;
          }
          const { url } = await up.json();
          uploaded.push({ ...item, uploadedUrl: url });
        } else {
          uploaded.push(item);
        }
      }

      // 2) Lấy URL cuối cùng (ưu tiên uploadedUrl nếu có), ảnh đầu tiên là ảnh đại diện
      const urls = uploaded.map((i) => i.uploadedUrl ?? i.url);
      const mainImage = urls[0] || PLACEHOLDER;

      // 3) Chuẩn bị payload tạo sản phẩm
      const payload: any = {
        name: form.name.trim(),
        price: priceInt,                     // schema: Int
        image: mainImage,                    // DB hiện tại lưu 1 ảnh đại diện
        description: form.description.trim() || null,
        isActive: !!form.isActive,
      };
      const catId = Math.trunc(Number(form.categoryId));
      if (Number.isFinite(catId) && catId > 0) payload.categoryId = catId;

      // 4) Gọi API tạo
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Create failed:", res.status, text);
        alert("❌ Tạo thất bại");
        setSaving(false);
        return;
      }

      alert("✅ Đã tạo sản phẩm");
      router.replace(`/seller/products?refresh=${Date.now()}`);
    } catch (err) {
      console.error(err);
      alert("❌ Tạo thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------- UI ------------------------------------- */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Thêm sản phẩm</h1>

      <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-6">
        {/* Cột trái: upload + preview + drag-sort */}
        <div className="md:col-span-1">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed rounded-2xl p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                Ảnh (kéo-thả để sắp xếp • ảnh đầu tiên = ảnh chính)
              </span>
              <button
                type="button"
                onClick={pickFiles}
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm"
              >
                Chọn ảnh
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFileChange}
            />

            {/* Grid preview */}
            <div className="grid grid-cols-2 gap-3">
              {(images.length ? images : [{ id: "ph", url: PLACEHOLDER }]).map(
                (it, idx) => (
                  <div
                    key={it.id}
                    draggable={it.id !== "ph"}
                    onDragStart={onDragStart(it.id)}
                    onDragEnter={onDragEnter(it.id)}
                    className={`relative rounded-xl overflow-hidden border bg-white ${
                      idx === 0 && it.id !== "ph" ? "ring-2 ring-indigo-500" : ""
                    }`}
                    title={idx === 0 ? "Ảnh chính" : "Ảnh phụ"}
                  >
                    <img
                      src={it.url}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                    {it.id !== "ph" && (
                      <>
                        <button
                          type="button"
                          onClick={() => removeImage(it.id)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded px-2 py-0.5 text-xs shadow"
                        >
                          Xoá
                        </button>
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => makePrimary(it.id)}
                            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-800 rounded px-2 py-0.5 text-xs shadow"
                          >
                            Đặt làm chính
                          </button>
                        )}
                      </>
                    )}
                    {idx === 0 && it.id !== "ph" && (
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-xs rounded px-2 py-0.5">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: thông tin SP */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tên sản phẩm</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Tên sản phẩm"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Giá{" "}
                <span className="text-gray-400">
                  (đang nhập: {pricePreview}₫)
                </span>
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                placeholder="Giá"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">categoryId (tuỳ chọn)</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                inputMode="numeric"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((s) => ({ ...s, categoryId: e.target.value }))
                }
                placeholder="VD: 1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              className="h-4 w-4"
              checked={form.isActive}
              onChange={(e) =>
                setForm((s) => ({ ...s, isActive: e.target.checked }))
              }
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Đang bán (isActive)
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Mô tả (tuỳ chọn)</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Mô tả"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-green-600 text-white disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
