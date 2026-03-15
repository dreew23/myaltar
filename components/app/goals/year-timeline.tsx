"use client"

const QUARTERS = [
  { id: 1, name: "Year 1: Foundation & Spiritual Awakening", range: "Oct 20 - Jan 18" },
  { id: 2, name: "Year 2: Momentum & Mastery", range: "Jan 19 - Apr 19" },
  { id: 3, name: "Year 3: Breakthrough & Visibility", range: "Apr 20 - Jul 19" },
  { id: 4, name: "Year 4: Harvest & Legacy Seeding", range: "Jul 20 - Oct 18" },
] as const

interface YearTimelineProps {
  currentQuarterId: number
  /** Optional: for each quarter, summary text (e.g. "Week 5 of 13 — 72% overall") */
  quarterSummaries?: Record<number, string>
}

export function YearTimeline({ currentQuarterId, quarterSummaries = {} }: YearTimelineProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#3C1E38]/50">Personal year — 4 quarters</p>
      {QUARTERS.map((q) => {
        const isCurrent = q.id === currentQuarterId
        const isPast = q.id < currentQuarterId
        const isFuture = q.id > currentQuarterId
        const summary = quarterSummaries[q.id]
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
            <p className={`text-sm font-medium ${isCurrent ? "text-[#3C1E38]" : "text-[#3C1E38]/70"}`}>
              {q.name}
            </p>
            <p className="text-xs text-[#3C1E38]/50 mt-0.5">{q.range}</p>
            {summary && (
              <p className="text-xs text-[#3C1E38]/70 mt-1">{summary}</p>
            )}
            {isFuture && !summary && <p className="text-xs text-[#3C1E38]/40 mt-1">Upcoming</p>}
          </div>
        )
      })}
    </div>
  )
}
