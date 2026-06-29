import { getCalendarQuarterProgress, getLegacyQuarterProgressForDate } from "@/lib/personal-year"
import {
  findSessionForWeek,
  getQuarterCodeForDate,
  getWeekRangeForSunday,
  toLocalISODate,
} from "@/lib/pulse-session-dates"
import type { PulseSessionRow } from "@/lib/pulse"

export type QuarterConfigRow = {
  id: string
  code: string
  name: string
  start_date: string
  end_date: string
  year_number: number | null
  is_active: boolean
  archived_at?: string | null
}

export type QuarterSource = "quarter_config" | "calendar"

export type PulseQuarterContext = {
  quarterCode: string
  weekNumber: number
  quarterName: string
  source: QuarterSource
  isComplete: boolean
  startDate: string
  endDate: string
}

export type ArchivableQuarter = {
  code: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  source: "quarter_config" | "historical_pulse"
}

export type QuarterWeekHistoryRow = {
  sundayDate: string
  weekLabel: string
  weekNumber: number
  session: PulseSessionRow | undefined
  isCurrentWeek: boolean
}

function noonDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00")
}

function isDateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  const d = noonDate(dateStr).getTime()
  return d >= noonDate(startStr).getTime() && d <= noonDate(endStr).getTime()
}

/** Week 1–13 within an inclusive quarter date range (same math as calendar quarter). */
export function getWeekInQuarterRange(startDateStr: string, endDateStr: string, atDateStr: string): number {
  const start = noonDate(startDateStr)
  const end = noonDate(endDateStr)
  const at = noonDate(atDateStr)

  if (at.getTime() < start.getTime()) return 0
  if (at.getTime() > end.getTime()) return 13

  const dayIndex = Math.floor((at.getTime() - start.getTime()) / 86400000) + 1
  return Math.min(13, Math.max(1, Math.ceil(dayIndex / 7)))
}

/** Sunday (planning session day) for week N of a quarter starting on startDateStr. */
export function getSundayForQuarterWeek(startDateStr: string, weekNumber: number): string {
  const start = noonDate(startDateStr)
  const daysUntilSunday = start.getDay() === 0 ? 0 : 7 - start.getDay()
  const sun = new Date(start)
  sun.setDate(start.getDate() + (weekNumber - 1) * 7 + daysUntilSunday)
  return toLocalISODate(sun)
}

function contextFromQuarterRow(q: QuarterConfigRow, sessionDateStr: string): PulseQuarterContext {
  const weekNumber = getWeekInQuarterRange(q.start_date, q.end_date, sessionDateStr)
  return {
    quarterCode: q.code,
    weekNumber,
    quarterName: q.name,
    source: "quarter_config",
    isComplete: weekNumber >= 13,
    startDate: q.start_date,
    endDate: q.end_date,
  }
}

export function resolvePulseQuarterContext(
  sessionDateStr: string,
  activeQuarter: QuarterConfigRow | null,
  allQuarters: QuarterConfigRow[] = [],
  /**
   * For the live "today" view: when set, an active quarter drives the context even
   * if the date falls just outside its range (e.g. a quarter that starts later this
   * week). Week is clamped to 1–13 so a freshly started quarter reads as Week 1.
   * Leave false for historical/edit views so past sessions resolve to their own quarter.
   */
  preferActive = false,
): PulseQuarterContext {
  if (activeQuarter && isDateInRange(sessionDateStr, activeQuarter.start_date, activeQuarter.end_date)) {
    return contextFromQuarterRow(activeQuarter, sessionDateStr)
  }

  for (const q of allQuarters) {
    if (q.id === activeQuarter?.id) continue
    if (isDateInRange(sessionDateStr, q.start_date, q.end_date)) {
      return contextFromQuarterRow(q, sessionDateStr)
    }
  }

  if (preferActive && activeQuarter) {
    const rawWeek = getWeekInQuarterRange(activeQuarter.start_date, activeQuarter.end_date, sessionDateStr)
    return {
      quarterCode: activeQuarter.code,
      weekNumber: Math.min(13, Math.max(1, rawWeek)),
      quarterName: activeQuarter.name,
      source: "quarter_config",
      // Only complete once the date is actually in/after the final week.
      isComplete: rawWeek >= 13,
      startDate: activeQuarter.start_date,
      endDate: activeQuarter.end_date,
    }
  }

  const sessionDate = noonDate(sessionDateStr)
  const calendar = getCalendarQuarterProgress(sessionDate)
  const legacy = getLegacyQuarterProgressForDate(sessionDate)
  const calendarYear = sessionDate.getFullYear()
  const q = Math.floor(sessionDate.getMonth() / 3) + 1
  const calStart = new Date(calendarYear, (q - 1) * 3, 1)
  const calEnd = new Date(calendarYear, q * 3, 0)

  return {
    quarterCode: getQuarterCodeForDate(sessionDate),
    weekNumber: calendar.weekInQuarter,
    quarterName: legacy.phaseName,
    source: "calendar",
    isComplete: calendar.weekInQuarter >= 13,
    startDate: toLocalISODate(calStart),
    endDate: toLocalISODate(calEnd),
  }
}

export function listArchivableQuarters(
  quarterConfigRows: QuarterConfigRow[],
  pulseSessions: { quarter_code: string | null; date: string }[],
): ArchivableQuarter[] {
  const map = new Map<string, ArchivableQuarter>()

  for (const q of quarterConfigRows) {
    map.set(q.code, {
      code: q.code,
      name: q.name,
      startDate: q.start_date,
      endDate: q.end_date,
      isActive: q.is_active,
      source: "quarter_config",
    })
  }

  const byCode = new Map<string, string[]>()
  for (const s of pulseSessions) {
    if (!s.quarter_code) continue
    const dates = byCode.get(s.quarter_code) ?? []
    dates.push(s.date)
    byCode.set(s.quarter_code, dates)
  }

  for (const [code, dates] of byCode) {
    if (map.has(code)) continue
    dates.sort()
    map.set(code, {
      code,
      name: code,
      startDate: dates[0]!,
      endDate: dates[dates.length - 1]!,
      isActive: false,
      source: "historical_pulse",
    })
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return b.startDate.localeCompare(a.startDate)
  })
}

export function buildQuarterWeekHistoryRows(
  quarter: Pick<ArchivableQuarter, "code" | "startDate">,
  sessions: PulseSessionRow[],
  calendarTodayStr: string,
  activeQuarterCode: string,
): QuarterWeekHistoryRow[] {
  const calendarToday = noonDate(calendarTodayStr)
  const lastSunday = new Date(calendarToday)
  lastSunday.setDate(calendarToday.getDate() - calendarToday.getDay())
  const currentSundayStr = toLocalISODate(lastSunday)
  const isActiveQuarter = quarter.code === activeQuarterCode

  const rows: QuarterWeekHistoryRow[] = []
  for (let w = 1; w <= 13; w++) {
    const sundayStr = getSundayForQuarterWeek(quarter.startDate, w)
    const { mondayStr, sundayStr: sun } = getWeekRangeForSunday(sundayStr)
    const rowSession = findSessionForWeek(sun, sessions)
    const start = noonDate(mondayStr)
    const end = noonDate(sun)
    const weekLabel = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    rows.push({
      sundayDate: sun,
      weekLabel,
      weekNumber: w,
      session: rowSession,
      isCurrentWeek: isActiveQuarter && sun === currentSundayStr,
    })
  }
  return rows
}

export function countCompletedSessionsForQuarter(
  quarterCode: string,
  pastSessions: { completed_at: string | null; quarter_code: string | null }[],
  todaySession: { completed_at: string | null; quarter_code: string | null } | null,
): number {
  return (
    pastSessions.filter((s) => s.completed_at && s.quarter_code === quarterCode).length +
    (todaySession?.completed_at && todaySession.quarter_code === quarterCode ? 1 : 0)
  )
}

export type BackfillCandidate = {
  oldCode: string
  newCode: string
  quarterName: string
  sessionCount: number
  pulseCheckCount: number
  startDate: string
  endDate: string
}

export function findBackfillCandidate(
  activeQuarter: QuarterConfigRow | null,
  sessions: { quarter_code: string | null; date: string }[],
  pulseChecks: { quarter_code: string | null; date: string }[],
): BackfillCandidate | null {
  if (!activeQuarter) return null

  const mismatchedSessions = sessions.filter(
    (s) =>
      isDateInRange(s.date, activeQuarter.start_date, activeQuarter.end_date) &&
      s.quarter_code !== activeQuarter.code,
  )
  const mismatchedChecks = pulseChecks.filter(
    (c) =>
      isDateInRange(c.date, activeQuarter.start_date, activeQuarter.end_date) &&
      c.quarter_code !== activeQuarter.code,
  )

  if (mismatchedSessions.length === 0 && mismatchedChecks.length === 0) return null

  const oldCode =
    mismatchedSessions[0]?.quarter_code ?? mismatchedChecks[0]?.quarter_code ?? "unknown"

  return {
    oldCode,
    newCode: activeQuarter.code,
    quarterName: activeQuarter.name,
    sessionCount: mismatchedSessions.length,
    pulseCheckCount: mismatchedChecks.length,
    startDate: activeQuarter.start_date,
    endDate: activeQuarter.end_date,
  }
}

export function formatQuarterBannerLine(quarterName: string, weekNumber: number): string {
  return `${quarterName} — Week ${weekNumber} of 13`
}
