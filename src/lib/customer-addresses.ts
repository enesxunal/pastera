import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerAddressRow = {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  postal: string | null;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
  created_at: string;
};

export async function upsertCustomerAddress(
  userId: string,
  input: {
    label?: string;
    street: string;
    city: string;
    postal?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  },
): Promise<void> {
  const supabase = createSupabaseServerClient();
  if (input.isDefault) {
    await supabase.from("customer_addresses").update({ is_default: false }).eq("user_id", userId);
  }

  const { data: existing } = await supabase
    .from("customer_addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("street", input.street.trim())
    .eq("city", input.city.trim())
    .maybeSingle();

  const row = {
    user_id: userId,
    label: input.label?.trim() || "Ev",
    street: input.street.trim(),
    city: input.city.trim(),
    postal: input.postal?.trim() || null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    is_default: input.isDefault ?? false,
  };

  if (existing?.id) {
    await supabase.from("customer_addresses").update(row).eq("id", existing.id);
  } else {
    await supabase.from("customer_addresses").insert(row);
  }
}
