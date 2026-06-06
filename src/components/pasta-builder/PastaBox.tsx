"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { PasteraIsometricBox } from "./PasteraIsometricBox";
import { layerKind } from "./pasta-box-visual";

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

function useBoxPouring(pastaId: string | undefined, layers: BoxLayer[]) {
  const prevLayerIds = useRef<string[]>([]);
  const prevPastaId = useRef<string | undefined>(undefined);
  const [heldPour, setHeldPour] = useState<Pouring>(null);

  const ids = layers.map((l) => l.id);

  let syncPour: Pouring = null;
  if (ids.length === prevLayerIds.current.length + 1) {
    const added = ids.find((id) => !prevLayerIds.current.includes(id));
    if (added) {
      const kind = layerKind(added);
      if (kind === "sauce") syncPour = { kind: "sauce", id: added };
      else if (kind === "topping") syncPour = { kind: "topping", id: added };
    }
  }

  if (
    prevPastaId.current !== undefined &&
    prevPastaId.current !== pastaId &&
    pastaId !== undefined
  ) {
    syncPour = { kind: "pasta" };
  }

  const pouring = syncPour ?? heldPour;

  useLayoutEffect(() => {
    prevLayerIds.current = ids;
    prevPastaId.current = pastaId;
  });

  useEffect(() => {
    if (!syncPour) return;
    setHeldPour(syncPour);
    const ms = syncPour.kind === "pasta" ? 1200 : 1100;
    const timer = window.setTimeout(() => setHeldPour(null), ms);
    return () => window.clearTimeout(timer);
    // syncPour intentionally captured when ids/pastaId change — not listed as dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|"), pastaId]);

  return pouring;
}

type BoxSceneProps = PastaBoxProps & {
  pouring: Pouring;
  showTitle?: boolean;
  showPastaName?: boolean;
  showLayerTags?: boolean;
  showEmptyHint?: boolean;
  boxWidth?: string;
};

/** Mobil + masaüstü aynı kutu — sadece çerçeve boyutu değişir. */
function BoxScene({
  pastaName,
  pastaId,
  layers,
  pouring,
  showTitle = false,
  showPastaName = true,
  showLayerTags = true,
  showEmptyHint = false,
  boxWidth = "w-full max-w-[240px]",
}: BoxSceneProps) {
  const { t } = useI18n();

  return (
    <div className="flex w-full flex-col items-center">
      {showTitle ? (
        <p className="mb-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
          {t("pastaBox.preview")}
        </p>
      ) : null}

      {showPastaName ? (
        <AnimatePresence mode="wait">
          <motion.p
            key={pastaName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2 max-w-[220px] truncate text-center text-xs font-medium text-white/85"
          >
            {pastaName}
          </motion.p>
        </AnimatePresence>
      ) : null}

      <div className={`relative ${boxWidth}`}>
        <PasteraIsometricBox pastaId={pastaId} layers={layers} pouring={pouring} />
      </div>

      {showEmptyHint && layers.length === 0 ? (
        <p className="mt-2 px-2 text-center text-[10px] text-white/40">{t("pastaBox.empty")}</p>
      ) : null}

      {showLayerTags && layers.length > 0 ? (
        <ul className="mt-2 flex max-h-14 flex-wrap justify-center gap-1 overflow-y-auto px-1">
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
              className="absolute bottom-full right-0 mb-3 w-[min(260px,calc(100vw-2rem))] rounded-2xl border border-[#2e402a] bg-[#141414] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
            >
              <BoxScene
                {...props}
                showTitle
                showPastaName
                showLayerTags
                boxWidth="w-full"
              />
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
          className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center overflow-hidden rounded-2xl border-2 border-[#c49746] bg-[#1a2418] p-1 shadow-[0_6px_24px_rgba(0,0,0,0.5)] ring-2 ring-black/20"
        >
          <BoxScene
            {...props}
            showPastaName={false}
            showLayerTags={false}
            boxWidth="w-full"
          />
          {layerCount > 0 ? (
            <span className="absolute -right-1 -top-1 z-30 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49746] px-1 text-[10px] font-bold text-[#0a0a0a] shadow-md">
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

function DesktopBoxPanel({
  props,
  pouring,
}: {
  props: PastaBoxProps;
  pouring: Pouring;
}) {
  return (
    <div className="rounded-2xl border border-[#2e402a]/50 bg-matte/95 px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <BoxScene
        {...props}
        pouring={pouring}
        showTitle
        showPastaName
        showLayerTags
        showEmptyHint
        boxWidth="w-full max-w-[240px]"
      />
    </div>
  );
}

/** Builder: mobilde sağ altta yüzen kutu; masaüstünde sağ üstte sabit önizleme. */
export function PastaBox(props: PastaBoxProps) {
  const pouring = useBoxPouring(props.pastaId, props.layers);

  return (
    <>
      <MobileBoxFloater {...props} pouring={pouring} />

      {/* Grid sütununu korur — metin sabit kutunun altına girmesin */}
      <div
        className="pointer-events-none hidden w-full min-h-[300px] max-w-[300px] lg:block"
        aria-hidden
      />

      <div
        className="pointer-events-auto fixed z-30 hidden w-[min(300px,calc(100vw-2rem))] max-h-[calc(100dvh-5.5rem)] overflow-y-auto lg:block"
        style={{
          top: "calc(4px + 4rem + 0.75rem)",
          right: "max(1rem, calc((100vw - min(72rem, 100vw - 3rem)) / 2 + 1.5rem))",
        }}
      >
        <DesktopBoxPanel props={props} pouring={pouring} />
      </div>
    </>
  );
}

/** Geriye dönük export. */
export function PastaBoxContent(props: PastaBoxProps & { compact?: boolean }) {
  const pouring = useBoxPouring(props.pastaId, props.layers);
  return (
    <BoxScene
      {...props}
      pouring={pouring}
      showTitle={!props.compact}
      showLayerTags
      boxWidth="w-full max-w-[240px]"
    />
  );
}
