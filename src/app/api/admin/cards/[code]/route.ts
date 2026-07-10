import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { normalizeCardCode, type NfcCardTier } from "@/lib/membership";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const cardCode = normalizeCardCode(params.code);
  let body: { userId?: string | null; action?: "assign" | "unassign" | "revoke" };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data: card } = await svc
    .from("nfc_cards")
    .select("id, tier, status, user_id")
    .eq("card_code", cardCode)
    .maybeSingle();

  if (!card) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  if (body.action === "revoke") {
    if (card.user_id) {
      await svc.from("profiles").update({ membership_tier: "standard" }).eq("id", card.user_id);
    }
    await svc
      .from("nfc_cards")
      .update({ status: "revoked", user_id: null, assigned_at: null })
      .eq("id", card.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "unassign") {
    if (card.user_id) {
      await svc.from("profiles").update({ membership_tier: "standard" }).eq("id", card.user_id);
    }
    await svc
      .from("nfc_cards")
      .update({ status: "unassigned", user_id: null, assigned_at: null })
      .eq("id", card.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "assign") {
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "user_required" }, { status: 400 });
    }

    const { data: profile } = await svc.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!profile) {
      return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
    }

    // Başka aktif kart varsa ayır
    const { data: existing } = await svc
      .from("nfc_cards")
      .select("id, card_code")
      .eq("user_id", userId)
      .eq("status", "active")
      .neq("id", card.id)
      .maybeSingle();

    if (existing) {
      await svc
        .from("nfc_cards")
        .update({ status: "unassigned", user_id: null, assigned_at: null })
        .eq("id", existing.id);
    }

    const tier = card.tier as NfcCardTier;
    await svc
      .from("nfc_cards")
      .update({
        status: "active",
        user_id: userId,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", card.id);

    await svc.from("profiles").update({ membership_tier: tier }).eq("id", userId);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
}
