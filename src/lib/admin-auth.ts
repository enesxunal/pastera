import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "pastera_admin";
const MAX_AGE = 8 * 60 * 60;
function secret() { return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ""; }
function signature(payload: string) { return createHmac("sha256", secret()).update(payload).digest("hex"); }
export function createAdminSession(): string {
  if (!secret()) throw new Error("admin_secret_missing");
  const payload = `${Math.floor(Date.now()/1000)}.${randomBytes(12).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}
export function verifyAdminSession(value: string | undefined): boolean {
  if (!secret() || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [ts, nonce, mac] = parts;
  if (!/^\d{10}$/.test(ts) || !/^[a-f0-9]{24}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(mac)) return false;
  const age = Math.floor(Date.now()/1000)-Number(ts);
  if (age < 0 || age > MAX_AGE) return false;
  const expected = Buffer.from(signature(`${ts}.${nonce}`), "hex");
  return timingSafeEqual(expected, Buffer.from(mac,"hex"));
}
export function isAdminRequest(req: NextRequest): boolean { return verifyAdminSession(req.cookies.get(COOKIE)?.value); }
export function isAdminCookie(): boolean { return verifyAdminSession(cookies().get(COOKIE)?.value); }
