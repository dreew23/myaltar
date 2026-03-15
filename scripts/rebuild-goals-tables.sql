-- ============================================================
-- REBUILD GOALS TABLES
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Drop old pulse_responses table
drop table if exists public.pulse_responses;

-- 2. Create pulse_checks table (flat structure, one row per week)
create table if not exists public.pulse_checks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  week_number         smallint not null,
  date                date not null,
  quarter_code        text not null,       -- e.g. "2026-Q1"

  g1_prayer           text check (g1_prayer in ('yes','no','blocked')),
  g1_note             text,
  g2_sermons          text check (g2_sermons in ('yes','no','blocked')),
  g2_note             text,
  g3_dominion         smallint check (g3_dominion is null or (g3_dominion >= 1 and g3_dominion <= 10)),
  g3_note             text,
  g4_warfare          text check (g4_warfare in ('yes','no','blocked')),
  g4_note             text,
  g5_decisions        text check (g5_decisions in ('yes','no','blocked')),
  g5_note             text,
  g6_community        text check (g6_community in ('yes','no','blocked')),
  g6_note             text,
  g7_content          text check (g7_content in ('yes','no','blocked')),
  g7_note             text,

  overall_reflection  text,
  created_at          timestamptz not null default now(),

  unique(user_id, quarter_code, week_number)
);

create index if not exists idx_pulse_checks_user on public.pulse_checks(user_id, date desc);

-- 3. RLS
alter table public.pulse_checks enable row level security;

create policy "Users can view own pulse checks"
  on public.pulse_checks for select using (auth.uid() = user_id);

create policy "Users can insert own pulse checks"
  on public.pulse_checks for insert with check (auth.uid() = user_id);

create policy "Users can update own pulse checks"
  on public.pulse_checks for update using (auth.uid() = user_id);

create policy "Users can delete own pulse checks"
  on public.pulse_checks for delete using (auth.uid() = user_id);
