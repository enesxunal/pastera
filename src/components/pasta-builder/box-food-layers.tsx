"use client";

import { motion } from "framer-motion";
import {
  clampToMouth,
  MOUTH_BOTTOM,
  MOUTH_TOP,
  mouthSpanAtY,
  PASTA_CENTER,
  PASTA_MOUND,
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

type FettuccineRibbon = {
  d: string;
  width: number;
  fill: string;
  edge: string;
  layer: number;
  i: number;
};

function ribbonHash(i: number, salt: number): number {
  return Math.abs(((i * 7919 + salt * 997) ^ (i << 3)) % 1000) / 1000;
}

function rotPoint(
  x: number,
  y: number,
  pivotX: number,
  pivotY: number,
  rad: number,
): { x: number; y: number } {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - pivotX;
  const dy = y - pivotY;
  return {
    x: pivotX + dx * cos - dy * sin,
    y: pivotY + dx * sin + dy * cos,
  };
}

/** Geniş fettuccine — kutu ağzını baştan sona doldurur, ortası boş kalmaz. */
function buildFettuccineRibbons(centerX: number, colors: ReturnType<typeof pastaTint>): FettuccineRibbon[] {
  const count = 78;
  const ribbons: FettuccineRibbon[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const h1 = ribbonHash(i, 1);
    const h2 = ribbonHash(i, 2);
    const h3 = ribbonHash(i, 3);
    const h4 = ribbonHash(i, 4);

    const baseY = MOUTH_BOTTOM - 6 - t * (MOUTH_BOTTOM - MOUTH_TOP - 8);
    const span = mouthSpanAtY(baseY);
    const inset = 28 + t * 12;
    const usableLeft = span.left + inset;
    const usableRight = span.right - inset;
    const usableW = Math.max(40, usableRight - usableLeft);

    const centered = i < count * 0.5;
    const cx = centered
      ? centerX + (h1 - 0.5) * usableW * 0.18
      : usableLeft + h1 * usableW;
    const len = usableW * (0.38 + h2 * 0.28);
    const bend = 8 + h3 * 14;
    const twist = (h4 - 0.5) * 10;
    const angle = (-18 + h1 * 36 + (i % 2 ? 6 : -6)) * (Math.PI / 180);
    const depth = Math.floor(t * 4);
    const width = 20 + h2 * 10 - depth * 1.5;

    const x0 = cx - len * 0.52;
    const x1 = cx - len * 0.12;
    const x2 = cx + len * 0.18;
    const x3 = cx + len * 0.52;
    const r0 = rotPoint(x0, baseY + twist * 0.15, cx, baseY, angle);
    const r1 = rotPoint(x1, baseY - bend, cx, baseY, angle);
    const r2 = rotPoint(x2, baseY + bend * 0.55, cx, baseY, angle);
    const r3 = rotPoint(x3, baseY - twist * 0.4, cx, baseY, angle);
    const p0 = clampToMouth(r0.x, r0.y);
    const p1 = clampToMouth(r1.x, r1.y);
    const p2 = clampToMouth(r2.x, r2.y);
    const p3 = clampToMouth(r3.x, r3.y);

    const d = `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} C ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}, ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`;

    ribbons.push({
      d,
      width,
      fill: i % 3 === 0 ? colors.glow : colors.noodle,
      edge: colors.edge,
      layer: depth,
      i,
    });
  }

  return ribbons.sort((a, b) => a.layer - b.layer);
}

function buildFlourDust(centerX: number): { cx: number; cy: number; r: number; o: number }[] {
  return Array.from({ length: 90 }, (_, i) => {
    const h1 = ribbonHash(i, 11);
    const h2 = ribbonHash(i, 12);
    const h3 = ribbonHash(i, 13);
    const y = MOUTH_TOP + 10 + h3 * (MOUTH_BOTTOM - MOUTH_TOP - 16);
    const span = mouthSpanAtY(y);
    const cx = span.left + 20 + h2 * (span.width - 40);
    return {
      cx: i % 3 === 0 ? centerX + (h1 - 0.5) * span.width * 0.35 : cx,
      cy: y,
      r: 0.9 + (h1 % 0.8) * 2.4,
      o: 0.3 + h2 * 0.4,
    };
  });
}

/** Yığılmış hacim katmanları — boşluk bırakmaz. */
function buildVolumeLayers(centerX: number): string[] {
  return Array.from({ length: 10 }, (_, i) => {
    const t = i / 9;
    const y = MOUTH_BOTTOM - 8 - t * (MOUTH_BOTTOM - MOUTH_TOP - 6);
    const span = mouthSpanAtY(y);
    const inset = 8 + t * 22;
    const l = span.left + inset;
    const r = span.right - inset;
    const peak = MOUTH_TOP + 4 + (1 - t) * 6;
    return `M ${l} ${y + 6} Q ${centerX} ${peak} ${r} ${y + 6} L ${r - 20} ${y + 14} Q ${centerX} ${peak + 10} ${l + 20} ${y + 14} Z`;
  });
}

/** Makarna — taze fettuccine yığını (geniş şerit, unlu mat yüzey). */
export function PastaPileSvg({
  pastaId,
  uid = "pasta",
}: {
  pastaId?: string;
  pouring?: boolean;
  uid?: string;
}) {
  const colors = pastaTint(pastaId);
  const { cx: centerX } = PASTA_CENTER;
  const ribbons = buildFettuccineRibbons(centerX, colors);
  const flour = buildFlourDust(centerX);
  const volumes = buildVolumeLayers(centerX);

  return (
    <g>
      <defs>
        <radialGradient id={`pasta-mound-${uid}`} cx="50%" cy="72%" r="88%">
          <stop offset="0%" stopColor={colors.glow} stopOpacity="0.95" />
          <stop offset="55%" stopColor={colors.noodle} stopOpacity="0.92" />
          <stop offset="100%" stopColor={colors.shadow} stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* Ana kütle — kutu ağzının tamamını doldurur */}
      <path d={PASTA_MOUND} fill={`url(#pasta-mound-${uid})`} />
      <path d={PASTA_MOUND} fill={colors.noodle} opacity={0.35} />

      {volumes.map((d, i) => (
        <path
          key={`vol-${i}`}
          d={d}
          fill={i % 2 ? colors.glow : colors.noodle}
          opacity={0.38 + (i / volumes.length) * 0.2}
        />
      ))}

      {ribbons.map((s) => (
        <g key={s.i}>
          <path
            d={s.d}
            fill="none"
            stroke={colors.shadow}
            strokeWidth={s.width + 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />
          <path
            d={s.d}
            fill="none"
            stroke={s.fill}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.94}
          />
          <path
            d={s.d}
            fill="none"
            stroke={s.edge}
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.35}
          />
          <path
            d={s.d}
            fill="none"
            stroke={colors.flour}
            strokeWidth={s.width * 0.35}
            strokeLinecap="round"
            opacity={0.55}
          />
        </g>
      ))}

      {flour.map((f, i) => (
        <ellipse
          key={`flour-${i}`}
          cx={f.cx}
          cy={f.cy}
          rx={f.r}
          ry={f.r * 0.7}
          fill={colors.flour}
          opacity={f.o}
        />
      ))}
    </g>
  );
}

function sauceHash(id: string, salt: number): number {
  let h = salt * 997;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i) * (i + 5)) | 0;
  return Math.abs(h);
}

/** Sos havuzu — hep ortadan, boyut/oval oranı sos id'sine göre değişir. */
function saucePoolSize(id: string): { cx: number; cy: number; rx: number; ry: number } {
  const { cx } = PASTA_CENTER;
  const h1 = sauceHash(id, 1);
  const h2 = sauceHash(id, 2);
  const cy = 84;

  return {
    cx,
    cy,
    rx: 268 + (h1 % 32),
    ry: 54 + (h2 % 26),
  };
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
              cy="40%"
              fx="50%"
              fy="36%"
              r="78%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={op * 0.92} />
              <stop offset="55%" stopColor={color} stopOpacity={op * 0.82} />
              <stop offset="100%" stopColor={color} stopOpacity={op * 0.35} />
            </radialGradient>
          );
        })}
        <filter id={`sauce-blur-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.2" />
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
  const pool = saucePoolSize(id);

  return (
    <g>
      <motion.ellipse
        cx={pool.cx}
        cy={pool.cy}
        fill={`url(#${gradientId})`}
        filter={`url(#${blurId})`}
        initial={
          pouring
            ? { rx: 6, ry: 3, opacity: 0 }
            : { rx: pool.rx * 0.12, ry: pool.ry * 0.12, opacity: 0 }
        }
        animate={{ rx: pool.rx, ry: pool.ry, opacity: 0.92 - index * 0.04 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 17,
          delay: pouring ? 0.35 + index * 0.05 : index * 0.06,
        }}
      />
      <ellipse
        cx={pool.cx - pool.rx * 0.2}
        cy={pool.cy - pool.ry * 0.25}
        rx={pool.rx * 0.17}
        ry={pool.ry * 0.19}
        fill="rgba(255,255,255,0.12)"
      />
      <ellipse
        cx={pool.cx}
        cy={pool.cy}
        rx={pool.rx}
        ry={pool.ry}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.15}
      />
    </g>
  );
}

function SaucePourStream({ id, color }: { id: string; color: string }) {
  const pool = saucePoolSize(id);
  const op = sauceOpacity(id);
  const streamTop = 6;
  const streamEnd = pool.cy - pool.ry * 0.12;

  return (
    <g>
      <motion.rect
        x={pool.cx - 5}
        width={10}
        rx={5}
        fill={color}
        opacity={op}
        initial={{ y: streamTop, height: 0 }}
        animate={{
          y: [streamTop, streamTop, streamEnd],
          height: [0, streamEnd - streamTop, 0],
          opacity: [0, op * 0.95, 0],
        }}
        transition={{ duration: 0.85, times: [0, 0.4, 1], ease: EASE }}
      />
      <motion.ellipse
        cx={pool.cx}
        cy={pool.cy}
        fill={color}
        opacity={op}
        initial={{ rx: 4, ry: 2, opacity: 0 }}
        animate={{
          rx: [4, pool.rx * 1.08, pool.rx],
          ry: [2, pool.ry * 1.08, pool.ry],
          opacity: [0, op * 0.85, 0],
        }}
        transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
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
      <PastaPileSvg key={pastaId ?? "default"} pastaId={pastaId} pouring={pouring?.kind === "pasta"} uid={uid} />
      <SauceSpreadSvg layers={layers} pouring={pouring} uid={uid} />
      <ToppingScatterSvg layers={layers} pouring={pouring} />
    </g>
  );
}
