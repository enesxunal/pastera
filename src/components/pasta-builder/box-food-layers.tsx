"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { pastaPhotoForBox, saucePhotoForBox, toppingPhotoForBox } from "./box-photo-map";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

function pastaFilter(pastaId?: string): string | undefined {
  if (pastaId === "noodle-black") return "brightness(0.35) contrast(1.1)";
  if (pastaId === "noodle-vegan") return "hue-rotate(-18deg) saturate(0.9)";
  if (pastaId === "noodle-chocolate") return "sepia(0.55) brightness(0.75)";
  return undefined;
}

/** Kalın fettuccine — gerçek ürün fotoğrafı + üstten dökülme. */
export function PastaFill({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const src = pastaPhotoForBox(pastaId);
  const { noodle, glow } = pastaTint(pastaId);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={pouring ? { y: "-110%", opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18, duration: 0.7 }}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            style={{
              objectPosition: "50% 38%",
              transform: "scale(1.65)",
              filter: pastaFilter(pastaId),
            }}
            sizes="200px"
            unoptimized
          />
        ) : (
          <FettuccineSvg noodle={noodle} glow={glow} pouring={pouring} />
        )}
      </motion.div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }}
      />
    </div>
  );
}

function FettuccineSvg({
  noodle,
  glow,
  pouring,
}: {
  noodle: string;
  glow: string;
  pouring?: boolean;
}) {
  const bands = Array.from({ length: 10 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {bands.map((i) => (
        <motion.ellipse
          key={i}
          cx={30 + (i % 5) * 35}
          cy={55 + (i % 3) * 8}
          rx={28}
          ry={7 + (i % 2)}
          fill={i % 2 ? noodle : glow}
          opacity={0.92}
          initial={pouring ? { cy: -20, opacity: 0 } : false}
          animate={{ cy: 55 + (i % 3) * 8, opacity: 0.92 }}
          transition={{ delay: pouring ? i * 0.04 : 0, type: "spring", stiffness: 200, damping: 16 }}
        />
      ))}
    </svg>
  );
}

/** Sos — sıvı + varsa gerçek sos fotoğrafı. */
export function SauceFill({
  id,
  index,
  pouring,
  image,
}: {
  id: string;
  index: number;
  pouring?: boolean;
  image?: string;
}) {
  const color = sauceColor(id);
  const photo = saucePhotoForBox(id) || image;
  const base = 30 + index * 12;

  return (
    <motion.div
      className="absolute inset-x-[4%] overflow-hidden"
      style={{
        bottom: `${6 + index * 8}%`,
        height: `${base}%`,
        transformOrigin: "bottom center",
        borderRadius: "45% 45% 40% 40%",
        boxShadow: "inset 0 -5px 12px rgba(0,0,0,0.28)",
      }}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.2, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.92 - index * 0.05 }}
      transition={{ type: "spring", stiffness: 180, damping: 20, delay: pouring ? 0.15 : index * 0.07 }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: color }} />
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          className="object-cover mix-blend-multiply"
          style={{ objectPosition: "center", opacity: 0.75, transform: "scale(1.4)" }}
          sizes="120px"
          unoptimized
        />
      ) : null}
      <div
        className="absolute inset-x-0 top-0 h-[28%]"
        style={{
          background: `linear-gradient(to bottom, ${color}cc, transparent)`,
          borderRadius: "50% 50% 0 0",
        }}
      />
    </motion.div>
  );
}

function PieceShape({ type, variant }: { type: ReturnType<typeof toppingPieceType>; variant: number }) {
  const s = variant % 4;
  if (type === "meat") {
    return (
      <svg viewBox="0 0 28 14" className="h-full w-full drop-shadow-sm" aria-hidden>
        <rect x="1" y="4" width="26" height="7" rx="2.5" fill={s % 2 ? "#c8864a" : "#a86a38"} />
        <rect x="4" y="5" width="8" height="2" rx="1" fill="#e8b878" opacity="0.5" />
      </svg>
    );
  }
  if (type === "shrimp") {
    return (
      <svg viewBox="0 0 28 14" className="h-full w-full drop-shadow-sm" aria-hidden>
        <path d="M3 9 Q14 2 25 9" fill="none" stroke="#e8907a" strokeWidth="5" strokeLinecap="round" />
        <circle cx="24" cy="8" r="1.5" fill="#333" />
      </svg>
    );
  }
  if (type === "olive") {
    return (
      <svg viewBox="0 0 14 18" className="h-full w-full drop-shadow-sm" aria-hidden>
        <ellipse cx="7" cy="10" rx="5.5" ry="7" fill={s % 2 ? "#1a1a1a" : "#4a6830"} />
        <ellipse cx="5" cy="8" rx="2" ry="3" fill="rgba(255,255,255,0.12)" />
        <circle cx="7" cy="6" r="1" fill="#c49746" />
      </svg>
    );
  }
  if (type === "corn") {
    return (
      <svg viewBox="0 0 12 18" className="h-full w-full drop-shadow-sm" aria-hidden>
        <ellipse cx="6" cy="9" rx="4.5" ry="8" fill="#f0d040" />
        <path d="M4 3v12M6 2v14M8 3v12" stroke="#c8a020" strokeWidth="0.7" />
      </svg>
    );
  }
  if (type === "mushroom") {
    return (
      <svg viewBox="0 0 20 16" className="h-full w-full drop-shadow-sm" aria-hidden>
        <ellipse cx="10" cy="6" rx="9" ry="5" fill="#b89870" />
        <ellipse cx="8" cy="5" rx="3" ry="2" fill="#d4b890" opacity="0.4" />
        <rect x="8" y="6" width="4" height="8" rx="1" fill="#ddd0b8" />
      </svg>
    );
  }
  if (type === "green") {
    return (
      <svg viewBox="0 0 22 14" className="h-full w-full drop-shadow-sm" aria-hidden>
        <path d="M3 12 Q11 2 19 12" fill="#3d8c38" />
        <path d="M11 2 Q9 8 11 12 Q13 8 11 2" fill="#2d7030" />
      </svg>
    );
  }
  if (type === "cheese") {
    return (
      <svg viewBox="0 0 18 14" className="h-full w-full drop-shadow-sm" aria-hidden>
        <path d="M2 12 L9 2 L16 12 Z" fill="#f5f5ec" stroke="#d0d0c8" />
        <circle cx="8" cy="9" r="1.2" fill="#a8b0b8" />
      </svg>
    );
  }
  if (type === "fruit") {
    return (
      <svg viewBox="0 0 16 16" className="h-full w-full drop-shadow-sm" aria-hidden>
        <circle cx="8" cy="9" r="6" fill={s % 2 ? "#d83848" : "#f0c838" } />
        <circle cx="6" cy="7" r="2" fill="rgba(255,255,255,0.2)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 18 12" className="h-full w-full drop-shadow-sm" aria-hidden>
      <rect x="2" y="3" width="14" height="6" rx="2" fill="#9a7048" />
    </svg>
  );
}

const PIECE_OFFSETS = [
  { left: 12, top: 4, rot: -14, scale: 1 },
  { left: 42, top: 2, rot: 10, scale: 0.95 },
  { left: 28, top: 16, rot: -6, scale: 1.05 },
  { left: 55, top: 12, rot: 18, scale: 0.9 },
];

export function ToppingPieces({
  layerId,
  globalIndex,
  pouring,
  image,
}: {
  layerId: string;
  globalIndex: number;
  pouring?: boolean;
  image?: string;
}) {
  const type = toppingPieceType(layerId);
  const photo = toppingPhotoForBox(layerId, image);

  return (
    <>
      {PIECE_OFFSETS.map((off, i) => (
        <motion.div
          key={`${layerId}-${i}`}
          className="absolute z-20 overflow-hidden rounded-md shadow-md"
          style={{
            left: `${off.left + (i % 2) * 3}%`,
            top: `${off.top}%`,
            width: photo ? 26 : type === "olive" ? 16 : 24,
            height: photo ? 26 : type === "olive" ? 20 : 16,
            transform: `rotate(${off.rot}deg) scale(${off.scale})`,
          }}
          initial={pouring ? { y: -120, opacity: 0, scale: 0.2 } : false}
          animate={{ y: 0, opacity: 1, scale: off.scale }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 14,
            delay: pouring ? i * 0.09 : 0,
          }}
        >
          {photo ? (
            <Image
              src={photo}
              alt=""
              fill
              className="object-cover"
              style={{ transform: "scale(1.8)", objectPosition: "center" }}
              sizes="40px"
              unoptimized
            />
          ) : (
            <PieceShape type={type} variant={globalIndex + i} />
          )}
        </motion.div>
      ))}
    </>
  );
}

export function SaucePourStream({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
      style={{ top: "-20%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 16,
          background: `linear-gradient(to bottom, ${color}ee, ${color}99)`,
          borderRadius: 10,
          boxShadow: `0 0 20px ${color}99`,
        }}
        initial={{ height: 0 }}
        animate={{ height: [0, 90, 90, 0] }}
        transition={{ duration: 1.1, times: [0, 0.32, 0.68, 1] }}
      />
      <motion.div
        className="mx-auto rounded-full"
        style={{ width: 42, height: 12, backgroundColor: color, marginTop: -6 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.6] }}
        transition={{ duration: 1, delay: 0.25 }}
      />
    </motion.div>
  );
}

export function PastaPourStream({ pastaId }: { pastaId?: string }) {
  const src = pastaPhotoForBox(pastaId);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
      style={{ top: "-28%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative h-16 w-20 overflow-hidden rounded-lg"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: [ -30, 10, 0 ], opacity: [0, 1, 0] }}
        transition={{ duration: 0.8 }}
      >
        {src ? (
          <Image src={src} alt="" fill className="object-cover" style={{ transform: "scale(2)", objectPosition: "50% 40%" }} unoptimized />
        ) : null}
      </motion.div>
    </motion.div>
  );
}
