"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { menuPhotoForId } from "@/lib/menu-photo-map";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";
import { scatterForLayers } from "./box-layout";
import { pastaTint, sauceColor } from "./pasta-box-visual";

type Layer = { id: string; image?: string };

function layerPhoto(layer: Layer): string {
  return publicMenuImageSrc(layer.image) || publicMenuImageSrc(menuPhotoForId(layer.id));
}

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

const MOUTH_BOTTOM = 80;
const MOUTH_TOP = 30;

/** Makarna yığını — boş kutunun içini doldurur (grafik). */
export function PastaPileSvg({
  pastaId,
  pouring,
}: {
  pastaId?: string;
  pouring?: boolean;
}) {
  const { noodle, glow } = pastaTint(pastaId);
  const count = 18;

  const strands = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const cy = MOUTH_BOTTOM - 3 - t * (MOUTH_BOTTOM - MOUTH_TOP - 4);
    const rx = 58 - t * 24 + (i % 3) * 2;
    const ry = 4.2 - t * 1.4;
    const rot = -5 + (i % 7) * 2.5;
    const cx = 100 + (i % 5) * 3 - 6;
    return { cx, cy, rx, ry, rot, i };
  });

  return (
    <g>
      <path
        d={`M 36 ${MOUTH_BOTTOM} Q 100 ${MOUTH_TOP + 12} 164 ${MOUTH_BOTTOM} Z`}
        fill={noodle}
        opacity={0.25}
      />
      {strands.map((s) => (
        <motion.ellipse
          key={s.i}
          cx={s.cx}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={s.i % 2 ? noodle : glow}
          transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
          initial={pouring ? { cy: MOUTH_TOP, opacity: 0, rx: s.rx * 0.1 } : false}
          animate={{ cy: s.cy, opacity: 0.95, rx: s.rx }}
          transition={{
            type: "spring",
            stiffness: 210,
            damping: 16,
            delay: pouring ? s.i * 0.03 : 0,
          }}
        />
      ))}
    </g>
  );
}

/** Sos + topping — makarnanın üstünde, dağınık. */
export function BoxFoodOverlay({
  layers,
  pouring,
}: {
  layers: Layer[];
  pouring: Pouring;
}) {
  const sauces = layers.filter((l) => l.id.startsWith("s-"));
  const toppings = layers.filter((l) => l.id.startsWith("t-"));
  const spots = scatterForLayers([
    ...sauces.map((s) => s.id),
    ...toppings.map((t) => t.id),
  ]);

  return (
    <>
      {sauces.map((layer, i) => (
        <SauceSpot
          key={layer.id}
          layer={layer}
          spot={spots[i]}
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}
      {toppings.map((layer, i) => (
        <ToppingSpot
          key={layer.id}
          layer={layer}
          spot={spots[sauces.length + i]}
          pouring={pouring?.kind === "topping" && pouring.id === layer.id}
        />
      ))}
    </>
  );
}

function SauceSpot({
  layer,
  spot,
  pouring,
}: {
  layer: Layer;
  spot: { left: number; top: number; rot: number; scale: number };
  pouring?: boolean;
}) {
  const color = sauceColor(layer.id);

  return (
    <motion.div
      className="absolute rounded-[50%]"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: "22%",
        height: "18%",
        transform: `translate(-50%, -50%) rotate(${spot.rot}deg) scale(${spot.scale})`,
        backgroundColor: color,
        opacity: 0.82,
        boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.2)",
      }}
      initial={pouring ? { scale: 0, opacity: 0 } : { scale: 0.5, opacity: 0 }}
      animate={{ scale: spot.scale, opacity: 0.82 }}
      transition={{ type: "spring", stiffness: 220, damping: 17 }}
    />
  );
}

function ToppingSpot({
  layer,
  spot,
  pouring,
}: {
  layer: Layer;
  spot: { left: number; top: number; rot: number; scale: number };
  pouring?: boolean;
}) {
  const photo = layerPhoto(layer);

  return (
    <motion.div
      className="absolute overflow-hidden rounded-md border border-white/25 shadow-sm"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: "18%",
        height: "18%",
        transform: `translate(-50%, -50%) rotate(${spot.rot}deg)`,
      }}
      initial={pouring ? { y: -30, opacity: 0, scale: 0.15 } : false}
      animate={{ y: 0, opacity: 1, scale: spot.scale }}
      transition={{ type: "spring", stiffness: 280, damping: 15 }}
    >
      {photo ? (
        <Image src={photo} alt="" fill className="object-cover" sizes="48px" unoptimized />
      ) : (
        <div className="h-full w-full bg-[#9a7048]" />
      )}
    </motion.div>
  );
}
