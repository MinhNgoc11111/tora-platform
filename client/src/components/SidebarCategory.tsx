'use client';

import { useTranslation } from 'react-i18next';

const cats = [
  { key: 'fashion', icon: '👗' },
  { key: 'electronics', icon: '💻' },
  { key: 'beauty', icon: '💄' },
  { key: 'home', icon: '🏠' },
  { key: 'mom_baby', icon: '👶' },
  { key: 'sport', icon: '⚽' },
];

export default function SidebarCategory() {
  const { t } = useTranslation('common');

  return (
    <aside className="w-44 shrink-0 bg-white rounded-lg shadow p-4 h-max sticky top-24">
      <h3 className="font-semibold mb-3 text-pink-600">{t('category.title')}</h3>
      <ul className="space-y-3">
        {cats.map((c) => (
          <li
            key={c.key}
            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 cursor-pointer"
          >
            <span className="text-lg">{c.icon}</span>
            <span className="text-sm">{t(`category.${c.key}`)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
