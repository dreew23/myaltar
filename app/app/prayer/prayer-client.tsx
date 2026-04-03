"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PrayerModeFlow } from "./prayer-mode-flow"
import { PrayerJournalTab } from "./prayer-journal-tab"
import { ToolkitTab } from "./toolkit-tab"
import { TrackerTab, type PrayEvent } from "./tracker-tab"
import type { PrayerChallengeRow, PrayerSession, SavedPrayer, WarfareScripture, PrayerRequest } from "@/lib/prayer"
import type { Declaration, DeclarationLog } from "@/components/app/declarations/types"
import type { IntercessionDayRow } from "@/components/app/settings/intercession-editor"
import type { TodayIntercession } from "@/lib/data/user-config"

interface Props {
  sessions: PrayerSession[]
  todaySession: PrayerSession | null
  savedPrayers: SavedPrayer[]
  warfareScriptures: WarfareScripture[]
  prayerRequests: PrayerRequest[]
  prayEvents: PrayEvent[]
  declarations: Declaration[]
  todayDeclarationLogs: DeclarationLog[]
  userId: string
  todayIntercession: TodayIntercession
  intercessionSchedule: IntercessionDayRow[] | null
  scheduleComplete: boolean
  challenges: PrayerChallengeRow[]
}

export function PrayerClient({
  sessions,
  todaySession,
  savedPrayers: initialSavedPrayers,
  warfareScriptures: initialWarfare,
  prayerRequests: initialRequests,
  prayEvents: initialPrayEvents,
  declarations,
  todayDeclarationLogs: initialDeclLogs,
  userId,
  todayIntercession,
  intercessionSchedule,
  scheduleComplete,
  challenges: initialChallenges,
}: Props) {
  const [savedPrayers, setSavedPrayers] = useState(initialSavedPrayers)
  const [warfareScriptures, setWarfareScriptures] = useState(initialWarfare)
  const [prayerRequests, setPrayerRequests] = useState(initialRequests)
  const [prayEvents] = useState(initialPrayEvents)
  const [sessionsList, setSessionsList] = useState(sessions)
  const [declLogs, setDeclLogs] = useState(initialDeclLogs)
  const [challenges, setChallenges] = useState(initialChallenges)

  return (
    <div className="mx-auto max-w-4xl px-3 pb-12 pt-2">
      <header className="prayer-glass sticky top-0 z-20 -mx-3 mb-4 px-3 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-prayer-display text-2xl font-semibold tracking-tight text-[#b8860b]">ALTAR</span>
            <span className="text-xs font-medium uppercase tracking-widest text-[#2c2419]/40">Prayer</span>
          </div>
        </div>
      </header>

      <Tabs defaultValue="mode" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-[#ede9e0] p-1 sm:grid-cols-4">
          <TabsTrigger
            value="mode"
            className="rounded-lg text-xs data-[state=active]:bg-[#faf8f4] data-[state=active]:text-[#b8860b] data-[state=active]:shadow-sm sm:text-sm"
          >
            Prayer Mode
          </TabsTrigger>
          <TabsTrigger
            value="journal"
            className="rounded-lg text-xs data-[state=active]:bg-[#faf8f4] data-[state=active]:text-[#b8860b] data-[state=active]:shadow-sm sm:text-sm"
          >
            Journal
          </TabsTrigger>
          <TabsTrigger
            value="tracker"
            className="rounded-lg text-xs data-[state=active]:bg-[#faf8f4] data-[state=active]:text-[#b8860b] data-[state=active]:shadow-sm sm:text-sm"
          >
            Tracker
          </TabsTrigger>
          <TabsTrigger
            value="toolkit"
            className="rounded-lg text-xs data-[state=active]:bg-[#faf8f4] data-[state=active]:text-[#b8860b] data-[state=active]:shadow-sm sm:text-sm"
          >
            Toolkit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mode" className="mt-4">
          <PrayerModeFlow
            sessions={sessionsList}
            todaySession={todaySession}
            declarations={declarations}
            todayDeclarationLogs={declLogs}
            userId={userId}
            todayIntercession={todayIntercession}
            prayerRequests={prayerRequests}
            challenges={challenges}
            onSessionUpdate={(session) => {
              setSessionsList((prev) => {
                const existing = prev.find((s) => s.id === session.id)
                if (existing) return prev.map((s) => (s.id === session.id ? session : s))
                return [session, ...prev]
              })
            }}
            onDeclarationLogsUpdate={setDeclLogs}
            onChallengesUpdate={setChallenges}
            scheduleComplete={scheduleComplete}
          />
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <PrayerJournalTab sessions={sessionsList} />
        </TabsContent>

        <TabsContent value="tracker" className="mt-4">
          <TrackerTab
            prayerRequests={prayerRequests}
            prayEvents={prayEvents}
            userId={userId}
            onRequestsUpdate={setPrayerRequests}
          />
        </TabsContent>

        <TabsContent value="toolkit" className="mt-4">
          <ToolkitTab
            savedPrayers={savedPrayers}
            warfareScriptures={warfareScriptures}
            userId={userId}
            onSavedPrayersUpdate={setSavedPrayers}
            onWarfareUpdate={setWarfareScriptures}
            intercessionSchedule={intercessionSchedule}
            challenges={challenges}
            onChallengesUpdate={setChallenges}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
