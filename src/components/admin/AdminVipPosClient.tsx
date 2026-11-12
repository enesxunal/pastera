"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PosEvent = {
  id: string;
  createdAt: string;
  delta: number;
  isSimulation: boolean;
  cardNumber: string;
  memberName: string;
  stamps: number;
  progress: number;
  remaining: number;
  availableRewards: number;
  redemptions: number;
};

export function AdminVipPosClient() {
  const router = useRouter();
  const [latest, setLatest] = useState<PosEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [newScan, setNewScan] = useState(false);
  const lastEventRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vip/pos", { cache: "no-store" });
      if (res.status === 401) { router.replace("/admin/login"); return; }
      if (!res.ok) throw new Error("Der VIP-Service ist momentan nicht verfügbar.");
      const body = await res.json() as { ok: boolean; latest: PosEvent | null };
      if (!body.ok) throw new Error("Die NFC-Daten konnten nicht geladen werden.");
      setConnected(true);
      setError("");
      if (body.latest) {
        const changed = initializedRef.current && lastEventRef.current !== body.latest.id;
        setLatest(body.latest);
        lastEventRef.current = body.latest.id;
        if (changed) {
          setNewScan(true);
          if (flashRef.current) clearTimeout(flashRef.current);
          flashRef.current = setTimeout(() => setNewScan(false), 5500);
        }
      }
      initializedRef.current = true;
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "Verbindung unterbrochen.");
    }
  }, [router]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 1500);
    return () => {
      clearInterval(interval);
      if (flashRef.current) clearTimeout(flashRef.current);
    };
  }, [refresh]);

  const hasReward = !!latest && latest.availableRewards > 0;
  const progress = latest ? (latest.progress === 0 && hasReward ? 10 : latest.progress) : 0;
  const isRecent = !!latest && newScan;
  return (
    <main className="min-h-screen bg-[#0a100d] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#c49746]">PASTERA</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">VIP Club · Kasse</h1>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <span className={connected ? "text-emerald-300" : "text-red-300"}>
              <span aria-hidden="true" className={connected ? "mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300" : "mr-2 inline-block h-2 w-2 rounded-full bg-red-300"} />
              {connected ? "Live verbunden" : "Verbindung prüfen"}
            </span>
            <Link href="/admin/vip" className="text-[#c49746] underline">Verwaltung</Link>
          </div>
        </header>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-300/40 p-4 text-red-200">{error}</p>}

        <section aria-live="polite" className="mt-8 rounded-3xl border border-[#c49746]/25 bg-gradient-to-br from-[#1b2a21] to-[#111511] p-6 shadow-2xl sm:p-10">
          {!latest ? (
            <div className="py-14 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c49746]">NFC Reader</p>
              <h2 className="mt-5 font-display text-3xl font-bold sm:text-5xl">Bereit für deine VIP-Karte</h2>
              <p className="mt-5 text-lg text-white/60">Karte auf das Lesegerät legen.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-widest text-[#c49746]">
                  {latest.delta > 0 ? "Letzte Bestellung" : "Letzte Korrektur"}
                </p>
                <span className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/60">{latest.cardNumber}</span>
              </div>
              <h2 className="mt-6 font-display text-4xl font-bold sm:text-5xl">{latest.memberName}</h2>
              {latest.isSimulation && <p className="mt-3 text-sm font-bold text-amber-300">TESTBUCHUNG – KEIN ECHTER VERKAUF</p>}
              {isRecent && (
                <p className={latest.delta > 0 ? "mt-5 text-2xl font-bold text-emerald-300" : "mt-5 text-2xl font-bold text-amber-300"}>
                  {latest.delta > 0 ? "+1 Bestellung erfasst!" : "−1 Bestellung korrigiert"}
                </p>
              )}
              <div className="mt-8 flex items-baseline gap-3">
                <span className="text-6xl font-bold tabular-nums text-[#c49746]">{progress}</span>
                <span className="text-2xl text-white/45">/ 10 Bestellungen</span>
              </div>
              <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
                {Array.from({ length: 10 }, (_, i) =>
                  <span key={i} className={"flex h-12 items-center justify-center rounded-xl border text-xl font-bold " +
                    (i < progress ? "border-[#c49746] bg-[#c49746] text-black" : "border-white/15 text-white/35")}>
                    {i < progress ? "✓" : i + 1}
                  </span>
                )}
              </div>
              {hasReward ? (
                <div role="status" className="mt-8 rounded-2xl border-2 border-[#c49746] bg-[#c49746]/15 px-6 py-7 text-center">
                  <p className="text-4xl" aria-hidden="true">★</p>
                  <h3 className="mt-3 font-display text-3xl font-bold text-[#f4d990] sm:text-4xl">
                    Herzlichen Glückwunsch!
                  </h3>
                  <p className="mt-3 text-xl font-semibold">
                    Du hast eine Gratis-Pasta verdient!
                  </p>
                  <p className="mt-3 text-sm text-white/65">
                    Verfügbare Gratis-Pasta: {latest.availableRewards} · Prämie in der Verwaltung einlösen.
                  </p>
                </div>
              ) : (
                <p className="mt-7 text-lg text-white/65">
                  Noch {latest.remaining} {latest.remaining === 1 ? "Bestellung" : "Bestellungen"} bis zur Gratis-Pasta.
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-5 border-t border-white/10 pt-5 text-sm text-white/45">
                <span>Gezählte Bestellungen: {latest.stamps}</span>
                <span>Eingelöste Prämien: {latest.redemptions}</span>
                <span>Letzter Vorgang: {new Date(latest.createdAt).toLocaleTimeString("de-DE")}</span>
              </div>
            </>
          )}
        </section>
        <p className="mt-6 text-center text-sm text-white/45">
          Jede neue Kartenauflage zählt als eine Bestellung. Eine durchgehend aufgelegte Karte wird nicht mehrfach gezählt.
        </p>
      </div>
    </main>
  );
}
