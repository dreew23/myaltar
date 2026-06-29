import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getGoalsForUser, getPrimaryCalendarLens } from "@/lib/data/user-config"
import { PulseClient } from "../../pulse-client"
import { loadPulsePageData } from "@/lib/pulse-page-data"
import { toLocalISODate } from "@/lib/pulse-session-dates"
import type { PulseSessionRow } from "@/lib/pulse"

export const metadata = { title: "Planning Session | ALTAR" }

export default async function PulseSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: row, error } = await supabase
    .from("pulse_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !row) notFound()
  const sessionRow = row as PulseSessionRow

  const calendarTodayStr = toLocalISODate(new Date())
  const goals = await getGoalsForUser(supabase, user.id)
  const [data, primaryCalendarLens] = await Promise.all([
    loadPulsePageData(supabase, user.id, sessionRow.date, goals),
    getPrimaryCalendarLens(supabase, user.id),
  ])

  return (
    <PulseClient
      mode="edit"
      editSessionId={id}
      calendarTodayStr={calendarTodayStr}
      sessionDateStr={sessionRow.date}
      userId={user.id}
      primaryCalendarLens={primaryCalendarLens}
      {...data}
      todaySession={sessionRow}
    />
  )
}
