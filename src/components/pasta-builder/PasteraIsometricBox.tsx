"use client";

import type { ReactNode } from "react";

/**
 * SVG viewBox 200×250 ile birebir hizalı iç alan.
 * Ağız: (44,46)→(156,46)→(170,84)→(30,84)
 */
const INTERIOR = {
  left: "15%",
  top: "11.2%",
  width: "70%",
  height: "22.4%",
} as const;

const FOOD_CLIP = "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)";

type PasteraIsometricBoxProps = {
  children: ReactNode;
  pourOverlay?: ReactNode;
};

/** Boş Pastera kutusu — yemek ağzın içinde, ön duvarın arkasında. */
export function PasteraIsometricBox({ children, pourOverlay }: PasteraIsometricBoxProps) {
  return (
    <div
      className="relative mx-auto w-full"
      style={{ aspectRatio: "4/5" }}
    >
      <div className="absolute bottom-[1%] left-1/2 h-[7%] w-[68%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-lg" />

      {/* Yemek katmanı — SVG ağzının tam altında */}
      <div className="absolute z-10" style={INTERIOR}>
        <div
          className="absolute inset-x-0 bottom-0 overflow-hidden"
          style={{ height: "64%", clipPath: FOOD_CLIP }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #e0d4bc 0%, #cbb896 55%, #b8a480 100%)",
            }}
          />
          <div className="relative h-full w-full">{children}</div>
        </div>

        {pourOverlay ? (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {pourOverlay}
          </div>
        ) : null}
      </div>

      {/* Kutu kabuğu — ağız bölgesi şeffaf, yemek görünür */}
      <svg
        viewBox="0 0 200 250"
        className="relative z-20 h-full w-full drop-shadow-[0_18px_36px_rgba(0,0,0,0.5)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="pastera-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d4a38" />
            <stop offset="100%" stopColor="#1a2e22" />
          </linearGradient>
          <linearGradient id="pastera-side-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a2e22" />
            <stop offset="100%" stopColor="#243d2e" />
          </linearGradient>
          <linearGradient id="pastera-side-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#243d2e" />
            <stop offset="100%" stopColor="#1a2e22" />
          </linearGradient>
        </defs>

        <path d="M12 238 L30 84 L44 46 L6 48 L4 238 Z" fill="url(#pastera-side-l)" />
        <path d="M188 238 L170 84 L156 46 L194 48 L196 238 Z" fill="url(#pastera-side-r)" />
        <path d="M30 84 L170 84 L188 238 L12 238 Z" fill="url(#pastera-front)" />

        {/* Sadece kenar çizgileri — ağız içi doldurulmaz */}
        <path
          d="M44 46 L156 46 L170 84 L30 84 Z"
          fill="none"
          stroke="#3d5c44"
          strokeWidth="1.5"
        />
        <line x1="30" y1="84" x2="170" y2="84" stroke="#4a6e52" strokeWidth="2.5" />
        <line x1="44" y1="46" x2="30" y2="84" stroke="#2a4030" strokeWidth="1.2" opacity="0.7" />
        <line x1="156" y1="46" x2="170" y2="84" stroke="#2a4030" strokeWidth="1.2" opacity="0.7" />

        <circle cx="38" cy="130" r="14" fill="none" stroke="#c49746" strokeWidth="0.6" opacity="0.35" />
        <circle cx="38" cy="130" r="9" fill="none" stroke="#c49746" strokeWidth="0.5" opacity="0.25" />
        <circle cx="162" cy="118" r="11" fill="none" stroke="#c49746" strokeWidth="0.6" opacity="0.3" />
        <circle cx="162" cy="118" r="7" fill="none" stroke="#c49746" strokeWidth="0.5" opacity="0.2" />
        <circle cx="55" cy="195" r="8" fill="none" stroke="#c49746" strokeWidth="0.5" opacity="0.22" />
        <circle cx="145" cy="205" r="10" fill="none" stroke="#c49746" strokeWidth="0.5" opacity="0.25" />

        <path d="M22 108 Q26 102 30 108 Q26 114 22 108" fill="#c49746" opacity="0.45" />
        <path d="M178 100 Q174 94 170 100 Q174 106 178 100" fill="#c49746" opacity="0.4" />
        <path d="M48 218 Q52 212 56 218 Q52 224 48 218" fill="#c49746" opacity="0.3" />

        <g transform="translate(100, 118)" opacity="0.9">
          <rect x="-1.2" y="-10" width="2.4" height="18" rx="0.8" fill="#c49746" />
          <rect x="-4" y="-10" width="1.5" height="7" rx="0.5" fill="#c49746" />
          <rect x="-1.2" y="-10" width="1.5" height="7" rx="0.5" fill="#c49746" />
          <rect x="1.5" y="-10" width="1.5" height="7" rx="0.5" fill="#c49746" />
          <rect x="4" y="-10" width="1.5" height="7" rx="0.5" fill="#c49746" />
          <ellipse cx="5" cy="2" rx="7" ry="5" fill="none" stroke="#c49746" strokeWidth="1.2" />
        </g>

        <text
          x="100"
          y="152"
          textAnchor="middle"
          fill="#c49746"
          fontSize="17"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          letterSpacing="2"
        >
          PASTERA
        </text>
        <text
          x="100"
          y="166"
          textAnchor="middle"
          fill="#c49746"
          fontSize="5.5"
          fontFamily="Arial, sans-serif"
          letterSpacing="1.2"
          opacity="0.85"
        >
          MODERN PASTA KITCHEN
        </text>
        <text
          x="100"
          y="175"
          textAnchor="middle"
          fill="#c49746"
          fontSize="4.5"
          fontFamily="Arial, sans-serif"
          opacity="0.6"
        >
          EST. 2024
        </text>
      </svg>
    </div>
  );
}
