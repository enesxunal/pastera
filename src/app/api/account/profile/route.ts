import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false }, { status: 503 });

  const authClient = createSupabaseServerClient();
  const { data: authData } = await authClient.auth.getUser();

  const { data: profile } = await svc
    .from("profiles")
    .select("full_name, phone, email, loyalty_points, membership_tier")
    .eq("id", userId)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    profile: {
      full_name: profile?.full_name ?? authData.user?.user_metadata?.full_name ?? null,
      phone: profile?.phone ?? null,
      email: profile?.email ?? authData.user?.email ?? null,
      loyalty_points: Number(profile?.loyalty_points ?? 0),
      membership_tier: profile?.membership_tier ?? "standard",
    },
  });
}
