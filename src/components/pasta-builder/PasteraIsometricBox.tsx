"use client";

import { useEffect, useId, useState } from "react";
import { BoxFoodSvg } from "./box-food-layers";
import { BOX_VIEWBOX, KRAFT_INTERIOR, KRAFT_MOUND_CAP } from "./box-layout";
import { loadKutuSvg, prefixSvgIds, type KutuSvgParts } from "./box-kutu-svg";

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

/**
 * Illustrator SVG — arka → karton → yemek (üstte clip yok) → ön yüz.
 */
export function PasteraIsometricBox({ pastaId, layers, pouring }: PasteraIsometricBoxProps) {
  const uid = useId().replace(/:/g, "");
  const [parts, setParts] = useState<KutuSvgParts | null>(null);

  useEffect(() => {
    let alive = true;
    loadKutuSvg()
      .then((p) => {
        if (alive) setParts(p);
      })
      .catch(() => {
        if (alive) setParts({ defs: "", arka: "", on: "" });
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      className="relative mx-auto w-full max-w-[320px]"
      style={{ aspectRatio: `${BOX_VIEWBOX.w}/${BOX_VIEWBOX.h}` }}
    >
      <svg
        viewBox={`0 0 ${BOX_VIEWBOX.w} ${BOX_VIEWBOX.h}`}
        className="h-full w-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.4)]"
        aria-hidden
      >
        {parts ? (
          <>
            <defs
              dangerouslySetInnerHTML={{
                __html:
                  prefixSvgIds(parts.defs, uid) +
                  `<linearGradient id="kraft-fill-${uid}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ece0cc"/>
                    <stop offset="100%" stop-color="#c8b898"/>
                  </linearGradient>`,
              }}
            />

            <g id="arka" dangerouslySetInnerHTML={{ __html: prefixSvgIds(parts.arka, uid) }} />

            <path d={KRAFT_INTERIOR} fill={`url(#kraft-fill-${uid})`} opacity={0.92} />
            <path d={KRAFT_MOUND_CAP} fill={`url(#kraft-fill-${uid})`} />

            <BoxFoodSvg pastaId={pastaId} layers={layers} pouring={pouring} uid={uid} />

            <g id="on" dangerouslySetInnerHTML={{ __html: prefixSvgIds(parts.on, uid) }} />
          </>
        ) : (
          <rect width={BOX_VIEWBOX.w} height={BOX_VIEWBOX.h} fill="#1a2418" opacity={0.3} />
        )}
      </svg>
    </div>
  );
}
