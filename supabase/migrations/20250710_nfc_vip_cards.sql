-- NFC VIP kartları + üyelik seviyesi

alter table public.profiles
  add column if not exists membership_tier text not null default 'standard'
    check (membership_tier in ('standard', 'gold', 'black'));

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
