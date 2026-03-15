"use client"

import { TrendingUp, TrendingDown, Minus, Target, CalendarCheck, Sparkles } from "lucide-react"

interface QuarterHealthProps {
  overallTrajectoryPct: number | null
  trajectoryTrend: "up" | "flat" | "down"
  goalsOnTrack: number
  pulseConsistency: { completed: number; total: number }
  seasonFruits: number
}

export function QuarterHealth({
  overallTrajectoryPct,
  trajectoryTrend,
  goalsOnTrack,
  pulseConsistency,
  seasonFruits,
}: QuarterHealthProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Overall Trajectory */}
      <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
        <p className="text-xs text-[#3C1E38]/50 mb-1">Overall Trajectory</p>
        <div className="flex items-baseline gap-2">
          <span className="font-playfair text-2xl font-bold text-[#3C1E38]">
            {overallTrajectoryPct != null ? `${overallTrajectoryPct}%` : "—"}
          </span>
          {trajectoryTrend === "up" && <TrendingUp className="w-5 h-5 text-emerald-500" />}
          {trajectoryTrend === "flat" && <Minus className="w-5 h-5 text-amber-500" />}
          {trajectoryTrend === "down" && <TrendingDown className="w-5 h-5 text-rose-500" />}
        </div>
        <p className="text-[10px] text-[#3C1E38]/40 mt-1">Quarter Progress</p>
      </div>

      {/* Card 2: Goals On Track */}
      <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
        <p className="text-xs text-[#3C1E38]/50 mb-1">Goals On Track</p>
        <p
          className={`font-playfair text-2xl font-bold ${
            goalsOnTrack >= 5 ? "text-emerald-600" : goalsOnTrack >= 3 ? "text-amber-600" : "text-rose-600"
          }`}
        >
          {goalsOnTrack} of 7
        </p>
        <p className="text-[10px] text-[#3C1E38]/40 mt-1">≥70% progress</p>
      </div>

      {/* Card 3: Pulse Consistency */}
      <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
        <p className="text-xs text-[#3C1E38]/50 mb-1">Pulse Consistency</p>
        <p className="font-playfair text-2xl font-bold text-[#3C1E38]">
          {pulseConsistency.completed} of {pulseConsistency.total} weeks reviewed
        </p>
        <p className="text-[10px] text-[#3C1E38]/40 mt-1">
          Current streak: {pulseConsistency.completed} consecutive
        </p>
      </div>

      {/* Card 4: Season Fruits */}
      <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
        <p className="text-xs text-[#3C1E38]/50 mb-1">Season Fruits</p>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#F9D57E]" />
          <span className="font-playfair text-2xl font-bold text-[#3C1E38]">{seasonFruits}</span>
        </div>
        <p className="text-[10px] text-[#3C1E38]/40 mt-1">Testimonies & fruits this quarter</p>
      </div>
    </div>
  )
}
