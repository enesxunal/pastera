const KEY = "pastera-delivery-contact";

export type DeliveryContact = {
  customerName: string;
  customerPhone: string;
};

export function saveDeliveryContact(contact: DeliveryContact): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(contact));
}

export function loadDeliveryContact(): DeliveryContact | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as DeliveryContact;
    if (!data.customerPhone?.trim()) return null;
    return data;
  } catch {
    return null;
  }
}
