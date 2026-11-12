-- Pastera VIP Club: existing auth.users accounts, independent of P Coin and Gold/Black.
-- Apply after 20250710_nfc_vip_cards.sql. Do not run on production before QA.
create extension if not exists pgcrypto;

create table if not exists public.vip_club_cards (
  id uuid primary key default gen_random_uuid(),
  card_number text not null unique,
  uid_hex text unique,
  public_token uuid not null unique default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'unassigned' check (status in ('unassigned','active','blocked')),
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  constraint vip_card_active_member check (status <> 'active' or user_id is not null),
  constraint vip_card_uid_format check (uid_hex is null or uid_hex ~ '^[0-9A-F]{8,20}$')
);
create unique index if not exists vip_card_one_active_per_user
  on public.vip_club_cards(user_id) where status='active' and user_id is not null;
create index if not exists vip_card_user_idx on public.vip_club_cards(user_id);

create table if not exists public.vip_club_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  delivery_method text not null check (delivery_method in ('pickup','delivery')),
  address_id uuid references public.customer_addresses(id) on delete set null,
  status text not null default 'requested' check (status in ('requested','preparing','fulfilled','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vip_club_scans (
  id uuid primary key,
  card_id uuid not null references public.vip_club_cards(id),
  user_id uuid not null references auth.users(id),
  delta smallint not null check (delta in (1,-1)),
  reversed_scan_id uuid unique references public.vip_club_scans(id),
  operator_label text not null default 'POS',
  created_at timestamptz not null default now(),
  constraint vip_reverse_shape check ((delta = 1 and reversed_scan_id is null) or (delta = -1 and reversed_scan_id is not null))
);
create index if not exists vip_scans_user_idx on public.vip_club_scans(user_id,created_at desc);
create index if not exists vip_scans_card_idx on public.vip_club_scans(card_id,created_at desc);

create table if not exists public.vip_club_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  operator_label text not null default 'POS',
  created_at timestamptz not null default now()
);
create index if not exists vip_rewards_user_idx on public.vip_club_rewards(user_id);

-- Physical cards: first batch, no UID attached until each real card is scanned and assigned.
insert into public.vip_club_cards(card_number)
select 'VIP-' || lpad(n::text,4,'0') from generate_series(1,200) as n
on conflict(card_number) do nothing;

alter table public.vip_club_cards enable row level security;
alter table public.vip_club_requests enable row level security;
alter table public.vip_club_scans enable row level security;
alter table public.vip_club_rewards enable row level security;
-- No public/anon access. All API operations go via server-side service role with verified auth.
revoke all on public.vip_club_cards, public.vip_club_requests, public.vip_club_scans, public.vip_club_rewards from anon, authenticated;

create or replace function public.vip_club_stamp(p_uid text, p_request_id uuid, p_operator text default 'POS')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_card public.vip_club_cards%rowtype; v_id uuid;
begin
  if p_uid is null or upper(regexp_replace(p_uid,'[^0-9A-Fa-f]','','g')) !~ '^[0-9A-F]{8,20}$' then
    raise exception 'invalid_card_uid';
  end if;
  select * into v_card from public.vip_club_cards
    where uid_hex=upper(regexp_replace(p_uid,'[^0-9A-Fa-f]','','g')) and status='active';
  if not found then raise exception 'card_not_active'; end if;
  -- A repeated HTTP retry with the SAME request id is not a second purchase.
  insert into public.vip_club_scans(id,card_id,user_id,delta,operator_label)
    values(p_request_id,v_card.id,v_card.user_id,1,left(coalesce(p_operator,'POS'),60))
    on conflict(id) do nothing returning id into v_id;
  if v_id is null then
    if not exists(select 1 from public.vip_club_scans where id=p_request_id and card_id=v_card.id and delta=1) then
      raise exception 'request_id_conflict';
    end if;
    v_id:=p_request_id;
  end if;
  return v_id;
end $$;

create or replace function public.vip_club_undo(p_scan_id uuid, p_operator text default 'ADMIN')
returns uuid language plpgsql security definer set search_path=public as $$
declare v_scan public.vip_club_scans%rowtype; v_net int; v_used int; v_undo uuid;
begin
  select * into v_scan from public.vip_club_scans where id=p_scan_id and delta=1;
  if not found then raise exception 'scan_not_found'; end if;
  perform pg_advisory_xact_lock(hashtext(v_scan.user_id::text));
  if exists(select 1 from public.vip_club_scans where reversed_scan_id=p_scan_id) then raise exception 'scan_already_undone'; end if;
  select coalesce(sum(delta),0) into v_net from public.vip_club_scans where user_id=v_scan.user_id;
  select count(*)*10 into v_used from public.vip_club_rewards where user_id=v_scan.user_id;
  if v_net-1 < v_used then raise exception 'cannot_undo_redeemed_reward'; end if;
  insert into public.vip_club_scans(id,card_id,user_id,delta,reversed_scan_id,operator_label)
  values(gen_random_uuid(),v_scan.card_id,v_scan.user_id,-1,p_scan_id,left(coalesce(p_operator,'ADMIN'),60)) returning id into v_undo;
  return v_undo;
end $$;

create or replace function public.vip_club_redeem(p_user_id uuid,p_operator text default 'POS')
returns uuid language plpgsql security definer set search_path=public as $$
declare v_net int;v_used int;v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select coalesce(sum(delta),0) into v_net from public.vip_club_scans where user_id=p_user_id;
  select count(*)*10 into v_used from public.vip_club_rewards where user_id=p_user_id;
  if v_net-v_used<10 then raise exception 'insufficient_stamps'; end if;
  insert into public.vip_club_rewards(user_id,operator_label) values(p_user_id,left(coalesce(p_operator,'POS'),60)) returning id into v_id;
  return v_id;
end $$;

-- Functions are privileged: PostgREST's authenticated clients cannot mint their own stamps.
revoke all on function public.vip_club_stamp(text,uuid,text) from public,anon,authenticated;
revoke all on function public.vip_club_undo(uuid,text) from public,anon,authenticated;
revoke all on function public.vip_club_redeem(uuid,text) from public,anon,authenticated;
grant execute on function public.vip_club_stamp(text,uuid,text) to service_role;
grant execute on function public.vip_club_undo(uuid,text) to service_role;
grant execute on function public.vip_club_redeem(uuid,text) to service_role;

create or replace function public.vip_club_summary(p_user_id uuid)
returns table(stamps integer,redemptions integer,available_rewards integer,progress integer,remaining integer)
language sql stable security definer set search_path=public as $$
  with v as (
    select greatest(0,coalesce((select sum(delta)::integer from public.vip_club_scans where user_id=p_user_id),0)) as total,
      (select count(*)::integer from public.vip_club_rewards where user_id=p_user_id) as used
  )
  select total, used, greatest(0,(total-used*10)/10), greatest(0,(total-used*10)%10),
    case when total-used*10>=10 then 0 else 10-greatest(0,(total-used*10)%10) end
  from v;
$$;
revoke all on function public.vip_club_summary(uuid) from public,anon,authenticated;
grant execute on function public.vip_club_summary(uuid) to service_role;
