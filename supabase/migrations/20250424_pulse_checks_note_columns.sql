-- Older pulse_checks tables may exist without per-goal note columns.
-- CREATE TABLE IF NOT EXISTS does not add columns to an existing table.

ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g1_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g2_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g3_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g4_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g5_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g6_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS g7_note text;
ALTER TABLE pulse_checks ADD COLUMN IF NOT EXISTS overall_reflection text;
