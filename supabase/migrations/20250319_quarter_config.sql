-- Quarter configuration for 13-week year cycles
CREATE TABLE IF NOT EXISTS quarter_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  year_number integer,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quarter_config_user_active ON quarter_config(user_id, is_active);
ALTER TABLE quarter_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own quarters" ON quarter_config;
CREATE POLICY "Users manage own quarters" ON quarter_config
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
