'use client';

import Link from "next/link";

const cartItems = [
  {
    id: 1,
    name: "Sản phẩm nổi bật 1",
    imageUrl: "https://via.placeholder.com/100",
    price: 417000,
    quantity: 1,
  },
];

export default function CartPage() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🛒 Giỏ hàng</h2>
      {cartItems.map((item) => (
        <div key={item.id} className="flex items-center gap-4 mb-4 border-b pb-2">
          <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover" />
          <div>
            <Link
              href={`/cart/item/${item.id}`}
              className="text-blue-600 hover:underline"
            >
              {item.name}
            </Link>
            <p>Giá: {item.price.toLocaleString()}đ</p>
            <p>Số lượng: {item.quantity}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
