import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const key = process.env.DISPLAY_ACCESS_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "DISPLAY_ACCESS_KEY not set" }, { status: 503 });
  }

  let body: { key?: string; branchId?: string };
  try {
    body = (await request.json()) as { key?: string; branchId?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.key !== key) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const branchId = body.branchId ?? process.env.BRANCH_PANEL_BRANCH_ID;
  if (!branchId) {
    return NextResponse.json({ ok: false, error: "branchId required" }, { status: 400 });
  }

  cookies().set("pastera_display", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookies().set("pastera_display_branch_id", branchId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
