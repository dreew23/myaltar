"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PrayerModeTab } from "./prayer-mode-tab"
import { JournalTab } from "./journal-tab"
import { ToolkitTab } from "./toolkit-tab"
import { RequestsTab } from "./requests-tab"
import type { PrayerSession, SavedPrayer, WarfareScripture, PrayerRequest } from "@/lib/prayer"
import type { Declaration, DeclarationLog } from "@/components/app/declarations/types"

interface Props {
  sessions: PrayerSession[]
  todaySession: PrayerSession | null
  savedPrayers: SavedPrayer[]
  warfareScriptures: WarfareScripture[]
  prayerRequests: PrayerRequest[]
  declarations: Declaration[]
  todayDeclarationLogs: DeclarationLog[]
  todayPrayerComplete: boolean
  activities: { id: string; title: string; [key: string]: unknown }[]
  userId: string
  todayIntercession: { theme: string; focus: string[] }
}

export function PrayerClient({
  sessions,
  todaySession,
  savedPrayers: initialSavedPrayers,
  warfareScriptures: initialWarfare,
  prayerRequests: initialRequests,
  declarations,
  todayDeclarationLogs,
  todayPrayerComplete,
  activities,
  userId,
  todayIntercession,
}: Props) {
  const [savedPrayers, setSavedPrayers] = useState(initialSavedPrayers)
  const [warfareScriptures, setWarfareScriptures] = useState(initialWarfare)
  const [prayerRequests, setPrayerRequests] = useState(initialRequests)
  const [sessionsList, setSessionsList] = useState(sessions)

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="mode" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-[#A7C2D7]/10 border border-[#A7C2D7]/20 p-1 rounded-xl">
          <TabsTrigger value="mode" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Prayer Mode
          </TabsTrigger>
          <TabsTrigger value="journal" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Journal
          </TabsTrigger>
          <TabsTrigger value="toolkit" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Toolkit
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mode" className="mt-4">
          <PrayerModeTab
            todaySession={todaySession}
            declarations={declarations}
            todayDeclarationLogs={todayDeclarationLogs}
            todayPrayerComplete={todayPrayerComplete}
            activities={activities}
            userId={userId}
            todayIntercession={todayIntercession}
            onSessionUpdate={(session) => {
              setSessionsList((prev) => {
                const existing = prev.find((s) => s.id === session.id)
                if (existing) return prev.map((s) => (s.id === session.id ? session : s))
                return [session, ...prev]
              })
            }}
          />
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <JournalTab
            sessions={sessionsList}
            todaySession={todaySession}
            activities={activities}
            userId={userId}
            onSessionsUpdate={setSessionsList}
          />
        </TabsContent>

        <TabsContent value="toolkit" className="mt-4">
          <ToolkitTab
            savedPrayers={savedPrayers}
            warfareScriptures={warfareScriptures}
            userId={userId}
            onSavedPrayersUpdate={setSavedPrayers}
            onWarfareUpdate={setWarfareScriptures}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RequestsTab
            prayerRequests={prayerRequests}
            userId={userId}
            onRequestsUpdate={setPrayerRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
