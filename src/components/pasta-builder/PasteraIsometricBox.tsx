"use client";

import { useId } from "react";
import { BOX_MOUTH_SVG, BOX_OPENING } from "./box-layout";
import { BoxFoodOverlay, PastaPileSvg } from "./box-food-layers";

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

type PasteraIsometricBoxProps = {
  pastaId?: string;
  layers: { id: string; image?: string }[];
  pouring: Pouring;
};

/** Boş grafik kutu — fotoğraf yok; makarna çizim, sos/topping üstte. */
export function PasteraIsometricBox({ pastaId, layers, pouring }: PasteraIsometricBoxProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto w-full max-w-[280px]" style={{ aspectRatio: "200/250" }}>
      {/* Arka: yanlar + makarna */}
      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <clipPath id={`mouth-${uid}`}>
            <polygon points={BOX_MOUTH_SVG} />
          </clipPath>
          <linearGradient id={`side-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#17241c" />
            <stop offset="100%" stopColor="#2a4534" />
          </linearGradient>
          <linearGradient id={`kraft-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6d9c4" />
            <stop offset="100%" stopColor="#b8a480" />
          </linearGradient>
        </defs>

        <path d="M6 248 L28 84 L52 30 L2 32 L0 248 Z" fill={`url(#side-${uid})`} />
        <path d="M194 248 L172 84 L148 30 L198 32 L200 248 Z" fill={`url(#side-${uid})`} />

        <g clipPath={`url(#mouth-${uid})`}>
          <polygon points={BOX_MOUTH_SVG} fill={`url(#kraft-${uid})`} />
          <PastaPileSvg pastaId={pastaId} pouring={pouring?.kind === "pasta"} />
        </g>
      </svg>

      {/* Orta: sos + topping (ön duvarın arkasında) */}
      <div
        className="pointer-events-none absolute z-[1] overflow-hidden"
        style={{
          left: BOX_OPENING.left,
          top: BOX_OPENING.top,
          width: BOX_OPENING.width,
          height: BOX_OPENING.height,
          clipPath: BOX_OPENING.clipPath,
        }}
      >
        <BoxFoodOverlay layers={layers} pouring={pouring} />
      </div>

      {/* Ön: yeşil yüz + logo */}
      <svg
        viewBox="0 0 200 250"
        className="absolute inset-0 z-[2] h-full w-full drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]"
        aria-hidden
      >
        <defs>
          <linearGradient id={`front-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f4d3a" />
            <stop offset="100%" stopColor="#1a2e22" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="246" rx="68" ry="6" fill="rgba(0,0,0,0.28)" />
        <path d="M28 82 L172 82 L194 248 L6 248 Z" fill={`url(#front-${uid})`} />
        <polygon points={BOX_MOUTH_SVG} fill="none" stroke="#3d5c44" strokeWidth="1.2" />
        <line x1="28" y1="82" x2="172" y2="82" stroke="#4a7054" strokeWidth="2" />

        <text
          x="100"
          y="148"
          textAnchor="middle"
          fill="#c49746"
          fontSize="17"
          fontFamily="Georgia, serif"
          fontWeight="bold"
          letterSpacing="1.8"
        >
          PASTERA
        </text>
        <text
          x="100"
          y="162"
          textAnchor="middle"
          fill="#c49746"
          fontSize="5.5"
          fontFamily="Arial, sans-serif"
          letterSpacing="0.8"
          opacity="0.85"
        >
          MODERN PASTA KITCHEN
        </text>
      </svg>
    </div>
  );
}
