-- P Coin: gerçek %1 ondalık (5 € → 0,05), minimum 1 kaldırıldı

alter table public.profiles
  alter column loyalty_points type numeric(12, 2) using loyalty_points::numeric(12, 2);

alter table public.loyalty_logs
  alter column points_change type numeric(12, 2) using points_change::numeric(12, 2);

create or replace function public.award_loyalty_on_delivered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pts numeric(12, 2);
begin
  if new.status = 'delivered'
    and (old.status is distinct from 'delivered')
    and new.user_id is not null
    and coalesce(new.loyalty_awarded, false) = false then
    pts := round(coalesce(new.total_amount, 0)::numeric * 0.01, 2);
    if pts > 0 then
      update public.profiles
        set loyalty_points = coalesce(loyalty_points, 0) + pts
        where id = new.user_id;
      insert into public.loyalty_logs (user_id, order_id, points_change, reason)
        values (new.user_id, new.id, pts, 'p_coin_delivered');
    end if;
    new.loyalty_awarded := true;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_loyalty_on_delivered on public.orders;
create trigger orders_loyalty_on_delivered
  before update on public.orders
  for each row execute function public.award_loyalty_on_delivered();
