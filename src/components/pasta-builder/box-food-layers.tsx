"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { menuPhotoForId } from "@/lib/menu-photo-map";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";
import { scatterForLayers } from "./box-layout";
import { sauceColor } from "./pasta-box-visual";

type Layer = { id: string; image?: string };

function layerPhoto(layer: Layer): string {
  return publicMenuImageSrc(layer.image) || publicMenuImageSrc(menuPhotoForId(layer.id));
}

const EASE = [0.22, 1, 0.36, 1] as const;

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

/** Sos + topping — menü fotoğrafının ağzına bindirilir. */
export function BoxFoodOverlay({
  layers,
  pouring,
}: {
  layers: Layer[];
  pouring: Pouring;
}) {
  const sauces = layers.filter((l) => l.id.startsWith("s-"));
  const toppings = layers.filter((l) => l.id.startsWith("t-"));
  const allIds = [...sauces.map((s) => s.id), ...toppings.map((t) => t.id)];
  const spots = scatterForLayers(allIds);

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
  const photo = layerPhoto(layer);

  return (
    <motion.div
      className="absolute overflow-hidden rounded-[50%] shadow-inner"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: "38%",
        height: "32%",
        transform: `translate(-50%, -50%) rotate(${spot.rot}deg) scale(${spot.scale})`,
        backgroundColor: color,
        opacity: 0.72,
        mixBlendMode: "multiply",
      }}
      initial={pouring ? { scale: 0, opacity: 0 } : { scale: 0.6, opacity: 0 }}
      animate={{ scale: spot.scale, opacity: 0.72 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      {photo ? (
        <Image src={photo} alt="" fill className="object-cover opacity-50 mix-blend-overlay" sizes="80px" unoptimized />
      ) : null}
    </motion.div>
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
      className="absolute overflow-hidden rounded-lg border border-white/20 shadow-md"
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: "22%",
        height: "22%",
        transform: `translate(-50%, -50%) rotate(${spot.rot}deg)`,
      }}
      initial={pouring ? { y: -40, opacity: 0, scale: 0.2 } : false}
      animate={{ y: 0, opacity: 1, scale: spot.scale }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
    >
      {photo ? (
        <Image src={photo} alt="" fill className="object-cover" sizes="64px" unoptimized />
      ) : (
        <div className="h-full w-full bg-[#9a7048]" />
      )}
    </motion.div>
  );
}

/** Makarna değişince kısa parlama. */
export function PastaChangeFlash({ active }: { active?: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-lg bg-white/15"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    />
  );
}
