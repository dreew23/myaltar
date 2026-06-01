-- Expand weekly_commitments type enum and add intercession day picker column.

ALTER TABLE weekly_commitments
  ADD COLUMN IF NOT EXISTS intercession_day_of_week smallint
  CHECK (intercession_day_of_week IS NULL OR (intercession_day_of_week >= 0 AND intercession_day_of_week <= 6));

ALTER TABLE weekly_commitments
  DROP CONSTRAINT IF EXISTS weekly_commitments_type_check;

ALTER TABLE weekly_commitments
  ADD CONSTRAINT weekly_commitments_type_check CHECK (
    type IN (
      'worship_minutes',
      'worship_hours',
      'declaration_reps',
      'scripture_minutes',
      'prayer_minutes',
      'bible_reading',
      'evening_reflection',
      'church_attendance',
      'small_group',
      'fasting',
      'spiritual_journaling',
      'sermon_review',
      'intercession',
      'devotional_reading',
      'listening_prayer',
      'custom'
    )
  );
