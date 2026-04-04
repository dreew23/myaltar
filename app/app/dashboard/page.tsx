import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTodayIntercessionForUser } from "@/lib/data/user-config"
import type { PersonalYearConfigRow } from "@/lib/personal-year"
import { DashboardClient } from "./dashboard-client"

export const metadata = { title: "DOMINION | ALTAR" }

function safeTodayLog(raw: Record<string, unknown> | null) {
  if (!raw) return null
  const items = raw.gratitude_items
  return {
    prayer_complete: Boolean(raw.prayer_complete),
    declarations_complete: Boolean(raw.declarations_complete),
    gratitude_complete: Boolean(raw.gratitude_complete),
    sermons_today: typeof raw.sermons_today === "number" ? raw.sermons_today : 0,
    energy_score: typeof raw.energy_score === "number" ? raw.energy_score : 5,
    gratitude_items: Array.isArray(items) ? items.map((x) => String(x)) : ["", "", ""],
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const todayIntercession = await getTodayIntercessionForUser(supabase, user.id)

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  
  // Get start of week (Monday)
  const startOfWeek = new Date(today)
  const day = today.getDay()
  const daysBack = day === 0 ? 6 : day - 1
  startOfWeek.setDate(today.getDate() - daysBack)
  const startOfWeekStr = startOfWeek.toISOString().split("T")[0]
  
  // Get start of month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]

  let devotionsRes = { data: [] as { date: string; prayer_complete?: boolean }[] }
  let downloadsRes = { data: [] as { id: string }[] }
  let sermonsRes = { data: [] as { sermons_today?: number }[] }
  let todayLogRes = { data: null as Record<string, unknown> | null }
  let weeklyPrincipleRes = { data: null as { weekly_principle?: string | null } | null }
  let todayPrayerSessionRes = { data: null as { id: string; duration_minutes?: number | null; end_time: string | null } | null }
  let todayPulseSessionRes = {
    data: null as {
      id: string
      started_at: string | null
      completed_at: string | null
      phases_completed: string[] | null
      total_duration_minutes: number | null
      session_quality: number | null
    } | null,
  }
  let weeklyGoalsRes = { data: null as { id: string; week_start_date: string; goal_1_text: string | null; goal_1_code: string | null; goal_1_completed: boolean; goal_2_text: string | null; goal_2_code: string | null; goal_2_completed: boolean; goal_3_text: string | null; goal_3_code: string | null; goal_3_completed: boolean } | null }
  let personalYearsRes = { data: [] as Record<string, unknown>[] }

  try {
    const [dev, dl, sem, today, weekly, prayerSession, pulseSession, weeklyGoals, personalYears] = await Promise.all([
      supabase
        .from("daily_devotions")
        .select("date, prayer_complete")
        .eq("user_id", user.id)
        .gte("date", startOfWeekStr)
        .lte("date", todayStr),
      supabase
        .from("divine_downloads")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth + "T00:00:00"),
      supabase
        .from("daily_devotions")
        .select("sermons_today")
        .eq("user_id", user.id)
        .gte("date", startOfWeekStr)
        .lte("date", todayStr),
      supabase
        .from("daily_devotions")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("weekly_principle")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("prayer_sessions")
        .select("id, duration_minutes, end_time")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .maybeSingle(),
      supabase
        .from("pulse_sessions")
        .select("id, started_at, completed_at, phases_completed, total_duration_minutes, session_quality")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .maybeSingle(),
      supabase
        .from("weekly_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start_date", startOfWeekStr)
        .maybeSingle(),
      supabase
        .from("personal_year_config")
        .select("*")
        .eq("user_id", user.id)
        .order("year_number", { ascending: true }),
    ])
    devotionsRes = dev
    downloadsRes = dl
    sermonsRes = sem
    todayLogRes = today
    weeklyPrincipleRes = weekly
    todayPrayerSessionRes = prayerSession
    todayPulseSessionRes = pulseSession
    weeklyGoalsRes = weeklyGoals
    personalYearsRes = { data: personalYears.data ?? [] }
  } catch {
    // Tables may not exist; dashboard still renders with zeros
  }

  const prayerStreak = devotionsRes.data?.filter((d) => d.prayer_complete).length ?? 0
  const divineDownloads = downloadsRes.data?.length ?? 0
  const sermonsThisWeek = sermonsRes.data?.reduce((sum, d) => sum + (d.sermons_today || 0), 0) ?? 0
  const dominionScore = Math.min(10, Math.round((prayerStreak / 7) * 5 + (sermonsThisWeek / 5) * 5))
  const todayPrayerSession = todayPrayerSessionRes.data ?? null
  const todayPulseSession = todayPulseSessionRes.data ?? null

  let weeklySermonsList: { id: string; sermon_id: string; title: string; listened: boolean; is_weekly_principle: boolean; mastery_key_principle: string | null }[] = []
  try {
    const { data: ws } = await supabase
      .from("weekly_sermons")
      .select("id, sermon_id, listened, is_weekly_principle")
      .eq("user_id", user.id)
      .eq("week_start_date", startOfWeekStr)
      .order("display_order")
    if (ws?.length) {
      const sermonIds = [...new Set(ws.map((r) => r.sermon_id))]
      const { data: sRows } = await supabase.from("sermons").select("id, title, mastery_key_principle").in("id", sermonIds)
      const sermonMap = new Map((sRows ?? []).map((s: { id: string; title: string; mastery_key_principle: string | null }) => [s.id, s]))
      weeklySermonsList = ws.map((r) => {
        const s = sermonMap.get(r.sermon_id) as { title: string; mastery_key_principle: string | null } | undefined
        return {
          id: r.id,
          sermon_id: r.sermon_id,
          title: s?.title ?? "",
          listened: r.listened ?? false,
          is_weekly_principle: r.is_weekly_principle ?? false,
          mastery_key_principle: s?.mastery_key_principle ?? null,
        }
      })
    }
  } catch {
    // weekly_sermons may not exist
  }

  const weeklyPrincipleRow = weeklySermonsList.find((w) => w.is_weekly_principle)
  const weeklyPrincipleText = weeklyPrincipleRow?.mastery_key_principle ?? weeklyPrincipleRes.data?.weekly_principle ?? null
  const weeklyPrincipleTitle = weeklyPrincipleRow?.title ?? null

  // If no weekly_goals row for this week, use goals from the Sunday Planning session that planned this week
  let weeklyGoalsForDisplay = weeklyGoalsRes.data
  if (!weeklyGoalsForDisplay) {
    try {
      const [y, mo, d] = startOfWeekStr.split("-").map(Number)
      const thisMonday = new Date(y, mo - 1, d)
      // Session that planned for this week: date in [thisMonday-14, thisMonday-1] to catch older sessions
      const fromDate = new Date(thisMonday)
      fromDate.setDate(fromDate.getDate() - 14)
      const toDate = new Date(thisMonday)
      toDate.setDate(toDate.getDate() - 1)
      const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`
      const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`
      const { data: sessions } = await supabase
        .from("pulse_sessions")
        .select("date, phase5_next_week_focus")
        .eq("user_id", user.id)
        .gte("date", fromStr)
        .lte("date", toStr)
        .not("completed_at", "is", null)
        .order("date", { ascending: false })
      // Planned week start from session.date (Monday after session) must equal startOfWeekStr; take most recent match
      const getPlannedMonday = (dateStr: string) => {
        const [yy, mm, dd] = dateStr.split("-").map(Number)
        const sd = new Date(yy, mm - 1, dd)
        const day = sd.getDay()
        const add = day === 0 ? 1 : day === 1 ? 7 : 8 - day
        sd.setDate(sd.getDate() + add)
        return `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}-${String(sd.getDate()).padStart(2, "0")}`
      }
      const sessionForWeek = (sessions as { date: string; phase5_next_week_focus?: string[] | string | null }[] | null)?.find(
        (s) => getPlannedMonday(s.date) === startOfWeekStr
      )
      const rawFocus = sessionForWeek?.phase5_next_week_focus
      const focus: string[] = Array.isArray(rawFocus)
        ? rawFocus
        : typeof rawFocus === "string"
          ? (() => {
              try {
                const parsed = JSON.parse(rawFocus) as unknown
                return Array.isArray(parsed) ? (parsed as string[]) : []
              } catch {
                return []
              }
            })()
          : []
      if (focus.length > 0) {
        weeklyGoalsForDisplay = {
          id: "",
          week_start_date: startOfWeekStr,
          goal_1_text: focus[0]?.trim() || null,
          goal_1_code: null,
          goal_1_completed: false,
          goal_2_text: focus[1]?.trim() || null,
          goal_2_code: null,
          goal_2_completed: false,
          goal_3_text: focus[2]?.trim() || null,
          goal_3_code: null,
          goal_3_completed: false,
        }
        // Backfill weekly_goals so the row exists and dashboard can persist edits
        await supabase.from("weekly_goals").upsert(
          {
            user_id: user.id,
            week_start_date: startOfWeekStr,
            goal_1_text: weeklyGoalsForDisplay.goal_1_text,
            goal_1_code: null,
            goal_1_completed: false,
            goal_2_text: weeklyGoalsForDisplay.goal_2_text,
            goal_2_code: null,
            goal_2_completed: false,
            goal_3_text: weeklyGoalsForDisplay.goal_3_text,
            goal_3_code: null,
            goal_3_completed: false,
          },
          { onConflict: "user_id,week_start_date" }
        )
      }
    } catch {
      // ignore
    }
  }

  const safeIntercession = {
    theme: todayIntercession?.theme ?? "Today",
    focus: Array.isArray(todayIntercession?.focus) ? todayIntercession.focus : [],
  }

  return (
    <DashboardClient
      prayerStreak={prayerStreak}
      divineDownloads={divineDownloads}
      sermonsThisWeek={sermonsThisWeek}
      dominionScore={dominionScore}
      todayLog={safeTodayLog(todayLogRes.data as Record<string, unknown> | null)}
      todayPrayerSession={todayPrayerSession}
      todayPulseSession={todayPulseSession}
      userId={user.id}
      weeklySermonPrinciple={weeklyPrincipleText}
      weeklyPrincipleSermonTitle={weeklyPrincipleTitle}
      weeklySermonsList={weeklySermonsList}
      weeklyGoals={weeklyGoalsForDisplay}
      weekStartStr={startOfWeekStr}
      todayIntercession={safeIntercession}
      personalYears={(personalYearsRes.data ?? []) as PersonalYearConfigRow[]}
    />
  )
}
