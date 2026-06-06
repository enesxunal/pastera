"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  clearCartSnapshot,
  loadCartSnapshot,
  removeBowlFromCart,
  removeExtraFromCart,
  resolveCartLines,
  resolveCartSections,
  setExtraQtyInCart,
  type CartSnapshot,
} from "@/lib/cart";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  activateSavedAddress,
  type SavedAddress,
} from "@/lib/activate-saved-address";
import { loadDeliveryContact, saveDeliveryContact } from "@/lib/delivery-contact";
import { loadDeliveryContext, clearDeliveryContext } from "@/lib/delivery-context";
import { loadDineInContext } from "@/lib/dine-in-context";
import { loadPickupContext, savePickupContext, clearPickupContext } from "@/lib/pickup-context";
import type { PaymentType } from "@/lib/order-types";
import { formatEur } from "@/lib/format";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import {
  isPayPalEnabled,
  PayPalCheckoutButtons,
} from "@/components/warenkorb/PayPalCheckoutButtons";
import type { SubmitOrderPayload } from "@/lib/submit-order";

type BranchOption = { id: string; slug: string; name: string };
const paypalEnabled = isPayPalEnabled();

export function WarenkorbClient() {
  const router = useRouter();
  const { catalog } = useCatalog();
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [deliveryReady, setDeliveryReady] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [activateBusy, setActivateBusy] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [checkoutErr, setCheckoutErr] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [modeTab, setModeTab] = useState<"delivery" | "pickup">("delivery");
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [pickupBranchId, setPickupBranchId] = useState("");
  const [pickupName, setPickupName] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const refresh = useCallback(() => {
    setCart(loadCartSnapshot());
  }, []);

  const syncDelivery = useCallback(() => {
    setDeliveryReady(!!loadDeliveryContext() || !!loadDineInContext() || !!loadPickupContext());
  }, []);

  useEffect(() => {
    refresh();
    syncDelivery();
    setMounted(true);
    const contact = loadDeliveryContact();
    if (contact?.customerPhone) setPhoneInput(contact.customerPhone);
    window.addEventListener("pastera-cart-update", refresh);
    window.addEventListener("pastera-delivery-update", syncDelivery);
    window.addEventListener("pastera-dine-in-update", syncDelivery);
    window.addEventListener("pastera-pickup-update", syncDelivery);
    return () => {
      window.removeEventListener("pastera-cart-update", refresh);
      window.removeEventListener("pastera-delivery-update", syncDelivery);
      window.removeEventListener("pastera-dine-in-update", syncDelivery);
      window.removeEventListener("pastera-pickup-update", syncDelivery);
    };
  }, [refresh, syncDelivery]);

  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setProfileName("");
      setProfilePhone("");
      return;
    }

    void (async () => {
      const [addrRes, profileRes] = await Promise.all([
        fetch("/api/account/addresses", { credentials: "include" }),
        fetch("/api/account/profile", { credentials: "include" }),
      ]);
      const addrJson = (await addrRes.json()) as { addresses?: SavedAddress[] };
      setSavedAddresses(addrJson.addresses ?? []);

      const profileJson = (await profileRes.json()) as {
        profile?: { full_name?: string; phone?: string };
      };
      const p = profileJson.profile;
      const name = p?.full_name?.trim() ?? "";
      const phone = p?.phone?.trim() ?? "";
      if (name) {
        setProfileName(name);
        setPickupName((x) => x || name);
      }
      if (phone) {
        setProfilePhone(phone);
        setPhoneInput((x) => x || phone);
        setPickupPhone((x) => x || phone);
      }
    })().catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!mounted) return;
    if (loadDineInContext()) return;
    if (loadDeliveryContext()) setModeTab("delivery");
    else if (loadPickupContext()) setModeTab("pickup");
  }, [mounted, deliveryReady]);

  useEffect(() => {
    if (!mounted || loadDineInContext()) return;
    void fetch("/api/branches")
      .then((r) => r.json())
      .then((j: { branches?: BranchOption[] }) => {
        const list = j.branches ?? [];
        setBranches(list);
        setPickupBranchId((prev) => prev || list[0]?.id || "");
      })
      .catch(() => {});
  }, [mounted]);

  function switchToDeliveryTab() {
    setCheckoutErr("");
    setModeTab("delivery");
    clearPickupContext();
    syncDelivery();
  }

  function switchToPickupTab() {
    setCheckoutErr("");
    setModeTab("pickup");
    clearDeliveryContext();
    if (user && pickupBranchId) confirmPickupOnCart(pickupBranchId);
    syncDelivery();
  }

  useEffect(() => {
    if (!mounted || !user || modeTab !== "pickup" || loadPickupContext() || loadDineInContext()) return;
    if (!pickupBranchId || branches.length === 0) return;
    confirmPickupOnCart(pickupBranchId);
  }, [mounted, user, modeTab, pickupBranchId, branches.length]);

  function confirmPickupOnCart(branchId = pickupBranchId) {
    setCheckoutErr("");
    const b = branches.find((x) => x.id === branchId);
    if (!b) {
      setCheckoutErr(t("cart.checkoutFailed"));
      return;
    }
    const name = user
      ? profileName || pickupName.trim() || String(user.user_metadata?.full_name ?? "")
      : pickupName.trim();
    const phone = user ? profilePhone || pickupPhone.trim() : pickupPhone.trim();
    savePickupContext({
      branchId: b.id,
      branchSlug: b.slug,
      branchName: b.name,
      customerName: name || undefined,
      customerPhone: phone || undefined,
    });
    syncDelivery();
  }

  function handlePickupBranchChange(branchId: string) {
    setPickupBranchId(branchId);
    if (user) confirmPickupOnCart(branchId);
  }

  async function applySavedAddress(addr: SavedAddress) {
    setCheckoutErr("");
    const phone =
      profilePhone ||
      phoneInput.trim() ||
      loadDeliveryContact()?.customerPhone?.trim();
    if (!phone) {
      setCheckoutErr(t("cart.phoneRequired"));
      return;
    }
    const name =
      profileName || String(user?.user_metadata?.full_name ?? user?.email ?? "");
    setActivateBusy(true);
    try {
      const result = await activateSavedAddress(addr, {
        customerName: name,
        customerPhone: phone,
      });
      if (!result.ok) {
        if (result.error === "out_of_range") {
          setCheckoutErr(t("cart.outOfRange"));
        } else {
          setCheckoutErr(t("cart.addressActivateFailed"));
        }
        return;
      }
      saveDeliveryContact({ customerName: name, customerPhone: phone });
      setModeTab("delivery");
      syncDelivery();
    } finally {
      setActivateBusy(false);
    }
  }

  function finishOrderSuccess(shortId: string, deliveryBranchName?: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pastera-order-short-id", shortId);
      if (deliveryBranchName) {
        sessionStorage.setItem("pastera-order-branch-name", deliveryBranchName);
      }
    }
    clearCartSnapshot();
    router.push(`/bestellung/erfolg?id=${shortId}`);
  }

  function mapOrderApiError(json: { error?: string; distanceKm?: number; maxKm?: number }) {
    if (json.error === "delivery_required" || json.error === "delivery_invalid") {
      return t("cart.needDelivery");
    }
    if (json.error === "out_of_range") {
      const dist = json.distanceKm != null ? `${json.distanceKm}` : "";
      const max = json.maxKm != null ? `${json.maxKm}` : "";
      return dist && max
        ? `${t("cart.outOfRange")} (${dist} km / max ${max} km)`
        : t("cart.outOfRange");
    }
    if (json.error?.includes("column") || json.error?.includes("schema")) {
      return t("cart.dbSchemaError");
    }
    return json.error ? `${t("cart.checkoutFailed")} (${json.error})` : t("cart.checkoutFailed");
  }

  function buildOrderPayload():
    | Omit<SubmitOrderPayload, "paymentType" | "paypalOrderId">
    | null {
    const snap = loadCartSnapshot();
    const dineIn = loadDineInContext();
    const delivery = loadDeliveryContext();
    const pickup = loadPickupContext();

    if (!snap || (!dineIn && !delivery && !pickup)) return null;

    const resolved = resolveCartLines(snap, catalog, locale);
    return {
      total: resolved.total,
      lines: resolved.lines,
      cart: snap,
      ...(dineIn
        ? {
            branchId: dineIn.branchId,
            branchSlug: dineIn.branchSlug,
            tableNumber: dineIn.tableNumber,
            orderType: "dine_in" as const,
          }
        : pickup
          ? {
              branchId: pickup.branchId,
              branchSlug: pickup.branchSlug,
              orderType: "pickup" as const,
              customerName: pickup.customerName,
              customerPhone: pickup.customerPhone,
            }
          : delivery
            ? {
                branchId: delivery.branchId,
                branchSlug: delivery.branchSlug,
                orderType: "delivery" as const,
                customerName: delivery.customerName,
                customerPhone: delivery.customerPhone,
                delivery: {
                  street: delivery.street,
                  city: delivery.city,
                  postal: delivery.postal,
                  lat: delivery.lat,
                  lng: delivery.lng,
                  distanceKm: delivery.distanceKm,
                },
              }
            : {}),
    };
  }

  async function completeDemoOrder() {
    setCheckoutErr("");
    if (paymentType === "online") return;

    const payload = buildOrderPayload();
    if (!payload) {
      setCheckoutErr(t("cart.needOrderContext"));
      return;
    }

    const delivery = loadDeliveryContext();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          paymentType,
        }),
      });
      const json = (await res.json()) as {
        orderShortId?: string;
        error?: string;
        distanceKm?: number;
        maxKm?: number;
      };
      if (!res.ok || !json.orderShortId) {
        setCheckoutErr(mapOrderApiError(json));
        return;
      }
      finishOrderSuccess(json.orderShortId, delivery?.branchName);
    } catch {
      setCheckoutErr(t("cart.checkoutFailed"));
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="text-white/50">{t("cart.loading")}</p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-white">{t("cart.emptyTitle")}</h1>
        <p className="mt-3 text-white/55">{t("cart.emptyBody")}</p>
        <Link
          href="/builder"
          className="mt-8 inline-flex rounded-full px-8 py-3 font-display text-sm font-bold text-[#0a0a0a]"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("cart.emptyCta")}
        </Link>
      </div>
    );
  }

  const sections = resolveCartSections(cart, catalog, locale);
  const { bowls, extras, total } = sections;
  const dineIn = mounted && deliveryReady ? loadDineInContext() : null;
  const delivery = mounted && deliveryReady ? loadDeliveryContext() : null;
  const pickup = mounted && deliveryReady ? loadPickupContext() : null;
  const canCheckout = !!(dineIn || delivery || pickup);

  const checkoutLabel = dineIn
    ? t("cart.checkoutDineIn")
    : pickup
      ? t("cart.checkoutPickup")
      : t("cart.checkoutDelivery");
  const itemCount = bowls.length + extras.reduce((n, x) => n + x.qty, 0);
  const showPhoneInput = !!user && !profilePhone;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 lg:py-14 lg:pb-14">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-[#c49746]">
        {t("cart.pageKicker")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
        {t("cart.pageTitle")}
      </h1>
      <p className="mt-2 max-w-xl text-white/55">{t("cart.pageSubtitle")}</p>

      <div className="mt-10 flex max-w-3xl flex-col gap-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border-2 border-[#2e402a] bg-gradient-to-b from-[#141414] to-[#0c0c0c] shadow-box"
          >
            <div className="flex items-center justify-between border-b border-[#2e402a]/80 bg-[#1a1a1a]/80 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-[#c49746]">
                {t("cart.sectionProducts")}
              </h2>
              {itemCount > 0 ? (
                <span className="rounded-full bg-[#2e402a]/60 px-2.5 py-0.5 text-xs font-semibold text-white/70">
                  {itemCount}
                </span>
              ) : null}
            </div>

            <div className="divide-y divide-[#2e402a]/60">
              {bowls.map((bowl, bowlIndex) => {
                const detailLines = bowl.bowlLines.slice(1);
                const editHref = bowl.isChocolate
                  ? `/builder/chocolate?edit=1&bowl=${encodeURIComponent(bowl.id)}`
                  : `/builder?edit=1&bowl=${encodeURIComponent(bowl.id)}`;
                return (
                  <div key={bowl.id} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {bowls.length > 1 ? `${bowlIndex + 1}. ${bowl.pastaName}` : bowl.pastaName}
                        </p>
                        <p className="mt-0.5 text-xs uppercase tracking-widest text-white/40">
                          {t("cart.sectionBowl")}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-lg font-bold text-[#c49746]">
                        {formatEur(bowl.bowlSubtotal)}
                      </span>
                    </div>
                    {detailLines.length > 0 ? (
                      <ul className="mt-3 space-y-1.5 border-l-2 border-[#c49746]/30 pl-3">
                        {detailLines.map((line, idx) => (
                          <li
                            key={`${bowl.id}-${line.kind}-${line.label}-${idx}`}
                            className="flex justify-between gap-3 text-sm text-white/70"
                          >
                            <span>{line.label}</span>
                            <span className="shrink-0 text-[#c49746]/90">{formatEur(line.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-white/40">{t("cart.bowlEmptyHint")}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link
                        href={editHref}
                        className="inline-flex min-h-11 items-center rounded-lg border border-[#c49746]/45 px-4 text-sm font-semibold text-[#c49746] transition hover:bg-[#c49746]/10"
                      >
                        {t("cart.editBowl")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeBowlFromCart(bowl.id)}
                        className="text-xs font-semibold text-red-300/80 hover:text-red-300"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                );
              })}

              {bowls.length > 0 ? (
                <div className="border-t border-[#2e402a]/60 bg-[#0f0f0f]/50 px-5 py-4 sm:px-6">
                  <Link
                    href="/builder?new=1"
                    className="inline-flex min-h-11 items-center rounded-lg border border-[#2e402a] px-4 text-sm font-semibold text-white/70 transition hover:border-[#c49746]/35 hover:text-white"
                  >
                    {t("cart.newBowl")}
                  </Link>
                </div>
              ) : null}

              {extras.map((line) => {
                const lineImageSrc = publicMenuImageSrc(line.image);
                return (
                  <div key={line.id} className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#2e402a] bg-black sm:h-20 sm:w-20">
                      {lineImageSrc ? (
                        <Image
                          src={lineImageSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-[#1a2218] to-[#0a0a0a]"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug text-white">{line.label}</p>
                          <p className="mt-0.5 text-xs text-white/45">
                            {formatEur(line.unitPrice)} · {line.qty}×
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-[#c49746]">
                          {formatEur(line.lineTotal)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg border border-[#2e402a] bg-black/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => setExtraQtyInCart(line.id, line.qty - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-base font-bold text-white transition hover:bg-white/10 sm:h-10 sm:w-10"
                            aria-label={t("cart.ariaDecrease")}
                          >
                            −
                          </button>
                          <span className="min-w-[1.75rem] text-center text-sm font-bold text-white">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            disabled={line.qty >= 99}
                            onClick={() => setExtraQtyInCart(line.id, line.qty + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-base font-bold text-white transition hover:bg-white/10 disabled:opacity-35 sm:h-10 sm:w-10"
                            aria-label={t("cart.ariaIncrease")}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExtraFromCart(line.id)}
                          className="text-xs font-semibold text-red-300/80 hover:text-red-300"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <div className="rounded-2xl border-2 border-[#2e402a] bg-[#111] p-5 shadow-box sm:p-6">
            {dineIn ? (
              <p className="mb-4 rounded-xl border border-[#c49746]/35 bg-[#c49746]/10 p-4 text-sm text-[#c49746]">
                {t("dineIn.banner")} {dineIn.branchName} · {t("account.table")} {dineIn.tableNumber}
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t("cart.orderModeTitle")}
                </p>
                <div className="mb-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => switchToDeliveryTab()}
                    className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-bold ${
                      modeTab === "delivery"
                        ? "bg-[#c49746] text-[#0a0a0a]"
                        : "border border-[#2e402a] text-white/60 hover:border-[#c49746]/40"
                    }`}
                  >
                    {t("cart.modeDelivery")}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToPickupTab()}
                    className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-bold ${
                      modeTab === "pickup"
                        ? "bg-[#c49746] text-[#0a0a0a]"
                        : "border border-[#2e402a] text-white/60 hover:border-[#c49746]/40"
                    }`}
                  >
                    {t("cart.modePickup")}
                  </button>
                </div>

                {modeTab === "delivery" ? (
                  <div className="mb-5">
                    {delivery ? (
                      <div className="rounded-xl border-2 border-[#c49746]/50 bg-[#c49746]/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                          {t("cart.deliverySelected")}
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {delivery.street}, {delivery.postal ? `${delivery.postal} ` : ""}
                          {delivery.city}
                        </p>
                        <p className="mt-1 text-xs text-white/45">{delivery.branchName}</p>
                      </div>
                    ) : savedAddresses.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
                          {t("cart.savedAddresses")}
                        </p>
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            disabled={activateBusy}
                            onClick={() => void applySavedAddress(addr)}
                            className="flex w-full flex-col gap-1 rounded-xl border border-[#2e402a] bg-[#0f0f0f] p-4 text-left transition hover:border-[#c49746]/50 disabled:opacity-50"
                          >
                            <span className="font-semibold text-[#c49746]">{addr.label}</span>
                            <span className="text-sm text-white/85">
                              {addr.street}, {addr.postal ? `${addr.postal} ` : ""}
                              {addr.city}
                            </span>
                          </button>
                        ))}
                        {showPhoneInput ? (
                          <label className="mt-3 block text-xs text-white/55">
                            {t("delivery.phone")}
                            <input
                              type="tel"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
                            />
                          </label>
                        ) : null}
                        <Link
                          href="/lieferung"
                          className="mt-2 inline-block text-xs text-[#c49746] underline"
                        >
                          {t("cart.goDelivery")}
                        </Link>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#2e402a] bg-[#0f0f0f] p-4">
                        <p className="text-sm text-white/70">{t("cart.needDeliveryHint")}</p>
                        <Link
                          href="/lieferung"
                          className="mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold text-[#0a0a0a]"
                          style={{ backgroundColor: "#c49746" }}
                        >
                          {t("cart.goDelivery")}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-5">
                    {pickup ? (
                      <div className="rounded-xl border-2 border-[#c49746]/50 bg-[#c49746]/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                          {t("cart.pickupSelected")}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">{pickup.branchName}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-[#2e402a] bg-[#0f0f0f] p-4">
                        <p className="text-sm text-white/70">
                          {user ? t("cart.pickupLoggedInHint") : t("cart.pickupHint")}
                        </p>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-white/45">
                          {t("cart.pickupBranchLabel")}
                          <select
                            value={pickupBranchId}
                            onChange={(e) => handlePickupBranchChange(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-3 text-base text-white"
                          >
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        {!user ? (
                          <>
                            <label className="block text-xs text-white/55">
                              {t("auth.name")}
                              <input
                                value={pickupName}
                                onChange={(e) => setPickupName(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
                              />
                            </label>
                            <label className="block text-xs text-white/55">
                              {t("delivery.phone")}
                              <input
                                type="tel"
                                value={pickupPhone}
                                onChange={(e) => setPickupPhone(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => confirmPickupOnCart()}
                              className="w-full min-h-11 rounded-full text-sm font-bold text-[#0a0a0a]"
                              style={{ backgroundColor: "#c49746" }}
                            >
                              {t("cart.pickupSave")}
                            </button>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {canCheckout ? (
              <div className="mb-4 border-t border-[#2e402a]/60 pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t("cart.paymentMethod")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutErr("");
                      setPaymentType("cash");
                    }}
                    className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold ${
                      paymentType === "cash"
                        ? "bg-[#c49746] text-[#0a0a0a]"
                        : "border border-[#2e402a] text-white/60"
                    }`}
                  >
                    {t("cart.payCash")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutErr("");
                      setPaymentType("card");
                    }}
                    className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold ${
                      paymentType === "card"
                        ? "bg-[#c49746] text-[#0a0a0a]"
                        : "border border-[#2e402a] text-white/60"
                    }`}
                  >
                    {t("cart.payCard")}
                  </button>
                  {paypalEnabled && !dineIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutErr("");
                        setPaymentType("online");
                      }}
                      className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold ${
                        paymentType === "online"
                          ? "bg-[#c49746] text-[#0a0a0a]"
                          : "border border-[#2e402a] text-white/60"
                      }`}
                    >
                      {t("cart.payPayPal")}
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-white/35">
                  {paymentType === "online"
                    ? t("cart.paymentPayPalHint")
                    : paypalEnabled && !dineIn
                      ? t("cart.paymentMixedHint")
                      : t("cart.paymentTestHint")}
                </p>
                {paymentType === "online" && paypalEnabled ? (
                  <div className="mt-4 max-w-md">
                    <PayPalCheckoutButtons
                      total={total}
                      disabled={!canCheckout}
                      buildOrderPayload={buildOrderPayload}
                      onSuccess={(orderShortId) => {
                        setCheckoutErr("");
                        finishOrderSuccess(orderShortId, delivery?.branchName);
                      }}
                      onError={setCheckoutErr}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            {checkoutErr ? <p className="mb-3 text-sm text-red-400">{checkoutErr}</p> : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t("cart.total")}
                </p>
                <p className="font-display text-3xl font-bold text-white">{formatEur(total)}</p>
              </div>
              <button
                type="button"
                onClick={completeDemoOrder}
                disabled={!canCheckout || paymentType === "online"}
                className="hidden items-center justify-center rounded-full px-8 py-3 font-display text-sm font-bold text-[#0a0a0a] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 lg:inline-flex"
                style={{ backgroundColor: "#c49746" }}
              >
                {checkoutLabel}
              </button>
            </div>
          </div>
      </div>

      {canCheckout && paymentType !== "online" ? (
        <MobileActionBar
          totalLabel={t("cart.total")}
          total={formatEur(total)}
          buttonLabel={checkoutLabel}
          onAction={completeDemoOrder}
        />
      ) : canCheckout && paymentType === "online" ? (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2e402a] bg-matte/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                {t("cart.total")}
              </p>
              <p className="font-display text-2xl font-bold text-white">{formatEur(total)}</p>
            </div>
            <p className="max-w-[11rem] text-right text-xs text-white/50">{t("cart.paypalMobileHint")}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
