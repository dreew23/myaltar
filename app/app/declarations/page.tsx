import { createClient } from "@/lib/supabase/server"
import { localCalendarDateString } from "@/lib/prayer-week"
import { DeclarationsClient } from "./declarations-client"

export const metadata = { title: "Declarations | ALTAR" }

export default async function DeclarationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = localCalendarDateString()

  const [declRes, logsRes] = await Promise.all([
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
      .eq("date", today),
  ])

  return (
    <DeclarationsClient
      declarations={declRes.data ?? []}
      todayLogs={logsRes.data ?? []}
      userId={user.id}
    />
  )
}
