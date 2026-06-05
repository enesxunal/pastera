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
  sticky?: boolean;
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
  const pastaPouring = pouring?.kind === "pasta";

  return (
    <div className="relative h-full w-full">
      {/* 1. Katman: makarna (alt) */}
      <PastaFill pastaId={pastaId} pouring={pastaPouring} />

      {/* 2. Katman: soslar (ortada, makarnanın üstü) */}
      {sauces.map((layer, idx) => (
        <SauceFill
          key={layer.id}
          id={layer.id}
          index={idx}
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}

      {/* 3. Katman: topping parçaları (en üst) */}
      {toppings.map((layer, idx) => (
        <ToppingPieces
          key={layer.id}
          layerId={layer.id}
          globalIndex={idx}
          pouring={pouring?.kind === "topping" && pouring.id === layer.id}
        />
      ))}
    </div>
  );
}

function PastaBoxInner({ pastaName, pastaId, layers }: Omit<PastaBoxProps, "sticky">) {
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
  const sauceStreamColor =
    pouring?.kind === "sauce" ? sauceColor(pouring.id) : "#c73e2e";

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
          {showPastaStream ? <PastaPourStream pastaId={pastaId} /> : null}
          {showSauceStream ? <SaucePourStream color={sauceStreamColor} /> : null}
        </AnimatePresence>

        <PasteraIsometricBox>
          <BoxInterior pastaId={pastaId} layers={layers} pouring={pouring} />
        </PasteraIsometricBox>

        {layers.length === 0 ? (
          <p className="mt-3 px-4 text-center text-xs text-white/40">{t("pastaBox.empty")}</p>
        ) : (
          <ul className="mt-3 flex max-w-[280px] flex-wrap justify-center gap-1.5 px-2">
            {layers.map((layer) => (
              <li
                key={layer.id}
                className="rounded-full border border-[#2e402a] bg-[#141414] px-2.5 py-1 text-[10px] font-medium text-white/70"
              >
                {layer.name}
              </li>
            ))}
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
    >
      {inner}
    </div>
  );
}
