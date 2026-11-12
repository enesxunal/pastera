import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD nicht gesetzt" }, { status: 503 });
  }
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (body.password !== pwd) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  cookies().set("pastera_admin", createAdminSession(), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  cookies().delete("pastera_admin");
  return NextResponse.json({ ok: true });
}
