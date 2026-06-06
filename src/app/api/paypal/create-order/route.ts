import { NextResponse } from "next/server";
import { createPayPalOrder, formatPayPalAmount, isPayPalConfigured } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ ok: false, error: "paypal_not_configured" }, { status: 503 });
  }

  let body: { amount?: number };
  try {
    body = (await request.json()) as { amount?: number };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
  }

  try {
    const id = await createPayPalOrder(body.amount);
    return NextResponse.json({ ok: true, id, amount: formatPayPalAmount(body.amount) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "paypal_create_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
