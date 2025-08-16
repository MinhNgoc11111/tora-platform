'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',  // ✅ Đường dẫn đúng
    },
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'vi',           // ✅ luôn rơi về tiếng Việt
    debug: true,
    interpolation: { escapeValue: false },
  });

export default i18n;
