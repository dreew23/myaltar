import type { PulseSessionRow } from "@/lib/pulse"

/** Local calendar day difference (avoids UTC drift). */
export function daysApartLocal(newerDateStr: string, olderDateStr: string): number {
  const a = new Date(newerDateStr + "T12:00:00").getTime()
  const b = new Date(olderDateStr + "T12:00:00").getTime()
  return Math.round((a - b) / 86_400_000)
}

/** One planning week ≈ 7 days between session dates (Sun→Sun); allow 6–8 for DST edges. */
function isConsecutivePlanningWeeks(newerDateStr: string, olderDateStr: string): boolean {
  const d = daysApartLocal(newerDateStr, olderDateStr)
  return d >= 6 && d <= 8
}

/**
 * Deduplicated completed sessions for streak math. Merges week-matching + past rows + current client row.
 */
export function mergeCompletedPulseSessionsForStreak(
  sessionsForWeekMatching: PulseSessionRow[],
  pastSessions: PulseSessionRow[],
  session: { id: string; date: string; completed_at: string | null } | null,
  todaySession: PulseSessionRow | null
): PulseSessionRow[] {
  const byId = new Map<string, PulseSessionRow>()
  for (const s of sessionsForWeekMatching) {
    if (s.completed_at) byId.set(s.id, s)
  }
  for (const s of pastSessions) {
    if (s.completed_at) byId.set(s.id, s)
  }
  if (session?.completed_at) {
    byId.set(session.id, session as unknown as PulseSessionRow)
  } else if (todaySession?.completed_at) {
    byId.set(todaySession.id, todaySession)
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.date + "T12:00:00").getTime() - new Date(a.date + "T12:00:00").getTime()
  )
}

/** Current streak: consecutive planning weeks from the most recently completed session backward. */
export function currentConsecutiveWeekStreak(sortedNewestFirst: PulseSessionRow[]): number {
  const rows = sortedNewestFirst.filter((s) => s.completed_at && s.date)
  if (rows.length === 0) return 0
  let streak = 1
  for (let i = 0; i < rows.length - 1; i++) {
    if (isConsecutivePlanningWeeks(rows[i]!.date, rows[i + 1]!.date)) streak++
    else break
  }
  return streak
}

/** Longest run of consecutive planning weeks in history (oldest → newest within the list). */
export function longestConsecutiveWeekStreak(sortedNewestFirst: PulseSessionRow[]): number {
  const rows = sortedNewestFirst.filter((s) => s.completed_at && s.date)
  if (rows.length === 0) return 0
  const asc = [...rows].sort(
    (a, b) => new Date(a.date + "T12:00:00").getTime() - new Date(b.date + "T12:00:00").getTime()
  )
  let max = 1
  let cur = 1
  for (let i = 1; i < asc.length; i++) {
    if (isConsecutivePlanningWeeks(asc[i]!.date, asc[i - 1]!.date)) {
      cur++
      max = Math.max(max, cur)
    } else {
      cur = 1
    }
  }
  return max
}
