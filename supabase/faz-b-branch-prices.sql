-- Faz B: Şube bazlı fiyat override (merkez katalog + şube fiyatı)
-- faz-a-branches.sql + catalog_items.sql sonrası çalıştırın.

create table if not exists public.branch_catalog_prices (
  branch_id uuid not null references public.branches (id) on delete cascade,
  catalog_item_id text not null references public.catalog_items (id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  updated_at timestamptz not null default now(),
  primary key (branch_id, catalog_item_id)
);

create index if not exists branch_catalog_prices_branch_idx
  on public.branch_catalog_prices (branch_id);

alter table public.branch_catalog_prices enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'branch_catalog_prices' and policyname = 'dev_branch_prices_all'
  ) then
    create policy "dev_branch_prices_all" on public.branch_catalog_prices
      for all using (true) with check (true);
  end if;
end $$;
