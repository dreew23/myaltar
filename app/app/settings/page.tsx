import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { PersonalYearConfigRow } from "@/lib/personal-year"
import SettingsClient from "./settings-client"
import { getQuarterProgress } from "@/lib/data/dominion"

export const metadata = {
  title: "Settings | ALTAR",
  description: "Manage your ALTAR account and preferences",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  let profileRes: { data: unknown } = { data: null }
  let quartersRes: { data: unknown[] } = { data: [] }
  let intercessionRes: { data: unknown[] } = { data: [] }
  let goalsRes: { data: unknown[] } = { data: [] }
  const defaultCount = { count: 0 }
  let devotionsCount = defaultCount
  let declarationsCount = defaultCount
  let declLogsCount = defaultCount
  let downloadsCount = defaultCount
  let sermonsCount = defaultCount
  let prayerSessionsCount = defaultCount
  let prayerRequestsCount = defaultCount
  let prayersCount = defaultCount
  let wisdomCount = defaultCount
  let pulseChecksCount = defaultCount
  let pulseSessionsCount = defaultCount
  let goalNotesCount = defaultCount
  let weeklyGoalsCount = defaultCount
  let personalYearsRes = { data: [] as PersonalYearConfigRow[] }

  try {
    const results = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("quarter_config").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      supabase.from("intercession_schedule").select("*").eq("user_id", user.id).order("day_of_week"),
      supabase.from("goals").select("*").eq("user_id", user.id).order("display_order"),
      supabase.from("daily_devotions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("declarations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("declaration_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("divine_downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("sermons").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("prayer_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("prayer_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("prayers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("wisdom_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("pulse_checks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("pulse_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("goal_notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("weekly_goals").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("personal_year_config").select("*").eq("user_id", user.id).order("year_number", { ascending: true }),
    ])
    profileRes = results[0] as { data: unknown }
    quartersRes = results[1] as { data: unknown[] }
    intercessionRes = results[2] as { data: unknown[] }
    goalsRes = results[3] as { data: unknown[] }
    devotionsCount = (results[4] as { count?: number }) ?? defaultCount
    declarationsCount = (results[5] as { count?: number }) ?? defaultCount
    declLogsCount = (results[6] as { count?: number }) ?? defaultCount
    downloadsCount = (results[7] as { count?: number }) ?? defaultCount
    sermonsCount = (results[8] as { count?: number }) ?? defaultCount
    prayerSessionsCount = (results[9] as { count?: number }) ?? defaultCount
    prayerRequestsCount = (results[10] as { count?: number }) ?? defaultCount
    prayersCount = (results[11] as { count?: number }) ?? defaultCount
    wisdomCount = (results[12] as { count?: number }) ?? defaultCount
    pulseChecksCount = (results[13] as { count?: number }) ?? defaultCount
    pulseSessionsCount = (results[14] as { count?: number }) ?? defaultCount
    goalNotesCount = (results[15] as { count?: number }) ?? defaultCount
    weeklyGoalsCount = (results[16] as { count?: number }) ?? defaultCount
    personalYearsRes = { data: ((results[17] as { data: PersonalYearConfigRow[] | null }).data ?? []) }
  } catch {
    // Tables may not exist yet (migrations not run). Use defaults above.
  }

  const quarter = getQuarterProgress()
  const now = new Date()
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
  const quarterStartStr = quarterStart.toISOString().split("T")[0]
  const quarterEndStr = quarterEnd.toISOString().split("T")[0]
  const quarterCode = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`

  const storageCounts: Record<string, number> = {
    daily_devotions: devotionsCount.count ?? 0,
    declarations: declarationsCount.count ?? 0,
    declaration_logs: declLogsCount.count ?? 0,
    divine_downloads: downloadsCount.count ?? 0,
    sermons: sermonsCount.count ?? 0,
    prayer_sessions: prayerSessionsCount.count ?? 0,
    prayer_requests: prayerRequestsCount.count ?? 0,
    prayers: prayersCount.count ?? 0,
    wisdom_entries: wisdomCount.count ?? 0,
    pulse_checks: pulseChecksCount.count ?? 0,
    pulse_sessions: pulseSessionsCount.count ?? 0,
    goal_notes: goalNotesCount.count ?? 0,
    weekly_goals: weeklyGoalsCount.count ?? 0,
  }

  const profile = profileRes.data
  const quarters = (quartersRes.data ?? []) as { id: string; code: string; name: string; start_date: string; end_date: string; year_number: number | null; is_active: boolean }[]
  const intercessionSchedule = (intercessionRes.data ?? []) as { day_of_week: number; theme: string; people: string[]; life_areas: string[] }[]
  const goals = (goalsRes.data ?? []) as { id: string; code: string; title: string; subtitle: string | null; description: string | null; pulse_question: string | null; pulse_type: string; db_field: string | null; kr_10x: string | null; kr_5x: string | null; kr_2x: string | null; not_now: string[]; icon_name: string | null; active: boolean; display_order: number | null }[]

  const intercessionRows = intercessionSchedule.length === 7
    ? intercessionSchedule
    : null

  const goalRows = goals.length > 0 ? goals.map((g) => ({
    id: g.id,
    code: g.code,
    title: g.title,
    subtitle: g.subtitle,
    description: g.description,
    pulse_question: g.pulse_question,
    pulse_type: g.pulse_type,
    db_field: g.db_field,
    kr_10x: g.kr_10x,
    kr_5x: g.kr_5x,
    kr_2x: g.kr_2x,
    not_now: g.not_now ?? [],
    icon_name: g.icon_name,
    active: g.active ?? true,
    display_order: g.display_order,
  })) : null

  const notificationPrefs = (profile as { notification_preferences?: unknown } | null)?.notification_preferences as Record<string, { enabled: boolean; time: string }> | null

  return (
    <SettingsClient
      user={user}
      profile={profile}
      personalYears={(personalYearsRes.data ?? []) as PersonalYearConfigRow[]}
      quarters={quarters}
      intercessionSchedule={intercessionRows}
      goals={goalRows}
      notificationPrefs={notificationPrefs}
      storageCounts={storageCounts}
      quarterStartStr={quarterStartStr}
      quarterEndStr={quarterEndStr}
      quarterCode={quarterCode}
    />
  )
}
