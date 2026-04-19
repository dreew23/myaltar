"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { WisdomEntry } from "@/lib/wisdom-log"
import type { AlignedDecision } from "@/lib/wisdom-log"
import { WISDOM_ENTRY_TYPES, GOAL_CODES } from "@/lib/wisdom-log"
import { getQuarterProgress } from "@/lib/data/dominion"

interface Props {
  entries: WisdomEntry[]
  decisions: AlignedDecision[]
}

const TYPE_COLORS = [
  "#F9D57E", "#A78BFA", "#FBBF24", "#FB7185", "#EC4899",
  "#3B82F6", "#14B8A6", "#6366F1", "#10B981",
]

export function InsightsDashboard({ entries, decisions }: Props) {
  const quarter = getQuarterProgress()

  const entriesByMonth = useMemo(() => {
    type MonthRow = { month: string; total: number; byLabel: Record<string, number> }
    const byMonth: Record<string, MonthRow> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`
      const labels: Record<string, number> = {}
      WISDOM_ENTRY_TYPES.forEach((t) => {
        labels[t.label] = 0
      })
      byMonth[key] = { month: key, total: 0, byLabel: labels }
    }
    entries.forEach((e) => {
      const d = new Date(e.date)
      const key = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getFullYear()}`
      const row = byMonth[key]
      if (row) {
        row.total += 1
        const label = WISDOM_ENTRY_TYPES.find((t) => t.value === e.entry_type)?.label ?? "Other"
        row.byLabel[label] = (row.byLabel[label] ?? 0) + 1
      }
    })
    return Object.values(byMonth)
      .slice(-12)
      .map(({ month, total, byLabel }) => ({ month, total, ...byLabel }))
  }, [entries])

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    WISDOM_ENTRY_TYPES.forEach((t) => { counts[t.label] = 0 })
    entries.forEach((e) => {
      const label = WISDOM_ENTRY_TYPES.find((t) => t.value === e.entry_type)?.label ?? "Other"
      counts[label] = (counts[label] ?? 0) + 1
    })
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
  }, [entries])

  const lifeAreaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      (e.life_areas ?? []).forEach((area) => {
        counts[area] = (counts[area] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [entries])

  const goalCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    GOAL_CODES.forEach((g) => { counts[g] = 0 })
    entries.forEach((e) => {
      if (e.connected_goal_code) counts[e.connected_goal_code] = (counts[e.connected_goal_code] ?? 0) + 1
    })
    const unlinked = entries.filter((e) => !e.connected_goal_code).length
    return [
      ...Object.entries(counts).map(([name, count]) => ({ name, count })),
      ...(unlinked > 0 ? [{ name: "Unlinked", count: unlinked }] : []),
    ]
  }, [entries])

  const shareableCount = useMemo(() => entries.filter((e) => e.shareable).length, [entries])
  const shareableTestimony = useMemo(
    () => entries.filter((e) => e.shareable && e.entry_type === "testimony").length,
    [entries]
  )

  const decisionsWithOutcome = useMemo(() => decisions.filter((d) => d.outcome != null && d.outcome !== ""), [decisions])
  const avgOutcomeRating = useMemo(() => {
    const withRating = decisionsWithOutcome.filter((d) => d.outcome_rating != null)
    if (withRating.length === 0) return null
    return withRating.reduce((s, d) => s + (d.outcome_rating ?? 0), 0) / withRating.length
  }, [decisionsWithOutcome])
  const bestDecision = useMemo(() => {
    const withRating = decisionsWithOutcome.filter((d) => d.outcome_rating != null)
    if (withRating.length === 0) return null
    return withRating.sort((a, b) => (b.outcome_rating ?? 0) - (a.outcome_rating ?? 0))[0]
  }, [decisionsWithOutcome])

  const thisMonthEntries = useMemo(
    () => entries.filter((e) => new Date(e.date).getMonth() === new Date().getMonth()).length,
    [entries]
  )
  const thisMonthDecisions = useMemo(
    () => decisions.filter((d) => new Date(d.date).getMonth() === new Date().getMonth()).length,
    [decisions]
  )
  const thisMonthTestimonies = useMemo(
    () => entries.filter((e) => e.entry_type === "testimony" && new Date(e.date).getMonth() === new Date().getMonth()).length,
    [entries]
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Insights Dashboard</h1>
        <p className="text-[#3C1E38]/50 text-sm mt-1">Wisdom accumulation and decision effectiveness</p>
      </div>

      {/* Wisdom growth chart */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-4">Wisdom Growth</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={entriesByMonth} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#A7C2D7" name="Entries" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Type distribution */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-4">Type Distribution</h2>
        {typeDistribution.length === 0 ? (
          <p className="text-[#3C1E38]/50 text-sm">No entries yet</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeDistribution.map((_, i) => (
                    <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Entries"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Life area coverage */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-4">Life Area Coverage</h2>
        {lifeAreaCounts.length === 0 ? (
          <p className="text-[#3C1E38]/50 text-sm">No life areas tagged yet</p>
        ) : (
          <div className="space-y-2">
            {lifeAreaCounts.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-[#3C1E38]/80">{name}</span>
                <span className="font-medium text-[#3C1E38]">{count} entries</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal connections */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-4">Goal Connections</h2>
        <div className="space-y-2">
          {goalCounts.map(({ name, count }) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span className="text-[#3C1E38]/80">{name}</span>
              <span className="font-medium text-[#3C1E38]">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shareable pipeline */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-4">Shareable Content (G7)</h2>
        <p className="text-[#3C1E38]/80">{shareableCount} entries marked shareable</p>
        <p className="text-sm text-[#3C1E38]/60 mt-1">{shareableTestimony} of those are testimony type</p>
      </div>

      {/* Decision effectiveness */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-4">Decision Effectiveness</h2>
        {decisionsWithOutcome.length === 0 ? (
          <p className="text-[#3C1E38]/50 text-sm">No outcomes recorded yet</p>
        ) : (
          <>
            {avgOutcomeRating != null && (
              <p className="text-[#3C1E38]/80">Average outcome rating: {avgOutcomeRating.toFixed(1)}/5</p>
            )}
            {bestDecision && (
              <p className="text-sm text-[#3C1E38]/70 mt-2">
                Best decision: {bestDecision.description.slice(0, 50)}… — {bestDecision.outcome?.slice(0, 40)}…
              </p>
            )}
            <p className="text-sm text-[#3C1E38]/50 mt-2">
              {decisions.filter((d) => !d.outcome).length} decisions awaiting outcomes
            </p>
          </>
        )}
      </div>

      {/* Quarter summary */}
      <div className="bg-[#FDFCF9] rounded-2xl border border-[#A7C2D7]/10 p-4">
        <h2 className="font-playfair font-semibold text-[#3C1E38] mb-2">Quarter Summary</h2>
        <p className="text-sm text-[#3C1E38]/70">
          Year {quarter.year}, Week {quarter.weekInQuarter}: {thisMonthEntries} wisdom entries this month, {thisMonthDecisions} decisions, {thisMonthTestimonies} testimonies.
        </p>
      </div>
    </div>
  )
}
