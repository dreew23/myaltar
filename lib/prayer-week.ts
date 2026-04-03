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
