/** User's local calendar date `YYYY-MM-DD` (not UTC). Use for prayer "today" and daily rows. */
export function localCalendarDateString(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Monday-based week start (local calendar). */
export function getMondayOfWeek(d = new Date()): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function mondayDateString(d = new Date()): string {
  return getMondayOfWeek(d).toISOString().split("T")[0]!
}
