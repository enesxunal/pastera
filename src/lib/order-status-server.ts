import type { OrderStatus } from "@/lib/order-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderStatusEmail } from "@/lib/email/order-notifications";

const VALID: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

type PatchOrderStatusOptions = {
  branchIdFilter?: string;
};

export async function patchOrderStatus(
  svc: SupabaseClient,
  orderId: string,
  newStatus: OrderStatus,
  options?: PatchOrderStatusOptions,
): Promise<{ ok: boolean; error?: string }> {
  if (!VALID.includes(newStatus)) {
    return { ok: false, error: "Invalid status" };
  }

  const { data: existing, error: fetchErr } = await svc
    .from("orders")
    .select(
      "id, branch_id, status, order_type, display_number, customer_name, user_id",
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

  void sendOrderStatusEmail(
    {
      id: existing.id,
      display_number: existing.display_number,
      order_type: existing.order_type,
      status: newStatus,
      customer_name: existing.customer_name,
      user_id: existing.user_id,
    },
    newStatus,
  ).catch((e) => {
    console.error("[order-email]", e);
  });

  return { ok: true };
}
