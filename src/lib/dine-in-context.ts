const KEY = "pastera-dine-in";

export type DineInContext = {
  branchId: string;
  branchSlug: string;
  branchName: string;
  tableNumber: string;
};

export function saveDineInContext(ctx: DineInContext): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("pastera-delivery");
  sessionStorage.setItem(KEY, JSON.stringify(ctx));
  window.dispatchEvent(new Event("pastera-dine-in-update"));
}

export function loadDineInContext(): DineInContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as DineInContext;
    if (!data.branchId || !data.tableNumber) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearDineInContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pastera-dine-in-update"));
}
