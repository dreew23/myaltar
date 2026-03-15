-- Prayer: sessions, saved prayers, warfare scriptures, prayer requests.
-- Run in Supabase SQL Editor. connected_activity_id has no FK if spiritual_activities doesn't exist.

-- One row per prayer session
CREATE TABLE IF NOT EXISTS prayer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date DEFAULT current_date,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  session_type text DEFAULT 'morning' CHECK (session_type IN ('morning','evening','midnight','spontaneous')),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  presence_level integer CHECK (presence_level >= 1 AND presence_level <= 10),
  focus_areas_covered text[] DEFAULT '{}',
  intercession_theme_completed boolean DEFAULT false,
  declarations_completed boolean DEFAULT false,
  tongues_minutes integer DEFAULT 0,
  worship_included boolean DEFAULT false,
  warfare_engaged boolean DEFAULT false,
  journal_entry text,
  breakthroughs text,
  what_god_said text,
  prayer_requests_prayed text[] DEFAULT '{}',
  scripture_used text[] DEFAULT '{}',
  mood_before text CHECK (mood_before IN ('heavy','anxious','neutral','expectant','joyful','desperate','grateful')),
  mood_after text CHECK (mood_after IN ('heavy','anxious','neutral','peaceful','joyful','empowered','grateful','convicted')),
  notes text,
  connected_activity_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date, session_type)
);

CREATE INDEX IF NOT EXISTS idx_prayer_sessions_user_date ON prayer_sessions(user_id, date);
ALTER TABLE prayer_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_sessions_own ON prayer_sessions;
CREATE POLICY prayer_sessions_own ON prayer_sessions FOR ALL USING (auth.uid() = user_id);

-- Personal prayer collection
CREATE TABLE IF NOT EXISTS saved_prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('repentance','intercession','warfare','blessing','thanksgiving','petition','consecration','declaration','healing','deliverance','personal','other')),
  scripture_references text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  source text,
  is_favorite boolean DEFAULT false,
  use_count integer DEFAULT 0,
  last_used_date date,
  display_order integer,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_prayers_user ON saved_prayers(user_id);
ALTER TABLE saved_prayers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS saved_prayers_own ON saved_prayers;
CREATE POLICY saved_prayers_own ON saved_prayers FOR ALL USING (auth.uid() = user_id);

-- Warfare scriptures by battle category (G4)
CREATE TABLE IF NOT EXISTS warfare_scriptures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  battle_category text NOT NULL CHECK (battle_category IN ('career_politics','health_crises','financial_pressure','relational_challenges','purpose_confusion','general_warfare')),
  scripture_reference text NOT NULL,
  scripture_text text NOT NULL,
  how_to_pray_it text,
  personal_note text,
  is_tested boolean DEFAULT false,
  test_outcome text,
  display_order integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warfare_scriptures_user ON warfare_scriptures(user_id);
ALTER TABLE warfare_scriptures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS warfare_scriptures_own ON warfare_scriptures;
CREATE POLICY warfare_scriptures_own ON warfare_scriptures FOR ALL USING (auth.uid() = user_id);

-- Prayer requests tracker
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request text NOT NULL,
  category text CHECK (category IN ('personal','family','career','health','relationships','ministry','financial','nation','other')),
  scripture_anchor text,
  status text DEFAULT 'active' CHECK (status IN ('active','answered','redirected','released')),
  date_started date DEFAULT current_date,
  date_answered date,
  answer_note text,
  priority text DEFAULT 'normal' CHECK (priority IN ('urgent','high','normal','ongoing')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_status ON prayer_requests(user_id, status);
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_requests_own ON prayer_requests;
CREATE POLICY prayer_requests_own ON prayer_requests FOR ALL USING (auth.uid() = user_id);

-- updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prayer_sessions_updated ON prayer_sessions;
CREATE TRIGGER prayer_sessions_updated BEFORE UPDATE ON prayer_sessions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS saved_prayers_updated ON saved_prayers;
CREATE TRIGGER saved_prayers_updated BEFORE UPDATE ON saved_prayers FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS prayer_requests_updated ON prayer_requests;
CREATE TRIGGER prayer_requests_updated BEFORE UPDATE ON prayer_requests FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
