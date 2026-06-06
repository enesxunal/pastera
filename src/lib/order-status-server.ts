import type { OrderStatus } from "@/lib/order-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderStatusEmail } from "@/lib/email/order-notifications";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const VALID: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

type PatchOrderStatusOptions = {
  branchIdFilter?: string;
};

async function ensureOrderUserLink(
  svc: SupabaseClient,
  orderId: string,
  userId: string | null,
  customerPhone: string | null,
): Promise<string | null> {
  if (userId) return userId;
  const phone = customerPhone?.trim();
  if (!phone) return null;

  const { data: profile } = await svc
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (!profile?.id) return null;

  await svc.from("orders").update({ user_id: profile.id }).eq("id", orderId);
  return profile.id;
}

export async function patchOrderStatus(
  svc: SupabaseClient,
  orderId: string,
  newStatus: OrderStatus,
  options?: PatchOrderStatusOptions,
): Promise<{ ok: boolean; error?: string; emailSent?: boolean }> {
  if (!VALID.includes(newStatus)) {
    return { ok: false, error: "Invalid status" };
  }

  const { data: existing, error: fetchErr } = await svc
    .from("orders")
    .select(
      "id, branch_id, status, order_type, display_number, customer_name, user_id, customer_phone",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!existing) return { ok: false, error: "Not found" };

  if (options?.branchIdFilter && existing.branch_id !== options.branchIdFilter) {
    return { ok: false, error: "Not found" };
  }

  const previousStatus = existing.status as OrderStatus;
  if (previousStatus === newStatus) return { ok: true };

  const patch: Record<string, string> = { status: newStatus };
  if (newStatus === "ready") {
    patch.ready_at = new Date().toISOString();
  }
  if (newStatus === "delivered") {
    patch.delivered_at = new Date().toISOString();
  }

  const { error: updErr } = await svc.from("orders").update(patch).eq("id", orderId);
  if (updErr) return { ok: false, error: updErr.message };

  const linkedUserId = await ensureOrderUserLink(
    svc,
    orderId,
    existing.user_id,
    existing.customer_phone,
  );

  let emailSent = false;
  try {
    emailSent = await sendOrderStatusEmail(
      {
        id: existing.id,
        display_number: existing.display_number,
        order_type: existing.order_type,
        status: newStatus,
        customer_name: existing.customer_name,
        user_id: linkedUserId ?? existing.user_id,
        customer_phone: existing.customer_phone,
      },
      newStatus,
    );
  } catch (e) {
    console.error("[order-email] status mail error", e);
  }

  return { ok: true, emailSent };
}

/** Test / debug: tek sipariş için durum maili gönder. */
export async function sendOrderStatusEmailForOrder(
  orderId: string,
  status: OrderStatus,
): Promise<{ ok: boolean; error?: string; emailSent?: boolean }> {
  const svc = createSupabaseServiceClient();
  if (!svc) return { ok: false, error: "no_service" };

  const { data: order, error } = await svc
    .from("orders")
    .select(
      "id, branch_id, status, order_type, display_number, customer_name, user_id, customer_phone",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!order) return { ok: false, error: "not_found" };

  const linkedUserId = await ensureOrderUserLink(
    svc,
    orderId,
    order.user_id,
    order.customer_phone,
  );

  const emailSent = await sendOrderStatusEmail(
    {
      id: order.id,
      display_number: order.display_number,
      order_type: order.order_type,
      status,
      customer_name: order.customer_name,
      user_id: linkedUserId ?? order.user_id,
      customer_phone: order.customer_phone,
    },
    status,
  );

  return { ok: true, emailSent };
}
