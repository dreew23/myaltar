import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { DailyFocusRow } from "@/lib/daily-focus-checklist"
import { localCalendarDateString } from "@/lib/prayer-week"
import { PrayerHistoryClient } from "./prayer-history-client"

export default async function PrayerHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: logs } = await supabase
    .from("daily_devotions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30)

  const min = new Date()
  min.setDate(min.getDate() - 45)
  const minStr = localCalendarDateString(min)

  const dailyFocusByDate: Record<string, DailyFocusRow> = {}
  try {
    const baseCols = "date, focus_1, focus_2, focus_3, goal_1, goal_2, goal_3"
    const withCompleted = `${baseCols}, focus_1_completed, focus_2_completed, focus_3_completed, goal_1_completed, goal_2_completed, goal_3_completed`
    const res = await supabase
      .from("daily_focus")
      .select(withCompleted)
      .eq("user_id", user.id)
      .gte("date", minStr)
      .order("date", { ascending: false })

    const assignRow = (date: string, row: DailyFocusRow) => {
      dailyFocusByDate[date] = row
    }

    if (res.error && /column|schema cache/i.test(res.error.message)) {
      const legacy = await supabase
        .from("daily_focus")
        .select(baseCols)
        .eq("user_id", user.id)
        .gte("date", minStr)
      for (const raw of legacy.data ?? []) {
        const r = raw as { date: string } & DailyFocusRow
        assignRow(r.date, {
          focus_1: r.focus_1,
          focus_2: r.focus_2,
          focus_3: r.focus_3,
          goal_1: r.goal_1,
          goal_2: r.goal_2,
          goal_3: r.goal_3,
          focus_1_completed: false,
          focus_2_completed: false,
          focus_3_completed: false,
          goal_1_completed: false,
          goal_2_completed: false,
          goal_3_completed: false,
        })
      }
    } else if (!res.error && res.data) {
      for (const raw of res.data) {
        const r = raw as { date: string } & DailyFocusRow
        const { date, ...rest } = r
        assignRow(date, rest as DailyFocusRow)
      }
    }
  } catch {
    // daily_focus may be missing in older DBs
  }

  return <PrayerHistoryClient logs={logs ?? []} dailyFocusByDate={dailyFocusByDate} />
}
