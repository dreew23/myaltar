"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Heart, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getTodayPrayerAreas, prayerAreas } from "@/lib/data/dominion"
import type { PrayerSession } from "@/lib/prayer"
import type { Declaration, DeclarationLog } from "@/components/app/declarations/types"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface Props {
  todaySession: PrayerSession | null
  declarations: Declaration[]
  todayDeclarationLogs: DeclarationLog[]
  todayPrayerComplete: boolean
  activities: { id: string; title: string }[]
  userId: string
  todayIntercession: { theme: string; focus: string[] }
  onSessionUpdate: (session: PrayerSession) => void
}

export function PrayerModeTab({
  todaySession,
  declarations,
  todayDeclarationLogs,
  todayPrayerComplete,
  activities,
  userId,
  todayIntercession,
  onSessionUpdate,
}: Props) {
  const [time, setTime] = useState("")
  const [session, setSession] = useState<PrayerSession | null>(todaySession)
  const [timerMins, setTimerMins] = useState<number | null>(null)
  const [sessionNoteOpen, setSessionNoteOpen] = useState(false)
  const [sessionNoteText, setSessionNoteText] = useState("")

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!session?.start_time) return
    const id = setInterval(() => {
      const start = new Date(session.start_time!).getTime()
      setTimerMins(Math.floor((Date.now() - start) / 60000))
    }, 60000)
    setTimerMins(Math.floor((Date.now() - new Date(session.start_time).getTime()) / 60000))
    return () => clearInterval(id)
  }, [session?.start_time])

  const intercession = todayIntercession
  const todayAreas = getTodayPrayerAreas()
  const supabase = createClient()

  const declCompleted = declarations.filter((d) => {
    const log = todayDeclarationLogs.find((l) => l.declaration_id === d.id)
    return log && log.current_count >= (d.target_count ?? 1)
  }).length
  const declTotal = declarations.length
  const allDeclarationsDone = declTotal > 0 && declCompleted >= declTotal

  const startSession = async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("prayer_sessions")
      .insert({
        user_id: userId,
        date: today,
        start_time: new Date().toISOString(),
        session_type: "morning",
      })
      .select()
      .single()
    if (!error && data) {
      setSession(data)
      onSessionUpdate(data)
    }
  }

  const endSession = async () => {
    if (!session) return
    const end = new Date().toISOString()
    const start = session.start_time ? new Date(session.start_time).getTime() : Date.now()
    const durationMin = Math.round((Date.now() - start) / 60000)
    const { data } = await supabase
      .from("prayer_sessions")
      .update({ end_time: end, duration_minutes: durationMin })
      .eq("id", session.id)
      .select()
      .single()
    if (data) {
      setSession(data)
      onSessionUpdate(data)
      setTimerMins(null)
    }
  }

  const appendSessionNote = async () => {
    if (!session || !sessionNoteText.trim()) return
    const existing = session.journal_entry || ""
    const updated = existing ? `${existing}\n\n${sessionNoteText.trim()}` : sessionNoteText.trim()
    const { data } = await supabase
      .from("prayer_sessions")
      .update({ journal_entry: updated })
      .eq("id", session.id)
      .select()
      .single()
    if (data) {
      setSession(data)
      onSessionUpdate(data)
      setSessionNoteText("")
      setSessionNoteOpen(false)
    }
  }

  const sessionActive = session && !session.end_time
  const sessionDuration = timerMins ?? session?.duration_minutes ?? 0

  return (
    <div className="relative bg-[#1B2341] rounded-2xl min-h-[70vh] flex flex-col text-white overflow-hidden">
      {/* Live clock + timer */}
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-white/30 text-sm">{time}</span>
        {sessionActive && (
          <span className="text-white/20 text-sm">
            {sessionDuration} min
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
        {/* Start / End Session */}
        <div className="flex flex-col gap-2">
          {!session ? (
            <Button
              onClick={startSession}
              className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#1B2341] font-medium py-6 rounded-xl"
            >
              Start Session
            </Button>
          ) : sessionActive ? (
            <Button
              onClick={endSession}
              className="w-full bg-white/10 hover:bg-white/20 text-white/80 border border-white/20 py-4 rounded-xl"
            >
              End Session
            </Button>
          ) : (
            <p className="text-[#F9D57E]/80 text-sm">Session ended · Log in Journal tab</p>
          )}
        </div>

        {/* Active spiritual season */}
        {activities.length > 0 && (
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <p className="text-[#F9D57E] text-sm font-medium">
              🔥 {activities[0].title}
            </p>
          </div>
        )}

        {/* Today's intercession */}
        <div className="space-y-2">
          <p className="text-[#F9D57E] font-medium">
            {DAY_NAMES[new Date().getDay()]}: {intercession.theme}
          </p>
          <ul className="text-white/80 text-sm list-disc list-inside space-y-0.5">
            {intercession.focus.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* 10-area rotation */}
        <div className="space-y-3">
          <p className="text-white/60 text-sm">Today&apos;s prayer areas</p>
          <div className="flex flex-wrap gap-2">
            {todayAreas.map((area) => (
              <span
                key={area}
                className="px-4 py-2 rounded-full bg-[#F9D57E]/20 text-[#F9D57E] text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-2">All 10: {prayerAreas.join(", ")}</p>
        </div>

        {/* Declarations quick access */}
        <div className="pt-2">
          {allDeclarationsDone ? (
            <p className="text-[#F9D57E] font-medium">All declarations complete ✦</p>
          ) : (
            <Link
              href="/app/declarations"
              className="inline-flex items-center gap-2 text-white/80 hover:text-[#F9D57E] transition-colors"
            >
              Declarations: {declCompleted}/{declTotal} completed →
            </Link>
          )}
        </div>
      </div>

      {/* Quick capture bar — native buttons so dark theme isn't overridden by Button bg */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#1B2341]/95 border-t border-white/10 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => window.location.href = "/app/journal?open=log"}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
        >
          <Sparkles className="w-4 h-4 shrink-0" /> Download
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/app/prayer?tab=requests&open=add"}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
        >
          <Heart className="w-4 h-4 shrink-0" /> Prayer Point
        </button>
        <button
          type="button"
          onClick={() => setSessionNoteOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
        >
          <FileText className="w-4 h-4 shrink-0" /> Session Note
        </button>
      </div>

      {/* Session note modal */}
      {sessionNoteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1B2341] rounded-t-2xl sm:rounded-2xl w-full max-w-md border border-white/10 p-4">
            <p className="text-white/80 text-sm mb-2">Add a note to this session</p>
            <textarea
              value={sessionNoteText}
              onChange={(e) => setSessionNoteText(e.target.value)}
              placeholder="What's happening in prayer right now?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setSessionNoteOpen(false)}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <Button className="flex-1 bg-[#F9D57E] text-[#1B2341] hover:bg-[#F9D57E]/90" onClick={appendSessionNote} disabled={!sessionNoteText.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
