export type CommitmentType =
  | "worship_minutes"
  | "declaration_reps"
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

export type CommitmentIconName = "Music" | "ScrollText" | "BookOpen" | "Flame" | "Sparkles"

export type CommitmentTypeMeta = {
  label: string
  defaultUnit: string
  defaultTarget: number
  step: number
  suggestedTitle: string
  icon: CommitmentIconName
}

export const COMMITMENT_TYPE_META: Record<CommitmentType, CommitmentTypeMeta> = {
  worship_minutes: {
    label: "Worship",
    defaultUnit: "min",
    defaultTarget: 10,
    step: 5,
    suggestedTitle: "10 min of worship",
    icon: "Music",
  },
  declaration_reps: {
    label: "Declaration reps",
    defaultUnit: "reps",
    defaultTarget: 10,
    step: 1,
    suggestedTitle: "Declaration × 10",
    icon: "ScrollText",
  },
  scripture_minutes: {
    label: "Scripture",
    defaultUnit: "min",
    defaultTarget: 15,
    step: 5,
    suggestedTitle: "15 min in scripture",
    icon: "BookOpen",
  },
  prayer_minutes: {
    label: "Prayer",
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
  "worship_minutes",
  "declaration_reps",
  "scripture_minutes",
  "prayer_minutes",
  "custom",
]

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
