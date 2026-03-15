-- Intercession Journal: prayers table (used by /app/prayers)
CREATE TABLE IF NOT EXISTS prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  prayer_type text NOT NULL DEFAULT 'intercession',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','answered')),
  answer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayers_user ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created ON prayers(user_id, created_at DESC);

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prayers_own ON prayers;
CREATE POLICY prayers_own ON prayers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
