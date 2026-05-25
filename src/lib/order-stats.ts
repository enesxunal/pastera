export type OrderForStats = {
  id: string;
  branch_id: string | null;
  total_amount: number | string;
  status: string;
  order_type?: string | null;
  created_at: string;
};

export type BranchStatsSummary = {
  branchId: string;
  branchName: string;
  branchSlug: string;
  todayOrders: number;
  todayRevenue: number;
  todayGross: number;
  monthOrders: number;
  monthRevenue: number;
  monthGross: number;
  activeOrders: number;
  deliveredToday: number;
  deliveryToday: number;
  pickupToday: number;
  dineInToday: number;
};

export type DailyRevenueRow = {
  date: string;
  revenue: number;
  gross: number;
  count: number;
  delivered: number;
};

export type GlobalStatsSummary = {
  branches: BranchStatsSummary[];
  totals: BranchStatsSummary;
};

const ACTIVE = new Set(["pending", "preparing", "ready"]);

function berlinYmd(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function berlinYm(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
  }).format(date);
}

function isTodayBerlin(iso: string): boolean {
  return berlinYmd(new Date(iso)) === berlinYmd(new Date());
}

function isMonthBerlin(iso: string): boolean {
  return berlinYm(new Date(iso)) === berlinYm(new Date());
}

function amount(o: OrderForStats): number {
  return Number(o.total_amount) || 0;
}

export function computeBranchStats(
  orders: OrderForStats[],
  branch: { id: string; name: string; slug: string },
): BranchStatsSummary {
  const branchOrders = orders.filter((o) => o.branch_id === branch.id);
  const today = branchOrders.filter((o) => isTodayBerlin(o.created_at));
  const month = branchOrders.filter((o) => isMonthBerlin(o.created_at));
  const deliveredToday = today.filter((o) => o.status === "delivered");

  return {
    branchId: branch.id,
    branchName: branch.name,
    branchSlug: branch.slug,
    todayOrders: today.length,
    todayRevenue: deliveredToday.reduce((s, o) => s + amount(o), 0),
    todayGross: today.reduce((s, o) => s + amount(o), 0),
    monthOrders: month.length,
    monthRevenue: month
      .filter((o) => o.status === "delivered")
      .reduce((s, o) => s + amount(o), 0),
    monthGross: month.reduce((s, o) => s + amount(o), 0),
    activeOrders: branchOrders.filter((o) => ACTIVE.has(o.status)).length,
    deliveredToday: deliveredToday.length,
    deliveryToday: today.filter((o) => o.order_type === "delivery").length,
    pickupToday: today.filter((o) => o.order_type === "pickup").length,
    dineInToday: today.filter((o) => o.order_type === "dine_in").length,
  };
}

export function computeGlobalStats(
  orders: OrderForStats[],
  branches: { id: string; name: string; slug: string }[],
): GlobalStatsSummary {
  const branchStats = branches.map((b) => computeBranchStats(orders, b));

  const totals = branchStats.reduce(
    (acc, b) => ({
      branchId: "all",
      branchName: "—",
      branchSlug: "all",
      todayOrders: acc.todayOrders + b.todayOrders,
      todayRevenue: acc.todayRevenue + b.todayRevenue,
      todayGross: acc.todayGross + b.todayGross,
      monthOrders: acc.monthOrders + b.monthOrders,
      monthRevenue: acc.monthRevenue + b.monthRevenue,
      monthGross: acc.monthGross + b.monthGross,
      activeOrders: acc.activeOrders + b.activeOrders,
      deliveredToday: acc.deliveredToday + b.deliveredToday,
      deliveryToday: acc.deliveryToday + b.deliveryToday,
      pickupToday: acc.pickupToday + b.pickupToday,
      dineInToday: acc.dineInToday + b.dineInToday,
    }),
    {
      branchId: "all",
      branchName: "—",
      branchSlug: "all",
      todayOrders: 0,
      todayRevenue: 0,
      todayGross: 0,
      monthOrders: 0,
      monthRevenue: 0,
      monthGross: 0,
      activeOrders: 0,
      deliveredToday: 0,
      deliveryToday: 0,
      pickupToday: 0,
      dineInToday: 0,
    },
  );

  return { branches: branchStats, totals };
}

/** Son 7 gün günlük ciro (tamamlanan siparişler) */
export function last7DaysRevenue(
  orders: OrderForStats[],
  branchId?: string,
): { date: string; revenue: number; count: number }[] {
  const filtered = branchId ? orders.filter((o) => o.branch_id === branchId) : orders;
  const days: { date: string; revenue: number; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = berlinYmd(d);
    const dayOrders = filtered.filter(
      (o) => berlinYmd(new Date(o.created_at)) === label && o.status === "delivered",
    );
    days.push({
      date: label,
      revenue: dayOrders.reduce((s, o) => s + amount(o), 0),
      count: dayOrders.length,
    });
  }
  return days;
}

/** Son N gün günlük ciro ve sipariş adedi */
export function dailyRevenueBreakdown(
  orders: OrderForStats[],
  days = 14,
  branchId?: string,
): DailyRevenueRow[] {
  const filtered = branchId ? orders.filter((o) => o.branch_id === branchId) : orders;
  const rows: DailyRevenueRow[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = berlinYmd(d);
    const dayOrders = filtered.filter((o) => berlinYmd(new Date(o.created_at)) === label);
    const delivered = dayOrders.filter((o) => o.status === "delivered");
    rows.push({
      date: label,
      revenue: delivered.reduce((s, o) => s + amount(o), 0),
      gross: dayOrders.reduce((s, o) => s + amount(o), 0),
      count: dayOrders.length,
      delivered: delivered.length,
    });
  }
  return rows;
}
