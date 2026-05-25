import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type BackupPayload = {
  exportedAt: string;
  orders: unknown[];
  profiles: unknown[];
  catalog_items: unknown[];
  branches: unknown[];
  customer_addresses: unknown[];
};

export async function buildBackupPayload(): Promise<BackupPayload | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;

  const [orders, profiles, catalog, branches, addresses] = await Promise.all([
    svc.from("orders").select("*").order("created_at", { ascending: false }).limit(5000),
    svc
      .from("profiles")
      .select("id, email, full_name, phone, loyalty_points, role, created_at")
      .limit(5000),
    svc.from("catalog_items").select("*"),
    svc.from("branches").select("*"),
    svc.from("customer_addresses").select("*").limit(5000),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    orders: orders.data ?? [],
    profiles: profiles.data ?? [],
    catalog_items: catalog.data ?? [],
    branches: branches.data ?? [],
    customer_addresses: addresses.data ?? [],
  };
}
