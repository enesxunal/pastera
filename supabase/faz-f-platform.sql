  -- Faz F: pickup, P Coin %1, profil telefonu, salon ekranı için order_type

  alter table public.profiles add column if not exists phone text;

  -- Müşteri / salon ekranında görünen sipariş no (şube başına 33–133 döngüsel)
  alter table public.orders add column if not exists display_number int;
alter table public.orders add column if not exists ready_at timestamptz;

-- Mevcut hazır siparişler için yaklaşık zaman
update public.orders set ready_at = created_at where status = 'ready' and ready_at is null;

  create index if not exists orders_branch_display_idx
    on public.orders (branch_id, display_number desc)
    where display_number is not null;

  alter table public.orders drop constraint if exists orders_order_type_check;
  alter table public.orders
    add constraint orders_order_type_check
    check (order_type in ('dine_in', 'delivery', 'web', 'pickup'));

  -- Eski siparişleri telefon ile hesaba bağla (profiles.phone dolu olmalı)
  update public.orders o
  set user_id = p.id
  from public.profiles p
  where o.user_id is null
    and o.customer_phone is not null
    and p.phone is not null
    and trim(o.customer_phone) = trim(p.phone);

  -- P Coin: teslim edilince toplamın %1'i (faz-g-pcoin-decimal.sql ile ondalık)
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
      pts := greatest(1, round(coalesce(new.total_amount, 0)::numeric * 0.01)::int);
      update public.profiles
        set loyalty_points = loyalty_points + pts
        where id = new.user_id;
      insert into public.loyalty_logs (user_id, order_id, points_change, reason)
        values (new.user_id, new.id, pts, 'p_coin_delivered');
      new.loyalty_awarded := true;
    end if;
    return new;
  end;
  $$;

  drop trigger if exists orders_loyalty_on_delivered on public.orders;
  create trigger orders_loyalty_on_delivered
    before update on public.orders
    for each row execute function public.award_loyalty_on_delivered();
