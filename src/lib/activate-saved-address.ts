import { saveDeliveryContext, type DeliveryContext } from "@/lib/delivery-context";
import { saveDeliveryContact, type DeliveryContact } from "@/lib/delivery-contact";

export type SavedAddress = {
  id: string;
  label: string;
  street: string;
  city: string;
  postal: string | null;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
};

type ActivateResult =
  | { ok: true; context: DeliveryContext }
  | { ok: false; error: string; distanceKm?: number; maxKm?: number };

export async function activateSavedAddress(
  address: SavedAddress,
  contact: DeliveryContact,
): Promise<ActivateResult> {
  const res = await fetch("/api/delivery/activate", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addressId: address.id,
      street: address.street,
      city: address.city,
      postal: address.postal ?? "",
      ...(address.lat != null && address.lng != null ? { lat: address.lat, lng: address.lng } : {}),
    }),
  });

  const j = (await res.json()) as {
    ok?: boolean;
    error?: string;
    branchId?: string;
    branchSlug?: string;
    branchName?: string;
    street?: string;
    city?: string;
    postal?: string;
    lat?: number;
    lng?: number;
    distanceKm?: number;
    maxKm?: number;
  };

  if (!res.ok || !j.ok || !j.branchId) {
    return {
      ok: false,
      error: j.error ?? "activate_failed",
      distanceKm: j.distanceKm,
      maxKm: j.maxKm,
    };
  }

  const context: DeliveryContext = {
    branchId: j.branchId,
    branchSlug: j.branchSlug!,
    branchName: j.branchName!,
    customerName: contact.customerName,
    customerPhone: contact.customerPhone,
    street: j.street ?? address.street,
    city: j.city ?? address.city,
    postal: j.postal ?? address.postal ?? "",
    lat: j.lat!,
    lng: j.lng!,
    distanceKm: j.distanceKm!,
  };

  saveDeliveryContact(contact);
  saveDeliveryContext(context);
  return { ok: true, context };
}
