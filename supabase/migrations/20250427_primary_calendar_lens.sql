-- Display-only preference: which calendar lens is shown as primary across the app.
-- 'personal' = Personal Year (DOMINION) leads; 'system' = System Calendar quarter leads.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS primary_calendar_lens text NOT NULL DEFAULT 'personal';
