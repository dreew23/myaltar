import { createClient } from "@/lib/supabase/server"
import { getGoalsForUser } from "@/lib/data/user-config"
import { GoalsClient } from "./goals-client"
import { getQuarterProgress } from "@/lib/data/dominion"

export const metadata = { title: "Spiritual Goals | ALTAR" }

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const goals = await getGoalsForUser(supabase, user.id)

  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3) + 1
  const quarterCode = `${now.getFullYear()}-Q${quarter}`
  const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
  const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0)
  const quarterStartStr = quarterStart.toISOString().split("T")[0]
  const quarterEndStr = quarterEnd.toISOString().split("T")[0]

  const yearStartStr = `${now.getFullYear()}-01-01`
  const todayStr = now.toISOString().split("T")[0]

  let pulseChecksRes = { data: [] as Record<string, unknown>[] }
  let goalNotesRes = { data: [] as Record<string, unknown>[] }
  let devotionsRes = { data: [] as Record<string, unknown>[] }
  let pulseSessionsRes = { data: [] as { id: string; date: string; phases_completed: string[] | null }[] }
  let wisdomTestimonyRes = { data: [] as { id: string }[] }
  let prayerAnsweredRes = { data: [] as { id: string }[] }
  let yearWisdomRes = { data: [] as { id: string }[] }
  let yearTestimonyRes = { data: [] as { id: string }[] }
  let yearPrayerAnsweredRes = { data: [] as { id: string }[] }
  let yearPrayerSessionsRes = { data: [] as { id: string }[] }
  let yearDeclarationLogsRes = { data: [] as { current_count: number | null }[] }

  try {
    const [
      pc,
      gn,
      dv,
      ps,
      wt,
      pa,
      yw,
      yt,
      ypa,
      yps,
      ydl,
    ] = await Promise.all([
    supabase
      .from("pulse_checks")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", quarterStartStr)
      .lte("date", quarterEndStr)
      .order("date", { ascending: true }),
    supabase.from("goal_notes").select("*").eq("user_id", user.id),
    supabase
      .from("daily_devotions")
      .select("date, prayer_complete, sermons_today, energy_score")
      .eq("user_id", user.id)
      .gte("date", quarterStartStr)
      .lte("date", quarterEndStr),
    supabase
      .from("pulse_sessions")
      .select("id, date, phases_completed")
      .eq("user_id", user.id)
      .gte("date", quarterStartStr)
      .lte("date", quarterEndStr),
    supabase
      .from("wisdom_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("entry_type", "testimony")
      .gte("date", quarterStartStr)
      .lte("date", quarterEndStr),
    supabase
      .from("prayer_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "answered")
      .gte("date_answered", quarterStartStr)
      .lte("date_answered", quarterEndStr),
    supabase
      .from("wisdom_entries")
      .select("id")
      .eq("user_id", user.id)
      .gte("date", yearStartStr)
      .lte("date", todayStr),
    supabase
      .from("wisdom_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("entry_type", "testimony")
      .gte("date", yearStartStr)
      .lte("date", todayStr),
    supabase
      .from("prayer_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "answered")
      .gte("date_answered", yearStartStr)
      .lte("date_answered", todayStr),
    supabase
      .from("prayer_sessions")
      .select("id")
      .eq("user_id", user.id)
      .gte("date", yearStartStr)
      .lte("date", todayStr),
    supabase
      .from("declaration_logs")
      .select("current_count")
      .eq("user_id", user.id)
      .gte("date", yearStartStr)
      .lte("date", todayStr),
  ])
    pulseChecksRes = pc
    goalNotesRes = gn
    devotionsRes = dv
    pulseSessionsRes = ps
    wisdomTestimonyRes = wt
    prayerAnsweredRes = pa
    yearWisdomRes = yw
    yearTestimonyRes = yt
    yearPrayerAnsweredRes = ypa
    yearPrayerSessionsRes = yps
    yearDeclarationLogsRes = ydl
  } catch (e) {
    console.error("[goals] Fetch error:", e)
  }

  const quarterConfig = getQuarterProgress()
  const pulseChecks = pulseChecksRes.data ?? []
  const goalNotes = goalNotesRes.data ?? []
  const devotions = devotionsRes.data ?? []
  const pulseSessions = pulseSessionsRes.data ?? []
  const seasonFruits =
    (wisdomTestimonyRes.data?.length ?? 0) +
    (prayerAnsweredRes.data?.length ?? 0)
  const pulseConsistencyDenom = Math.min(quarterConfig.weekInQuarter, quarterConfig.totalWeeks)
  const pulseConsistencyNum = pulseSessions.filter((s) => (s.phases_completed ?? []).length >= 3).length

  const yearFruits = {
    testimonies: yearTestimonyRes.data?.length ?? 0,
    answeredPrayers: yearPrayerAnsweredRes.data?.length ?? 0,
    wisdomEntries: yearWisdomRes.data?.length ?? 0,
    prayerSessions: yearPrayerSessionsRes.data?.length ?? 0,
    declarationsSpoken: (yearDeclarationLogsRes.data ?? []).reduce((sum, r) => sum + (Number(r.current_count) || 0), 0),
  }

  return (
    <GoalsClient
      goals={goals}
      pulseChecks={pulseChecks}
      goalNotes={goalNotes}
      devotions={devotions}
      quarterConfig={quarterConfig}
      quarterCode={quarterCode}
      quarterStartStr={quarterStartStr}
      quarterEndStr={quarterEndStr}
      seasonFruits={seasonFruits}
      pulseConsistency={{ completed: pulseConsistencyNum, total: pulseConsistencyDenom }}
      yearFruits={yearFruits}
      userId={user.id}
    />
  )
}
