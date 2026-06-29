/** Personal DOMINION year segments + calendar quarter overlay (display layer). */

export type PersonalYearConfigRow = {
  id: string
  user_id: string
  year_code: string
  year_name: string
  year_number: number
  year_theme: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type PersonalYearProgress = {
  yearCode: string
  yearName: string
  yearNumber: number
  yearTheme: string | null
  weekNumber: number
  totalWeeks: 13
  progress: number
  startDate: string
  endDate: string
  daysElapsed: number
  totalDays: number
  daysRemaining: number
}

export type CalendarQuarterProgress = {
  calendarYear: number
  quarter: 1 | 2 | 3 | 4
  weekInQuarter: number
  totalWeeks: 13
  progress: number
  dateRangeLabel: string
  labelShort: string
  /** Jan–Jun = 1, Jul–Dec = 2 (for “Year 1 / Year 2” calendar half-year labels). */
  halfYearPhase: 1 | 2
  halfYearPhaseName: string
}

function noon(d: Date) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x
}

export function getPersonalYearProgress(
  personalYears: PersonalYearConfigRow[],
  at: Date = new Date()
): PersonalYearProgress | null {
  if (!personalYears?.length) return null
  const today = noon(at)
  const active =
    personalYears.find((y) => y.is_active) ??
    personalYears.find((y) => {
      const s = new Date(y.start_date + "T12:00:00")
      const e = new Date(y.end_date + "T12:00:00")
      return today >= s && today <= e
    })
  if (!active) return null

  const start = new Date(active.start_date + "T12:00:00")
  const end = new Date(active.end_date + "T12:00:00")
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1)
  const rawElapsed = Math.ceil((today.getTime() - start.getTime()) / 86400000) + 1
  const daysElapsed = Math.min(totalDays, Math.max(0, rawElapsed))
  const weekNumber = Math.min(Math.floor(daysElapsed / 7) + 1, 13)
  const progress = Math.min(100, Math.round((daysElapsed / totalDays) * 100))
  const daysRemaining = Math.max(0, totalDays - daysElapsed)

  return {
    yearCode: active.year_code,
    yearName: active.year_name,
    yearNumber: active.year_number,
    yearTheme: active.year_theme,
    weekNumber,
    totalWeeks: 13,
    progress,
    startDate: active.start_date,
    endDate: active.end_date,
    daysElapsed,
    totalDays,
    daysRemaining,
  }
}

function formatMonthDay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatMonthDayYear(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatMonthDayYearRange(start: Date, end: Date) {
  return `${formatMonthDay(start)} – ${formatMonthDayYear(end)}`
}

export function getCalendarQuarterProgress(at: Date = new Date()): CalendarQuarterProgress {
  const today = noon(at)
  const calendarYear = today.getFullYear()
  const m = today.getMonth()
  const q = (Math.floor(m / 3) + 1) as 1 | 2 | 3 | 4
  const start = new Date(calendarYear, (q - 1) * 3, 1)
  const end = new Date(calendarYear, q * 3, 0)
  start.setHours(12, 0, 0, 0)
  end.setHours(12, 0, 0, 0)
  const dayIndex = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
  const daysInQuarter = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1)
  const weekInQuarter = Math.min(13, Math.max(1, Math.ceil(dayIndex / 7)))
  const progress = Math.min(100, Math.round((dayIndex / daysInQuarter) * 100))
  const halfYearPhase: 1 | 2 = m < 6 ? 1 : 2
  const halfYearPhaseName = halfYearPhase === 1 ? "Foundation & Habits" : "Momentum & Mastery"
  return {
    calendarYear,
    quarter: q,
    weekInQuarter,
    totalWeeks: 13,
    progress,
    dateRangeLabel: formatMonthDayYearRange(start, end),
    labelShort: `Q${q} ${calendarYear}`,
    halfYearPhase,
    halfYearPhaseName,
  }
}

/** Match legacy `getQuarterProgress()` shape: calendar quarter + half-year “phase” names. */
export function getLegacyQuarterProgressFromCalendar(at: Date = new Date()) {
  const c = getCalendarQuarterProgress(at)
  return {
    year: c.halfYearPhase,
    quarter: c.quarter,
    weekInQuarter: c.weekInQuarter,
    totalWeeks: 13,
    phaseName: `Year ${c.halfYearPhase}: ${c.halfYearPhaseName}`,
  }
}

export function getCalendarQuarterProgressForDate(d: Date) {
  return getCalendarQuarterProgress(d)
}

export function getLegacyQuarterProgressForDate(d: Date) {
  return getLegacyQuarterProgressFromCalendar(d)
}

export function formatDualPulseContextLine(
  personal: PersonalYearProgress | null,
  calendar: CalendarQuarterProgress
): string {
  const calPart = `Calendar: ${calendar.labelShort}, Week ${calendar.weekInQuarter}`
  if (!personal) return calPart
  return `Personal: Year ${personal.yearNumber}, Week ${personal.weekNumber} | ${calPart}`
}

export function formatCalendarQuarterEndingLine(
  calendar: CalendarQuarterProgress,
  at: Date = new Date(),
): string {
  const end = new Date(calendar.calendarYear, calendar.quarter * 3, 0)
  end.setHours(12, 0, 0, 0)
  const today = noon(at)
  const days = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000))
  const nextQ = calendar.quarter === 4 ? 1 : calendar.quarter + 1
  const nextY = calendar.quarter === 4 ? calendar.calendarYear + 1 : calendar.calendarYear
  const nextStart = new Date(nextY, (nextQ - 1) * 3, 1)
  const nextLabel = nextStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (days === 0) return `Calendar ${calendar.labelShort} ends today — Q${nextQ} starts ${nextLabel}`
  if (days === 1) return `Calendar ${calendar.labelShort} ends in 1 day — Q${nextQ} starts ${nextLabel}`
  return `Calendar ${calendar.labelShort} ends in ${days} days — Q${nextQ} starts ${nextLabel}`
}

export function getCalendarQuarterEndDateStr(calendar: CalendarQuarterProgress): string {
  const end = new Date(calendar.calendarYear, calendar.quarter * 3, 0)
  const y = end.getFullYear()
  const mo = String(end.getMonth() + 1).padStart(2, "0")
  const day = String(end.getDate()).padStart(2, "0")
  return `${y}-${mo}-${day}`
}

/** Which calendar lens is shown as primary (display-only preference). */
export type CalendarLens = "personal" | "system"

export type LensLine = {
  /** "Personal" | "Calendar" */
  kind: "personal" | "calendar"
  /** e.g. "Year 3: Momentum & Mastery" or "Q3 2026". */
  label: string
  /** Full single-line label, e.g. "Personal: Year 3 — Week 11 of 13". */
  line: string
  weekNumber: number
  totalWeeks: number
  progress: number
}

export type LensLines = {
  primary: LensLine
  secondary: LensLine | null
  primaryIsPersonal: boolean
}

function personalLensLine(personal: PersonalYearProgress): LensLine {
  const label = `Year ${personal.yearNumber}: ${personal.yearName}`
  return {
    kind: "personal",
    label,
    line: `Personal: ${label} — Week ${personal.weekNumber} of ${personal.totalWeeks}`,
    weekNumber: personal.weekNumber,
    totalWeeks: personal.totalWeeks,
    progress: personal.progress,
  }
}

function calendarLensLine(calendar: CalendarQuarterProgress): LensLine {
  return {
    kind: "calendar",
    label: calendar.labelShort,
    line: `Calendar: ${calendar.labelShort} — Week ${calendar.weekInQuarter} of ${calendar.totalWeeks}`,
    weekNumber: calendar.weekInQuarter,
    totalWeeks: calendar.totalWeeks,
    progress: calendar.progress,
  }
}

/**
 * Resolve which lens leads and which is the secondary reference.
 * Display-only: callers still store/key data on their own source of truth.
 * When there is no personal year, calendar is always primary (no secondary).
 */
export function formatLensLines(
  personal: PersonalYearProgress | null,
  calendar: CalendarQuarterProgress,
  lens: CalendarLens
): LensLines {
  const cal = calendarLensLine(calendar)
  if (!personal) {
    return { primary: cal, secondary: null, primaryIsPersonal: false }
  }
  const per = personalLensLine(personal)
  if (lens === "system") {
    return { primary: cal, secondary: per, primaryIsPersonal: false }
  }
  return { primary: per, secondary: cal, primaryIsPersonal: true }
}

/** Non-overlapping calendar quarter labels (e.g. Q4 2025 … Q4 2026) for a date span. */
export function getCalendarQuarterChipsInRange(startStr: string, endStr: string): { label: string }[] {
  const start = new Date(startStr + "T12:00:00")
  const end = new Date(endStr + "T12:00:00")
  const chips: { label: string }[] = []
  let d = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1)
  while (d <= end) {
    const q = Math.floor(d.getMonth() / 3) + 1
    const y = d.getFullYear()
    chips.push({ label: `Q${q} ${y}` })
    d = new Date(y, (q - 1) * 3 + 3, 1)
  }
  return chips
}
