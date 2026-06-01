import { getLegacyQuarterProgressForDate } from "@/lib/personal-year"

/** Local calendar YYYY-MM-DD (avoid UTC drift from toISOString). */
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Monday as start of week (Mon–Sun). */
export function getWeekStartMonday(d: Date): Date {
  const x = new Date(d)
  const day = d.getDay()
  const daysBack = day === 0 ? 6 : day - 1
  x.setDate(d.getDate() - daysBack)
  return x
}

export function getWeekNumberOfYear(d: Date): number {
  const normalized = new Date(d)
  normalized.setHours(12, 0, 0, 0)
  const jan1 = new Date(normalized.getFullYear(), 0, 1)
  jan1.setHours(12, 0, 0, 0)
  return Math.max(1, Math.ceil((normalized.getTime() - jan1.getTime()) / 86400000 / 7))
}

/** Sunday (YYYY-MM-DD) identifying the Sun–Sun planning week containing dateStr. */
export function getPlanningWeekSunday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  const sun = new Date(d)
  sun.setDate(d.getDate() - d.getDay())
  return toLocalISODate(sun)
}

/** Local calendar day bounds as UTC ISO strings for timestamptz filters. */
export function localDateToUtcBounds(dateStr: string): { start: string; end: string } {
  return {
    start: new Date(dateStr + "T00:00:00").toISOString(),
    end: new Date(dateStr + "T23:59:59.999").toISOString(),
  }
}

/** 0-based day index within the calendar year (Jan 1 = 0). Uses local noon to avoid DST edges. */
export function dayOfYearIndex(at: Date = new Date()): number {
  const noonDate = new Date(at)
  noonDate.setHours(12, 0, 0, 0)
  const jan1 = new Date(noonDate.getFullYear(), 0, 1)
  jan1.setHours(12, 0, 0, 0)
  return Math.floor((noonDate.getTime() - jan1.getTime()) / 86400000)
}

export function getQuarterCodeForDate(d: Date): string {
  const year = d.getFullYear()
  const q = Math.floor(d.getMonth() / 3) + 1
  return `${year}-Q${q}`
}

/** Mirrors `getQuarterProgress()` / calendar quarter + half-year labels for an arbitrary date. */
export function getQuarterProgressForDate(d: Date) {
  return getLegacyQuarterProgressForDate(d)
}

/** Seven-day window ending on sessionDateStr (inclusive). */
export function getSevenDayWindow(sessionDateStr: string): { startStr: string; endStr: string } {
  const end = new Date(sessionDateStr + "T12:00:00")
  const start = new Date(end)
  start.setDate(end.getDate() - 6)
  return { startStr: toLocalISODate(start), endStr: sessionDateStr }
}

/** Next calendar week after the week containing sessionDate (Mon–Sun → next Mon + 7 days). */
export function getNextWeekFocusDatesFromSessionDate(sessionDateStr: string): string[] {
  const weekStart = getWeekStartMonday(new Date(sessionDateStr + "T12:00:00"))
  const nextMon = new Date(weekStart)
  nextMon.setDate(weekStart.getDate() + 7)
  const out: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(nextMon)
    d.setDate(nextMon.getDate() + i)
    out.push(toLocalISODate(d))
  }
  return out
}

/** Most recent Sunday ≤ fromDate, then previous Sundays (newest first). */
export function getRecentSundays(count: number, fromDate: Date = new Date()): string[] {
  const out: string[] = []
  const d = new Date(fromDate)
  const lastSunday = new Date(d)
  lastSunday.setDate(d.getDate() - d.getDay())
  for (let i = 0; i < count; i++) {
    const s = new Date(lastSunday)
    s.setDate(lastSunday.getDate() - i * 7)
    out.push(toLocalISODate(s))
  }
  return out
}

/** Monday (inclusive) through Sunday (inclusive) for the week whose Sunday is `sundayStr`. */
export function getWeekRangeForSunday(sundayStr: string): { mondayStr: string; sundayStr: string } {
  const s = new Date(sundayStr + "T12:00:00")
  const mon = new Date(s)
  mon.setDate(s.getDate() - 6)
  return { mondayStr: toLocalISODate(mon), sundayStr }
}

/** Session row whose `date` falls Mon–Sun for the week ending on `sundayStr`. */
export function findSessionForWeek<T extends { date: string }>(sundayStr: string, sessions: T[]): T | undefined {
  const { mondayStr, sundayStr: sun } = getWeekRangeForSunday(sundayStr)
  return sessions.find((s) => s.date >= mondayStr && s.date <= sun)
}
