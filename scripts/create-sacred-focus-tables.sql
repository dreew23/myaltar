-- Sacred Focus: Spiritual Activities Tracker
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════
-- 1. spiritual_activities — core activity/season
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spiritual_activities (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title               text NOT NULL,
  type                text NOT NULL CHECK (type IN ('fellowship','conference','challenge','study','retreat','other')),
  organizer           text,
  description         text,
  start_date          date,
  end_date            date,
  is_recurring        boolean DEFAULT false,
  recurrence_pattern  text,
  status              text DEFAULT 'active' CHECK (status IN ('active','upcoming','completed','paused')),
  tags                text[] DEFAULT '{}',
  books_resources     text[] DEFAULT '{}',
  overall_reflection  text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE spiritual_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own spiritual activities"
  ON spiritual_activities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_spiritual_activities_user_status
  ON spiritual_activities(user_id, status);

-- ═══════════════════════════════════════════════════════
-- 2. activity_journal_entries — fast-capture journal
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activity_journal_entries (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id         uuid REFERENCES spiritual_activities(id) ON DELETE CASCADE NOT NULL,
  entry_type          text NOT NULL CHECK (entry_type IN (
    'revelation','assignment','prophecy','instruction',
    'lesson','key_quote','rhema','prayer_point','testimony','note'
  )),
  content             text NOT NULL,
  scripture_reference text,
  speaker             text,
  is_highlight        boolean DEFAULT false,
  date                date DEFAULT CURRENT_DATE,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE activity_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journal entries"
  ON activity_journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_journal_entries_activity_date
  ON activity_journal_entries(activity_id, date DESC);

CREATE INDEX idx_journal_entries_user
  ON activity_journal_entries(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════
-- 3. activity_sub_challenges — daily trackers
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activity_sub_challenges (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id         uuid REFERENCES spiritual_activities(id) ON DELETE CASCADE NOT NULL,
  title               text NOT NULL,
  description         text,
  target_type         text NOT NULL CHECK (target_type IN ('daily_count','daily_boolean','daily_duration')),
  target_value        integer NOT NULL DEFAULT 1,
  target_unit         text,
  start_date          date,
  end_date            date,
  active              boolean DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE activity_sub_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sub challenges"
  ON activity_sub_challenges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sub_challenges_activity
  ON activity_sub_challenges(activity_id, active);

-- ═══════════════════════════════════════════════════════
-- 4. sub_challenge_logs — daily records
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sub_challenge_logs (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sub_challenge_id    uuid REFERENCES activity_sub_challenges(id) ON DELETE CASCADE NOT NULL,
  date                date DEFAULT CURRENT_DATE,
  value               integer DEFAULT 0,
  completed           boolean DEFAULT false,
  note                text,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(user_id, sub_challenge_id, date)
);

ALTER TABLE sub_challenge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sub challenge logs"
  ON sub_challenge_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sub_challenge_logs_lookup
  ON sub_challenge_logs(sub_challenge_id, date DESC);

-- ═══════════════════════════════════════════════════════
-- 5. activity_fruits — tangible outcomes / gains
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS activity_fruits (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id         uuid REFERENCES spiritual_activities(id) ON DELETE CASCADE NOT NULL,
  category            text NOT NULL CHECK (category IN (
    'spiritual_growth','revelation','habit_formed','relationship',
    'healing','breakthrough','resource','other'
  )),
  description         text NOT NULL,
  evidence            text,
  date_recorded       date DEFAULT CURRENT_DATE,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE activity_fruits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activity fruits"
  ON activity_fruits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_fruits_activity
  ON activity_fruits(activity_id, date_recorded DESC);

-- ═══════════════════════════════════════════════════════
-- Force schema cache reload
-- ═══════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
