-- User-editable 7-day intercession schedule (replaces static dominion.ts for reads when populated)
CREATE TABLE IF NOT EXISTS intercession_schedule (
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

CREATE INDEX IF NOT EXISTS idx_intercession_schedule_user ON intercession_schedule(user_id);
ALTER TABLE intercession_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own schedule" ON intercession_schedule;
CREATE POLICY "Users manage own schedule" ON intercession_schedule
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS intercession_schedule_updated ON intercession_schedule;
CREATE TRIGGER intercession_schedule_updated BEFORE UPDATE ON intercession_schedule
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
