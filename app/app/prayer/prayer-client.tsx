"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { localCalendarDateString } from "@/lib/prayer-week"
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
  const router = useRouter()
  const [localDayKey, setLocalDayKey] = useState(() => localCalendarDateString())
  const lastDayRef = useRef<string | null>(null)

  const [savedPrayers, setSavedPrayers] = useState(initialSavedPrayers)
  const [warfareScriptures, setWarfareScriptures] = useState(initialWarfare)
  const [prayerRequests, setPrayerRequests] = useState(initialRequests)
  const [prayEvents] = useState(initialPrayEvents)
  const [sessionsList, setSessionsList] = useState(sessions)
  const [declLogs, setDeclLogs] = useState(initialDeclLogs)
  const [challenges, setChallenges] = useState(initialChallenges)

  // Keep client state aligned when server props refresh (new day, navigation, router.refresh).
  useEffect(() => {
    setSessionsList(sessions)
  }, [sessions])

  useEffect(() => {
    setDeclLogs(initialDeclLogs)
  }, [initialDeclLogs])

  useEffect(() => {
    setChallenges(initialChallenges)
  }, [initialChallenges])

  // Tick local calendar day so Prayer Mode resets at local midnight (not UTC).
  useEffect(() => {
    const sync = () => {
      const now = localCalendarDateString()
      setLocalDayKey((k) => (k !== now ? now : k))
    }
    const id = setInterval(sync, 15_000)
    const onVis = () => {
      if (document.visibilityState === "visible") sync()
    }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  useEffect(() => {
    if (lastDayRef.current === null) {
      lastDayRef.current = localDayKey
      return
    }
    if (lastDayRef.current !== localDayKey) {
      lastDayRef.current = localDayKey
      router.refresh()
    }
  }, [localDayKey, router])

  const todaySession = useMemo(() => {
    return (
      sessionsList.find((s) => s.date === localDayKey && s.session_type === "morning") ?? null
    )
  }, [sessionsList, localDayKey])

  const declarationLogsToday = useMemo(() => {
    return declLogs.filter((l) => l.date === localDayKey)
  }, [declLogs, localDayKey])

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
            todayDateKey={localDayKey}
            todaySession={todaySession}
            declarations={declarations}
            todayDeclarationLogs={declarationLogsToday}
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
            onDeclarationLogsUpdate={(logs) => {
              setDeclLogs((prev) => {
                const rest = prev.filter((l) => l.date !== localDayKey)
                return [...rest, ...logs]
              })
            }}
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
