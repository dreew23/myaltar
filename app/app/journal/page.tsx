import { createClient } from "@/lib/supabase/server"
import { JournalClient } from "./journal-client"

export const metadata = { title: "Wisdom Log | ALTAR" }

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let wisdomRes = { data: null as unknown[], error: { message: "" } }
  let decisionsRes = { data: null as unknown[], error: { message: "" } }
  try {
    const [w, d] = await Promise.all([
      supabase
        .from("wisdom_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("aligned_decisions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ])
    wisdomRes = w
    decisionsRes = d
  } catch {
    // Tables may not exist yet — run supabase/migrations/20250314_wisdom_entries_and_aligned_decisions.sql
  }

  // Optional: fetch spiritual_activities for "Connected Activity" dropdown (if table exists)
  let activities: { id: string; title: string }[] = []
  try {
    const { data } = await supabase
      .from("spiritual_activities")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
    activities = data ?? []
  } catch {
    // Table may not exist
  }

  return (
    <JournalClient
      initialEntries={wisdomRes.data ?? []}
      initialDecisions={decisionsRes.data ?? []}
      activities={activities}
      userId={user.id}
    />
  )
}
