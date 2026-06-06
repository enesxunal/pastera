export function paypalApiBase(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

export function formatPayPalAmount(amountEur: number): string {
  return Math.max(0, amountEur).toFixed(2);
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) throw new Error("paypal_not_configured");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("paypal_auth_failed");
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("paypal_auth_failed");
  return json.access_token;
}

export async function createPayPalOrder(amountEur: number): Promise<string> {
  const token = await getAccessToken();
  const value = formatPayPalAmount(amountEur);
  const res = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "EUR", value },
        },
      ],
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !json.id) {
    throw new Error(json.message ?? "paypal_create_failed");
  }
  return json.id;
}

export async function capturePayPalOrder(
  paypalOrderId: string,
): Promise<{ capturedAmount: string; paypalOrderId: string }> {
  const token = await getAccessToken();
  const res = await fetch(`${paypalApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = (await res.json()) as {
    status?: string;
    purchase_units?: { payments?: { captures?: { amount?: { value?: string } }[] } }[];
    message?: string;
  };

  if (!res.ok || json.status !== "COMPLETED") {
    throw new Error(json.message ?? "paypal_capture_failed");
  }

  const capturedAmount =
    json.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0";
  return { capturedAmount, paypalOrderId };
}
