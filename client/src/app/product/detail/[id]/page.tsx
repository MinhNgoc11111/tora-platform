"use client";

import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { CartItem, Product } from "@/types";

export default function ProductDetailPage() {
  const id = useParams()?.id as string;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Sản phẩm không tồn tại");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("❌ Lỗi khi tải sản phẩm:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const suggestedProducts: Product[] = [
    {
      id: 2,
      name: "Áo hoodie form rộng",
      image: "/products/p1.jpg",
      price: 450000,
      originalPrice: 550000,
      sold: 98,
      rating: 5,
      tag: "Giảm sốc",
    },
    {
      id: 3,
      name: "Áo khoác chống nắng UV",
      image: "/products/p2.jpg",
      price: 390000,
      originalPrice: null,
      sold: 210,
      rating: 4,
      tag: "Bán chạy",
    },
  ];

  if (!product) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛍️ Chi tiết sản phẩm</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ảnh */}
        <img
          src={product.image || "https://via.placeholder.com/400"}
          alt={product.name}
          className="rounded w-full object-cover aspect-square"
        />

        {/* Thông tin */}
        <div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-red-600 text-xl font-bold">
              {product.price.toLocaleString()}₫
            </p>
            {product.originalPrice && (
              <p className="line-through text-gray-400 text-sm">
                {product.originalPrice.toLocaleString()}₫
              </p>
            )}
          </div>

          <p className="text-gray-500 text-sm mt-1">
            Đã bán: {product.sold} | Đánh giá: {product.rating}⭐
          </p>

          <p className="mt-4 text-sm text-gray-700">{product.description}</p>

          {/* Chọn số lượng */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-base">{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Nút thêm vào giỏ */}
          <button
            onClick={() => {
              const item = { ...product, quantity } as CartItem;
              addToCart(item);
              alert("✅ Đã thêm vào giỏ hàng");
            }}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ➕ Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Gợi ý bên dưới */}
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">🧡 Sản phẩm tương tự</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suggestedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
