"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrder = () => {
    clearCart();
    router.push("/thankyou"); // ✅ chuyển sang trang cảm ơn
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        🧾 Thanh toán đơn hàng
      </h1>

      {cart.length === 0 ? (
        <>
          <p className="text-gray-600">🧺 Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-3 inline-block"
          >
            ← Tiếp tục mua sắm
          </Link>
        </>
      ) : (
        <>
          <ul className="divide-y border rounded-md shadow-sm">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                {/* Nếu bạn có ảnh sản phẩm, thay thế `src` dưới đây */}
                <Image
                  src="/placeholder.png"
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-red-600">
                    {(item.price * item.quantity).toLocaleString()} ¥
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
                        removeFromCart(item.id);
                      }
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-right mt-6">
            <p className="text-xl font-bold text-gray-800">
              Tổng cộng: <span className="text-red-600">{totalPrice.toLocaleString()} ¥</span>
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded"
            >
              ✅ Đặt hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
}
