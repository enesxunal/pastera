import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const [{ data: profiles }, { data: orders }, { data: branches }] = await Promise.all([
    svc
      .from("profiles")
      .select("id, email, full_name, phone, loyalty_points, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    svc
      .from("orders")
      .select("id, user_id, customer_phone, customer_name, branch_id, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    svc.from("branches").select("id, name"),
  ]);

  const branchNames = new Map((branches ?? []).map((b) => [b.id, b.name]));

  const members = (profiles ?? []).map((p) => {
    const phone = p.phone?.trim() ?? "";
    const related = (orders ?? []).filter(
      (o) =>
        o.user_id === p.id ||
        (phone && o.customer_phone?.trim() === phone),
    );
    const branchIds = new Set(related.map((o) => o.branch_id).filter(Boolean) as string[]);
    const delivered = related.filter((o) => o.status === "delivered");
    const lastOrder = related[0]?.created_at ?? null;

    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      phone: p.phone,
      loyalty_points: Number(p.loyalty_points ?? 0),
      role: p.role,
      created_at: p.created_at,
      orderCount: related.length,
      deliveredCount: delivered.length,
      totalSpent: delivered.reduce((s, o) => s + Number(o.total_amount ?? 0), 0),
      branches: Array.from(branchIds).map((id) => ({
        id,
        name: branchNames.get(id) ?? id.slice(0, 8),
      })),
      lastOrder,
    };
  });

  const summary = {
    totalMembers: members.length,
    withOrders: members.filter((m) => m.orderCount > 0).length,
    totalOrders: (orders ?? []).length,
  };

  return NextResponse.json({ ok: true, members, summary });
}
