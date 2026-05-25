import { saveDeliveryContext, type DeliveryContext } from "@/lib/delivery-context";
import { saveDeliveryContact } from "@/lib/delivery-contact";

export type PreparedDelivery = {
  branchId: string;
  branchSlug: string;
  branchName: string;
  street: string;
  city: string;
  postal: string;
  lat: number;
  lng: number;
  distanceKm: number;
  customerName: string;
  customerPhone: string;
};

export function applyDeliverySession(p: PreparedDelivery): void {
  const context: DeliveryContext = {
    branchId: p.branchId,
    branchSlug: p.branchSlug,
    branchName: p.branchName,
    customerName: p.customerName,
    customerPhone: p.customerPhone,
    street: p.street,
    city: p.city,
    postal: p.postal,
    lat: p.lat,
    lng: p.lng,
    distanceKm: p.distanceKm,
  };
  saveDeliveryContact({
    customerName: p.customerName,
    customerPhone: p.customerPhone,
  });
  saveDeliveryContext(context);
}
