"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const GOAL_OPTIONS = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"]

type FocusRow = { focus_1: string; focus_2: string; focus_3: string; goal_1: string; goal_2: string; goal_3: string }

interface Phase5PlanProps {
  quarterName: string
  weekNumber: number
  /** e.g. “Personal year 76% complete (Week 10 of 13)” */
  personalYearProgressLine?: string
  /** e.g. “Calendar Q1 ends in 2 days — Q2 starts Apr 1” */
  calendarQuarterContextLine?: string
  nextWeekFocusDates: string[]
  nextWeekDailyFocus: { date: string; focus_1?: string; focus_2?: string; focus_3?: string; goal_1?: string; goal_2?: string; goal_3?: string }[]
  nextWeekPriorities: string[]
  mondayTop3: string[]
  onNextWeekFocusChange: (priorities: string[]) => void
  onDailyFocusChange: (date: string, row: FocusRow) => Promise<void>
  onMondayTop3Change: (top3: string[]) => void
}

export function Phase5Plan({
  quarterName,
  weekNumber,
  personalYearProgressLine,
  calendarQuarterContextLine,
  nextWeekFocusDates,
  nextWeekDailyFocus,
  nextWeekPriorities,
  mondayTop3,
  onNextWeekFocusChange,
  onDailyFocusChange,
  onMondayTop3Change,
}: Phase5PlanProps) {
  const [priorityGoals, setPriorityGoals] = useState<string[]>(["", "", ""])
  const [focusByDate, setFocusByDate] = useState<Record<string, FocusRow>>(() => {
    const m: Record<string, FocusRow> = {}
    for (const d of nextWeekFocusDates) {
      const row = nextWeekDailyFocus.find((f) => f.date === d)
      m[d] = {
        focus_1: row?.focus_1 ?? "",
        focus_2: row?.focus_2 ?? "",
        focus_3: row?.focus_3 ?? "",
        goal_1: row?.goal_1 ?? "",
        goal_2: row?.goal_2 ?? "",
        goal_3: row?.goal_3 ?? "",
      }
    }
    return m
  })
  const [calendarBlocks, setCalendarBlocks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setFocusByDate((prev) => {
      const next = { ...prev }
      for (const d of nextWeekFocusDates) {
        const row = nextWeekDailyFocus.find((f) => f.date === d)
        if (row) {
          next[d] = {
            focus_1: row.focus_1 ?? "",
            focus_2: row.focus_2 ?? "",
            focus_3: row.focus_3 ?? "",
            goal_1: row.goal_1 ?? "",
            goal_2: row.goal_2 ?? "",
            goal_3: row.goal_3 ?? "",
          }
        }
      }
      return next
    })
  }, [nextWeekFocusDates, nextWeekDailyFocus])

  const priorities: string[] = [nextWeekPriorities[0] ?? "", nextWeekPriorities[1] ?? "", nextWeekPriorities[2] ?? ""]

  const updatePriority = (i: number, v: string) => {
    const next: string[] = [priorities[0] ?? "", priorities[1] ?? "", priorities[2] ?? ""]
    next[i] = v
    onNextWeekFocusChange(next)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#3C1E38]/70">Plan the next week. Only after measuring, reviewing, and learning.</p>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-1">
        <p className="font-medium text-[#3C1E38]">Are you on track with the bigger picture?</p>
        <p className="text-sm text-[#3C1E38]/70">Week {weekNumber} of 13 — {quarterName}</p>
        {personalYearProgressLine && (
          <p className="text-xs text-[#F9D57E] font-medium">{personalYearProgressLine}</p>
        )}
        {calendarQuarterContextLine && (
          <p className="text-xs text-[#A7C2D7]">{calendarQuarterContextLine}</p>
        )}
        {weekNumber >= 7 && (
          <Link href="/app/goals" className="inline-block mt-2 text-sm text-[#A7C2D7] font-medium hover:underline">
            Past halfway. Are your Big Rocks on track? →
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">Next week's priorities</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-sm text-[#3C1E38]/50 w-24">{i === 0 ? "Top:" : i === 1 ? "Second:" : "Third:"}</span>
            <input
              type="text"
              value={priorities[i] ?? ""}
              onChange={(e) => updatePriority(i, e.target.value)}
              placeholder="Priority..."
              className="flex-1 px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm"
            />
            <select
              className="w-12 text-xs border rounded px-1 py-1.5"
              value={priorityGoals[i] ?? ""}
              onChange={(e) => {
                const next = [...priorityGoals]
                next[i] = e.target.value
                setPriorityGoals(next)
              }}
            >
              <option value="">—</option>
              {GOAL_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2">
        <p className="font-medium text-[#3C1E38]">Daily focus (Top 3 per day)</p>
        {nextWeekFocusDates.map((date, idx) => {
          const row = focusByDate[date] ?? { focus_1: "", focus_2: "", focus_3: "", goal_1: "", goal_2: "", goal_3: "" }
          const d = new Date(date + "T12:00:00")
          const dayNum = d.getDay()
          const dayLabel = dayNum === 0 ? "Sun" : DAY_LABELS[dayNum - 1] ?? DAY_LABELS[idx]
          return (
            <div key={date} className="border border-[#A7C2D7]/10 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-[#3C1E38]">
                {dayLabel} {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              {[1, 2, 3].map((n) => (
                <input
                  key={n}
                  type="text"
                  value={row[`focus_${n}` as keyof FocusRow] ?? ""}
                  onChange={(e) => {
                    const next = { ...row, [`focus_${n}`]: e.target.value }
                    setFocusByDate((p) => ({ ...p, [date]: next }))
                    onDailyFocusChange(date, next)
                  }}
                  placeholder={`Focus ${n}`}
                  className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded text-sm"
                />
              ))}
            </div>
          )
        })}
        <p className="text-xs text-[#3C1E38]/50">Or: &quot;I'll set daily focus each morning&quot;</p>
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2">
        <p className="font-medium text-[#3C1E38]">Block these time slots in your calendar (prompt only)</p>
        {["SwiftLink deep work", "Krystal advisory (max 15h)", "TPM Academy (max 8h)", "Prayer sessions", "Buffer time"].map((label, i) => (
          <label key={i} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={calendarBlocks[label] ?? false}
              onChange={(e) => setCalendarBlocks((p) => ({ ...p, [label]: e.target.checked }))}
            />
            {label} {calendarBlocks[label] && "✓"}
          </label>
        ))}
      </div>

      <div className="rounded-lg border-2 border-[#F9D57E]/40 bg-[#F9D57E]/5 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">Monday's Top 3 (write on paper or sticky note)</p>
        <p className="text-xs text-[#3C1E38]/60">Paper on your desk beats a Notion page you have to navigate to.</p>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="text"
            value={mondayTop3[i] ?? ""}
            onChange={(e) => {
              const next: string[] = [mondayTop3[0] ?? "", mondayTop3[1] ?? "", mondayTop3[2] ?? ""]
              next[i] = e.target.value
              onMondayTop3Change(next)
            }}
            placeholder={`Monday focus ${i + 1}`}
            className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm"
          />
        ))}
      </div>
    </div>
  )
}
