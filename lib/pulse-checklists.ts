/** Parse jsonb checklist object from Supabase into numeric-key map. */
export function parseChecklistMap(raw: unknown): Record<number, boolean> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<number, boolean> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const i = parseInt(k, 10)
    if (!Number.isNaN(i)) out[i] = Boolean(v)
  }
  return out
}

/** Serialize for jsonb column (string keys). */
export function toChecklistJson(map: Record<number, boolean>): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(map)) {
    out[String(k)] = v
  }
  return out
}
