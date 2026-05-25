import { NextResponse, type NextRequest } from "next/server";
import { buildBackupPayload } from "@/lib/backup-export";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

/** JSON yedek — tek tıkla indir */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const payload = await buildBackupPayload();
  if (!payload) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pastera-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
