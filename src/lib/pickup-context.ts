import { clearDineInContext } from "@/lib/dine-in-context";
import { clearDeliveryContext } from "@/lib/delivery-context";

const KEY = "pastera-pickup";

export type PickupContext = {
  branchId: string;
  branchSlug: string;
  branchName: string;
  customerName?: string;
  customerPhone?: string;
};

export function savePickupContext(ctx: PickupContext): void {
  if (typeof window === "undefined") return;
  clearDeliveryContext();
  clearDineInContext();
  sessionStorage.setItem(KEY, JSON.stringify(ctx));
  window.dispatchEvent(new Event("pastera-pickup-update"));
}

export function loadPickupContext(): PickupContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as PickupContext;
    if (!data.branchId) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearPickupContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pastera-pickup-update"));
}
