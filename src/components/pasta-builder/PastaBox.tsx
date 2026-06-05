"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";
import {
  layerKind,
  pastaTint,
  sauceColor,
  toppingAccent,
  toppingPosition,
  type LayerKind,
} from "./pasta-box-visual";

export type BoxLayer = { id: string; name: string; image?: string };

type PastaBoxProps = {
  pastaName: string;
  pastaId?: string;
  layers: BoxLayer[];
};

type PourState = { id: string; kind: LayerKind | "pasta"; color: string } | null;

function NoodleStrands({ color, glow }: { color: string; glow: string }) {
  const strands = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden>
      {strands.map((i) => (
        <motion.path
          key={i}
          d={`M ${20 + i * 28} -20 Q ${40 + i * 24} ${50 + (i % 3) * 8} ${24 + i * 26} 110`}
          fill="none"
          stroke={color}
          strokeWidth={5 + (i % 2)}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0, y: -30 }}
          animate={{ pathLength: 1, opacity: 0.92, y: 0 }}
          transition={{
            duration: 0.55,
            delay: i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
        />
      ))}
    </svg>
  );
}

function PourStream({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-0 z-30 flex -translate-x-1/2 flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-full"
        style={{ backgroundColor: color, width: 10, boxShadow: `0 0 12px ${color}` }}
        initial={{ height: 0 }}
        animate={{ height: [0, 72, 72, 0] }}
        transition={{ duration: 0.9, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      />
      <motion.div
        className="rounded-full blur-sm"
        style={{ backgroundColor: color, width: 28, height: 10, marginTop: -4 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 0.8], opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.9, delay: 0.2 }}
      />
    </motion.div>
  );
}

export function PastaBox({ pastaName, pastaId, layers }: PastaBoxProps) {
  const { t } = useI18n();
  const prevLayerIds = useRef<string[]>([]);
  const prevPastaId = useRef<string | undefined>(pastaId);
  const [pour, setPour] = useState<PourState>(null);

  const tint = pastaTint(pastaId);
  const sauces = layers.filter((l) => layerKind(l.id) === "sauce");
  const toppings = layers.filter((l) => layerKind(l.id) === "topping");

  useEffect(() => {
    const ids = layers.map((l) => l.id);
    const added = ids.find((id) => !prevLayerIds.current.includes(id));
    prevLayerIds.current = ids;

    if (!added) return;

    const kind = layerKind(added);
    const color = kind === "sauce" ? sauceColor(added) : toppingAccent(added);
    setPour({ id: added, kind, color });
    const timer = window.setTimeout(() => setPour(null), 1000);
    return () => window.clearTimeout(timer);
  }, [layers]);

  useEffect(() => {
    if (prevPastaId.current === pastaId) return;
    prevPastaId.current = pastaId;
    setPour({ id: pastaId ?? "pasta", kind: "pasta", color: tint.noodle });
    const timer = window.setTimeout(() => setPour(null), 1100);
    return () => window.clearTimeout(timer);
  }, [pastaId, tint.noodle]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <p className="mb-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
        {t("pastaBox.preview")}
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={pastaName}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className="mb-3 text-center text-sm font-medium text-white/85"
        >
          {pastaName}
        </motion.p>
      </AnimatePresence>

      <motion.div
        className="relative w-full max-w-[300px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
      >
        <AnimatePresence>{pour ? <PourStream color={pour.color} /> : null}</AnimatePresence>

        {/* Tabak */}
        <div className="relative mx-auto aspect-square w-full max-w-[280px]">
          <div
            className="absolute inset-0 rounded-full border-4 border-[#c49746]/80 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0f0f0f] shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
            style={{ boxShadow: "inset 0 8px 24px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.45)" }}
          />
          <div className="absolute inset-[10%] overflow-hidden rounded-full border border-[#2e402a]/60 bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a]">
            {/* Sos katmanları (alttan birikir) */}
            <div className="absolute inset-x-[8%] bottom-[12%] top-[38%]">
              <AnimatePresence initial={false}>
                {sauces.map((layer, idx) => (
                  <motion.div
                    key={layer.id}
                    layout
                    initial={{ scaleY: 0, opacity: 0, originY: 1 }}
                    animate={{ scaleY: 1, opacity: 0.78 - idx * 0.08 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26, delay: idx * 0.05 }}
                    className="absolute inset-x-0 rounded-[40%] blur-[0.5px]"
                    style={{
                      backgroundColor: sauceColor(layer.id),
                      bottom: `${idx * 14}%`,
                      height: `${42 + idx * 6}%`,
                      transformOrigin: "bottom center",
                      boxShadow: `inset 0 -4px 12px rgba(0,0,0,0.25)`,
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Makarna */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pastaId ?? pastaName}
                className="absolute inset-x-[6%] bottom-[18%] top-[8%]"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <NoodleStrands color={tint.noodle} glow={tint.glow} />
              </motion.div>
            </AnimatePresence>

            {/* Toppingler */}
            <AnimatePresence initial={false}>
              {toppings.map((layer, idx) => {
                const pos = toppingPosition(layer.id, idx);
                const img = publicMenuImageSrc(layer.image);
                return (
                  <motion.div
                    key={layer.id}
                    layout
                    className="absolute z-10"
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    initial={{ y: -80, opacity: 0, scale: 0.3, rotate: -12 }}
                    animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 340, damping: 18, delay: idx * 0.04 }}
                  >
                    <div
                      className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/25 shadow-md sm:h-10 sm:w-10"
                      style={{ backgroundColor: toppingAccent(layer.id) }}
                      title={layer.name}
                    >
                      {img ? (
                        <Image src={img} alt="" fill className="object-cover" sizes="40px" unoptimized />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/90">
                          {layer.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {layers.length === 0 ? (
              <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs text-white/35">
                {t("pastaBox.empty")}
              </p>
            ) : null}
          </div>

          <div className="pointer-events-none absolute -bottom-2 left-1/2 h-4 w-[75%] -translate-x-1/2 rounded-full bg-black/40 blur-lg" />
        </div>

        {/* Alt liste — ne eklendiği */}
        {layers.length > 0 ? (
          <ul className="mt-4 flex flex-wrap justify-center gap-1.5 px-2">
            <AnimatePresence initial={false}>
              {layers.map((layer) => (
                <motion.li
                  key={layer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="rounded-full border border-[#2e402a] bg-[#141414] px-2.5 py-1 text-[11px] font-medium text-white/75"
                >
                  {layer.name}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : null}
      </motion.div>
    </div>
  );
}
