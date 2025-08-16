"use client";

import React, { useEffect, useRef, useState } from "react";

// Hook kiểm tra khi nào element vào viewport
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView] as const;
};

export default function AnimationDemo() {
  const [fadeInRef, fadeInInView] = useInView();
  const [slideRef, slideInView] = useInView();
  const [zoomRef, zoomInView] = useInView();
  const [fadeUpRef, fadeUpInView] = useInView();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Phần giả để scroll xuống test hiệu ứng */}
      <div className="h-[120vh] flex items-center justify-center text-gray-400">
        👇 Kéo xuống để xem hiệu ứng 👇
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <span>🎬</span> Demo Hiệu Ứng Khi Cuộn
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Fade In */}
          <div
            ref={fadeInRef}
            className={`p-6 bg-white rounded shadow transition-all duration-700 ease-out ${
              fadeInInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="font-bold text-lg mb-2">Fade In</h2>
            <p>Hiệu ứng mờ dần khi cuộn vào.</p>
          </div>

          {/* Slide In */}
          <div
            ref={slideRef}
            className={`p-6 bg-white rounded shadow transition-all duration-700 ease-out ${
              slideInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
            }`}
          >
            <h2 className="font-bold text-lg mb-2">Slide In Right</h2>
            <p>Trượt từ phải khi cuộn đến.</p>
          </div>

          {/* Zoom In */}
          <div
            ref={zoomRef}
            className={`p-6 bg-white rounded shadow transition-all duration-700 ease-out transform ${
              zoomInView ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <h2 className="font-bold text-lg mb-2">Zoom In</h2>
            <p>Phóng to nhẹ khi cuộn vào.</p>
          </div>

          {/* Fade Up */}
          <div
            ref={fadeUpRef}
            className={`p-6 bg-white rounded shadow transition-all duration-700 ease-out ${
              fadeUpInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="font-bold text-lg mb-2">Fade Up</h2>
            <p>Từ dưới lên khi scroll tới.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
