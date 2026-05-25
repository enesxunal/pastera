/** OpenStreetMap Nominatim — ücretsiz, API anahtarı gerekmez. */
export async function geocodeAddress(parts: {
  street: string;
  city: string;
  postal: string;
  country?: string;
}): Promise<{ lat: number; lng: number } | null> {
  const q = [parts.street, parts.postal, parts.city, parts.country ?? "Germany"]
    .filter(Boolean)
    .join(", ");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Pastera-Restaurant/1.0 (delivery-check)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: string; lon?: string }[];
  if (!data?.[0]?.lat || !data[0].lon) return null;

  const hit = data[0];
  return { lat: Number(hit.lat), lng: Number(hit.lon) };
}
