import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { BranchRow } from "@/lib/order-types";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

const FALLBACK_BRANCH: BranchRow = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "merkez",
  name: "Pastera Merkez",
  radius_km: 5,
  can_edit_prices: false,
  lat: null,
  lng: null,
  is_active: true,
};

export async function getBranchBySlug(slug: string): Promise<BranchRow | null> {
  if (!isSupabaseConfigured()) {
    return slug === "merkez" ? FALLBACK_BRANCH : null;
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return slug === "merkez" ? FALLBACK_BRANCH : null;
  return data as BranchRow;
}

export async function getBranchById(id: string): Promise<BranchRow | null> {
  if (!isSupabaseConfigured()) {
    return id === FALLBACK_BRANCH.id ? FALLBACK_BRANCH : null;
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as BranchRow;
}

export async function listActiveBranches(): Promise<BranchRow[]> {
  if (!isSupabaseConfigured()) return [FALLBACK_BRANCH];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error || !data?.length) return [FALLBACK_BRANCH];
  return data as BranchRow[];
}

/** Şube paneli / display — service role ile son siparişler */
export async function listOrdersForBranch(
  branchId: string,
  opts?: { limit?: number; statuses?: string[] },
): Promise<import("@/lib/order-types").OrderRow[]> {
  const svc = createSupabaseServiceClient();
  if (!svc) return [];

  let q = svc
    .from("orders")
    .select("*")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 50);

  if (opts?.statuses?.length) {
    q = q.in("status", opts.statuses);
  }

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as import("@/lib/order-types").OrderRow[];
}

export async function updateOrderStatus(
  orderId: string,
  status: import("@/lib/order-types").OrderStatus,
): Promise<boolean> {
  const svc = createSupabaseServiceClient();
  if (!svc) return false;
  const { error } = await svc.from("orders").update({ status }).eq("id", orderId);
  return !error;
}
