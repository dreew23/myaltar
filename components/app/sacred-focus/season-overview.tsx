"use client"

import { useMemo, useState } from "react"
import { Calendar, BookOpen, Leaf, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import type { SpiritualActivity, JournalEntry, ActivityFruit } from "./types"
import { ENTRY_TYPES, getEntryTypeConfig } from "./types"

interface Props {
  activities: SpiritualActivity[]
  entries: JournalEntry[]
  fruits: ActivityFruit[]
}

function getQuarter(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  const q = Math.floor(d.getMonth() / 3) + 1
  return `Q${q} ${d.getFullYear()}`
}

export function SeasonOverview({ activities, entries, fruits }: Props) {
  const [expandedQuarter, setExpandedQuarter] = useState<string | null>(null)

  // Aggregate stats
  const stats = useMemo(() => ({
    totalActivities: activities.length,
    activeActivities: activities.filter((a) => a.status === "active").length,
    completedActivities: activities.filter((a) => a.status === "completed").length,
    totalEntries: entries.length,
    totalFruits: fruits.length,
    highlights: entries.filter((e) => e.is_highlight).length,
  }), [activities, entries, fruits])

  // Group entries by quarter
  const quarterData = useMemo(() => {
    const map: Record<string, { entries: JournalEntry[]; activities: Set<string>; fruits: ActivityFruit[] }> = {}

    entries.forEach((e) => {
      const q = getQuarter(e.date)
      if (!map[q]) map[q] = { entries: [], activities: new Set(), fruits: [] }
      map[q].entries.push(e)
      map[q].activities.add(e.activity_id)
    })

    fruits.forEach((f) => {
      const q = getQuarter(f.date_recorded)
      if (!map[q]) map[q] = { entries: [], activities: new Set(), fruits: [] }
      map[q].fruits.push(f)
    })

    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([quarter, data]) => ({
        quarter,
        entryCount: data.entries.length,
        activityCount: data.activities.size,
        fruitCount: data.fruits.length,
        entries: data.entries,
        fruits: data.fruits,
        typeCounts: data.entries.reduce((acc, e) => {
          acc[e.entry_type] = (acc[e.entry_type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      }))
  }, [entries, fruits])

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Activities" value={stats.totalActivities} sub={`${stats.activeActivities} active`} />
        <StatCard icon={<BookOpen className="w-4 h-4" />} label="Journal Entries" value={stats.totalEntries} sub={`${stats.highlights} highlights`} />
        <StatCard icon={<Leaf className="w-4 h-4" />} label="Fruits Recorded" value={stats.totalFruits} color="text-[#2E7D32]" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Completed" value={stats.completedActivities} sub="activities" />
      </div>

      {/* Entry type breakdown */}
      {entries.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-4">
          <h3 className="text-xs font-semibold text-[#3C1E38]/50 uppercase tracking-wide mb-3">Entry Types</h3>
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map((t) => {
              const count = entries.filter((e) => e.entry_type === t.key).length
              if (count === 0) return null
              return (
                <span
                  key={t.key}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: `${t.color}15`, color: t.color }}
                >
                  {t.label}: {count}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Quarterly breakdown */}
      {quarterData.length === 0 ? (
        <div className="text-center py-12 text-[#3C1E38]/30">
          <p className="text-sm">No activity data yet. Start a spiritual activity to build your season history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#3C1E38]/50 uppercase tracking-wide">By Quarter</h3>
          {quarterData.map((q) => {
            const isExpanded = expandedQuarter === q.quarter
            return (
              <div key={q.quarter} className="bg-white rounded-xl border border-[#A7C2D7]/10 overflow-hidden">
                <button
                  onClick={() => setExpandedQuarter(isExpanded ? null : q.quarter)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#A7C2D7]/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-[#3C1E38] flex-1">{q.quarter}</span>
                  <span className="text-[10px] text-[#3C1E38]/40">
                    {q.activityCount} activities · {q.entryCount} entries · {q.fruitCount} fruits
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#3C1E38]/30" /> : <ChevronDown className="w-4 h-4 text-[#3C1E38]/30" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#A7C2D7]/10 pt-3">
                    {/* Type distribution */}
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(q.typeCounts)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => {
                          const config = getEntryTypeConfig(type as any)
                          return (
                            <span
                              key={type}
                              className="px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ backgroundColor: `${config.color}12`, color: config.color }}
                            >
                              {config.label} ({count})
                            </span>
                          )
                        })}
                    </div>

                    {/* Recent highlights */}
                    {q.entries.filter((e) => e.is_highlight).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#F9D57E] uppercase tracking-wider mb-1.5">Highlights</p>
                        <div className="space-y-1.5">
                          {q.entries.filter((e) => e.is_highlight).slice(0, 5).map((e) => (
                            <div key={e.id} className="text-xs text-[#3C1E38]/60 pl-3 border-l-2 border-[#F9D57E]/40">
                              <p className="line-clamp-2">{e.content}</p>
                              {e.scripture_reference && (
                                <span className="text-[#A7C2D7] font-garamond italic text-[10px]">{e.scripture_reference}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fruits summary */}
                    {q.fruits.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#2E7D32] uppercase tracking-wider mb-1.5">Fruits</p>
                        <div className="space-y-1">
                          {q.fruits.slice(0, 5).map((f) => (
                            <p key={f.id} className="text-xs text-[#3C1E38]/50 flex items-start gap-1.5">
                              <Leaf className="w-3 h-3 text-[#2E7D32]/40 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{f.description}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: number; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4">
      <div className={`mb-2 ${color ?? "text-[#A7C2D7]"}`}>{icon}</div>
      <p className="text-2xl font-bold text-[#3C1E38]">{value}</p>
      <p className="text-xs text-[#3C1E38]/50">{label}</p>
      {sub && <p className="text-[10px] text-[#3C1E38]/30">{sub}</p>}
    </div>
  )
}
