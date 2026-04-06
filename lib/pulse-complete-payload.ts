/** Remove jsonb checklist fields (for retry when DB migration not applied). */
export function stripPulseChecklistFields<T extends Record<string, unknown>>(row: T): Omit<T, "phase1_checklist" | "phase6_close_checklist"> {
  const { phase1_checklist: _a, phase6_close_checklist: _b, ...rest } = row
  return rest
}

export function isMissingChecklistColumnError(message: string): boolean {
  return /phase1_checklist|phase6_close_checklist|Could not find the .* column|column .* does not exist/i.test(message)
}

/** PostgREST: .single() with 0 updated rows */
export function isNoRowUpdatedError(message: string, code?: string): boolean {
  if (code === "PGRST116") return true
  return /0 rows|JSON object requested.*multiple|no rows returned/i.test(message)
}
