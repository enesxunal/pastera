import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { OrderRow } from "@/lib/order-types";
import { orderLineTexts } from "@/lib/order-display";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

type ProductStat = { label: string; qty: number; revenue: number };

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const branchId = params.id;
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data: branch, error: be } = await svc.from("branches").select("*").eq("id", branchId).maybeSingle();
  if (be || !branch) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const { data: orders } = await svc
    .from("orders")
    .select("*")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false })
    .limit(500);

  const list = (orders ?? []) as OrderRow[];
  const delivered = list.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((s, o) => s + Number(o.total_amount ?? 0), 0);

  const productMap = new Map<string, ProductStat>();
  for (const o of list) {
    for (const line of orderLineTexts(o)) {
      const m = line.match(/^(\d+)×\s*(.+?)\s*—/);
      const qty = m ? Number(m[1]) : 1;
      const label = m ? m[2].trim() : line;
      const amountMatch = line.match(/—\s*([\d.,]+)\s*€/);
      const amount = amountMatch
        ? Number(amountMatch[1].replace(".", "").replace(",", ".")) || 0
        : 0;
      const prev = productMap.get(label) ?? { label, qty: 0, revenue: 0 };
      productMap.set(label, {
        label,
        qty: prev.qty + qty,
        revenue: prev.revenue + amount,
      });
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 30);

  const customers = new Map<
    string,
    { name: string; phone: string; orderCount: number; totalSpent: number; lastOrder: string }
  >();
  for (const o of list) {
    const key = `${o.customer_phone ?? ""}|${o.customer_name ?? ""}`;
    const prev = customers.get(key) ?? {
      name: o.customer_name?.trim() || "—",
      phone: o.customer_phone?.trim() || "—",
      orderCount: 0,
      totalSpent: 0,
      lastOrder: o.created_at,
    };
    customers.set(key, {
      name: prev.name !== "—" ? prev.name : o.customer_name?.trim() || "—",
      phone: prev.phone !== "—" ? prev.phone : o.customer_phone?.trim() || "—",
      orderCount: prev.orderCount + 1,
      totalSpent: prev.totalSpent + Number(o.total_amount ?? 0),
      lastOrder: o.created_at > prev.lastOrder ? o.created_at : prev.lastOrder,
    });
  }

  const customerList = Array.from(customers.values()).sort(
    (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime(),
  );

  return NextResponse.json({
    ok: true,
    branch,
    stats: {
      totalOrders: list.length,
      deliveredOrders: delivered.length,
      totalRevenue,
      activeOrders: list.filter((o) => ["pending", "preparing", "ready"].includes(o.status)).length,
    },
    topProducts,
    customers: customerList,
    orders: list,
  });
}
