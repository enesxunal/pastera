import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { isDeliveryEnabled } from "@/lib/delivery-enabled";
import { geocodeAddress } from "@/lib/geocode";
import { checkDeliveryForAddress } from "@/lib/nearest-branch";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

type Body = {
  addressId?: string;
  street?: string;
  city?: string;
  postal?: string;
  lat?: number;
  lng?: number;
};

export async function POST(request: Request) {
  if (!isDeliveryEnabled()) {
    return NextResponse.json({ ok: false, error: "delivery_disabled" }, { status: 503 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  let street = body.street?.trim() ?? "";
  let city = body.city?.trim() ?? "";
  let postal = body.postal?.trim() ?? "";
  let lat = typeof body.lat === "number" ? body.lat : undefined;
  let lng = typeof body.lng === "number" ? body.lng : undefined;

  if (body.addressId) {
    const { data: addr, error } = await svc
      .from("customer_addresses")
      .select("street, city, postal, lat, lng")
      .eq("id", body.addressId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !addr) {
      return NextResponse.json({ ok: false, error: "address_not_found" }, { status: 404 });
    }

    street = addr.street;
    city = addr.city;
    postal = addr.postal ?? "";
    if (addr.lat != null && addr.lng != null) {
      lat = addr.lat;
      lng = addr.lng;
    }
  }

  if (!street || !city) {
    return NextResponse.json({ ok: false, error: "address_required" }, { status: 400 });
  }

  if (lat === undefined || lng === undefined) {
    const geo = await geocodeAddress({ street, city, postal });
    if (!geo) {
      return NextResponse.json({ ok: false, error: "geocode_failed" }, { status: 422 });
    }
    lat = geo.lat;
    lng = geo.lng;
  }

  const check = await checkDeliveryForAddress(lat, lng);
  if (!check.ok) {
    if (check.reason === "no_branch_location") {
      return NextResponse.json({ ok: false, error: "branch_no_location" }, { status: 503 });
    }
    const n = check.nearest;
    return NextResponse.json({
      ok: false,
      error: "out_of_range",
      distanceKm: n?.distanceKm,
      maxKm: n ? Number(n.branch.radius_km) || 5 : undefined,
      branchName: n?.branch.name,
    });
  }

  const { branch, distanceKm } = check.nearest;

  return NextResponse.json({
    ok: true,
    branchId: branch.id,
    branchSlug: branch.slug,
    branchName: branch.name,
    street,
    city,
    postal,
    lat,
    lng,
    distanceKm,
  });
}
