"use client"

import type { PersonalYearConfigRow } from "@/lib/personal-year"

interface YearTimelineProps {
  /** From DB, ordered by year_number */
  segments: PersonalYearConfigRow[]
  currentYearNumber: number
  /** Optional: for each personal year_number, summary text */
  quarterSummaries?: Record<number, string>
  /** Calendar quarter chips spanning the full cycle (e.g. Q4 2025 … Q4 2026) */
  calendarOverlayLabels?: string[]
}

function formatRange(startStr: string, endStr: string) {
  const a = new Date(startStr + "T12:00:00")
  const b = new Date(endStr + "T12:00:00")
  return `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export function YearTimeline({
  segments,
  currentYearNumber,
  quarterSummaries = {},
  calendarOverlayLabels = [],
}: YearTimelineProps) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  if (!segments.length) {
    return (
      <p className="text-sm text-[#3C1E38]/50">
        Add your personal year segments in Settings → Personal Year (DOMINION).
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#3C1E38]/50">Personal year — four segments (planning lens)</p>
      {segments.map((q) => {
        const start = new Date(q.start_date + "T12:00:00")
        const end = new Date(q.end_date + "T12:00:00")
        const isCurrent = q.year_number === currentYearNumber
        const isPast = end < today
        const isFuture = start > today && !isCurrent
        const summary = quarterSummaries[q.year_number]
        return (
          <div
            key={q.id}
            className={`rounded-lg border p-3 ${
              isCurrent
                ? "border-[#F9D57E] bg-[#F9D57E]/10"
                : isPast
                  ? "border-[#A7C2D7]/20 bg-[#FDFCF9]"
                  : "border-[#A7C2D7]/10 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-medium ${isCurrent ? "text-[#3C1E38]" : "text-[#3C1E38]/70"}`}>
                Year {q.year_number}: {q.year_name}
              </p>
              {q.is_active && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#3C1E38] bg-[#F9D57E]/40 px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#3C1E38]/50 mt-0.5">{formatRange(q.start_date, q.end_date)}</p>
            {summary && <p className="text-xs text-[#3C1E38]/70 mt-1">{summary}</p>}
            {isFuture && !summary && <p className="text-xs text-[#3C1E38]/40 mt-1">Upcoming</p>}
            {isPast && !summary && <p className="text-xs text-[#3C1E38]/40 mt-1">Completed</p>}
          </div>
        )
      })}

      {calendarOverlayLabels.length > 0 && (
        <div className="pt-3 mt-2 border-t border-[#A7C2D7]/15">
          <p className="text-[10px] text-[#A7C2D7] mb-2 uppercase tracking-wide">Calendar reference</p>
          <div className="flex flex-wrap gap-1.5">
            {calendarOverlayLabels.map((label) => (
              <span
                key={label}
                className="text-[10px] px-2 py-0.5 rounded-full border border-[#A7C2D7]/30 text-[#3C1E38]/60 bg-[#A7C2D7]/5"
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#3C1E38]/40 mt-2">
            See how calendar quarters overlap your personal years (e.g. Year 2 spans Q1 and part of Q2).
          </p>
        </div>
      )}
    </div>
  )
}
