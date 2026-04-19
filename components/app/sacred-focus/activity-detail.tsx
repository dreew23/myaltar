"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Calendar, User, Tag, Pencil, Sparkles } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Journal } from "./journal"
import { SubChallenges } from "./sub-challenges"
import { BooksResources } from "./books-resources"
import { FruitRecording } from "./fruit-recording"
import { getActivityDayProgress, getRecurrenceLabel, ACTIVITY_TYPES } from "./types"
import { localCalendarDateString } from "@/lib/prayer-week"
import type {
  SpiritualActivity, JournalEntry, SubChallenge, SubChallengeLog, ActivityFruit
} from "./types"

interface Props {
  activity: SpiritualActivity
  entries: JournalEntry[]
  subChallenges: SubChallenge[]
  subChallengeLogs: SubChallengeLog[]
  fruits: ActivityFruit[]
  userId: string
  onBack: () => void
  onActivityUpdate: (activity: SpiritualActivity) => void
  onEdit: () => void
}

export function ActivityDetail({
  activity: initialActivity, entries: initialEntries, subChallenges,
  subChallengeLogs: initialLogs, fruits: initialFruits,
  userId, onBack, onActivityUpdate, onEdit,
}: Props) {
  const [activity, setActivity] = useState(initialActivity)
  const [entries, setEntries] = useState(initialEntries)
  const [challengeLogs, setChallengeLogs] = useState(initialLogs)
  const [fruits, setFruits] = useState(initialFruits)

  const progress = getActivityDayProgress(activity)
  const typeLabel = ACTIVITY_TYPES.find((t) => t.key === activity.type)?.label ?? activity.type

  // Today's sub-challenge logs lookup
  const today = localCalendarDateString()
  const todaySubLogs = useMemo(() => {
    const map: Record<string, SubChallengeLog> = {}
    challengeLogs.filter((l) => l.date === today).forEach((l) => { map[l.sub_challenge_id] = l })
    return map
  }, [challengeLogs, today])

  const handleEntryAdded = (entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev])
  }

  const handleEntryUpdated = (entry: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)))
  }

  const handleEntryDeleted = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleSubLogUpdate = (challengeId: string, log: SubChallengeLog) => {
    setChallengeLogs((prev) => {
      const existing = prev.findIndex((l) => l.sub_challenge_id === challengeId && l.date === log.date)
      if (existing >= 0) {
        return prev.map((l, i) => i === existing ? log : l)
      }
      return [...prev, log]
    })
  }

  const handleResourcesChange = (resources: string[]) => {
    const updated = { ...activity, books_resources: resources }
    setActivity(updated)
    onActivityUpdate(updated)
  }

  const handleFruitAdded = (fruit: ActivityFruit) => {
    setFruits((prev) => [fruit, ...prev])
  }

  const handleFruitUpdated = (fruit: ActivityFruit) => {
    setFruits((prev) => prev.map((f) => (f.id === fruit.id ? fruit : f)))
  }

  const handleFruitDeleted = (id: string) => {
    setFruits((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Back + edit */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#3C1E38]/50 hover:text-[#3C1E38] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-[#A7C2D7]/10 text-[#3C1E38]/40 hover:text-[#3C1E38] transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#A7C2D7]/15 text-[#A7C2D7]">
                {typeLabel}
              </span>
              <StatusBadge status={activity.status} />
            </div>
            <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">{activity.title}</h2>
          </div>
        </div>

        {activity.organizer && (
          <div className="flex items-center gap-1.5 text-xs text-[#3C1E38]/50">
            <User className="w-3.5 h-3.5" /> {activity.organizer}
          </div>
        )}

        {/* Date info */}
        <div className="flex items-center gap-1.5 text-xs text-[#3C1E38]/50">
          <Calendar className="w-3.5 h-3.5" />
          {activity.is_recurring ? (
            <span>{getRecurrenceLabel(activity.recurrence_pattern)}</span>
          ) : activity.start_date && activity.end_date ? (
            <span>
              {new Date(activity.start_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" — "}
              {new Date(activity.end_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          ) : null}
        </div>

        {/* Progress bar for date-range activities */}
        {progress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#3C1E38]/50">Day {progress.current} of {progress.total}</span>
              <span className="text-[#A7C2D7] font-medium">{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#A7C2D7]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A7C2D7] rounded-full transition-all"
                style={{ width: `${Math.min(100, (progress.current / progress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {activity.description && (
          <p className="text-sm text-[#3C1E38]/60 leading-relaxed">{activity.description}</p>
        )}

        {/* Tags */}
        {activity.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3 h-3 text-[#3C1E38]/25" />
            {activity.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-[#3C1E38]/5 text-[#3C1E38]/40">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Sub-challenges */}
      <SubChallenges
        challenges={subChallenges}
        logs={challengeLogs}
        todayLogs={todaySubLogs}
        userId={userId}
        onLogUpdate={handleSubLogUpdate}
      />

      {/* Books & Resources */}
      <BooksResources
        activityId={activity.id}
        resources={activity.books_resources}
        onResourcesChange={handleResourcesChange}
      />

      {/* Completion prompt */}
      {activity.status === "completed" && !activity.overall_reflection && (
        <div className="bg-[#F9D57E]/10 border border-[#F9D57E]/30 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#3C1E38]">
              {activity.title} ended. Ready to record what you gained?
            </p>
            <p className="text-xs text-[#3C1E38]/50 mt-1">
              Switch to the Fruits tab to capture your reflections and tangible outcomes.
            </p>
          </div>
        </div>
      )}

      {/* Journal + Fruits tabs */}
      <Tabs defaultValue="journal">
        <TabsList className="bg-[#A7C2D7]/10">
          <TabsTrigger value="journal">Journal ({entries.length})</TabsTrigger>
          <TabsTrigger value="fruits">Fruits ({fruits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-4">
          <Journal
            activity={activity}
            entries={entries}
            userId={userId}
            onEntryAdded={handleEntryAdded}
            onEntryUpdated={handleEntryUpdated}
            onEntryDeleted={handleEntryDeleted}
          />
        </TabsContent>

        <TabsContent value="fruits" className="mt-4">
          <FruitRecording
            activityId={activity.id}
            activity={activity}
            fruits={fruits}
            userId={userId}
            onFruitAdded={handleFruitAdded}
            onFruitUpdated={handleFruitUpdated}
            onFruitDeleted={handleFruitDeleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-[#2E7D32]/10 text-[#2E7D32]",
    upcoming: "bg-[#A7C2D7]/15 text-[#A7C2D7]",
    completed: "bg-[#3C1E38]/10 text-[#3C1E38]/60",
    paused: "bg-[#F9D57E]/15 text-[#B8860B]",
  }
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? styles.active}`}>
      {status}
    </span>
  )
}
