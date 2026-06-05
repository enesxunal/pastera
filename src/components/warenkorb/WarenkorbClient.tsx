"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  clearCartSnapshot,
  loadCartSnapshot,
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
import { PastaBox } from "@/components/pasta-builder/PastaBox";

type BranchOption = { id: string; slug: string; name: string };

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
    if (!user || loadDeliveryContext() || loadDineInContext() || loadPickupContext()) return;

    void (async () => {
      const res = await fetch("/api/account/addresses", { credentials: "include" });
      const j = (await res.json()) as { addresses?: SavedAddress[] };
      const list = j.addresses ?? [];
      setSavedAddresses(list);
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

  useEffect(() => {
    if (!user || modeTab !== "pickup" || loadPickupContext() || loadDineInContext()) return;
    void fetch("/api/account/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { profile?: { full_name?: string; phone?: string } }) => {
        const p = j.profile;
        if (p?.full_name) setPickupName((x) => x || p.full_name!);
        if (p?.phone) setPickupPhone((x) => x || p.phone!);
      })
      .catch(() => {});
  }, [user, modeTab]);

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
    syncDelivery();
  }

  function confirmPickupOnCart() {
    setCheckoutErr("");
    const b = branches.find((x) => x.id === pickupBranchId);
    if (!b) {
      setCheckoutErr(t("cart.checkoutFailed"));
      return;
    }
    savePickupContext({
      branchId: b.id,
      branchSlug: b.slug,
      branchName: b.name,
      customerName: pickupName.trim() || undefined,
      customerPhone: pickupPhone.trim() || undefined,
    });
    syncDelivery();
  }

  async function applySavedAddress(addr: SavedAddress) {
    setCheckoutErr("");
    const phone = phoneInput.trim() || loadDeliveryContact()?.customerPhone?.trim();
    if (!phone) {
      setCheckoutErr(t("cart.phoneRequired"));
      return;
    }
    const name = String(user?.user_metadata?.full_name ?? user?.email ?? "");
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

  async function completeDemoOrder() {
    setCheckoutErr("");
    const snap = loadCartSnapshot();
    const dineIn = loadDineInContext();
    const delivery = loadDeliveryContext();
    const pickup = loadPickupContext();

    if (!dineIn && !delivery && !pickup) {
      setCheckoutErr(t("cart.needOrderContext"));
      return;
    }

    let shortId: string | undefined;
    if (snap) {
      const resolved = resolveCartLines(snap, catalog, locale);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total: resolved.total,
            lines: resolved.lines,
            cart: snap,
            paymentType,
            ...(dineIn
              ? {
                  branchId: dineIn.branchId,
                  branchSlug: dineIn.branchSlug,
                  tableNumber: dineIn.tableNumber,
                  orderType: "dine_in",
                }
              : pickup
                ? {
                    branchId: pickup.branchId,
                    branchSlug: pickup.branchSlug,
                    orderType: "pickup",
                    customerName: pickup.customerName,
                    customerPhone: pickup.customerPhone,
                  }
                : delivery
                  ? {
                      branchId: delivery.branchId,
                      branchSlug: delivery.branchSlug,
                      orderType: "delivery",
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
          }),
        });
        const json = (await res.json()) as {
          orderShortId?: string;
          error?: string;
          distanceKm?: number;
          maxKm?: number;
        };
        if (!res.ok) {
          if (json.error === "delivery_required" || json.error === "delivery_invalid") {
            setCheckoutErr(t("cart.needDelivery"));
          } else if (json.error === "out_of_range") {
            const dist = json.distanceKm != null ? `${json.distanceKm}` : "";
            const max = json.maxKm != null ? `${json.maxKm}` : "";
            setCheckoutErr(
              dist && max
                ? `${t("cart.outOfRange")} (${dist} km / max ${max} km)`
                : t("cart.outOfRange"),
            );
          } else if (json.error?.includes("column") || json.error?.includes("schema")) {
            setCheckoutErr(t("cart.dbSchemaError"));
          } else {
            setCheckoutErr(json.error ? `${t("cart.checkoutFailed")} (${json.error})` : t("cart.checkoutFailed"));
          }
          return;
        }
        shortId = json.orderShortId;
        if (!shortId) {
          setCheckoutErr(t("cart.checkoutFailed"));
          return;
        }
      } catch {
        setCheckoutErr(t("cart.checkoutFailed"));
        return;
      }
    }
    if (!shortId) {
      setCheckoutErr(t("cart.checkoutFailed"));
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pastera-order-short-id", shortId);
      if (delivery?.branchName) {
        sessionStorage.setItem("pastera-order-branch-name", delivery.branchName);
      }
    }
    clearCartSnapshot();
    router.push(`/bestellung/erfolg?id=${shortId}`);
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
  const { bowlLines, bowlSubtotal, boxLayers, extras, extrasSubtotal, pastaName, total } =
    sections;
  const dineIn = mounted && deliveryReady ? loadDineInContext() : null;
  const delivery = mounted && deliveryReady ? loadDeliveryContext() : null;
  const pickup = mounted && deliveryReady ? loadPickupContext() : null;
  const canCheckout = !!(dineIn || delivery || pickup);

  const bowlDetailLines = bowlLines.slice(1);
  const checkoutLabel = dineIn
    ? t("cart.checkoutDineIn")
    : pickup
      ? t("cart.checkoutPickup")
      : t("cart.checkoutDelivery");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 lg:py-14 lg:pb-14">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-[#c49746]">
        {t("cart.pageKicker")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
        {t("cart.pageTitle")}
      </h1>
      <p className="mt-2 max-w-xl text-white/55">{t("cart.pageSubtitle")}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border-2 border-[#2e402a] bg-gradient-to-b from-[#141414] to-[#0c0c0c] shadow-box"
          >
            <div className="border-b border-[#2e402a]/80 bg-[#1a1a1a]/80 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-[#c49746]">
                {t("cart.sectionBowl")}
              </h2>
              <p className="mt-0.5 text-sm text-white/50">{pastaName}</p>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.08] pb-3">
                    <span className="text-base font-semibold text-white">{bowlLines[0]?.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-[#c49746]">
                      {bowlLines[0] ? formatEur(bowlLines[0].amount) : "—"}
                    </span>
                  </div>
                  {bowlDetailLines.length > 0 ? (
                    <ul className="space-y-2">
                      {bowlDetailLines.map((line, idx) => (
                        <li
                          key={`${line.kind}-${line.label}-${idx}`}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-white/75">{line.label}</span>
                          <span className="shrink-0 font-medium text-[#c49746]/90">
                            {formatEur(line.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white/40">{t("cart.bowlEmptyHint")}</p>
                  )}
                  <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/45">
                      {t("cart.bowlSubtotal")}
                    </span>
                    <span className="font-display text-xl font-bold text-white">
                      {formatEur(bowlSubtotal)}
                    </span>
                  </div>
                  <Link
                    href="/builder"
                    className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#c49746]/55 bg-[#c49746]/10 py-3 text-sm font-bold text-[#c49746] transition hover:bg-[#c49746]/20 sm:w-auto sm:px-8"
                  >
                    {t("cart.editBowl")}
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {extras.length > 0 ? (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2 className="font-display text-lg font-bold text-[#c49746]">
                {t("cart.sectionExtras")}
              </h2>
              <ul className="mt-4 flex flex-col gap-4">
                {extras.map((line) => {
                  const lineImageSrc = publicMenuImageSrc(line.image);
                  return (
                  <li
                    key={line.id}
                    className="flex gap-4 rounded-2xl border-2 border-[#2e402a] bg-[#111] p-4 shadow-md"
                  >
                    <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-[#2e402a] bg-black">
                      {lineImageSrc ? (
                        <Image
                          src={lineImageSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="112px"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-[#1a2218] to-[#0a0a0a]"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{line.label}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {formatEur(line.unitPrice)} · {t("cart.unitEach")}
                        </p>
                        <p className="mt-2 text-sm font-bold text-[#c49746]">
                          {formatEur(line.lineTotal)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 rounded-xl border border-[#2e402a] bg-black/40 p-1">
                          <button
                            type="button"
                            onClick={() => setExtraQtyInCart(line.id, line.qty - 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-white transition hover:bg-white/10"
                            aria-label={t("cart.ariaDecrease")}
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center font-display text-lg font-bold text-white">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            disabled={line.qty >= 99}
                            onClick={() => setExtraQtyInCart(line.id, line.qty + 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-white transition hover:bg-white/10 disabled:opacity-35"
                            aria-label={t("cart.ariaIncrease")}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExtraFromCart(line.id)}
                          className="min-h-11 rounded-lg border border-red-500/35 px-4 py-2 text-sm font-semibold text-red-300/90 hover:bg-red-500/10"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex justify-end border-t border-[#2e402a]/60 pt-4">
                <p className="text-sm text-white/55">
                  <span className="mr-2 uppercase tracking-widest text-white/40">
                    {t("cart.extrasSubtotal")}
                  </span>
                  <span className="font-semibold text-[#c49746]">{formatEur(extrasSubtotal)}</span>
                </p>
              </div>
            </motion.section>
          ) : null}

          <div className="rounded-2xl border-2 border-[#2e402a] bg-[#111] p-6 shadow-box">
            {dineIn ? (
              <p className="mb-4 text-sm text-[#c49746]">
                {t("dineIn.banner")} {dineIn.branchName} · {t("account.table")} {dineIn.tableNumber}
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t("cart.orderModeTitle")}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => switchToDeliveryTab()}
                    className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-bold ${
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
                    className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-bold ${
                      modeTab === "pickup"
                        ? "bg-[#c49746] text-[#0a0a0a]"
                        : "border border-[#2e402a] text-white/60 hover:border-[#c49746]/40"
                    }`}
                  >
                    {t("cart.modePickup")}
                  </button>
                </div>

                {modeTab === "delivery" ? (
                  <div className="mb-4">
                    {delivery ? (
                      <p className="text-sm text-[#c49746]">
                        {t("delivery.banner")} {delivery.street}, {delivery.city}
                      </p>
                    ) : (
                      <div className="rounded-xl border border-[#c49746]/35 bg-[#c49746]/10 p-4 text-sm text-white/75">
                        <p>{t("cart.needDeliveryHint")}</p>
                        {savedAddresses.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                              {t("cart.savedAddresses")}
                            </p>
                            {savedAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                className="flex flex-col gap-2 rounded-lg border border-[#2e402a] bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <p className="text-white/85">
                                  <span className="font-semibold">{addr.label}: </span>
                                  {addr.street}, {addr.postal ? `${addr.postal} ` : ""}
                                  {addr.city}
                                </p>
                                <button
                                  type="button"
                                  disabled={activateBusy}
                                  onClick={() => void applySavedAddress(addr)}
                                  className="min-h-11 shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
                                  style={{ backgroundColor: "#c49746" }}
                                >
                                  {t("cart.useThisAddress")}
                                </button>
                              </div>
                            ))}
                            <label className="block text-xs text-white/55">
                              {t("delivery.phone")}
                              <input
                                type="tel"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2 text-white"
                              />
                            </label>
                          </div>
                        ) : null}
                        <div className="mt-3">
                          <Link
                            href="/lieferung"
                            className="inline-flex rounded-full px-5 py-2 text-xs font-bold text-[#0a0a0a]"
                            style={{ backgroundColor: "#c49746" }}
                          >
                            {t("cart.goDelivery")}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    {pickup ? (
                      <p className="text-sm text-[#c49746]">
                        {t("pickup.banner")} {pickup.branchName}
                      </p>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-[#c49746]/35 bg-[#c49746]/10 p-4 text-sm text-white/75">
                        <p>{t("cart.pickupHint")}</p>
                        <label className="block text-xs text-white/55">
                          {t("cart.pickupBranchLabel")}
                          <select
                            value={pickupBranchId}
                            onChange={(e) => setPickupBranchId(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2 text-white"
                          >
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-xs text-white/55">
                          {t("auth.name")}
                          <input
                            value={pickupName}
                            onChange={(e) => setPickupName(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2 text-white"
                          />
                        </label>
                        <label className="block text-xs text-white/55">
                          {t("delivery.phone")}
                          <input
                            type="tel"
                            value={pickupPhone}
                            onChange={(e) => setPickupPhone(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2 text-white"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => confirmPickupOnCart()}
                          className="w-full rounded-full py-2.5 text-xs font-bold text-[#0a0a0a]"
                          style={{ backgroundColor: "#c49746" }}
                        >
                          {t("cart.pickupSave")}
                        </button>
                        <p className="text-center text-xs text-white/40">
                          <Link href="/abholung" className="text-[#c49746] underline">
                            {t("cart.goPickup")}
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {canCheckout ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t("cart.paymentMethod")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType("cash")}
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
                    onClick={() => setPaymentType("card")}
                    className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold ${
                      paymentType === "card"
                        ? "bg-[#c49746] text-[#0a0a0a]"
                        : "border border-[#2e402a] text-white/60"
                    }`}
                  >
                    {t("cart.payCard")}
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/35">{t("cart.paymentTestHint")}</p>
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
                disabled={!canCheckout}
                className="hidden items-center justify-center rounded-full px-8 py-3 font-display text-sm font-bold text-[#0a0a0a] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 lg:inline-flex"
                style={{ backgroundColor: "#c49746" }}
              >
                {checkoutLabel}
              </button>
            </div>
          </div>
        </div>

        <div className="order-1 flex flex-col items-center gap-4 lg:order-2 lg:sticky lg:top-24">
          <PastaBox pastaName={pastaName} layers={boxLayers} />
        </div>
      </div>

      {canCheckout ? (
        <MobileActionBar
          totalLabel={t("cart.total")}
          total={formatEur(total)}
          buttonLabel={checkoutLabel}
          onAction={completeDemoOrder}
        />
      ) : null}
    </div>
  );
}
