"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


interface CartPopupProps {
  onClose?: () => void;
}

export default function CartPopup({ onClose }: CartPopupProps) {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const goToCheckout = () => {
    if (onClose) onClose(); // tự động đóng popup khi chuyển trang
    router.push("/checkout");
  };

  // ❗Click ra ngoài thì đóng
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const setRefs = (el: HTMLDivElement) => {
    popupRef.current = el;
    inViewRef(el);
  };

  return (
    <motion.div
      ref={setRefs}
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-16 right-2 w-[95vw] max-w-[380px] bg-white rounded-xl shadow-lg z-50 p-4 space-y-4 border sm:right-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">🛒 Giỏ hàng</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-600">
          <X size={20} />
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có sản phẩm nào trong giỏ.</p>
      ) : (
        <>
          <ul className="max-h-[300px] overflow-y-auto divide-y pr-1">
            {cart.map((item) => (
              <li key={item.id} className="flex gap-3 py-2">
                {/* 👉 Ảnh sản phẩm có thể bấm */}
                <Link href={`/product/${item.id}`} onClick={onClose}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded object-cover"
                  />
                </Link>

                <div className="flex-1">
                  {/* 👉 Tên sản phẩm có thể bấm */}
                  <Link
                    href={`/product/${item.id}`}
                    onClick={onClose}
                    className="text-sm font-medium text-gray-800 hover:underline line-clamp-1 block"
                  >
                    {item.name}
                  </Link>

                  {/* 👉 Hiển thị size & màu */}
                  {item.size && (
                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                  )}
                  {item.color && (
                    <p className="text-xs text-gray-500">Màu: {item.color}</p>
                  )}

                  {/* 👉 Số lượng có thể sửa */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-0.5 border rounded text-sm"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-0.5 border rounded text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* 👉 Giá */}
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </p>
                </div>

                {/* Xoá */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>

          <div className="text-right text-sm">
            Tổng cộng:{" "}
            <span className="text-red-600 text-base font-bold">
              {totalPrice.toLocaleString()}₫
            </span>
          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline"
            >
              Xóa tất cả
            </button>
            <button
              onClick={() => {
                goToCheckout();
                onClose?.();
              }}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm font-semibold"
            >
              ✅ Thanh toán
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
