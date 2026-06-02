-- Bestehende Datenbank: Chef-Specials-Kategorie erlauben.
alter table public.catalog_items drop constraint if exists catalog_items_category_check;
alter table public.catalog_items add constraint catalog_items_category_check
  check (category in (
    'pasta_base', 'sauce', 'special', 'topping', 'chef_special', 'soup', 'starter', 'drink'
  ));
