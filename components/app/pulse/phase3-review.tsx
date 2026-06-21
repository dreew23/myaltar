"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Flame, Headphones, Crown, Heart, Scale, Users, Target } from "lucide-react"
import { pulseCheckNoteField, type GoalConfig } from "@/lib/data/dominion"

const ICONS: Record<string, typeof Flame> = {
  flame: Flame, headphones: Headphones, crown: Crown, heart: Heart, scale: Scale, users: Users, target: Target,
}

type PulseAnswer = { response: "yes" | "no" | "blocked"; note: string } | { response: "scale"; value: number; note: string }

interface WeekStats {
  prayerDays: number
  declarationDays: number
  sermonsTotal: number
  energyAvg: number
  downloadsCount: number
  focusDays: number
}

interface Phase3ReviewProps {
  goals: GoalConfig[]
  weekStats: WeekStats
  weekDownloads: { id: string; content: string; created_at?: string }[]
  existingPulseCheck: Record<string, unknown> | null
  userId: string
  quarterCode: string
  weekNumber: number
  /** Calendar date for this pulse session (pulse_checks.date). */
  pulseCheckDate: string
  onSavePulseCheck: (data: Record<string, unknown>) => Promise<string | null>
  /** Parent uses this to flush Phase 3 save before marking complete. */
  onRegisterSave?: (saveNow: () => Promise<string | null>) => void
  /** Personal + calendar rhythm (UI only; storage still uses calendar quarter_code / week_number). */
  dualContextLine?: string
}

export function Phase3Review({
  goals,
  weekStats,
  weekDownloads,
  existingPulseCheck,
  quarterCode,
  weekNumber,
  pulseCheckDate,
  onSavePulseCheck,
  onRegisterSave,
  dualContextLine,
}: Phase3ReviewProps) {
  const [answers, setAnswers] = useState<Record<string, PulseAnswer>>(() => {
    const initial: Record<string, PulseAnswer> = {}
    for (const g of goals) {
      const v = existingPulseCheck?.[g.dbField]
      const n = existingPulseCheck?.[pulseCheckNoteField(g.dbField)] as string | undefined
      if (g.pulseType === "scale") {
        initial[g.id] = { response: "scale", value: typeof v === "number" ? v : 5, note: n ?? "" }
      } else {
        initial[g.id] = { response: (v as "yes" | "no" | "blocked") || "yes", note: n ?? "" }
      }
    }
    return initial
  })
  const [overallReflection, setOverallReflection] = useState((existingPulseCheck?.overall_reflection as string) ?? "")
  const [dominionScore, setDominionScore] = useState(typeof existingPulseCheck?.g3_dominion === "number" ? existingPulseCheck.g3_dominion : 5)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(() =>
    typeof existingPulseCheck?.id === "string" ? existingPulseCheck.id : null
  )

  useEffect(() => {
    if (typeof existingPulseCheck?.id === "string") {
      setSavedId(existingPulseCheck.id)
    }
  }, [existingPulseCheck?.id])

  const dataHints: Record<string, string> = {
    G1: `This week: ${weekStats.prayerDays}/7 days prayed`,
    G2: `This week: ${weekStats.sermonsTotal} sermons`,
    G3: `Current DOMINION alignment: ${dominionScore}/10`,
    G4: `Intercession completed: ${weekStats.declarationDays}/7 days (proxy)`,
    G5: `Decisions through 5-step card: review your Wisdom Log`,
    G6: `Church & encouragement: review your week`,
    G7: `Insights captured: ${weekStats.downloadsCount} this week`,
  }

  const handleSave = useCallback(
    async (opts?: { silent?: boolean }): Promise<string | null> => {
      if (!opts?.silent) setSaving(true)
      const row: Record<string, unknown> = {
        week_number: weekNumber,
        date: pulseCheckDate,
        quarter_code: quarterCode,
        overall_reflection: overallReflection || null,
        g3_dominion: dominionScore,
      }
      for (const goal of goals) {
        const a = answers[goal.id]
        if (goal.pulseType === "scale") {
          row[goal.dbField] = a && "value" in a ? a.value : dominionScore
        } else {
          const resp =
            a && "response" in a && a.response !== "scale" ? a.response : ("yes" as const)
          row[goal.dbField] = resp
        }
        row[pulseCheckNoteField(goal.dbField)] = a?.note || null
      }
      const id = await onSavePulseCheck(row)
      if (id) {
        setSavedId(id)
        if (!opts?.silent) toast.success("Pulse check saved")
      } else if (!opts?.silent) {
        toast.error("Could not save pulse check. Check the banner above for details.")
      }
      if (!opts?.silent) setSaving(false)
      return id
    },
    [answers, overallReflection, dominionScore, goals, weekNumber, pulseCheckDate, quarterCode, onSavePulseCheck]
  )

  const saveRef = useRef(handleSave)
  saveRef.current = handleSave
  const skipAutoSaveAfterMount = useRef(true)

  useEffect(() => {
    onRegisterSave?.(async () => saveRef.current({ silent: true }))
  }, [onRegisterSave])

  useEffect(() => {
    if (skipAutoSaveAfterMount.current) {
      skipAutoSaveAfterMount.current = false
      return
    }
    const t = setTimeout(() => {
      void saveRef.current({ silent: true })
    }, 2000)
    return () => clearTimeout(t)
  }, [answers, overallReflection, dominionScore])

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#3C1E38]/70">Assess how the week went across all 7 goals. Score from data.</p>
      {dualContextLine && (
        <p className="text-xs text-[#3C1E38]/55 leading-relaxed">{dualContextLine}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Prayer" value={`${weekStats.prayerDays}/7 days`} />
        <StatCard label="Declarations" value={`${weekStats.declarationDays}/7 days`} />
        <StatCard label="Sermons" value={`${weekStats.sermonsTotal} (target: 5)`} />
        <StatCard label="Energy avg" value={`${weekStats.energyAvg.toFixed(1)}/10`} />
        <StatCard label="Downloads" value={`${weekStats.downloadsCount} captured`} />
        <StatCard label="Focus" value={`${weekStats.focusDays}/7 days`} />
      </div>

      <p className="font-medium text-[#3C1E38]">Now score yourself honestly:</p>

      <div className="space-y-4">
        {goals.map((goal) => (
          <GoalPulseRow
            key={goal.id}
            goal={goal}
            dataHint={dataHints[goal.id]}
            answer={answers[goal.id]}
            onChange={(a) => setAnswers((p) => ({ ...p, [goal.id]: a }))}
          />
        ))}
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">Overall DOMINION score (1-10)</p>
        <p className="text-xs text-[#3C1E38]/60">Overall, am I operating from dominion or survival?</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={dominionScore}
            onChange={(e) => setDominionScore(parseInt(e.target.value, 10))}
            className="flex-1 h-2 rounded-lg appearance-none bg-[#A7C2D7]/20 accent-[#F9D57E]"
          />
          <span className="font-playfair text-lg font-bold text-[#3C1E38] w-8">{dominionScore}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3C1E38] mb-1">What defined this week spiritually?</label>
        <textarea
          value={overallReflection}
          onChange={(e) => setOverallReflection(e.target.value)}
          placeholder="Optional reflection..."
          rows={3}
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#A7C2D7]/30 text-[#3C1E38] font-medium text-sm hover:bg-[#A7C2D7]/40 disabled:opacity-50"
        >
          {saving ? "Saving..." : savedId ? "Pulse check saved ✓" : "Save Pulse Check"}
        </button>
        <p className="text-[10px] text-[#3C1E38]/40">Also auto-saves a few seconds after you stop editing.</p>
        {savedId && <span className="text-xs text-emerald-600">Linked to this session</span>}
      </div>

      {weekDownloads.length > 0 && (
        <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2">
          <p className="font-medium text-[#3C1E38]">You captured {weekDownloads.length} divine download(s) this week:</p>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {weekDownloads.map((d) => (
              <li key={d.id} className="text-sm text-[#3C1E38]/80 pl-3 border-l-2 border-[#A7C2D7]/20">
                {d.content?.slice(0, 120)}{d.content && d.content.length > 120 ? "…" : ""}
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#3C1E38]/50">
            <Link href="/app/journal" className="text-[#A7C2D7] hover:underline">Any that became Wisdom Log entries?</Link>
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#A7C2D7]/20 p-3 bg-white">
      <p className="text-xs text-[#3C1E38]/50">{label}</p>
      <p className="font-medium text-[#3C1E38]">{value}</p>
    </div>
  )
}

function GoalPulseRow({
  goal,
  dataHint,
  answer,
  onChange,
}: {
  goal: GoalConfig
  dataHint: string
  answer?: PulseAnswer
  onChange: (a: PulseAnswer) => void
}) {
  const Icon = ICONS[goal.iconKey] ?? Target
  const current = answer ?? (goal.pulseType === "scale" ? { response: "scale" as const, value: 5, note: "" } : { response: "yes" as const, note: "" })

  return (
    <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#A7C2D7]" />
        <span className="text-xs font-medium text-[#3C1E38]/50">{goal.id}</span>
        <span className="font-medium text-[#3C1E38]">{goal.name}</span>
      </div>
      <p className="font-medium text-sm text-[#3C1E38]">{goal.pulseQuestion}</p>
      <p className="text-xs text-[#3C1E38]/50">{dataHint}</p>
      {goal.pulseType === "scale" ? (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={10}
            value={"value" in current ? current.value : 5}
            onChange={(e) => onChange({ response: "scale", value: parseInt(e.target.value, 10), note: current.note })}
            className="flex-1 h-2 rounded-lg accent-[#F9D57E]"
          />
          <span className="text-sm font-medium">{"value" in current ? current.value : 5}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          {(["yes", "no", "blocked"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ response: r, note: current.note })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${"response" in current && current.response === r ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-[#FDFCF9] border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder="Optional note"
        value={current.note}
        onChange={(e) => onChange(goal.pulseType === "scale" ? { ...current, note: e.target.value } as PulseAnswer : { ...current, note: e.target.value } as PulseAnswer)}
        className="w-full px-2 py-1 border border-[#A7C2D7]/20 rounded text-xs"
      />
    </div>
  )
}
