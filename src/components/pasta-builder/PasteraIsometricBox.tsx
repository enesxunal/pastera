"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/** Gerçek Pastera kutu fotoğrafı (referans) + içine katman alanı. */
export function PasteraIsometricBox({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[min(100%,340px)]" style={{ aspectRatio: "4/5" }}>
      <Image
        src="/pastera-box-reference.png"
        alt=""
        fill
        className="object-contain drop-shadow-[0_20px_36px_rgba(0,0,0,0.5)]"
        sizes="(max-width: 768px) 280px, 340px"
        priority
        unoptimized
      />

      {/* Kutu içi — referans görseldeki açıklık hizası */}
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: "19%",
          right: "19%",
          top: "7.5%",
          height: "34%",
          clipPath: "polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #e6d9c4 0%, #d2c0a4 55%, #c4b092 100%)",
          }}
        />
        <div className="relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}
