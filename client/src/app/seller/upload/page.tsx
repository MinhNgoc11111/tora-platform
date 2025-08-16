"use client";

import { useState } from "react";
import { CloudUpload } from "lucide-react";

export default function UploadProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Thời trang");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, price, originalPrice, description, category, image });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded-lg mt-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        🛍️ Đăng sản phẩm mới
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              placeholder="Ví dụ: Áo thun nam cổ tròn Uniqlo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border w-full px-4 py-2 rounded focus:outline-none focus:ring"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Mô tả chi tiết</label>
            <textarea
              placeholder="Mô tả sản phẩm, chất liệu, cách sử dụng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border w-full px-4 py-2 rounded h-32 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Giá khuyến mãi *</label>
              <input
                type="number"
                placeholder="VND"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border w-full px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Giá gốc</label>
              <input
                type="number"
                placeholder="VND"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="border w-full px-4 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border w-full px-4 py-2 rounded"
            >
              <option>Thời trang</option>
              <option>Điện tử</option>
              <option>Mỹ phẩm</option>
              <option>Gia dụng</option>
              <option>Mẹ & Bé</option>
              <option>Thể thao</option>
            </select>
          </div>
        </div>

        {/* Ảnh sản phẩm */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Ảnh sản phẩm</label>
            <div className="border border-dashed border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="h-48 object-contain rounded" />
              ) : (
                <>
                  <CloudUpload className="h-10 w-10 text-gray-400" />
                  <p className="text-gray-500 text-sm mt-2">Chọn hoặc kéo ảnh vào đây</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="fileUpload" />
              <label
                htmlFor="fileUpload"
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                Chọn ảnh
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded shadow"
          >
            ✅ Đăng sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
