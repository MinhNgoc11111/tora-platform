"use client";

import React from "react";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";

const Banner = () => {
  const [ref, inView] = useInView();

  return (
    <section
      ref={ref}
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Banner lớn bên trái */}
      <div className="relative rounded overflow-hidden shadow">
        <Image
          src="/banner-1.png"
          alt="Banner 1"
          width={600}
          height={400}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Hai banner nhỏ bên phải */}
      <div className="grid grid-rows-2 gap-4">
        <div className="rounded overflow-hidden shadow">
          <Image
            src="/banner-2.png"
            alt="Banner 2"
            width={600}
            height={190}
            className="w-full h-auto object-cover"
          />
        </div>
        <div className="rounded overflow-hidden shadow">
          <Image
            src="/banner-3.png"
            alt="Banner 3"
            width={600}
            height={190}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
