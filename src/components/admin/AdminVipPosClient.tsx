"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VipStampCard } from "@/components/vip/VipStampCard";

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

type LocalReaderEvent = { seq: number; uid: string; eventId: string };
type LocalReaderStatus = {
  ok?: boolean;
  readerReady?: boolean;
  sequence?: number;
  instanceId?: string;
  readers?: string[];
  error?: string;
};
type LocalReaderEvents = {
  ok?: boolean;
  sequence?: number;
  instanceId?: string;
  readerAlive?: boolean;
  events?: LocalReaderEvent[];
};

/** One cashier screen, one background PC/SC reader, no connection buttons. */
export function AdminVipPosClient() {
  const router = useRouter();
  const [latest, setLatest] = useState<PosEvent | null>(null);
  const [serverOnline, setServerOnline] = useState(true);
  const [readerState, setReaderState] = useState<"connecting" | "ready" | "offline">("connecting");
  const [readerNotice, setReaderNotice] = useState("Verbindung zum Lesegerät wird hergestellt …");
  const [newScan, setNewScan] = useState(false);
  const lastPosEventRef = useRef<string | null>(null);
  const firstPosReadRef = useRef(true);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanSequenceRef = useRef<number | null>(null);
  const bridgeInstanceRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/vip/pos", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("server_unavailable");
      const data = await response.json() as { ok: boolean; latest: PosEvent | null };
      if (!data.ok) throw new Error("invalid_response");
      setServerOnline(true);
      if (data.latest) {
        const changed = !firstPosReadRef.current && lastPosEventRef.current !== data.latest.id;
        setLatest(data.latest);
        lastPosEventRef.current = data.latest.id;
        if (changed) {
          setNewScan(true);
          if (flashRef.current) clearTimeout(flashRef.current);
          flashRef.current = setTimeout(() => setNewScan(false), 3800);
        }
      } else {
        setLatest(null);
      }
      firstPosReadRef.current = false;
    } catch {
      setServerOnline(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 1500);
    return () => {
      clearInterval(timer);
      if (flashRef.current) clearTimeout(flashRef.current);
    };
  }, [refresh]);

  useEffect(() => {
    const base = "http://127.0.0.1:8767";
    let disposed = false;
    let busy = false;
    let ready = false;
    let nextRetryAt = 0;

    async function readLocal<T>(path: string): Promise<T> {
      const response = await fetch(`${base}${path}`, { cache: "no-store", credentials: "omit" });
      if (!response.ok) throw new Error("local_service_unavailable");
      return response.json() as Promise<T>;
    }

    async function tick() {
      if (disposed || busy) return;
      if (!ready && Date.now() < nextRetryAt) return;
      busy = true;
      try {
        if (!ready || scanSequenceRef.current === null) {
          // Runs automatically on page load. Chrome may ask for local-network
          // permission on first use; only the browser can remember that choice.
          const status = await readLocal<LocalReaderStatus>("/status");
          if (typeof status.sequence !== "number" || !status.instanceId) {
            throw new Error("reader_service_not_running");
          }
          if (disposed) return;
          // Replay all buffered events on first load and after bridge restarts.
          // Each eventId is stable, so the live server safely deduplicates
          // previously delivered events. This prevents losing cards scanned
          // before the browser finished loading or after a page refresh.
          if (bridgeInstanceRef.current !== status.instanceId) {
            scanSequenceRef.current = 0;
            bridgeInstanceRef.current = status.instanceId;
          }
          ready = true;
          setReaderState(status.readerReady ? "ready" : "offline");
          setReaderNotice(status.readerReady ? "" : "Der NFC-Leser ist am Mac nicht erreichbar. Bitte die USB-Verbindung prüfen.");
        }

        const result = await readLocal<LocalReaderEvents>(`/events?after=${scanSequenceRef.current ?? 0}`);
        if (!result.ok || !Array.isArray(result.events)) {
          throw new Error("local_service_unavailable");
        }
        if (disposed) return;
        if (result.instanceId && result.instanceId !== bridgeInstanceRef.current) {
          scanSequenceRef.current = 0;
          bridgeInstanceRef.current = result.instanceId;
        }
        const acknowledge = async (eventId: string) => {
          const ack = await fetch(`${base}/ack`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId }),
            credentials: "omit",
          });
          if (!ack.ok) throw new Error("reader_ack_failed");
        };
        for (const event of result.events) {
          if (disposed) break;
          if (!/^[a-f0-9]{8,20}$/i.test(event.uid) || !/^[a-f0-9-]{36}$/i.test(event.eventId)) {
            setReaderNotice("Die Karte konnte nicht erkannt werden. Bitte erneut auflegen.");
            // A malformed local event has no valid server credential or UID.
            // It must not block every subsequent legitimate card scan.
            if (/^[a-f0-9-]{36}$/i.test(event.eventId)) {
              await acknowledge(event.eventId);
            }
            scanSequenceRef.current = event.seq;
            continue;
          }
          try {
            setReaderNotice("Karte erkannt. Stempel wird gespeichert …");
            const response = await fetch("/api/admin/vip/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid: event.uid, eventId: event.eventId }),
            });
            if (response.status === 401) {
              router.replace("/admin/login");
              disposed = true;
              return;
            }
            const result = await response.json() as { ok?: boolean; error?: string };
            if (!response.ok || !result.ok) {
              if (response.status !== 400 && response.status !== 404) {
                // Transient failures stay queued locally with their original
                // UUID and are retried without ever granting an extra stamp.
                throw new Error("server_temporary_failure");
              }
              setReaderNotice(result.error === "unassigned_card"
                ? "Diese Karte ist noch keinem VIP-Mitglied zugeordnet."
                : "Die Karte wurde nicht erkannt. Bitte in der Verwaltung prüfen.");
            } else {
              setReaderNotice("");
              await refresh();
            }
            // Remove from durable local outbox ONLY after the live server
            // acknowledges or deterministically rejects the scan.
            await acknowledge(event.eventId);
            scanSequenceRef.current = event.seq;
          } catch {
            // Retry exactly the same eventId. The server is idempotent, so
            // an uncertain response cannot double-credit the customer's card.
            setReaderNotice("Der Scan bleibt sicher vorgemerkt und wird automatisch erneut übertragen.");
            break;
          }
        }
        ready = true;
        setReaderState(result.readerAlive ? "ready" : "offline");
        if (!result.readerAlive && !result.events.length) {
          setReaderNotice("NFC-Leser am Mac nicht verfügbar. USB-Anschluss prüfen – wir verbinden automatisch neu.");
        }
      } catch {
        if (!disposed) {
          ready = false;
          nextRetryAt = Date.now() + 2200;
          setReaderState("offline");
          setReaderNotice("Verbindung zum Mac-NFC-Dienst fehlt. Wenn Chrome nach lokalem Netzwerkzugriff fragt, einmal erlauben. Die Verbindung wird automatisch erneut versucht.");
        }
      } finally {
        busy = false;
      }
    }

    // The initial attempt can trigger the browser's one-time local network
    // permission prompt. The persistent launchd bridge works without Terminal.
    void tick();
    const interval = setInterval(() => void tick(), 850);
    return () => { disposed = true; clearInterval(interval); };
  }, [refresh, router]);

  return (
    <main className="min-h-screen bg-[#0a100d] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-[#c49746]">PASTERA</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">VIP Club · Kasse</h1>
          </div>
          <Link href="/admin/vip" className="text-sm text-[#d1b277] underline-offset-4 hover:underline">Verwaltung</Link>
        </header>

        <VipStampCard
          memberName={latest?.memberName}
          cardNumber={latest?.cardNumber}
          progress={latest?.progress ?? 0}
          stamps={latest?.stamps ?? 0}
          remaining={latest?.remaining ?? 10}
          availableRewards={latest?.availableRewards ?? 0}
          redemptions={latest?.redemptions ?? 0}
          lastScanAt={latest?.createdAt}
          animationKey={newScan && latest ? latest.id : null}
          lastDelta={latest?.delta ?? 0}
          isSimulation={latest?.isSimulation ?? false}
          waiting={!latest}
          scannerState={readerState}
          scannerMessage={readerNotice || (!serverOnline ? "Pastera-Server derzeit nicht erreichbar. Verbindung wird erneut geprüft." : "")}
        />
      </div>
    </main>
  );
}
