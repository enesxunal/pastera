-- Faz C: Eve teslimat — siparişe adres alanları
-- faz-a-branches.sql sonrası çalıştırın.

alter table public.orders
  add column if not exists customer_name text;

alter table public.orders
  add column if not exists customer_phone text;

alter table public.orders
  add column if not exists delivery_street text;

alter table public.orders
  add column if not exists delivery_city text;

alter table public.orders
  add column if not exists delivery_postal text;

alter table public.orders
  add column if not exists delivery_lat double precision;

alter table public.orders
  add column if not exists delivery_lng double precision;

alter table public.orders
  add column if not exists delivery_distance_km numeric(6, 2);

-- Örnek: merkez şube konumu (Almanya — kendi adresinize göre güncelleyin)
update public.branches
set lat = 52.520008, lng = 13.404954
where slug = 'merkez' and lat is null;
