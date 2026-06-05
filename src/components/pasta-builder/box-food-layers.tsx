"use client";

import { motion } from "framer-motion";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

/** Kutunun dibini dolduran makarna yığını — ikon değil, gerçek erişte görünümü. */
export function PastaFill({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const { noodle, glow } = pastaTint(pastaId);
  const strands = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="absolute inset-x-[4%] bottom-0 top-[8%] overflow-hidden">
      {strands.map((i) => {
        const w = 55 + (i % 4) * 12;
        const left = (i * 11) % 55;
        const bottom = (i % 6) * 5;
        const rot = -12 + (i % 5) * 6;
        return (
          <motion.span
            key={i}
            className="absolute block rounded-full"
            style={{
              width: `${w}%`,
              height: 5 + (i % 3),
              left: `${left}%`,
              bottom: `${bottom}%`,
              background: `linear-gradient(90deg, ${noodle}, ${glow})`,
              transform: `rotate(${rot}deg)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.2)`,
            }}
            initial={pouring ? { y: -90, opacity: 0 } : false}
            animate={{ y: 0, opacity: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 16,
              delay: pouring ? i * 0.035 : 0,
            }}
          />
        );
      })}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[18%] rounded-t-[40%]"
        style={{
          background: `linear-gradient(to top, ${noodle}dd, transparent)`,
        }}
        initial={pouring ? { scaleY: 0 } : false}
        animate={{ scaleY: 1 }}
        transition={{ delay: pouring ? 0.3 : 0, duration: 0.4 }}
      />
    </div>
  );
}

/** Sos sıvısı — makarnanın üstünde birikir. */
export function SauceFill({ id, index, pouring }: { id: string; index: number; pouring?: boolean }) {
  const color = sauceColor(id);
  const base = 28 + index * 14;

  return (
    <motion.div
      className="absolute inset-x-[6%] overflow-hidden rounded-[45%]"
      style={{
        bottom: `${8 + index * 10}%`,
        height: `${base}%`,
        backgroundColor: color,
        transformOrigin: "bottom center",
        boxShadow: `inset 0 -4px 10px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)`,
      }}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.3, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.88 - index * 0.06 }}
      transition={{ type: "spring", stiffness: 200, damping: 22, delay: pouring ? 0.1 : index * 0.08 }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[22%]"
        style={{
          background: `linear-gradient(to bottom, ${color}aa, transparent)`,
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
      <svg viewBox="0 0 24 16" className="h-full w-full" aria-hidden>
        <rect x="2" y="5" width="20" height="6" rx="2" fill={s % 2 ? "#d4a574" : "#c49060"} transform={`rotate(${-8 + s * 5} 12 8)`} />
      </svg>
    );
  }
  if (type === "shrimp") {
    return (
      <svg viewBox="0 0 24 16" className="h-full w-full" aria-hidden>
        <path d="M4 10 Q12 4 20 10" fill="none" stroke="#f0a090" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "olive") {
    return (
      <svg viewBox="0 0 16 20" className="h-full w-full" aria-hidden>
        <ellipse cx="8" cy="10" rx="6" ry="8" fill={s % 2 ? "#2a2a2a" : "#4a6830"} />
        <circle cx="8" cy="7" r="1.2" fill="#c49746" />
      </svg>
    );
  }
  if (type === "corn") {
    return (
      <svg viewBox="0 0 14 20" className="h-full w-full" aria-hidden>
        <ellipse cx="7" cy="10" rx="5" ry="9" fill="#f0d040" />
        <line x1="5" y1="4" x2="5" y2="16" stroke="#d4a820" strokeWidth="0.8" />
        <line x1="9" y1="4" x2="9" y2="16" stroke="#d4a820" strokeWidth="0.8" />
      </svg>
    );
  }
  if (type === "mushroom") {
    return (
      <svg viewBox="0 0 20 18" className="h-full w-full" aria-hidden>
        <ellipse cx="10" cy="7" rx="9" ry="5" fill="#c4a882" />
        <rect x="8" y="7" width="4" height="8" rx="1" fill="#e0d0b8" />
      </svg>
    );
  }
  if (type === "green") {
    return (
      <svg viewBox="0 0 20 16" className="h-full w-full" aria-hidden>
        <ellipse cx="10" cy="10" rx="8" ry="5" fill="#4a8c40" />
        <path d="M10 2 Q6 8 10 10 Q14 8 10 2" fill="#3a7a32" />
      </svg>
    );
  }
  if (type === "cheese") {
    return (
      <svg viewBox="0 0 18 14" className="h-full w-full" aria-hidden>
        <path d="M2 12 L9 2 L16 12 Z" fill="#f0f0e8" stroke="#d8d8d0" />
        <circle cx="8" cy="8" r="1" fill="#a0a8b0" />
      </svg>
    );
  }
  if (type === "fruit") {
    return (
      <svg viewBox="0 0 16 16" className="h-full w-full" aria-hidden>
        <circle cx="8" cy="9" r="6" fill={s % 2 ? "#e04050" : "#f0d040"} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 14" className="h-full w-full" aria-hidden>
      <rect x="3" y="4" width="10" height="6" rx="2" fill="#a08050" transform={`rotate(${s * 8} 8 7)`} />
    </svg>
  );
}

const PIECE_OFFSETS = [
  { left: 20, top: 8, rot: -12 },
  { left: 50, top: 5, rot: 8 },
  { left: 35, top: 18, rot: -5 },
  { left: 58, top: 14, rot: 15 },
];

/** Her topping için 3–4 gerçek parça düşer. */
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
  const count = 4;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const off = PIECE_OFFSETS[(globalIndex + i) % PIECE_OFFSETS.length];
        return (
          <motion.div
            key={`${layerId}-${i}`}
            className="absolute z-20"
            style={{
              left: `${off.left + (i % 2) * 4}%`,
              top: `${off.top + (i % 3) * 3}%`,
              width: type === "olive" ? 14 : 22,
              height: type === "olive" ? 18 : 14,
            }}
            initial={pouring ? { y: -100, opacity: 0, rotate: off.rot - 20 } : false}
            animate={{ y: 0, opacity: 1, rotate: off.rot }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 14,
              delay: pouring ? i * 0.08 : 0,
            }}
          >
            <PieceShape type={type} variant={globalIndex + i} />
          </motion.div>
        );
      })}
    </>
  );
}

/** Sos dökülürken üstten akan sıvı. */
export function SaucePourStream({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
      style={{ top: "-12%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 14,
          background: `linear-gradient(to bottom, ${color}, ${color}cc)`,
          borderRadius: 8,
          boxShadow: `0 0 16px ${color}88`,
        }}
        initial={{ height: 0 }}
        animate={{ height: [0, 70, 70, 0] }}
        transition={{ duration: 1, times: [0, 0.35, 0.7, 1] }}
      />
      <motion.div
        className="mx-auto rounded-full"
        style={{ width: 36, height: 10, backgroundColor: color, marginTop: -4 }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 0.9] }}
        transition={{ duration: 0.9, delay: 0.2 }}
      />
    </motion.div>
  );
}

/** Makarna dökülürken üstten inen teller. */
export function PastaPourStream({ pastaId }: { pastaId?: string }) {
  const { noodle } = pastaTint(pastaId);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
      style={{ top: "-18%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{
            width: 40 + i * 8,
            height: 4,
            background: noodle,
            left: -20 + i * 6,
          }}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: [ -40, 20, 0 ], opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, delay: i * 0.06 }}
        />
      ))}
    </motion.div>
  );
}
