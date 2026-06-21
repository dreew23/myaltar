-- User-configurable prayer watches and per-slot daily completion tracking.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS prayer_schedule jsonb;

COMMENT ON COLUMN profiles.prayer_schedule IS
  'PrayerScheduleConfig: { slots: [{ id, kind, watchNumber?, label?, startTime, endTime, enabled }], primarySlotId }';

ALTER TABLE daily_devotions
  ADD COLUMN IF NOT EXISTS prayer_slots_completed jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN daily_devotions.prayer_slots_completed IS
  'Map of slot id -> boolean for each prayer watch/time completed that day';
