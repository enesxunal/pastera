import { geocodeAddress } from "@/lib/geocode";

export type BranchAdminInput = {
  street?: string | null;
  city?: string | null;
  postal?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export async function resolveBranchCoordinates(
  input: BranchAdminInput,
): Promise<{ lat: number | null; lng: number | null; geocoded: boolean }> {
  const lat = input.lat != null && !Number.isNaN(input.lat) ? input.lat : null;
  const lng = input.lng != null && !Number.isNaN(input.lng) ? input.lng : null;
  if (lat != null && lng != null) {
    return { lat, lng, geocoded: false };
  }

  const street = input.street?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  if (!street || !city) {
    return { lat, lng, geocoded: false };
  }

  const geo = await geocodeAddress({
    street,
    city,
    postal: input.postal?.trim() ?? "",
  });
  if (!geo) return { lat: null, lng: null, geocoded: false };
  return { lat: geo.lat, lng: geo.lng, geocoded: true };
}

export function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
