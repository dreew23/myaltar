import { createClient } from "@/lib/supabase/server"
import { getTodayIntercessionForUser } from "@/lib/data/user-config"
import { PrayerClient } from "./prayer-client"

export const metadata = { title: "Prayer | ALTAR" }

export default async function PrayerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const todayIntercession = await getTodayIntercessionForUser(supabase, user.id)
  const todayStr = new Date().toISOString().split("T")[0]

  let sessionsRes = { data: [] as unknown[], error: null }
  let todaySessionRes = { data: null as unknown, error: null }
  let savedPrayersRes = { data: [] as unknown[] }
  let warfareRes = { data: [] as unknown[] }
  let requestsRes = { data: [] as unknown[] }
  let declarationsRes = { data: [] as unknown[] }
  let declarationLogsRes = { data: [] as unknown[] }
  let todayDevotionRes = { data: null as { prayer_complete?: boolean } | null }

  try {
    const [
      s,
      t,
      sp,
      w,
      r,
      d,
      dl,
      td,
    ] = await Promise.all([
    supabase
      .from("prayer_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(60),
    supabase
      .from("prayer_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .maybeSingle(),
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
      .eq("date", todayStr),
    supabase
      .from("daily_devotions")
      .select("prayer_complete")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .maybeSingle(),
  ])
    sessionsRes = s
    todaySessionRes = t
    savedPrayersRes = sp
    warfareRes = w
    requestsRes = r
    declarationsRes = d
    declarationLogsRes = dl
    todayDevotionRes = td
  } catch {
    // Tables may not exist yet — run supabase/migrations/20250315_prayer_tables.sql
  }

  let activities: { id: string; title: string; [key: string]: unknown }[] = []
  try {
    const { data } = await supabase
      .from("spiritual_activities")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("active", true)
    activities = data ?? []
  } catch {
    // Table may not exist
  }

  return (
    <PrayerClient
      sessions={sessionsRes.data ?? []}
      todaySession={todaySessionRes.data ?? null}
      savedPrayers={savedPrayersRes.data ?? []}
      warfareScriptures={warfareRes.data ?? []}
      prayerRequests={requestsRes.data ?? []}
      declarations={declarationsRes.data ?? []}
      todayDeclarationLogs={declarationLogsRes.data ?? []}
      todayPrayerComplete={todayDevotionRes.data?.prayer_complete ?? false}
      activities={activities}
      userId={user.id}
      todayIntercession={todayIntercession}
    />
  )
}
