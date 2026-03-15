-- Sunday Pulse sessions + daily focus for planning
-- Run in Supabase SQL Editor

-- daily_focus: top 3 focus items per day (used in Phase 5 + Monday emphasis)
CREATE TABLE IF NOT EXISTS daily_focus (
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

ALTER TABLE daily_focus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily_focus" ON daily_focus FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_daily_focus_user_date ON daily_focus(user_id, date);

-- pulse_sessions: full Sunday 2-5pm planning session
CREATE TABLE IF NOT EXISTS pulse_sessions (
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
  phase3_pulse_check_id      uuid REFERENCES pulse_checks(id),
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

ALTER TABLE pulse_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pulse_sessions" ON pulse_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_sessions_user_date ON pulse_sessions(user_id, date DESC);

-- updated_at trigger for pulse_sessions and daily_focus
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pulse_sessions_updated ON pulse_sessions;
CREATE TRIGGER pulse_sessions_updated BEFORE UPDATE ON pulse_sessions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS daily_focus_updated ON daily_focus;
CREATE TRIGGER daily_focus_updated BEFORE UPDATE ON daily_focus FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
