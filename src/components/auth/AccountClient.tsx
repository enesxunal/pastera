"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabasePublicConfig } from "@/lib/supabase/public-config-context";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-types";
import { formatEur } from "@/lib/format";
import { applyDeliverySession } from "@/lib/apply-delivery-session";
import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { formatOrderNumber } from "@/lib/order-display";
import { formatPcoin } from "@/lib/format-pcoin";
import type { OrderRow } from "@/lib/order-types";

type Profile = {
  full_name: string | null;
  loyalty_points: number;
};

type OrderSummary = OrderRow;

type AddressRow = {
  id: string;
  label: string;
  street: string;
  city: string;
  postal: string | null;
  is_default: boolean;
};

export function AccountClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { user, loading, configured, signOut } = useAuth();
  const supabasePublic = useSupabasePublicConfig();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderSummary | null>(null);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const supabase = createSupabaseBrowserClient(supabasePublic);
      const [profileRes, ordersRes, addrRes] = await Promise.all([
        supabase.from("profiles").select("full_name, loyalty_points").eq("id", user.id).maybeSingle(),
        fetch("/api/orders/me", { credentials: "include" }),
        fetch("/api/account/addresses", { credentials: "include" }),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);

      const ordersJson = (await ordersRes.json()) as {
        orders?: OrderSummary[];
        activeOrder?: OrderSummary | null;
      };
      if (ordersJson.orders) setOrders(ordersJson.orders);
      if (ordersJson.activeOrder !== undefined) setActiveOrder(ordersJson.activeOrder);

      const addrJson = (await addrRes.json()) as { addresses?: AddressRow[] };
      if (addrJson.addresses) setAddresses(addrJson.addresses);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => void loadData(), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function orderAgain() {
    const res = await fetch("/api/account/prepare-delivery", {
      method: "POST",
      credentials: "include",
    });
    const j = (await res.json()) as {
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
    if (j.ok && j.branchId && j.lat != null && j.lng != null) {
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
        customerName: j.customerName ?? "",
        customerPhone: j.customerPhone ?? "",
      });
      router.push("/menu");
      return;
    }
    router.push(j.needAddress || j.needPhone ? "/lieferung" : "/menu");
  }

  async function removeAddress(id: string) {
    await fetch(`/api/account/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    void loadData();
  }

  function statusLabel(status: OrderStatus) {
    return ORDER_STATUS_LABELS[status][locale];
  }

  function orderAddress(o: OrderSummary) {
    if (o.delivery_street) {
      return [o.delivery_street, o.delivery_postal, o.delivery_city].filter(Boolean).join(", ");
    }
    if (o.table_number) return `${t("account.table")} ${o.table_number}`;
    return "—";
  }

  if (loading) {
    return <div className="py-20 text-center text-white/50">{t("auth.loading")}</div>;
  }

  if (!configured) {
    return <p className="py-20 text-center text-white/50">{t("auth.notConfigured")}</p>;
  }

  if (!user) return null;

  const name = profile?.full_name || user.user_metadata?.full_name || user.email;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">{t("auth.accountTitle")}</h1>
      <p className="mt-2 text-white/60">{name}</p>
      <p className="text-sm text-white/40">{user.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#2e402a] bg-[#111] p-6">
          <p className="text-xs uppercase tracking-widest text-[#c49746]">{t("auth.pointsLabel")}</p>
          <p className="mt-2 font-display text-4xl font-bold text-white">
            {formatPcoin(profile?.loyalty_points)} P Coin
          </p>
          <p className="mt-2 text-sm text-white/45">{t("auth.pointsHint")}</p>
        </div>
        <div className="rounded-2xl border border-[#2e402a] bg-[#111] p-6">
          <p className="text-xs uppercase tracking-widest text-[#c49746]">{t("account.activeOrder")}</p>
          {dataLoading ? (
            <p className="mt-3 text-sm text-white/40">{t("auth.loading")}</p>
          ) : activeOrder ? (
            <div className="mt-3">
              <p className="font-display text-lg font-bold text-white">
                {statusLabel(activeOrder.status)}
              </p>
              <p className="mt-1 text-sm text-white/50">
                #{formatOrderNumber(activeOrder)} · {formatEur(Number(activeOrder.total_amount))}
              </p>
              <p className="mt-1 text-xs text-white/40">{orderAddress(activeOrder)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/45">{t("account.noActiveOrder")}</p>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-[#c49746]">{t("account.addressesTitle")}</h2>
        {addresses.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">
            {t("account.noAddresses")}{" "}
            <Link href="/lieferung" className="text-[#c49746] underline">
              {t("account.addAddressLink")}
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#2e402a] bg-[#111] p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {a.label}
                    {a.is_default ? (
                      <span className="ml-2 text-xs text-[#c49746]">({t("account.default")})</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {a.street}, {a.postal ? `${a.postal} ` : ""}
                    {a.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeAddress(a.id)}
                  className="shrink-0 text-xs text-red-300/80 hover:text-red-300"
                >
                  {t("account.deleteAddress")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-[#c49746]">{t("account.ordersTitle")}</h2>
        {dataLoading ? (
          <p className="mt-3 text-sm text-white/40">{t("auth.loading")}</p>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">{t("account.noOrders")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
                <button
                  type="button"
                  onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                  className="w-full text-left"
                >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white/40">#{formatOrderNumber(o)}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ["pending", "preparing", "ready"].includes(o.status)
                        ? "bg-[#c49746]/20 text-[#c49746]"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {statusLabel(o.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/70">{orderAddress(o)}</p>
                <p className="mt-1 text-sm font-semibold text-[#c49746]">
                  {formatEur(Number(o.total_amount))}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  {new Date(o.created_at).toLocaleString(locale === "tr" ? "tr-TR" : "de-DE")}
                </p>
                <p className="mt-2 text-xs text-[#c49746]/80">
                  {expandedOrderId === o.id ? t("orderDetail.hide") : t("orderDetail.show")}
                </p>
                </button>
                {expandedOrderId === o.id ? <OrderDetailPanel order={o} /> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void orderAgain()}
          className="rounded-full px-6 py-2.5 font-display text-sm font-bold text-[#0a0a0a]"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("account.orderAgain")}
        </button>
        <Link
          href="/menu"
          className="rounded-full border border-[#2e402a] px-6 py-2.5 text-sm text-white/70"
        >
          {t("auth.toMenu")}
        </Link>
        <button
          type="button"
          onClick={() => void signOut().then(() => router.push("/"))}
          className="rounded-full border border-[#2e402a] px-6 py-2.5 text-sm text-white/70"
        >
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
}
