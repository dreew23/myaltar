import { createClient } from "@/lib/supabase/server"
import { getTodayIntercessionForUser } from "@/lib/data/user-config"
import { PrayersClient } from "./prayers-client"

export default async function PrayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let prayers: unknown[] = []
  try {
    const { data } = await supabase
      .from("prayers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    prayers = data ?? []
  } catch (e) {
    console.error("[prayers] Fetch error:", e)
  }

  const todayIntercession = await getTodayIntercessionForUser(supabase, user.id)
  return <PrayersClient prayers={prayers} userId={user.id} todayIntercession={todayIntercession} />
}
