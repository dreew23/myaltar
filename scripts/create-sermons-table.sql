-- ============================================================
-- SERMONS TABLE
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Create the table
create table if not exists public.sermons (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  speaker       text not null default 'Apostle Joshua Selman',
  category      text not null default 'uncategorized'
                check (category in (
                  'uncategorized','prayer','faith','the-holy-spirit',
                  'wisdom','purpose-and-destiny','relationships','prosperity'
                )),
  resonance     smallint check (resonance is null or (resonance >= 1 and resonance <= 5)),
  source_url    text,
  tags          text[] default '{}',
  mastered      boolean not null default false,
  applied       boolean not null default false,

  -- Mastery notes (populated when mastered = true)
  mastery_summary       text,
  mastery_revelation    text,
  mastery_key_principle text,
  mastery_life_areas    text[] default '{}',

  -- Application notes (populated when applied = true)
  application_how       text,
  application_outcome   text,
  application_date      date,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Indexes
create index if not exists idx_sermons_user_id          on public.sermons(user_id);
create index if not exists idx_sermons_user_category    on public.sermons(user_id, category);
create index if not exists idx_sermons_user_resonance   on public.sermons(user_id, resonance desc);

-- 3. Row-level security
alter table public.sermons enable row level security;

create policy "Users can view own sermons"
  on public.sermons for select
  using (auth.uid() = user_id);

create policy "Users can insert own sermons"
  on public.sermons for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sermons"
  on public.sermons for update
  using (auth.uid() = user_id);

create policy "Users can delete own sermons"
  on public.sermons for delete
  using (auth.uid() = user_id);

-- 4. Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sermons_updated_at
  before update on public.sermons
  for each row execute function public.handle_updated_at();
