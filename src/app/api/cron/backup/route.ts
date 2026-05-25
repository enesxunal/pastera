import { NextResponse, type NextRequest } from "next/server";
import { buildBackupPayload } from "@/lib/backup-export";

/** Vercel Cron: her gece 00:00 (Europe/Berlin) — CRON_SECRET header gerekli */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const queryKey = req.nextUrl.searchParams.get("key");

  if (!secret || (bearer !== secret && queryKey !== secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = await buildBackupPayload();
  if (!payload) {
    return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const filename = `pastera-auto-backup-${date}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Backup-Mode": "cron",
    },
  });
}
