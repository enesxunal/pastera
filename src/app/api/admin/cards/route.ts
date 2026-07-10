import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { ensureDefaultNfcCards } from "@/lib/card-scan-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest) {
  return isAdminRequest(req);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  await ensureDefaultNfcCards();

  const { data: cards, error } = await svc
    .from("nfc_cards")
    .select("id, card_code, tier, status, user_id, assigned_at, created_at")
    .order("card_code", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message, needsMigration: true }, { status: 500 });
  }

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
