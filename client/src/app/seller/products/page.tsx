// src/app/seller/products/page.tsx
import SellerProductList from "./SellerProductList";


// ⬆ Nếu bạn để component ở nơi khác (vd: src/components/SellerProductList.tsx)
// hãy đổi import cho đúng: import SellerProductList from "@/components/SellerProductList";

export const runtime = "nodejs"; // dùng Prisma/Node runtime

export default function SellerProductsPage() {
  return (
    <div className="p-4 md:p-6">
      <SellerProductList />
    </div>
  );
}
