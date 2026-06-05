"use client";

import Image from "next/image";
import { BoxFoodOverlay, PastaChangeFlash } from "./box-food-layers";
import { BOX_OPENING, pastaBoxFilter, pastaBoxPhoto } from "./box-layout";

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
 * Önizleme = menüdeki gerçek kutu fotoğrafı (soldaki kartlarla aynı).
 * Sos/topping fotoğrafları ağzın içinde farklı noktalara bindirilir.
 */
export function PasteraIsometricBox({ pastaId, layers, pouring }: PasteraIsometricBoxProps) {
  const src = pastaBoxPhoto(pastaId);
  const filter = pastaBoxFilter(pastaId);

  return (
    <div className="relative mx-auto w-full aspect-square max-w-[280px]">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)]"
          style={filter ? { filter } : undefined}
          sizes="(max-width: 768px) 280px, 280px"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 rounded-xl bg-[#1c3024]" />
      )}

      <div
        className="pointer-events-none absolute overflow-hidden"
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

      <PastaChangeFlash active={pouring?.kind === "pasta"} />
    </div>
  );
}
