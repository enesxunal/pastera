-- PASTERA OS — Supabase SQL (SQL Editor’da tek seferde çalıştırılabilir)
-- ÜRETİM ÖNCESİ: RLS politikalarını sıkılaştır; aşağıdaki "dev" insert/select geniş izinleri kaldır.

-- Realtime (mutfak ekranı için sonra): Dashboard → Database → Replication → orders tablosunu işaretle
-- veya: alter publication supabase_realtime add table public.orders;

-- Profiller (auth.users ile eşleşir; kayıt sonrası trigger ile doldurma ayrı adımda)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer'
    check (role in ('admin', 'manager', 'staff', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  total_amount numeric(10, 2) not null,
  discount_applied numeric(10, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'preparing', 'ready', 'delivered')),
  payment_type text not null default 'online'
    check (payment_type in ('online', 'cash')),
  table_number text,
  items jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('vegan', 'normal')),
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.toppings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.loyalty_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.menu_items enable row level security;
alter table public.toppings enable row level security;
alter table public.loyalty_logs enable row level security;

-- --- SADECE GELİŞTİRME: herkese açık — üretimde kaldır / değiştir ---
create policy "dev_profiles_read" on public.profiles for select using (true);
create policy "dev_orders_insert" on public.orders for insert with check (true);
create policy "dev_orders_select" on public.orders for select using (true);
create policy "dev_menu_read" on public.menu_items for select using (true);
create policy "dev_toppings_read" on public.toppings for select using (true);
create policy "dev_loyalty_read" on public.loyalty_logs for select using (true);
create policy "dev_loyalty_insert" on public.loyalty_logs for insert with check (true);
