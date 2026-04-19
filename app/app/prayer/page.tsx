import { redirect } from "next/navigation"
import type { PostgrestError } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { getTodayIntercessionForUser } from "@/lib/data/user-config"
import { localCalendarDateString, mondayDateString } from "@/lib/prayer-week"
import { PrayerClient } from "./prayer-client"
import type { IntercessionDayRow } from "@/components/app/settings/intercession-editor"
import type {
  PrayerChallengeRow,
  PrayerSession,
  SavedPrayer,
  WarfareScripture,
  PrayerRequest,
} from "@/lib/prayer"
import type { Declaration, DeclarationLog } from "@/components/app/declarations/types"

export const metadata = { title: "Prayer | ALTAR" }

export default async function PrayerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const todayIntercession = await getTodayIntercessionForUser(supabase, user.id)

  // Recent declaration logs (client filters to local "today"; avoids UTC vs local mismatch).
  const since = new Date()
  since.setDate(since.getDate() - 60)
  const declarationLogsSince = localCalendarDateString(since)

  let sessionsRes = { data: [] as PrayerSession[], error: null as PostgrestError | null }
  let savedPrayersRes = { data: [] as SavedPrayer[] }
  let warfareRes = { data: [] as WarfareScripture[] }
  let requestsRes = { data: [] as PrayerRequest[] }
  let declarationsRes = { data: [] as Declaration[] }
  let declarationLogsRes = { data: [] as DeclarationLog[] }
  let intercessionScheduleRows: IntercessionDayRow[] | null = null
  let challengesList: PrayerChallengeRow[] = []
  let prayEventsList: { request_id: string; prayed_date: string }[] = []

  try {
    const [s, sp, w, r, d, dl] = await Promise.all([
      supabase
        .from("prayer_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(60),
      supabase
        .from("saved_prayers")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("warfare_scriptures")
        .select("*")
        .eq("user_id", user.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("prayer_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("declarations")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("declaration_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", declarationLogsSince),
    ])
    sessionsRes = { data: (s.data ?? []) as PrayerSession[], error: s.error }
    savedPrayersRes = { data: (sp.data ?? []) as SavedPrayer[] }
    warfareRes = { data: (w.data ?? []) as WarfareScripture[] }
    requestsRes = { data: (r.data ?? []) as PrayerRequest[] }
    declarationsRes = { data: (d.data ?? []) as Declaration[] }
    declarationLogsRes = { data: (dl.data ?? []) as DeclarationLog[] }
  } catch {
    // Core prayer tables missing
  }

  try {
    const { data: sched } = await supabase
      .from("intercession_schedule")
      .select("day_of_week, theme, people, life_areas")
      .eq("user_id", user.id)
      .order("day_of_week")
    const rows = sched as IntercessionDayRow[] | null
    intercessionScheduleRows = rows && rows.length === 7 ? rows : null
  } catch {
    /* optional */
  }

  try {
    const { data: ch } = await supabase.from("prayer_challenges").select("*").eq("user_id", user.id).order("display_order")
    challengesList = (ch ?? []) as PrayerChallengeRow[]
  } catch {
    /* optional */
  }

  try {
    const { data: pe } = await supabase
      .from("prayer_request_pray_events")
      .select("request_id, prayed_date")
      .eq("user_id", user.id)
    prayEventsList = (pe ?? []) as { request_id: string; prayed_date: string }[]
  } catch {
    /* optional */
  }

  if (challengesList.length === 0) {
    try {
      const mon = mondayDateString()
      await supabase.from("prayer_challenges").insert([
        {
          user_id: user.id,
          label: "Communion",
          daily_target: 3,
          unit: "times",
          weekly_progress: 0,
          week_start_monday: mon,
        },
        {
          user_id: user.id,
          label: "Tongues",
          daily_target: 60,
          unit: "min",
          weekly_progress: 0,
          week_start_monday: mon,
        },
      ])
      const { data: ch2 } = await supabase.from("prayer_challenges").select("*").eq("user_id", user.id)
      challengesList = (ch2 ?? []) as PrayerChallengeRow[]
    } catch {
      /* table missing */
    }
  }

  const scheduleComplete = (intercessionScheduleRows?.length ?? 0) === 7

  return (
    <PrayerClient
      sessions={sessionsRes.data ?? []}
      savedPrayers={savedPrayersRes.data ?? []}
      warfareScriptures={warfareRes.data ?? []}
      prayerRequests={requestsRes.data ?? []}
      prayEvents={prayEventsList}
      declarations={declarationsRes.data ?? []}
      todayDeclarationLogs={declarationLogsRes.data ?? []}
      userId={user.id}
      todayIntercession={todayIntercession}
      intercessionSchedule={intercessionScheduleRows}
      scheduleComplete={scheduleComplete}
      challenges={challengesList}
    />
  )
}
