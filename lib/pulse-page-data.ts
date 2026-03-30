import type { SupabaseClient } from "@supabase/supabase-js"
import type { GoalConfig } from "@/lib/data/dominion"
import type { PulseSessionRow } from "@/lib/pulse"
import {
  getSevenDayWindow,
  getNextWeekFocusDatesFromSessionDate,
  getWeekNumberOfYear,
  getQuarterCodeForDate,
  getQuarterProgressForDate,
  toLocalISODate,
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
  sevenDaysAgoStr: string
}

export async function loadPulsePageData(
  supabase: SupabaseClient,
  userId: string,
  sessionDateStr: string,
  goals: GoalConfig[],
): Promise<PulsePageData> {
  const sessionDate = new Date(sessionDateStr + "T12:00:00")
  const weekNumber = getWeekNumberOfYear(sessionDate)
  const quarterCode = getQuarterCodeForDate(sessionDate)
  const quarter = getQuarterProgressForDate(sessionDate)
  const { startStr: sevenDaysAgoStr, endStr: windowEndStr } = getSevenDayWindow(sessionDateStr)
  const nextWeekFocusDates = getNextWeekFocusDatesFromSessionDate(sessionDateStr)

  const minHistory = new Date()
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
    const { data } = await supabase
      .from("divine_downloads")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgoStr + "T00:00:00")
      .lte("created_at", windowEndStr + "T23:59:59")
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

  async function fetchPulseCheckForSession(sessionRow: PulseSessionRow | null) {
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
      .eq("quarter_code", quarterCode)
      .eq("week_number", weekNumber)
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
    const [sess, past, weekMatch, devotions, prayerSessions, downloads, declSummary, decls, lastTime, focusRows] =
      await Promise.all([
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

    thisWeekPulseCheck = await fetchPulseCheckForSession(todaySession)
  } catch {
    // Tables may not exist
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
    sevenDaysAgoStr,
  }
}
