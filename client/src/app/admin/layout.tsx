// src/app/admin/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
// ⚠️ Sửa đường dẫn này theo dự án của bạn
// Ví dụ bạn để options ở "@/lib/auth" hoặc "@/app/api/auth/[...nextauth]/options"
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // 1) Bắt buộc đăng nhập
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=/admin/purge`);
  }

  // 2) Kiểm tra role trong DB (an toàn, không phụ thuộc payload session)
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") {
    // 403 mềm (có thể redirect sang trang chủ nếu muốn)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-xl border text-center">
          <h1 className="text-xl font-semibold mb-2">403 – Không có quyền truy cập</h1>
          <p>Trang này chỉ dành cho quản trị viên.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
