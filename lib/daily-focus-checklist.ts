/** `daily_focus` row shape for Phase 5 daily plan + dashboard checklist persistence */

export type DailyFocusCompletedKey =
  | "focus_1_completed"
  | "focus_2_completed"
  | "focus_3_completed"
  | "goal_1_completed"
  | "goal_2_completed"
  | "goal_3_completed"

export type DailyFocusRow = {
  focus_1: string | null
  focus_2: string | null
  focus_3: string | null
  goal_1: string | null
  goal_2: string | null
  goal_3: string | null
  focus_1_completed?: boolean | null
  focus_2_completed?: boolean | null
  focus_3_completed?: boolean | null
  goal_1_completed?: boolean | null
  goal_2_completed?: boolean | null
  goal_3_completed?: boolean | null
}

export type DailyFocusChecklistItem = { completedKey: DailyFocusCompletedKey; text: string }

function asBool(v: unknown): boolean {
  if (v === true) return true
  if (v === false || v == null) return false
  if (typeof v === "string") return v === "true" || v === "t" || v === "1"
  return Boolean(v)
}

/** Normalize a PostgREST `*` row (or upsert response) into `DailyFocusRow` */
export function normalizeDailyFocusRow(r: Record<string, unknown>): DailyFocusRow {
  return {
    focus_1: (r.focus_1 as string | null) ?? null,
    focus_2: (r.focus_2 as string | null) ?? null,
    focus_3: (r.focus_3 as string | null) ?? null,
    goal_1: (r.goal_1 as string | null) ?? null,
    goal_2: (r.goal_2 as string | null) ?? null,
    goal_3: (r.goal_3 as string | null) ?? null,
    focus_1_completed: "focus_1_completed" in r ? asBool(r.focus_1_completed) : undefined,
    focus_2_completed: "focus_2_completed" in r ? asBool(r.focus_2_completed) : undefined,
    focus_3_completed: "focus_3_completed" in r ? asBool(r.focus_3_completed) : undefined,
    goal_1_completed: "goal_1_completed" in r ? asBool(r.goal_1_completed) : undefined,
    goal_2_completed: "goal_2_completed" in r ? asBool(r.goal_2_completed) : undefined,
    goal_3_completed: "goal_3_completed" in r ? asBool(r.goal_3_completed) : undefined,
  }
}

export const EMPTY_DAILY_FOCUS_CHECKS: Record<DailyFocusCompletedKey, boolean> = {
  focus_1_completed: false,
  focus_2_completed: false,
  focus_3_completed: false,
  goal_1_completed: false,
  goal_2_completed: false,
  goal_3_completed: false,
}

export function buildDailyFocusChecklist(row: DailyFocusRow): DailyFocusChecklistItem[] {
  const f1 = row.focus_1?.trim() ?? ""
  const f2 = row.focus_2?.trim() ?? ""
  const f3 = row.focus_3?.trim() ?? ""
  if (f1 || f2 || f3) {
    const out: DailyFocusChecklistItem[] = []
    if (f1) out.push({ completedKey: "focus_1_completed", text: f1 })
    if (f2) out.push({ completedKey: "focus_2_completed", text: f2 })
    if (f3) out.push({ completedKey: "focus_3_completed", text: f3 })
    return out
  }
  const out: DailyFocusChecklistItem[] = []
  const g1 = row.goal_1?.trim() ?? ""
  const g2 = row.goal_2?.trim() ?? ""
  const g3 = row.goal_3?.trim() ?? ""
  if (g1) out.push({ completedKey: "goal_1_completed", text: g1 })
  if (g2) out.push({ completedKey: "goal_2_completed", text: g2 })
  if (g3) out.push({ completedKey: "goal_3_completed", text: g3 })
  return out
}

export function completedSnapshotFromRow(row: DailyFocusRow): Record<DailyFocusCompletedKey, boolean> {
  return {
    focus_1_completed: asBool(row.focus_1_completed),
    focus_2_completed: asBool(row.focus_2_completed),
    focus_3_completed: asBool(row.focus_3_completed),
    goal_1_completed: asBool(row.goal_1_completed),
    goal_2_completed: asBool(row.goal_2_completed),
    goal_3_completed: asBool(row.goal_3_completed),
  }
}

/** Stable token for React deps — only changes when server-sent daily_focus fields actually change */
export function dailyFocusServerSyncToken(dateStr: string, row: DailyFocusRow | null): string {
  if (!row) return `${dateStr}|∅`
  const c = completedSnapshotFromRow(row)
  return [
    dateStr,
    row.focus_1 ?? "",
    row.focus_2 ?? "",
    row.focus_3 ?? "",
    row.goal_1 ?? "",
    row.goal_2 ?? "",
    row.goal_3 ?? "",
    c.focus_1_completed ? "1" : "0",
    c.focus_2_completed ? "1" : "0",
    c.focus_3_completed ? "1" : "0",
    c.goal_1_completed ? "1" : "0",
    c.goal_2_completed ? "1" : "0",
    c.goal_3_completed ? "1" : "0",
  ].join("\u001f")
}

/** Full row for Supabase upsert — keeps text fields and sets all six completion flags */
export function dailyFocusUpsertPayload(
  userId: string,
  date: string,
  textRow: DailyFocusRow,
  completed: Record<DailyFocusCompletedKey, boolean>
) {
  return {
    user_id: userId,
    date,
    focus_1: textRow.focus_1?.trim() || null,
    focus_2: textRow.focus_2?.trim() || null,
    focus_3: textRow.focus_3?.trim() || null,
    goal_1: textRow.goal_1?.trim() || null,
    goal_2: textRow.goal_2?.trim() || null,
    goal_3: textRow.goal_3?.trim() || null,
    focus_1_completed: completed.focus_1_completed,
    focus_2_completed: completed.focus_2_completed,
    focus_3_completed: completed.focus_3_completed,
    goal_1_completed: completed.goal_1_completed,
    goal_2_completed: completed.goal_2_completed,
    goal_3_completed: completed.goal_3_completed,
  }
}
