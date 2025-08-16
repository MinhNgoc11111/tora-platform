'use client';

import { useTranslation } from 'react-i18next';
import SidebarCategory from '@/components/SidebarCategory';
import Banner from '@/components/Banner';
import WelcomeHeader from '@/components/WelcomeHeader';
import FlashSale from "@/components/FlashSale";
import SuggestedProducts from "@/components/SuggestedProducts";
import ClientWrapper from '@/components/ClientWrapper';

export default function Home() {
  const { t } = useTranslation('common');

  return (
      <main>
        {/* ✅ PHẦN CHÀO MỪNG TOÀN TRANG */}
        <WelcomeHeader />

        {/* ✅ Giao diện chính */}
        <div className="max-w-[1200px] mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
          {/* Sidebar bên trái */}
          <aside className="w-full md:w-1/4 hidden md:block">
            <SidebarCategory />
          </aside>

          {/* Banner ảnh và flash sale */}
          <section className="w-full md:w-3/4">
            <Banner />
            <FlashSale />
          </section>
        </div>

        {/* ✅ GỢI Ý HÔM NAY */}
        <div className="max-w-[1200px] mx-auto px-4">
          <SuggestedProducts />
        </div>
      </main>
  );
}
