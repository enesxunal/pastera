"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useI18n } from "@/components/providers/I18nProvider";
import type { SubmitOrderPayload } from "@/lib/submit-order";

type PayPalCheckoutButtonsProps = {
  total: number;
  disabled?: boolean;
  buildOrderPayload: () => Omit<SubmitOrderPayload, "paymentType" | "paypalOrderId"> | null;
  onSuccess: (orderShortId: string) => void;
  onError: (message: string) => void;
};

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? "";

export function isPayPalEnabled(): boolean {
  return clientId.length > 0;
}

export function PayPalCheckoutButtons({
  total,
  disabled,
  buildOrderPayload,
  onSuccess,
  onError,
}: PayPalCheckoutButtonsProps) {
  const { locale, t } = useI18n();

  if (!clientId) return null;

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "EUR",
        intent: "capture",
        locale: locale === "tr" ? "tr_TR" : "de_DE",
      }}
    >
      <div className={disabled ? "pointer-events-none opacity-45" : ""}>
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
          disabled={disabled}
          createOrder={async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: total }),
            });
            const json = (await res.json()) as { ok?: boolean; id?: string; error?: string };
            if (!res.ok || !json.id) {
              throw new Error(json.error ?? "paypal_create_failed");
            }
            return json.id;
          }}
          onApprove={async (data) => {
            const payload = buildOrderPayload();
            if (!payload) {
              onError(t("cart.needOrderContext"));
              return;
            }
            const res = await fetch("/api/paypal/capture", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...payload,
                paypalOrderId: data.orderID,
              }),
            });
            const json = (await res.json()) as {
              ok?: boolean;
              orderShortId?: string;
              error?: string;
              distanceKm?: number;
              maxKm?: number;
            };
            if (!res.ok || !json.orderShortId) {
              if (json.error === "out_of_range") {
                const dist = json.distanceKm != null ? `${json.distanceKm}` : "";
                const max = json.maxKm != null ? `${json.maxKm}` : "";
                onError(
                  dist && max
                    ? `${t("cart.outOfRange")} (${dist} km / max ${max} km)`
                    : t("cart.outOfRange"),
                );
              } else if (json.error === "delivery_required" || json.error === "delivery_invalid") {
                onError(t("cart.needDelivery"));
              } else {
                onError(t("cart.paypalFailed"));
              }
              return;
            }
            onSuccess(json.orderShortId);
          }}
          onError={() => onError(t("cart.paypalFailed"))}
          onCancel={() => onError(t("cart.paypalCancelled"))}
        />
      </div>
    </PayPalScriptProvider>
  );
}
