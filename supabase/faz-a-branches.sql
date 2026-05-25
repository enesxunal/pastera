-- Faz A: Şubeler + masa QR + salon ekranı
-- Supabase SQL Editor'da BU DOSYAYI tek başına çalıştırabilirsiniz.
-- (orders tablosu yoksa aşağıda otomatik oluşturulur)

-- ── 1) Siparişler tablosu (yoksa oluştur) ─────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  total_amount numeric(10, 2) not null,
  discount_applied numeric(10, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'preparing', 'ready', 'delivered')),
  payment_type text not null default 'cash'
    check (payment_type in ('online', 'cash')),
  table_number text,
  items jsonb,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'dev_orders_insert'
  ) then
    create policy "dev_orders_insert" on public.orders for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'dev_orders_select'
  ) then
    create policy "dev_orders_select" on public.orders for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'dev_orders_update'
  ) then
    create policy "dev_orders_update" on public.orders for update using (true) with check (true);
  end if;
end $$;

-- ── 2) Şubeler ───────────────────────────────────────────────────────
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

-- ── 3) Siparişe şube + sipariş tipi ──────────────────────────────────
alter table public.orders
  add column if not exists branch_id uuid references public.branches (id) on delete set null;

alter table public.orders
  add column if not exists order_type text not null default 'web';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_order_type_check'
  ) then
    alter table public.orders
      add constraint orders_order_type_check
      check (order_type in ('dine_in', 'delivery', 'web'));
  end if;
end $$;

create index if not exists orders_branch_created_idx
  on public.orders (branch_id, created_at desc);

create index if not exists orders_status_idx on public.orders (status);

-- Realtime: Dashboard → Database → Replication → orders işaretle

alter table public.branches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'branches' and policyname = 'dev_branches_read'
  ) then
    create policy "dev_branches_read" on public.branches
      for select using (is_active = true);
  end if;
end $$;

-- Varsayılan şube (slug: merkez)
insert into public.branches (slug, name, radius_km)
values ('merkez', 'Pastera Merkez', 5)
on conflict (slug) do nothing;
