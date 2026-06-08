import { NextResponse, type NextRequest } from "next/server";
import { parseOptionalNumber, resolveBranchCoordinates } from "@/lib/branch-admin";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { BranchRow } from "@/lib/order-types";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

type BranchBody = {
  slug?: string;
  name?: string;
  radius_km?: number;
  can_edit_prices?: boolean;
  is_active?: boolean;
  street?: string | null;
  city?: string | null;
  postal?: string | null;
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data, error } = await svc.from("branches").select("*").order("name");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, branches: (data ?? []) as BranchRow[] });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  let body: BranchBody;
  try {
    body = (await req.json()) as BranchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const name = body.name?.trim();
  if (!slug || !name) {
    return NextResponse.json({ ok: false, error: "slug_and_name_required" }, { status: 400 });
  }

  const coords = await resolveBranchCoordinates({
    street: body.street,
    city: body.city,
    postal: body.postal,
    lat: parseOptionalNumber(body.lat) ?? null,
    lng: parseOptionalNumber(body.lng) ?? null,
  });

  const { data, error } = await svc
    .from("branches")
    .insert({
      slug,
      name,
      radius_km: Number(body.radius_km ?? 5),
      can_edit_prices: Boolean(body.can_edit_prices),
      is_active: body.is_active !== false,
      street: body.street?.trim() || null,
      city: body.city?.trim() || null,
      postal: body.postal?.trim() || null,
      phone: body.phone?.trim() || null,
      lat: coords.lat,
      lng: coords.lng,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, branch: data, geocoded: coords.geocoded });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  let body: BranchBody & { id?: string };
  try {
    body = (await req.json()) as BranchBody & { id?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.radius_km !== undefined) patch.radius_km = Number(body.radius_km);
  if (body.can_edit_prices !== undefined) patch.can_edit_prices = Boolean(body.can_edit_prices);
  if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active);
  if (body.street !== undefined) patch.street = body.street?.trim() || null;
  if (body.city !== undefined) patch.city = body.city?.trim() || null;
  if (body.postal !== undefined) patch.postal = body.postal?.trim() || null;
  if (body.phone !== undefined) patch.phone = body.phone?.trim() || null;

  const latProvided = body.lat !== undefined;
  const lngProvided = body.lng !== undefined;
  const addressTouched =
    body.street !== undefined || body.city !== undefined || body.postal !== undefined;

  if (latProvided || lngProvided || addressTouched) {
    const { data: existing } = await svc
      .from("branches")
      .select("street, city, postal, lat, lng")
      .eq("id", body.id)
      .maybeSingle();

    const coords = await resolveBranchCoordinates({
      street: body.street !== undefined ? body.street : existing?.street,
      city: body.city !== undefined ? body.city : existing?.city,
      postal: body.postal !== undefined ? body.postal : existing?.postal,
      lat:
        latProvided
          ? (parseOptionalNumber(body.lat) ?? null)
          : lngProvided
            ? (existing?.lat ?? null)
            : undefined,
      lng:
        lngProvided
          ? (parseOptionalNumber(body.lng) ?? null)
          : latProvided
            ? (existing?.lng ?? null)
            : undefined,
    });
    patch.lat = coords.lat;
    patch.lng = coords.lng;
  }

  const { data, error } = await svc
    .from("branches")
    .update(patch)
    .eq("id", body.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, branch: data });
}
