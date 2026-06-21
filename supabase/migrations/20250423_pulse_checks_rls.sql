-- Ensure pulse_checks exists and RLS allows insert/update (Sunday Pulse Phase 3).

CREATE TABLE IF NOT EXISTS pulse_checks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number         smallint NOT NULL,
  date                date NOT NULL,
  quarter_code        text NOT NULL,
  g1_prayer           text CHECK (g1_prayer IN ('yes', 'no', 'blocked')),
  g1_note             text,
  g2_sermons          text CHECK (g2_sermons IN ('yes', 'no', 'blocked')),
  g2_note             text,
  g3_dominion         smallint CHECK (g3_dominion IS NULL OR (g3_dominion >= 1 AND g3_dominion <= 10)),
  g3_note             text,
  g4_warfare          text CHECK (g4_warfare IN ('yes', 'no', 'blocked')),
  g4_note             text,
  g5_decisions        text CHECK (g5_decisions IN ('yes', 'no', 'blocked')),
  g5_note             text,
  g6_community        text CHECK (g6_community IN ('yes', 'no', 'blocked')),
  g6_note             text,
  g7_content          text CHECK (g7_content IN ('yes', 'no', 'blocked')),
  g7_note             text,
  overall_reflection  text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quarter_code, week_number)
);

CREATE INDEX IF NOT EXISTS idx_pulse_checks_user ON pulse_checks(user_id, date DESC);

ALTER TABLE pulse_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pulse checks" ON pulse_checks;
DROP POLICY IF EXISTS "Users can insert own pulse checks" ON pulse_checks;
DROP POLICY IF EXISTS "Users can update own pulse checks" ON pulse_checks;
DROP POLICY IF EXISTS "Users can delete own pulse checks" ON pulse_checks;
DROP POLICY IF EXISTS pulse_checks_own ON pulse_checks;

CREATE POLICY pulse_checks_own ON pulse_checks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
