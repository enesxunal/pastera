-- Faz D: Müşteri profili (Supabase Auth ile)
-- Supabase Dashboard → Authentication → Providers → Email açık olmalı

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
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'dev_profiles_read'
  ) then
    create policy "dev_profiles_read" on public.profiles for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

alter table public.profiles add column if not exists loyalty_points int not null default 0;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
