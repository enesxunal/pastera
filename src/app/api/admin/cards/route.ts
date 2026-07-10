import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { normalizeCardCode, type NfcCardTier } from "@/lib/membership";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest) {
  return isAdminRequest(req);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data: cards, error } = await svc
    .from("nfc_cards")
    .select("id, card_code, tier, status, user_id, assigned_at, created_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const userIds = Array.from(
    new Set((cards ?? []).map((c) => c.user_id).filter(Boolean)),
  ) as string[];
  let profiles: { id: string; full_name: string | null; email: string | null }[] = [];
  if (userIds.length) {
    const { data } = await svc.from("profiles").select("id, full_name, email").in("id", userIds);
    profiles = data ?? [];
  }
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://www.pastera.de";

  return NextResponse.json({
    ok: true,
    cards: (cards ?? []).map((c) => ({
      ...c,
      member: c.user_id ? profileMap.get(c.user_id) ?? null : null,
      scanUrl: `${siteUrl}/c/${c.card_code}`,
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { cardCode?: string; tier?: NfcCardTier };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const cardCode = normalizeCardCode(body.cardCode ?? "");
  const tier = body.tier;
  if (!cardCode) {
    return NextResponse.json({ ok: false, error: "card_code_required" }, { status: 400 });
  }
  if (tier !== "gold" && tier !== "black") {
    return NextResponse.json({ ok: false, error: "invalid_tier" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data, error } = await svc
    .from("nfc_cards")
    .insert({ card_code: cardCode, tier, status: "unassigned" })
    .select("id, card_code, tier, status")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: false, error: "duplicate_code" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, card: data });
}
