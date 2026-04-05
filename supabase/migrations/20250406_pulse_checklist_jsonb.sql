-- Persist Phase 1 setup + Phase 6 close checklists (survives refresh / other devices)
ALTER TABLE pulse_sessions
  ADD COLUMN IF NOT EXISTS phase1_checklist jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS phase6_close_checklist jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN pulse_sessions.phase1_checklist IS 'Keyed string indices "0".."n" -> boolean tick state for setup checklist';
COMMENT ON COLUMN pulse_sessions.phase6_close_checklist IS 'Keyed string indices -> boolean for close checklist';
