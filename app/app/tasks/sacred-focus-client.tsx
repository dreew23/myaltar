"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ActivitiesList } from "@/components/app/sacred-focus/activities-list"
import { ActivityDetail } from "@/components/app/sacred-focus/activity-detail"
import { ActivityForm } from "@/components/app/sacred-focus/activity-form"
import { SeasonOverview } from "@/components/app/sacred-focus/season-overview"
import type {
  SpiritualActivity, JournalEntry, SubChallenge, SubChallengeLog, ActivityFruit
} from "@/components/app/sacred-focus/types"

interface Props {
  activities: SpiritualActivity[]
  entries: JournalEntry[]
  subChallenges: SubChallenge[]
  subChallengeLogs: SubChallengeLog[]
  fruits: ActivityFruit[]
  userId: string
}

export function SacredFocusClient({
  activities: initialActivities, entries: initialEntries,
  subChallenges: initialSubChallenges, subChallengeLogs: initialLogs,
  fruits: initialFruits, userId,
}: Props) {
  const [activities, setActivities] = useState(initialActivities)
  const [entries, setEntries] = useState(initialEntries)
  const [subChallenges, setSubChallenges] = useState(initialSubChallenges)
  const [subChallengeLogs] = useState(initialLogs)
  const [fruits, setFruits] = useState(initialFruits)

  // Navigation state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<SpiritualActivity | null>(null)

  // Computed
  const selectedActivity = activities.find((a) => a.id === selectedActivityId)
  const activityEntries = useMemo(() =>
    selectedActivityId ? entries.filter((e) => e.activity_id === selectedActivityId) : [],
    [entries, selectedActivityId]
  )
  const activitySubChallenges = useMemo(() =>
    selectedActivityId ? subChallenges.filter((sc) => sc.activity_id === selectedActivityId) : [],
    [subChallenges, selectedActivityId]
  )
  const activityLogs = useMemo(() => {
    const scIds = new Set(activitySubChallenges.map((sc) => sc.id))
    return subChallengeLogs.filter((l) => scIds.has(l.sub_challenge_id))
  }, [subChallengeLogs, activitySubChallenges])
  const activityFruits = useMemo(() =>
    selectedActivityId ? fruits.filter((f) => f.activity_id === selectedActivityId) : [],
    [fruits, selectedActivityId]
  )

  // Entry counts for list view
  const entryCounts = useMemo(() => {
    const map: Record<string, number> = {}
    entries.forEach((e) => { map[e.activity_id] = (map[e.activity_id] || 0) + 1 })
    return map
  }, [entries])

  // Handlers
  const handleActivitySaved = (activity: SpiritualActivity, subs: SubChallenge[]) => {
    setActivities((prev) => {
      const exists = prev.find((a) => a.id === activity.id)
      if (exists) return prev.map((a) => a.id === activity.id ? activity : a)
      return [activity, ...prev]
    })
    setSubChallenges((prev) => {
      const kept = prev.filter((sc) => sc.activity_id !== activity.id)
      return [...kept, ...subs]
    })
    setEditingActivity(null)
  }

  const handleActivityUpdate = (activity: SpiritualActivity) => {
    setActivities((prev) => prev.map((a) => a.id === activity.id ? activity : a))
  }

  // Detail view
  if (selectedActivity) {
    return (
      <div className="max-w-4xl mx-auto">
        <ActivityDetail
          activity={selectedActivity}
          entries={activityEntries}
          subChallenges={activitySubChallenges}
          subChallengeLogs={activityLogs}
          fruits={activityFruits}
          userId={userId}
          onBack={() => setSelectedActivityId(null)}
          onActivityUpdate={handleActivityUpdate}
          onEdit={() => { setEditingActivity(selectedActivity); setShowForm(true) }}
        />

        <ActivityForm
          open={showForm && !!editingActivity}
          onOpenChange={(open) => { setShowForm(open); if (!open) setEditingActivity(null) }}
          activity={editingActivity}
          existingSubChallenges={activitySubChallenges}
          userId={userId}
          onSaved={handleActivitySaved}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Sacred Focus</h1>
          <p className="text-sm text-[#3C1E38]/50 mt-1">Track your spiritual seasons & activities</p>
        </div>
        <Button onClick={() => { setEditingActivity(null); setShowForm(true) }} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Activity
        </Button>
      </div>

      {/* Active activity banners */}
      {activities.filter((a) => a.status === "active" && !a.is_recurring).length > 0 && (
        <div className="mb-6 space-y-2">
          {activities.filter((a) => a.status === "active" && !a.is_recurring).map((a) => {
            const start = a.start_date ? new Date(a.start_date) : null
            const end = a.end_date ? new Date(a.end_date) : null
            const now = new Date()
            const total = start && end ? Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1 : null
            const current = start ? Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86400000) + 1) : null
            return (
              <button
                key={a.id}
                onClick={() => setSelectedActivityId(a.id)}
                className="w-full bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 border border-[#A7C2D7]/15 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-all text-left"
              >
                <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse flex-shrink-0" />
                <span className="text-sm font-medium text-[#3C1E38] flex-1 truncate">{a.title}</span>
                {current && total && (
                  <span className="text-xs text-[#A7C2D7] font-medium flex-shrink-0">Day {Math.min(current, total)}/{total}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="activities">
        <TabsList className="mb-6 bg-[#A7C2D7]/10">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="overview">Season Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <ActivitiesList
            activities={activities}
            entryCounts={entryCounts}
            onSelect={(a) => setSelectedActivityId(a.id)}
          />
        </TabsContent>

        <TabsContent value="overview">
          <SeasonOverview activities={activities} entries={entries} fruits={fruits} />
        </TabsContent>
      </Tabs>

      {/* Create form */}
      <ActivityForm
        open={showForm && !editingActivity}
        onOpenChange={setShowForm}
        userId={userId}
        onSaved={handleActivitySaved}
      />
    </div>
  )
}
