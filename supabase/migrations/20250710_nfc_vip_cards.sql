-- NFC VIP kartları + üyelik seviyesi
-- profiles tablosu yoksa önce oluşturur (faz-e ile uyumlu)

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
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'dev_profiles_read'
  ) then
    create policy "dev_profiles_read" on public.profiles for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

alter table public.profiles add column if not exists loyalty_points int not null default 0;

alter table public.profiles
  add column if not exists membership_tier text not null default 'standard';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_membership_tier_check'
  ) then
    alter table public.profiles
      add constraint profiles_membership_tier_check
      check (membership_tier in ('standard', 'gold', 'black'));
  end if;
end $$;

-- Kayıtlı kullanıcılar için profil satırı (yoksa oluştur)
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'customer'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

create table if not exists public.nfc_cards (
  id uuid primary key default gen_random_uuid(),
  card_code text not null unique,
  tier text not null check (tier in ('gold', 'black')),
  user_id uuid references public.profiles (id) on delete set null,
  status text not null default 'unassigned'
    check (status in ('unassigned', 'active', 'revoked')),
  assigned_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists nfc_cards_user_id_idx on public.nfc_cards (user_id);
create index if not exists nfc_cards_card_code_idx on public.nfc_cards (card_code);

alter table public.nfc_cards enable row level security;

-- Örnek test kartları (NFC: /c/kart-001 …)
insert into public.nfc_cards (card_code, tier, status)
values
  ('kart-001', 'black', 'unassigned'),
  ('kart-002', 'gold', 'unassigned'),
  ('kart-003', 'gold', 'unassigned'),
  ('kart-004', 'black', 'unassigned')
on conflict (card_code) do nothing;
