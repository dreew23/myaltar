import { createClient } from "@/lib/supabase/server"
import { SermonsClient } from "./sermons-client"

export const metadata = { title: "Sermon Library | ALTAR" }

/** Monday as start of week (e.g. Mar 16 - Mar 22) */
function getWeekStartMonday(d: Date): string {
  const x = new Date(d)
  const day = x.getDay()
  const daysBack = day === 0 ? 6 : day - 1
  x.setDate(x.getDate() - daysBack)
  return x.toISOString().split("T")[0]
}

export default async function SermonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const weekStartStr = getWeekStartMonday(new Date())

  const { data: sermons } = await supabase
    .from("sermons")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  let weeklySermons: { id: string; sermon_id: string; week_start_date: string; display_order: number; listened: boolean; listened_date: string | null; notes: string | null; is_weekly_principle: boolean; title: string; speaker: string; category: string; mastery_key_principle: string | null }[] = []
  try {
    const { data: ws } = await supabase
      .from("weekly_sermons")
      .select("id, sermon_id, week_start_date, display_order, listened, listened_date, notes, is_weekly_principle")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStartStr)
      .order("display_order")
    if (ws?.length) {
      const sermonIds = [...new Set(ws.map((r) => r.sermon_id))]
      const sermonList = sermons && sermonIds.length ? (sermons as { id: string; title: string; speaker: string; category: string; mastery_key_principle: string | null }[]).filter((s) => sermonIds.includes(s.id)) : []
      const sermonMap = new Map(sermonList.map((s) => [s.id, s]))
      if (sermonList.length === 0 && sermonIds.length > 0) {
        const { data: sermonRows } = await supabase.from("sermons").select("id, title, speaker, category, mastery_key_principle").in("id", sermonIds)
        sermonRows?.forEach((s: { id: string; title: string; speaker: string; category: string; mastery_key_principle: string | null }) => sermonMap.set(s.id, s))
      }
      weeklySermons = ws.map((r) => {
        const s = sermonMap.get(r.sermon_id)
        return {
          id: r.id,
          sermon_id: r.sermon_id,
          week_start_date: r.week_start_date,
          display_order: r.display_order ?? 0,
          listened: r.listened ?? false,
          listened_date: r.listened_date ?? null,
          notes: r.notes ?? null,
          is_weekly_principle: r.is_weekly_principle ?? false,
          title: s?.title ?? "",
          speaker: s?.speaker ?? "",
          category: s?.category ?? "uncategorized",
          mastery_key_principle: s?.mastery_key_principle ?? null,
        }
      })
    }
  } catch {
    // weekly_sermons table may not exist
  }

  return (
    <SermonsClient
      sermons={sermons ?? []}
      userId={user.id}
      initialWeekStartStr={weekStartStr}
      initialWeeklySermons={weeklySermons}
    />
  )
}
