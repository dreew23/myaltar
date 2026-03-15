"use client"

type WeekResult = "yes" | "no" | "blocked" | null

interface QuarterTimelineProps {
  /** Week 1–13, each element is an array of 7 results (one per goal) */
  weeks: WeekResult[][]
  currentWeek: number
}

export function QuarterTimeline({ weeks, currentWeek }: QuarterTimelineProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
      <p className="text-xs text-[#3C1E38]/50 mb-3">Quarter timeline — goal pulse results by week</p>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Week labels */}
          <div className="flex mb-1">
            {Array.from({ length: 13 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[24px] text-center text-[10px] ${
                  i + 1 === currentWeek ? "font-bold text-[#3C1E38]" : "text-[#3C1E38]/40"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {/* 7 goal rows */}
          {weeks[0]?.length !== undefined &&
            Array.from({ length: 7 }, (_, goalIdx) => (
              <div key={goalIdx} className="flex mb-0.5">
                {Array.from({ length: 13 }, (_, weekIdx) => {
                  const res = weeks[weekIdx]?.[goalIdx] ?? null
                  const isCurrent = weekIdx + 1 === currentWeek
                  const bg =
                    res === "yes"
                      ? "bg-emerald-500"
                      : res === "no"
                        ? "bg-red-400"
                        : res === "blocked"
                          ? "bg-[#F9D57E]"
                          : "bg-[#3C1E38]/10"
                  return (
                    <div
                      key={weekIdx}
                      className={`flex-1 min-w-[24px] h-4 rounded-sm ${bg} ${
                        isCurrent ? "ring-1 ring-[#3C1E38]" : ""
                      }`}
                      title={`G${goalIdx + 1} Week ${weekIdx + 1}: ${res ?? "—"}`}
                    />
                  )
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
