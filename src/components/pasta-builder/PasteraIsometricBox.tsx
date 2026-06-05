"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Referans görsele uygun isometrik yeşil Pastera kutusu.
 * İç kısım kraft kağıdı rengi; malzemeler üst açıklıktan görünür.
 */
export function PasteraIsometricBox({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[320px]" style={{ aspectRatio: "1/1" }}>
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="pbox-green-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e4a32" />
            <stop offset="100%" stopColor="#1e3320" />
          </linearGradient>
          <linearGradient id="pbox-green-left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#243525" />
            <stop offset="100%" stopColor="#1a2818" />
          </linearGradient>
          <linearGradient id="pbox-green-right" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3320" />
            <stop offset="100%" stopColor="#152418" />
          </linearGradient>
          <linearGradient id="pbox-kraft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8dcc8" />
            <stop offset="100%" stopColor="#c9b89a" />
          </linearGradient>
        </defs>

        <ellipse cx="200" cy="372" rx="130" ry="14" fill="rgba(0,0,0,0.28)" />

        {/* Sol yan */}
        <polygon points="48,148 128,88 128,308 48,348" fill="url(#pbox-green-left)" stroke="#152418" strokeWidth="1" />

        {/* Ön yüz */}
        <polygon points="128,88 272,88 272,308 128,308" fill="url(#pbox-green-front)" stroke="#152418" strokeWidth="1" />

        {/* Sağ yan */}
        <polygon points="272,88 352,148 352,348 272,308" fill="url(#pbox-green-right)" stroke="#152418" strokeWidth="1" />

        {/* Üst sol kapak */}
        <polygon points="48,148 128,88 88,48 8,98" fill="#3a5a3e" stroke="#c49746" strokeWidth="1.2" opacity="0.95" />

        {/* Üst sağ kapak */}
        <polygon points="128,88 272,88 312,48 88,48" fill="#3d6240" stroke="#c49746" strokeWidth="1.2" />

        {/* İç kraft duvar — derinlik */}
        <polygon points="128,88 272,88 302,128 98,128" fill="url(#pbox-kraft)" stroke="#b8a888" strokeWidth="0.8" />

        {/* Altın süs — spiral köşeler */}
        {[
          [145, 115],
          [255, 115],
          [145, 265],
          [255, 265],
        ].map(([cx, cy], i) => (
          <g key={i} opacity="0.35">
            <circle cx={cx} cy={cy} r="18" fill="none" stroke="#c49746" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="12" fill="none" stroke="#c49746" strokeWidth="0.6" />
          </g>
        ))}

        {/* Altın yaprak noktaları */}
        {[
          [160, 200],
          [240, 190],
          [175, 250],
          [230, 270],
        ].map(([cx, cy], i) => (
          <ellipse key={`leaf-${i}`} cx={cx} cy={cy} rx="4" ry="6" fill="#c49746" opacity="0.25" transform={`rotate(${i * 30} ${cx} ${cy})`} />
        ))}
      </svg>

      {/* Logo — ön yüz */}
      <div
        className="pointer-events-none absolute flex flex-col items-center justify-center"
        style={{ left: "32%", top: "52%", width: "36%", height: "22%" }}
      >
        <Image
          src="/pastera-Logo.png"
          alt=""
          width={120}
          height={40}
          className="h-auto w-full object-contain opacity-90"
          unoptimized
        />
      </div>

      {/* Yiyecek katmanları — kutu açıklığı */}
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: "24%",
          right: "24%",
          top: "18%",
          height: "26%",
          clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)",
          background: "linear-gradient(180deg, #e8dcc8 0%, #d4c4a8 100%)",
        }}
      >
        <div className="relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}
