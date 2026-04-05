"use client"

import { ChevronDown, ChevronRight, CheckCircle2, Circle, SkipForward } from "lucide-react"

export type PhaseStatus = "not_started" | "in_progress" | "complete" | "skipped"

interface PhaseCardProps {
  phaseNumber: number
  title: string
  estimate: string
  status: PhaseStatus
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  onMarkComplete?: () => void
  onSkip?: () => void
  canSkip?: boolean
}

export function PhaseCard({
  phaseNumber,
  title,
  estimate,
  status,
  expanded,
  onToggle,
  children,
  onMarkComplete,
  onSkip,
  canSkip = true,
}: PhaseCardProps) {
  const statusIcon = () => {
    if (status === "complete") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    if (status === "skipped") return <SkipForward className="w-5 h-5 text-[#3C1E38]/40" />
    if (status === "in_progress") return <Circle className="w-5 h-5 text-[#F9D57E] fill-[#F9D57E]/30" />
    return <Circle className="w-5 h-5 text-[#3C1E38]/30" />
  }

  return (
    <div
      className={`rounded-xl border transition-all ${status === "complete" ? "border-emerald-200 bg-emerald-50/30" : status === "skipped" ? "border-[#A7C2D7]/10 bg-[#FDFCF9]" : "border-[#A7C2D7]/20 bg-white"} ${expanded ? "ring-2 ring-[#F9D57E]/40" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#FDFCF9]/80 transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#A7C2D7]/15 text-[#3C1E38] font-playfair font-bold text-sm">
          {phaseNumber}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#3C1E38]">{title}</p>
          <p className="text-xs text-[#3C1E38]/50">{estimate}</p>
        </div>
        <span className="flex-shrink-0">{statusIcon()}</span>
        {expanded ? <ChevronDown className="w-4 h-4 text-[#3C1E38]/40" /> : <ChevronRight className="w-4 h-4 text-[#3C1E38]/40" />}
      </button>
      {/* Always render body (no collapse / zero-height) — hiding was still losing ticks & inputs for some users. */}
      <div className="px-4 pb-4 pt-1 border-t border-[#A7C2D7]/10 space-y-4">
        {children}
        <div className="flex items-center gap-3 pt-2">
          {onMarkComplete && status !== "complete" && status !== "skipped" && (
            <button
              type="button"
              onClick={onMarkComplete}
              className="px-4 py-2 rounded-lg bg-[#A7C2D7]/20 text-[#3C1E38] font-medium text-sm hover:bg-[#A7C2D7]/30 transition-colors"
            >
              Mark Complete
            </button>
          )}
          {onSkip && canSkip && status !== "skipped" && (
            <button type="button" onClick={onSkip} className="text-xs text-[#3C1E38]/50 hover:text-[#3C1E38]/70 underline">
              Skip phase
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
