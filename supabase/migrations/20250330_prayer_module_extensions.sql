-- Prayer module design: session wrap-up fields, intercession notes, challenges, pray tracking.

ALTER TABLE prayer_sessions
  ADD COLUMN IF NOT EXISTS atmosphere text,
  ADD COLUMN IF NOT EXISTS warfare_intensity integer CHECK (warfare_intensity IS NULL OR (warfare_intensity >= 1 AND warfare_intensity <= 5));

ALTER TABLE intercession_schedule
  ADD COLUMN IF NOT EXISTS focus_notes text;

ALTER TABLE prayer_requests
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS answer_type text,
  ADD COLUMN IF NOT EXISTS is_testimony boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS prayed_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_prayed_at date;

CREATE TABLE IF NOT EXISTS prayer_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  daily_target numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'times',
  weekly_progress numeric NOT NULL DEFAULT 0,
  week_start_monday date,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prayer_challenges_user ON prayer_challenges(user_id);
ALTER TABLE prayer_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_challenges_own ON prayer_challenges;
CREATE POLICY prayer_challenges_own ON prayer_challenges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS prayer_challenges_updated ON prayer_challenges;
CREATE TRIGGER prayer_challenges_updated BEFORE UPDATE ON prayer_challenges FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS prayer_request_pray_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  prayed_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, prayed_date)
);

CREATE INDEX IF NOT EXISTS idx_pray_events_user ON prayer_request_pray_events(user_id, prayed_date DESC);
CREATE INDEX IF NOT EXISTS idx_pray_events_request ON prayer_request_pray_events(request_id);
ALTER TABLE prayer_request_pray_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prayer_request_pray_events_own ON prayer_request_pray_events;
CREATE POLICY prayer_request_pray_events_own ON prayer_request_pray_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
