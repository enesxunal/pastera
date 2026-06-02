  -- Katalog (Menü): öffentlich nur aktive Zeilen.
  -- Im Supabase SQL Editor ausführen.

  create table if not exists public.catalog_items (
    id text primary key,
    category text not null
      check (category in ('pasta_base', 'sauce', 'special', 'topping', 'chef_special', 'soup', 'starter', 'drink')),
    name_de text not null,
    name_tr text not null,
    price numeric(10, 2) not null,
    vegan boolean not null default false,
    image text,
    sort_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  alter table public.catalog_items enable row level security;

  drop policy if exists "catalog_select_active" on public.catalog_items;
  create policy "catalog_select_active" on public.catalog_items
    for select using (is_active = true);

  create index if not exists catalog_items_category_idx on public.catalog_items (category);
  create index if not exists catalog_items_active_idx on public.catalog_items (is_active);
