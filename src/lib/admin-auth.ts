import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export function isAdminRequest(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export function isAdminCookie(): boolean {
  return cookies().get("pastera_admin")?.value === "1";
}
