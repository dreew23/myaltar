import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getGoalsForUser } from "@/lib/data/user-config"
import { PulseClient } from "./pulse-client"
import { loadPulsePageData } from "@/lib/pulse-page-data"
import { toLocalISODate } from "@/lib/pulse-session-dates"

export const metadata = { title: "Sunday Pulse | ALTAR" }

export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const calendarTodayStr = toLocalISODate(new Date())
  const raw = params.date
  const sessionDateStr =
    raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : calendarTodayStr

  const goals = await getGoalsForUser(supabase, user.id)
  const data = await loadPulsePageData(supabase, user.id, sessionDateStr, goals)

  return (
    <PulseClient
      mode="create"
      calendarTodayStr={calendarTodayStr}
      sessionDateStr={sessionDateStr}
      userId={user.id}
      {...data}
    />
  )
}
