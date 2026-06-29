"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, Star } from "lucide-react"
import type { GoalConfig } from "@/lib/data/dominion"
import type { PulseSessionRow } from "@/lib/pulse"
import { SESSION_QUALITY_LABELS } from "@/lib/pulse"
import type { ArchivableQuarter } from "@/lib/quarter-context"
import { buildQuarterWeekHistoryRows } from "@/lib/quarter-context"

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

function hasChecklistData(raw: Record<string, boolean> | null | undefined) {
  return Boolean(raw && typeof raw === "object" && Object.keys(raw).length > 0)
}

function checklistDoneLine(label: string, raw: Record<string, boolean> | null | undefined, expectedSlots: number) {
  if (!raw || typeof raw !== "object") return null
  const keys = Object.keys(raw)
  if (keys.length === 0) return null
  const done = Object.values(raw).filter(Boolean).length
  const total = Math.max(expectedSlots, keys.length)
  return (
    <div>
      <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm text-[#3C1E38]/80">
        {done}/{total} items checked
      </p>
    </div>
  )
}

const GOAL_PULSE_FIELDS = [
  { key: "g1_prayer", noteKey: "g1_note", label: "Prayer" },
  { key: "g2_sermons", noteKey: "g2_note", label: "Sermons" },
  { key: "g3_dominion", noteKey: "g3_note", label: "Dominion" },
  { key: "g4_warfare", noteKey: "g4_note", label: "Warfare" },
  { key: "g5_decisions", noteKey: "g5_note", label: "Decisions" },
  { key: "g6_community", noteKey: "g6_note", label: "Community" },
  { key: "g7_content", noteKey: "g7_note", label: "Content" },
] as const

function PulseCheckSummary({ check }: { check: Record<string, unknown> }) {
  const filled = GOAL_PULSE_FIELDS.filter(({ key }) => {
    const v = check[key]
    return v != null && v !== ""
  })
  if (filled.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-[#3C1E38]/50 uppercase tracking-wide">Phase 3 pulse check</p>
      <ul className="mt-1 space-y-1 text-sm text-[#3C1E38]/80">
        {filled.map(({ key, noteKey, label }) => {
          const val = check[key]
          const note = check[noteKey] as string | undefined
          return (
            <li key={key}>
              <span className="font-medium">{label}:</span>{" "}
              {typeof val === "number" ? `${val}/10` : String(val)}
              {note?.trim() ? ` — ${note.trim()}` : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CompletedSessionSummary({
  s,
  pulseCheck,
}: {
  s: PulseSessionRow
  pulseCheck?: Record<string, unknown> | null
}) {
  const priorities = s.phase5_next_week_focus?.filter(Boolean) ?? []
  const monday = s.phase6_monday_top3?.filter(Boolean) ?? []
  const constraint = s.phase4_constraint_changes?.trim()
  const notes = s.overall_session_notes?.trim() || s.phase5_weekly_plan_notes?.trim()
  const setupCheck = checklistDoneLine("Phase 1 setup checklist", s.phase1_checklist, 5)
  const closeCheck = checklistDoneLine("Phase 6 close checklist", s.phase6_close_checklist, 5)
  const anyChecklist = hasChecklistData(s.phase1_checklist) || hasChecklistData(s.phase6_close_checklist)

  return (
    <div className="space-y-3 text-[#3C1E38]/90">
      {setupCheck}
      {pulseCheck ? <PulseCheckSummary check={pulseCheck} /> : null}
      {closeCheck}
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
      {!priorities.length &&
        !monday.length &&
        !constraint &&
        !notes &&
        s.session_quality == null &&
        !anyChecklist &&
        !pulseCheck && (
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
  weekNumber?: number
}

interface SessionHistoryProps {
  rows: WeekHistoryRow[]
  streakCount: number
  longestStreak: number
  quarterSessionCount: number
  quarterTotalSundays: number
  archivableQuarters?: ArchivableQuarter[]
  activeQuarterCode?: string
  allSessions?: PulseSessionRow[]
  allPulseChecks?: Record<string, unknown>[]
  calendarTodayStr?: string
  goals?: GoalConfig[]
  readOnlyArchive?: boolean
}

function WeekRowList({
  rows,
  expandedSummaryId,
  setExpandedSummaryId,
  pulseChecksByWeek,
  readOnly,
}: {
  rows: WeekHistoryRow[]
  expandedSummaryId: string | null
  setExpandedSummaryId: (id: string | null) => void
  pulseChecksByWeek: Map<number, Record<string, unknown>>
  readOnly?: boolean
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const s = row.session
        const completed = s?.completed_at
        const phases = s?.phases_completed ?? []
        const phaseCount = PHASE_ORDER.filter((p) => phases.includes(p)).length
        const summaryOpen = completed && s ? expandedSummaryId === s.id : false
        const weekNum = row.weekNumber
        const pulseCheck =
          weekNum != null
            ? pulseChecksByWeek.get(weekNum) ??
              (s?.phase3_pulse_check_id
                ? pulseChecksByWeek.get(-1)
                : undefined)
            : undefined

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
                  {weekNum != null && (
                    <span className="text-xs font-semibold text-[#3C1E38]/45 tabular-nums">W{weekNum}</span>
                  )}
                  <span className="font-medium text-[#3C1E38]">{row.weekLabel}</span>
                  {row.isCurrentWeek && (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F9D57E]/25 text-[#3C1E38]">
                      This week
                    </span>
                  )}
                  {readOnly && completed && (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#A7C2D7]/20 text-[#3C1E38]/60">
                      Archive
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
                    onClick={() => setExpandedSummaryId(summaryOpen ? null : s.id)}
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
              {!readOnly && (
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
              )}
              {readOnly && completed && s && (
                <Link
                  href={`/app/pulse/session/${s.id}`}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#A7C2D7]/15 text-sm font-medium text-[#3C1E38] hover:bg-[#A7C2D7]/25 shrink-0"
                >
                  View
                </Link>
              )}
            </div>
            {summaryOpen && s && (
              <div className="border-t border-[#A7C2D7]/10 bg-[#FDFCF9]/80 px-4 py-3">
                <CompletedSessionSummary
                  s={s}
                  pulseCheck={
                    weekNum != null
                      ? pulseChecksByWeek.get(weekNum) ?? null
                      : null
                  }
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function SessionHistory({
  rows,
  streakCount,
  longestStreak,
  quarterSessionCount,
  quarterTotalSundays,
  archivableQuarters = [],
  activeQuarterCode = "",
  allSessions = [],
  allPulseChecks = [],
  calendarTodayStr = "",
  readOnlyArchive = true,
}: SessionHistoryProps) {
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null)
  const [selectedQuarterCode, setSelectedQuarterCode] = useState<string>(() =>
    archivableQuarters.find((q) => q.isActive)?.code ?? activeQuarterCode,
  )

  const selectedQuarter = useMemo(
    () => archivableQuarters.find((q) => q.code === selectedQuarterCode) ?? archivableQuarters[0],
    [archivableQuarters, selectedQuarterCode],
  )

  const isArchiveView = selectedQuarter != null && !selectedQuarter.isActive

  const archiveRows = useMemo(() => {
    if (!selectedQuarter || !calendarTodayStr) return rows
    const quarterSessions = allSessions.filter((s) => s.quarter_code === selectedQuarter.code)
    return buildQuarterWeekHistoryRows(
      selectedQuarter,
      quarterSessions.length > 0 ? quarterSessions : allSessions,
      calendarTodayStr,
      activeQuarterCode,
    )
  }, [selectedQuarter, allSessions, calendarTodayStr, activeQuarterCode, rows])

  const displayRows = isArchiveView ? archiveRows : rows

  const archiveSessionCount = useMemo(() => {
    if (!selectedQuarter) return quarterSessionCount
    return allSessions.filter((s) => s.completed_at && s.quarter_code === selectedQuarter.code).length
  }, [selectedQuarter, allSessions, quarterSessionCount])

  const pulseChecksByWeek = useMemo(() => {
    const map = new Map<number, Record<string, unknown>>()
    if (!selectedQuarter) return map
    for (const check of allPulseChecks) {
      if (check.quarter_code !== selectedQuarter.code) continue
      const wn = Number(check.week_number)
      if (Number.isFinite(wn)) map.set(wn, check)
    }
    return map
  }, [allPulseChecks, selectedQuarter])

  const showQuarterPicker = archivableQuarters.length > 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">Session weeks</h2>
        {showQuarterPicker && (
          <div className="space-y-1">
            <label htmlFor="quarter-picker" className="text-xs text-[#3C1E38]/50">
              Quarter
            </label>
            <select
              id="quarter-picker"
              value={selectedQuarterCode}
              onChange={(e) => {
                setSelectedQuarterCode(e.target.value)
                setExpandedSummaryId(null)
              }}
              className="flex h-9 min-w-[200px] rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-1 text-sm text-[#3C1E38]"
            >
              {archivableQuarters.map((q) => (
                <option key={q.code} value={q.code}>
                  {q.isActive ? "● " : ""}
                  {q.name} ({q.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isArchiveView && selectedQuarter && (
        <div className="rounded-lg border border-[#A7C2D7]/25 bg-[#A7C2D7]/5 px-4 py-3 text-sm text-[#3C1E38]/75">
          <p className="font-medium text-[#3C1E38]">Past quarter — read only</p>
          <p className="mt-1">
            {selectedQuarter.name} · {selectedQuarter.startDate} – {selectedQuarter.endDate}
          </p>
          <p className="text-xs mt-1 text-[#3C1E38]/50">
            Sessions, Phase 1 checklists, and pulse checks are preserved for review.
          </p>
        </div>
      )}

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
          {isArchiveView ? "Archived quarter" : "This quarter"}: {archiveSessionCount} of {quarterTotalSundays}{" "}
          Sundays with planning sessions (
          {quarterTotalSundays ? Math.round((archiveSessionCount / quarterTotalSundays) * 100) : 0}%)
        </p>
      </div>

      <WeekRowList
        rows={displayRows}
        expandedSummaryId={expandedSummaryId}
        setExpandedSummaryId={setExpandedSummaryId}
        pulseChecksByWeek={pulseChecksByWeek}
        readOnly={isArchiveView && readOnlyArchive}
      />
    </div>
  )
}
