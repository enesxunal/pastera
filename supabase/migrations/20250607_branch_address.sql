-- Şube adres ve iletişim bilgileri (admin panel)
alter table public.branches add column if not exists street text;
alter table public.branches add column if not exists city text;
alter table public.branches add column if not exists postal text;
alter table public.branches add column if not exists phone text;
