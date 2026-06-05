"use client";

import type { ReactNode } from "react";

/** Marka kutusu — isometrik görünüm, üstten açık. */
export function PasteraIsometricBox({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]" style={{ aspectRatio: "6/5" }}>
      <svg
        viewBox="0 0 300 250"
        className="h-full w-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="pbox-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a5232" />
            <stop offset="100%" stopColor="#243323" />
          </linearGradient>
          <linearGradient id="pbox-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2e402a" />
            <stop offset="100%" stopColor="#1e2e1a" />
          </linearGradient>
          <linearGradient id="pbox-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a6240" />
            <stop offset="100%" stopColor="#364a2e" />
          </linearGradient>
          <clipPath id="pbox-interior">
            <polygon points="95,52 205,52 235,82 65,82" />
          </clipPath>
        </defs>

        {/* Gölge */}
        <ellipse cx="150" cy="238" rx="100" ry="10" fill="rgba(0,0,0,0.35)" />

        {/* Sol yan yüz */}
        <polygon points="30,95 95,52 95,195 30,218" fill="url(#pbox-side)" stroke="#1a2418" strokeWidth="1" />

        {/* Ön yüz */}
        <polygon points="95,52 205,52 205,195 95,195" fill="url(#pbox-front)" stroke="#1a2418" strokeWidth="1" />

        {/* Sağ yan yüz */}
        <polygon points="205,52 270,95 270,218 205,195" fill="#243323" stroke="#1a2418" strokeWidth="1" />

        {/* Üst kapak kenarı (sol) */}
        <polygon points="30,95 95,52 65,22 0,52" fill="url(#pbox-top)" stroke="#c49746" strokeWidth="1.5" opacity="0.9" />

        {/* Üst kapak kenarı (sağ) */}
        <polygon points="95,52 205,52 235,22 65,22" fill="#4a6240" stroke="#c49746" strokeWidth="1.5" />

        {/* İç boşluk (koyu) */}
        <polygon points="95,52 205,52 235,82 65,82" fill="#0a0a0a" opacity="0.95" />

        {/* Altın şerit — ön */}
        <line x1="95" y1="120" x2="205" y2="120" stroke="#c49746" strokeWidth="2" opacity="0.7" />

        {/* Logo alanı */}
        <text
          x="150"
          y="155"
          textAnchor="middle"
          fill="#c49746"
          fontSize="18"
          fontWeight="700"
          fontFamily="var(--font-syne), sans-serif"
          opacity="0.85"
        >
          PASTERA
        </text>
        <text x="150" y="172" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" letterSpacing="3">
          PASTA BOX
        </text>
      </svg>

      {/* Malzemeler — kutunun açık üst kısmında */}
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: "21.5%",
          right: "21.5%",
          top: "14%",
          height: "28%",
          clipPath: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
