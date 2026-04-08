// Sacred Focus — shared types & config

// ─── Activity ────────────────────────────────────────
export type ActivityType = "fellowship" | "conference" | "challenge" | "study" | "retreat" | "other"
export type ActivityStatus = "active" | "upcoming" | "completed" | "paused"

export const ACTIVITY_TYPES: { key: ActivityType; label: string }[] = [
  { key: "fellowship", label: "Fellowship" },
  { key: "conference", label: "Conference" },
  { key: "challenge", label: "Challenge" },
  { key: "study", label: "Study" },
  { key: "retreat", label: "Retreat" },
  { key: "other", label: "Other" },
]

export interface SpiritualActivity {
  id: string
  user_id: string
  title: string
  type: ActivityType
  organizer: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  is_recurring: boolean
  recurrence_pattern: string | null
  status: ActivityStatus
  tags: string[]
  books_resources: string[]
  overall_reflection: string | null
  created_at: string
  updated_at: string
}

// ─── Journal Entry ───────────────────────────────────
export type EntryType =
  | "revelation" | "assignment" | "prophecy" | "instruction"
  | "lesson" | "key_quote" | "rhema" | "prayer_point"
  | "testimony" | "note"

export interface EntryTypeConfig {
  key: EntryType
  label: string
  color: string      // bg color for chip/badge
  textColor: string  // text color on chip
  borderColor: string
}

export const ENTRY_TYPES: EntryTypeConfig[] = [
  { key: "revelation",   label: "Revelation",    color: "#7B2D8B", textColor: "#FFFFFF", borderColor: "#7B2D8B" },
  { key: "assignment",   label: "Assignment",    color: "#0D5C63", textColor: "#FFFFFF", borderColor: "#0D5C63" },
  { key: "prophecy",     label: "Prophecy",      color: "#B8860B", textColor: "#FFFFFF", borderColor: "#B8860B" },
  { key: "instruction",  label: "Instruction",   color: "#A7C2D7", textColor: "#1a3a4a", borderColor: "#A7C2D7" },
  { key: "lesson",       label: "Lesson",        color: "#2E7D32", textColor: "#FFFFFF", borderColor: "#2E7D32" },
  { key: "key_quote",    label: "Key Quote",     color: "#C2690C", textColor: "#FFFFFF", borderColor: "#C2690C" },
  { key: "rhema",        label: "Rhema",         color: "#C62828", textColor: "#FFFFFF", borderColor: "#C62828" },
  { key: "prayer_point", label: "Prayer Point",  color: "#3C1E38", textColor: "#FFFFFF", borderColor: "#3C1E38" },
  { key: "testimony",    label: "Testimony",     color: "#D4A017", textColor: "#1a1a1a", borderColor: "#D4A017" },
  { key: "note",         label: "Note",          color: "#6B7280", textColor: "#FFFFFF", borderColor: "#6B7280" },
]

export function getEntryTypeConfig(type: EntryType): EntryTypeConfig {
  return ENTRY_TYPES.find((t) => t.key === type) ?? ENTRY_TYPES[ENTRY_TYPES.length - 1]
}

/** Optional fields shown per journal entry type (content is always required). */
export const JOURNAL_OPTIONAL_FIELDS_BY_TYPE: Record<
  EntryType,
  ("scripture_reference" | "speaker")[]
> = {
  revelation: ["scripture_reference"],
  assignment: ["scripture_reference"],
  prophecy: ["speaker", "scripture_reference"],
  instruction: ["speaker"],
  lesson: ["scripture_reference"],
  key_quote: ["speaker"],
  rhema: ["scripture_reference"],
  prayer_point: ["scripture_reference"],
  testimony: [],
  note: [],
}

export interface JournalEntry {
  id: string
  user_id: string
  activity_id: string
  entry_type: EntryType
  content: string
  scripture_reference: string | null
  speaker: string | null
  is_highlight: boolean
  date: string
  created_at: string
}

// ─── Sub-Challenges ──────────────────────────────────
export type TargetType = "daily_count" | "daily_boolean" | "daily_duration"

export interface SubChallenge {
  id: string
  user_id: string
  activity_id: string
  title: string
  description: string | null
  target_type: TargetType
  target_value: number
  target_unit: string | null
  start_date: string | null
  end_date: string | null
  active: boolean
  created_at: string
}

export interface SubChallengeLog {
  id: string
  user_id: string
  sub_challenge_id: string
  date: string
  value: number
  completed: boolean
  note: string | null
  created_at: string
}

// ─── Fruits ──────────────────────────────────────────
export type FruitCategory =
  | "spiritual_growth" | "revelation" | "habit_formed" | "relationship"
  | "healing" | "breakthrough" | "resource" | "other"

export const FRUIT_CATEGORIES: { key: FruitCategory; label: string }[] = [
  { key: "spiritual_growth", label: "Spiritual Growth" },
  { key: "revelation", label: "Revelation" },
  { key: "habit_formed", label: "Habit Formed" },
  { key: "relationship", label: "Relationship" },
  { key: "healing", label: "Healing" },
  { key: "breakthrough", label: "Breakthrough" },
  { key: "resource", label: "Resource" },
  { key: "other", label: "Other" },
]

export interface ActivityFruit {
  id: string
  user_id: string
  activity_id: string
  category: FruitCategory
  description: string
  evidence: string | null
  date_recorded: string
  created_at: string
}

// ─── Recurrence helpers ──────────────────────────────
export const RECURRENCE_PRESETS: { value: string; label: string }[] = [
  { value: "weekly_sunday", label: "Every Sunday" },
  { value: "weekly_monday", label: "Every Monday" },
  { value: "weekly_friday", label: "Every Friday" },
  { value: "weekly_mon_fri", label: "Monday & Friday" },
  { value: "custom", label: "Custom Days" },
]

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

export function getRecurrenceLabel(pattern: string | null): string {
  if (!pattern) return ""
  const preset = RECURRENCE_PRESETS.find((p) => p.value === pattern)
  if (preset) return preset.label
  if (pattern.startsWith("custom:")) {
    const days = pattern.replace("custom:", "").split(",").map(Number)
    return days.map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label).filter(Boolean).join(", ")
  }
  return pattern
}

/** YYYY-MM-DD bounds for backdated journal/fruit entries (not after today; not after activity end_date if in the past). */
export function getSacredFocusEntryDateBounds(activity: SpiritualActivity | undefined): { min: string; max: string } {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, "0")
  const d = String(today.getDate()).padStart(2, "0")
  let max = `${y}-${m}-${d}`
  if (activity?.end_date && activity.end_date < max) max = activity.end_date
  let min = activity?.start_date ?? "2000-01-01"
  if (min > max) min = max
  return { min, max }
}

// ─── Helpers ─────────────────────────────────────────
export function getActivityDayProgress(activity: SpiritualActivity): { current: number; total: number } | null {
  if (activity.is_recurring || !activity.start_date || !activity.end_date) return null
  const start = new Date(activity.start_date)
  const end = new Date(activity.end_date)
  const now = new Date()
  const total = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
  const current = Math.max(1, Math.min(total, Math.ceil((now.getTime() - start.getTime()) / 86400000) + 1))
  return { current, total }
}
