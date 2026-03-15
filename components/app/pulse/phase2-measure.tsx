"use client"

import { useMemo } from "react"
import { WeeklyAuditGrid } from "./weekly-audit-grid"

type DevotionRow = {
  date: string
  prayer_complete?: boolean
  declarations_complete?: boolean
  gratitude_complete?: boolean
  sermons_today?: number
  energy_score?: number
}

interface Phase2MeasureProps {
  sevenDaysAgoStr: string
  todayStr: string
  weekDevotions: DevotionRow[]
  prayerSessionDates: string[]
  declarationLogsSummary: { daysAllMet: number; totalDays: number }
  backfillCount: number
  userId: string
  onBackfillDay: (date: string, data: Record<string, unknown>) => Promise<void>
}

function buildDays(sevenDaysAgoStr: string, todayStr: string, devotionsByDate: Map<string, DevotionRow>): { date: string; dayLabel: string; isToday: boolean; prayer_complete?: boolean; declarations_complete?: boolean; gratitude_complete?: boolean; sermons_today?: number; energy_score?: number }[] {
  const out: { date: string; dayLabel: string; isToday: boolean; prayer_complete?: boolean; declarations_complete?: boolean; gratitude_complete?: boolean; sermons_today?: number; energy_score?: number }[] = []
  const start = new Date(sevenDaysAgoStr + "T12:00:00")
  const end = new Date(todayStr + "T12:00:00")
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    const isToday = dateStr === todayStr
    const dev = devotionsByDate.get(dateStr)
    out.push({
      date: dateStr,
      dayLabel: isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      isToday,
      prayer_complete: dev?.prayer_complete,
      declarations_complete: dev?.declarations_complete,
      gratitude_complete: dev?.gratitude_complete,
      sermons_today: dev?.sermons_today,
      energy_score: dev?.energy_score,
    })
  }
  return out
}

export function Phase2Measure({
  sevenDaysAgoStr,
  todayStr,
  weekDevotions,
  prayerSessionDates,
  declarationLogsSummary,
  backfillCount,
  userId,
  onBackfillDay,
}: Phase2MeasureProps) {
  const devotionsByDate = useMemo(() => {
    const m = new Map<string, DevotionRow>()
    for (const d of weekDevotions) m.set(d.date, d)
    return m
  }, [weekDevotions])

  const days = useMemo(
    () => buildDays(sevenDaysAgoStr, todayStr, devotionsByDate),
    [sevenDaysAgoStr, todayStr, devotionsByDate]
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#3C1E38]/70">Ensure all data is logged before reviewing. Assess from data, not memory.</p>

      <WeeklyAuditGrid
        days={days}
        userId={userId}
        backfillCount={backfillCount}
        onEditDay={async (date, data) => {
          await onBackfillDay(date, {
            prayer_complete: data.prayer_complete,
            declarations_complete: data.declarations_complete,
            gratitude_complete: data.gratitude_complete,
            sermons_today: data.sermons_today,
            energy_score: data.energy_score,
          })
        }}
      />

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2">
        <p className="text-sm font-medium text-[#3C1E38]">Declarations this week</p>
        <p className="text-sm text-[#3C1E38]/70">{declarationLogsSummary.daysAllMet} of 7 days with all targets met</p>
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2">
        <p className="text-sm font-medium text-[#3C1E38]">Prayer sessions logged</p>
        <p className="text-sm text-[#3C1E38]/70">{prayerSessionDates.length} of 7 days</p>
        {prayerSessionDates.length < 7 && (
          <p className="text-xs text-[#3C1E38]/50">Days without a session: check your prayer log for missing days.</p>
        )}
      </div>
    </div>
  )
}
