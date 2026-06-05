"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { IngredientIcon } from "./pasta-ingredient-icons";
import { PasteraIsometricBox } from "./PasteraIsometricBox";
import {
  layerKind,
  pastaTint,
  sauceColor,
  toppingPosition,
  type LayerKind,
} from "./pasta-box-visual";

export type BoxLayer = { id: string; name: string; image?: string };

type PastaBoxProps = {
  pastaName: string;
  pastaId?: string;
  layers: BoxLayer[];
  /** Kaydırınca ekranda kalsın (builder + sepet). */
  sticky?: boolean;
};

type PourState = { id: string; kind: LayerKind | "pasta"; color: string } | null;

function PourIntoBox({ color, iconId }: { color: string; iconId?: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 z-30 flex -translate-x-1/2 flex-col items-center"
      style={{ top: "-8%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {iconId ? (
        <motion.div
          initial={{ y: -60, opacity: 0, rotate: -20, scale: 0.4 }}
          animate={{ y: [ -60, 0, 8, 0 ], opacity: [0, 1, 1, 0.9], rotate: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <IngredientIcon id={iconId} size={36} />
        </motion.div>
      ) : (
        <>
          <motion.div
            className="rounded-full"
            style={{ backgroundColor: color, width: 12, boxShadow: `0 0 14px ${color}` }}
            initial={{ height: 0 }}
            animate={{ height: [0, 56, 56, 0] }}
            transition={{ duration: 0.85, times: [0, 0.3, 0.65, 1] }}
          />
          <motion.div
            className="rounded-full"
            style={{ backgroundColor: color, width: 32, height: 8, marginTop: -2 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 0.9, 0.4] }}
            transition={{ duration: 0.85, delay: 0.15 }}
          />
        </>
      )}
    </motion.div>
  );
}

function InteriorContent({
  pastaId,
  pastaName,
  layers,
}: {
  pastaId?: string;
  pastaName: string;
  layers: BoxLayer[];
}) {
  const tint = pastaTint(pastaId);
  const sauces = layers.filter((l) => layerKind(l.id) === "sauce");
  const toppings = layers.filter((l) => layerKind(l.id) === "topping");
  const pid = pastaId ?? "noodle-classic";

  return (
    <div className="relative h-full w-full">
      {/* Sos katmanları */}
      <div className="absolute inset-x-[4%] bottom-0 top-[20%]">
        <AnimatePresence initial={false}>
          {sauces.map((layer, idx) => (
            <motion.div
              key={layer.id}
              className="absolute inset-x-0 flex items-end justify-center"
              style={{ bottom: `${idx * 18}%`, height: `${50 - idx * 8}%` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 0.85 - idx * 0.1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div
                className="h-full w-full rounded-[50%]"
                style={{
                  backgroundColor: sauceColor(layer.id),
                  transformOrigin: "bottom center",
                  boxShadow: `inset 0 -3px 8px rgba(0,0,0,0.3)`,
                }}
              />
              <div className="absolute bottom-[20%] opacity-90">
                <IngredientIcon id={layer.id} size={22} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Makarna */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pid}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: -50, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <div className="flex gap-0.5 opacity-95" style={{ filter: `drop-shadow(0 0 6px ${tint.glow})` }}>
            <IngredientIcon id={pid} size={40} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Toppingler */}
      <AnimatePresence initial={false}>
        {toppings.map((layer, idx) => {
          const pos = toppingPosition(layer.id, idx);
          return (
            <motion.div
              key={layer.id}
              className="absolute z-10"
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
              initial={{ y: -70, opacity: 0, scale: 0.2, rotate: -25 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 16, delay: idx * 0.03 }}
            >
              <div
                className="rounded-full bg-black/20 p-0.5 shadow-md"
                title={layer.name}
              >
                <IngredientIcon id={layer.id} size={idx > 4 ? 24 : 28} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {layers.length === 0 && !pastaName ? null : layers.length === 0 ? (
        <p className="absolute inset-0 flex items-center justify-center px-2 text-center text-[9px] leading-tight text-white/30">
          ···
        </p>
      ) : null}
    </div>
  );
}

function PastaBoxInner({ pastaName, pastaId, layers }: Omit<PastaBoxProps, "sticky">) {
  const { t } = useI18n();
  const prevLayerIds = useRef<string[]>([]);
  const prevPastaId = useRef<string | undefined>(pastaId);
  const [pour, setPour] = useState<PourState>(null);

  useEffect(() => {
    const ids = layers.map((l) => l.id);
    const added = ids.find((id) => !prevLayerIds.current.includes(id));
    prevLayerIds.current = ids;
    if (!added) return;

    const kind = layerKind(added);
    setPour({
      id: added,
      kind,
      color: kind === "sauce" ? sauceColor(added) : "#c49746",
    });
    const timer = window.setTimeout(() => setPour(null), 950);
    return () => window.clearTimeout(timer);
  }, [layers]);

  useEffect(() => {
    if (prevPastaId.current === pastaId) return;
    prevPastaId.current = pastaId;
    setPour({ id: pastaId ?? "pasta", kind: "pasta", color: pastaTint(pastaId).noodle });
    const timer = window.setTimeout(() => setPour(null), 1000);
    return () => window.clearTimeout(timer);
  }, [pastaId]);

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
          className="mb-2 max-w-[260px] truncate text-center text-sm font-medium text-white/85"
        >
          {pastaName}
        </motion.p>
      </AnimatePresence>

      <div className="relative w-full">
        <AnimatePresence>
          {pour ? (
            <PourIntoBox
              color={pour.color}
              iconId={pour.kind === "topping" || pour.kind === "pasta" ? pour.id : undefined}
            />
          ) : null}
        </AnimatePresence>

        <PasteraIsometricBox>
          <InteriorContent pastaId={pastaId} pastaName={pastaName} layers={layers} />
        </PasteraIsometricBox>

        {layers.length === 0 ? (
          <p className="mt-3 px-4 text-center text-xs text-white/40">{t("pastaBox.empty")}</p>
        ) : (
          <ul className="mt-3 flex max-w-[280px] flex-wrap justify-center gap-1 px-2">
            <AnimatePresence initial={false}>
              {layers.map((layer) => (
                <motion.li
                  key={layer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 rounded-full border border-[#2e402a] bg-[#141414] py-0.5 pl-1 pr-2 text-[10px] font-medium text-white/75"
                >
                  <IngredientIcon id={layer.id} size={16} />
                  <span className="max-w-[72px] truncate">{layer.name}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

export function PastaBox({ sticky = true, ...props }: PastaBoxProps) {
  const inner = <PastaBoxInner {...props} />;

  if (!sticky) return inner;

  return (
    <div
      className="sticky top-16 z-20 w-full self-start rounded-2xl border border-[#2e402a]/50 bg-matte/90 px-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-3 lg:top-24"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {inner}
    </div>
  );
}
