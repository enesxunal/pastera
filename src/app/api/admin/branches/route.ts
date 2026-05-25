import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { BranchRow } from "@/lib/order-types";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

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

  let body: {
    slug?: string;
    name?: string;
    radius_km?: number;
    can_edit_prices?: boolean;
    is_active?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const name = body.name?.trim();
  if (!slug || !name) {
    return NextResponse.json({ ok: false, error: "slug and name required" }, { status: 400 });
  }

  const { data, error } = await svc
    .from("branches")
    .insert({
      slug,
      name,
      radius_km: Number(body.radius_km ?? 5),
      can_edit_prices: Boolean(body.can_edit_prices),
      is_active: body.is_active !== false,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, branch: data });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  let body: {
    id?: string;
    name?: string;
    radius_km?: number;
    can_edit_prices?: boolean;
    is_active?: boolean;
    lat?: number | null;
    lng?: number | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.radius_km !== undefined) patch.radius_km = Number(body.radius_km);
  if (body.can_edit_prices !== undefined) patch.can_edit_prices = Boolean(body.can_edit_prices);
  if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active);
  if (body.lat !== undefined) patch.lat = body.lat;
  if (body.lng !== undefined) patch.lng = body.lng;

  const { data, error } = await svc.from("branches").update(patch).eq("id", body.id).select("*").single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, branch: data });
}
