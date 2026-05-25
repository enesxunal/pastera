-- Pastera: Eksik sipariş sütunlarını tamamlar (tek seferde Supabase SQL Editor → Run)
-- Hata: "Veritabanı eksik" / column does not exist

-- Şubeler tablosu yoksa
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  radius_km numeric(6, 2) not null default 5,
  can_edit_prices boolean not null default false,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.branches (slug, name, radius_km)
values ('merkez', 'Pastera Merkez', 15)
on conflict (slug) do nothing;

-- Orders: temel tablo yoksa
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  total_amount numeric(10, 2) not null,
  discount_applied numeric(10, 2) not null default 0,
  status text not null default 'pending',
  payment_type text not null default 'cash',
  table_number text,
  items jsonb,
  created_at timestamptz not null default now()
);

-- Faz A sütunları
alter table public.orders add column if not exists branch_id uuid references public.branches (id) on delete set null;
alter table public.orders add column if not exists order_type text not null default 'web';

-- Faz C — teslimat adresi
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists delivery_street text;
alter table public.orders add column if not exists delivery_city text;
alter table public.orders add column if not exists delivery_postal text;
alter table public.orders add column if not exists delivery_lat double precision;
alter table public.orders add column if not exists delivery_lng double precision;
alter table public.orders add column if not exists delivery_distance_km numeric(6, 2);

-- Faz E — sadakat
alter table public.orders add column if not exists loyalty_awarded boolean not null default false;

-- order_type kısıtı
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_order_type_check') then
    alter table public.orders
      add constraint orders_order_type_check
      check (order_type in ('dine_in', 'delivery', 'web'));
  end if;
exception when others then
  null;
end $$;

-- Wesseling örnek konum (kendi restoranınıza göre değiştirin)
update public.branches
set lat = 50.8270, lng = 6.9740, radius_km = 15
where slug = 'merkez';

alter table public.orders enable row level security;
alter table public.branches enable row level security;

-- Kontrol (sonuçta sütunları görmelisiniz):
-- select column_name from information_schema.columns where table_name = 'orders' order by 1;
