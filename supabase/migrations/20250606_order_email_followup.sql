-- Sipariş e-postaları: teslim zamanı + yorum maili takibi
alter table public.orders add column if not exists delivered_at timestamptz;
alter table public.orders add column if not exists review_email_sent_at timestamptz;

update public.orders
set delivered_at = coalesce(ready_at, created_at)
where status = 'delivered' and delivered_at is null;
