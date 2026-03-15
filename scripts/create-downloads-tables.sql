-- Divine Downloads & Spiritual Insights tables
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════
-- 1. divine_downloads — quick-capture spiritual insights
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS divine_downloads (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content       text NOT NULL,
  category      text NOT NULL CHECK (category IN ('action_required','revelation','promise','warning','direction')),
  source        text NOT NULL CHECK (source IN ('prayer','sermon','life_event','scripture','other')),
  life_areas    text[] DEFAULT '{}',
  action_taken  boolean DEFAULT false,
  action_note   text,
  became_testimony boolean DEFAULT false,
  testimony_note text,
  shareable     boolean DEFAULT false,
  linked_sermon_id uuid REFERENCES sermons(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE divine_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own downloads"
  ON divine_downloads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_downloads_user ON divine_downloads(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════
-- 2. spiritual_insights — longer contemplative entries
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spiritual_insights (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content       text NOT NULL,
  source        text CHECK (source IN ('prayer','sermon','life_event','scripture','other')),
  shareable     boolean DEFAULT false,
  format_tag    text,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE spiritual_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own insights"
  ON spiritual_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_insights_user ON spiritual_insights(user_id, created_at DESC);
