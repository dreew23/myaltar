import { createClient } from "@/lib/supabase/server"
import { getGoalsForUser } from "@/lib/data/user-config"
import { PulseClient } from "./pulse-client"
import { getQuarterProgress } from "@/lib/data/dominion"

export const metadata = { title: "Sunday Pulse | ALTAR" }

/** Monday as start of week */
function getWeekStartMonday(d: Date): Date {
  const x = new Date(d)
  const day = d.getDay()
  const daysBack = day === 0 ? 6 : day - 1
  x.setDate(d.getDate() - daysBack)
  return x
}

export default async function PulsePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const goals = await getGoalsForUser(supabase, user.id)
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const weekStart = getWeekStartMonday(today)
  const weekStartStr = weekStart.toISOString().split("T")[0]
  const quarter = getQuarterProgress()
  const weekNumber = Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 / 7)
  const quarterCode = `${today.getFullYear()}-Q${Math.floor(today.getMonth() / 3) + 1}`

  // Last 7 days for Phase 2 audit (including today)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

  let todaySession: Awaited<ReturnType<typeof fetchTodaySession>> = null
  let pastSessions: Awaited<ReturnType<typeof fetchPastSessions>> = []
  let weekDevotions: Awaited<ReturnType<typeof fetchWeekDevotions>> = []
  let weekPrayerSessions: Awaited<ReturnType<typeof fetchWeekPrayerSessions>> = []
  let weekDownloads: Awaited<ReturnType<typeof fetchWeekDownloads>> = []
  let declarationLogsSummary: Awaited<ReturnType<typeof fetchDeclarationLogsSummary>> = { daysAllMet: 0, totalDays: 7 }
  let thisWeekPulseCheck: Awaited<ReturnType<typeof fetchThisWeekPulseCheck>> = null
  let declarations: Awaited<ReturnType<typeof fetchDeclarations>> = []
  let lastWeekTimeAnalysis: string | null = null
  const nextWeekFocusDates = (() => {
    const nextMon = new Date(weekStart)
    nextMon.setDate(weekStart.getDate() + 7)
    const out: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(nextMon)
      d.setDate(nextMon.getDate() + i)
      out.push(d.toISOString().split("T")[0])
    }
    return out
  })()
  let nextWeekDailyFocus: Awaited<ReturnType<typeof fetchNextWeekDailyFocus>> = []

  async function fetchTodaySession() {
    const { data } = await supabase
      .from("pulse_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .maybeSingle()
    return data
  }

  async function fetchPastSessions() {
    const { data } = await supabase
      .from("pulse_sessions")
      .select("*")
      .eq("user_id", user.id)
      .lt("date", todayStr)
      .order("date", { ascending: false })
      .limit(20)
    return data ?? []
  }

  async function fetchWeekDevotions() {
    const { data } = await supabase
      .from("daily_devotions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgoStr)
      .lte("date", todayStr)
      .order("date", { ascending: true })
    return data ?? []
  }

  async function fetchWeekPrayerSessions() {
    const { data } = await supabase
      .from("prayer_sessions")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgoStr)
      .lte("date", todayStr)
    return data ?? []
  }

  async function fetchWeekDownloads() {
    const { data } = await supabase
      .from("divine_downloads")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgoStr + "T00:00:00")
      .lte("created_at", todayStr + "T23:59:59")
      .order("created_at", { ascending: false })
    return data ?? []
  }

  async function fetchDeclarationLogsSummary() {
    const { data: logs } = await supabase
      .from("declaration_logs")
      .select("date, completed")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgoStr)
      .lte("date", todayStr)
    if (!logs?.length) return { daysAllMet: 0, totalDays: 7 }
    const byDate = new Map<string, boolean>()
    for (const l of logs) {
      const current = byDate.get(l.date)
      byDate.set(l.date, current === undefined ? l.completed : current && l.completed)
    }
    const daysAllMet = Array.from(byDate.values()).filter(Boolean).length
    return { daysAllMet, totalDays: Math.min(7, byDate.size + (7 - byDate.size)) }
  }

  async function fetchThisWeekPulseCheck() {
    const { data } = await supabase
      .from("pulse_checks")
      .select("*")
      .eq("user_id", user.id)
      .eq("quarter_code", `${today.getFullYear()}-Q${Math.floor(today.getMonth() / 3) + 1}`)
      .eq("week_number", weekNumber)
      .maybeSingle()
    return data
  }

  async function fetchDeclarations() {
    const { data } = await supabase
      .from("declarations")
      .select("id, content, scripture_reference")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("display_order")
    return data ?? []
  }

  async function fetchLastWeekTimeAnalysis() {
    const lastMonday = new Date(weekStart)
    lastMonday.setDate(weekStart.getDate() - 7)
    const { data } = await supabase
      .from("pulse_sessions")
      .select("phase4_time_analysis")
      .eq("user_id", user.id)
      .eq("date", lastMonday.toISOString().split("T")[0])
      .maybeSingle()
    return data?.phase4_time_analysis ?? null
  }

  async function fetchNextWeekDailyFocus() {
    const { data } = await supabase
      .from("daily_focus")
      .select("*")
      .eq("user_id", user.id)
      .in("date", nextWeekFocusDates)
    return data ?? []
  }

  try {
    const [
      session,
      past,
      devotions,
      prayerSessions,
      downloads,
      declSummary,
      pulseCheck,
      decls,
      lastTime,
      focusRows,
    ] = await Promise.all([
      fetchTodaySession(),
      fetchPastSessions(),
      fetchWeekDevotions(),
      fetchWeekPrayerSessions(),
      fetchWeekDownloads(),
      fetchDeclarationLogsSummary(),
      fetchThisWeekPulseCheck(),
      fetchDeclarations(),
      fetchLastWeekTimeAnalysis(),
      fetchNextWeekDailyFocus(),
    ])
    todaySession = session
    pastSessions = past
    weekDevotions = devotions
    weekPrayerSessions = prayerSessions
    weekDownloads = downloads
    declarationLogsSummary = declSummary
    thisWeekPulseCheck = pulseCheck
    declarations = decls
    lastWeekTimeAnalysis = lastTime
    nextWeekDailyFocus = focusRows
  } catch {
    // Tables may not exist
  }

  return (
    <PulseClient
      goals={goals}
      userId={user.id}
      todaySession={todaySession}
      pastSessions={pastSessions}
      weekDevotions={weekDevotions}
      weekPrayerSessions={weekPrayerSessions}
      weekDownloads={weekDownloads}
      declarationLogsSummary={declarationLogsSummary}
      thisWeekPulseCheck={thisWeekPulseCheck}
      declarations={declarations}
      lastWeekTimeAnalysis={lastWeekTimeAnalysis}
      nextWeekFocusDates={nextWeekFocusDates}
      nextWeekDailyFocus={nextWeekDailyFocus}
      quarter={quarter}
      weekNumber={weekNumber}
      quarterCode={quarterCode}
      todayStr={todayStr}
      weekStartStr={weekStartStr}
      sevenDaysAgoStr={sevenDaysAgoStr}
    />
  )
}
