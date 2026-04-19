-- Persist dashboard checklist state for Sunday Planning daily focus rows
ALTER TABLE daily_focus
  ADD COLUMN IF NOT EXISTS focus_1_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS focus_2_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS focus_3_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal_1_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal_2_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal_3_completed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN daily_focus.focus_1_completed IS 'Dashboard / execution: user checked off focus line 1 for that date';
