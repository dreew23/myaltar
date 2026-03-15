-- Add new columns to daily_devotions table for DOMINION tracking
ALTER TABLE daily_devotions 
ADD COLUMN IF NOT EXISTS declarations_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gratitude_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sermons_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS energy_score INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS gratitude_items TEXT[] DEFAULT '{}';

-- Add weekly_principle to profiles for sermon application tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weekly_principle TEXT;

-- Create unique constraint on daily_devotions for upsert
ALTER TABLE daily_devotions 
DROP CONSTRAINT IF EXISTS daily_devotions_user_date_unique;

ALTER TABLE daily_devotions 
ADD CONSTRAINT daily_devotions_user_date_unique UNIQUE (user_id, date);
