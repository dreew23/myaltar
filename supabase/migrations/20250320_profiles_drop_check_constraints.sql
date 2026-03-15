-- Drop check constraints on profiles that restrict spiritual_season (and sacred_rhythm if present).
-- Settings uses values like business, ministry, family, creative, balanced for Primary Focus
-- and 5am, 6am, morning, flexible for DOMINION Rhythm; the DB may have been created with
-- different allowed values, causing "violates check constraint" on save.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_spiritual_season_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_sacred_rhythm_check;
