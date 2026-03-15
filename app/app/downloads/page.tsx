import { createClient } from "@/lib/supabase/server"
import { DownloadsClient } from "./downloads-client"

export const metadata = { title: "Divine Downloads | ALTAR" }

export default async function DownloadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [downloadsRes, insightsRes, sermonsRes] = await Promise.all([
    supabase
      .from("divine_downloads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("spiritual_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("sermons")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  return (
    <DownloadsClient
      downloads={downloadsRes.data ?? []}
      insights={insightsRes.data ?? []}
      recentSermons={sermonsRes.data ?? []}
      userId={user.id}
    />
  )
}
