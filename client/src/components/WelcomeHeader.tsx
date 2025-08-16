'use client';

import { useTranslation } from 'react-i18next';

const WelcomeHeader = () => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white text-center py-4 border-b border-gray-200">
      <h1 className="text-3xl md:text-4xl font-bold text-pink-600">{t('banner.title')} 🐯</h1>
      <p className="text-gray-600 mt-1">{t('banner.subtitle')}</p>
      {/* ✅ Đã xoá nút "Ưu đãi sốc" */}
    </div>
  );
};

export default WelcomeHeader;
