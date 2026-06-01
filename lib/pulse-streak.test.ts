import { describe, expect, it } from "vitest"
import { currentConsecutiveWeekStreak, longestConsecutiveWeekStreak } from "./pulse-streak"
import { getPlanningWeekSunday, toLocalISODate } from "./pulse-session-dates"
import type { PulseSessionRow } from "./pulse"

function session(date: string, completed = true): PulseSessionRow {
  return {
    id: `s-${date}`,
    user_id: "u1",
    date,
    quarter_code: "2026-Q2",
    week_number: 1,
    started_at: `${date}T14:00:00Z`,
    completed_at: completed ? `${date}T16:00:00Z` : null,
    phases_completed: [],
    phase1_completed: false,
    phase2_backfill_count: 0,
    phase3_pulse_check_id: null,
    phase4_time_analysis: null,
    phase4_constraint_changes: null,
    phase4_declaration_reviewed: null,
    phase5_next_week_focus: [],
    phase6_monday_top3: [],
    session_quality: null,
    total_duration_minutes: null,
    created_at: `${date}T14:00:00Z`,
    updated_at: `${date}T16:00:00Z`,
  } as PulseSessionRow
}

/** A session date in the planning week that ended `weeksAgo` Sundays before the current week. */
function sessionDateWeeksAgo(weeksAgo: number): string {
  const todaySun = getPlanningWeekSunday(toLocalISODate(new Date()))
  const d = new Date(todaySun + "T12:00:00")
  d.setDate(d.getDate() - weeksAgo * 7)
  return toLocalISODate(d)
}

describe("currentConsecutiveWeekStreak", () => {
  it("returns 0 when there are no completed sessions", () => {
    expect(currentConsecutiveWeekStreak([])).toBe(0)
  })

  it("returns 0 when the last session is more than one planning week ago", () => {
    const rows = [session(sessionDateWeeksAgo(3)), session(sessionDateWeeksAgo(4))]
    expect(currentConsecutiveWeekStreak(rows)).toBe(0)
  })

  it("counts consecutive Sun–Sun planning weeks", () => {
    const rows = [
      session(sessionDateWeeksAgo(0)),
      session(sessionDateWeeksAgo(1)),
      session(sessionDateWeeksAgo(2)),
    ]
    expect(currentConsecutiveWeekStreak(rows)).toBe(3)
  })

  it("does not count same-week sessions as multiple streak weeks", () => {
    const sun = sessionDateWeeksAgo(0)
    const mon = new Date(sun + "T12:00:00")
    mon.setDate(mon.getDate() + 1)
    const rows = [session(toLocalISODate(mon)), session(sun)]
    expect(currentConsecutiveWeekStreak(rows)).toBe(1)
  })
})

describe("longestConsecutiveWeekStreak", () => {
  it("finds the longest historical run", () => {
    const rows = [
      session(sessionDateWeeksAgo(0)),
      session(sessionDateWeeksAgo(1)),
      session(sessionDateWeeksAgo(4)),
      session(sessionDateWeeksAgo(5)),
      session(sessionDateWeeksAgo(6)),
    ]
    expect(longestConsecutiveWeekStreak(rows)).toBe(3)
  })
})
