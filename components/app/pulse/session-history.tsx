"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, ChevronDown, ChevronRight } from "lucide-react"
import type { PulseSessionRow } from "@/lib/pulse"

interface SessionHistoryProps {
  pastSessions: PulseSessionRow[]
  streakCount: number
  longestStreak: number
  quarterSessionCount: number
  quarterTotalSundays: number
}

export function SessionHistory({
  pastSessions,
  streakCount,
  longestStreak,
  quarterSessionCount,
  quarterTotalSundays,
}: SessionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">Past sessions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#A7C2D7]/20 p-4 bg-white">
          <p className="text-xs text-[#3C1E38]/50">Planning sessions completed</p>
          <p className="font-playfair text-2xl font-bold text-[#3C1E38]">{streakCount} consecutive weeks</p>
        </div>
        <div className="rounded-xl border border-[#A7C2D7]/20 p-4 bg-white">
          <p className="text-xs text-[#3C1E38]/50">Longest streak</p>
          <p className="font-playfair text-2xl font-bold text-[#3C1E38]">{longestStreak} weeks</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#A7C2D7]/20 p-4 bg-white">
        <p className="text-sm text-[#3C1E38]/70">This quarter: {quarterSessionCount} of {quarterTotalSundays} Sundays with planning sessions ({quarterTotalSundays ? Math.round((quarterSessionCount / quarterTotalSundays) * 100) : 0}%)</p>
      </div>

      <div className="space-y-2">
        {pastSessions.map((s) => {
          const expanded = expandedId === s.id
          const date = new Date(s.date + "T12:00:00")
          const phases = s.phases_completed ?? []
          const quality = s.session_quality ?? 0
          return (
            <div key={s.id} className="rounded-xl border border-[#A7C2D7]/20 overflow-hidden bg-white">
              <div className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#FDFCF9]">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : s.id)}
                  className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-90 text-left"
                >
                  <span className="font-medium text-[#3C1E38]">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="text-sm text-[#3C1E38]/50">Week {s.week_number ?? "—"}</span>
                  {s.total_duration_minutes != null && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#A7C2D7]/20 text-[#3C1E38]/70">{Math.floor(s.total_duration_minutes / 60)}h {s.total_duration_minutes % 60}m</span>
                  )}
                  <div className="flex gap-1">
                    {["setup", "measure", "review", "learn", "plan", "close"].map((ph) => (
                      <span key={ph} className={`w-2 h-2 rounded-full ${phases.includes(ph) ? "bg-[#F9D57E]" : "bg-[#3C1E38]/20"}`} title={ph} />
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-4 h-4 ${n <= quality ? "text-[#F9D57E] fill-[#F9D57E]" : "text-[#3C1E38]/20"}`} />
                    ))}
                  </div>
                  {expanded ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
                <Link
                  href={`/app/pulse/session/${s.id}`}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A7C2D7]/20 text-sm font-medium text-[#3C1E38] hover:bg-[#A7C2D7]/30"
                >
                  Open
                </Link>
              </div>
              {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#A7C2D7]/10 text-sm text-[#3C1E38]/80 space-y-2">
                  {s.phase5_next_week_focus?.length ? <p><strong>Next week priorities:</strong> {s.phase5_next_week_focus.join(", ")}</p> : null}
                  {s.phase6_monday_top3?.length ? <p><strong>Monday top 3:</strong> {s.phase6_monday_top3.join(", ")}</p> : null}
                  {s.phase4_constraint_changes && <p><strong>Constraint:</strong> {s.phase4_constraint_changes}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
