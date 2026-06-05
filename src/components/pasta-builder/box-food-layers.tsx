"use client";

import { motion } from "framer-motion";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Ağız: arka üst y=38, ön alt y=98 */
const MOUTH_TOP = 38;
const MOUTH_BOTTOM = 98;
const PASTA_TOP = 52;

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

export function BoxFoodSvg({
  pastaId,
  layers,
  pouring,
}: {
  pastaId?: string;
  layers: { id: string }[];
  pouring: Pouring;
}) {
  const sauces = layers.filter((l) => l.id.startsWith("s-"));
  const toppings = layers.filter((l) => l.id.startsWith("t-"));
  const pastaTop = sauces.length > 0 ? PASTA_TOP + 6 : PASTA_TOP;

  return (
    <g>
      <PastaFillSvg pastaId={pastaId} pouring={pouring?.kind === "pasta"} />
      {sauces.map((layer, idx) => (
        <SauceFillSvg
          key={layer.id}
          id={layer.id}
          index={idx}
          pastaTop={pastaTop}
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}
      {toppings.map((layer, idx) => (
        <ToppingPiecesSvg
          key={layer.id}
          layerId={layer.id}
          globalIndex={idx}
          sauceCount={sauces.length}
          pouring={pouring?.kind === "topping" && pouring.id === layer.id}
        />
      ))}
      <PourStreamsSvg pastaId={pastaId} pouring={pouring} />
    </g>
  );
}

/** Makarna yığını — kutuyu doldurur (alttan üste). */
function PastaFillSvg({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const { noodle, glow } = pastaTint(pastaId);
  const layers = 16;

  const strands = Array.from({ length: layers }, (_, i) => {
    const t = i / (layers - 1);
    const cy = MOUTH_BOTTOM - 4 - t * (MOUTH_BOTTOM - PASTA_TOP - 6);
    const rx = 58 - t * 22;
    const ry = 4.2 - t * 1.2;
    const rot = -6 + (i % 5) * 3;
    return { cy, rx, ry, rot, i };
  });

  return (
    <g>
      <path
        d={`M 40 ${MOUTH_BOTTOM - 2} Q 100 ${PASTA_TOP + 8} 160 ${MOUTH_BOTTOM - 2} L 165 ${MOUTH_BOTTOM} L 35 ${MOUTH_BOTTOM} Z`}
        fill={noodle}
        opacity={0.35}
      />
      {strands.map((s) => (
        <motion.ellipse
          key={s.i}
          cx={100}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={s.i % 2 ? noodle : glow}
          transform={`rotate(${s.rot} 100 ${s.cy})`}
          initial={pouring ? { cy: MOUTH_TOP + 5, opacity: 0, rx: s.rx * 0.15 } : false}
          animate={{ cy: s.cy, opacity: 0.95, rx: s.rx }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 16,
            delay: pouring ? s.i * 0.035 : 0,
          }}
        />
      ))}
    </g>
  );
}

/** Sos — makarna yığınının üstünde. */
function SauceFillSvg({
  id,
  index,
  pastaTop,
  pouring,
}: {
  id: string;
  index: number;
  pastaTop: number;
  pouring?: boolean;
}) {
  const color = sauceColor(id);
  const ry = 9 + index * 3;
  const cy = pastaTop + 4 - index * 5;

  return (
    <motion.ellipse
      cx={100}
      cy={cy}
      rx={50 - index * 5}
      ry={ry}
      fill={color}
      opacity={0.9 - index * 0.04}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.1, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.88 - index * 0.04 }}
      style={{ transformOrigin: `100px ${cy + ry}px` }}
      transition={{
        type: "spring",
        stiffness: 170,
        damping: 18,
        delay: pouring ? 0.12 : index * 0.05,
      }}
    />
  );
}

function ToppingPiecesSvg({
  layerId,
  globalIndex,
  sauceCount,
  pouring,
}: {
  layerId: string;
  globalIndex: number;
  sauceCount: number;
  pouring?: boolean;
}) {
  const type = toppingPieceType(layerId);
  const baseY = PASTA_TOP - 2 - sauceCount * 4;
  const spots = [
    { cx: 68, cy: baseY + 2 },
    { cx: 100, cy: baseY - 2 },
    { cx: 132, cy: baseY + 1 },
  ];

  return (
    <g>
      {spots.map((spot, i) => (
        <motion.g
          key={`${layerId}-${i}`}
          initial={pouring ? { y: -35, opacity: 0, scale: 0.1 } : false}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 14,
            delay: pouring ? i * 0.08 : 0,
          }}
        >
          <ToppingShape type={type} cx={spot.cx} cy={spot.cy} variant={globalIndex + i} />
        </motion.g>
      ))}
    </g>
  );
}

function ToppingShape({
  type,
  cx,
  cy,
  variant,
}: {
  type: ReturnType<typeof toppingPieceType>;
  cx: number;
  cy: number;
  variant: number;
}) {
  const s = variant % 4;
  if (type === "olive") {
    return <ellipse cx={cx} cy={cy} rx={4} ry={5.5} fill={s % 2 ? "#1e1e1e" : "#4d6e32"} />;
  }
  if (type === "corn") {
    return <ellipse cx={cx} cy={cy} rx={3.5} ry={6} fill="#f0d040" />;
  }
  if (type === "green") {
    return <path d={`M${cx - 6} ${cy + 4} Q${cx} ${cy - 6} ${cx + 6} ${cy + 4} Z`} fill="#3d9038" />;
  }
  if (type === "meat") {
    return (
      <rect
        x={cx - 9}
        y={cy - 2.5}
        width={18}
        height={5}
        rx={2}
        fill="#b87840"
        transform={`rotate(${-4 + s * 4} ${cx} ${cy})`}
      />
    );
  }
  if (type === "shrimp") {
    return (
      <path
        d={`M${cx - 9} ${cy + 1} Q${cx} ${cy - 5} ${cx + 9} ${cy + 1}`}
        fill="none"
        stroke="#e8907a"
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  }
  if (type === "mushroom") {
    return (
      <g>
        <ellipse cx={cx} cy={cy - 1} rx={7} ry={4} fill="#b09068" />
        <rect x={cx - 2} y={cy - 1} width={4} height={6} rx={1} fill="#e0d4c0" />
      </g>
    );
  }
  if (type === "cheese") {
    return (
      <path
        d={`M${cx - 6} ${cy + 4} L${cx} ${cy - 5} L${cx + 6} ${cy + 4} Z`}
        fill="#f5f5ec"
        stroke="#d0d0c8"
        strokeWidth={0.4}
      />
    );
  }
  if (type === "fruit") {
    return <circle cx={cx} cy={cy} r={5} fill={s % 2 ? "#e03850" : "#f0c838"} />;
  }
  return <rect x={cx - 6} y={cy - 2.5} width={12} height={5} rx={2} fill="#9a7048" />;
}

function PourStreamsSvg({
  pastaId,
  pouring,
}: {
  pastaId?: string;
  pouring: Pouring;
}) {
  if (!pouring) return null;
  if (pouring.kind === "pasta") return <PastaPourSvg pastaId={pastaId} />;
  if (pouring.kind === "sauce") return <SaucePourSvg color={sauceColor(pouring.id)} />;
  return <ToppingPourSvg layerId={pouring.id} />;
}

function SaucePourSvg({ color }: { color: string }) {
  return (
    <motion.rect
      x={99}
      width={5}
      rx={2}
      fill={color}
      initial={{ y: MOUTH_TOP, height: 0, opacity: 0 }}
      animate={{ y: [MOUTH_TOP, MOUTH_TOP, MOUTH_TOP], height: [0, 45, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.9, times: [0, 0.4, 1], ease: EASE }}
    />
  );
}

function PastaPourSvg({ pastaId }: { pastaId?: string }) {
  const { noodle, glow } = pastaTint(pastaId);
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <motion.ellipse
          key={i}
          cx={72 + i * 18}
          rx={22}
          ry={4}
          fill={i % 2 ? noodle : glow}
          initial={{ cy: MOUTH_TOP, opacity: 0 }}
          animate={{ cy: [MOUTH_TOP, 72, 88], opacity: [0, 1, 0] }}
          transition={{ duration: 0.65, delay: i * 0.06, ease: EASE }}
        />
      ))}
    </g>
  );
}

function ToppingPourSvg({ layerId }: { layerId: string }) {
  const type = toppingPieceType(layerId);
  return (
    <motion.g
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: [-25, 5, 12], opacity: [0, 1, 0] }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <ToppingShape type={type} cx={100} cy={PASTA_TOP - 4} variant={0} />
    </motion.g>
  );
}
