"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatOrderNumber } from "@/lib/order-display";
import type { OrderStatus } from "@/lib/order-types";

type LobbyOrder = {
  id: string;
  status: OrderStatus;
  order_type: string;
  table_number: string | null;
  display_number?: number | null;
  ready_at?: string | null;
};

type AdItem = {
  type: "image" | "video";
  src: string;
  alt?: string;
  durationMs?: number;
};

const TV_BAR_VH = 22;
const SPOTLIGHT_MS = 2000;

export function LobbyDisplayClient() {
  const { locale, t } = useI18n();
  const [preparing, setPreparing] = useState<LobbyOrder[]>([]);
  const [ready, setReady] = useState<LobbyOrder[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [clock, setClock] = useState("");
  const [isFs, setIsFs] = useState(false);
  const [spotlight, setSpotlight] = useState<LobbyOrder | null>(null);
  const seenReadyRef = useRef<Set<string>>(new Set());
  const spotlightQueueRef = useRef<LobbyOrder[]>([]);
  const spotlightBusyRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/lobby/orders", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { preparing?: LobbyOrder[]; ready?: LobbyOrder[] };
      setPreparing(json.preparing ?? []);
      const readyList = json.ready ?? [];
      setReady(readyList);

      for (const o of readyList) {
        if (!seenReadyRef.current.has(o.id)) {
          seenReadyRef.current.add(o.id);
          spotlightQueueRef.current.push(o);
        }
      }
      drainSpotlightQueue();
    } catch {
      /* ignore */
    }
  }, []);

  function drainSpotlightQueue() {
    if (spotlightBusyRef.current || spotlightQueueRef.current.length === 0) return;
    const next = spotlightQueueRef.current.shift();
    if (!next) return;
    spotlightBusyRef.current = true;
    setSpotlight(next);
    window.setTimeout(() => {
      setSpotlight(null);
      spotlightBusyRef.current = false;
      drainSpotlightQueue();
    }, SPOTLIGHT_MS);
  }

  useEffect(() => {
    void fetch("/lobby-ads/manifest.json")
      .then((r) => r.json())
      .then((list: AdItem[]) => {
        if (Array.isArray(list) && list.length) setAds(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    void fetchOrders();
    const poll = setInterval(() => void fetchOrders(), 3000);
    return () => clearInterval(poll);
  }, [fetchOrders]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString(locale === "de" ? "de-DE" : "tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [locale]);

  useEffect(() => {
    if (ads.length < 2) return;
    const dur = ads[adIndex]?.durationMs ?? 8000;
    const id = setTimeout(() => setAdIndex((i) => (i + 1) % ads.length), dur);
    return () => clearTimeout(id);
  }, [ads, adIndex]);

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const currentAd = ads[adIndex];

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="relative h-[100dvh] w-screen overflow-hidden bg-[#070707] text-white"
      style={{ paddingBottom: `${TV_BAR_VH}vh` }}
    >
      <style>{`
        @keyframes lobby-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes lobby-shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes lobby-float {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50% { transform: translateY(-10px); opacity: 0.25; }
        }
        @keyframes lobby-spotlight-pop {
          0% { transform: scale(0.5); opacity: 0; }
          15% { transform: scale(1.08); opacity: 1; }
          85% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .lobby-title-shine {
          background: linear-gradient(90deg, #c49746, #fff8e7, #c49746);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: lobby-shine 4s linear infinite;
        }
        .lobby-spotlight-pop { animation: lobby-spotlight-pop 2s ease-out forwards; }
      `}</style>

      {/* 2 sn büyük duyuru — sipariş hazır */}
      {spotlight ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          style={{ bottom: `${TV_BAR_VH}vh` }}
          aria-live="assertive"
        >
          <div className="lobby-spotlight-pop text-center">
            <p className="text-2xl font-bold uppercase tracking-[0.3em] text-[#c49746] sm:text-3xl">
              {t("lobby.nowReady")}
            </p>
            <p className="mt-4 font-display text-[min(28vw,12rem)] font-black leading-none text-[#c49746] drop-shadow-[0_0_60px_rgba(196,151,70,0.6)]">
              {formatOrderNumber(spotlight)}
            </p>
            {spotlight.table_number ? (
              <p className="mt-6 text-2xl text-white/80 sm:text-3xl">
                {t("account.table")} {spotlight.table_number}
              </p>
            ) : (
              <p className="mt-6 text-xl text-white/60">{t("lobby.pickUp")}</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[#c49746]/10 blur-3xl"
          style={{ animation: "lobby-float 8s ease-in-out infinite" }}
        />
        <div className="absolute left-[8%] top-[18%] text-6xl opacity-[0.07]" style={{ animation: "lobby-float 12s ease-in-out infinite" }}>
          🍝
        </div>
      </div>

      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-2xl border-2 border-[#c49746] bg-[#c49746] px-5 py-3 font-display text-sm font-bold text-[#0a0a0a] shadow-[0_4px_24px_rgba(196,151,70,0.5)] sm:right-6 sm:top-6 sm:px-6 sm:py-4 sm:text-base"
      >
        <span className="text-xl">{isFs ? "⊡" : "⛶"}</span>
        {isFs ? t("lobby.exitFullscreen") : t("lobby.fullscreen")}
      </button>

      <div className="relative z-10 flex h-full flex-col px-4 pt-16 sm:px-10 sm:pt-20">
        <header className="mb-4 shrink-0 pr-36 sm:pr-44">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c49746]">{t("lobby.kicker")}</p>
          <h1 className="lobby-title-shine font-display text-2xl font-bold sm:text-4xl">{t("lobby.title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/45">{t("lobby.screenNote")}</p>
          <p className="mt-1 hidden text-sm text-white/40 sm:block">{clock}</p>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden">
          {/* Hazır — son 10, max 10 dk (API filtreler) */}
          {ready.length > 0 ? (
            <section className="shrink-0">
              <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-[#c49746]">
                🎉 {t("lobby.ready")}{" "}
                <span className="text-white/35">({t("lobby.readyHint")})</span>
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {ready.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl border-2 border-[#c49746]/80 bg-[#c49746]/15 px-6 py-3 text-center"
                    style={{ animation: "lobby-pulse 2.5s ease-in-out infinite" }}
                  >
                    <p className="font-display text-4xl font-black text-[#c49746] sm:text-5xl">
                      {formatOrderNumber(o)}
                    </p>
                    {o.table_number ? (
                      <p className="mt-1 text-xs text-white/55">
                        {t("account.table")} {o.table_number}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Hazırlanan — her sipariş bir kez */}
          {preparing.length > 0 ? (
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <p className="mb-2 shrink-0 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                {t("lobby.preparing")} ({preparing.length})
              </p>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-[#2e402a]/80 bg-[#111]/80 p-3">
                <div className="flex flex-wrap justify-center gap-3">
                  {preparing.map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center rounded-xl border border-[#2e402a] bg-[#0a0a0a] px-4 py-2 font-display text-xl font-bold text-white/90 sm:px-5 sm:py-2.5 sm:text-2xl"
                    >
                      <span className="mr-2 text-sm text-[#c49746]">●</span>
                      {formatOrderNumber(o)}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {ready.length === 0 && preparing.length === 0 && !spotlight ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-6xl">🍝</p>
              <p className="mt-4 font-display text-2xl text-white/50">{t("lobby.empty")}</p>
              <p className="mt-2 text-white/35">{t("lobby.emptyFun")}</p>
            </div>
          ) : null}
        </main>
      </div>

      {/* TV alt reklam */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-[#c49746] bg-black"
        style={{ height: `${TV_BAR_VH}vh`, minHeight: "100px", maxHeight: "220px" }}
      >
        <div className="absolute left-0 top-0 bg-[#c49746] px-3 py-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a] sm:text-xs">
            {t("lobby.adLabel")}
          </span>
        </div>
        <div className="relative flex h-full w-full items-center justify-center px-3 pt-7 sm:px-8 sm:pt-8">
          <div className="relative aspect-video h-[85%] max-h-full w-auto overflow-hidden rounded-md ring-2 ring-[#c49746]/40">
            {currentAd?.type === "video" ? (
              <video
                key={currentAd.src}
                src={currentAd.src}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : currentAd ? (
              <Image src={currentAd.src} alt={currentAd.alt ?? "Pastera"} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1a2218]">
                <p className="font-display text-2xl text-[#c49746]/60">PASTERA</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
