"use client"

import { useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { CLOSING_PRAYER, SESSION_QUALITY_LABELS } from "@/lib/pulse"

const CLOSE_CHECKLIST = [
  "Close all work-related tabs",
  "Close Notion (if open)",
  "Monday's top 3 written on paper/sticky note",
  "Phone back to normal mode (remove DND)",
  "Calendar blocks confirmed",
]

interface Phase6CloseProps {
  sessionDurationMinutes: number
  phasesCompletedCount: number
  backfillCount: number
  pulseSummary?: string
  constraintNoted?: string
  nextWeekPriorities: string[]
  mondayTop3: string[]
  sessionQuality: number | null
  onSessionQualityChange: (n: number) => void
  onCompleteSession: () => void
  completing: boolean
}

export function Phase6Close({
  sessionDurationMinutes,
  phasesCompletedCount,
  backfillCount,
  pulseSummary,
  constraintNoted,
  nextWeekPriorities,
  mondayTop3,
  sessionQuality,
  onSessionQualityChange,
  onCompleteSession,
  completing,
}: Phase6CloseProps) {
  const [checklist, setChecklist] = useState<Record<number, boolean>>({})
  const [prayerOpen, setPrayerOpen] = useState(true)

  const toggle = (i: number) => setChecklist((p) => ({ ...p, [i]: !p[i] }))
  const h = Math.floor(sessionDurationMinutes / 60)
  const m = sessionDurationMinutes % 60
  const durationStr = h > 0 ? `${h}h ${m}m` : `${m} min`

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#3C1E38]/70">Clean close. Don't let the planning session bleed into the rest of Sunday.</p>

      <ul className="space-y-2">
        {CLOSE_CHECKLIST.map((label, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left text-sm transition-all ${checklist[i] ? "bg-emerald-50 border-emerald-200" : "border-[#A7C2D7]/20 hover:border-[#A7C2D7]/40"}`}
            >
              {checklist[i] ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-[#3C1E38]/40" />}
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <button type="button" onClick={() => setPrayerOpen(!prayerOpen)} className="text-xs font-medium text-[#3C1E38]/60">
          {prayerOpen ? "▾" : "▸"} Closing prayer
        </button>
        {prayerOpen && (
          <blockquote className="font-garamond text-sm italic text-[#3C1E38]/80 mt-2 pl-4 border-l-2 border-[#A7C2D7]/40 py-2">
            {CLOSING_PRAYER}
          </blockquote>
        )}
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">How effective was this planning session?</p>
        <div className="flex flex-wrap gap-2">
          {([5, 4, 3, 2, 1] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onSessionQualityChange(n)}
              className={`px-3 py-2 rounded-lg text-sm text-left max-w-xs ${sessionQuality === n ? "bg-[#F9D57E]/30 border-2 border-[#F9D57E]" : "bg-[#FDFCF9] border border-[#A7C2D7]/20"}`}
            >
              <span className="font-bold text-[#3C1E38]">{n}</span> — {SESSION_QUALITY_LABELS[n]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2 bg-[#FDFCF9]">
        <p className="font-medium text-[#3C1E38]">Session summary</p>
        <ul className="text-sm text-[#3C1E38]/80 space-y-1">
          <li>Duration: {durationStr}</li>
          <li>Phases completed: {phasesCompletedCount} of 6</li>
          <li>Days backfilled: {backfillCount}</li>
          {pulseSummary && <li>Pulse check: {pulseSummary}</li>}
          <li>Constraint noted: {constraintNoted || "None"}</li>
          <li>Next week top 3: {nextWeekPriorities.filter(Boolean).join(", ") || "—"}</li>
          <li>Monday's top 3: {mondayTop3.filter(Boolean).join(", ") || "—"}</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onCompleteSession}
        disabled={completing}
        className="w-full py-4 rounded-xl bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] font-playfair font-bold text-lg border-2 border-[#3C1E38]/20 disabled:opacity-50"
      >
        {completing ? "Completing…" : "Complete Session"}
      </button>
    </div>
  )
}
