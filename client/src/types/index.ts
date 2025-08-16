// src/types/index.ts

export interface Product {
  id: number | string;
  name: string;
  price: number;

  // Ảnh: ưu tiên imageUrl (từ API), sau đó image (UI cũ)
  image?: string | null;
  imageUrl?: string | null;

  // Slug để link /product/[slug]
  slug?: string;

  originalPrice?: number | null;
  sold?: number;
  rating?: number;
  tag?: string | null;

  description?: string | null;
  size?: string;
  color?: string;

  // (Tuỳ chọn) phục vụ trang seller/admin
  stock?: number;
  isActive?: boolean;
  category?: string | null;   // schema cũ dạng chuỗi
  categoryId?: number | null; // schema mới quan hệ Category
}

// 👇 Giỏ hàng
export interface CartItem extends Product {
  id: number;      // ép về number trong cart
  quantity: number;
}
