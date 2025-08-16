"use client";

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function CategorySection() {
  const { t } = useTranslation("common");
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const categories = [
    { key: "fashion", icon: "👗" },
    { key: "electronics", icon: "💻" },
    { key: "beauty", icon: "💄" },
    { key: "home", icon: "🏠" },
    { key: "mom_baby", icon: "👶" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto px-4"
    >
      <h2 className="text-2xl font-semibold mb-4">{t("category.title")}</h2>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="bg-white rounded-xl p-4 shadow text-center hover:bg-blue-50 cursor-pointer"
          >
            <div className="text-3xl">{cat.icon}</div>
            <div className="mt-2 text-sm font-medium">
              {t(`category.${cat.key}`)}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
