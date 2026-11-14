"use client";

import Link from "next/link";
import { VipStampCard } from "@/components/vip/VipStampCard";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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
  // Browser-only NFC is possible when the reader behaves like a USB keyboard.
  // Standard Windows PC/SC/CCID readers cannot be opened by a normal web page.
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [keyboardUid, setKeyboardUid] = useState("");
  const [readerMessage, setReaderMessage] = useState("");
  const [readerBusy, setReaderBusy] = useState(false);
  const [macReaderEnabled, setMacReaderEnabled] = useState(false);
  const [macReaderState, setMacReaderState] = useState<"offline" | "connecting" | "ready">("offline");
  const [macReaderMessage, setMacReaderMessage] = useState("");
  const [readerOptionsOpen, setReaderOptionsOpen] = useState(false);
  const macLastSeqRef = useRef<number | null>(null);
  const macInstanceRef = useRef<string | null>(null);
  const macPollingRef = useRef(false);
  const readerInputRef = useRef<HTMLInputElement>(null);
  const previousScanRef = useRef<{ uid: string; at: number } | null>(null);
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

  useEffect(() => {
    if (keyboardMode) readerInputRef.current?.focus();
  }, [keyboardMode]);

  async function submitKeyboardScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!keyboardMode || readerBusy) return;
    const uid = keyboardUid.replace(/[^0-9a-f]/gi, "").toUpperCase();
    setKeyboardUid("");
    if (!/^[0-9A-F]{8,20}$/.test(uid)) {
      setReaderMessage("Ungültige NFC-UID. Der Leser muss eine hexadezimale UID mit Enter senden, keine URL.");
      readerInputRef.current?.focus();
      return;
    }
    // Ignore a duplicate Enter caused by key repeat. A genuinely new presentation
    // after lifting the card can still be counted as the next order.
    const now = Date.now();
    if (previousScanRef.current?.uid === uid && now - previousScanRef.current.at < 650) {
      setReaderMessage("Doppelte Tastatureingabe ignoriert. Karte für einen neuen Scan abheben.");
      readerInputRef.current?.focus();
      return;
    }
    previousScanRef.current = { uid, at: now };
    setReaderBusy(true);
    setReaderMessage("NFC-Scan wird an den Server gesendet …");
    try {
      const response = await fetch("/api/admin/vip/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, eventId: crypto.randomUUID() }),
      });
      const result = await response.json() as { ok?: boolean; error?: string; card_number?: string; stamps?: number };
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok || !result.ok) {
        const errors: Record<string, string> = {
          unauthorized: "Keine Berechtigung. Bitte erneut als Administrator anmelden.",
          unassigned_card: "Karte nicht zugeordnet: UID zuerst unter Verwaltung einem Kunden zuweisen.",
          uid_and_event_id_required: "Karten-UID ungültig.",
          not_configured: "VIP-Datenbank nicht verfügbar.",
        };
        setReaderMessage(errors[result.error ?? ""] ?? `Scan nicht gespeichert (${response.status}: ${result.error ?? "Fehler"}).`);
        return;
      }
      setReaderMessage(`${result.card_number ?? "VIP-Karte"}: +1 Bestellung gespeichert (${result.stamps ?? "?"} insgesamt).`);
      await refresh();
    } catch {
      setReaderMessage("Netzwerkfehler: Scan nicht bestätigt. Karte nicht erneut buchen, bevor der Stand geprüft ist.");
    } finally {
      setReaderBusy(false);
      readerInputRef.current?.focus();
    }
  }

  // macOS PC/SC/CCID readers are not exposed to websites. A read-only local
  // bridge publishes card presentation events on loopback. The authenticated
  // browser submits each event using its existing Pastera admin session.
  useEffect(() => {
    if (!macReaderEnabled) {
      setMacReaderState("offline");
      macLastSeqRef.current = null;
      macInstanceRef.current = null;
      return;
    }
    const base = "http://127.0.0.1:8767";
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    setMacReaderState("connecting");
    setMacReaderMessage("Mac-NFC-Lesegerät wird verbunden …");

    type LocalReaderEvent = { seq: number; uid: string; eventId: string };
    async function poll() {
      if (stopped || macPollingRef.current || macLastSeqRef.current === null) return;
      macPollingRef.current = true;
      try {
        const response = await fetch(`${base}/events?after=${macLastSeqRef.current}`, { cache: "no-store", credentials: "omit" });
        if (!response.ok) throw new Error("local_reader_disconnected");
        const data = await response.json() as { ok?: boolean; events?: LocalReaderEvent[]; instanceId?: string; readerAlive?: boolean };
        if (!data.ok || !Array.isArray(data.events) || !data.readerAlive) throw new Error("local_reader_unavailable");
        if (data.instanceId && macInstanceRef.current !== data.instanceId) {
          // Local service restarted and its event counter reset. Do not skip
          // the first real presentation after a launchd watchdog restart.
          macInstanceRef.current = data.instanceId;
          macLastSeqRef.current = 0;
        }
        if (!stopped) setMacReaderState("ready");
        for (const event of data.events) {
          if (stopped) break;
          if (!/^[0-9A-F]{8,20}$/i.test(event.uid) || !/^[0-9a-f-]{36}$/i.test(event.eventId)) {
            macLastSeqRef.current = event.seq;
            setMacReaderMessage("Ungültige Karte vom lokalen Leser. Kein Auftrag gebucht.");
            continue;
          }
          try {
            const res = await fetch("/api/admin/vip/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid: event.uid, eventId: event.eventId }),
            });
            if (res.status === 401) {
              router.replace("/admin/login");
              stopped = true;
              return;
            }
            const result = await res.json() as { ok?: boolean; error?: string; card_number?: string; stamps?: number };
            if (!res.ok || !result.ok) {
              setMacReaderMessage(`NFC-Scan nicht gebucht: ${result.error || res.status}.`);
            } else {
              setMacReaderMessage(`${result.card_number || "VIP-Karte"}: +1 Bestellung gespeichert (${result.stamps ?? "?"} insgesamt).`);
              await refresh();
            }
            macLastSeqRef.current = event.seq;
          } catch {
            // Retry the same event ID after a network error. Server-side RPC
            // idempotency prevents double-stamping if the first request arrived.
            setMacReaderMessage("Netzwerkfehler: Serverbestätigung fehlt. Verbindung prüfen.");
            break;
          }
        }
      } catch {
        if (!stopped) {
          setMacReaderState("offline");
          setMacReaderMessage("Mac-NFC-Dienst vorübergehend nicht erreichbar; Verbindung wird automatisch erneut geprüft.");
          // Keep polling: the local launchd watchdog will restart a stalled
          // PC/SC process, and the next response will contain a new instanceId.
        }
      } finally {
        macPollingRef.current = false;
      }
    }

    async function initialize() {
      try {
        const res = await fetch(`${base}/status`, { cache: "no-store", credentials: "omit" });
        if (!res.ok) throw new Error("local_reader_unavailable");
        const status = await res.json() as { ok?: boolean; sequence?: number; instanceId?: string; readers?: string[]; error?: string };
        if (!status.ok || typeof status.sequence !== "number" || !status.instanceId || !status.readers?.length) {
          throw new Error(status.error || "reader_not_found");
        }
        if (stopped) return;
        macLastSeqRef.current = status.sequence;
        macInstanceRef.current = status.instanceId;
        setMacReaderState("ready");
        setMacReaderMessage("Mac-NFC-Lesegerät verbunden. Karte auflegen und für eine neue Buchung wieder abheben.");
        timer = setInterval(() => void poll(), 650);
      } catch {
        if (!stopped) {
          setMacReaderState("offline");
          setMacReaderMessage("Mac-Leser nicht erreichbar. Verbindung wird erneut versucht; gegebenenfalls lokalen Netzwerkzugriff in Chrome erlauben.");
          retryTimer = setTimeout(() => void initialize(), 2500);
        }
      }
    }
    void initialize();
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [macReaderEnabled, refresh, router]);

  const isRecent = !!latest && newScan;
  const readerIsReady = macReaderEnabled && macReaderState === "ready";
  const readerIsConnecting = macReaderEnabled && macReaderState === "connecting";
  const readerNeedsAttention = macReaderEnabled && macReaderState === "offline";
  const macReaderWarning = /nicht gebucht|Netzwerkfehler|Ungültige Karte|unterbrochen|nicht erreichbar/i.test(macReaderMessage);
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
              {connected ? "Server verbunden" : "Serververbindung prüfen"}
            </span>
            <Link href="/admin/vip" className="text-[#c49746] underline">Verwaltung</Link>
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[28px] border border-[#c49746]/20 bg-[#152018] shadow-[0_25px_70px_-45px_rgba(0,0,0,0.85)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 h-[430px] w-[430px] rounded-full bg-[#c49746]/[0.055] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-[#496347]/[0.13] blur-3xl" />

          <div className="relative grid gap-7 px-6 pb-7 pt-7 sm:px-9 sm:pb-8 sm:pt-9 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-center lg:gap-9">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c49746]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#cda866]">VIP CLUB · KASSE</span>
              </div>
              <h2 className="font-display text-[31px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#f5f3eb] sm:text-[40px]">
                Karte auflegen.<br />Freude sammeln.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#bac3b7] sm:text-base">
                Halte die VIP-Karte kurz ans Lesegerät. Die Bestellung wird ganz automatisch gutgeschrieben.
              </p>
              <div className="mt-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-[#0d1510]/70 px-3.5 py-2.5" role="status" aria-live="polite">
                <span className={`h-2 w-2 shrink-0 rounded-full ${readerIsReady ? "bg-[#84b899] shadow-[0_0_0_4px_rgba(132,184,153,0.11)]" : readerIsConnecting ? "animate-pulse bg-[#cda866]" : keyboardMode ? "bg-[#84b899]" : readerNeedsAttention ? "bg-[#d9a080]" : "bg-white/40"}`} />
                <span className="text-[13px] font-medium text-[#e2e6dc]">
                  {readerIsReady ? "Lesegerät verbunden · bereit zum Scannen" : readerIsConnecting ? "Verbindung wird hergestellt …" : keyboardMode ? "USB-Leser aktiv" : readerNeedsAttention ? "Lesegerät gerade nicht erreichbar" : "Lesegerät noch nicht verbunden"}
                </span>
              </div>
            </div>

            <div className="relative mx-auto hidden h-[180px] w-full max-w-[260px] items-center justify-center lg:flex" aria-hidden="true">
              <div className="absolute h-[174px] w-[174px] rounded-full border border-[#c49746]/10" />
              <div className="absolute h-[128px] w-[128px] rounded-full border border-[#c49746]/20" />
              <div className="absolute flex h-[84px] w-[84px] items-center justify-center rounded-full border border-[#d9b67e]/30 bg-[#c49746]/[0.07] text-[#e8c98a]">
                <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M24 23a13 13 0 0 1 0 18M32 16a22 22 0 0 1 0 32M40 10a30 30 0 0 1 0 44" />
                </svg>
              </div>
            </div>
          </div>

          {readerNeedsAttention || macReaderWarning ? (
            <div role="alert" className="relative mx-6 mb-6 flex items-start gap-3 rounded-xl border border-[#b58b59]/25 bg-[#a87c48]/[0.08] px-4 py-3 text-sm leading-6 text-[#f0d6b1] sm:mx-9">
              <span aria-hidden="true" className="font-semibold">!</span>
              <span>{readerNeedsAttention ? "Lesegerät nicht erreichbar. Bitte USB-Verbindung prüfen – wir versuchen es erneut." : "Die letzte Buchung konnte nicht bestätigt werden. Bitte den Kartenstand prüfen."}</span>
            </div>
          ) : null}

          <div className="relative border-t border-white/[0.08] bg-[#101911]/55 px-6 py-4 sm:px-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] leading-6 text-[#9ea99b]">
                {readerIsReady ? "Alles bereit. Einfach die nächste Karte auflegen." : keyboardMode ? "Karte scannen oder UID unten eingeben." : "Verbinde einmal den Leser und starte direkt."}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => {
                  setMacReaderEnabled(x => !x);
                  setKeyboardMode(false);
                  setReaderMessage("");
                }} className={macReaderEnabled ? "text-[13px] font-medium text-[#c3c9c0] underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c49746]" : "rounded-full bg-[#c49746] px-5 py-2.5 text-[13px] font-semibold text-[#141510] transition hover:bg-[#ddb56e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c49746]"}>
                  {macReaderEnabled ? "Verbindung trennen" : "Lesegerät verbinden"}
                </button>
                <button type="button" aria-expanded={readerOptionsOpen} aria-controls="vip-reader-options" onClick={() => setReaderOptionsOpen(x => !x)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#c9ad78] transition hover:text-[#f4d89f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c49746]">
                  {readerOptionsOpen ? "Optionen schließen" : "Weitere Optionen"}
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform ${readerOptionsOpen ? "rotate-180" : ""}`} aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
                </button>
              </div>
            </div>

            {readerOptionsOpen ? (
              <div id="vip-reader-options" className="mt-5 border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#e1e6dc]">Alternative Lesemethode</p>
                    <p className="mt-1 text-xs leading-5 text-[#9fa99c]">Nur für Kartenleser, die ihre UID wie eine USB-Tastatur eingeben.</p>
                  </div>
                  <button type="button" onClick={() => {
                    setKeyboardMode(x => !x);
                    setMacReaderEnabled(false);
                    setReaderMessage("");
                    }} className="rounded-full border border-[#c49746]/35 px-4 py-2 text-xs font-semibold text-[#ddbe81] transition hover:bg-[#c49746]/10">
                    {keyboardMode ? "Tastaturmodus beenden" : "USB-Tastaturmodus aktivieren"}
                  </button>
                </div>
                {keyboardMode ? (
                  <form className="mt-5 space-y-3" onSubmit={event => void submitKeyboardScan(event)}>
                    <label className="block text-sm text-white/70" htmlFor="vip-keyboard-reader">Karte auflegen – die UID wird automatisch eingetragen und mit Enter bestätigt.</label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input id="vip-keyboard-reader" ref={readerInputRef} value={keyboardUid}
                        onChange={event => setKeyboardUid(event.target.value)} autoComplete="off" spellCheck={false}
                        placeholder="Karten-UID" aria-label="NFC-Karten-UID"
                        className="min-w-0 flex-1 rounded-xl border border-[#c49746]/25 bg-[#090e0b] px-4 py-3 font-mono text-sm text-white outline-none focus:border-[#c49746]" />
                      <button type="submit" disabled={readerBusy} className="rounded-xl bg-[#c49746] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
                        {readerBusy ? "Wird gespeichert …" : "Bestellung erfassen"}
                      </button>
                    </div>
                  </form>
                ) : null}
                {readerMessage ? <p role="status" className="mt-3 text-sm text-[#eac987]">{readerMessage}</p> : null}
                <p className="mt-5 text-xs leading-5 text-[#718071]">Technik: PC/SC-Leser werden über den lokalen Mac-Dienst verbunden. Bei Problemen zuerst den USB-Anschluss prüfen. Ein verbundener Server allein bedeutet nicht, dass der Kartenleser erkannt wurde.</p>
              </div>
            ) : null}
          </div>
        </section>

        {error && <p role="alert" className="mt-6 rounded-xl border border-red-300/40 p-4 text-red-200">{error}</p>}

        <div className="mt-6">
          <VipStampCard
            memberName={latest?.memberName}
            cardNumber={latest?.cardNumber}
            progress={latest?.progress ?? 0}
            stamps={latest?.stamps ?? 0}
            remaining={latest?.remaining ?? 10}
            availableRewards={latest?.availableRewards ?? 0}
            redemptions={latest?.redemptions ?? 0}
            lastScanAt={latest?.createdAt}
            animationKey={isRecent && latest ? latest.id : null}
            lastDelta={latest?.delta ?? 0}
            isSimulation={latest?.isSimulation ?? false}
            waiting={!latest}
          />
        </div>
        <p className="mt-6 text-center text-sm text-white/45">
          Jede neue Kartenauflage zählt als eine Bestellung. Eine durchgehend aufgelegte Karte wird nicht mehrfach gezählt.
        </p>
      </div>
    </main>
  );
}
