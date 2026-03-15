-- Weekly goals: 3 focus goals per week (set in Sunday Pulse Phase 5 or on dashboard)
-- week_start_date = Sunday of that week

CREATE TABLE IF NOT EXISTS weekly_goals (
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

ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own weekly_goals" ON weekly_goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON weekly_goals(user_id, week_start_date DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS weekly_goals_updated ON weekly_goals;
CREATE TRIGGER weekly_goals_updated BEFORE UPDATE ON weekly_goals FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
