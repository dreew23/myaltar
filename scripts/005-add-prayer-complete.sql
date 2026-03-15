-- Add prayer_complete column to daily_devotions
ALTER TABLE daily_devotions ADD COLUMN IF NOT EXISTS prayer_complete boolean DEFAULT false;
