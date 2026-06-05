"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";

export type BoxLayer = { id: string; name: string; image?: string };

type PastaBoxProps = {
  pastaName: string;
  layers: BoxLayer[];
};

export function PastaBox({ pastaName, layers }: PastaBoxProps) {
  const { t } = useI18n();

  return (
    <div className="perspective-box flex w-full max-w-sm flex-col items-center">
      <p className="mb-1 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
        {t("pastaBox.preview")}
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={pastaName}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
          className="mb-3 text-center text-sm font-medium text-white/85"
        >
          {pastaName}
        </motion.p>
      </AnimatePresence>
      <motion.div
        className="preserve-3d relative w-full max-w-[280px]"
        initial={{ opacity: 0, y: 28, rotateX: 14 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 20 }}
      >
        <motion.div
          layout
          className="relative aspect-[4/5] w-full rounded-2xl border-2 border-[#c49746] bg-gradient-to-b from-[#2e402a] via-matte-up to-matte shadow-box"
          style={{ transform: "rotateX(8deg) rotateY(-6deg)" }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={{ opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              boxShadow: "inset 0 0 40px 0 rgba(196, 151, 70, 0.25)",
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-3 top-3 h-px bg-gradient-to-r from-transparent via-[#c49746]/70 to-transparent" />
          <div className="absolute inset-x-4 top-6 flex h-[calc(100%-3rem)] flex-col rounded-xl border border-[#2e402a]/90 bg-black/40 p-3 shadow-inner">
            <div className="flex-1 overflow-hidden">
              {layers.length === 0 ? (
                <p className="mt-3 text-center text-sm text-white/40">{t("pastaBox.empty")}</p>
              ) : (
                <div className="h-full overflow-auto pr-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {layers.map((layer) => (
                      <motion.div
                        key={layer.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="mb-2 flex items-center gap-2 rounded-xl border border-[#2e402a] bg-black/30 p-2"
                      >
                        <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-[#c49746]/50 bg-[#111]">
                          {publicMenuImageSrc(layer.image) ? (
                            <Image
                              src={publicMenuImageSrc(layer.image)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="36px"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{layer.name}</p>
                          <p className="text-xs text-white/45">{t("pastaBox.selected")}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-1 left-1/2 h-3 w-[88%] -translate-x-1/2 rounded-full bg-black/50 blur-md" />
        </motion.div>
      </motion.div>
    </div>
  );
}
