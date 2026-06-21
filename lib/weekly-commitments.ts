import { intercessionRotation } from "@/lib/data/dominion"

export type CommitmentType =
  | "bible_reading"
  | "evening_reflection"
  | "church_attendance"
  | "small_group"
  | "fasting"
  | "declaration_reps"
  | "worship_hours"
  | "spiritual_journaling"
  | "sermon_review"
  | "intercession"
  | "devotional_reading"
  | "listening_prayer"
  | "worship_minutes"
  | "scripture_minutes"
  | "prayer_minutes"
  | "custom"

export type WeeklyCommitment = {
  id: string
  user_id: string
  week_start_date: string
  type: CommitmentType
  title: string
  daily_target: number
  unit: string
  declaration_id: string | null
  intercession_day_of_week: number | null
  display_order: number | null
  created_at: string
  updated_at: string
}

export type WeeklyCommitmentLog = {
  id: string
  commitment_id: string
  user_id: string
  date: string
  actual: number
  created_at: string
  updated_at: string
}

export type CommitmentIconName =
  | "BookOpen"
  | "Moon"
  | "Church"
  | "Users"
  | "Timer"
  | "ScrollText"
  | "Music"
  | "PenLine"
  | "FileText"
  | "Heart"
  | "Sun"
  | "Ear"
  | "Flame"
  | "Sparkles"

export type CommitmentTypeMeta = {
  label: string
  defaultUnit: string
  defaultTarget: number
  step: number
  suggestedTitle: string
  icon: CommitmentIconName
}

export const COMMITMENT_TYPE_META: Record<CommitmentType, CommitmentTypeMeta> = {
  bible_reading: {
    label: "Bible reading",
    defaultUnit: "chapters",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "1 chapter of Bible reading",
    icon: "BookOpen",
  },
  evening_reflection: {
    label: "Evening reflection / prayer",
    defaultUnit: "min",
    defaultTarget: 15,
    step: 5,
    suggestedTitle: "15 min evening reflection",
    icon: "Moon",
  },
  church_attendance: {
    label: "Church attendance",
    defaultUnit: "session",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "Church attendance",
    icon: "Church",
  },
  small_group: {
    label: "Small group / fellowship",
    defaultUnit: "session",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "Small group / fellowship",
    icon: "Users",
  },
  fasting: {
    label: "Fasting",
    defaultUnit: "hr",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "1 hr fasting",
    icon: "Timer",
  },
  declaration_reps: {
    label: "Scripture memorization / declaration",
    defaultUnit: "reps",
    defaultTarget: 10,
    step: 1,
    suggestedTitle: "Declaration × 10",
    icon: "ScrollText",
  },
  worship_hours: {
    label: "Worship / praise time",
    defaultUnit: "hr",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "1 hr worship / praise",
    icon: "Music",
  },
  spiritual_journaling: {
    label: "Spiritual journaling",
    defaultUnit: "entry",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "1 journal entry",
    icon: "PenLine",
  },
  sermon_review: {
    label: "Sermon review / notes",
    defaultUnit: "session",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "Sermon review / notes",
    icon: "FileText",
  },
  intercession: {
    label: "Intercession",
    defaultUnit: "min",
    defaultTarget: 15,
    step: 5,
    suggestedTitle: "Intercession",
    icon: "Heart",
  },
  devotional_reading: {
    label: "Devotional reading",
    defaultUnit: "min",
    defaultTarget: 10,
    step: 5,
    suggestedTitle: "10 min devotional reading",
    icon: "Sun",
  },
  listening_prayer: {
    label: "Listening prayer / silence",
    defaultUnit: "min",
    defaultTarget: 10,
    step: 5,
    suggestedTitle: "10 min listening prayer",
    icon: "Ear",
  },
  worship_minutes: {
    label: "Worship (minutes)",
    defaultUnit: "min",
    defaultTarget: 10,
    step: 5,
    suggestedTitle: "10 min of worship",
    icon: "Music",
  },
  scripture_minutes: {
    label: "Scripture (minutes)",
    defaultUnit: "min",
    defaultTarget: 15,
    step: 5,
    suggestedTitle: "15 min in scripture",
    icon: "BookOpen",
  },
  prayer_minutes: {
    label: "Prayer (minutes)",
    defaultUnit: "min",
    defaultTarget: 30,
    step: 5,
    suggestedTitle: "30 min in prayer",
    icon: "Flame",
  },
  custom: {
    label: "Custom",
    defaultUnit: "times",
    defaultTarget: 1,
    step: 1,
    suggestedTitle: "",
    icon: "Sparkles",
  },
}

export const COMMITMENT_TYPES: CommitmentType[] = [
  "bible_reading",
  "evening_reflection",
  "church_attendance",
  "small_group",
  "fasting",
  "declaration_reps",
  "worship_hours",
  "spiritual_journaling",
  "sermon_review",
  "intercession",
  "devotional_reading",
  "listening_prayer",
  "worship_minutes",
  "scripture_minutes",
  "prayer_minutes",
  "custom",
]

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const

export type IntercessionThemeOption = {
  dayOfWeek: number
  dayLabel: string
  theme: string
}

/** Seven intercession themes for the commitment picker (user schedule or dominion defaults). */
export function intercessionThemesForPicker(
  schedule: { day_of_week: number; theme: string }[] | null | undefined
): IntercessionThemeOption[] {
  const byDay = new Map<number, string>()
  if (schedule?.length === 7) {
    for (const row of schedule) {
      byDay.set(row.day_of_week, row.theme)
    }
  }
  return ([0, 1, 2, 3, 4, 5, 6] as const).map((dayOfWeek) => ({
    dayOfWeek,
    dayLabel: DAY_NAMES[dayOfWeek]!,
    theme: byDay.get(dayOfWeek) ?? intercessionRotation[dayOfWeek]?.theme ?? "Intercession",
  }))
}

export function intercessionTitleForDay(
  dayOfWeek: number,
  schedule: { day_of_week: number; theme: string }[] | null | undefined
): string {
  const themes = intercessionThemesForPicker(schedule)
  const match = themes.find((t) => t.dayOfWeek === dayOfWeek)
  return match ? `Intercession — ${match.theme}` : "Intercession"
}

/** Monday-first narrow weekday labels matching `daysForWeek`. */
export const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const

/** Seven ISO dates (YYYY-MM-DD) Monday -> Sunday for the given Monday. */
export function daysForWeek(mondayStr: string): string[] {
  const [y, m, d] = mondayStr.split("-").map(Number)
  const out: string[] = []
  for (let i = 0; i < 7; i += 1) {
    const dt = new Date(y, m - 1, d)
    dt.setDate(dt.getDate() + i)
    out.push(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
    )
  }
  return out
}

/** Index logs by `commitmentId|date` for O(1) cell lookup. */
export function logMapByCommitmentAndDate(
  logs: WeeklyCommitmentLog[]
): Map<string, WeeklyCommitmentLog> {
  const map = new Map<string, WeeklyCommitmentLog>()
  for (const log of logs) {
    map.set(`${log.commitment_id}|${log.date}`, log)
  }
  return map
}

export type WeeklyCommitmentInsertInput = {
  user_id: string
  week_start_date: string
  type: CommitmentType
  title: string
  daily_target: number
  unit: string
  declaration_id: string | null
  display_order: number
  intercession_day_of_week?: number
}

/** Build Supabase insert row; omits `intercession_day_of_week` unless intercession + day set. */
export function weeklyCommitmentInsertPayload(args: {
  userId: string
  weekStartStr: string
  type: CommitmentType
  title: string
  dailyTarget: number
  unit: string
  declarationId: string | null
  intercessionDayOfWeek: number | null
  displayOrder: number
}): WeeklyCommitmentInsertInput {
  const base: WeeklyCommitmentInsertInput = {
    user_id: args.userId,
    week_start_date: args.weekStartStr,
    type: args.type,
    title: args.title.trim(),
    daily_target: args.dailyTarget,
    unit: args.unit.trim() || COMMITMENT_TYPE_META[args.type].defaultUnit,
    declaration_id: args.declarationId,
    display_order: args.displayOrder,
  }
  if (
    args.type === "intercession" &&
    args.intercessionDayOfWeek !== null &&
    Number.isFinite(args.intercessionDayOfWeek)
  ) {
    base.intercession_day_of_week = args.intercessionDayOfWeek
  }
  return base
}

/** User-facing message for failed weekly_commitments writes. */
export function weeklyCommitmentSaveErrorMessage(error: {
  message?: string
  code?: string
  details?: string
}): string {
  const msg = [error.message, error.details].filter(Boolean).join(" ")
  if (
    msg.includes("weekly_commitments_type_check") ||
    error.code === "23514" ||
    msg.includes("violates check constraint")
  ) {
    return (
      "This commitment type is not enabled in your database yet. In Supabase, run migration " +
      "20250421_weekly_commitments_expand_types.sql — or choose a legacy type (Worship, Scripture, Prayer, Custom)."
    )
  }
  if (msg.includes("intercession_day_of_week") || error.code === "PGRST204") {
    return (
      "Your database is missing the intercession column. Run migration " +
      "20250421_weekly_commitments_expand_types.sql in the Supabase SQL editor."
    )
  }
  if (error.code === "42501" || msg.toLowerCase().includes("row-level security")) {
    return "You do not have permission to save commitments. Try signing out and back in."
  }
  return msg || "Could not save commitment. Please try again."
}

/** Count how many of the 7 days for this commitment hit the daily target. */
export function daysHitTarget(
  commitmentId: string,
  dailyTarget: number,
  days: string[],
  logMap: Map<string, WeeklyCommitmentLog>
): number {
  let n = 0
  for (const date of days) {
    const actual = logMap.get(`${commitmentId}|${date}`)?.actual ?? 0
    if (actual >= dailyTarget) n += 1
  }
  return n
}
