"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LangSwitcher from "@/components/LangSwitcher";
import CartPopup from "@/components/CartPopup";
import { useCart } from "@/context/CartContext";
import { AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { UserIcon } from "@heroicons/react/24/outline";
import { maskEmail } from "@/lib/privacy";

// Heroicons
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ClockIcon,
  StarIcon,
  TicketIcon,
  BuildingStorefrontIcon, // 👈 thêm icon cửa hàng
} from "@heroicons/react/24/outline";

export default function Header() {
  const [q, setQ] = useState("");
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");
  const { cart } = useCart();
  const { data: session } = useSession();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-2">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-red-600">
          Tora
        </Link>

        {/* Search box */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2 pl-10 text-sm
                      focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 text-gray-400" />
        </form>

        {/* Right section */}
        {/* 🔎 Nếu muốn hiện trên mobile, bỏ class `hidden lg:flex` */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-gray-700 ml-auto">
          {/* Language */}
          <LangSwitcher />

          {/* 🏪 Liên kết trang người bán */}
          {/* Chỉ hiện khi đăng nhập; nếu muốn luôn hiện, bỏ điều kiện session?.user */}
          {/* 🏪 Kênh người bán */}
          {session?.user && (
            <Link href="/seller/products" className="flex flex-col items-center hover:text-red-600">
              <BuildingStorefrontIcon className="h-5 w-5" />
              <span>{t("seller_portal", "Kênh người bán")}</span>
            </Link>
          )}

          {/* 🛒 Giỏ hàng */}
          <div
            className="relative flex flex-col items-center hover:text-red-600 cursor-pointer"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span>{t("cart")}</span>
          </div>

          <div className="flex flex-col items-center hover:text-red-600 cursor-pointer">
            <ClockIcon className="h-5 w-5" />
            <span>{t("history")}</span>
          </div>

          <div className="flex flex-col items-center hover:text-red-600 cursor-pointer">
            <StarIcon className="h-5 w-5" />
            <span>{t("favorite")}</span>
          </div>

          <div className="flex flex-col items-center hover:text-red-600 cursor-pointer">
            <TicketIcon className="h-5 w-5" />
            <span>{t("coupon")}</span>
          </div>

          {/* 👤 User */}
          {session?.user ? (
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <UserIcon className="h-5 w-5 text-blue-600 rounded-full bg-blue-100 p-1" />
              <span>{session.user.name?.trim() || maskEmail(session.user.email ?? "", 5)}</span>
              <button onClick={() => signOut()} className="text-red-500 hover:underline text-xs ml-2">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link href="/signin" className="text-blue-600 hover:underline text-xs">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* ✅ Popup Giỏ hàng */}
      <AnimatePresence>
        {showCart && <CartPopup onClose={() => setShowCart(false)} />}
      </AnimatePresence>
    </header>
  );
}
