"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  PastaFill,
  PastaPourStream,
  SauceFill,
  SaucePourStream,
  ToppingPieces,
} from "./box-food-layers";
import { PasteraIsometricBox } from "./PasteraIsometricBox";
import { layerKind, sauceColor } from "./pasta-box-visual";

export type BoxLayer = { id: string; name: string; image?: string };

type PastaBoxProps = {
  pastaName: string;
  pastaId?: string;
  layers: BoxLayer[];
  /** compact: mobil sabit çubuk için küçük görünüm */
  compact?: boolean;
};

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

function BoxInterior({
  pastaId,
  layers,
  pouring,
}: {
  pastaId?: string;
  layers: BoxLayer[];
  pouring: Pouring;
}) {
  const sauces = layers.filter((l) => layerKind(l.id) === "sauce");
  const toppings = layers.filter((l) => layerKind(l.id) === "topping");

  return (
    <div className="relative h-full w-full">
      <PastaFill pastaId={pastaId} pouring={pouring?.kind === "pasta"} />
      {sauces.map((layer, idx) => (
        <SauceFill
          key={layer.id}
          id={layer.id}
          index={idx}
          image={layer.image}
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}
      {toppings.map((layer, idx) => (
        <ToppingPieces
          key={layer.id}
          layerId={layer.id}
          globalIndex={idx}
          image={layer.image}
          pouring={pouring?.kind === "topping" && pouring.id === layer.id}
        />
      ))}
    </div>
  );
}

function PastaBoxContent({ pastaName, pastaId, layers, compact }: PastaBoxProps) {
  const { t } = useI18n();
  const prevLayerIds = useRef<string[]>([]);
  const prevPastaId = useRef<string | undefined>(undefined);
  const [pouring, setPouring] = useState<Pouring>(null);

  useEffect(() => {
    const ids = layers.map((l) => l.id);
    const added = ids.find((id) => !prevLayerIds.current.includes(id));
    prevLayerIds.current = ids;
    if (!added) return;
    const kind = layerKind(added);
    if (kind === "sauce") setPouring({ kind: "sauce", id: added });
    else if (kind === "topping") setPouring({ kind: "topping", id: added });
    const timer = window.setTimeout(() => setPouring(null), 1100);
    return () => window.clearTimeout(timer);
  }, [layers]);

  useEffect(() => {
    if (prevPastaId.current === undefined) {
      prevPastaId.current = pastaId;
      return;
    }
    if (prevPastaId.current === pastaId) return;
    prevPastaId.current = pastaId;
    setPouring({ kind: "pasta" });
    const timer = window.setTimeout(() => setPouring(null), 1200);
    return () => window.clearTimeout(timer);
  }, [pastaId]);

  const showSauceStream = pouring?.kind === "sauce";
  const showPastaStream = pouring?.kind === "pasta";

  return (
    <div className={`flex w-full flex-col items-center ${compact ? "max-w-[280px]" : "max-w-sm"}`}>
      {!compact ? (
        <p className="mb-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
          {t("pastaBox.preview")}
        </p>
      ) : null}
      <AnimatePresence mode="wait">
        <motion.p
          key={pastaName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`truncate text-center font-medium text-white/85 ${compact ? "mb-1 max-w-[220px] text-xs" : "mb-2 max-w-[260px] text-sm"}`}
        >
          {pastaName}
        </motion.p>
      </AnimatePresence>

      <div className={`relative w-full ${compact ? "scale-[0.88] origin-top" : ""}`}>
        <AnimatePresence>
          {showPastaStream ? <PastaPourStream pastaId={pastaId} /> : null}
          {showSauceStream ? (
            <SaucePourStream color={sauceColor(pouring.id)} />
          ) : null}
        </AnimatePresence>

        <PasteraIsometricBox>
          <BoxInterior pastaId={pastaId} layers={layers} pouring={pouring} />
        </PasteraIsometricBox>

        {!compact && layers.length === 0 ? (
          <p className="mt-3 px-4 text-center text-xs text-white/40">{t("pastaBox.empty")}</p>
        ) : null}
        {layers.length > 0 ? (
          <ul className={`flex flex-wrap justify-center gap-1 px-1 ${compact ? "mt-1 max-h-8 overflow-hidden" : "mt-3 max-w-[280px]"}`}>
            {layers.map((layer) => (
              <li
                key={layer.id}
                className="rounded-full border border-[#2e402a] bg-[#141414] px-2 py-0.5 text-[10px] font-medium text-white/70"
              >
                {layer.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** Builder / sepet için: mobilde sabit üst, masaüstünde yapışkan sağ panel. */
export function PastaBox(props: PastaBoxProps) {
  const shared = <PastaBoxContent {...props} />;

  return (
    <>
      {/* Mobil — her zaman ekranda (fixed) */}
      <div
        className="fixed inset-x-0 top-16 z-30 border-b border-[#2e402a]/80 bg-matte/96 px-2 py-2 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex justify-center">
          <PastaBoxContent {...props} compact />
        </div>
      </div>

      {/* Masaüstü — sağda yapışkan */}
      <div className="hidden w-full lg:block lg:sticky lg:top-20 lg:z-10 lg:self-start">
        <div className="rounded-2xl border border-[#2e402a]/50 bg-matte/90 px-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm">
          {shared}
        </div>
      </div>
    </>
  );
}

/** Sadece içerik (çift render önlemek için export). */
export { PastaBoxContent };
