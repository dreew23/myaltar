"use client"

import { useState } from "react"
import { Flame, Headphones, Crown, Heart, BookOpen, Target, Scale, Users } from "lucide-react"
import type { GoalConfig } from "@/lib/data/dominion"
import { Sparkline } from "./sparkline"
import { GoalExpanded } from "./goal-expanded"

const ICONS: Record<string, typeof Flame> = {
  flame: Flame,
  headphones: Headphones,
  crown: Crown,
  heart: Heart,
  "book-open": BookOpen,
  target: Target,
  scale: Scale,
  users: Users,
}

interface GoalTrajectoryCardProps {
  goal: GoalConfig
  progressPct: number | null
  sparklineData: { week: number; value: number }[]
  lastPulseResult: string | number | null
  statusBadge: "On Track" | "Watch" | "At Risk" | { blocked: number }
  currentWeek: number
  targetText: string | null
  reflection: string | null
  pulseHistoryDots: string[]
  compactDots?: boolean
}

export function GoalTrajectoryCard({
  goal,
  progressPct,
  sparklineData,
  lastPulseResult,
  statusBadge,
  currentWeek,
  targetText,
  reflection,
  pulseHistoryDots,
  compactDots,
}: GoalTrajectoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = ICONS[goal.iconKey] ?? Target

  const progressColor =
    progressPct == null
      ? "text-[#3C1E38]/20"
      : progressPct >= 70
        ? "text-emerald-500"
        : progressPct >= 40
          ? "text-amber-500"
          : "text-rose-500"

  const ringColor =
    progressPct == null
      ? "stroke-[#3C1E38]/15"
      : progressPct >= 70
        ? "stroke-emerald-500"
        : progressPct >= 40
          ? "stroke-amber-500"
          : "stroke-rose-500"

  const sparklineColorClass =
    progressPct == null
      ? "text-[#3C1E38]/30"
      : progressPct >= 70
        ? "text-emerald-500"
        : progressPct >= 40
          ? "text-amber-500"
          : "text-rose-500"

  const lastDotClass =
    lastPulseResult === "yes"
      ? "bg-emerald-500"
      : lastPulseResult === "no"
        ? "bg-red-400"
        : lastPulseResult === "blocked"
          ? "bg-[#F9D57E]"
          : typeof lastPulseResult === "number"
            ? lastPulseResult >= 7
              ? "bg-emerald-500"
              : lastPulseResult >= 5
                ? "bg-[#F9D57E]"
                : "bg-red-400"
            : "bg-[#3C1E38]/15"

  const statusLabel =
    typeof statusBadge === "string"
      ? statusBadge
      : `⚠️ ${statusBadge.blocked} weeks blocked`
  const statusBgClass =
    statusLabel === "On Track"
      ? "bg-emerald-100 text-emerald-700"
      : statusLabel.startsWith("Watch")
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700"

  return (
    <div
      className="bg-white rounded-xl border border-[#A7C2D7]/10 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        {/* Top row: icon + code + title | progress ring */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 text-[#A7C2D7] flex-shrink-0" />
            <span className="text-xs font-semibold text-[#3C1E38]/60">{goal.id}</span>
            <span className="text-sm font-medium text-[#3C1E38] truncate">{goal.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center">
              <span className={`text-xs font-bold ${progressColor}`}>
                {progressPct != null ? `${progressPct}%` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: sparkline */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Sparkline
            data={sparklineData}
            colorClass={sparklineColorClass}
            currentWeek={currentWeek}
            compactDots={compactDots}
          />
        </div>

        {/* Bottom: status badge + last pulse dot */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBgClass}`}>
            {statusLabel}
          </span>
          <div className={`w-2.5 h-2.5 rounded-full ${lastDotClass}`} title="Last pulse" />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <GoalExpanded
            goal={goal}
            targetText={targetText}
            reflection={reflection}
            pulseHistoryDots={pulseHistoryDots}
          />
        </div>
      )}
    </div>
  )
}
