"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { prayerAreas } from "@/lib/data/dominion"
import { getVerseForToday } from "@/lib/prayer-verses"
import { mondayDateString } from "@/lib/prayer-week"
import type { PrayerAtmosphere, PrayerChallengeRow, PrayerRequest, PrayerSession } from "@/lib/prayer"
import type { TodayIntercession } from "@/lib/data/user-config"
import type { Declaration, DeclarationLog } from "@/components/app/declarations/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ATMOSPHERE: { key: PrayerAtmosphere; label: string; emoji: string }[] = [
  { key: "peaceful", label: "Peaceful", emoji: "🕊" },
  { key: "intense", label: "Intense", emoji: "🔥" },
  { key: "warfare", label: "Warfare", emoji: "⚔️" },
  { key: "dry", label: "Dry", emoji: "🏜" },
  { key: "breakthrough", label: "Breakthrough", emoji: "⚡" },
  { key: "mixed", label: "Mixed", emoji: "🌤" },
]

const TIME_PRESETS: { label: string; getDate: () => Date }[] = [
  { label: "12 AM", getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d } },
  { label: "3 AM", getDate: () => { const d = new Date(); d.setHours(3, 0, 0, 0); return d } },
  { label: "4 AM", getDate: () => { const d = new Date(); d.setHours(4, 0, 0, 0); return d } },
  { label: "5 AM", getDate: () => { const d = new Date(); d.setHours(5, 0, 0, 0); return d } },
  { label: "Now", getDate: () => new Date() },
]

const DOWNLOAD_TYPES = [
  { key: "Scripture", label: "Scripture" },
  { key: "Impression", label: "Impression" },
  { key: "Vision", label: "Vision" },
  { key: "Prophetic Word", label: "Prophetic Word" },
  { key: "Instruction", label: "Instruction" },
  { key: "Other", label: "Other" },
] as const

type Phase = "settle" | "engage" | "wrap"

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":")
}

function computeStreak(sessions: PrayerSession[]): number {
  const done = new Set(sessions.filter((s) => s.end_time).map((s) => s.date))
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const todayKey = d.toISOString().split("T")[0]!
  if (!done.has(todayKey)) d.setDate(d.getDate() - 1)
  let streak = 0
  for (;;) {
    const key = d.toISOString().split("T")[0]!
    if (done.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

interface Props {
  sessions: PrayerSession[]
  todaySession: PrayerSession | null
  declarations: Declaration[]
  todayDeclarationLogs: DeclarationLog[]
  userId: string
  todayIntercession: TodayIntercession
  prayerRequests: PrayerRequest[]
  challenges: PrayerChallengeRow[]
  onSessionUpdate: (session: PrayerSession) => void
  onDeclarationLogsUpdate: (logs: DeclarationLog[]) => void
  onChallengesUpdate: (rows: PrayerChallengeRow[]) => void
  scheduleComplete: boolean
}

export function PrayerModeFlow({
  sessions,
  todaySession,
  declarations,
  todayDeclarationLogs,
  userId,
  todayIntercession,
  prayerRequests,
  challenges,
  onSessionUpdate,
  onDeclarationLogsUpdate,
  onChallengesUpdate,
  scheduleComplete,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const verse = useMemo(() => getVerseForToday(), [])
  const streak = useMemo(() => computeStreak(sessions), [sessions])

  const [phase, setPhase] = useState<Phase>("settle")
  const [session, setSession] = useState<PrayerSession | null>(todaySession)
  const [dayComplete, setDayComplete] = useState(!!todaySession?.end_time)
  const [presetStart, setPresetStart] = useState<Date | null>(null)
  const [customTime, setCustomTime] = useState("")

  const [toolsOpen, setToolsOpen] = useState(false)
  const [areasCovered, setAreasCovered] = useState<string[]>(todaySession?.focus_areas_covered ?? [])
  const [sessionNotesEngage, setSessionNotesEngage] = useState("")

  const [declLogs, setDeclLogs] = useState<DeclarationLog[]>(todayDeclarationLogs)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadText, setDownloadText] = useState("")
  const [downloadType, setDownloadType] = useState<string>(DOWNLOAD_TYPES[0]!.key)

  const [cancelOpen, setCancelOpen] = useState(false)

  const [wrapAtmosphere, setWrapAtmosphere] = useState<PrayerAtmosphere | null>(null)
  const [wrapWarfare, setWrapWarfare] = useState(3)
  const [wrapBreakthroughs, setWrapBreakthroughs] = useState("")
  const [intercessionDone, setIntercessionDone] = useState<"yes" | "not_today" | null>(null)

  const [tick, setTick] = useState(0)
  const [challengeRows, setChallengeRows] = useState(challenges)

  useEffect(() => {
    setDeclLogs(todayDeclarationLogs)
  }, [todayDeclarationLogs])

  useEffect(() => {
    setChallengeRows(challenges)
  }, [challenges])

  useEffect(() => {
    setSession(todaySession)
    if (todaySession?.end_time) {
      setDayComplete(true)
      setPhase("settle")
    } else if (todaySession?.start_time && !todaySession.end_time) {
      setDayComplete(false)
      setPhase("engage")
      setAreasCovered(todaySession.focus_areas_covered ?? [])
    } else {
      setDayComplete(false)
      setPhase("settle")
    }
  }, [todaySession])

  useEffect(() => {
    if (phase !== "engage" || !session?.start_time || session.end_time) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [phase, session?.start_time, session?.end_time])

  const todayStr = new Date().toISOString().split("T")[0]!

  const elapsedMs = useMemo(() => {
    if (!session?.start_time || session.end_time) return 0
    return Date.now() - new Date(session.start_time).getTime()
  }, [session, tick])

  const declCounts = useMemo(() => {
    const m: Record<string, number> = {}
    declarations.forEach((d) => {
      const log = declLogs.find((l) => l.declaration_id === d.id)
      m[d.id] = log?.current_count ?? 0
    })
    return m
  }, [declarations, declLogs])

  const setDeclCount = async (declId: string, next: number) => {
    const decl = declarations.find((d) => d.id === declId)
    if (!decl) return
    const completed = next >= decl.target_count
    const row: DeclarationLog = {
      id: declLogs.find((l) => l.declaration_id === declId)?.id ?? "",
      user_id: userId,
      declaration_id: declId,
      date: todayStr,
      current_count: next,
      target_count: decl.target_count,
      completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setDeclLogs((prev) => {
      const rest = prev.filter((l) => l.declaration_id !== declId)
      return [...rest, row]
    })
    await supabase.from("declaration_logs").upsert(
      {
        user_id: userId,
        declaration_id: declId,
        date: todayStr,
        current_count: next,
        target_count: decl.target_count,
        completed,
      },
      { onConflict: "user_id,declaration_id,date" }
    )
    const merged = declLogs.filter((l) => l.declaration_id !== declId)
    merged.push({ ...row, id: row.id || crypto.randomUUID() })
    onDeclarationLogsUpdate(merged)
  }

  const toggleArea = (area: string) => {
    setAreasCovered((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const beginSession = async () => {
    let start: Date
    if (customTime.trim()) {
      const [hh, mm] = customTime.split(":").map((x) => parseInt(x, 10))
      if (!Number.isNaN(hh)) {
        start = new Date()
        start.setHours(hh ?? 0, mm ?? 0, 0, 0)
      } else {
        start = presetStart ?? new Date()
      }
    } else {
      start = presetStart ?? new Date()
    }

    const { data, error } = await supabase
      .from("prayer_sessions")
      .insert({
        user_id: userId,
        date: todayStr,
        start_time: start.toISOString(),
        session_type: "morning",
      })
      .select()
      .single()

    if (!error && data) {
      setSession(data as PrayerSession)
      onSessionUpdate(data as PrayerSession)
      setPhase("engage")
      setDayComplete(false)
      setAreasCovered([])
    }
  }

  const tryBeginSession = async () => {
    const { data: existing } = await supabase
      .from("prayer_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .eq("session_type", "morning")
      .maybeSingle()

    if (existing) {
      const ex = existing as PrayerSession
      if (ex.end_time) {
        setDayComplete(true)
        return
      }
      setSession(ex)
      onSessionUpdate(ex)
      setPhase("engage")
      return
    }
    await beginSession()
  }

  const goToWrap = () => setPhase("wrap")

  const cancelSession = async () => {
    if (!session?.id) return
    await supabase.from("prayer_sessions").delete().eq("id", session.id)
    setSession(null)
    setPhase("settle")
    setCancelOpen(false)
    router.refresh()
  }

  const saveWrapUp = async () => {
    if (!session) return
    const end = new Date().toISOString()
    const durationMin = Math.max(1, Math.round(elapsedMs / 60000))
    const declDone = declarations.filter((d) => (declCounts[d.id] ?? 0) >= d.target_count).length

    const { data } = await supabase
      .from("prayer_sessions")
      .update({
        end_time: end,
        duration_minutes: durationMin,
        focus_areas_covered: areasCovered,
        journal_entry: sessionNotesEngage.trim() || session.journal_entry,
        breakthroughs: wrapBreakthroughs.trim() || null,
        intercession_theme_completed: intercessionDone === "yes",
        atmosphere: wrapAtmosphere,
        warfare_intensity: wrapWarfare,
        declarations_completed: declDone >= declarations.length && declarations.length > 0,
      })
      .eq("id", session.id)
      .select()
      .single()

    if (data) {
      setSession(data as PrayerSession)
      onSessionUpdate(data as PrayerSession)
      setPhase("settle")
      setDayComplete(true)
      setSessionNotesEngage("")
      setWrapBreakthroughs("")
      setIntercessionDone(null)
      setWrapAtmosphere(null)
      router.refresh()
    }
  }

  const saveDownload = async () => {
    if (!downloadText.trim()) return
    const category =
      downloadType === "Instruction" ? "direction" : "revelation"
    const { error } = await supabase.from("divine_downloads").insert({
      user_id: userId,
      content: `[${downloadType}] ${downloadText.trim()}`,
      category,
      source: "prayer",
      life_areas: [],
    })
    if (!error) {
      setDownloadOpen(false)
      setDownloadText("")
    }
  }

  const activeRequests = prayerRequests
    .filter((r) => r.status === "active")
    .slice(0, 6)

  const prayedToday = async (req: PrayerRequest) => {
    const { error: e1 } = await supabase.from("prayer_request_pray_events").upsert(
      {
        user_id: userId,
        request_id: req.id,
        prayed_date: todayStr,
      },
      { onConflict: "request_id,prayed_date" }
    )
    if (e1) return
    const next = (req.prayed_count ?? 0) + 1
    await supabase
      .from("prayer_requests")
      .update({
        prayed_count: next,
        last_prayed_at: todayStr,
      })
      .eq("id", req.id)
  }

  const bumpChallenge = async (c: PrayerChallengeRow, delta: number) => {
    const mon = mondayDateString()
    let row = c
    if (c.week_start_monday !== mon) {
      await supabase
        .from("prayer_challenges")
        .update({ weekly_progress: 0, week_start_monday: mon })
        .eq("id", c.id)
      row = { ...c, weekly_progress: 0, week_start_monday: mon }
    }
    const next = Math.max(0, row.weekly_progress + delta)
    const { data } = await supabase
      .from("prayer_challenges")
      .update({ weekly_progress: next, week_start_monday: mon })
      .eq("id", c.id)
      .select()
      .single()
    if (data) {
      const next = data as PrayerChallengeRow
      setChallengeRows((prev) => {
        const u = prev.map((x) => (x.id === c.id ? next : x))
        onChallengesUpdate(u)
        return u
      })
    }
  }

  const phaseIndex = phase === "settle" ? 0 : phase === "engage" ? 1 : 2

  const intercessionCard = (
    <div
      className="rounded-xl border p-4 shadow-sm"
      style={{
        background: "linear-gradient(135deg, rgba(212,160,23,0.12) 0%, rgba(250,248,244,1) 100%)",
        borderColor: "var(--prayer-border)",
      }}
    >
      <p className="font-prayer-display text-lg italic text-[#b8860b]">{todayIntercession.theme}</p>
      <ul className="mt-2 list-inside list-disc text-sm text-[#2c2419]/85">
        {todayIntercession.focus.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      {!scheduleComplete && (
        <Link
          href="/app/settings#intercession-schedule"
          className="mt-3 inline-block text-sm font-medium text-[#2471a3] underline"
        >
          Fill in your intercession schedule →
        </Link>
      )}
    </div>
  )

  return (
    <div
      className="rounded-2xl border bg-[var(--prayer-card)] p-4 shadow-sm md:p-6"
      style={{ borderColor: "var(--prayer-border)" }}
    >
      {/* Phase bar */}
      <div className="mb-6 flex gap-1 border-b pb-3" style={{ borderColor: "var(--prayer-border)" }}>
        {["Settle", "Engage", "Wrap Up"].map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`text-xs font-medium uppercase tracking-wide ${
                i < phaseIndex ? "text-[#1e8449]" : i === phaseIndex ? "text-[#b8860b]" : "text-[#2c2419]/35"
              }`}
            >
              {label}
            </span>
            <div
              className="h-0.5 w-full rounded-full"
              style={{
                background:
                  i < phaseIndex
                    ? "#1e8449"
                    : i === phaseIndex
                      ? "#d4a017"
                      : "var(--prayer-surface-3)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Phase 1 */}
      {phase === "settle" && (
        <div className="mx-auto max-w-md space-y-6 text-center">
          <p className="font-prayer-display text-3xl text-[#2c2419]">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p className="font-prayer-display text-2xl italic text-[#b8860b]">Rise and pray</p>
          <p className="text-sm text-[#2c2419]/60">
            Streak: <span className="font-prayer-display text-xl text-[#b8860b]">{streak}</span> days
          </p>
          <blockquote className="mx-auto border-l-2 border-[#d4a017] pl-4 text-left">
            <p className="font-prayer-display text-lg leading-relaxed text-[#2c2419]">{verse.text}</p>
            <cite className="mt-2 block text-sm not-italic text-[#2c2419]/50">{verse.ref}</cite>
          </blockquote>

          {dayComplete && (
            <p className="rounded-lg bg-[#ede9e0] px-4 py-3 text-sm text-[#2c2419]/80">
              Today&apos;s session is complete. Rest in what God did — see the Journal tab for history.
            </p>
          )}

          {!dayComplete && (
            <>
              <div className="flex flex-wrap justify-center gap-2">
                {TIME_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPresetStart(p.getDate())
                      setCustomTime("")
                    }}
                    className={`prayer-focus-ring rounded-full border px-3 py-1.5 text-xs font-medium ${
                      presetStart?.getHours() === p.getDate().getHours() && p.label !== "Now"
                        ? "border-[#b8860b] bg-[#f5f2ec] text-[#b8860b]"
                        : "border-[var(--prayer-border)] bg-white text-[#2c2419]/80"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <label className="text-xs text-[#2c2419]/60">Custom</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value)
                    setPresetStart(null)
                  }}
                  className="prayer-focus-ring rounded-lg border px-2 py-1 text-sm"
                  style={{ borderColor: "var(--prayer-border)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => void tryBeginSession()}
                className="w-full rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] py-4 font-medium text-white shadow-md transition hover:opacity-95"
              >
                Begin Session
              </button>
            </>
          )}
        </div>
      )}

      {/* Phase 2 */}
      {phase === "engage" && session?.start_time && !session.end_time && (
        <div className="space-y-4">
          <div
            className="sticky top-0 z-10 -mx-4 border-b px-4 py-3 md:-mx-6 md:px-6"
            style={{
              background: "var(--prayer-page)",
              borderColor: "var(--prayer-border)",
            }}
          >
            <p
              className="font-prayer-display prayer-timer-hero text-center tabular-nums text-[52px] leading-none text-[#b8860b]"
            >
              {formatElapsed(elapsedMs)}
            </p>
            <p className="mt-1 text-center text-xs text-[#2c2419]/50">
              Started {new Date(session.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>

          {intercessionCard}

          <button
            type="button"
            onClick={() => setDownloadOpen(true)}
            className="font-prayer-display w-full rounded-xl border-2 border-dashed border-[#d4a017] bg-[#faf8f4] py-4 text-center text-base italic text-[#b8860b] transition hover:bg-[#f5f2ec]"
          >
            ✦ Capture a divine download.
          </button>

          <button
            type="button"
            onClick={() => setToolsOpen(!toolsOpen)}
            className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium text-[#2c2419]/80"
            style={{ borderColor: "var(--prayer-border)", background: "var(--prayer-surface-2)" }}
          >
            {toolsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Open prayer tools
          </button>

          {toolsOpen && (
            <div className="space-y-4 rounded-xl border p-4" style={{ borderColor: "var(--prayer-border)" }}>
              <div>
                <p className="mb-2 text-sm font-medium text-[#2c2419]">
                  Life areas ({areasCovered.length}/10)
                </p>
                <div className="grid grid-cols-2 gap-2 max-[600px]:grid-cols-1">
                  {prayerAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                        areasCovered.includes(area)
                          ? "border-[#b8860b] bg-[rgba(184,134,11,0.12)] text-[#2c2419]"
                          : "border-[var(--prayer-border)] bg-white text-[#2c2419]/70"
                      }`}
                    >
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d4a017]" />
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Declarations</p>
                {declarations.length === 0 ? (
                  <p className="text-xs text-[#2c2419]/50">No declarations yet — add some in Declarations.</p>
                ) : (
                  <div className="space-y-2">
                    {declarations.map((d) => {
                      const c = declCounts[d.id] ?? 0
                      const pct = Math.min(100, (c / (d.target_count || 1)) * 100)
                      return (
                        <div key={d.id} className="rounded-lg border p-2" style={{ borderColor: "var(--prayer-border)" }}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="line-clamp-1">{d.content.slice(0, 60)}…</span>
                            <span>
                              {c}/{d.target_count}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#ede9e0]">
                            <div className="h-full bg-[#d4a017]" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-1 flex gap-1">
                            <button
                              type="button"
                              className="rounded border px-2 py-0.5 text-xs"
                              onClick={() => void setDeclCount(d.id, Math.max(0, c - 1))}
                            >
                              −
                            </button>
                            <button
                              type="button"
                              className="rounded border px-2 py-0.5 text-xs"
                              onClick={() => void setDeclCount(d.id, c + 1)}
                            >
                              +
                            </button>
                            <Link href="/app/declarations" className="ml-auto text-xs text-[#2471a3] underline">
                              Edit target
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {challengeRows.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Challenges</p>
                  <div className="space-y-2">
                    {challengeRows.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 rounded-lg border px-2 py-2 text-sm"
                        style={{ borderColor: "var(--prayer-border)" }}
                      >
                        <span className="flex-1">{c.label}</span>
                        <span className="text-xs text-[#2c2419]/60">
                          {c.weekly_progress}/{c.daily_target * 7} {c.unit}
                        </span>
                        <button type="button" className="rounded border px-2" onClick={() => void bumpChallenge(c, -1)}>
                          −
                        </button>
                        <button type="button" className="rounded border px-2" onClick={() => void bumpChallenge(c, 1)}>
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeRequests.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Prayer requests</p>
                  <div className="space-y-2">
                    {activeRequests.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-start justify-between gap-2 rounded-lg border p-2 text-sm"
                        style={{ borderColor: "var(--prayer-border)" }}
                      >
                        <span className="line-clamp-2 flex-1">{r.title || r.request}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded-full bg-[#ede9e0] px-2 py-1 text-xs font-medium text-[#b8860b]"
                          onClick={() => void prayedToday(r)}
                        >
                          Prayed +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Session notes</label>
                <textarea
                  value={sessionNotesEngage}
                  onChange={(e) => setSessionNotesEngage(e.target.value)}
                  rows={4}
                  className="prayer-focus-ring w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--prayer-border)" }}
                  placeholder="What&apos;s happening in prayer right now?"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="flex-1 rounded-xl border py-3 text-sm font-medium text-[#c0392b]"
              style={{ borderColor: "var(--prayer-border)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={goToWrap}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] py-3 text-sm font-medium text-white"
            >
              End Session →
            </button>
          </div>
        </div>
      )}

      {/* Phase 3 */}
      {phase === "wrap" && session && (
        <div className="mx-auto max-w-lg space-y-4">
          <div
            className="rounded-2xl border p-6 text-center"
            style={{
              background: "linear-gradient(180deg, #f5f2ec 0%, #faf8f4 100%)",
              borderColor: "var(--prayer-border)",
            }}
          >
            <p className="font-prayer-display text-6xl text-[#b8860b] tabular-nums">
              {Math.max(1, Math.round(elapsedMs / 60000))}
            </p>
            <p className="text-sm text-[#2c2419]/60">minutes</p>
            <p className="mt-2 text-sm">
              Areas covered:{" "}
              <span className="font-prayer-display text-lg text-[#b8860b]">{areasCovered.length}</span> / 10
            </p>
            <p className="text-sm">
              Declarations:{" "}
              {declarations.filter((d) => (declCounts[d.id] ?? 0) >= d.target_count).length} / {declarations.length}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Intercession completed</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIntercessionDone("yes")}
                className={`flex-1 rounded-lg border py-2 text-sm ${
                  intercessionDone === "yes" ? "border-[#b8860b] bg-[#f5f2ec]" : ""
                }`}
                style={{ borderColor: "var(--prayer-border)" }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIntercessionDone("not_today")}
                className={`flex-1 rounded-lg border py-2 text-sm ${
                  intercessionDone === "not_today" ? "border-[#b8860b] bg-[#f5f2ec]" : ""
                }`}
                style={{ borderColor: "var(--prayer-border)" }}
              >
                Not today
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Atmosphere</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ATMOSPHERE.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setWrapAtmosphere(a.key)}
                  className={`rounded-xl border px-2 py-3 text-sm ${
                    wrapAtmosphere === a.key ? "border-[#b8860b] bg-[#f5f2ec]" : ""
                  }`}
                  style={{ borderColor: "var(--prayer-border)" }}
                >
                  <span className="mr-1">{a.emoji}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Warfare intensity</span>
              <span className="font-prayer-display text-[#b8860b]">{wrapWarfare}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={wrapWarfare}
              onChange={(e) => setWrapWarfare(parseInt(e.target.value, 10))}
              className="w-full accent-[#b8860b]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Breakthroughs</label>
            <textarea
              value={wrapBreakthroughs}
              onChange={(e) => setWrapBreakthroughs(e.target.value)}
              rows={4}
              className="prayer-focus-ring w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--prayer-border)" }}
            />
          </div>

          <button
            type="button"
            onClick={() => void saveWrapUp()}
            className="w-full rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] py-4 font-medium text-white"
          >
            Save & Complete Session
          </button>
        </div>
      )}

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="max-w-md border-[#e8e2d6] bg-[#faf8f4]">
          <DialogHeader>
            <DialogTitle className="font-prayer-display text-xl text-[#2c2419]">Divine download</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {DOWNLOAD_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setDownloadType(t.key)}
                  className={`rounded-full border px-2 py-1 text-xs ${
                    downloadType === t.key ? "border-[#b8860b] bg-white" : "border-[#e8e2d6]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={downloadText}
              onChange={(e) => setDownloadText(e.target.value)}
              rows={6}
              className="font-prayer-display w-full rounded-lg border border-[#e8e2d6] bg-white p-3 text-base"
              placeholder="Write what you received…"
            />
            <button
              type="button"
              onClick={() => void saveDownload()}
              className="w-full rounded-xl bg-[#b8860b] py-3 text-sm font-medium text-white"
            >
              Save to downloads
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel session?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#2c2419]/70">This removes today&apos;s in-progress session.</p>
          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-lg border py-2" onClick={() => setCancelOpen(false)}>
              Keep praying
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#c0392b] py-2 text-white"
              onClick={() => void cancelSession()}
            >
              Cancel session
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
