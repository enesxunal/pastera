"use client";

import { useEffect, useId, useState } from "react";
import { BoxFoodSvg } from "./box-food-layers";
import { BOX_MOUTH, BOX_VIEWBOX } from "./box-layout";
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
 * Illustrator SVG — arka katman → yemek → ön (yeşil) katman.
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

  const foodClip = `food-${uid}`;

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
                  `<clipPath id="${foodClip}"><polygon points="${BOX_MOUTH}"/></clipPath>`,
              }}
            />

            {/* 1) Arka — sarı/karton iç */}
            <g id="arka" dangerouslySetInnerHTML={{ __html: prefixSvgIds(parts.arka, uid) }} />

            {/* 2) Yemek — iki katman arasında */}
            <g clipPath={`url(#${foodClip})`}>
              <BoxFoodSvg pastaId={pastaId} layers={layers} pouring={pouring} uid={uid} />
            </g>

            {/* 3) Ön — yeşil yüz + logo */}
            <g id="on" dangerouslySetInnerHTML={{ __html: prefixSvgIds(parts.on, uid) }} />
          </>
        ) : (
          <rect width={BOX_VIEWBOX.w} height={BOX_VIEWBOX.h} fill="#1a2418" opacity={0.3} />
        )}
      </svg>
    </div>
  );
}
