-- Weekly commitments: user-defined targets for the current week plus daily logs.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS weekly_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('worship_minutes','declaration_reps','scripture_minutes','prayer_minutes','custom')),
  title text NOT NULL,
  daily_target integer NOT NULL CHECK (daily_target > 0),
  unit text NOT NULL,
  declaration_id uuid,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_commitments_user_week
  ON weekly_commitments(user_id, week_start_date);

ALTER TABLE weekly_commitments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weekly_commitments_own ON weekly_commitments;
CREATE POLICY weekly_commitments_own ON weekly_commitments FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weekly_commitment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id uuid NOT NULL REFERENCES weekly_commitments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  actual integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (commitment_id, date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_commitment_logs_user_date
  ON weekly_commitment_logs(user_id, date);

ALTER TABLE weekly_commitment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weekly_commitment_logs_own ON weekly_commitment_logs;
CREATE POLICY weekly_commitment_logs_own ON weekly_commitment_logs FOR ALL USING (auth.uid() = user_id);

-- updated_at triggers reuse the set_updated_at() function defined in 20250315_prayer_tables.sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS weekly_commitments_updated ON weekly_commitments;
CREATE TRIGGER weekly_commitments_updated BEFORE UPDATE ON weekly_commitments
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS weekly_commitment_logs_updated ON weekly_commitment_logs;
CREATE TRIGGER weekly_commitment_logs_updated BEFORE UPDATE ON weekly_commitment_logs
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
