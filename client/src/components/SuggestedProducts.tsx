"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { CartItem } from "@/types";


// ⭐ Component hiển thị sao
interface StarRatingProps {
  rating: number;
}
const StarRating: React.FC<StarRatingProps> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? "orange" : "none"}
        stroke={i < rating ? "orange" : "gray"}
      />
    ))}
  </div>
);

// 📦 Kiểu dữ liệu sản phẩm
interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number | null;
  sold: number;
  rating: number;
  tag: string;
}

// 🧱 Component sản phẩm
interface ProductCardProps {
  product: Product;
}
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
        <Link href={`/product/${product.id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover"
          />

          <div className="p-2">
            <h3 className="text-sm font-semibold line-clamp-2 min-h-[40px]">
              {product.name}
            </h3>
            <div className="text-red-600 font-bold text-sm">
              {product.price.toLocaleString()}₫
            </div>
            {product.originalPrice && (
              <div className="text-xs line-through text-gray-400">
                {product.originalPrice.toLocaleString()}₫
              </div>
            )}
            <div className="text-xs text-gray-500">{product.sold} đã bán</div>
            <StarRating rating={product.rating} />
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                product.tag === "Bán chạy"
                   ? "bg-red-100 text-red-600"
                   : "bg-green-100 text-green-600"
              }`}
            >
              {product.tag}
            </span>
          </div>
        </Link>

      <div className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 group-hover:opacity-100 opacity-0 transition duration-300">
        <button
          className="bg-red-500 text-white text-sm px-4 py-1 rounded-full shadow hover:bg-red-600"
          onClick={() => {
            const item: CartItem = {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.imageUrl,
              rating: product.rating,
              sold: product.sold,
              tag: product.tag,
              quantity: 1,
             };
              addToCart(item);
            }}
        >
          🛒 Thêm vào giỏ
        </button>
      </div>
    </motion.div>
  );
};

// 💀 Thẻ giả khi loading
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow animate-pulse overflow-hidden">
    <div className="w-full aspect-square bg-gray-200" />
    <div className="p-2 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

// 🔥 Component chính
const SuggestedProducts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "banchay" | "giamgia">("all");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const mockProducts: Product[] = Array.from({ length: 36 }, (_, index) => ({
    id: index + 1,
    name: `Sản phẩm nổi bật ${index + 1}`,
    imageUrl: `https://picsum.photos/seed/suggested${index + 1}/400/400`,
    price: Math.floor(Math.random() * 500 + 100) * 1000,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 800 + 300) * 1000 : null,
    sold: Math.floor(Math.random() * 1000),
    rating: Math.floor(Math.random() * 5 + 1),
    tag: Math.random() > 0.5 ? "Bán chạy" : "Giảm sốc",
  }));

  const filteredProducts = mockProducts.filter((p) => {
    if (activeTab === "banchay") return p.tag === "Bán chạy";
    if (activeTab === "giamgia") return p.tag === "Giảm sốc";
    return true;
  });

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    breakpoints: {
      "(min-width: 768px)": { slides: { perView: 0 } },
    },
    slides: { perView: 1.4, spacing: 12 },
  });

  return (
    <div className="my-8 px-2 md:px-4">
      <h2 className="text-2xl font-bold mb-4">🔥 Gợi ý hôm nay</h2>

      {/* 🧭 Tabs lọc */}
      <div className="flex gap-2 mb-4">
        {["all", "banchay", "giamgia"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              activeTab === tab
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {{
              all: "Tất cả",
              banchay: "Bán chạy",
              giamgia: "Giảm sốc",
            }[tab]}
          </button>
        ))}
      </div>

      {/* 📱 Mobile: Carousel */}
      <div className="block md:hidden" ref={sliderRef}>
        <div className="keen-slider">
          {filteredProducts.map((product) => (
            <div key={product.id} className="keen-slider__slide pr-2">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* 💻 Desktop: Grid */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
};

export default SuggestedProducts;
