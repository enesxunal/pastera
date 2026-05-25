-- Restoran Wesseling / Köln bölgesindeyse bu konumu kullanın (test ve canlı)
-- Supabase SQL Editor → Run

update public.branches
set
  lat = 50.8270,
  lng = 6.9740,
  radius_km = 15
where slug = 'merkez';

-- Kontrol:
-- select slug, name, lat, lng, radius_km from public.branches;
