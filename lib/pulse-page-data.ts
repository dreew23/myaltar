import type { SupabaseClient } from "@supabase/supabase-js"
import type { GoalConfig } from "@/lib/data/dominion"
import type { PulseSessionRow } from "@/lib/pulse"
import type { PersonalYearConfigRow } from "@/lib/personal-year"
import {
  findBackfillCandidate,
  listArchivableQuarters,
  resolvePulseQuarterContext,
  type ArchivableQuarter,
  type BackfillCandidate,
  type QuarterConfigRow,
  type QuarterSource,
} from "@/lib/quarter-context"
import {
  getSevenDayWindow,
  getNextWeekFocusDatesFromSessionDate,
  toLocalISODate,
  localDateToUtcBounds,
} from "@/lib/pulse-session-dates"

export type PulsePageData = {
  goals: GoalConfig[]
  todaySession: PulseSessionRow | null
  pastSessions: PulseSessionRow[]
  sessionsForWeekMatching: PulseSessionRow[]
  weekDevotions: Record<string, unknown>[]
  weekPrayerSessions: { date: string }[]
  weekDownloads: { id: string; content: string; created_at?: string }[]
  declarationLogsSummary: { daysAllMet: number; totalDays: number }
  thisWeekPulseCheck: Record<string, unknown> | null
  declarations: { id: string; content: string; scripture_reference: string }[]
  lastWeekTimeAnalysis: string | null
  nextWeekFocusDates: string[]
  nextWeekDailyFocus: {
    date: string
    focus_1?: string
    focus_2?: string
    focus_3?: string
    goal_1?: string
    goal_2?: string
    goal_3?: string
  }[]
  quarter: { weekInQuarter: number; phaseName: string }
  weekNumber: number
  quarterCode: string
  quarterName: string
  quarterSource: QuarterSource
  quarterIsComplete: boolean
  quarterStartDate: string
  quarterEndDate: string
  sevenDaysAgoStr: string
  personalYears: PersonalYearConfigRow[]
  quarterConfigRows: QuarterConfigRow[]
  activeQuarter: QuarterConfigRow | null
  archivableQuarters: ArchivableQuarter[]
  allPulseChecks: Record<string, unknown>[]
  backfillCandidate: BackfillCandidate | null
}

export async function loadPulsePageData(
  supabase: SupabaseClient,
  userId: string,
  sessionDateStr: string,
  goals: GoalConfig[],
  options: { preferActiveQuarter?: boolean } = {},
): Promise<PulsePageData> {
  const { startStr: sevenDaysAgoStr, endStr: windowEndStr } = getSevenDayWindow(sessionDateStr)
  const nextWeekFocusDates = getNextWeekFocusDatesFromSessionDate(sessionDateStr)

  const minHistory = new Date(sessionDateStr + "T12:00:00")
  minHistory.setDate(minHistory.getDate() - 13 * 7)
  const minHistoryStr = toLocalISODate(minHistory)

  let todaySession: PulseSessionRow | null = null
  let pastSessions: PulseSessionRow[] = []
  let sessionsForWeekMatching: PulseSessionRow[] = []
  let weekDevotions: Record<string, unknown>[] = []
  let weekPrayerSessions: { date: string }[] = []
  let weekDownloads: { id: string; content: string; created_at?: string }[] = []
  let declarationLogsSummary: PulsePageData["declarationLogsSummary"] = { daysAllMet: 0, totalDays: 7 }
  let thisWeekPulseCheck: Record<string, unknown> | null = null
  let declarations: PulsePageData["declarations"] = []
  let lastWeekTimeAnalysis: string | null = null
  let nextWeekDailyFocus: PulsePageData["nextWeekDailyFocus"] = []
  let personalYears: PersonalYearConfigRow[] = []
  let quarterConfigRows: QuarterConfigRow[] = []
  let allPulseChecks: Record<string, unknown>[] = []
  let allSessionsForArchive: PulseSessionRow[] = []

  async function fetchQuarterConfig(): Promise<QuarterConfigRow[]> {
    try {
      const { data } = await supabase
        .from("quarter_config")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false })
      return (data ?? []) as QuarterConfigRow[]
    } catch {
      return []
    }
  }

  async function fetchAllPulseChecks(): Promise<Record<string, unknown>[]> {
    try {
      const { data } = await supabase.from("pulse_checks").select("*").eq("user_id", userId)
      return (data ?? []) as Record<string, unknown>[]
    } catch {
      return []
    }
  }

  async function fetchAllSessionsForArchive(): Promise<PulseSessionRow[]> {
    try {
      const { data } = await supabase
        .from("pulse_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(200)
      return (data ?? []) as PulseSessionRow[]
    } catch {
      return []
    }
  }

  async function fetchPersonalYears(): Promise<PersonalYearConfigRow[]> {
    try {
      const { data } = await supabase
        .from("personal_year_config")
        .select("*")
        .eq("user_id", userId)
        .order("year_number", { ascending: true })
      return (data ?? []) as PersonalYearConfigRow[]
    } catch {
      return []
    }
  }

  async function fetchTodaySession() {
    const { data } = await supabase
      .from("pulse_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", sessionDateStr)
      .maybeSingle()
    return data as PulseSessionRow | null
  }

  async function fetchPastSessions() {
    const { data } = await supabase
      .from("pulse_sessions")
      .select("*")
      .eq("user_id", userId)
      .lt("date", sessionDateStr)
      .order("date", { ascending: false })
      .limit(50)
    return (data ?? []) as PulseSessionRow[]
  }

  async function fetchSessionsForWeekMatching() {
    const { data } = await supabase
      .from("pulse_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("date", minHistoryStr)
      .order("date", { ascending: false })
    return (data ?? []) as PulseSessionRow[]
  }

  async function fetchWeekDevotions() {
    const { data } = await supabase
      .from("daily_devotions")
      .select("*")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgoStr)
      .lte("date", windowEndStr)
      .order("date", { ascending: true })
    return data ?? []
  }

  async function fetchWeekPrayerSessions() {
    const { data } = await supabase
      .from("prayer_sessions")
      .select("date")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgoStr)
      .lte("date", windowEndStr)
    return data ?? []
  }

  async function fetchWeekDownloads() {
    const startBounds = localDateToUtcBounds(sevenDaysAgoStr)
    const endBounds = localDateToUtcBounds(windowEndStr)
    const { data } = await supabase
      .from("divine_downloads")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .gte("created_at", startBounds.start)
      .lte("created_at", endBounds.end)
      .order("created_at", { ascending: false })
    return data ?? []
  }

  async function fetchDeclarationLogsSummary() {
    const { data: logs } = await supabase
      .from("declaration_logs")
      .select("date, completed")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgoStr)
      .lte("date", windowEndStr)
    if (!logs?.length) return { daysAllMet: 0, totalDays: 7 }
    const byDate = new Map<string, boolean>()
    for (const l of logs) {
      const current = byDate.get(l.date)
      byDate.set(l.date, current === undefined ? l.completed : current && l.completed)
    }
    const daysAllMet = Array.from(byDate.values()).filter(Boolean).length
    return { daysAllMet, totalDays: 7 }
  }

  async function fetchPulseCheckForSession(
    sessionRow: PulseSessionRow | null,
    resolvedQuarterCode: string,
    resolvedWeekNumber: number,
  ) {
    if (sessionRow?.phase3_pulse_check_id) {
      const { data } = await supabase
        .from("pulse_checks")
        .select("*")
        .eq("id", sessionRow.phase3_pulse_check_id)
        .maybeSingle()
      if (data) return data as Record<string, unknown>
    }
    const { data } = await supabase
      .from("pulse_checks")
      .select("*")
      .eq("user_id", userId)
      .eq("quarter_code", resolvedQuarterCode)
      .eq("week_number", resolvedWeekNumber)
      .maybeSingle()
    return (data as Record<string, unknown> | null) ?? null
  }

  async function fetchDeclarations() {
    const { data } = await supabase
      .from("declarations")
      .select("id, content, scripture_reference")
      .eq("user_id", userId)
      .eq("active", true)
      .order("display_order")
    return data ?? []
  }

  async function fetchLastWeekTimeAnalysis() {
    const { data } = await supabase
      .from("pulse_sessions")
      .select("phase4_time_analysis")
      .eq("user_id", userId)
      .lt("date", sessionDateStr)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.phase4_time_analysis ?? null
  }

  async function fetchNextWeekDailyFocus() {
    const { data } = await supabase
      .from("daily_focus")
      .select("*")
      .eq("user_id", userId)
      .in("date", nextWeekFocusDates)
    return data ?? []
  }

  try {
    const [
      sess,
      past,
      weekMatch,
      devotions,
      prayerSessions,
      downloads,
      declSummary,
      decls,
      lastTime,
      focusRows,
      py,
      qConfig,
      pulseChecksAll,
      archiveSessions,
    ] = await Promise.all([
      fetchTodaySession(),
      fetchPastSessions(),
      fetchSessionsForWeekMatching(),
      fetchWeekDevotions(),
      fetchWeekPrayerSessions(),
      fetchWeekDownloads(),
      fetchDeclarationLogsSummary(),
      fetchDeclarations(),
      fetchLastWeekTimeAnalysis(),
      fetchNextWeekDailyFocus(),
      fetchPersonalYears(),
      fetchQuarterConfig(),
      fetchAllPulseChecks(),
      fetchAllSessionsForArchive(),
    ])
    todaySession = sess
    pastSessions = past
    sessionsForWeekMatching = weekMatch
    weekDevotions = devotions
    weekPrayerSessions = prayerSessions
    weekDownloads = downloads
    declarationLogsSummary = declSummary
    declarations = decls
    lastWeekTimeAnalysis = lastTime
    nextWeekDailyFocus = focusRows as PulsePageData["nextWeekDailyFocus"]
    personalYears = py
    quarterConfigRows = qConfig
    allPulseChecks = pulseChecksAll
    allSessionsForArchive = archiveSessions
  } catch {
    // Tables may not exist
    personalYears = []
  }

  const activeQuarter = quarterConfigRows.find((q) => q.is_active) ?? null
  const quarterCtx = resolvePulseQuarterContext(
    sessionDateStr,
    activeQuarter,
    quarterConfigRows,
    options.preferActiveQuarter ?? false,
  )
  const weekNumber = quarterCtx.weekNumber
  const quarterCode = quarterCtx.quarterCode
  const quarter = {
    weekInQuarter: quarterCtx.weekNumber,
    phaseName: quarterCtx.quarterName,
  }
  const archivableQuarters = listArchivableQuarters(quarterConfigRows, allSessionsForArchive)
  const backfillCandidate = findBackfillCandidate(
    activeQuarter,
    allSessionsForArchive,
    allPulseChecks as { quarter_code: string | null; date: string }[],
  )

  try {
    thisWeekPulseCheck = await fetchPulseCheckForSession(todaySession, quarterCode, weekNumber)
  } catch {
    // pulse_checks may not exist
  }

  return {
    goals,
    todaySession,
    pastSessions,
    sessionsForWeekMatching,
    weekDevotions,
    weekPrayerSessions,
    weekDownloads,
    declarationLogsSummary,
    thisWeekPulseCheck,
    declarations,
    lastWeekTimeAnalysis,
    nextWeekFocusDates,
    nextWeekDailyFocus,
    quarter,
    weekNumber,
    quarterCode,
    quarterName: quarterCtx.quarterName,
    quarterSource: quarterCtx.source,
    quarterIsComplete: quarterCtx.isComplete,
    quarterStartDate: quarterCtx.startDate,
    quarterEndDate: quarterCtx.endDate,
    sevenDaysAgoStr,
    personalYears,
    quarterConfigRows,
    activeQuarter,
    archivableQuarters,
    allPulseChecks,
    backfillCandidate,
  }
}
