-- User-editable 7 DOMINION goals (replaces static GOALS in dominion.ts when populated)
CREATE TABLE IF NOT EXISTS goals (
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

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own goals" ON goals;
CREATE POLICY "Users manage own goals" ON goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS goals_updated ON goals;
CREATE TRIGGER goals_updated BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
