-- Faz E: Müşteri profili, adresler, sipariş görüntüleme, sadakat puanı
-- Önce faz-a (orders + branches) çalışmış olmalı. Bu dosya profiles yoksa onu da kurar.

-- ── Profiller (faz-d yoksa burada oluşturulur) ──
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer'
    check (role in ('admin', 'manager', 'staff', 'customer')),
  loyalty_points int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'dev_profiles_read'
  ) then
    create policy "dev_profiles_read" on public.profiles for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

alter table public.profiles add column if not exists loyalty_points int not null default 0;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mevcut kayıtlı kullanıcılar için profil satırı
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'customer'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- ── Kayıtlı adresler ──
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Ev',
  street text not null,
  city text not null,
  postal text,
  lat double precision,
  lng double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_idx
  on public.customer_addresses (user_id, created_at desc);

alter table public.customer_addresses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'addresses_select_own'
  ) then
    create policy "addresses_select_own" on public.customer_addresses
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'addresses_insert_own'
  ) then
    create policy "addresses_insert_own" on public.customer_addresses
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'addresses_update_own'
  ) then
    create policy "addresses_update_own" on public.customer_addresses
      for update using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'customer_addresses' and policyname = 'addresses_delete_own'
  ) then
    create policy "addresses_delete_own" on public.customer_addresses
      for delete using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_select_own'
  ) then
    create policy "orders_select_own" on public.orders
      for select using (auth.uid() = user_id);
  end if;
end $$;

alter table public.orders add column if not exists loyalty_awarded boolean not null default false;

-- loyalty_logs (schema.sql çalıştırılmadıysa burada oluşturulur)
create table if not exists public.loyalty_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  points_change int,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.loyalty_logs add column if not exists points_change int;
alter table public.loyalty_logs add column if not exists reason text;

alter table public.loyalty_logs enable row level security;

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc)
  where user_id is not null;

create or replace function public.award_loyalty_on_delivered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pts int;
begin
  if new.status = 'delivered'
     and (old.status is distinct from 'delivered')
     and new.user_id is not null
     and coalesce(new.loyalty_awarded, false) = false then
    pts := greatest(1, floor(coalesce(new.total_amount, 0)::numeric));
    update public.profiles
      set loyalty_points = loyalty_points + pts
      where id = new.user_id;
    insert into public.loyalty_logs (user_id, order_id, points_change, reason)
      values (new.user_id, new.id, pts, 'order_delivered');
    new.loyalty_awarded := true;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_loyalty_on_delivered on public.orders;
create trigger orders_loyalty_on_delivered
  before update on public.orders
  for each row execute function public.award_loyalty_on_delivered();
