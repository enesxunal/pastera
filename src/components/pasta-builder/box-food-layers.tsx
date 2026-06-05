"use client";

import { motion } from "framer-motion";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Makarna — kutunun dibinde küçük yığın. */
export function PastaFill({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const { noodle, glow } = pastaTint(pastaId);
  const strands = [
    { left: 8, bottom: 4, w: 70, rot: -8 },
    { left: 18, bottom: 10, w: 65, rot: -4 },
    { left: 5, bottom: 16, w: 72, rot: -11 },
    { left: 28, bottom: 22, w: 58, rot: -2 },
    { left: 12, bottom: 28, w: 66, rot: -7 },
    { left: 32, bottom: 34, w: 52, rot: 3 },
  ];

  return (
    <div className="absolute inset-0">
      {strands.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: `${s.bottom}%`,
            width: `${s.w}%`,
            height: "14%",
            background: `linear-gradient(180deg, ${glow}, ${noodle})`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "left center",
          }}
          initial={pouring ? { y: -20, opacity: 0, scaleX: 0.2 } : false}
          animate={{ y: 0, opacity: 1, scaleX: 1 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 17,
            delay: pouring ? i * 0.05 : 0,
          }}
        />
      ))}
    </div>
  );
}

/** Sos — dibe oturur. */
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
  const height = 18 + index * 7;

  return (
    <motion.div
      className="absolute inset-x-[8%] overflow-hidden"
      style={{
        bottom: `${2 + index * 4}%`,
        height: `${height}%`,
        transformOrigin: "bottom center",
        borderRadius: "38% 38% 32% 32%",
        backgroundColor: color,
        boxShadow: "inset 0 -2px 6px rgba(0,0,0,0.25)",
      }}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.1, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.9 - index * 0.05 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 18,
        delay: pouring ? 0.15 : index * 0.05,
      }}
    />
  );
}

function PieceShape({ type, variant }: { type: ReturnType<typeof toppingPieceType>; variant: number }) {
  const s = variant % 4;

  if (type === "meat") {
    return (
      <svg viewBox="0 0 24 10" className="h-full w-full" aria-hidden>
        <rect x="1" y="2" width="22" height="6" rx="2" fill="#b87840" transform={`rotate(${-4 + s * 3} 12 5)`} />
      </svg>
    );
  }
  if (type === "shrimp") {
    return (
      <svg viewBox="0 0 24 10" className="h-full w-full" aria-hidden>
        <path d="M3 7 Q12 1 21 7" fill="none" stroke="#e8907a" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "olive") {
    return (
      <svg viewBox="0 0 10 14" className="h-full w-full" aria-hidden>
        <ellipse cx="5" cy="8" rx="4" ry="6" fill={s % 2 ? "#1e1e1e" : "#4d6e32"} />
      </svg>
    );
  }
  if (type === "corn") {
    return (
      <svg viewBox="0 0 10 14" className="h-full w-full" aria-hidden>
        <ellipse cx="5" cy="7" rx="3.5" ry="6" fill="#f0d040" />
      </svg>
    );
  }
  if (type === "mushroom") {
    return (
      <svg viewBox="0 0 16 12" className="h-full w-full" aria-hidden>
        <ellipse cx="8" cy="5" rx="7" ry="4" fill="#b09068" />
        <rect x="6.5" y="5" width="3" height="6" rx="1" fill="#e0d4c0" />
      </svg>
    );
  }
  if (type === "green") {
    return (
      <svg viewBox="0 0 18 10" className="h-full w-full" aria-hidden>
        <path d="M3 9 Q9 1 15 9 Z" fill="#3d9038" />
      </svg>
    );
  }
  if (type === "cheese") {
    return (
      <svg viewBox="0 0 14 10" className="h-full w-full" aria-hidden>
        <path d="M1 9 L7 1 L13 9 Z" fill="#f5f5ec" stroke="#d0d0c8" strokeWidth="0.5" />
      </svg>
    );
  }
  if (type === "fruit") {
    return (
      <svg viewBox="0 0 12 12" className="h-full w-full" aria-hidden>
        <circle cx="6" cy="7" r="5" fill={s % 2 ? "#e03850" : "#f0c838"} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 14 8" className="h-full w-full" aria-hidden>
      <rect x="2" y="2" width="10" height="4" rx="1.5" fill="#9a7048" />
    </svg>
  );
}

const PIECE_OFFSETS = [
  { left: 12, bottom: 32, rot: -12 },
  { left: 40, bottom: 36, rot: 8 },
  { left: 26, bottom: 28, rot: -5 },
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

  return (
    <>
      {PIECE_OFFSETS.map((off, i) => (
        <motion.div
          key={`${layerId}-${i}`}
          className="absolute z-10"
          style={{
            left: `${off.left}%`,
            bottom: `${off.bottom}%`,
            width: "18%",
            height: "22%",
          }}
          initial={pouring ? { y: -24, opacity: 0, rotate: off.rot - 20, scale: 0.1 } : { rotate: off.rot }}
          animate={{ y: 0, opacity: 1, rotate: off.rot, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 14,
            delay: pouring ? i * 0.08 : 0,
          }}
        >
          <PieceShape type={type} variant={globalIndex + i} />
        </motion.div>
      ))}
    </>
  );
}

export function SaucePourStream({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-0 z-20 flex -translate-x-1/2 flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 5,
          background: color,
          borderRadius: 3,
        }}
        initial={{ height: 0 }}
        animate={{ height: [0, 28, 28, 0] }}
        transition={{ duration: 0.9, times: [0, 0.35, 0.65, 1], ease: EASE }}
      />
    </motion.div>
  );
}

export function PastaPourStream({ pastaId }: { pastaId?: string }) {
  const { noodle, glow } = pastaTint(pastaId);

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-[10%] top-0 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${i * 30}%`,
            width: "35%",
            height: "18%",
            background: `linear-gradient(90deg, ${glow}, ${noodle})`,
            transform: `rotate(${-8 + i * 6}deg)`,
          }}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: ["-100%", "60%", "80%"], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
        />
      ))}
    </motion.div>
  );
}

export function ToppingPourStream({ layerId }: { layerId: string }) {
  const type = toppingPieceType(layerId);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-0 z-20 w-[18%] -translate-x-1/2"
      initial={{ y: "-80%", opacity: 0 }}
      animate={{ y: ["-80%", "50%", "70%"], opacity: [0, 1, 0] }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <PieceShape type={type} variant={0} />
    </motion.div>
  );
}
