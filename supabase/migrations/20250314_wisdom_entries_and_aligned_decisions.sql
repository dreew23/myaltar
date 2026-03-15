-- Wisdom Log: wisdom_entries (processed understanding, not raw capture)
-- Run this in Supabase SQL Editor. If spiritual_activities table doesn't exist, remove the FK or create that table first.

CREATE TABLE IF NOT EXISTS wisdom_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN (
    'revelation', 'prophetic_word', 'testimony', 'holy_spirit_conviction', 'gratitude',
    'applied_principle', 'aligned_decision', 'pattern_recognition', 'spiritual_professional'
  )),
  title text NOT NULL,
  content text NOT NULL,
  scripture_reference text,
  scripture_text text,
  sources text,
  life_areas text[] DEFAULT '{}',
  connected_goal_code text,
  connected_activity_id uuid,
  shareable boolean DEFAULT false,
  is_highlight boolean DEFAULT false,
  date date DEFAULT current_date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optional: if you have spiritual_activities table, add FK:
-- ALTER TABLE wisdom_entries ADD CONSTRAINT fk_activity
--   FOREIGN KEY (connected_activity_id) REFERENCES spiritual_activities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_wisdom_entries_user_type ON wisdom_entries(user_id, entry_type);
CREATE INDEX IF NOT EXISTS idx_wisdom_entries_user_date ON wisdom_entries(user_id, date);

ALTER TABLE wisdom_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wisdom_entries_own ON wisdom_entries;
CREATE POLICY wisdom_entries_own ON wisdom_entries
  FOR ALL USING (auth.uid() = user_id);

-- Aligned Decisions (5-step decision card)
CREATE TABLE IF NOT EXISTS aligned_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wisdom_entry_id uuid REFERENCES wisdom_entries(id) ON DELETE SET NULL,
  date date DEFAULT current_date,
  description text NOT NULL,
  context text,
  category text CHECK (category IN (
    'career', 'health', 'financial', 'relational', 'spiritual',
    'tpm_academy', 'swiftlink', 'krystal', 'other'
  )),
  step1_prayed boolean DEFAULT false,
  step1_note text,
  step2_scripture text,
  step2_note text,
  step3_counsel boolean DEFAULT false,
  step3_who text,
  step3_note text,
  step4_peace boolean DEFAULT false,
  step4_note text,
  step5_dominion text,
  aligned boolean,
  outcome text,
  outcome_date date,
  outcome_rating integer CHECK (outcome_rating >= 1 AND outcome_rating <= 5),
  lesson_learned text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aligned_decisions_user_date ON aligned_decisions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_aligned_decisions_user_category ON aligned_decisions(user_id, category);

ALTER TABLE aligned_decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aligned_decisions_own ON aligned_decisions;
CREATE POLICY aligned_decisions_own ON aligned_decisions
  FOR ALL USING (auth.uid() = user_id);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wisdom_entries_updated ON wisdom_entries;
CREATE TRIGGER wisdom_entries_updated
  BEFORE UPDATE ON wisdom_entries FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS aligned_decisions_updated ON aligned_decisions;
CREATE TRIGGER aligned_decisions_updated
  BEFORE UPDATE ON aligned_decisions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
