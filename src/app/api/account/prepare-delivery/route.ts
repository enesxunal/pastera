import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { geocodeAddress } from "@/lib/geocode";
import { checkDeliveryForAddress } from "@/lib/nearest-branch";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

/** Kayıtlı varsayılan adres + şube ataması (yeniden sipariş / sepet için) */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
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
    .select("full_name, phone, email")
    .eq("id", userId)
    .maybeSingle();

  let customerPhone = profile?.phone?.trim() ?? "";
  const customerName =
    profile?.full_name?.trim() || profile?.email?.trim() || "";

  if (!customerPhone) {
    const { data: lastOrder } = await svc
      .from("orders")
      .select("customer_phone")
      .eq("user_id", userId)
      .not("customer_phone", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    customerPhone = lastOrder?.customer_phone?.trim() ?? "";
  }

  const { data: addresses } = await svc
    .from("customer_addresses")
    .select("id, label, street, city, postal, lat, lng, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  const addr = (addresses ?? []).find((a) => a.is_default) ?? addresses?.[0];
  if (!addr) {
    return NextResponse.json({ ok: false, needAddress: true });
  }

  let lat = addr.lat != null ? Number(addr.lat) : undefined;
  let lng = addr.lng != null ? Number(addr.lng) : undefined;

  if (lat === undefined || lng === undefined) {
    const geo = await geocodeAddress({
      street: addr.street,
      city: addr.city,
      postal: addr.postal ?? "",
    });
    if (!geo) {
      return NextResponse.json({ ok: false, error: "geocode_failed" }, { status: 422 });
    }
    lat = geo.lat;
    lng = geo.lng;
  }

  const check = await checkDeliveryForAddress(lat, lng);
  if (!check.ok) {
    return NextResponse.json({
      ok: false,
      error: check.reason === "out_of_range" ? "out_of_range" : "branch_no_location",
      distanceKm: check.nearest?.distanceKm,
      maxKm: check.nearest ? Number(check.nearest.branch.radius_km) || 5 : undefined,
    });
  }

  const { branch, distanceKm } = check.nearest;

  return NextResponse.json({
    ok: true,
    branchId: branch.id,
    branchSlug: branch.slug,
    branchName: branch.name,
    street: addr.street,
    city: addr.city,
    postal: addr.postal ?? "",
    lat,
    lng,
    distanceKm,
    customerName,
    customerPhone,
    needPhone: !customerPhone,
  });
}
