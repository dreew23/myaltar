"use client"

import { useState } from "react"
import { TIME_CATEGORIES, CONSTRAINT_CHIPS } from "@/lib/pulse"

function defaultHours(): Record<string, number> {
  return Object.fromEntries(TIME_CATEGORIES.map((c) => [c.key, 0]))
}

function parseHoursJson(s: string | null | undefined): Record<string, number> | null {
  if (!s?.trim()) return null
  try {
    const o = JSON.parse(s) as Record<string, number>
    if (o && typeof o === "object") return o
  } catch {
    /* ignore */
  }
  return null
}

function deriveConstraintUi(saved: string | null | undefined): { chip: string | null; details: string } {
  if (!saved?.trim()) return { chip: null, details: "" }
  for (const c of CONSTRAINT_CHIPS) {
    if (saved === c) return { chip: c, details: "" }
    if (saved.startsWith(c + ". ") || saved.startsWith(c + ".")) {
      return { chip: c, details: saved.slice(c.length).replace(/^\.?\s*/, "") }
    }
  }
  return { chip: null, details: saved }
}

function declarationPreview(full: string | null | undefined): string | null {
  if (!full?.trim()) return null
  const i = full.indexOf(" — ")
  return i >= 0 ? full.slice(0, i) : full
}

interface Phase4LearnProps {
  /** This session's saved `phase4_time_analysis` JSON (authoritative for the hour grid). */
  sessionTimeAnalysisJson: string
  /** Prior session's time JSON — hint text only. */
  lastWeekTimeAnalysis: string | null
  sessionConstraintText: string | null
  sessionDeclarationReviewed: string | null
  declarations: { id: string; content: string; scripture_reference: string }[]
  onTimeAnalysisChange: (json: string) => void
  onConstraintChange: (text: string) => void
  onDeclarationReviewedChange: (text: string) => void
}

export function Phase4Learn({
  sessionTimeAnalysisJson,
  lastWeekTimeAnalysis,
  sessionConstraintText,
  sessionDeclarationReviewed,
  declarations,
  onTimeAnalysisChange,
  onConstraintChange,
  onDeclarationReviewedChange,
}: Phase4LearnProps) {
  const initConstraint = deriveConstraintUi(sessionConstraintText)
  const [hours, setHours] = useState<Record<string, number>>(() => {
    return (
      parseHoursJson(sessionTimeAnalysisJson) ??
      parseHoursJson(lastWeekTimeAnalysis) ??
      defaultHours()
    )
  })
  const [constraintChip, setConstraintChip] = useState<string | null>(() => initConstraint.chip)
  const [constraintDetails, setConstraintDetails] = useState(() => initConstraint.details)
  const [deprioritize, setDeprioritize] = useState("")
  const [reviewedDeclaration, setReviewedDeclaration] = useState<string | null>(() =>
    declarationPreview(sessionDeclarationReviewed)
  )

  const totalHours = Object.values(hours).reduce((a, b) => a + b, 0)

  const updateHours = (key: string, value: number) => {
    const next = { ...hours, [key]: value }
    setHours(next)
    onTimeAnalysisChange(JSON.stringify(next))
  }

  const krystalHours = hours["krystal"] ?? 0
  const tpmHours = hours["tpm_academy"] ?? 0
  const restHours = hours["rest"] ?? 0

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#3C1E38]/70">Before planning next week, analyze patterns. Where did your time actually go?</p>

      {lastWeekTimeAnalysis && lastWeekTimeAnalysis !== sessionTimeAnalysisJson && (
        <p className="text-xs text-[#3C1E38]/50">
          Reference — previous session time snapshot: {lastWeekTimeAnalysis.slice(0, 120)}
          {lastWeekTimeAnalysis.length > 120 ? "…" : ""}
        </p>
      )}

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">Roughly estimate hours in each category (past week):</p>
        {TIME_CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-4">
            <label className="w-32 text-sm text-[#3C1E38]/80">{cat.label}</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={hours[cat.key] ?? 0}
              onChange={(e) => updateHours(cat.key, parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-[#A7C2D7]/20 rounded text-sm"
            />
            <span className="text-xs text-[#3C1E38]/50">hours</span>
            {"maxHours" in cat && (hours[cat.key] ?? 0) > (cat.maxHours ?? 0) && (
              <span className="text-amber-600 text-xs">⚠️ Max {cat.maxHours}h</span>
            )}
          </div>
        ))}
        <p className="text-sm text-[#3C1E38]/60">Total: {totalHours.toFixed(1)} hours</p>
        {krystalHours > 15 && <p className="text-amber-600 text-sm">⚠️ Krystal exceeded 15hr boundary (entered: {krystalHours}h).</p>}
        {tpmHours > 8 && <p className="text-amber-600 text-sm">⚠️ TPM Academy exceeded 8hr boundary (entered: {tpmHours}h).</p>}
        {restHours < 10 && totalHours > 0 && <p className="text-amber-600 text-sm">Your rest hours are low. SCD needs margin.</p>}
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">What&apos;s different about next week?</p>
        <div className="flex flex-wrap gap-2">
          {CONSTRAINT_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                const nextChip = constraintChip === c ? null : c
                setConstraintChip(nextChip)
                const text = nextChip ? nextChip + (constraintDetails ? ". " + constraintDetails : "") : constraintDetails
                onConstraintChange(text)
              }}
              className={`px-3 py-1.5 rounded-full text-sm ${constraintChip === c ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-[#FDFCF9] border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs text-[#3C1E38]/50 mb-1">Details</label>
          <input
            type="text"
            value={constraintDetails}
            onChange={(e) => {
              setConstraintDetails(e.target.value)
              onConstraintChange((constraintChip ?? "") + (e.target.value ? ". " + e.target.value : ""))
            }}
            placeholder="Optional details..."
            className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm"
          />
        </div>
        {constraintChip && constraintChip !== "Nothing unusual" && (
          <div>
            <label className="block text-xs text-[#3C1E38]/50 mb-1">Given this constraint, what will you deliberately deprioritize?</label>
            <input
              type="text"
              value={deprioritize}
              onChange={(e) => setDeprioritize(e.target.value)}
              placeholder="Weekly NOT NOW — temporary"
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm"
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[#A7C2D7]/20 p-4 space-y-3">
        <p className="font-medium text-[#3C1E38]">Review one declaration or principle before planning:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const idx = Math.floor(Math.random() * declarations.length)
              const d = declarations[idx]
              if (d) {
                setReviewedDeclaration(d.content)
                onDeclarationReviewedChange(d.content + " — " + d.scripture_reference)
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#A7C2D7]/20 text-[#3C1E38] text-sm"
          >
            Random DOMINION declaration
          </button>
        </div>
        {reviewedDeclaration && (
          <blockquote className="font-garamond text-sm italic text-[#3C1E38]/80 pl-4 border-l-2 border-[#F9D57E]/50 py-2">
            {reviewedDeclaration}
          </blockquote>
        )}
      </div>
    </div>
  )
}
