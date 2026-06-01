import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SacredFocusClient } from "./sacred-focus-client"

export const metadata = { title: "Sacred Focus | ALTAR" }

export default async function SacredFocusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch all data in parallel
  const [activitiesRes, entriesRes, subChallengesRes, logsRes, fruitsRes] = await Promise.all([
    supabase
      .from("spiritual_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("activity_sub_challenges")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("sub_challenge_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("activity_fruits")
      .select("*")
      .eq("user_id", user.id)
      .order("date_recorded", { ascending: false }),
  ])

  return (
    <SacredFocusClient
      activities={activitiesRes.data ?? []}
      entries={entriesRes.data ?? []}
      subChallenges={subChallengesRes.data ?? []}
      subChallengeLogs={logsRes.data ?? []}
      fruits={fruitsRes.data ?? []}
      userId={user.id}
    />
  )
}
