-- Personal DOMINION year (Oct–Oct style segments) — display layer; calendar dates unchanged in app data.

CREATE TABLE IF NOT EXISTS personal_year_config (
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

CREATE INDEX IF NOT EXISTS idx_personal_year_config_user ON personal_year_config(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_year_config_user_active ON personal_year_config(user_id, is_active);

ALTER TABLE personal_year_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own personal years"
  ON personal_year_config
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reuses set_updated_at() from earlier migrations when present
DROP TRIGGER IF EXISTS personal_year_config_updated ON personal_year_config;
CREATE TRIGGER personal_year_config_updated
  BEFORE UPDATE ON personal_year_config
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
