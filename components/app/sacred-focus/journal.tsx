"use client"

import { useState, useMemo } from "react"
import { Filter } from "lucide-react"
import { JournalEntryForm } from "./journal-entry-form"
import { JournalEntryCard } from "./journal-entry-card"
import { getEntryTypeConfig, ENTRY_TYPES } from "./types"
import type { JournalEntry, EntryType, SpiritualActivity } from "./types"

interface Props {
  activity: SpiritualActivity
  entries: JournalEntry[]
  userId: string
  onEntryAdded: (entry: JournalEntry) => void
  onEntryUpdated: (entry: JournalEntry) => void
  onEntryDeleted: (id: string) => void
}

export function Journal({
  activity,
  entries,
  userId,
  onEntryAdded,
  onEntryUpdated,
  onEntryDeleted,
}: Props) {
  const [filterType, setFilterType] = useState<EntryType | "all">("all")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    if (filterType === "all") return entries
    return entries.filter((e) => e.entry_type === filterType)
  }, [entries, filterType])

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, JournalEntry[]> = {}
    filtered.forEach((e) => {
      const key = e.date
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  // Count by type for filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      counts[e.entry_type] = (counts[e.entry_type] || 0) + 1
    })
    return counts
  }, [entries])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00")
    // For non-recurring activities with start_date, show "Day N"
    if (!activity.is_recurring && activity.start_date) {
      const start = new Date(activity.start_date + "T12:00:00")
      const dayNum = Math.floor((d.getTime() - start.getTime()) / 86400000) + 1
      const formatted = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      return `Day ${dayNum} — ${formatted}`
    }
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      {/* Fast add form */}
      <JournalEntryForm activityId={activity.id} activity={activity} userId={userId} onEntryAdded={onEntryAdded} />

      {/* Filter toggle */}
      {entries.length > 0 && (
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType !== "all"
                ? "bg-[#A7C2D7]/15 text-[#3C1E38]"
                : "text-[#3C1E38]/40 hover:text-[#3C1E38]/60"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterType !== "all" ? `Showing: ${getEntryTypeConfig(filterType).label}` : "Filter"}
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => { setFilterType("all"); setShowFilters(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === "all" ? "bg-[#3C1E38]/10 text-[#3C1E38]" : "text-[#3C1E38]/40"
                }`}
              >
                All ({entries.length})
              </button>
              {ENTRY_TYPES.filter((t) => typeCounts[t.key]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setFilterType(t.key); setShowFilters(false) }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: filterType === t.key ? `${t.color}20` : "transparent",
                    color: t.color,
                  }}
                >
                  {t.label} ({typeCounts[t.key]})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Entries grouped by date */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-[#3C1E38]/30">
          <p className="text-sm">No journal entries yet. Start capturing!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayEntries]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-[#3C1E38]/50 uppercase tracking-wide mb-3">
                {formatDate(date)}
              </h3>
              <div className="space-y-2">
                {dayEntries.map((entry) => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    activity={activity}
                    onUpdated={onEntryUpdated}
                    onDeleted={onEntryDeleted}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
