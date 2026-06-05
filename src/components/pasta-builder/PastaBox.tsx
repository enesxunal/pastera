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
  ToppingPourStream,
} from "./box-food-layers";
import { PasteraIsometricBox } from "./PasteraIsometricBox";
import { layerKind, sauceColor } from "./pasta-box-visual";

export type BoxLayer = { id: string; name: string; image?: string };

type PastaBoxProps = {
  pastaName: string;
  pastaId?: string;
  layers: BoxLayer[];
};

type Pouring =
  | { kind: "pasta" }
  | { kind: "sauce"; id: string }
  | { kind: "topping"; id: string }
  | null;

type PreviewMode = "full" | "compact" | "fab";

function useBoxPouring(pastaId: string | undefined, layers: BoxLayer[]) {
  const [pouring, setPouring] = useState<Pouring>(null);
  const prevLayerIds = useRef<string[]>([]);
  const prevPastaId = useRef<string | undefined>(undefined);

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

  return pouring;
}

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
          pouring={pouring?.kind === "sauce" && pouring.id === layer.id}
        />
      ))}
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

function PastaBoxPreview({
  pastaName,
  pastaId,
  layers,
  pouring,
  mode,
}: PastaBoxProps & { pouring: Pouring; mode: PreviewMode }) {
  const { t } = useI18n();
  const isFab = mode === "fab";
  const isCompact = mode === "compact";
  const isFull = mode === "full";

  const showSauceStream = pouring?.kind === "sauce";
  const showPastaStream = pouring?.kind === "pasta";
  const showToppingStream = pouring?.kind === "topping";

  if (isFab) {
    return (
      <div className="pointer-events-none relative h-full w-full overflow-hidden">
        <AnimatePresence>
          {showPastaStream ? <PastaPourStream pastaId={pastaId} /> : null}
          {showSauceStream ? <SaucePourStream color={sauceColor(pouring.id)} /> : null}
          {showToppingStream ? <ToppingPourStream layerId={pouring.id} /> : null}
        </AnimatePresence>
        <div className="absolute left-1/2 top-1/2 w-[260px] -translate-x-1/2 -translate-y-[42%] scale-[0.28]">
          <PasteraIsometricBox>
            <BoxInterior pastaId={pastaId} layers={layers} pouring={pouring} />
          </PasteraIsometricBox>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full flex-col items-center ${isCompact ? "max-w-[260px]" : "max-w-sm"}`}
    >
      {isFull ? (
        <p className="mb-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
          {t("pastaBox.preview")}
        </p>
      ) : null}
      <AnimatePresence mode="wait">
        <motion.p
          key={pastaName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`truncate text-center font-medium text-white/85 ${
            isCompact ? "mb-2 max-w-[220px] text-xs" : "mb-2 max-w-[260px] text-sm"
          }`}
        >
          {pastaName}
        </motion.p>
      </AnimatePresence>

      <div className={`relative w-full ${isCompact ? "scale-[0.92] origin-top" : ""}`}>
        <AnimatePresence>
          {showPastaStream ? <PastaPourStream pastaId={pastaId} /> : null}
          {showSauceStream ? <SaucePourStream color={sauceColor(pouring.id)} /> : null}
          {showToppingStream ? <ToppingPourStream layerId={pouring.id} /> : null}
        </AnimatePresence>

        <PasteraIsometricBox>
          <BoxInterior pastaId={pastaId} layers={layers} pouring={pouring} />
        </PasteraIsometricBox>

        {isFull && layers.length === 0 ? (
          <p className="mt-3 px-4 text-center text-xs text-white/40">{t("pastaBox.empty")}</p>
        ) : null}
        {layers.length > 0 ? (
          <ul
            className={`flex flex-wrap justify-center gap-1 px-1 ${
              isCompact ? "mt-2 max-h-16 overflow-y-auto" : "mt-3 max-w-[280px]"
            }`}
          >
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

function MobileBoxFloater(props: PastaBoxProps & { pouring: Pouring }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const prevLayerCount = useRef(props.layers.length);
  const prevPastaId = useRef(props.pastaId);
  const userOpened = useRef(false);

  useEffect(() => {
    const layerAdded = props.layers.length > prevLayerCount.current;
    const pastaChanged =
      prevPastaId.current !== undefined && prevPastaId.current !== props.pastaId;
    prevLayerCount.current = props.layers.length;
    prevPastaId.current = props.pastaId;

    if (!layerAdded && !pastaChanged) return;

    setPulse(true);
    const pulseTimer = window.setTimeout(() => setPulse(false), 700);

    if (!userOpened.current) {
      setOpen(true);
      const closeTimer = window.setTimeout(() => setOpen(false), 2800);
      return () => {
        window.clearTimeout(pulseTimer);
        window.clearTimeout(closeTimer);
      };
    }
    return () => window.clearTimeout(pulseTimer);
  }, [props.layers.length, props.pastaId]);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      userOpened.current = next;
      return next;
    });
  };

  const layerCount = props.layers.length;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label={t("pastaBox.close")}
            className="fixed inset-0 z-40 bg-black/35 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              userOpened.current = false;
            }}
          />
        ) : null}
      </AnimatePresence>

      <div
        className="fixed right-4 z-[45] lg:hidden"
        style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <AnimatePresence>
          {open ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="absolute bottom-full right-0 mb-3 w-[min(272px,calc(100vw-2rem))] rounded-2xl border border-[#2e402a] bg-[#141414] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
            >
              <p className="mb-2 text-center font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c49746]">
                {t("pastaBox.preview")}
              </p>
              <PastaBoxPreview {...props} mode="compact" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label={t("pastaBox.open")}
          aria-expanded={open}
          onClick={toggle}
          animate={pulse ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative h-[4.75rem] w-[4.75rem] overflow-hidden rounded-2xl border-2 border-[#c49746] bg-[#1a2418] shadow-[0_6px_24px_rgba(0,0,0,0.5)] ring-2 ring-black/20"
        >
          <PastaBoxPreview {...props} mode="fab" />
          {layerCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49746] px-1 text-[10px] font-bold text-[#0a0a0a] shadow-md">
              {layerCount}
            </span>
          ) : null}
        </motion.button>
        {!open ? (
          <p className="pointer-events-none mt-1.5 max-w-[4.75rem] text-center text-[9px] leading-tight text-white/40">
            {t("pastaBox.tapHint")}
          </p>
        ) : null}
      </div>
    </>
  );
}

/** Builder / sepet: mobilde sağ altta yüzen kutu, masaüstünde yapışkan panel. */
export function PastaBox(props: PastaBoxProps) {
  const pouring = useBoxPouring(props.pastaId, props.layers);

  return (
    <>
      <MobileBoxFloater {...props} pouring={pouring} />

      <div className="hidden w-full lg:block lg:sticky lg:top-20 lg:z-10 lg:self-start">
        <div className="rounded-2xl border border-[#2e402a]/50 bg-matte/90 px-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm">
          <PastaBoxPreview {...props} pouring={pouring} mode="full" />
        </div>
      </div>
    </>
  );
}

/** Geriye dönük export. */
export function PastaBoxContent(props: PastaBoxProps & { compact?: boolean }) {
  const pouring = useBoxPouring(props.pastaId, props.layers);
  return (
    <PastaBoxPreview
      {...props}
      pouring={pouring}
      mode={props.compact ? "compact" : "full"}
    />
  );
}
