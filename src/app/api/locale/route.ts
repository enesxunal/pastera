import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { locale?: string };
  try {
    body = (await request.json()) as { locale?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const locale = body.locale === "tr" ? "tr" : "de";
  cookies().set("pastera-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true, locale });
}
