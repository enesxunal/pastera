"use client";

import { motion } from "framer-motion";
import { sauceColor, pastaTint, toppingPieceType } from "./pasta-box-visual";

const EASE = [0.22, 1, 0.36, 1] as const;
const FLOOR_Y = 83;

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

/** Tüm yemek katmanları — saf SVG, viewBox 200×250 koordinatları. */
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

  return (
    <g>
      <PastaFillSvg pastaId={pastaId} pouring={pouring?.kind === "pasta"} />
      {sauces.map((layer, idx) => (
        <SauceFillSvg
          key={layer.id}
          id={layer.id}
          index={idx}
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}
      {toppings.map((layer, idx) => (
        <ToppingPiecesSvg
          key={layer.id}
          layerId={layer.id}
          globalIndex={idx}
          pouring={pouring?.kind === "topping" && pouring.id === layer.id}
        />
      ))}
      <PourStreamsSvg pastaId={pastaId} pouring={pouring} />
    </g>
  );
}

function PastaFillSvg({ pastaId, pouring }: { pastaId?: string; pouring?: boolean }) {
  const { noodle, glow } = pastaTint(pastaId);
  const strands = [
    { cx: 58, cy: 80, rx: 36, ry: 3, rot: -9 },
    { cx: 102, cy: 81, rx: 34, ry: 2.8, rot: -4 },
    { cx: 142, cy: 79, rx: 30, ry: 3, rot: 6 },
    { cx: 78, cy: 77, rx: 32, ry: 2.5, rot: -12 },
    { cx: 120, cy: 78, rx: 28, ry: 2.5, rot: 3 },
    { cx: 92, cy: 75, rx: 30, ry: 2.2, rot: -6 },
  ];

  return (
    <g>
      {strands.map((s, i) => (
        <motion.ellipse
          key={i}
          cx={s.cx}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={i % 2 ? noodle : glow}
          transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
          initial={pouring ? { cy: 50, opacity: 0, rx: s.rx * 0.2 } : false}
          animate={{ cy: s.cy, opacity: 1, rx: s.rx }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 16,
            delay: pouring ? i * 0.05 : 0,
          }}
        />
      ))}
    </g>
  );
}

function SauceFillSvg({
  id,
  index,
  pouring,
}: {
  id: string;
  index: number;
  pouring?: boolean;
}) {
  const color = sauceColor(id);
  const ry = 7 + index * 4;
  const cy = FLOOR_Y - ry + 2;

  return (
    <motion.ellipse
      cx={100}
      cy={cy}
      rx={58 - index * 6}
      ry={ry}
      fill={color}
      opacity={0.92 - index * 0.05}
      initial={pouring ? { scaleY: 0, opacity: 0 } : { scaleY: 0.15, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 0.9 - index * 0.05 }}
      style={{ transformOrigin: `100px ${FLOOR_Y}px` }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 18,
        delay: pouring ? 0.15 : index * 0.05,
      }}
    />
  );
}

function ToppingPiecesSvg({
  layerId,
  globalIndex,
  pouring,
}: {
  layerId: string;
  globalIndex: number;
  pouring?: boolean;
}) {
  const type = toppingPieceType(layerId);
  const spots = [
    { cx: 62, cy: 74 },
    { cx: 100, cy: 72 },
    { cx: 136, cy: 75 },
  ];

  return (
    <g>
      {spots.map((spot, i) => (
        <motion.g
          key={`${layerId}-${i}`}
          initial={pouring ? { y: -30, opacity: 0, scale: 0.1 } : false}
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
    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={3.5}
        ry={5}
        fill={s % 2 ? "#1e1e1e" : "#4d6e32"}
      />
    );
  }
  if (type === "corn") {
    return <ellipse cx={cx} cy={cy} rx={3} ry={5.5} fill="#f0d040" />;
  }
  if (type === "green") {
    return <path d={`M${cx - 5} ${cy + 3} Q${cx} ${cy - 5} ${cx + 5} ${cy + 3} Z`} fill="#3d9038" />;
  }
  if (type === "meat") {
    return (
      <rect
        x={cx - 8}
        y={cy - 2}
        width={16}
        height={4}
        rx={2}
        fill="#b87840"
        transform={`rotate(${-5 + s * 4} ${cx} ${cy})`}
      />
    );
  }
  if (type === "shrimp") {
    return (
      <path
        d={`M${cx - 8} ${cy + 1} Q${cx} ${cy - 4} ${cx + 8} ${cy + 1}`}
        fill="none"
        stroke="#e8907a"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    );
  }
  if (type === "mushroom") {
    return (
      <g>
        <ellipse cx={cx} cy={cy - 1} rx={6} ry={3.5} fill="#b09068" />
        <rect x={cx - 1.5} y={cy - 1} width={3} height={5} rx={1} fill="#e0d4c0" />
      </g>
    );
  }
  if (type === "cheese") {
    return (
      <path
        d={`M${cx - 5} ${cy + 3} L${cx} ${cy - 4} L${cx + 5} ${cy + 3} Z`}
        fill="#f5f5ec"
        stroke="#d0d0c8"
        strokeWidth={0.4}
      />
    );
  }
  if (type === "fruit") {
    return (
      <circle cx={cx} cy={cy} r={4.5} fill={s % 2 ? "#e03850" : "#f0c838"} />
    );
  }
  return (
    <rect x={cx - 5} y={cy - 2} width={10} height={4} rx={1.5} fill="#9a7048" />
  );
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
      x={98}
      width={4}
      rx={2}
      fill={color}
      initial={{ y: 48, height: 0, opacity: 0 }}
      animate={{ y: [48, 48, 48], height: [0, 30, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.9, times: [0, 0.4, 1], ease: EASE }}
    />
  );
}

function PastaPourSvg({ pastaId }: { pastaId?: string }) {
  const { noodle, glow } = pastaTint(pastaId);
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx={70 + i * 30}
          rx={18}
          ry={3}
          fill={i % 2 ? noodle : glow}
          initial={{ cy: 48, opacity: 0 }}
          animate={{ cy: [48, 72, 80], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
        />
      ))}
    </g>
  );
}

function ToppingPourSvg({ layerId }: { layerId: string }) {
  const type = toppingPieceType(layerId);
  return (
    <motion.g
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: [-20, 8, 16], opacity: [0, 1, 0] }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <ToppingShape type={type} cx={100} cy={68} variant={0} />
    </motion.g>
  );
}
