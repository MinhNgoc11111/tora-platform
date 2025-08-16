'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const FlashSale = () => {
  const { t } = useTranslation('common');
  const [timeLeft, setTimeLeft] = useState(3600); // 1 giờ

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const flashItems = [
    { id: 1, name: 'Áo hoodie Unisex', image: '/products/p1.jpg', stock: 5 },
    { id: 2, name: 'Tai nghe Bluetooth', image: '/products/p2.jpg', stock: 3 },
    { id: 3, name: 'Kem chống nắng', image: '/products/p3.jpg', stock: 2 },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-[1200px] mx-auto px-4 py-8 bg-yellow-50 rounded"
    >
      {/* Header Flash Sale */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-pink-600 font-bold text-xl">
          <span>⚡</span>
          <span>{t('flash.title')}</span>
          <span>⚡</span>
          <div className="flex items-center gap-1 ml-4">
            {formatTime(timeLeft)
              .split(':')
              .map((unit, idx) => (
                <div
                  key={idx}
                  className="bg-black text-white text-xs md:text-sm px-2 py-1 rounded-md font-mono animate-pulse"
                >
                  {unit}
                </div>
              ))}
          </div>
        </div>

        <button className="text-sm bg-yellow-300 hover:bg-yellow-400 text-black font-medium px-3 py-1 rounded">
          {t('flash.view_all')}
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {flashItems.map((item) => (
          <motion.div
            key={item.id}
            className="bg-white shadow rounded p-2 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 * item.id, duration: 0.4 }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded"
            />
            <p className="mt-2 text-sm font-medium">{item.name}</p>
            <p className="text-red-500 text-xs font-semibold mt-1">
              {t('flash.only_left', { count: item.stock })}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default FlashSale;
