import { NextResponse } from "next/server";
import { getCatalogFromDb } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const branchId = new URL(request.url).searchParams.get("branchId");
  const catalog = await getCatalogFromDb(branchId);
  return NextResponse.json(catalog);
}
