-- Kerygma initial schema.
-- Run via `supabase db push` or paste into the SQL editor of your project.

create extension if not exists "pgcrypto";

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  input jsonb not null,
  sections jsonb not null,
  bookmarked boolean not null default false,
  is_draft boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system',
  font_size text not null default 'md',
  default_translation text not null default 'NKJV',
  default_audience text not null default 'congregation',
  default_length text not null default 'standard',
  default_style text not null default 'expository',
  updated_at timestamptz not null default now()
);

create table if not exists public.usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  generations_used_this_month integer not null default 0,
  generations_limit integer not null default 20,
  resets_on timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  updated_at timestamptz not null default now()
);

alter table public.sermons enable row level security;
alter table public.preferences enable row level security;
alter table public.usage enable row level security;

create policy "sermons_select_own" on public.sermons
  for select using (auth.uid() = user_id);
create policy "sermons_modify_own" on public.sermons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "preferences_select_own" on public.preferences
  for select using (auth.uid() = user_id);
create policy "preferences_modify_own" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usage_select_own" on public.usage
  for select using (auth.uid() = user_id);
create policy "usage_modify_own" on public.usage
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists sermons_user_updated_idx on public.sermons (user_id, updated_at desc);
