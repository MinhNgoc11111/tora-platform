// src/app/seller/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, LineChart, Settings, Store } from "lucide-react";
import React from "react";

const NAV = [
  { href: "/seller", label: "Tổng quan", icon: LineChart },
  { href: "/seller/products", label: "Sản phẩm", icon: Package },
  { href: "/seller/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/seller/settings", label: "Cài đặt", icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Store className="h-5 w-5 text-indigo-600" />
          <span className="font-semibold">Kênh người bán</span>
          <nav className="ml-auto flex items-center gap-2 text-sm">
            <Link href="/" className="hover:underline">Về trang mua sắm</Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="sticky top-16 bg-white border rounded-2xl overflow-hidden">
            {NAV.map((item) => {
              const Active = path === item.href || (item.href !== "/seller" && path?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm border-b last:border-b-0
                   ${Active ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-gray-50"}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">{children}</main>
      </div>
    </div>
  );
}
