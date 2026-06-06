import type { OrderRow, OrderStatus } from "@/lib/order-types";
import { formatOrderNumber } from "@/lib/order-display";
import { getPublicSiteUrl } from "@/lib/site-url";
import {
  PASTERA_GOOGLE_REVIEW_URL,
  PASTERA_INSTAGRAM_URL,
} from "@/lib/email/brand";
import { renderDualButtonRow, renderPasteraEmail } from "@/lib/email/template";
import { sendPasteraEmail } from "@/lib/email/send";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type OrderEmailRow = Pick<
  OrderRow,
  | "id"
  | "display_number"
  | "order_type"
  | "status"
  | "customer_name"
  | "user_id"
  | "customer_phone"
>;

async function emailFromAuthUser(userId: string): Promise<string | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;
  try {
    const { data, error } = await svc.auth.admin.getUserById(userId);
    if (error) {
      console.error("[order-email] auth.admin.getUserById:", error.message);
      return null;
    }
    return data.user?.email?.trim() ?? null;
  } catch (e) {
    console.error("[order-email] auth lookup failed", e);
    return null;
  }
}

/** Siparişe bağlı müşteri e-postası — profil, auth ve telefon eşleşmesi. */
export async function resolveOrderRecipientEmail(
  order: Pick<OrderEmailRow, "user_id" | "customer_phone">,
): Promise<string | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;

  let userId = order.user_id ?? null;
  const phone = order.customer_phone?.trim();

  if (!userId && phone) {
    const { data: byPhone } = await svc
      .from("profiles")
      .select("id, email")
      .eq("phone", phone)
      .maybeSingle();
    if (byPhone?.email?.trim()) return byPhone.email.trim();
    if (byPhone?.id) userId = byPhone.id;
  }

  if (!userId) return null;

  const { data: profile } = await svc
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.email?.trim()) return profile.email.trim();

  return emailFromAuthUser(userId);
}

function orderNo(order: OrderEmailRow): string {
  return formatOrderNumber(order);
}

function firstName(order: OrderEmailRow): string {
  const name = order.customer_name?.trim();
  if (!name) return "du";
  return name.split(/\s+/)[0] ?? "du";
}

async function dispatchOrderEmail(
  order: OrderEmailRow,
  subject: string,
  title: string,
  bodyHtml: string,
  secondaryHtml?: string,
): Promise<boolean> {
  const to = await resolveOrderRecipientEmail(order);
  if (!to) {
    console.warn("[order-email] no recipient", {
      orderId: order.id,
      userId: order.user_id,
      phone: order.customer_phone,
    });
    return false;
  }

  const siteUrl = getPublicSiteUrl();
  const html = renderPasteraEmail({
    siteUrl,
    title,
    greeting: `Hallo ${firstName(order)},`,
    bodyHtml,
    ctaLabel: "Zur Website",
    ctaHref: siteUrl,
    secondaryHtml,
  });

  const result = await sendPasteraEmail({ to, subject, html });
  if (!result.ok) {
    console.error("[order-email] resend failed", result.error, { to, orderId: order.id });
    return false;
  }
  return true;
}

export async function sendOrderStatusEmail(
  order: OrderEmailRow,
  newStatus: OrderStatus,
): Promise<boolean> {
  if (newStatus === "pending" || newStatus === "delivered") return false;

  const no = orderNo(order);

  if (newStatus === "preparing") {
    return dispatchOrderEmail(
      order,
      `Pastera — Bestellung #${no} wird zubereitet`,
      "Deine Bestellung ist in Arbeit",
      `<p style="margin:0;">Wir bereiten deine Bestellung <strong>#${no}</strong> gerade in der Küche zu. Du musst nichts weiter tun — wir melden uns, sobald es weitergeht.</p>`,
    );
  }

  if (newStatus === "ready") {
    if (order.order_type === "delivery") {
      return dispatchOrderEmail(
        order,
        `Pastera — Bestellung #${no} ist unterwegs`,
        "Deine Lieferung ist unterwegs",
        `<p style="margin:0;">Gute Nachrichten: deine Bestellung <strong>#${no}</strong> ist fertig und auf dem Weg zu dir. Bitte halte dein Telefon bereit.</p>`,
      );
    }
    if (order.order_type === "pickup") {
      return dispatchOrderEmail(
        order,
        `Pastera — Bestellung #${no} ist abholbereit`,
        "Deine Bestellung ist fertig",
        `<p style="margin:0;">Deine Bestellung <strong>#${no}</strong> wartet auf dich in der Filiale. Komm vorbei und hol sie ab — frisch aus unserer Küche.</p>`,
      );
    }
    return dispatchOrderEmail(
      order,
      `Pastera — Bestellung #${no} ist fertig`,
      "Deine Bestellung ist fertig",
      `<p style="margin:0;">Deine Bestellung <strong>#${no}</strong> ist fertig und kommt gleich zu dir.</p>`,
    );
  }

  return false;
}

export async function sendOrderReviewEmail(order: OrderEmailRow): Promise<boolean> {
  const no = orderNo(order);
  const secondaryHtml = renderDualButtonRow(
    { label: "Google Bewertung", href: PASTERA_GOOGLE_REVIEW_URL },
    { label: "Instagram folgen", href: PASTERA_INSTAGRAM_URL },
  );

  return dispatchOrderEmail(
    order,
    `Pastera — Wie war deine Bestellung #${no}?`,
    "War alles gut?",
    `<p style="margin:0;">Danke für deine Bestellung <strong>#${no}</strong> bei Pastera. Wir hoffen, es hat dir geschmeckt! Wenn du zufrieden warst, freuen wir uns über eine kurze Bewertung — und wenn du uns auf Instagram folgst, verpasst du keine Neuigkeiten.</p>`,
    secondaryHtml,
  );
}

export async function processDueReviewEmails(): Promise<{ sent: number; errors: number }> {
  const svc = createSupabaseServiceClient();
  if (!svc) return { sent: 0, errors: 0 };

  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await svc
    .from("orders")
    .select("id, display_number, order_type, status, customer_name, user_id, customer_phone")
    .eq("status", "delivered")
    .not("delivered_at", "is", null)
    .lte("delivered_at", cutoff)
    .is("review_email_sent_at", null)
    .limit(50);

  if (error || !orders?.length) return { sent: 0, errors: error ? 1 : 0 };

  let sent = 0;
  let errors = 0;

  for (const order of orders) {
    const ok = await sendOrderReviewEmail(order);
    if (!ok) {
      errors += 1;
      continue;
    }
    const { error: updErr } = await svc
      .from("orders")
      .update({ review_email_sent_at: new Date().toISOString() })
      .eq("id", order.id);
    if (updErr) errors += 1;
    else sent += 1;
  }

  return { sent, errors };
}
