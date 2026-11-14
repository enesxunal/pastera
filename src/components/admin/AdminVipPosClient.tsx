"use client";

import Link from "next/link";
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
  const macLastSeqRef = useRef<number | null>(null);
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
      return;
    }
    const base = "http://127.0.0.1:8767";
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    setMacReaderState("connecting");
    setMacReaderMessage("Mac-NFC-Lesegerät wird verbunden …");

    type LocalReaderEvent = { seq: number; uid: string; eventId: string };
    async function poll() {
      if (stopped || macPollingRef.current || macLastSeqRef.current === null) return;
      macPollingRef.current = true;
      try {
        const response = await fetch(`${base}/events?after=${macLastSeqRef.current}`, { cache: "no-store", credentials: "omit" });
        if (!response.ok) throw new Error("local_reader_disconnected");
        const data = await response.json() as { ok?: boolean; events?: LocalReaderEvent[] };
        if (!data.ok || !Array.isArray(data.events)) throw new Error("local_reader_unavailable");
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
          setMacReaderMessage("Mac-Verbindung unterbrochen. Lokalen NFC-Dienst prüfen und erneut verbinden.");
          if (timer) clearInterval(timer);
        }
      } finally {
        macPollingRef.current = false;
      }
    }

    async function initialize() {
      try {
        const res = await fetch(`${base}/status`, { cache: "no-store", credentials: "omit" });
        if (!res.ok) throw new Error("local_reader_unavailable");
        const status = await res.json() as { ok?: boolean; sequence?: number; readers?: string[]; error?: string };
        if (!status.ok || typeof status.sequence !== "number" || !status.readers?.length) {
          throw new Error(status.error || "reader_not_found");
        }
        if (stopped) return;
        macLastSeqRef.current = status.sequence;
        setMacReaderState("ready");
        setMacReaderMessage("Mac-NFC-Lesegerät verbunden. Karte auflegen und für eine neue Buchung wieder abheben.");
        timer = setInterval(() => void poll(), 650);
      } catch {
        if (!stopped) {
          setMacReaderState("offline");
          setMacReaderMessage("Mac-Leser nicht erreichbar. NFC-Bridge starten und dem Browser den lokalen Netzwerkzugriff erlauben.");
        }
      }
    }
    void initialize();
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
    };
  }, [macReaderEnabled, refresh, router]);

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
              {connected ? "Server verbunden" : "Serververbindung prüfen"}
            </span>
            <Link href="/admin/vip" className="text-[#c49746] underline">Verwaltung</Link>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-white/15 bg-[#142019] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">NFC-Lesegerät an der Kasse</h2>
              <p className="mt-1 text-sm text-white/60">
                Mac: PC/SC-Leser mit lokaler NFC-Bridge. Alternativ: USB-Tastaturmodus.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => {
                setMacReaderEnabled(x => !x);
                setKeyboardMode(false);
                setReaderMessage("");
              }} className="rounded-full bg-[#c49746] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#d4a956]">
                {macReaderEnabled ? "Mac-Leser trennen" : "Mac-NFC-Leser verbinden"}
              </button>
              <button type="button" onClick={() => {
                setKeyboardMode(x => !x);
                setMacReaderEnabled(false);
                setReaderMessage("");
              }} className="rounded-full border border-[#c49746] px-5 py-2.5 text-sm font-bold text-[#eac987] hover:bg-[#c49746]/10">
                {keyboardMode ? "Tastaturmodus stoppen" : "USB-Tastaturmodus"}
              </button>
            </div>
          </div>
          {macReaderEnabled ? (
            <div className="mt-5 rounded-xl border border-[#c49746]/25 bg-black/20 p-4" aria-live="polite">
              <p className={macReaderState === "ready" ? "text-emerald-300" : "text-[#eac987]"}>
                {macReaderState === "ready" ? "● Mac-NFC-Leser bereit" : macReaderState === "connecting" ? "○ Mac-Leser verbindet …" : "○ Mac-Leser nicht verbunden"}
              </p>
              <p className="mt-2 text-sm text-white/70">{macReaderMessage}</p>
              <p className="mt-3 text-xs text-white/50">Lokaler Dienst auf diesem Mac: <code>python3 scripts/vip-nfc-mac-bridge.py</code> (Port 8767).</p>
            </div>
          ) : null}
          {keyboardMode ? (
            <form className="mt-5 space-y-3" onSubmit={event => void submitKeyboardScan(event)}>
              <label className="block text-sm text-white/70" htmlFor="vip-keyboard-reader">
                Karte auflegen – die UID muss automatisch in dieses Feld geschrieben und mit Enter bestätigt werden.
              </label>
              <input id="vip-keyboard-reader" ref={readerInputRef} value={keyboardUid}
                onChange={event => setKeyboardUid(event.target.value)} autoComplete="off" spellCheck={false}
                placeholder="Warte auf Karten-UID + Enter …" aria-label="NFC-Karten-UID"
                className="w-full rounded-lg border border-[#c49746]/40 bg-[#090e0b] p-4 font-mono text-white outline-none focus:border-[#c49746]" />
              <button type="submit" disabled={readerBusy} className="rounded-full bg-[#c49746] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50">
                {readerBusy ? "Verarbeitung …" : "UID bestätigen"}
              </button>
            </form>
          ) : null}
          {readerMessage ? <p role="status" className="mt-4 text-sm text-[#eac987]">{readerMessage}</p> : null}
          <p className="mt-4 text-xs text-white/45">
            PC/SC-/CCID-Leser benötigen den lokalen Mac-NFC-Dienst; die Website sendet die Scans über die bestehende Admin-Sitzung.
            &quot;Server verbunden&quot; bestätigt nur den Pastera-Server. Den Hardwarestatus zeigt &quot;Mac-NFC-Leser bereit&quot;.
          </p>
        </section>

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
