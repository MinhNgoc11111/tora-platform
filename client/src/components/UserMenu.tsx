"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Đang kiểm tra đăng nhập...</p>;
  if (status === "unauthenticated") {
    return (
      <Link href="/login" className="text-blue-600 hover:underline">
        Đăng nhập
      </Link>
    );
  }

  // ✅ Ép kiểu an toàn cho session.user (tạm)
  const user = session?.user as { email?: string };

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-gray-700">👤 {user.email}</p>
      <button
        onClick={() => signOut()}
        className="text-red-500 text-sm hover:underline"
      >
        Đăng xuất
      </button>
    </div>
  );
}
