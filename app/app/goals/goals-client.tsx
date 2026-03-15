"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { GoalConfig } from "@/lib/data/dominion"
import { getQuarterProgress } from "@/lib/data/dominion"
import { QuarterHealth } from "@/components/app/goals/quarter-health"
import { GoalTrajectoryCard } from "@/components/app/goals/goal-trajectory-card"
import { NotNowOverview } from "@/components/app/goals/not-now-overview"
import { QuarterTimeline } from "@/components/app/goals/quarter-timeline"
import { YearView } from "@/components/app/goals/year-view"

interface PulseCheck {
  id: string
  user_id: string
  week_number: number
  date: string
  quarter_code: string
  g1_prayer: string | null
  g2_sermons: string | null
  g3_dominion: number | null
  g4_warfare: string | null
  g5_decisions: string | null
  g6_community: string | null
  g7_content: string | null
  [key: string]: unknown
}

interface GoalNote {
  id: string
  user_id: string
  goal_id: string
  target_text: string | null
  reflection: string | null
  updated_at: string
}

interface Devotion {
  date: string
  prayer_complete?: boolean
  sermons_today?: number
  energy_score?: number
}

interface Props {
  goals: GoalConfig[]
  pulseChecks: PulseCheck[]
  goalNotes: GoalNote[]
  devotions: Devotion[]
  quarterConfig: ReturnType<typeof getQuarterProgress>
  quarterCode: string
  quarterStartStr: string
  quarterEndStr: string
  seasonFruits: number
  pulseConsistency: { completed: number; total: number }
  yearFruits: {
    testimonies: number
    answeredPrayers: number
    wisdomEntries: number
    prayerSessions: number
    declarationsSpoken: number
  }
  userId: string
}

function getWeekOfQuarter(dateStr: string, quarterStartStr: string): number {
  const start = new Date(quarterStartStr + "T12:00:00").getTime()
  const d = new Date(dateStr + "T12:00:00").getTime()
  const days = Math.floor((d - start) / 86400000)
  return Math.min(13, Math.max(1, Math.floor(days / 7) + 1))
}

function getGoalResponse(check: PulseCheck, goal: GoalConfig): string | number | null {
  const field = goal.dbField as keyof PulseCheck
  return check[field] as string | number | null
}

export function GoalsClient({
  goals,
  pulseChecks,
  goalNotes,
  devotions,
  quarterConfig,
  quarterCode,
  quarterStartStr,
  seasonFruits,
  pulseConsistency,
  yearFruits,
}: Props) {
  const [tab, setTab] = useState<"quarter" | "year">("quarter")
  const currentWeek = quarterConfig.weekInQuarter

  const daysInQuarterSoFar = useMemo(() => {
    const start = new Date(quarterStartStr + "T12:00:00").getTime()
    const end = Math.min(Date.now(), new Date(quarterStartStr).setMonth(new Date(quarterStartStr).getMonth() + 3))
    return Math.max(1, Math.floor((end - start) / 86400000))
  }, [quarterStartStr])

  const weeksElapsed = Math.max(1, Math.ceil(daysInQuarterSoFar / 7))

  const goalProgress = useMemo(() => {
    const progress: Record<string, number | null> = {}
    const quarterPulse = pulseChecks.filter((c) => c.quarter_code === quarterCode)

    const prayerDays = devotions.filter((d) => d.prayer_complete).length
    progress.G1 = daysInQuarterSoFar > 0 ? Math.round((prayerDays / daysInQuarterSoFar) * 100) : null

    const totalSermons = devotions.reduce((s, d) => s + (d.sermons_today || 0), 0)
    progress.G2 =
      weeksElapsed > 0
        ? Math.min(100, Math.round((totalSermons / (weeksElapsed * 5)) * 100))
        : null

    const g3Scores = quarterPulse
      .map((c) => c.g3_dominion)
      .filter((v): v is number => typeof v === "number" && v >= 1 && v <= 10)
    progress.G3 =
      g3Scores.length > 0
        ? Math.round((g3Scores.reduce((a, b) => a + b, 0) / g3Scores.length / 10) * 100)
        : null

    for (const goal of goals.slice(3)) {
      const field = goal.dbField as keyof PulseCheck
      if (quarterPulse.length === 0) {
        progress[goal.id] = null
        continue
      }
      const yesCount = quarterPulse.filter((c) => c[field] === "yes").length
      progress[goal.id] = Math.round((yesCount / quarterPulse.length) * 100)
    }

    return progress
  }, [devotions, pulseChecks, quarterCode, daysInQuarterSoFar, weeksElapsed])

  const sparklineDataByGoal = useMemo(() => {
    const byGoal: Record<string, { week: number; value: number }[]> = {}
    for (const goal of goals) {
      const arr: { week: number; value: number }[] = []
      for (const check of pulseChecks) {
        if (check.quarter_code !== quarterCode) continue
        const week = getWeekOfQuarter(check.date, quarterStartStr)
        const val = getGoalResponse(check, goal)
        if (goal.pulseType === "scale" && typeof val === "number") {
          arr.push({ week, value: val / 10 })
        } else if (val === "yes") {
          arr.push({ week, value: 1 })
        } else if (val === "blocked") {
          arr.push({ week, value: 0.5 })
        } else if (val === "no") {
          arr.push({ week, value: 0 })
        }
      }
      byGoal[goal.id] = arr
    }
    return byGoal
  }, [pulseChecks, quarterCode, quarterStartStr])

  const lastPulseByGoal = useMemo(() => {
    const sorted = [...pulseChecks].filter((c) => c.quarter_code === quarterCode).sort((a, b) => b.date.localeCompare(a.date))
    const first = sorted[0]
    const out: Record<string, string | number | null> = {}
    if (!first) return out
    for (const goal of goals) {
      out[goal.id] = getGoalResponse(first, goal)
    }
    return out
  }, [pulseChecks, quarterCode])

  const statusBadgeByGoal = useMemo(() => {
    const out: Record<string, "On Track" | "Watch" | "At Risk" | { blocked: number }> = {}
    const quarterPulse = pulseChecks.filter((c) => c.quarter_code === quarterCode).sort((a, b) => b.date.localeCompare(a.date))
    for (const goal of goals) {
      const pct = goalProgress[goal.id]
      let consecutive = 0
      for (const check of quarterPulse) {
        const v = getGoalResponse(check, goal)
        if (v === "no" || v === "blocked") consecutive++
        else break
      }
      if (consecutive >= 2) {
        out[goal.id] = { blocked: consecutive }
      } else if (pct == null) {
        out[goal.id] = "At Risk"
      } else if (pct >= 70) {
        out[goal.id] = "On Track"
      } else if (pct >= 40) {
        out[goal.id] = "Watch"
      } else {
        out[goal.id] = "At Risk"
      }
    }
    return out
  }, [pulseChecks, quarterCode, goalProgress])

  const pulseHistoryDotsByGoal = useMemo(() => {
    const byGoal: Record<string, string[]> = {}
    for (const goal of goals) {
      const dots: string[] = []
      for (let w = 1; w <= 13; w++) {
        const check = pulseChecks.find(
          (c) => c.quarter_code === quarterCode && getWeekOfQuarter(c.date, quarterStartStr) === w
        )
        const v = check ? getGoalResponse(check, goal) : null
        if (v === "yes") dots.push("bg-emerald-500")
        else if (v === "no") dots.push("bg-red-400")
        else if (v === "blocked") dots.push("bg-[#F9D57E]")
        else if (typeof v === "number") dots.push(v >= 7 ? "bg-emerald-500" : v >= 5 ? "bg-[#F9D57E]" : "bg-red-400")
        else dots.push("bg-[#3C1E38]/15")
      }
      byGoal[goal.id] = dots
    }
    return byGoal
  }, [pulseChecks, quarterCode, quarterStartStr])

  const quarterTimelineWeeks = useMemo(() => {
    const weeks: ("yes" | "no" | "blocked" | null)[][] = Array.from({ length: 13 }, () => [])
    for (let w = 1; w <= 13; w++) {
      const check = pulseChecks.find(
        (c) => c.quarter_code === quarterCode && getWeekOfQuarter(c.date, quarterStartStr) === w
      )
      for (const goal of goals) {
        const v = check ? getGoalResponse(check, goal) : null
        weeks[w - 1].push(
          v === "yes" ? "yes" : v === "no" ? "no" : v === "blocked" ? "blocked" : null
        )
      }
    }
    return weeks
  }, [pulseChecks, quarterCode, quarterStartStr])

  const overallTrajectoryPct = useMemo(() => {
    const vals = goals.map((g) => goalProgress[g.id]).filter((v): v is number => v != null)
    if (vals.length === 0) return null
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [goalProgress])

  const trajectoryTrend = useMemo((): "up" | "flat" | "down" => {
    const twoWeeksAgo = currentWeek - 2
    if (twoWeeksAgo < 1 || pulseChecks.length < 2) return "flat"
    const recentChecks = pulseChecks.filter(
      (c) => c.quarter_code === quarterCode && getWeekOfQuarter(c.date, quarterStartStr) > twoWeeksAgo
    )
    const olderChecks = pulseChecks.filter(
      (c) => c.quarter_code === quarterCode && getWeekOfQuarter(c.date, quarterStartStr) <= twoWeeksAgo
    )
    if (olderChecks.length === 0) return "flat"
    const score = (check: PulseCheck) =>
      goals.reduce((sum, g) => {
        const v = getGoalResponse(check, g)
        if (g.pulseType === "scale" && typeof v === "number") return sum + v * 10
        if (v === "yes") return sum + 100
        if (v === "blocked") return sum + 50
        return sum
      }, 0) / goals.length
    const recentAvg = recentChecks.length > 0 ? recentChecks.reduce((a, c) => a + score(c), 0) / recentChecks.length : 0
    const olderAvg = olderChecks.reduce((a, c) => a + score(c), 0) / olderChecks.length
    const diff = recentAvg - olderAvg
    if (diff > 3) return "up"
    if (diff < -3) return "down"
    return "flat"
  }, [pulseChecks, quarterCode, quarterStartStr, currentWeek])

  const goalsOnTrack = useMemo(
    () => goals.filter((g) => (goalProgress[g.id] ?? 0) >= 70).length,
    [goalProgress]
  )

  const notNowTotal = useMemo(() => goals.reduce((sum, g) => sum + g.notNow.length, 0), [])

  const quarterSummaries: Record<number, string> = useMemo(() => {
    const q = quarterConfig.quarter
    return {
      [q]: `Week ${currentWeek} of 13 — ${overallTrajectoryPct ?? 0}% overall`,
    }
  }, [quarterConfig.quarter, currentWeek, overallTrajectoryPct])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Spiritual Goals</h1>
          <p className="text-sm text-[#3C1E38]/60 mt-1">
            Your DOMINION journey — Quarter & Year trajectory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#3C1E38]/70">
            Year {quarterConfig.year}: {quarterConfig.phaseName}
          </span>
          <span className="text-xs text-[#3C1E38]/50">
            Week {currentWeek} of {quarterConfig.totalWeeks}
          </span>
          <div className="w-8 h-8 rounded-full border-2 border-[#A7C2D7] flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#3C1E38]">
              {currentWeek}/{quarterConfig.totalWeeks}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#A7C2D7]/15 pb-2">
        <button
          type="button"
          onClick={() => setTab("quarter")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "quarter"
              ? "bg-[#A7C2D7]/20 text-[#3C1E38]"
              : "text-[#3C1E38]/50 hover:text-[#3C1E38]"
          }`}
        >
          Quarter View
        </button>
        <button
          type="button"
          onClick={() => setTab("year")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "year"
              ? "bg-[#A7C2D7]/20 text-[#3C1E38]"
              : "text-[#3C1E38]/50 hover:text-[#3C1E38]"
          }`}
        >
          Year View
        </button>
      </div>

      {tab === "quarter" && (
        <>
          <QuarterHealth
            overallTrajectoryPct={overallTrajectoryPct}
            trajectoryTrend={trajectoryTrend}
            goalsOnTrack={goalsOnTrack}
            pulseConsistency={pulseConsistency}
            seasonFruits={seasonFruits}
          />

          <section>
            <h2 className="font-playfair font-bold text-[#3C1E38] mb-3">The 7 Goals — Trajectory</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalTrajectoryCard
                  key={goal.id}
                  goal={goal}
                  progressPct={goalProgress[goal.id]}
                  sparklineData={sparklineDataByGoal[goal.id] ?? []}
                  lastPulseResult={lastPulseByGoal[goal.id] ?? null}
                  statusBadge={statusBadgeByGoal[goal.id] ?? "At Risk"}
                  currentWeek={currentWeek}
                  targetText={goalNotes.find((n) => n.goal_id === goal.id)?.target_text ?? null}
                  reflection={goalNotes.find((n) => n.goal_id === goal.id)?.reflection ?? null}
                  pulseHistoryDots={pulseHistoryDotsByGoal[goal.id] ?? []}
                />
              ))}
            </div>
          </section>

          <NotNowOverview goals={goals} totalCount={notNowTotal} />

          <QuarterTimeline weeks={quarterTimelineWeeks} currentWeek={currentWeek} />

          <div className="pt-4">
            <Link
              href="/app/pulse"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#A7C2D7] hover:underline"
            >
              Start Weekly Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}

      {tab === "year" && (
        <YearView
          currentQuarterId={quarterConfig.quarter}
          quarterSummaries={quarterSummaries}
          yearFruits={yearFruits}
        />
      )}
    </div>
  )
}
