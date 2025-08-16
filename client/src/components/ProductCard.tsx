"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import type { CartItem, Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation("common");
  const { addToCart } = useCart();

  // i18n: nếu key không có, fallback về tên gốc
  const nameKey = `product.${product.name}`;
  const translated = t(nameKey);
  const displayName = translated === nameKey ? product.name : translated;

  // Ảnh: ưu tiên imageUrl, sau đó tới image, rồi placeholder
  const img =
    (product as any).imageUrl ??
    (product as any).image ??
    "/placeholder.png";

  // Link: ưu tiên slug; fallback id (khi data cũ chưa backfill)
  const href = product.slug
    ? `/product/${product.slug}`
    : `/product/${product.id}`;

  const handleAddToCart = () => {
    const item: CartItem = {
      id: Number(product.id),
      name: product.name,
      price: product.price,
      image: img,
      rating: (product as any).rating ?? 0,
      sold: (product as any).sold ?? 0,
      tag: (product as any).tag ?? undefined,
      quantity: 1,
    };
    addToCart(item);
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition duration-200">
      <Link href={href}>
        <div className="cursor-pointer hover:scale-105 transition-transform">
          <Image
            src={img}
            alt={displayName}
            width={300}
            height={160}
            className="w-full h-40 object-cover rounded"
          />
          <h3 className="mt-2 text-sm font-medium line-clamp-2 min-h-[40px]">
            {displayName}
          </h3>
          <p className="text-red-600 font-semibold mt-1">
            {product.price.toLocaleString()}¥
          </p>
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-semibold"
      >
        ➕ {t("Thêm vào giỏ")}
      </button>
    </div>
  );
}
