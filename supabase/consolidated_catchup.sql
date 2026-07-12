-- =====================================================================
-- CONSOLIDATED CATCH-UP MIGRATION
-- ---------------------------------------------------------------------
-- Brings a Supabase database up to date with every migration in
-- supabase/migrations/ as of 2025-04-27.
--
-- Safe to run multiple times: every statement uses IF NOT EXISTS,
-- CREATE OR REPLACE, or DROP ... IF EXISTS before CREATE.
--
-- Tables that are created OUTSIDE the migration set (sermons,
-- daily_devotions) are referenced behind to_regclass() guards so this
-- script never fails if they are absent.
--
-- HOW TO RUN: paste the whole file into Supabase Dashboard -> SQL Editor
-- and click "Run". Then wait ~15s and hard-refresh the app.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Shared updated_at helper
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 1. profiles (+ all added columns)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  sacred_rhythm text,
  spiritual_season text,
  weekly_principle text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sacred_rhythm text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spiritual_season text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_principle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Drop legacy check constraints that block Settings saves
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_spiritual_season_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sacred_rhythm_check;

-- Notification preferences (PWA)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb
  DEFAULT '{
    "prayer_reminder": {"enabled": false, "time": "02:50"},
    "declaration_reminder": {"enabled": false, "time": "05:30"},
    "sunday_pulse_reminder": {"enabled": false, "time": "14:00"},
    "sub_challenge_reminder": {"enabled": false, "time": "20:00"},
    "gratitude_reminder": {"enabled": false, "time": "21:00"}
  }'::jsonb;

-- Prayer schedule (configurable watches)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prayer_schedule jsonb;

-- Dual calendar lens preference
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_calendar_lens text NOT NULL DEFAULT 'personal';

-- ---------------------------------------------------------------------
-- 2. wisdom_entries + aligned_decisions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wisdom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN (
    'revelation', 'prophetic_word', 'testimony', 'holy_spirit_conviction', 'gratitude',
    'applied_principle', 'aligned_decision', 'pattern_recognition', 'spiritual_professional'
  )),
  title text NOT NULL,
  content text NOT NULL,
  scripture_reference text,
  scripture_text text,
  sources text,
  life_areas text[] DEFAULT '{}',
  connected_goal_code text,
  connected_activity_id uuid,
  shareable boolean DEFAULT false,
  is_highlight boolean DEFAULT false,
  date date DEFAULT current_date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wisdom_entries_user_type ON public.wisdom_entries(user_id, entry_type);
CREATE INDEX IF NOT EXISTS idx_wisdom_entries_user_date ON public.wisdom_entries(user_id, date);
ALTER TABLE public.wisdom_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wisdom_entries_own ON public.wisdom_entries;
CREATE POLICY wisdom_entries_own ON public.wisdom_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.aligned_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wisdom_entry_id uuid REFERENCES public.wisdom_entries(id) ON DELETE SET NULL,
  date date DEFAULT current_date,
  description text NOT NULL,
  context text,
  category text CHECK (category IN (
    'career', 'health', 'financial', 'relational', 'spiritual',
    'tpm_academy', 'swiftlink', 'krystal', 'other'
  )),
  step1_prayed boolean DEFAULT false,
  step1_note text,
  step2_scripture text,
  step2_note text,
  step3_counsel boolean DEFAULT false,
  step3_who text,
  step3_note text,
  step4_peace boolean DEFAULT false,
  step4_note text,
  step5_dominion text,
  aligned boolean,
  outcome text,
  outcome_date date,
  outcome_rating integer CHECK (outcome_rating >= 1 AND outcome_rating <= 5),
  lesson_learned text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aligned_decisions_user_date ON public.aligned_decisions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_aligned_decisions_user_category ON public.aligned_decisions(user_id, category);
ALTER TABLE public.aligned_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS aligned_decisions_own ON public.aligned_decisions;
CREATE POLICY aligned_decisions_own ON public.aligned_decisions FOR ALL USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS wisdom_entries_updated ON public.wisdom_entries;
CREATE TRIGGER wisdom_entries_updated BEFORE UPDATE ON public.wisdom_entries
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS aligned_decisions_updated ON public.aligned_decisions;
CREATE TRIGGER aligned_decisions_updated BEFORE UPDATE ON public.aligned_decisions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. prayer_sessions, saved_prayers, warfare_scriptures, prayer_requests
--    (+ later extensions) + prayer_challenges + pray_events
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prayer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date DEFAULT current_date,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  session_type text DEFAULT 'morning' CHECK (session_type IN ('morning','evening','midnight','spontaneous')),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  presence_level integer CHECK (presence_level >= 1 AND presence_level <= 10),
  focus_areas_covered text[] DEFAULT '{}',
  intercession_theme_completed boolean DEFAULT false,
  declarations_completed boolean DEFAULT false,
  tongues_minutes integer DEFAULT 0,
  worship_included boolean DEFAULT false,
  warfare_engaged boolean DEFAULT false,
  journal_entry text,
  breakthroughs text,
  what_god_said text,
  prayer_requests_prayed text[] DEFAULT '{}',
  scripture_used text[] DEFAULT '{}',
  mood_before text CHECK (mood_before IN ('heavy','anxious','neutral','expectant','joyful','desperate','grateful')),
  mood_after text CHECK (mood_after IN ('heavy','anxious','neutral','peaceful','joyful','empowered','grateful','convicted')),
  notes text,
  connected_activity_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prayer_sessions_user_date ON public.prayer_sessions(user_id, date);
ALTER TABLE public.prayer_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_sessions_own ON public.prayer_sessions;
CREATE POLICY prayer_sessions_own ON public.prayer_sessions FOR ALL USING (auth.uid() = user_id);
-- Allow multiple sessions per day
ALTER TABLE public.prayer_sessions
  DROP CONSTRAINT IF EXISTS prayer_sessions_user_id_date_session_type_key;
-- Prayer module extensions
ALTER TABLE public.prayer_sessions
  ADD COLUMN IF NOT EXISTS atmosphere text,
  ADD COLUMN IF NOT EXISTS warfare_intensity integer CHECK (warfare_intensity IS NULL OR (warfare_intensity >= 1 AND warfare_intensity <= 5));

CREATE TABLE IF NOT EXISTS public.saved_prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('repentance','intercession','warfare','blessing','thanksgiving','petition','consecration','declaration','healing','deliverance','personal','other')),
  scripture_references text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  source text,
  is_favorite boolean DEFAULT false,
  use_count integer DEFAULT 0,
  last_used_date date,
  display_order integer,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_prayers_user ON public.saved_prayers(user_id);
ALTER TABLE public.saved_prayers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS saved_prayers_own ON public.saved_prayers;
CREATE POLICY saved_prayers_own ON public.saved_prayers FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.warfare_scriptures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  battle_category text NOT NULL CHECK (battle_category IN ('career_politics','health_crises','financial_pressure','relational_challenges','purpose_confusion','general_warfare')),
  scripture_reference text NOT NULL,
  scripture_text text NOT NULL,
  how_to_pray_it text,
  personal_note text,
  is_tested boolean DEFAULT false,
  test_outcome text,
  display_order integer,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_warfare_scriptures_user ON public.warfare_scriptures(user_id);
ALTER TABLE public.warfare_scriptures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS warfare_scriptures_own ON public.warfare_scriptures;
CREATE POLICY warfare_scriptures_own ON public.warfare_scriptures FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request text NOT NULL,
  category text CHECK (category IN ('personal','family','career','health','relationships','ministry','financial','nation','other')),
  scripture_anchor text,
  status text DEFAULT 'active' CHECK (status IN ('active','answered','redirected','released')),
  date_started date DEFAULT current_date,
  date_answered date,
  answer_note text,
  priority text DEFAULT 'normal' CHECK (priority IN ('urgent','high','normal','ongoing')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_status ON public.prayer_requests(user_id, status);
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_requests_own ON public.prayer_requests;
CREATE POLICY prayer_requests_own ON public.prayer_requests FOR ALL USING (auth.uid() = user_id);
-- Prayer request extensions
ALTER TABLE public.prayer_requests
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS answer_type text,
  ADD COLUMN IF NOT EXISTS is_testimony boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS prayed_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_prayed_at date;

CREATE TABLE IF NOT EXISTS public.prayer_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  daily_target numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'times',
  weekly_progress numeric NOT NULL DEFAULT 0,
  week_start_monday date,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prayer_challenges_user ON public.prayer_challenges(user_id);
ALTER TABLE public.prayer_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_challenges_own ON public.prayer_challenges;
CREATE POLICY prayer_challenges_own ON public.prayer_challenges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.prayer_request_pray_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  prayed_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, prayed_date)
);
CREATE INDEX IF NOT EXISTS idx_pray_events_user ON public.prayer_request_pray_events(user_id, prayed_date DESC);
CREATE INDEX IF NOT EXISTS idx_pray_events_request ON public.prayer_request_pray_events(request_id);
ALTER TABLE public.prayer_request_pray_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_request_pray_events_own ON public.prayer_request_pray_events;
CREATE POLICY prayer_request_pray_events_own ON public.prayer_request_pray_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS prayer_sessions_updated ON public.prayer_sessions;
CREATE TRIGGER prayer_sessions_updated BEFORE UPDATE ON public.prayer_sessions FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS saved_prayers_updated ON public.saved_prayers;
CREATE TRIGGER saved_prayers_updated BEFORE UPDATE ON public.saved_prayers FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS prayer_requests_updated ON public.prayer_requests;
CREATE TRIGGER prayer_requests_updated BEFORE UPDATE ON public.prayer_requests FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS prayer_challenges_updated ON public.prayer_challenges;
CREATE TRIGGER prayer_challenges_updated BEFORE UPDATE ON public.prayer_challenges FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. prayers (Intercession Journal)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  prayer_type text NOT NULL DEFAULT 'intercession',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','answered')),
  answer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prayers_user ON public.prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created ON public.prayers(user_id, created_at DESC);
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayers_own ON public.prayers;
CREATE POLICY prayers_own ON public.prayers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. pulse_checks  (created BEFORE pulse_sessions for the FK) + notes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pulse_checks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number         smallint NOT NULL,
  date                date NOT NULL,
  quarter_code        text NOT NULL,
  g1_prayer           text CHECK (g1_prayer IN ('yes', 'no', 'blocked')),
  g1_note             text,
  g2_sermons          text CHECK (g2_sermons IN ('yes', 'no', 'blocked')),
  g2_note             text,
  g3_dominion         smallint CHECK (g3_dominion IS NULL OR (g3_dominion >= 1 AND g3_dominion <= 10)),
  g3_note             text,
  g4_warfare          text CHECK (g4_warfare IN ('yes', 'no', 'blocked')),
  g4_note             text,
  g5_decisions        text CHECK (g5_decisions IN ('yes', 'no', 'blocked')),
  g5_note             text,
  g6_community        text CHECK (g6_community IN ('yes', 'no', 'blocked')),
  g6_note             text,
  g7_content          text CHECK (g7_content IN ('yes', 'no', 'blocked')),
  g7_note             text,
  overall_reflection  text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quarter_code, week_number)
);
CREATE INDEX IF NOT EXISTS idx_pulse_checks_user ON public.pulse_checks(user_id, date DESC);
ALTER TABLE public.pulse_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own pulse checks" ON public.pulse_checks;
DROP POLICY IF EXISTS "Users can insert own pulse checks" ON public.pulse_checks;
DROP POLICY IF EXISTS "Users can update own pulse checks" ON public.pulse_checks;
DROP POLICY IF EXISTS "Users can delete own pulse checks" ON public.pulse_checks;
DROP POLICY IF EXISTS pulse_checks_own ON public.pulse_checks;
CREATE POLICY pulse_checks_own ON public.pulse_checks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Note columns for older tables
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g1_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g2_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g3_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g4_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g5_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g6_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS g7_note text;
ALTER TABLE public.pulse_checks ADD COLUMN IF NOT EXISTS overall_reflection text;

-- ---------------------------------------------------------------------
-- 6. pulse_sessions (+ checklist jsonb columns)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pulse_sessions (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                       date NOT NULL DEFAULT CURRENT_DATE,
  quarter_code               text,
  week_number                integer,
  started_at                 timestamptz,
  completed_at               timestamptz,
  phases_completed           text[] DEFAULT '{}',
  total_duration_minutes     integer,
  phase1_completed           boolean DEFAULT false,
  phase2_backfill_count      integer DEFAULT 0,
  phase3_pulse_check_id      uuid REFERENCES public.pulse_checks(id),
  phase4_time_analysis       text,
  phase4_constraint_changes  text,
  phase4_declaration_reviewed text,
  phase5_weekly_plan_notes   text,
  phase5_next_week_focus    text[] DEFAULT '{}',
  phase6_monday_top3        text[] DEFAULT '{}',
  overall_session_notes      text,
  session_quality            integer CHECK (session_quality IS NULL OR (session_quality >= 1 AND session_quality <= 5)),
  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.pulse_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own pulse_sessions" ON public.pulse_sessions;
CREATE POLICY "Users manage own pulse_sessions" ON public.pulse_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_sessions_user_date ON public.pulse_sessions(user_id, date DESC);
ALTER TABLE public.pulse_sessions
  ADD COLUMN IF NOT EXISTS phase1_checklist jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS phase6_close_checklist jsonb DEFAULT '{}'::jsonb;
DROP TRIGGER IF EXISTS pulse_sessions_updated ON public.pulse_sessions;
CREATE TRIGGER pulse_sessions_updated BEFORE UPDATE ON public.pulse_sessions FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 7. daily_focus (+ completed columns)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_focus (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date              date NOT NULL DEFAULT CURRENT_DATE,
  focus_1           text,
  focus_2           text,
  focus_3           text,
  goal_1            text,
  goal_2            text,
  goal_3            text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.daily_focus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own daily_focus" ON public.daily_focus;
CREATE POLICY "Users manage own daily_focus" ON public.daily_focus
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_daily_focus_user_date ON public.daily_focus(user_id, date);
ALTER TABLE public.daily_focus
  ADD COLUMN IF NOT EXISTS focus_1_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS focus_2_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS focus_3_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal_1_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal_2_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal_3_completed boolean NOT NULL DEFAULT false;
DROP TRIGGER IF EXISTS daily_focus_updated ON public.daily_focus;
CREATE TRIGGER daily_focus_updated BEFORE UPDATE ON public.daily_focus FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 8. weekly_goals
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  goal_1_text text,
  goal_1_code text,
  goal_1_completed boolean DEFAULT false,
  goal_2_text text,
  goal_2_code text,
  goal_2_completed boolean DEFAULT false,
  goal_3_text text,
  goal_3_code text,
  goal_3_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own weekly_goals" ON public.weekly_goals;
CREATE POLICY "Users manage own weekly_goals" ON public.weekly_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON public.weekly_goals(user_id, week_start_date DESC);
DROP TRIGGER IF EXISTS weekly_goals_updated ON public.weekly_goals;
CREATE TRIGGER weekly_goals_updated BEFORE UPDATE ON public.weekly_goals FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 9. goals
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  pulse_question text,
  pulse_type text DEFAULT 'yesno' CHECK (pulse_type IN ('yesno', 'scale')),
  db_field text,
  kr_10x text,
  kr_5x text,
  kr_2x text,
  not_now text[] DEFAULT '{}',
  icon_name text,
  active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own goals" ON public.goals;
CREATE POLICY "Users manage own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS goals_updated ON public.goals;
CREATE TRIGGER goals_updated BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 10. intercession_schedule (+ focus_notes)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.intercession_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  theme text NOT NULL,
  people text[] DEFAULT '{}',
  life_areas text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);
CREATE INDEX IF NOT EXISTS idx_intercession_schedule_user ON public.intercession_schedule(user_id);
ALTER TABLE public.intercession_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own schedule" ON public.intercession_schedule;
CREATE POLICY "Users manage own schedule" ON public.intercession_schedule
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.intercession_schedule ADD COLUMN IF NOT EXISTS focus_notes text;
DROP TRIGGER IF EXISTS intercession_schedule_updated ON public.intercession_schedule;
CREATE TRIGGER intercession_schedule_updated BEFORE UPDATE ON public.intercession_schedule
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 11. quarter_config (+ archived_at)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quarter_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  year_number integer,
  is_active boolean DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quarter_config_user_active ON public.quarter_config(user_id, is_active);
ALTER TABLE public.quarter_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own quarters" ON public.quarter_config;
CREATE POLICY "Users manage own quarters" ON public.quarter_config
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.quarter_config ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- ---------------------------------------------------------------------
-- 12. personal_year_config
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_year_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year_code text NOT NULL,
  year_name text NOT NULL,
  year_number integer NOT NULL CHECK (year_number >= 1 AND year_number <= 99),
  year_theme text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, year_code)
);
CREATE INDEX IF NOT EXISTS idx_personal_year_config_user ON public.personal_year_config(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_year_config_user_active ON public.personal_year_config(user_id, is_active);
ALTER TABLE public.personal_year_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own personal years" ON public.personal_year_config;
CREATE POLICY "Users manage own personal years" ON public.personal_year_config
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS personal_year_config_updated ON public.personal_year_config;
CREATE TRIGGER personal_year_config_updated BEFORE UPDATE ON public.personal_year_config
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 13. weekly_commitments (+ expanded types + intercession day) + logs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  daily_target integer NOT NULL CHECK (daily_target > 0),
  unit text NOT NULL,
  declaration_id uuid,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_weekly_commitments_user_week
  ON public.weekly_commitments(user_id, week_start_date);
ALTER TABLE public.weekly_commitments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weekly_commitments_own ON public.weekly_commitments;
CREATE POLICY weekly_commitments_own ON public.weekly_commitments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Intercession day picker column + expanded type enum
ALTER TABLE public.weekly_commitments
  ADD COLUMN IF NOT EXISTS intercession_day_of_week smallint
  CHECK (intercession_day_of_week IS NULL OR (intercession_day_of_week >= 0 AND intercession_day_of_week <= 6));
ALTER TABLE public.weekly_commitments DROP CONSTRAINT IF EXISTS weekly_commitments_type_check;
ALTER TABLE public.weekly_commitments
  ADD CONSTRAINT weekly_commitments_type_check CHECK (
    type IN (
      'worship_minutes','worship_hours','declaration_reps','scripture_minutes',
      'prayer_minutes','bible_reading','evening_reflection','church_attendance',
      'small_group','fasting','spiritual_journaling','sermon_review',
      'intercession','devotional_reading','listening_prayer','custom'
    )
  );

CREATE TABLE IF NOT EXISTS public.weekly_commitment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id uuid NOT NULL REFERENCES public.weekly_commitments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  actual integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (commitment_id, date)
);
CREATE INDEX IF NOT EXISTS idx_weekly_commitment_logs_user_date
  ON public.weekly_commitment_logs(user_id, date);
ALTER TABLE public.weekly_commitment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weekly_commitment_logs_own ON public.weekly_commitment_logs;
CREATE POLICY weekly_commitment_logs_own ON public.weekly_commitment_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS weekly_commitments_updated ON public.weekly_commitments;
CREATE TRIGGER weekly_commitments_updated BEFORE UPDATE ON public.weekly_commitments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS weekly_commitment_logs_updated ON public.weekly_commitment_logs;
CREATE TRIGGER weekly_commitment_logs_updated BEFORE UPDATE ON public.weekly_commitment_logs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------
-- 14. weekly_sermons  (only if the `sermons` table exists)
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.sermons') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.weekly_sermons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      week_start_date date NOT NULL,
      sermon_id uuid NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
      display_order integer DEFAULT 0,
      listened boolean DEFAULT false,
      listened_date date,
      notes text,
      is_weekly_principle boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, week_start_date, sermon_id)
    );
    CREATE INDEX IF NOT EXISTS idx_weekly_sermons_user_week ON public.weekly_sermons(user_id, week_start_date);
    ALTER TABLE public.weekly_sermons ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users manage own weekly sermons" ON public.weekly_sermons;
    CREATE POLICY "Users manage own weekly sermons" ON public.weekly_sermons
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  ELSE
    RAISE NOTICE 'Skipped weekly_sermons: public.sermons table not found.';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 15. daily_devotions extra columns (only if the table exists)
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.daily_devotions') IS NOT NULL THEN
    ALTER TABLE public.daily_devotions
      ADD COLUMN IF NOT EXISTS prayer_slots_completed jsonb DEFAULT '{}'::jsonb;
  ELSE
    RAISE NOTICE 'Skipped daily_devotions.prayer_slots_completed: public.daily_devotions table not found.';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 16. Sermon journal fields (only if the `sermons` table exists)
--     8-section structured journal: Record / Burden / Teaching /
--     Revelation / Response / Formation Link / Retention Loop / Verdict.
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.sermons') IS NOT NULL THEN
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS platform text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS sermon_date date;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS series text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS scripture_anchors text[] DEFAULT '{}';
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS burden text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS core_points jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS key_scriptures jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS quotes jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS revelation text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS revelation_download_id uuid;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_conviction text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_declaration text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_prayer_point text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_action text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_action_deadline date;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_declaration_id uuid;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS response_action_routed boolean DEFAULT false;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS formation_link text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS teach_it_test boolean DEFAULT false;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS seven_day_review text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS spaced_summary text;
    ALTER TABLE public.sermons ADD COLUMN IF NOT EXISTS relisten_worthy boolean DEFAULT false;
    ALTER TABLE public.sermons
      ADD COLUMN IF NOT EXISTS entry_status text NOT NULL DEFAULT 'captured'
      CHECK (entry_status IN ('captured','processed','living'));
  ELSE
    RAISE NOTICE 'Skipped sermon journal fields: public.sermons table not found.';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 17. Refresh the PostgREST API schema cache
-- ---------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
