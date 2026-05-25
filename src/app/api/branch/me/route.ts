import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBranchById } from "@/lib/branches-server";

export async function GET() {
  const branchId = cookies().get("pastera_branch_id")?.value;
  if (!branchId) return NextResponse.json({ ok: false }, { status: 401 });

  const branch = await getBranchById(branchId);
  if (!branch) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({ ok: true, branch });
}
