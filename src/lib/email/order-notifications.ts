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
>;

async function resolveRecipientEmail(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  const svc = createSupabaseServiceClient();
  if (!svc) return null;
  const { data } = await svc.from("profiles").select("email").eq("id", userId).maybeSingle();
  return data?.email?.trim() || null;
}

function orderNo(order: OrderEmailRow): string {
  return formatOrderNumber(order);
}

function firstName(order: OrderEmailRow): string {
  const name = order.customer_name?.trim();
  if (!name) return "du";
  return name.split(/\s+/)[0] ?? "du";
}

export async function sendOrderStatusEmail(
  order: OrderEmailRow,
  newStatus: OrderStatus,
): Promise<void> {
  if (newStatus === "pending" || newStatus === "delivered") return;

  const to = await resolveRecipientEmail(order.user_id);
  if (!to) return;

  const siteUrl = getPublicSiteUrl();
  const no = orderNo(order);
  const hi = `Hallo ${firstName(order)},`;

  let subject = "";
  let title = "";
  let bodyHtml = "";

  if (newStatus === "preparing") {
    subject = `Pastera — Bestellung #${no} wird zubereitet`;
    title = "Deine Bestellung ist in Arbeit";
    bodyHtml = `<p style="margin:0;">Wir bereiten deine Bestellung <strong>#${no}</strong> gerade in der Küche zu. Du musst nichts weiter tun — wir melden uns, sobald es weitergeht.</p>`;
  } else if (newStatus === "ready") {
    if (order.order_type === "delivery") {
      subject = `Pastera — Bestellung #${no} ist unterwegs`;
      title = "Deine Lieferung ist unterwegs";
      bodyHtml = `<p style="margin:0;">Gute Nachrichten: deine Bestellung <strong>#${no}</strong> ist fertig und auf dem Weg zu dir. Bitte halte dein Telefon bereit.</p>`;
    } else if (order.order_type === "pickup") {
      subject = `Pastera — Bestellung #${no} ist abholbereit`;
      title = "Deine Bestellung ist fertig";
      bodyHtml = `<p style="margin:0;">Deine Bestellung <strong>#${no}</strong> wartet auf dich in der Filiale. Komm vorbei und hol sie ab — frisch aus unserer Küche.</p>`;
    } else {
      subject = `Pastera — Bestellung #${no} ist fertig`;
      title = "Deine Bestellung ist fertig";
      bodyHtml = `<p style="margin:0;">Deine Bestellung <strong>#${no}</strong> ist fertig und kommt gleich zu dir.</p>`;
    }
  } else {
    return;
  }

  const html = renderPasteraEmail({
    siteUrl,
    title,
    greeting: hi,
    bodyHtml,
    ctaLabel: "Zur Website",
    ctaHref: siteUrl,
  });

  await sendPasteraEmail({ to, subject, html });
}

export async function sendOrderReviewEmail(order: OrderEmailRow): Promise<boolean> {
  const to = await resolveRecipientEmail(order.user_id);
  if (!to) return false;

  const siteUrl = getPublicSiteUrl();
  const no = orderNo(order);
  const subject = `Pastera — Wie war deine Bestellung #${no}?`;
  const title = "War alles gut?";
  const bodyHtml = `<p style="margin:0;">Danke für deine Bestellung <strong>#${no}</strong> bei Pastera. Wir hoffen, es hat dir geschmeckt! Wenn du zufrieden warst, freuen wir uns über eine kurze Bewertung — und wenn du uns auf Instagram folgst, verpasst du keine Neuigkeiten.</p>`;

  const secondaryHtml = renderDualButtonRow(
    { label: "Google Bewertung", href: PASTERA_GOOGLE_REVIEW_URL },
    { label: "Instagram folgen", href: PASTERA_INSTAGRAM_URL },
  );

  const html = renderPasteraEmail({
    siteUrl,
    title,
    greeting: `Hallo ${firstName(order)},`,
    bodyHtml,
    secondaryHtml,
  });

  const result = await sendPasteraEmail({ to, subject, html });
  return result.ok;
}

export async function processDueReviewEmails(): Promise<{ sent: number; errors: number }> {
  const svc = createSupabaseServiceClient();
  if (!svc) return { sent: 0, errors: 0 };

  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await svc
    .from("orders")
    .select("id, display_number, order_type, status, customer_name, user_id")
    .eq("status", "delivered")
    .not("delivered_at", "is", null)
    .lte("delivered_at", cutoff)
    .is("review_email_sent_at", null)
    .not("user_id", "is", null)
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
