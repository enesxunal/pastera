"use client";

import { motion } from "framer-motion";
import {
  MOUTH_BOTTOM,
  MOUTH_TOP,
  PASTA_CENTER,
  PASTA_PILE_LEFT,
  PASTA_PILE_RIGHT,
  scatterToppingPieces,
} from "./box-layout";
import {
  oliveColor,
  pastaTint,
  sauceColor,
  sauceOpacity,
  toppingPieceType,
  type ToppingPieceKind,
} from "./pasta-box-visual";

const EASE = [0.22, 1, 0.36, 1] as const;

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

type Layer = { id: string };

/** Makarna — fettuccine şeritleri, daha dolu ve gerçekçi. */
export function PastaPileSvg({
  pastaId,
  pouring,
}: {
  pastaId?: string;
  pouring?: boolean;
}) {
  const { noodle, glow, shadow } = pastaTint(pastaId);
  const { cx: centerX } = PASTA_CENTER;

  const ribbons = Array.from({ length: 32 }, (_, i) => {
    const t = i / 31;
    const cy = MOUTH_BOTTOM - 6 - t * (MOUTH_BOTTOM - MOUTH_TOP - 20);
    const spread = 1 - t * 0.55;
    const rx = (300 - t * 130) * spread + (i % 4) * 6;
    const ry = 7 + (i % 3) * 2 - t * 3;
    const rot = -18 + (i % 9) * 5 + (i % 2 ? 8 : -6);
    const cx = centerX + ((i % 7) - 3) * 14;
    const curve = i % 2 ? 1 : -1;
    return { cx, cy, rx, ry, rot, curve, i };
  });

  return (
    <g>
      {/* Gölge tabanı */}
      <path
        d={`M ${PASTA_PILE_LEFT} ${MOUTH_BOTTOM} Q ${centerX} ${MOUTH_TOP + 28} ${PASTA_PILE_RIGHT} ${MOUTH_BOTTOM} Z`}
        fill={shadow}
        opacity={0.35}
      />
      {/* Hacim */}
      <path
        d={`M ${PASTA_PILE_LEFT + 20} ${MOUTH_BOTTOM - 2} Q ${centerX} ${MOUTH_TOP + 18} ${PASTA_PILE_RIGHT - 20} ${MOUTH_BOTTOM - 2} Z`}
        fill={noodle}
        opacity={0.45}
      />

      {ribbons.map((s) => {
        const x1 = s.cx - s.rx * 0.85;
        const x2 = s.cx + s.rx * 0.85;
        const y = s.cy;
        const bulge = s.curve * 6;
        const d = `M ${x1} ${y} Q ${s.cx} ${y - bulge} ${x2} ${y}`;

        return (
          <motion.g
            key={s.i}
            initial={pouring ? { opacity: 0, y: -40 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 190,
              damping: 16,
              delay: pouring ? s.i * 0.02 : 0,
            }}
          >
            <ellipse
              cx={s.cx}
              cy={s.cy + 2}
              rx={s.rx}
              ry={s.ry + 1}
              fill={shadow}
              opacity={0.25}
              transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
            />
            <path
              d={d}
              fill="none"
              stroke={s.i % 3 === 0 ? glow : noodle}
              strokeWidth={s.ry * 1.6}
              strokeLinecap="round"
              opacity={0.92}
              transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
            />
            <path
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={s.ry * 0.5}
              strokeLinecap="round"
              transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
            />
          </motion.g>
        );
      })}
    </g>
  );
}

/** Sos — makarna üstüne ince tabaka, ortadan yukarı yayılır. */
function sauceDrapePath(cx: number, baseY: number, spread: number, rise: number): string {
  const top = baseY - rise;
  const w = spread;
  return [
    `M ${cx - w * 0.15} ${baseY + 6}`,
    `C ${cx - w * 0.55} ${baseY - 4} ${cx - w * 0.95} ${top + rise * 0.55} ${cx - w * 0.82} ${top + rise * 0.2}`,
    `Q ${cx - w * 0.2} ${top - 2} ${cx} ${top - 5}`,
    `Q ${cx + w * 0.2} ${top - 2} ${cx + w * 0.82} ${top + rise * 0.2}`,
    `C ${cx + w * 0.95} ${top + rise * 0.55} ${cx + w * 0.55} ${baseY - 4} ${cx + w * 0.15} ${baseY + 6}`,
    `Q ${cx} ${baseY + 10} ${cx - w * 0.15} ${baseY + 6}`,
    "Z",
  ].join(" ");
}

export function SauceSpreadSvg({
  layers,
  pouring,
  uid,
}: {
  layers: Layer[];
  pouring: Pouring;
  uid: string;
}) {
  const sauces = layers.filter((l) => l.id.startsWith("s-"));

  return (
    <g>
      <defs>
        {sauces.map((layer, index) => {
          const color = sauceColor(layer.id);
          const op = sauceOpacity(layer.id);
          return (
            <radialGradient
              key={layer.id}
              id={`sauce-pool-${uid}-${index}`}
              cx="50%"
              cy="78%"
              fx="50%"
              fy="90%"
              r="68%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={op * 0.55} />
              <stop offset="45%" stopColor={color} stopOpacity={op * 0.85} />
              <stop offset="100%" stopColor={color} stopOpacity={op * 0.35} />
            </radialGradient>
          );
        })}
        <filter id={`sauce-blur-${uid}`} x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {sauces.map((layer, index) => (
        <SauceLayer
          key={layer.id}
          id={layer.id}
          index={index}
          gradientId={`sauce-pool-${uid}-${index}`}
          blurId={`sauce-blur-${uid}`}
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}
      {pouring?.kind === "sauce" ? (
        <SaucePourStream id={pouring.id} color={sauceColor(pouring.id)} />
      ) : null}
    </g>
  );
}

function SauceLayer({
  id,
  index,
  gradientId,
  blurId,
  pouring,
}: {
  id: string;
  index: number;
  gradientId: string;
  blurId: string;
  pouring?: boolean;
}) {
  const color = sauceColor(id);
  const { cx } = PASTA_CENTER;
  const baseY = 138 + index * 2;
  const spread = 240 - index * 18;
  const rise = 72 + index * 5;
  const pool = sauceDrapePath(cx, baseY, spread, rise);

  return (
    <motion.g
      style={{ transformOrigin: `${cx}px ${baseY}px` }}
      initial={pouring ? { scale: 0.08, opacity: 0 } : { scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 130,
        damping: 18,
        delay: pouring ? 0.2 : index * 0.06,
      }}
    >
      <path d={pool} fill={`url(#${gradientId})`} filter={`url(#${blurId})`} />
      <path
        d={pool}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.25}
      />
      <ellipse
        cx={cx - spread * 0.22}
        cy={baseY - rise * 0.45}
        rx={spread * 0.14}
        ry={rise * 0.07}
        fill="rgba(255,255,255,0.12)"
      />
    </motion.g>
  );
}

function SaucePourStream({ id, color }: { id: string; color: string }) {
  const { cx, cy } = PASTA_CENTER;
  const op = sauceOpacity(id);

  return (
    <g>
      <motion.path
        d={`M ${cx} ${MOUTH_TOP + 4} Q ${cx + 8} ${cy * 0.6} ${cx} ${cy + 14}`}
        pathLength={1}
        stroke={color}
        strokeWidth={12}
        strokeLinecap="round"
        fill="none"
        opacity={op}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, op, 0] }}
        transition={{ duration: 0.9, times: [0, 0.42, 1], ease: EASE }}
      />
    </g>
  );
}

export function ToppingScatterSvg({
  layers,
  pouring,
}: {
  layers: Layer[];
  pouring: Pouring;
}) {
  const toppings = layers.filter((l) => l.id.startsWith("t-"));

  return (
    <g>
      {toppings.map((layer) => {
        const type = toppingPieceType(layer.id);
        const pieces = scatterToppingPieces(layer.id, 5);
        return pieces.map((p, i) => {
          const isPouring = pouring?.kind === "topping" && pouring.id === layer.id;
          return (
            <motion.g
              key={`${layer.id}-${i}`}
              initial={
                isPouring
                  ? { x: p.cx, y: p.cy - 80, rotate: p.rot, scale: 0.08, opacity: 0 }
                  : false
              }
              animate={{ x: p.cx, y: p.cy, rotate: p.rot, scale: p.scale, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 14,
                delay: isPouring ? i * 0.07 : 0,
              }}
            >
              <ToppingPieceGraphic type={type} variant={i} layerId={layer.id} />
            </motion.g>
          );
        });
      })}
    </g>
  );
}

function ToppingPieceGraphic({
  type,
  variant,
  layerId,
}: {
  type: ToppingPieceKind;
  variant: number;
  layerId: string;
}) {
  const v = variant % 5;

  if (type === "tomato") {
    return (
      <g>
        <circle cx={0} cy={1} r={9} fill="#c62828" />
        <circle cx={-2} cy={-1} r={2.5} fill="#e53935" opacity={0.7} />
        <ellipse cx={0} cy={-7} rx={3} ry={2} fill="#4a7c3f" />
        <path d="M 0 -7 L 2 -10" stroke="#4a7c3f" strokeWidth={1.2} />
      </g>
    );
  }

  if (type === "chicken") {
    const rot = v * 14 - 20;
    return (
      <g transform={`rotate(${rot})`}>
        <rect x={-14} y={-4} width={28} height={8} rx={3} fill="#e8b060" />
        <rect x={-12} y={-3} width={24} height={3} rx={1.5} fill="#f5d080" opacity={0.6} />
        <rect x={-10} y={1} width={8} height={2} rx={1} fill="#c89040" opacity={0.5} />
      </g>
    );
  }

  if (type === "beef") {
    const rot = v * 18 - 25;
    return (
      <g transform={`rotate(${rot})`}>
        <rect x={-15} y={-3.5} width={30} height={7} rx={2} fill="#6b2820" />
        <rect x={-13} y={-2} width={26} height={2} rx={1} fill="#8b3830" opacity={0.55} />
      </g>
    );
  }

  if (type === "shrimp") {
    return (
      <g>
        <path
          d="M -12 3 Q -4 -8 8 2 Q 10 4 12 6"
          fill="none"
          stroke="#f0a090"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path d="M 10 4 L 13 2 L 12 6 Z" fill="#f0a090" />
        <circle cx={-8} cy={0} r={1.5} fill="#1a1a1a" />
      </g>
    );
  }

  if (type === "olive") {
    const dark = oliveColor(layerId) === "black";
    return (
      <g>
        <ellipse cx={0} cy={0} rx={5.5} ry={8} fill={dark ? "#1a1a1a" : "#5a7a32"} />
        <ellipse cx={-1.5} cy={-2} rx={2} ry={3} fill="rgba(255,255,255,0.12)" />
        <ellipse cx={0} cy={-7} rx={4} ry={2.5} fill={dark ? "#2a2a2a" : "#6a8a42"} />
      </g>
    );
  }

  if (type === "corn") {
    return (
      <g>
        <ellipse cx={0} cy={0} rx={5} ry={9} fill="#f0d040" />
        <line x1={-3} y1={-6} x2={-3} y2={6} stroke="#d4a820" strokeWidth={0.8} />
        <line x1={0} y1={-7} x2={0} y2={7} stroke="#d4a820" strokeWidth={0.8} />
        <line x1={3} y1={-6} x2={3} y2={6} stroke="#d4a820" strokeWidth={0.8} />
      </g>
    );
  }

  if (type === "mushroom") {
    return (
      <g>
        <ellipse cx={0} cy={-3} rx={11} ry={6} fill="#c4a070" />
        <ellipse cx={-4} cy={-5} rx={3} ry={2} fill="#d8b888" opacity={0.5} />
        <rect x={-3} y={-2} width={6} height={10} rx={2} fill="#e8dcc8" />
      </g>
    );
  }

  if (type === "broccoli") {
    return (
      <g>
        <circle cx={-4} cy={-4} r={5} fill="#3d9038" />
        <circle cx={4} cy={-5} r={4.5} fill="#4aa040" />
        <circle cx={0} cy={-7} r={4} fill="#358830" />
        <rect x={-2} y={-1} width={4} height={10} rx={1.5} fill="#5a8a40" />
      </g>
    );
  }

  if (type === "green") {
    return (
      <path
        d={`M ${-10 + v} 6 Q 0 ${-10 - v} ${10 - v} 6 Q 0 ${-4} ${-10 + v} 6`}
        fill="#3d9038"
        opacity={0.9}
      />
    );
  }

  if (type === "cheese") {
    return (
      <g>
        <path d="M -8 6 L 0 -8 L 8 6 Z" fill="#f8f8f0" stroke="#d8d8c8" strokeWidth={0.6} />
        <circle cx={-2} cy={0} r={1.2} fill="#e8e8d8" />
        <circle cx={3} cy={2} r={1} fill="#e8e8d8" />
      </g>
    );
  }

  if (type === "falafel") {
    return (
      <g>
        <circle cx={0} cy={0} r={8} fill="#8b6830" />
        <circle cx={-2} cy={-2} r={2} fill="#a08040" opacity={0.5} />
        <circle cx={3} cy={1} r={1.5} fill="#6b5020" opacity={0.4} />
      </g>
    );
  }

  if (type === "tofu") {
    return (
      <g>
        <rect x={-9} y={-7} width={18} height={14} rx={2} fill="#f0ece4" stroke="#d8d4c8" strokeWidth={0.8} />
        <rect x={-7} y={-5} width={6} height={4} rx={1} fill="#fff" opacity={0.3} />
      </g>
    );
  }

  if (type === "seitan") {
    return (
      <g>
        <rect x={-10} y={-5} width={20} height={10} rx={3} fill="#9a7048" />
        <path d="M -6 -2 L 6 2" stroke="#7a5830" strokeWidth={1.5} opacity={0.5} />
      </g>
    );
  }

  if (type === "onion") {
    return (
      <g>
        <ellipse cx={0} cy={0} rx={10} ry={4} fill="none" stroke="#d4a830" strokeWidth={3} />
        <ellipse cx={0} cy={0} rx={7} ry={2.5} fill="none" stroke="#c89828" strokeWidth={1.5} opacity={0.6} />
      </g>
    );
  }

  if (type === "garlic") {
    return (
      <g>
        <ellipse cx={0} cy={2} rx={5} ry={7} fill="#f0ece0" stroke="#d8d0c0" strokeWidth={0.6} />
        <path d="M -2 -5 Q 0 -9 2 -5" fill="none" stroke="#e8e0d0" strokeWidth={2} />
      </g>
    );
  }

  if (type === "nut") {
    const cashew = layerId.includes("kaju") || layerId.includes("cashew");
    return cashew ? (
      <path d="M -8 4 Q 0 -10 10 2 Q 4 8 -8 4" fill="#d4a050" stroke="#b08030" strokeWidth={0.6} />
    ) : (
      <g>
        <ellipse cx={0} cy={0} rx={8} ry={6} fill="#6b4a28" />
        <path d="M 0 -6 Q 4 0 0 6 Q -4 0 0 -6" fill="none" stroke="#4a3018" strokeWidth={1.2} />
      </g>
    );
  }

  if (type === "banana") {
    return (
      <path
        d="M -10 4 Q -6 -10 8 -6 Q 12 -2 10 4 Q 0 8 -10 4"
        fill="#f0d040"
        stroke="#d4a820"
        strokeWidth={0.6}
      />
    );
  }

  if (type === "strawberry") {
    return (
      <g>
        <path d="M 0 8 Q -9 -2 -6 -8 Q 0 -10 6 -8 Q 9 -2 0 8" fill="#d4382a" />
        <circle cx={-3} cy={-2} r={0.8} fill="#ffcc00" opacity={0.5} />
        <circle cx={2} cy={0} r={0.7} fill="#ffcc00" opacity={0.5} />
        <path d="M -4 -8 L 0 -12 L 4 -8" fill="#4a7c3f" />
      </g>
    );
  }

  if (type === "kiwi") {
    return (
      <g>
        <ellipse cx={0} cy={0} rx={9} ry={7} fill="#8b6830" />
        <ellipse cx={0} cy={0} rx={6} ry={4.5} fill="#c8d840" />
        <line x1={-4} y1={0} x2={4} y2={0} stroke="#6a5020" strokeWidth={0.6} />
        <line x1={0} y1={-3} x2={0} y2={3} stroke="#6a5020" strokeWidth={0.6} />
      </g>
    );
  }

  if (type === "pear") {
    return (
      <g>
        <ellipse cx={0} cy={3} rx={7} ry={9} fill="#c8d840" />
        <ellipse cx={0} cy={-5} rx={4} ry={4} fill="#b8c830" />
        <path d="M 0 -9 L 2 -13" stroke="#5a7040" strokeWidth={1.2} />
      </g>
    );
  }

  if (type === "passion") {
    return (
      <g>
        <circle cx={0} cy={0} r={9} fill="#7a4828" />
        <circle cx={0} cy={0} r={6} fill="#f0d040" opacity={0.7} />
        <circle cx={-2} cy={-1} r={1.5} fill="#1a1a1a" opacity={0.3} />
        <circle cx={3} cy={2} r={1.2} fill="#1a1a1a" opacity={0.3} />
      </g>
    );
  }

  return <rect x={-9} y={-4} width={18} height={8} rx={3} fill="#9a7048" />;
}

export function BoxFoodSvg({
  pastaId,
  layers,
  pouring,
  uid,
}: {
  pastaId?: string;
  layers: Layer[];
  pouring: Pouring;
  uid: string;
}) {
  return (
    <g>
      <PastaPileSvg pastaId={pastaId} pouring={pouring?.kind === "pasta"} />
      <SauceSpreadSvg layers={layers} pouring={pouring} uid={uid} />
      <ToppingScatterSvg layers={layers} pouring={pouring} />
    </g>
  );
}
