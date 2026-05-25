"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { applyDeliverySession } from "@/lib/apply-delivery-session";
import { saveDeliveryContact } from "@/lib/delivery-contact";
import { saveDeliveryContext } from "@/lib/delivery-context";

export function DeliveryEntryClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [useGps, setUseGps] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [assignedBranch, setAssignedBranch] = useState<string | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [hideContact, setHideContact] = useState(false);
  const autoTried = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfileReady(true);
      return;
    }

    void (async () => {
      try {
        const [profileRes, addrRes, prepRes] = await Promise.all([
          fetch("/api/account/profile", { credentials: "include" }),
          fetch("/api/account/addresses", { credentials: "include" }),
          fetch("/api/account/prepare-delivery", { method: "POST", credentials: "include" }),
        ]);

        const profileJson = (await profileRes.json()) as {
          profile?: { full_name?: string; phone?: string };
        };
        const p = profileJson.profile;
        if (p?.full_name) setName(p.full_name);
        if (p?.phone) setPhone(p.phone);
        setHideContact(Boolean(p?.full_name?.trim() && p?.phone?.trim()));

        const addrJson = (await addrRes.json()) as {
          addresses?: { street: string; city: string; postal?: string; is_default: boolean }[];
        };
        const list = addrJson.addresses ?? [];
        const def = list.find((a) => a.is_default) ?? list[0];
        if (def) {
          setStreet(def.street);
          setCity(def.city);
          setPostal(def.postal ?? "");
        }

        if (!autoTried.current) {
          autoTried.current = true;
          const j = (await prepRes.json()) as {
            ok?: boolean;
            needAddress?: boolean;
            needPhone?: boolean;
            branchId?: string;
            branchSlug?: string;
            branchName?: string;
            street?: string;
            city?: string;
            postal?: string;
            lat?: number;
            lng?: number;
            distanceKm?: number;
            customerName?: string;
            customerPhone?: string;
          };
          if (j.ok && j.branchId && j.lat != null && j.lng != null && !j.needPhone) {
            applyDeliverySession({
              branchId: j.branchId,
              branchSlug: j.branchSlug!,
              branchName: j.branchName!,
              street: j.street!,
              city: j.city!,
              postal: j.postal ?? "",
              lat: j.lat,
              lng: j.lng,
              distanceKm: j.distanceKm!,
              customerName: j.customerName ?? name,
              customerPhone: j.customerPhone ?? phone,
            });
            router.replace("/menu");
            return;
          }
        }
      } catch {
        /* sessiz */
      } finally {
        setProfileReady(true);
      }
    })();
  }, [user, authLoading, router, name, phone]);

  function requestGps() {
    setErr("");
    if (!navigator.geolocation) {
      setErr(t("delivery.gpsUnavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseGps(true);
      },
      () => setErr(t("delivery.gpsDenied")),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setAssignedBranch(null);
    setBusy(true);
    try {
      const res = await fetch("/api/delivery/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street,
          city,
          postal,
          ...(useGps && gps ? { lat: gps.lat, lng: gps.lng } : {}),
        }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        distanceKm?: number;
        branchId?: string;
        branchSlug?: string;
        branchName?: string;
        lat?: number;
        lng?: number;
        maxKm?: number;
      };

      if (!res.ok || !j.ok) {
        if (j.error === "out_of_range") {
          const dist = j.distanceKm != null ? String(j.distanceKm) : "?";
          const max = j.maxKm != null ? String(j.maxKm) : "?";
          const branch = j.branchName ? ` (${j.branchName})` : "";
          setErr(
            locale === "de"
              ? `Außerhalb des Liefergebiets${branch}: ${dist} km entfernt, maximal ${max} km.`
              : `Teslimat alanı dışı${branch}: ${dist} km uzakta, en fazla ${max} km.`,
          );
        } else if (j.error === "geocode_failed") {
          setErr(t("delivery.geocodeFailed"));
        } else if (j.error === "branch_no_location") {
          setErr(t("delivery.branchNoLocation"));
        } else {
          setErr(t("delivery.checkFailed"));
        }
        return;
      }

      setAssignedBranch(j.branchName ?? null);

      saveDeliveryContact({
        customerName: name.trim(),
        customerPhone: phone.trim(),
      });
      saveDeliveryContext({
        branchId: j.branchId!,
        branchSlug: j.branchSlug!,
        branchName: j.branchName!,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        postal: postal.trim(),
        lat: j.lat!,
        lng: j.lng!,
        distanceKm: j.distanceKm!,
      });

      if (user) {
        void fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: street.trim(),
            city: city.trim(),
            postal: postal.trim(),
            lat: j.lat,
            lng: j.lng,
            isDefault: true,
          }),
        });
      }

      router.push("/menu");
    } finally {
      setBusy(false);
    }
  }

  if (!profileReady && user) {
    return <div className="py-20 text-center text-white/50">{t("auth.loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">{t("delivery.kicker")}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">{t("delivery.title")}</h1>
      <p className="mt-3 text-sm text-white/55">
        {hideContact ? t("delivery.introLoggedIn") : t("delivery.introAuto")}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {!hideContact ? (
          <>
            <label className="block text-sm text-white/60">
              {t("delivery.name")}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
              />
            </label>
            <label className="block text-sm text-white/60">
              {t("delivery.phone")}
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
              />
            </label>
          </>
        ) : (
          <p className="rounded-lg border border-[#2e402a] bg-[#111] px-4 py-3 text-sm text-white/60">
            {name} · {phone}
          </p>
        )}
        <label className="block text-sm text-white/60">
          {t("delivery.street")}
          <input
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-white/60">
            {t("delivery.postal")}
            <input
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
            />
          </label>
          <label className="block text-sm text-white/60">
            {t("delivery.city")}
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={requestGps}
          className="w-full rounded-lg border border-[#2e402a] py-2.5 text-sm text-white/70 hover:border-[#c49746]/40"
        >
          {useGps && gps ? t("delivery.gpsOk") : t("delivery.gpsUse")}
        </button>

        {assignedBranch ? (
          <p className="text-sm text-[#c49746]">
            {t("delivery.assignedBranch")}: {assignedBranch}
          </p>
        ) : null}

        {err ? <p className="text-sm text-red-400">{err}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full py-3 font-display text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
          style={{ backgroundColor: "#c49746" }}
        >
          {busy ? "…" : t("delivery.submit")}
        </button>
      </form>

      {user ? (
        <Link href="/auth/account" className="mt-6 block text-center text-sm text-white/40 hover:text-[#c49746]">
          {t("delivery.changeAccount")}
        </Link>
      ) : null}
    </div>
  );
}
