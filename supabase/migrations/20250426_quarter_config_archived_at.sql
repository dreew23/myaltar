-- Track when a quarter was archived (deactivated)
ALTER TABLE quarter_config
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;
