import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { checkDeliveryForAddress } from "@/lib/nearest-branch";
import { getBranchBySlug } from "@/lib/branches-server";
import { haversineKm, roundKm } from "@/lib/geo";

type Body = {
  branchSlug?: string;
  street?: string;
  city?: string;
  postal?: string;
  lat?: number;
  lng?: number;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const street = body.street?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const postal = body.postal?.trim() ?? "";

  if (!street || !city) {
    return NextResponse.json({ ok: false, error: "address_required" }, { status: 400 });
  }

  let lat = typeof body.lat === "number" ? body.lat : undefined;
  let lng = typeof body.lng === "number" ? body.lng : undefined;

  if (lat === undefined || lng === undefined) {
    const geo = await geocodeAddress({ street, city, postal });
    if (!geo) {
      return NextResponse.json({ ok: false, error: "geocode_failed" }, { status: 422 });
    }
    lat = geo.lat;
    lng = geo.lng;
  }

  const slug = body.branchSlug?.trim();
  if (slug) {
    const branch = await getBranchBySlug(slug);
    if (!branch || !branch.is_active) {
      return NextResponse.json({ ok: false, error: "branch_not_found" }, { status: 404 });
    }
    if (branch.lat == null || branch.lng == null) {
      return NextResponse.json({ ok: false, error: "branch_no_location" }, { status: 503 });
    }
    const distanceKm = roundKm(haversineKm(branch.lat, branch.lng, lat, lng));
    const maxKm = Number(branch.radius_km) || 5;
    if (distanceKm > maxKm) {
      return NextResponse.json({
        ok: false,
        error: "out_of_range",
        distanceKm,
        maxKm,
        branchName: branch.name,
      });
    }
    return NextResponse.json({
      ok: true,
      branchId: branch.id,
      branchSlug: branch.slug,
      branchName: branch.name,
      lat,
      lng,
      distanceKm,
      maxKm,
      autoAssigned: false,
    });
  }

  const check = await checkDeliveryForAddress(lat, lng);

  if (check.ok) {
    const { branch, distanceKm } = check.nearest;
    return NextResponse.json({
      ok: true,
      branchId: branch.id,
      branchSlug: branch.slug,
      branchName: branch.name,
      lat,
      lng,
      distanceKm,
      maxKm: Number(branch.radius_km) || 5,
      autoAssigned: true,
    });
  }

  if (check.reason === "no_branch_location") {
    return NextResponse.json({ ok: false, error: "branch_no_location" }, { status: 503 });
  }

  if (check.reason === "no_branches") {
    return NextResponse.json({ ok: false, error: "branch_not_found" }, { status: 404 });
  }

  const n = check.nearest!;
  const maxKm = Number(n.branch.radius_km) || 5;
  return NextResponse.json({
    ok: false,
    error: "out_of_range",
    distanceKm: n.distanceKm,
    maxKm,
    branchName: n.branch.name,
    branchSlug: n.branch.slug,
  });
}
