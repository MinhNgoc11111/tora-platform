"use client";

import { useTranslation } from "react-i18next";
import i18nInstance from "@/i18n";        // đổi tên để phân biệt

export default function LangSwitcher() {
  const { i18n } = useTranslation();     // i18n hiện tại (của react-i18next)
  const currentLang = i18n.language;

  const changeLanguage = (lng: string) => {
    i18nInstance.changeLanguage(lng);    // thay đổi toàn cục
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLng", lng);
    }
  };

  return (
    <div className="flex gap-2 items-center text-sm">
      {["vi", "en", "ja", "ko"].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`px-2 py-1 rounded ${
            currentLang === lng
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
