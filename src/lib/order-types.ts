export type OrderStatus = "pending" | "preparing" | "ready" | "delivered";
export type OrderType = "dine_in" | "delivery" | "web" | "pickup";
export type PaymentType = "cash" | "card" | "online";

export type BranchRow = {
  id: string;
  slug: string;
  name: string;
  radius_km: number;
  can_edit_prices: boolean;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  street?: string | null;
  city?: string | null;
  postal?: string | null;
  phone?: string | null;
};

export type OrderRow = {
  id: string;
  /** Salon/mutfakta görünen no (33–133), veritabanında id benzersiz kalır */
  display_number?: number | null;
  branch_id: string | null;
  user_id: string | null;
  total_amount: number;
  discount_applied: number;
  status: OrderStatus;
  payment_type: string;
  order_type: OrderType;
  table_number: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  delivery_street?: string | null;
  delivery_city?: string | null;
  delivery_postal?: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  delivery_distance_km?: number | null;
  items: { lines?: { label: string; amount: number }[]; cart?: unknown } | null;
  ready_at?: string | null;
  delivered_at?: string | null;
  review_email_sent_at?: string | null;
  created_at: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, { de: string; tr: string }> = {
  pending: { de: "Neu", tr: "Yeni" },
  preparing: { de: "In Zubereitung", tr: "Hazırlanıyor" },
  ready: { de: "Fertig", tr: "Hazır" },
  delivered: { de: "Erledigt", tr: "Tamamlandı" },
};
