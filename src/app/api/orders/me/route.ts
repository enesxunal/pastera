import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, orders: [], activeOrder: null });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  const { data: profile } = await svc
    .from("profiles")
    .select("phone")
    .eq("id", userId)
    .maybeSingle();

  const phone = profile?.phone?.trim();
  if (phone) {
    await svc
      .from("orders")
      .update({ user_id: userId })
      .is("user_id", null)
      .eq("customer_phone", phone);
  }

  const { data: byUser, error: e1 } = await svc
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (e1) {
    return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
  }

  const merged = [...(byUser ?? [])];

  if (phone) {
    const { data: byPhone } = await svc
      .from("orders")
      .select("*")
      .is("user_id", null)
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(40);
    const seen = new Set(merged.map((o) => o.id));
    for (const o of byPhone ?? []) {
      if (!seen.has(o.id)) merged.push(o);
    }
    merged.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  const orders = merged;
  const activeOrder =
    orders.find((o) => ["pending", "preparing", "ready"].includes(o.status as string)) ?? null;

  return NextResponse.json({ ok: true, orders, activeOrder });
}
