-- Weekly sermon playlist: curate sermons per week, mark one as weekly principle (shows on dashboard).
-- Requires sermons table to exist.

CREATE TABLE IF NOT EXISTS weekly_sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  sermon_id uuid NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  listened boolean DEFAULT false,
  listened_date date,
  notes text,
  is_weekly_principle boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start_date, sermon_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_sermons_user_week ON weekly_sermons(user_id, week_start_date);

ALTER TABLE weekly_sermons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own weekly sermons" ON weekly_sermons;
CREATE POLICY "Users manage own weekly sermons" ON weekly_sermons
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
