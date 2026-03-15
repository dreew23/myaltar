-- ============================================================
-- GOALS & PULSE TABLES
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. pulse_responses — weekly Sunday pulse check answers
create table if not exists public.pulse_responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  week_date     date not null,          -- the Sunday this pulse belongs to
  question_id   text not null,          -- matches pulseQuestions[].id
  answer_bool   boolean,                -- for yes/no questions
  answer_int    smallint,               -- for scale questions (1-10)
  created_at    timestamptz not null default now(),

  unique(user_id, week_date, question_id)
);

create index if not exists idx_pulse_user_week on public.pulse_responses(user_id, week_date desc);

alter table public.pulse_responses enable row level security;

create policy "Users can view own pulse responses"
  on public.pulse_responses for select using (auth.uid() = user_id);

create policy "Users can insert own pulse responses"
  on public.pulse_responses for insert with check (auth.uid() = user_id);

create policy "Users can update own pulse responses"
  on public.pulse_responses for update using (auth.uid() = user_id);

create policy "Users can delete own pulse responses"
  on public.pulse_responses for delete using (auth.uid() = user_id);


-- 2. goal_notes — per-goal targets and reflections
create table if not exists public.goal_notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  goal_id       text not null,          -- e.g. "G1", "G2", etc.
  target_text   text,
  reflection    text,
  updated_at    timestamptz not null default now(),

  unique(user_id, goal_id)
);

create index if not exists idx_goal_notes_user on public.goal_notes(user_id);

alter table public.goal_notes enable row level security;

create policy "Users can view own goal notes"
  on public.goal_notes for select using (auth.uid() = user_id);

create policy "Users can insert own goal notes"
  on public.goal_notes for insert with check (auth.uid() = user_id);

create policy "Users can update own goal notes"
  on public.goal_notes for update using (auth.uid() = user_id);

create policy "Users can delete own goal notes"
  on public.goal_notes for delete using (auth.uid() = user_id);

-- Auto-update updated_at on goal_notes
create trigger goal_notes_updated_at
  before update on public.goal_notes
  for each row execute function public.handle_updated_at();
