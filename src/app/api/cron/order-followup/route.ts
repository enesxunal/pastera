import { NextResponse, type NextRequest } from "next/server";
import { processDueReviewEmails } from "@/lib/email/order-notifications";

/** Vercel Cron: teslimden ~1 saat sonra Google + Instagram yorum maili */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const queryKey = req.nextUrl.searchParams.get("key");

  if (!secret || (bearer !== secret && queryKey !== secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await processDueReviewEmails();
  return NextResponse.json({ ok: true, ...result });
}
