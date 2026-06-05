"use client";

import { motion } from "framer-motion";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Makarna yığını — kutunun dibinde, ağızın içinde. */
export function PastaFill({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const { noodle, glow } = pastaTint(pastaId);
  const strands = [
    { left: 4, bottom: 2, w: 82, rot: -10, h: 10 },
    { left: 14, bottom: 8, w: 78, rot: -6, h: 10 },
    { left: 2, bottom: 14, w: 85, rot: -14, h: 9 },
    { left: 22, bottom: 19, w: 72, rot: -4, h: 10 },
    { left: 8, bottom: 24, w: 80, rot: -11, h: 9 },
    { left: 30, bottom: 29, w: 68, rot: -2, h: 10 },
    { left: 5, bottom: 34, w: 78, rot: -8, h: 9 },
    { left: 18, bottom: 39, w: 74, rot: -5, h: 9 },
    { left: 35, bottom: 44, w: 60, rot: 3, h: 8 },
    { left: 10, bottom: 48, w: 70, rot: -7, h: 8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {strands.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: `${s.bottom}%`,
            width: `${s.w}%`,
            height: `${s.h}%`,
            background: `linear-gradient(180deg, ${glow} 0%, ${noodle} 50%, ${glow} 100%)`,
            boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "left center",
          }}
          initial={pouring ? { y: -28, opacity: 0, scaleX: 0.2 } : false}
          animate={{ y: 0, opacity: 1, scaleX: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 16,
            delay: pouring ? i * 0.04 : 0,
          }}
        />
      ))}
    </div>
  );
}

function SauceWaveSvg({ color, id }: { color: string; id: string }) {
  return (
    <svg
      viewBox="0 0 200 30"
      className="absolute inset-x-0 top-0 h-[40%] w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M0,22 C45,6 95,28 145,12 S200,24 200,18 L200,30 L0,30 Z"
        fill={color}
      />
      <rect x="0" y="0" width="200" height="30" fill={`url(#sg-${id})`} />
    </svg>
  );
}

/** Sos — kutunun dibinden yukarı dolar. */
export function SauceFill({
  id,
  index,
  pouring,
}: {
  id: string;
  index: number;
  pouring?: boolean;
}) {
  const color = sauceColor(id);
  const height = 22 + index * 8;

  return (
    <motion.div
      className="absolute inset-x-[6%] overflow-hidden"
      style={{
        bottom: `${3 + index * 5}%`,
        height: `${height}%`,
        transformOrigin: "bottom center",
        borderRadius: "40% 40% 35% 35%",
        backgroundColor: color,
        boxShadow: "inset 0 -3px 8px rgba(0,0,0,0.28)",
      }}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.1, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.88 - index * 0.04 }}
      transition={{
        type: "spring",
        stiffness: 170,
        damping: 18,
        delay: pouring ? 0.18 : index * 0.05,
      }}
    >
      <SauceWaveSvg color={color} id={`${id}-${index}`} />
    </motion.div>
  );
}

function PieceShape({ type, variant }: { type: ReturnType<typeof toppingPieceType>; variant: number }) {
  const s = variant % 4;
  const uid = `p-${type}-${variant}`;

  if (type === "meat") {
    return (
      <svg viewBox="0 0 32 16" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8b070" />
            <stop offset="100%" stopColor="#a86a38" />
          </linearGradient>
        </defs>
        <rect x="2" y="4" width="28" height="8" rx="3" fill={`url(#${uid})`} transform={`rotate(${-6 + s * 4} 16 8)`} />
      </svg>
    );
  }
  if (type === "shrimp") {
    return (
      <svg viewBox="0 0 32 16" className="h-full w-full" aria-hidden>
        <path d="M4 10 Q16 2 28 10" fill="none" stroke="#f0a090" strokeWidth="5" strokeLinecap="round" />
        <circle cx="27" cy="9" r="1.5" fill="#2a2a2a" />
      </svg>
    );
  }
  if (type === "olive") {
    const dark = s % 2 === 0;
    return (
      <svg viewBox="0 0 16 22" className="h-full w-full" aria-hidden>
        <ellipse cx="8" cy="12" rx="6" ry="9" fill={dark ? "#1e1e1e" : "#4d6e32"} />
        <circle cx="8" cy="7" r="1.2" fill="#c49746" />
      </svg>
    );
  }
  if (type === "corn") {
    return (
      <svg viewBox="0 0 14 22" className="h-full w-full" aria-hidden>
        <ellipse cx="7" cy="11" rx="5" ry="10" fill="#f2d848" />
        <line x1="5" y1="4" x2="5" y2="18" stroke="#c8a018" strokeWidth="0.7" />
        <line x1="9" y1="4" x2="9" y2="18" stroke="#c8a018" strokeWidth="0.7" />
      </svg>
    );
  }
  if (type === "mushroom") {
    return (
      <svg viewBox="0 0 22 18" className="h-full w-full" aria-hidden>
        <ellipse cx="11" cy="7" rx="10" ry="5.5" fill="#b09068" />
        <rect x="9" y="7" width="4" height="9" rx="1.5" fill="#e8dcc8" />
      </svg>
    );
  }
  if (type === "green") {
    return (
      <svg viewBox="0 0 24 16" className="h-full w-full" aria-hidden>
        <path d="M4 14 Q12 1 20 14 Z" fill="#3d9038" />
        <path d="M12 2 Q10 9 12 14 Q14 9 12 2" fill="#2d7028" opacity="0.7" />
      </svg>
    );
  }
  if (type === "cheese") {
    return (
      <svg viewBox="0 0 20 16" className="h-full w-full" aria-hidden>
        <path d="M2 14 L10 2 L18 14 Z" fill="#f8f8f0" stroke="#d8d8d0" strokeWidth="0.8" />
        <circle cx="9" cy="10" r="1.2" fill="#98a0a8" />
      </svg>
    );
  }
  if (type === "fruit") {
    return (
      <svg viewBox="0 0 18 18" className="h-full w-full" aria-hidden>
        <circle cx="9" cy="10" r="7" fill={s % 2 ? "#e03850" : "#f0c838"} />
        <circle cx="6.5" cy="8" r="2" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 14" className="h-full w-full" aria-hidden>
      <rect x="3" y="4" width="14" height="7" rx="2.5" fill="#9a7048" />
    </svg>
  );
}

const PIECE_OFFSETS = [
  { left: 10, bottom: 38, rot: -14, scale: 1 },
  { left: 38, bottom: 42, rot: 10, scale: 0.9 },
  { left: 24, bottom: 34, rot: -6, scale: 1 },
  { left: 52, bottom: 36, rot: 16, scale: 0.85 },
];

/** Topping parçaları — makarna yığınının üstünde, kutu içinde. */
export function ToppingPieces({
  layerId,
  globalIndex,
  pouring,
}: {
  layerId: string;
  globalIndex: number;
  pouring?: boolean;
}) {
  const type = toppingPieceType(layerId);
  const size =
    type === "olive"
      ? { w: "14%", h: "28%" }
      : type === "corn"
        ? { w: "12%", h: "30%" }
        : { w: "22%", h: "22%" };

  return (
    <>
      {PIECE_OFFSETS.map((off, i) => (
        <motion.div
          key={`${layerId}-${i}`}
          className="absolute z-20"
          style={{
            left: `${off.left + (i % 2) * 3}%`,
            bottom: `${off.bottom}%`,
            width: size.w,
            height: size.h,
          }}
          initial={
            pouring
              ? { y: -36, opacity: 0, rotate: off.rot - 25, scale: 0.1 }
              : { rotate: off.rot, scale: off.scale }
          }
          animate={{ y: 0, opacity: 1, rotate: off.rot, scale: off.scale }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 14,
            delay: pouring ? i * 0.09 : 0,
          }}
        >
          <PieceShape type={type} variant={globalIndex + i} />
        </motion.div>
      ))}
    </>
  );
}

/** Kutunun ağzından içeri akan sos. */
export function SaucePourStream({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[8%] z-30 flex -translate-x-1/2 flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 8,
          background: `linear-gradient(to bottom, ${color}, ${color}bb)`,
          borderRadius: 4,
        }}
        initial={{ height: 0 }}
        animate={{ height: [0, 42, 42, 0] }}
        transition={{ duration: 0.95, times: [0, 0.32, 0.65, 1], ease: EASE }}
      />
      <motion.div
        className="rounded-full"
        style={{ width: 22, height: 6, backgroundColor: color, marginTop: -3 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.5] }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </motion.div>
  );
}

/** Kutunun ağzından içeri düşen makarna. */
export function PastaPourStream({ pastaId }: { pastaId?: string }) {
  const { noodle, glow } = pastaTint(pastaId);
  const drops = [0, 1, 2, 3, 4];

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[5%] z-30 w-[70%] -translate-x-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {drops.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + i * 16}%`,
            width: `${28 + (i % 2) * 8}%`,
            height: "12%",
            background: `linear-gradient(90deg, ${glow}, ${noodle})`,
            transform: `rotate(${-12 + i * 4}deg)`,
          }}
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: [-18, 14, 22], opacity: [0, 1, 0] }}
          transition={{ duration: 0.65, delay: i * 0.06, ease: EASE }}
        />
      ))}
    </motion.div>
  );
}

/** Topping kutunun ağzından düşer. */
export function ToppingPourStream({ layerId }: { layerId: string }) {
  const type = toppingPieceType(layerId);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[10%] z-30 w-5 -translate-x-1/2"
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: [-12, 10, 18], opacity: [0, 1, 0] }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <PieceShape type={type} variant={0} />
    </motion.div>
  );
}
