import { NextResponse } from "next/server";
import {
  capturePayPalOrder,
  formatPayPalAmount,
  isPayPalConfigured,
} from "@/lib/paypal";
import { submitOrder, type SubmitOrderPayload } from "@/lib/submit-order";

export const dynamic = "force-dynamic";

type CaptureBody = SubmitOrderPayload & {
  paypalOrderId?: string;
};

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ ok: false, error: "paypal_not_configured" }, { status: 503 });
  }

  let body: CaptureBody;
  try {
    body = (await request.json()) as CaptureBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const paypalOrderId = body.paypalOrderId?.trim();
  if (!paypalOrderId) {
    return NextResponse.json({ ok: false, error: "paypal_order_required" }, { status: 400 });
  }

  if (typeof body.total !== "number" || body.total <= 0) {
    return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
  }

  try {
    const captured = await capturePayPalOrder(paypalOrderId);
    const expected = formatPayPalAmount(body.total);
    if (captured.capturedAmount !== expected) {
      return NextResponse.json({ ok: false, error: "paypal_amount_mismatch" }, { status: 400 });
    }

    const result = await submitOrder({
      ...body,
      paymentType: "online",
      paypalOrderId: captured.paypalOrderId,
    });

    if (!result.ok) {
      const status = result.error === "out_of_range" ? 400 : 500;
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          ...(result.distanceKm != null ? { distanceKm: result.distanceKm } : {}),
          ...(result.maxKm != null ? { maxKm: result.maxKm } : {}),
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: result.orderId,
        orderShortId: result.orderShortId,
        displayNumber: result.displayNumber,
        createdAt: result.createdAt,
      },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "paypal_capture_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
