"use client";

import { motion } from "framer-motion";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Kalın fettuccine şeritleri — çizim, fotoğraf yok. */
export function PastaFill({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const { noodle, glow } = pastaTint(pastaId);
  const strands = [
    { x: 18, y: 72, w: 72, rot: -18, h: 9 },
    { x: 42, y: 78, w: 68, rot: -8, h: 10 },
    { x: 8, y: 65, w: 80, rot: -22, h: 8 },
    { x: 55, y: 70, w: 70, rot: -5, h: 9 },
    { x: 30, y: 58, w: 75, rot: -14, h: 10 },
    { x: 62, y: 62, w: 65, rot: 4, h: 8 },
    { x: 22, y: 48, w: 78, rot: -10, h: 9 },
    { x: 48, y: 52, w: 72, rot: -3, h: 10 },
    { x: 12, y: 40, w: 82, rot: -16, h: 8 },
    { x: 58, y: 44, w: 68, rot: 6, h: 9 },
    { x: 35, y: 32, w: 74, rot: -12, h: 8 },
    { x: 50, y: 28, w: 70, rot: -2, h: 9 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {strands.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            bottom: `${100 - s.y}%`,
            width: `${s.w}%`,
            height: s.h,
            background: `linear-gradient(180deg, ${glow} 0%, ${noodle} 45%, ${glow} 100%)`,
            boxShadow: `0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)`,
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "left center",
          }}
          initial={pouring ? { y: -80, opacity: 0, scaleX: 0.3 } : false}
          animate={{ y: 0, opacity: 1, scaleX: 1 }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 15,
            delay: pouring ? i * 0.045 : 0,
          }}
        />
      ))}
      <motion.div
        className="absolute inset-x-[5%] bottom-0 h-[22%] rounded-t-[50%]"
        style={{ background: `linear-gradient(to top, ${noodle}bb, transparent)` }}
        initial={pouring ? { scaleY: 0 } : false}
        animate={{ scaleY: 1 }}
        transition={{ delay: pouring ? 0.35 : 0, duration: 0.35 }}
      />
    </div>
  );
}

function SauceWaveSvg({ color, id }: { color: string; id: string }) {
  return (
    <svg viewBox="0 0 200 40" className="absolute inset-x-0 top-0 h-[35%] w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M0,28 C40,8 80,38 120,18 S200,32 200,22 L200,40 L0,40 Z"
        fill={color}
        opacity="0.95"
      />
      <path
        d="M0,22 C50,6 100,30 150,14 S200,26 200,18"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
      />
      <rect x="0" y="0" width="200" height="40" fill={`url(#sg-${id})`} />
    </svg>
  );
}

/** Sos katmanı — sıvı gibi yükselir. */
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
  const height = 32 + index * 11;

  return (
    <motion.div
      className="absolute inset-x-[5%] overflow-hidden"
      style={{
        bottom: `${5 + index * 7}%`,
        height: `${height}%`,
        transformOrigin: "bottom center",
        borderRadius: "42% 42% 38% 38%",
        backgroundColor: color,
        boxShadow: `inset 0 -6px 14px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.12)`,
      }}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.15, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.9 - index * 0.04 }}
      transition={{
        type: "spring",
        stiffness: 160,
        damping: 18,
        delay: pouring ? 0.2 : index * 0.06,
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
        <rect x="6" y="5.5" width="10" height="2" rx="1" fill="rgba(255,255,255,0.35)" transform={`rotate(${-6 + s * 4} 16 8)`} />
      </svg>
    );
  }
  if (type === "shrimp") {
    return (
      <svg viewBox="0 0 32 16" className="h-full w-full" aria-hidden>
        <path d="M4 10 Q16 2 28 10" fill="none" stroke="#f0a090" strokeWidth="6" strokeLinecap="round" />
        <path d="M4 10 Q16 2 28 10" fill="none" stroke="#ffd0c0" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <circle cx="27" cy="9" r="1.8" fill="#2a2a2a" />
      </svg>
    );
  }
  if (type === "olive") {
    const dark = s % 2 === 0;
    return (
      <svg viewBox="0 0 16 22" className="h-full w-full" aria-hidden>
        <ellipse cx="8" cy="12" rx="6" ry="9" fill={dark ? "#1e1e1e" : "#4d6e32"} />
        <ellipse cx="5.5" cy="9" rx="2.5" ry="4" fill="rgba(255,255,255,0.15)" />
        <circle cx="8" cy="7" r="1.3" fill="#c49746" />
      </svg>
    );
  }
  if (type === "corn") {
    return (
      <svg viewBox="0 0 14 22" className="h-full w-full" aria-hidden>
        <ellipse cx="7" cy="11" rx="5" ry="10" fill="#f2d848" />
        <ellipse cx="5" cy="8" rx="2" ry="4" fill="#ffe878" opacity="0.5" />
        {[4, 6, 8, 10].map((y) => (
          <line key={y} x1="5" y1={y} x2="5" y2={y + 2} stroke="#c8a018" strokeWidth="0.8" />
        ))}
        {[4, 6, 8, 10].map((y) => (
          <line key={`r-${y}`} x1="9" y1={y} x2="9" y2={y + 2} stroke="#c8a018" strokeWidth="0.8" />
        ))}
      </svg>
    );
  }
  if (type === "mushroom") {
    return (
      <svg viewBox="0 0 22 18" className="h-full w-full" aria-hidden>
        <ellipse cx="11" cy="7" rx="10" ry="5.5" fill="#b09068" />
        <ellipse cx="8" cy="5.5" rx="4" ry="2.5" fill="#d4b890" opacity="0.45" />
        <rect x="9" y="7" width="4" height="9" rx="1.5" fill="#e8dcc8" />
      </svg>
    );
  }
  if (type === "green") {
    return (
      <svg viewBox="0 0 24 16" className="h-full w-full" aria-hidden>
        <path d="M4 14 Q12 1 20 14 Z" fill="#3d9038" />
        <path d="M12 2 Q10 9 12 14 Q14 9 12 2" fill="#2d7028" opacity="0.7" />
        <path d="M8 10 Q12 6 16 10" fill="none" stroke="#5ab050" strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }
  if (type === "cheese") {
    return (
      <svg viewBox="0 0 20 16" className="h-full w-full" aria-hidden>
        <path d="M2 14 L10 2 L18 14 Z" fill="#f8f8f0" stroke="#d8d8d0" strokeWidth="0.8" />
        <circle cx="9" cy="10" r="1.3" fill="#98a0a8" />
        <circle cx="13" cy="12" r="0.8" fill="#98a0a8" />
      </svg>
    );
  }
  if (type === "fruit") {
    return (
      <svg viewBox="0 0 18 18" className="h-full w-full" aria-hidden>
        <circle cx="9" cy="10" r="7" fill={s % 2 ? "#e03850" : "#f0c838"} />
        <circle cx="6.5" cy="8" r="2.5" fill="rgba(255,255,255,0.25)" />
        {s % 2 === 0 ? <circle cx="11" cy="12" r="1" fill="#ff8090" opacity="0.6" /> : null}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 14" className="h-full w-full" aria-hidden>
      <rect x="3" y="4" width="14" height="7" rx="2.5" fill="#9a7048" transform={`rotate(${s * 6} 10 7)`} />
    </svg>
  );
}

const PIECE_OFFSETS = [
  { left: 10, top: 2, rot: -16, scale: 1 },
  { left: 38, top: 0, rot: 12, scale: 0.92 },
  { left: 24, top: 14, rot: -8, scale: 1.05 },
  { left: 52, top: 10, rot: 20, scale: 0.88 },
];

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
    type === "olive" ? { w: 18, h: 24 } : type === "corn" ? { w: 16, h: 26 } : { w: 28, h: 18 };

  return (
    <>
      {PIECE_OFFSETS.map((off, i) => (
        <motion.div
          key={`${layerId}-${i}`}
          className="absolute z-20 drop-shadow-md"
          style={{
            left: `${off.left + (i % 2) * 4}%`,
            top: `${off.top}%`,
            width: size.w,
            height: size.h,
          }}
          initial={
            pouring
              ? { y: -130, opacity: 0, rotate: off.rot - 30, scale: 0.15 }
              : { rotate: off.rot, scale: off.scale }
          }
          animate={{ y: 0, opacity: 1, rotate: off.rot, scale: off.scale }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 13,
            delay: pouring ? i * 0.1 : 0,
          }}
        >
          <PieceShape type={type} variant={globalIndex + i} />
        </motion.div>
      ))}
    </>
  );
}

/** Üstten akan sos. */
export function SaucePourStream({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center"
      style={{ top: "-22%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 14,
          background: `linear-gradient(to bottom, ${color}, ${color}aa)`,
          borderRadius: 8,
          boxShadow: `0 0 18px ${color}88`,
        }}
        initial={{ height: 0 }}
        animate={{ height: [0, 85, 85, 0] }}
        transition={{ duration: 1.05, times: [0, 0.3, 0.65, 1], ease: EASE }}
      />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 6 + i * 4,
            height: 6 + i * 4,
            backgroundColor: color,
            top: 60 + i * 8,
            left: -12 + i * 12,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.7, delay: 0.35 + i * 0.08 }}
        />
      ))}
    </motion.div>
  );
}

/** Üstten düşen makarna telleri. */
export function PastaPourStream({ pastaId }: { pastaId?: string }) {
  const { noodle, glow } = pastaTint(pastaId);
  const drops = [0, 1, 2, 3, 4, 5];

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
      style={{ top: "-30%", width: 120 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {drops.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: 10 + i * 16,
            width: 36 + (i % 3) * 12,
            height: 8 + (i % 2),
            background: `linear-gradient(90deg, ${glow}, ${noodle})`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transform: `rotate(${-15 + i * 5}deg)`,
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: [ -50, 30, 50 ], opacity: [0, 1, 0] }}
          transition={{ duration: 0.75, delay: i * 0.07, ease: EASE }}
        />
      ))}
    </motion.div>
  );
}

/** Topping seçilince üstten kısa önizleme düşüşü. */
export function ToppingPourStream({ layerId }: { layerId: string }) {
  const type = toppingPieceType(layerId);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
      style={{ top: "-18%", width: 40, height: 40 }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: [ -20, 15, 0 ], opacity: [0, 1, 0] }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      <PieceShape type={type} variant={0} />
    </motion.div>
  );
}
