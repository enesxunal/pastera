import { clearDineInContext } from "@/lib/dine-in-context";
import { clearPickupContext } from "@/lib/pickup-context";

const KEY = "pastera-delivery";

export type DeliveryContext = {
  branchId: string;
  branchSlug: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  street: string;
  city: string;
  postal: string;
  lat: number;
  lng: number;
  distanceKm: number;
};

export function saveDeliveryContext(ctx: DeliveryContext): void {
  if (typeof window === "undefined") return;
  clearDineInContext();
  clearPickupContext();
  sessionStorage.setItem(KEY, JSON.stringify(ctx));
  window.dispatchEvent(new Event("pastera-delivery-update"));
}

export function loadDeliveryContext(): DeliveryContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as DeliveryContext;
    if (!data.branchId || !data.lat || !data.lng) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearDeliveryContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pastera-delivery-update"));
}
