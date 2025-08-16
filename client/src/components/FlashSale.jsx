'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '@/hooks/useInView';

const FlashSale = () => {
  const { t } = useTranslation('common');
  const [ref, inView] = useInView();

  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999); // đến cuối ngày

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(endTime.getTime() - now.getTime(), 0);
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-white shadow p-4 rounded-xl transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
    >
      {/* Tiêu đề + đếm ngược */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-red-600">⚡ FLASH SALE</h2>
          <div className="flex gap-1 text-white font-semibold text-sm">
            <div className="bg-black px-2 py-1 rounded">{timeLeft.hours}</div>
            <span className="text-black">:</span>
            <div className="bg-black px-2 py-1 rounded">{timeLeft.minutes}</div>
            <span className="text-black">:</span>
            <div className="bg-black px-2 py-1 rounded">{timeLeft.seconds}</div>
          </div>
        </div>
        <a href="/flash-sale" className="text-pink-600 text-sm hover:underline">
          {t('flash.view_all') || 'Xem tất cả >'}
        </a>
      </div>

      {/* Danh sách sản phẩm Flash sale */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border rounded-lg p-2 hover:shadow-md transition">
            <img
              src={`/flash/item${index + 1}.jpg`}
              alt={`Item ${index + 1}`}
              className="w-full h-36 object-cover rounded"
            />
            <div className="mt-2 text-red-600 font-semibold text-sm">
              ₫{(Math.random() * 1000000).toFixed(0)}
            </div>
            <div className="text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center rounded mt-1 py-1">
              {t('flash.hot_selling') || 'ĐANG BÁN CHẠY'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSale;
