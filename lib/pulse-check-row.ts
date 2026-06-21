import { GOALS, pulseCheckNoteField } from "@/lib/data/dominion"

/** Columns the app may write to pulse_checks (insert/update). */
export const PULSE_CHECK_WRITABLE_COLUMNS = new Set([
  "week_number",
  "date",
  "quarter_code",
  "user_id",
  "g1_prayer",
  "g1_note",
  "g2_sermons",
  "g2_note",
  "g3_dominion",
  "g3_note",
  "g4_warfare",
  "g4_note",
  "g5_decisions",
  "g5_note",
  "g6_community",
  "g6_note",
  "g7_content",
  "g7_note",
  "overall_reflection",
])

/**
 * Strip unknown keys and map legacy note fields (g1_prayer_note → g1_note).
 * PostgREST rejects any column not in the schema cache.
 */
export function normalizePulseCheckRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(row)) {
    if (PULSE_CHECK_WRITABLE_COLUMNS.has(key)) {
      out[key] = value
    }
  }

  for (const goal of GOALS) {
    const legacyKey = `${goal.dbField}_note`
    const correctKey = pulseCheckNoteField(goal.dbField)
    if (legacyKey !== correctKey && legacyKey in row) {
      if (!(correctKey in out) || out[correctKey] == null) {
        out[correctKey] = row[legacyKey]
      }
    }
  }

  return out
}
