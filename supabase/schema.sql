-- Leo MVP - Supabase schema
-- Ejecutar este SQL en Supabase SQL Editor.

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  location_id text not null,
  classroom text not null,
  day text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

alter table public.schedules enable row level security;

drop policy if exists "Users can read own schedules" on public.schedules;
create policy "Users can read own schedules"
  on public.schedules
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own schedules" on public.schedules;
create policy "Users can insert own schedules"
  on public.schedules
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own schedules" on public.schedules;
create policy "Users can update own schedules"
  on public.schedules
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own schedules" on public.schedules;
create policy "Users can delete own schedules"
  on public.schedules
  for delete
  using (auth.uid() = user_id);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, location_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.favorites;
create policy "Users can read own favorites"
  on public.favorites
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
  on public.favorites
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites
  for delete
  using (auth.uid() = user_id);
