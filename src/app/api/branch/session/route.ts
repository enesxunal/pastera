import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const pwd = process.env.BRANCH_PANEL_PASSWORD;
  if (!pwd) {
    return NextResponse.json({ ok: false, error: "BRANCH_PANEL_PASSWORD not set" }, { status: 503 });
  }

  let body: { password?: string; branchId?: string; branchSlug?: string };
  try {
    body = (await request.json()) as { password?: string; branchId?: string; branchSlug?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.password !== pwd) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const svc = createSupabaseServiceClient();
  let branchId = body.branchId ?? null;

  if (!branchId && body.branchSlug?.trim() && svc) {
    const { data } = await svc
      .from("branches")
      .select("id")
      .eq("slug", body.branchSlug.trim())
      .eq("is_active", true)
      .maybeSingle();
    branchId = data?.id ?? null;
  }

  if (!branchId) {
    branchId = process.env.BRANCH_PANEL_BRANCH_ID ?? null;
  }

  if (!branchId && svc) {
    const { data } = await svc
      .from("branches")
      .select("id")
      .eq("slug", "merkez")
      .maybeSingle();
    branchId = data?.id ?? null;
  }

  if (!branchId) {
    return NextResponse.json({ ok: false, error: "No branch" }, { status: 503 });
  }

  cookies().set("pastera_branch_id", branchId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true, branchId });
}

export async function DELETE() {
  cookies().delete("pastera_branch_id");
  return NextResponse.json({ ok: true });
}
