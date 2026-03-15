"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Calendar, RefreshCw, Sparkles } from "lucide-react"
import { getActivityDayProgress, getRecurrenceLabel, ACTIVITY_TYPES } from "./types"
import type { SpiritualActivity, JournalEntry } from "./types"

interface Props {
  activities: SpiritualActivity[]
  entryCounts: Record<string, number>  // activity_id → entry count
  onSelect: (activity: SpiritualActivity) => void
}

export function ActivitiesList({ activities, entryCounts, onSelect }: Props) {
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const active = useMemo(() => activities.filter((a) => a.status === "active" && !a.is_recurring), [activities])
  const rhythms = useMemo(() => activities.filter((a) => a.is_recurring), [activities])
  const upcoming = useMemo(() => activities.filter((a) => a.status === "upcoming"), [activities])
  const completed = useMemo(() => activities.filter((a) => a.status === "completed"), [activities])
  const paused = useMemo(() => activities.filter((a) => a.status === "paused" && !a.is_recurring), [activities])

  const isEmpty = activities.length === 0

  if (isEmpty) {
    return (
      <div className="text-center py-16 text-[#3C1E38]/30">
        <Calendar className="w-10 h-10 mx-auto mb-3 text-[#A7C2D7]/30" />
        <p className="text-sm font-medium">No spiritual activities yet</p>
        <p className="text-xs mt-1">Create your first activity to start tracking your spiritual season.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active activities */}
      {active.length > 0 && (
        <Section title="Active">
          {active.map((a) => (
            <ActivityCard key={a.id} activity={a} entryCount={entryCounts[a.id] ?? 0} onSelect={onSelect} />
          ))}
        </Section>
      )}

      {/* Paused */}
      {paused.length > 0 && (
        <Section title="Paused">
          {paused.map((a) => (
            <ActivityCard key={a.id} activity={a} entryCount={entryCounts[a.id] ?? 0} onSelect={onSelect} />
          ))}
        </Section>
      )}

      {/* Regular Rhythms */}
      {rhythms.length > 0 && (
        <Section title="Regular Rhythms" icon={<RefreshCw className="w-3.5 h-3.5" />}>
          {rhythms.map((a) => (
            <ActivityCard key={a.id} activity={a} entryCount={entryCounts[a.id] ?? 0} onSelect={onSelect} />
          ))}
        </Section>
      )}

      {/* Upcoming (collapsible) */}
      {upcoming.length > 0 && (
        <CollapsibleSection
          title={`Upcoming (${upcoming.length})`}
          open={showUpcoming}
          onToggle={() => setShowUpcoming(!showUpcoming)}
        >
          {upcoming.map((a) => (
            <ActivityCard key={a.id} activity={a} entryCount={entryCounts[a.id] ?? 0} onSelect={onSelect} />
          ))}
        </CollapsibleSection>
      )}

      {/* Completed (collapsible) */}
      {completed.length > 0 && (
        <CollapsibleSection
          title={`Completed (${completed.length})`}
          open={showCompleted}
          onToggle={() => setShowCompleted(!showCompleted)}
        >
          {completed.map((a) => (
            <ActivityCard key={a.id} activity={a} entryCount={entryCounts[a.id] ?? 0} onSelect={onSelect} />
          ))}
        </CollapsibleSection>
      )}
    </div>
  )
}

// ─── Activity Card ───────────────────────────────────
function ActivityCard({
  activity, entryCount, onSelect,
}: {
  activity: SpiritualActivity; entryCount: number; onSelect: (a: SpiritualActivity) => void
}) {
  const progress = getActivityDayProgress(activity)
  const typeLabel = ACTIVITY_TYPES.find((t) => t.key === activity.type)?.label ?? activity.type

  const statusColors: Record<string, string> = {
    active: "border-l-[#2E7D32]",
    upcoming: "border-l-[#A7C2D7]",
    completed: "border-l-[#3C1E38]/30",
    paused: "border-l-[#F9D57E]",
  }

  return (
    <button
      onClick={() => onSelect(activity)}
      className={`w-full text-left bg-white rounded-xl border border-[#A7C2D7]/10 border-l-4 p-4 hover:shadow-sm transition-all ${statusColors[activity.status] ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7C2D7]">{typeLabel}</span>
            {activity.is_recurring && (
              <span className="text-[10px] text-[#3C1E38]/30 flex items-center gap-0.5">
                <RefreshCw className="w-2.5 h-2.5" /> {getRecurrenceLabel(activity.recurrence_pattern)}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[#3C1E38] truncate">{activity.title}</h3>
          {activity.organizer && (
            <p className="text-xs text-[#3C1E38]/40 mt-0.5 truncate">{activity.organizer}</p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          {progress ? (
            <div>
              <p className="text-xs font-medium text-[#A7C2D7]">Day {progress.current}/{progress.total}</p>
              <div className="w-16 h-1 bg-[#A7C2D7]/10 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#A7C2D7] rounded-full"
                  style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
                />
              </div>
            </div>
          ) : activity.is_recurring ? (
            <span className="text-xs text-[#2E7D32]/60 font-medium">Ongoing</span>
          ) : null}
        </div>
      </div>

      {/* Entry count */}
      <div className="flex items-center gap-3 mt-2.5">
        <span className="text-[10px] text-[#3C1E38]/30">{entryCount} journal {entryCount === 1 ? "entry" : "entries"}</span>
        {activity.tags.length > 0 && (
          <div className="flex gap-1">
            {activity.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-[#3C1E38]/5 text-[#3C1E38]/30">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Completion prompt */}
      {activity.status === "completed" && !activity.overall_reflection && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#B8860B]">
          <Sparkles className="w-3 h-3" /> Ready to record fruits?
        </div>
      )}
    </button>
  )
}

// ─── Section wrappers ────────────────────────────────
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        {icon && <span className="text-[#3C1E38]/40">{icon}</span>}
        <h2 className="text-xs font-semibold text-[#3C1E38]/50 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function CollapsibleSection({
  title, open, onToggle, children,
}: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div>
      <button onClick={onToggle} className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-[#3C1E38]/40 hover:text-[#3C1E38]/60 transition-colors uppercase tracking-wide">
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {title}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  )
}
