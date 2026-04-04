"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, Star } from "lucide-react"
import type { PulseSessionRow } from "@/lib/pulse"
import { SESSION_QUALITY_LABELS } from "@/lib/pulse"

const PHASE_ORDER = ["setup", "measure", "review", "learn", "plan", "close"] as const

/** Visual stars for “How effective was this planning session?” (1–5). */
export function SessionQualityStars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const n = Math.min(5, Math.max(1, Math.round(rating)))
  const starClass = size === "sm" ? "w-3 h-3" : "w-4 h-4"
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Planning session rated ${n} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${starClass} shrink-0 ${
            i < n ? "fill-[#F9D57E] text-[#D4A84B]" : "fill-none text-[#A7C2D7]/40"
          }`}
          strokeWidth={i < n ? 0 : 1.5}
        />
      ))}
    </div>
  )
}

function CompletedSessionSummary({ s }: { s: PulseSessionRow }) {
  const priorities = s.phase5_next_week_focus?.filter(Boolean) ?? []
  const monday = s.phase6_monday_top3?.filter(Boolean) ?? []
  const constraint = s.phase4_constraint_changes?.trim()
  const notes = s.overall_session_notes?.trim() || s.phase5_weekly_plan_notes?.trim()

  return (
    <div className="space-y-3 text-[#3C1E38]/90">
      {s.session_quality != null && (
        <div>
          <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">Session effectiveness</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SessionQualityStars rating={s.session_quality} />
            <span className="text-sm font-semibold text-[#3C1E38] tabular-nums">{s.session_quality}/5</span>
            {SESSION_QUALITY_LABELS[s.session_quality] ? (
              <span className="text-sm text-[#3C1E38]/80">— {SESSION_QUALITY_LABELS[s.session_quality]}</span>
            ) : null}
          </div>
        </div>
      )}
      {priorities.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">Next week priorities</p>
          <ol className="mt-1 list-decimal list-inside space-y-1">
            {priorities.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </div>
      )}
      {monday.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">Monday top 3</p>
          <ol className="mt-1 list-decimal list-inside space-y-1">
            {monday.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </div>
      )}
      {constraint ? (
        <div>
          <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">Constraint / week note</p>
          <p className="mt-1 whitespace-pre-wrap text-[#3C1E38]/80">{constraint}</p>
        </div>
      ) : null}
      {notes ? (
        <div>
          <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-[#3C1E38]/80 line-clamp-6">{notes}</p>
        </div>
      ) : null}
      {!priorities.length && !monday.length && !constraint && !notes && s.session_quality == null && (
        <p className="text-[#3C1E38]/50 italic">No summary details were saved for this session.</p>
      )}
      <p className="text-xs text-[#3C1E38]/45 pt-1">
        Open <span className="font-medium text-[#3C1E38]/60">View</span> to edit the full session.
      </p>
    </div>
  )
}

export type WeekHistoryRow = {
  sundayDate: string
  weekLabel: string
  session: PulseSessionRow | undefined
  isCurrentWeek: boolean
}

interface SessionHistoryProps {
  rows: WeekHistoryRow[]
  streakCount: number
  longestStreak: number
  quarterSessionCount: number
  quarterTotalSundays: number
}

export function SessionHistory({
  rows,
  streakCount,
  longestStreak,
  quarterSessionCount,
  quarterTotalSundays,
}: SessionHistoryProps) {
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">Session weeks</h2>

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
        <p className="text-sm text-[#3C1E38]/70">
          This quarter: {quarterSessionCount} of {quarterTotalSundays} Sundays with planning sessions (
          {quarterTotalSundays ? Math.round((quarterSessionCount / quarterTotalSundays) * 100) : 0}%)
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const s = row.session
          const completed = s?.completed_at
          const phases = s?.phases_completed ?? []
          const phaseCount = PHASE_ORDER.filter((p) => phases.includes(p)).length
          const summaryOpen = completed && s ? expandedSummaryId === s.id : false

          return (
            <div
              key={row.sundayDate}
              className={`rounded-xl border overflow-hidden bg-white ${
                row.isCurrentWeek ? "border-l-4 border-l-[#F9D57E] border-[#A7C2D7]/20" : "border-[#A7C2D7]/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#3C1E38]">{row.weekLabel}</span>
                    {row.isCurrentWeek && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F9D57E]/25 text-[#3C1E38]">
                        This week
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#3C1E38]/70 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {!s ? (
                      "—"
                    ) : completed ? (
                      <>
                        <span>
                          ✅ Complete —{" "}
                          {s.total_duration_minutes != null
                            ? `${Math.floor(s.total_duration_minutes / 60)}h ${s.total_duration_minutes % 60}m`
                            : "—"}
                        </span>
                        {s.session_quality != null ? (
                          <span className="inline-flex items-center gap-1.5" title="How effective was this planning session?">
                            <SessionQualityStars rating={s.session_quality} size="sm" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#3C1E38]/40" title="Rate in Phase 6 when you open this session">
                            No rating yet
                          </span>
                        )}
                      </>
                    ) : (
                      `🔄 ${phaseCount} of 6 phases`
                    )}
                  </div>
                  {s && (
                    <div className="flex gap-1 pt-1">
                      {PHASE_ORDER.map((ph) => (
                        <span
                          key={ph}
                          className={`w-2 h-2 rounded-full ${phases.includes(ph) ? "bg-[#F9D57E]" : "bg-[#3C1E38]/20"}`}
                          title={ph}
                        />
                      ))}
                    </div>
                  )}
                  {completed && s && (
                    <button
                      type="button"
                      onClick={() => setExpandedSummaryId((id) => (id === s.id ? null : s.id))}
                      className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#3C1E38]/70 hover:text-[#3C1E38]"
                      aria-expanded={summaryOpen}
                    >
                      {summaryOpen ? (
                        <ChevronDown className="w-4 h-4 text-[#A7C2D7]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#A7C2D7]" />
                      )}
                      {summaryOpen ? "Hide summary" : "Summary"}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {!s
                    ? row.isCurrentWeek
                      ? (
                        <Link
                          href={`/app/pulse?date=${row.sundayDate}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#F9D57E] text-[#3C1E38] font-medium text-sm hover:bg-[#F9D57E]/90 border border-[#3C1E38]/10"
                        >
                          Begin Session
                        </Link>
                      )
                      : (
                        <Link
                          href={`/app/pulse?date=${row.sundayDate}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#A7C2D7]/40 text-sm font-medium text-[#3C1E38] hover:bg-[#A7C2D7]/10"
                        >
                          Record now
                        </Link>
                      )
                    : completed
                      ? (
                        <Link
                          href={`/app/pulse/session/${s.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#A7C2D7]/20 text-sm font-medium text-[#3C1E38] hover:bg-[#A7C2D7]/30"
                        >
                          View
                        </Link>
                      )
                      : (
                        <Link
                          href={`/app/pulse/session/${s.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#F9D57E] text-[#3C1E38] font-medium text-sm hover:bg-[#F9D57E]/90 border border-[#3C1E38]/10"
                        >
                          Resume
                        </Link>
                      )}
                </div>
              </div>
              {summaryOpen && s && (
                <div className="border-t border-[#A7C2D7]/10 bg-[#FDFCF9]/80 px-4 py-3">
                  <CompletedSessionSummary s={s} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
