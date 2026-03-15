import { createClient } from "@/lib/supabase/server"
import { PrayerHistoryClient } from "./prayer-history-client"

export default async function PrayerHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: logs } = await supabase
    .from("daily_devotions")
    .select("*")
    .eq("user_id", user!.id)
    .order("date", { ascending: false })
    .limit(30)

  return <PrayerHistoryClient logs={logs ?? []} />
}
