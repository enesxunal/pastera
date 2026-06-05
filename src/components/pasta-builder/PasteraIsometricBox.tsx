"use client";

import { useId, type ReactNode } from "react";

type PasteraIsometricBoxProps = {
  children: ReactNode;
  pourOverlay?: ReactNode;
};

/**
 * Tek SVG — yemek foreignObject ile ağzın (44,46)-(156,46)-(170,84)-(30,84) tam içinde.
 * Ön duvar yemekten sonra çizilir → malzeme kutunun içinde kalır.
 */
export function PasteraIsometricBox({ children, pourOverlay }: PasteraIsometricBoxProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto w-full" style={{ aspectRatio: "200/250" }}>
      <svg
        viewBox="0 0 200 250"
        className="h-full w-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
        aria-hidden
      >
        <defs>
          <clipPath id={`mouth-${uid}`}>
            <polygon points="44,46 156,46 170,84 30,84" />
          </clipPath>
          <linearGradient id={`front-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f4d3a" />
            <stop offset="100%" stopColor="#1a2e22" />
          </linearGradient>
          <linearGradient id={`sideL-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#162418" />
            <stop offset="100%" stopColor="#243d2e" />
          </linearGradient>
          <linearGradient id={`sideR-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#243d2e" />
            <stop offset="100%" stopColor="#162418" />
          </linearGradient>
          <linearGradient id={`inner-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ddd0b8" />
            <stop offset="100%" stopColor="#b8a480" />
          </linearGradient>
        </defs>

        {/* Gölge */}
        <ellipse cx="100" cy="244" rx="72" ry="7" fill="rgba(0,0,0,0.35)" />

        {/* Yan paneller (arkada) */}
        <path d="M10 240 L28 86 L44 48 L4 50 L2 240 Z" fill={`url(#sideL-${uid})`} />
        <path d="M190 240 L172 86 L156 48 L196 50 L198 240 Z" fill={`url(#sideR-${uid})`} />

        {/* Yemek — sadece ağız poligonu içinde */}
        <g clipPath={`url(#mouth-${uid})`}>
          <polygon points="44,46 156,46 170,84 30,84" fill={`url(#inner-${uid})`} />
          <foreignObject x="30" y="46" width="140" height="38">
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                transform: "perspective(90px) rotateX(52deg)",
                transformOrigin: "50% 100%",
              }}
            >
              {pourOverlay}
              {children}
            </div>
          </foreignObject>
        </g>

        {/* Ön duvar — yemeğin üstünü kapatır */}
        <path d="M30 84 L170 84 L190 240 L10 240 Z" fill={`url(#front-${uid})`} />

        {/* Ağız kenarları */}
        <polygon
          points="44,46 156,46 170,84 30,84"
          fill="none"
          stroke="#3d5c44"
          strokeWidth="1.5"
        />
        <line x1="30" y1="84" x2="170" y2="84" stroke="#4a7054" strokeWidth="2.5" />
        <line x1="44" y1="46" x2="30" y2="84" stroke="#2a4030" strokeWidth="1" opacity="0.6" />
        <line x1="156" y1="46" x2="170" y2="84" stroke="#2a4030" strokeWidth="1" opacity="0.6" />

        {/* Süslemeler */}
        <circle cx="36" cy="128" r="13" fill="none" stroke="#c49746" strokeWidth="0.6" opacity="0.3" />
        <circle cx="164" cy="116" r="10" fill="none" stroke="#c49746" strokeWidth="0.5" opacity="0.25" />
        <circle cx="52" cy="198" r="7" fill="none" stroke="#c49746" strokeWidth="0.5" opacity="0.2" />

        <g transform="translate(100, 116)" opacity="0.88">
          <rect x="-1" y="-9" width="2" height="16" rx="0.6" fill="#c49746" />
          <rect x="-3.5" y="-9" width="1.2" height="6" rx="0.4" fill="#c49746" />
          <rect x="2.3" y="-9" width="1.2" height="6" rx="0.4" fill="#c49746" />
          <ellipse cx="4" cy="1" rx="6" ry="4" fill="none" stroke="#c49746" strokeWidth="1" />
        </g>

        <text
          x="100"
          y="150"
          textAnchor="middle"
          fill="#c49746"
          fontSize="16"
          fontFamily="Georgia, serif"
          fontWeight="bold"
          letterSpacing="1.5"
        >
          PASTERA
        </text>
        <text
          x="100"
          y="163"
          textAnchor="middle"
          fill="#c49746"
          fontSize="5"
          fontFamily="Arial, sans-serif"
          letterSpacing="1"
          opacity="0.8"
        >
          MODERN PASTA KITCHEN
        </text>
        <text x="100" y="171" textAnchor="middle" fill="#c49746" fontSize="4" opacity="0.55">
          EST. 2024
        </text>
      </svg>
    </div>
  );
}
