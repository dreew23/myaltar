"use client"

import { useState, useEffect, useMemo } from "react"
import { Flame, Trophy, Hash, ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { localCalendarDateString } from "@/lib/prayer-week"
import type { Declaration, DeclarationLog } from "./types"

interface Props {
  declarations: Declaration[]
  userId: string
}

type FilterKey = "all" | "completed" | "missed" | "week" | "month"

export function History({ declarations, userId }: Props) {
  const supabase = createClient()
  const [logs, setLogs] = useState<DeclarationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 14

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const from = page * pageSize
      const { data } = await supabase
        .from("declaration_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .range(from, from + pageSize * 7 - 1) // fetch enough rows (7 per day * days)
      setLogs((prev) => page === 0 ? (data ?? []) : [...prev, ...(data ?? [])])
      setLoading(false)
    }
    fetch()
  }, [supabase, userId, page])

  // Group logs by date
  const days = useMemo(() => {
    const map = new Map<string, DeclarationLog[]>()
    logs.forEach((l) => {
      const existing = map.get(l.date) ?? []
      existing.push(l)
      map.set(l.date, existing)
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
  }, [logs])

  // Streaks
  const { currentStreak, longestStreak, totalSpoken } = useMemo(() => {
    const declCount = declarations.length
    if (declCount === 0) return { currentStreak: 0, longestStreak: 0, totalSpoken: 0 }

    let totalSpoken = 0
    const completeDates = new Set<string>()

    const dateMap = new Map<string, number>()
    logs.forEach((l) => {
      totalSpoken += l.current_count
      if (l.completed) {
        dateMap.set(l.date, (dateMap.get(l.date) ?? 0) + 1)
      }
    })
    dateMap.forEach((count, date) => {
      if (count >= declCount) completeDates.add(date)
    })

    // Calculate streaks from sorted dates
    const sortedDates = Array.from(completeDates).sort().reverse()
    let currentStreak = 0
    let longestStreak = 0
    let streak = 0
    const today = localCalendarDateString()

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i]
      if (i === 0) {
        // Check if streak is current (today or yesterday)
        const diff = Math.floor((new Date(today).getTime() - new Date(date).getTime()) / 86400000)
        if (diff > 1) { streak = 0; break }
        streak = 1
      } else {
        const prev = new Date(sortedDates[i - 1])
        const curr = new Date(date)
        const diff = Math.floor((prev.getTime() - curr.getTime()) / 86400000)
        if (diff === 1) streak++
        else break
      }
    }
    currentStreak = streak

    // Longest streak (simplified: scan all sorted dates)
    streak = 0
    const allSorted = Array.from(completeDates).sort()
    for (let i = 0; i < allSorted.length; i++) {
      if (i === 0) { streak = 1 }
      else {
        const prev = new Date(allSorted[i - 1])
        const curr = new Date(allSorted[i])
        const diff = Math.floor((curr.getTime() - prev.getTime()) / 86400000)
        if (diff === 1) streak++
        else streak = 1
      }
      longestStreak = Math.max(longestStreak, streak)
    }

    return { currentStreak, longestStreak, totalSpoken }
  }, [logs, declarations])

  // Filters
  const filtered = useMemo(() => {
    const declCount = declarations.length
    const now = new Date()
    return days.filter(([date, dayLogs]) => {
      const d = new Date(date + "T12:00:00")
      const completedCount = dayLogs.filter((l) => l.completed).length
      const allDone = completedCount >= declCount

      if (filter === "completed") return allDone
      if (filter === "missed") return !allDone
      if (filter === "week") {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return d >= weekAgo
      }
      if (filter === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [days, filter, declarations])

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All Days" },
    { key: "completed", label: "Completed" },
    { key: "missed", label: "Missed" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ]

  return (
    <div className="space-y-6">
      {/* Streak & Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4 text-center">
          <Flame className={`w-5 h-5 mx-auto mb-1 ${currentStreak > 0 ? "text-emerald-500" : "text-[#3C1E38]/20"}`} />
          <p className={`font-playfair text-2xl font-bold ${currentStreak > 0 ? "text-emerald-600" : "text-[#3C1E38]/30"}`}>{currentStreak}</p>
          <p className="text-[10px] text-[#3C1E38]/40 uppercase tracking-wide">Current Streak</p>
        </div>
        <div className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-[#F9D57E]" />
          <p className="font-playfair text-2xl font-bold text-[#F9D57E]">{longestStreak}</p>
          <p className="text-[10px] text-[#3C1E38]/40 uppercase tracking-wide">Longest Streak</p>
        </div>
        <div className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4 text-center">
          <Hash className="w-5 h-5 mx-auto mb-1 text-[#A7C2D7]" />
          <p className="font-playfair text-2xl font-bold text-[#3C1E38]">{totalSpoken.toLocaleString()}</p>
          <p className="text-[10px] text-[#3C1E38]/40 uppercase tracking-wide">Total Spoken</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === f.key ? "bg-[#3C1E38] text-white border-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/50 hover:border-[#A7C2D7]/40"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Daily log */}
      <div className="bg-white rounded-xl border border-[#A7C2D7]/10 overflow-hidden divide-y divide-[#A7C2D7]/10">
        {loading && days.length === 0 && (
          <div className="p-8 text-center text-[#3C1E38]/30 text-sm">Loading history...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-[#3C1E38]/30 text-sm">No history yet — start reciting!</div>
        )}

        {filtered.map(([date, dayLogs]) => {
          const declCount = declarations.length
          const completedCount = dayLogs.filter((l) => l.completed).length
          const allDone = completedCount >= declCount
          const isExpanded = expanded === date
          const d = new Date(date + "T12:00:00")

          return (
            <div key={date} className={allDone ? "border-l-[3px] border-l-[#F9D57E]" : ""}>
              <button onClick={() => setExpanded(isExpanded ? null : date)} className="w-full flex items-center justify-between p-4 hover:bg-[#FDFCF9] transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-[#3C1E38]">
                    {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    allDone ? "bg-emerald-50 text-emerald-600" :
                    completedCount > 0 ? "bg-[#F9D57E]/10 text-[#F9D57E]" :
                    "bg-[#3C1E38]/5 text-[#3C1E38]/30"
                  }`}>
                    {completedCount}/{declCount}{allDone ? " ✓" : ""}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-[#3C1E38]/30" /> : <ChevronRight className="w-4 h-4 text-[#3C1E38]/30" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-1.5">
                  {declarations.map((decl) => {
                    const log = dayLogs.find((l) => l.declaration_id === decl.id)
                    const count = log?.current_count ?? 0
                    const target = log?.target_count ?? decl.target_count
                    const done = log?.completed ?? false
                    const pct = target > 0 ? Math.round((count / target) * 100) : 0

                    return (
                      <div key={decl.id} className="flex items-center gap-3 text-xs">
                        <span className="text-[#3C1E38]/50 flex-1 truncate">{decl.content.slice(0, 45)}{decl.content.length > 45 ? "..." : ""}</span>
                        <span className="text-[#3C1E38]/40 flex-shrink-0">{count}/{target}</span>
                        <span className={`flex-shrink-0 w-8 text-right font-medium ${done ? "text-emerald-600" : count > 0 ? "text-[#F9D57E]" : "text-[#3C1E38]/30"}`}>
                          {done ? "✓" : count > 0 ? `${pct}%` : "—"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Load more */}
      {!loading && days.length >= (page + 1) * pageSize && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full text-center py-3 text-sm text-[#A7C2D7] hover:text-[#3C1E38] transition-colors"
        >
          Load more...
        </button>
      )}
    </div>
  )
}
