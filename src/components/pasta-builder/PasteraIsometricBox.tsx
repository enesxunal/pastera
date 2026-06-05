"use client";

import { useId } from "react";
import { BoxFoodSvg } from "./box-food-layers";

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

/** Ağız poligonu — viewBox 200×250 */
export const BOX_MOUTH = "50,38 150,38 168,98 32,98";

type PasteraIsometricBoxProps = {
  pastaId?: string;
  layers: { id: string }[];
  pouring: Pouring;
};

/** Yeşil Pastera kutusu — sade, logo; süs yok. */
export function PasteraIsometricBox({ pastaId, layers, pouring }: PasteraIsometricBoxProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto w-full" style={{ aspectRatio: "200/250" }}>
      <svg
        viewBox="0 0 200 250"
        className="h-full w-full drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]"
        aria-hidden
      >
        <defs>
          <clipPath id={`mouth-${uid}`}>
            <polygon points={BOX_MOUTH} />
          </clipPath>
          <linearGradient id={`green-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d4a38" />
            <stop offset="100%" stopColor="#1c3024" />
          </linearGradient>
          <linearGradient id={`green-side-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#182820" />
            <stop offset="100%" stopColor="#264032" />
          </linearGradient>
          <linearGradient id={`kraft-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8dcc8" />
            <stop offset="100%" stopColor="#c4b092" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="246" rx="70" ry="6" fill="rgba(0,0,0,0.3)" />

        <path d="M6 246 L32 98 L50 40 L2 42 L0 246 Z" fill={`url(#green-side-${uid})`} />
        <path d="M194 246 L168 98 L150 40 L198 42 L200 246 Z" fill={`url(#green-side-${uid})`} />

        <g clipPath={`url(#mouth-${uid})`}>
          <polygon points={BOX_MOUTH} fill={`url(#kraft-${uid})`} />
          <BoxFoodSvg pastaId={pastaId} layers={layers} pouring={pouring} />
        </g>

        <path d="M32 98 L168 98 L194 246 L6 246 Z" fill={`url(#green-${uid})`} />

        <polygon points={BOX_MOUTH} fill="none" stroke="#3a5a42" strokeWidth="1.2" />
        <line x1="32" y1="98" x2="168" y2="98" stroke="#456550" strokeWidth="2" />

        <text
          x="100"
          y="158"
          textAnchor="middle"
          fill="#c49746"
          fontSize="18"
          fontFamily="Georgia, serif"
          fontWeight="bold"
          letterSpacing="2"
        >
          PASTERA
        </text>
        <text
          x="100"
          y="172"
          textAnchor="middle"
          fill="#c49746"
          fontSize="5.5"
          fontFamily="Arial, sans-serif"
          letterSpacing="1"
          opacity="0.85"
        >
          MODERN PASTA KITCHEN
        </text>
      </svg>
    </div>
  );
}
