"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen, Flame, Sparkles, ArrowRight, Zap, Target, Headphones, Crown,
  CheckCircle2, Circle, ChevronRight, Lightbulb, Users, Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  getTodayVerse, getTodayDeclaration,
  getTodayPrayerAreas, isSunday,
} from "@/lib/data/dominion"
import { getPersonalYearProgress, getCalendarQuarterProgress } from "@/lib/personal-year"
import type { PersonalYearConfigRow } from "@/lib/personal-year"
import { QuickCaptureForm } from "@/app/app/downloads/downloads-client"
import { SessionQualityStars } from "@/components/app/pulse/session-history"
import { SESSION_QUALITY_LABELS } from "@/lib/pulse"
import { localCalendarDateString } from "@/lib/prayer-week"
import {
  type DailyFocusCompletedKey,
  type DailyFocusRow,
  EMPTY_DAILY_FOCUS_CHECKS,
  buildDailyFocusChecklist,
  completedSnapshotFromRow,
  dailyFocusServerSyncToken,
  dailyFocusUpsertPayload,
  normalizeDailyFocusRow,
} from "@/lib/daily-focus-checklist"
import type { WeeklyCommitment, WeeklyCommitmentLog } from "@/lib/weekly-commitments"
import { WeeklyCommitmentsCard } from "@/components/app/dashboard/weekly-commitments-card"
import type { IntercessionDayRow } from "@/components/app/settings/intercession-editor"

interface WeeklyGoalsRow {
  id: string
  week_start_date: string
  goal_1_text: string | null
  goal_1_code: string | null
  goal_1_completed: boolean
  goal_2_text: string | null
  goal_2_code: string | null
  goal_2_completed: boolean
  goal_3_text: string | null
  goal_3_code: string | null
  goal_3_completed: boolean
}

interface Props {
  prayerStreak: number
  divineDownloads: number
  sermonsThisWeek: number
  dominionScore: number
  todayLog: {
    prayer_complete?: boolean
    declarations_complete?: boolean
    gratitude_complete?: boolean
    sermons_today?: number
    energy_score?: number
    gratitude_items?: string[]
  } | null
  todayPrayerSession: { id: string; duration_minutes?: number | null; end_time: string | null } | null
  todayPulseSession: {
    id: string
    started_at: string | null
    completed_at: string | null
    phases_completed: string[] | null
    total_duration_minutes: number | null
    session_quality: number | null
  } | null
  /** Most recent completed planning session (for star rating when today is not Sunday). */
  latestCompletedPulse: { date: string; session_quality: number | null } | null
  userId: string
  weeklySermonPrinciple: string | null
  weeklyPrincipleSermonTitle?: string | null
  weeklySermonsList?: { id: string; sermon_id: string; title: string; listened: boolean }[]
  weeklyGoals: WeeklyGoalsRow | null
  weekStartStr: string
  /** Today's row from Phase 5 "Daily focus" in Sunday Planning (`daily_focus`). */
  todayDailyFocus: DailyFocusRow | null
  todayDailyFocusLabel: string
  /** Local calendar date (YYYY-MM-DD) for `daily_focus` updates — must match server `todayStr`. */
  todayDateStr: string
  todayIntercession: { theme: string; focus: string[] }
  personalYears: PersonalYearConfigRow[]
  weeklyCommitments: WeeklyCommitment[]
  weeklyCommitmentLogs: WeeklyCommitmentLog[]
  declarationsForPicker: { id: string; text: string }[]
  intercessionSchedule: IntercessionDayRow[] | null
}

const GOAL_CODES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"] as const

export function DashboardClient({
  prayerStreak, divineDownloads, sermonsThisWeek, dominionScore,
  todayLog, todayPrayerSession, todayPulseSession, latestCompletedPulse, userId, weeklySermonPrinciple,
  weeklyPrincipleSermonTitle, weeklySermonsList = [],
  weeklyGoals, weekStartStr,
  todayDailyFocus,
  todayDailyFocusLabel,
  todayDateStr,
  todayIntercession,
  personalYears,
  weeklyCommitments,
  weeklyCommitmentLogs,
  declarationsForPicker,
  intercessionSchedule,
}: Props) {
  const router = useRouter()
  const verse = getTodayVerse()
  const declaration = getTodayDeclaration()
  const intercession = todayIntercession
  const prayerAreas = getTodayPrayerAreas()
  const personal = useMemo(() => getPersonalYearProgress(personalYears), [personalYears])
  const calendarQ = useMemo(() => getCalendarQuarterProgress(), [])
  const sunday = isSunday()

  const dailyFocusChecklistItems = useMemo(
    () => (todayDailyFocus ? buildDailyFocusChecklist(todayDailyFocus) : []),
    [todayDailyFocus]
  )

  const [dailyFocusCompleted, setDailyFocusCompleted] = useState(EMPTY_DAILY_FOCUS_CHECKS)

  /** Primitives-only sync key — avoids resetting checklist when parent passes a new object ref with the same server data */
  const dailyFocusSyncKey = dailyFocusServerSyncToken(todayDateStr, todayDailyFocus)

  useEffect(() => {
    if (!todayDailyFocus) {
      setDailyFocusCompleted(EMPTY_DAILY_FOCUS_CHECKS)
      return
    }
    const snap = completedSnapshotFromRow(todayDailyFocus)
    setDailyFocusCompleted(snap)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- token encodes todayDailyFocus; object ref alone must not re-sync
  }, [dailyFocusSyncKey])

  function formatBarDateRange(startStr: string, endStr: string) {
    const a = new Date(startStr + "T12:00:00")
    const b = new Date(endStr + "T12:00:00")
    return `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }

  const [showDeclarations, setShowDeclarations] = useState(false)
  const [log, setLog] = useState({
    prayer: todayLog?.prayer_complete ?? false,
    declarations: todayLog?.declarations_complete ?? false,
    gratitude: todayLog?.gratitude_complete ?? false,
    sermons: todayLog?.sermons_today ?? 0,
    energy: todayLog?.energy_score ?? 5,
  })
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(todayLog?.gratitude_items ?? ["", "", ""])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showLogForm, setShowLogForm] = useState(!todayLog)
  const [showWeeklyGoalsForm, setShowWeeklyGoalsForm] = useState(false)
  const [localWeeklyGoals, setLocalWeeklyGoals] = useState({
    goal_1_text: weeklyGoals?.goal_1_text ?? "",
    goal_1_code: weeklyGoals?.goal_1_code ?? "",
    goal_1_completed: weeklyGoals?.goal_1_completed ?? false,
    goal_2_text: weeklyGoals?.goal_2_text ?? "",
    goal_2_code: weeklyGoals?.goal_2_code ?? "",
    goal_2_completed: weeklyGoals?.goal_2_completed ?? false,
    goal_3_text: weeklyGoals?.goal_3_text ?? "",
    goal_3_code: weeklyGoals?.goal_3_code ?? "",
    goal_3_completed: weeklyGoals?.goal_3_completed ?? false,
  })
  const [savingGoals, setSavingGoals] = useState(false)

  useEffect(() => {
    if (weeklyGoals) {
      setLocalWeeklyGoals({
        goal_1_text: weeklyGoals.goal_1_text ?? "",
        goal_1_code: weeklyGoals.goal_1_code ?? "",
        goal_1_completed: weeklyGoals.goal_1_completed ?? false,
        goal_2_text: weeklyGoals.goal_2_text ?? "",
        goal_2_code: weeklyGoals.goal_2_code ?? "",
        goal_2_completed: weeklyGoals.goal_2_completed ?? false,
        goal_3_text: weeklyGoals.goal_3_text ?? "",
        goal_3_code: weeklyGoals.goal_3_code ?? "",
        goal_3_completed: weeklyGoals.goal_3_completed ?? false,
      })
    }
  }, [weeklyGoals?.id, weeklyGoals?.goal_1_text, weeklyGoals?.goal_2_text, weeklyGoals?.goal_3_text])

  const weeklyGoalSlotsWithText = useMemo(() => {
    const slots: (1 | 2 | 3)[] = []
    if (localWeeklyGoals.goal_1_text?.trim()) slots.push(1)
    if (localWeeklyGoals.goal_2_text?.trim()) slots.push(2)
    if (localWeeklyGoals.goal_3_text?.trim()) slots.push(3)
    return slots
  }, [localWeeklyGoals.goal_1_text, localWeeklyGoals.goal_2_text, localWeeklyGoals.goal_3_text])

  const weeklyGoalsAllDone =
    weeklyGoalSlotsWithText.length === 0 ||
    weeklyGoalSlotsWithText.every((slot) =>
      slot === 1
        ? localWeeklyGoals.goal_1_completed
        : slot === 2
          ? localWeeklyGoals.goal_2_completed
          : localWeeklyGoals.goal_3_completed
    )

  const allDailyPlanDoneOrNA =
    dailyFocusChecklistItems.length === 0 ||
    dailyFocusChecklistItems.every((item) => dailyFocusCompleted[item.completedKey])

  const hasThisWeekFocusTrackers =
    showWeeklyGoalsForm || weeklyGoalSlotsWithText.length > 0 || dailyFocusChecklistItems.length > 0

  const allThisWeekFocusComplete =
    hasThisWeekFocusTrackers && weeklyGoalsAllDone && allDailyPlanDoneOrNA

  const [showThisWeekFocusForm, setShowThisWeekFocusForm] = useState(() => {
    const g = weeklyGoals
    const slots: (1 | 2 | 3)[] = []
    if (g?.goal_1_text?.trim()) slots.push(1)
    if (g?.goal_2_text?.trim()) slots.push(2)
    if (g?.goal_3_text?.trim()) slots.push(3)
    const wDone =
      slots.length === 0 ||
      slots.every((s) =>
        s === 1 ? Boolean(g?.goal_1_completed) : s === 2 ? Boolean(g?.goal_2_completed) : Boolean(g?.goal_3_completed)
      )
    const items = todayDailyFocus ? buildDailyFocusChecklist(todayDailyFocus) : []
    const snap = todayDailyFocus ? completedSnapshotFromRow(todayDailyFocus) : EMPTY_DAILY_FOCUS_CHECKS
    const dDone = items.length === 0 || items.every((i) => snap[i.completedKey])
    const has = slots.length > 0 || items.length > 0
    if (!has) return true
    return !(wDone && dDone)
  })

  useEffect(() => {
    if (!hasThisWeekFocusTrackers) {
      setShowThisWeekFocusForm(true)
      return
    }
    setShowThisWeekFocusForm(!allThisWeekFocusComplete)
  }, [hasThisWeekFocusTrackers, allThisWeekFocusComplete])

  const saveLog = async (newLog: typeof log) => {
    setSaving(true)
    const supabase = createClient()
    const today = localCalendarDateString()

    const fullData = {
      user_id: userId,
      date: today,
      prayer_complete: newLog.prayer,
      declarations_complete: newLog.declarations,
      gratitude_complete: newLog.gratitude,
      sermons_today: newLog.sermons,
      energy_score: newLog.energy,
      gratitude_items: gratitudeItems.filter(Boolean),
    }

    const { error } = await supabase.from("daily_devotions").upsert(fullData, { onConflict: "user_id,date" })
    if (error) {
      console.log("[v0] Error saving log:", error.message)
    } else {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setShowLogForm(false)
        router.refresh() // Refresh to update stats
      }, 1500)
    }
    setSaving(false)
  }

  const saveWeeklyGoals = async (payload: typeof localWeeklyGoals) => {
    setSavingGoals(true)
    const supabase = createClient()
    const { error } = await supabase.from("weekly_goals").upsert({
      user_id: userId,
      week_start_date: weekStartStr,
      goal_1_text: payload.goal_1_text || null,
      goal_1_code: payload.goal_1_code || null,
      goal_1_completed: payload.goal_1_completed,
      goal_2_text: payload.goal_2_text || null,
      goal_2_code: payload.goal_2_code || null,
      goal_2_completed: payload.goal_2_completed,
      goal_3_text: payload.goal_3_text || null,
      goal_3_code: payload.goal_3_code || null,
      goal_3_completed: payload.goal_3_completed,
    }, { onConflict: "user_id,week_start_date" })
    if (error) {
      console.error("[v0] Error saving weekly goals:", error.message)
    } else {
      router.refresh()
    }
    setSavingGoals(false)
  }

  const toggleWeeklyGoalCompleted = (slot: 1 | 2 | 3) => {
    const next = { ...localWeeklyGoals }
    if (slot === 1) next.goal_1_completed = !next.goal_1_completed
    if (slot === 2) next.goal_2_completed = !next.goal_2_completed
    if (slot === 3) next.goal_3_completed = !next.goal_3_completed
    setLocalWeeklyGoals(next)
    saveWeeklyGoals(next)
  }

  const toggleDailyFocusCompleted = async (key: DailyFocusCompletedKey) => {
    if (!todayDailyFocus) return
    const nextVal = !dailyFocusCompleted[key]
    const merged = { ...dailyFocusCompleted, [key]: nextVal }
    setDailyFocusCompleted(merged)
    const supabase = createClient()
    const payload = dailyFocusUpsertPayload(userId, todayDateStr, todayDailyFocus, merged)
    const { data: raw, error } = await supabase
      .from("daily_focus")
      .upsert(payload, { onConflict: "user_id,date" })
      .select("*")
      .maybeSingle()
    if (error) {
      console.error("[Dashboard] daily_focus checklist:", error.message)
      setDailyFocusCompleted((prev) => ({ ...prev, [key]: !nextVal }))
      return
    }
    if (raw) {
      setDailyFocusCompleted(completedSnapshotFromRow(normalizeDailyFocusRow(raw as Record<string, unknown>)))
    }
    router.refresh()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Scripture / Declarations Banner */}
      <div className="bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-2xl p-6 border border-[#A7C2D7]/15">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowDeclarations(false)}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${!showDeclarations ? "bg-[#A7C2D7]/20 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:text-[#3C1E38]"}`}
          >
            Scripture
          </button>
          <button
            onClick={() => setShowDeclarations(true)}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${showDeclarations ? "bg-[#F9D57E]/20 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:text-[#3C1E38]"}`}
          >
            My Declarations
          </button>
        </div>
        
        {!showDeclarations ? (
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-garamond text-lg italic text-[#3C1E38] leading-relaxed">{'"'}{verse.text}{'"'}</p>
              <p className="text-sm text-[#A7C2D7] font-medium mt-2">{verse.ref}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-[#F9D57E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-garamond text-lg text-[#3C1E38] leading-relaxed">{declaration}</p>
              <Link href="/app/declarations" className="inline-flex items-center gap-1 text-xs text-[#F9D57E] font-medium mt-2 hover:underline">
                View All 10 Declarations <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* DOMINION Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/app/prayer" className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            {todayPrayerSession?.end_time ? (
              <span className="font-playfair text-xl font-bold text-emerald-600">Prayed ✓</span>
            ) : (
              <span className="font-playfair text-lg font-bold text-[#3C1E38]">Begin Prayer</span>
            )}
          </div>
          <p className="text-xs text-[#3C1E38]/50">
            {todayPrayerSession?.end_time && todayPrayerSession?.duration_minutes
              ? `${todayPrayerSession.duration_minutes} min today`
              : "3–5am session"}
          </p>
          <p className="text-[10px] text-[#3C1E38]/35">Streak: {prayerStreak}/7 this week</p>
        </Link>

        <Link href="/app/downloads" className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className="w-5 h-5 text-[#F9D57E]" />
            <span className="font-playfair text-2xl font-bold text-[#3C1E38]">{divineDownloads}</span>
          </div>
          <p className="text-xs text-[#3C1E38]/50">Divine Downloads</p>
          <p className="text-[10px] text-[#3C1E38]/35">this month (target: 10+)</p>
        </Link>
        
        <Link href="/app/sermons" className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Headphones className="w-5 h-5 text-[#A7C2D7]" />
            <span className="font-playfair text-2xl font-bold text-[#3C1E38]">{sermonsThisWeek}/5</span>
          </div>
          <p className="text-xs text-[#3C1E38]/50">Sermons This Week</p>
          <p className="text-[10px] text-[#3C1E38]/35">target: 5/week</p>
        </Link>
        
        <Link href="/app/goals" className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span className="font-playfair text-2xl font-bold text-[#3C1E38]">{dominionScore}/10</span>
          </div>
          <p className="text-xs text-[#3C1E38]/50">DOMINION Score</p>
          <p className="text-[10px] text-[#3C1E38]/35">weekly alignment</p>
        </Link>
      </div>

      {/* This Week's Commitments — user-defined daily targets for the current week */}
      <WeeklyCommitmentsCard
        userId={userId}
        weekStartStr={weekStartStr}
        todayDateStr={todayDateStr}
        initialCommitments={weeklyCommitments}
        initialLogs={weeklyCommitmentLogs}
        declarations={declarationsForPicker}
        intercessionSchedule={intercessionSchedule}
      />

      {/* Mon–Sat: Pulse + Prayer (Sunday uses the gold card below) */}
      {!sunday && (
        <div className="rounded-xl border border-[#A7C2D7]/20 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-playfair font-semibold text-[#3C1E38]">Sunday Pulse & Prayer</p>
            <div className="text-xs text-[#3C1E38]/55">
              {latestCompletedPulse?.session_quality != null ? (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>
                    Last planning session{" "}
                    {new Date(latestCompletedPulse.date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    :
                  </span>
                  <SessionQualityStars rating={latestCompletedPulse.session_quality} size="sm" />
                  <span className="font-semibold text-[#3C1E38] tabular-nums">
                    {latestCompletedPulse.session_quality}/5
                  </span>
                  {SESSION_QUALITY_LABELS[latestCompletedPulse.session_quality] ? (
                    <span className="text-[#3C1E38]/45">
                      {SESSION_QUALITY_LABELS[latestCompletedPulse.session_quality]}
                    </span>
                  ) : null}
                </span>
              ) : latestCompletedPulse ? (
                <span>
                  Last planning session{" "}
                  {new Date(latestCompletedPulse.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  .{" "}
                  <Link href="/app/pulse" className="font-medium text-[#A7C2D7] hover:underline">
                    Open Sunday Pulse
                  </Link>{" "}
                  and use Phase 6 to rate how effective it was.
                </span>
              ) : (
                "Use Sunday Pulse for your weekly review and Prayer Mode for your guided flow."
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/app/prayer">
              <Button size="sm" variant="outline" className="border-[#B8860B]/40 text-[#3C1E38] hover:bg-[#F9D57E]/20">
                <Heart className="w-3 h-3 mr-1" />
                Prayer
              </Button>
            </Link>
            <Link href="/app/pulse">
              <Button size="sm" className="bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-[#F9D57E] border border-[#3C1E38]">
                Sunday Pulse
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Sunday Planning Session — gold theme, session state */}
      {sunday && (
        <div className="bg-gradient-to-r from-[#F9D57E]/20 via-[#F9D57E]/15 to-[#F9D57E]/10 rounded-xl p-4 border border-[#F9D57E]/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F9D57E]/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <p className="font-playfair font-bold text-[#3C1E38]">Sunday Planning Session</p>
                {todayPulseSession?.completed_at ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-[#3C1E38]/60">
                      Session complete ✓ — {todayPulseSession.total_duration_minutes != null ? `${Math.floor(todayPulseSession.total_duration_minutes / 60)}h ${todayPulseSession.total_duration_minutes % 60}m` : ""}
                    </p>
                    {todayPulseSession.session_quality != null && (
                      <div className="flex flex-wrap items-center gap-2">
                        <SessionQualityStars rating={todayPulseSession.session_quality} size="sm" />
                        <span className="text-xs font-semibold text-[#3C1E38] tabular-nums">
                          {todayPulseSession.session_quality}/5
                        </span>
                        {SESSION_QUALITY_LABELS[todayPulseSession.session_quality] ? (
                          <span className="text-xs text-[#3C1E38]/55">
                            {SESSION_QUALITY_LABELS[todayPulseSession.session_quality]}
                          </span>
                        ) : null}
                      </div>
                    )}
                    {todayPulseSession.session_quality == null && (
                      <p className="text-xs text-[#8B6914]">
                        Open your session and save{" "}
                        <span className="font-medium">Phase 6 — Setdown &amp; Close</span> to add a 1–5 effectiveness
                        rating.
                      </p>
                    )}
                  </div>
                ) : todayPulseSession?.started_at ? (
                  <p className="text-xs text-[#3C1E38]/60">
                    Session in progress — Phase {(todayPulseSession.phases_completed?.length ?? 0) + 1} of 6
                  </p>
                ) : (
                  <p className="text-xs text-[#3C1E38]/60">
                    Week {personal?.weekNumber ?? calendarQ.weekInQuarter} of 13 — Time for your weekly review · Estimated: 2 hours
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/app/prayer">
                <Button size="sm" variant="outline" className="border-[#B8860B]/40 text-[#3C1E38] hover:bg-[#F9D57E]/20">
                  <Heart className="w-3 h-3 mr-1" />
                  Prayer
                </Button>
              </Link>
              <Link href="/app/pulse">
                <Button size="sm" className="bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-[#F9D57E] border border-[#3C1E38]">
                  {todayPulseSession?.completed_at ? "View session" : todayPulseSession?.started_at ? "Resume" : "Begin Session"}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Prayer Log */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-[#A7C2D7]/10">
            <h3 className="font-playfair text-base font-bold text-[#3C1E38] mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#F9D57E]" /> Today's Prayer Log
            </h3>

            {(!showLogForm && (todayLog || saved)) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-[#3C1E38]">Completed</span>
                </div>
                <p className="text-xs text-[#3C1E38]/70">
                  {[
                    log.prayer && "Prayer ✓",
                    log.declarations && "Declarations ✓",
                    log.gratitude && "Gratitude ✓",
                    log.sermons > 0 && `${log.sermons} sermon${log.sermons !== 1 ? "s" : ""}`,
                    `Energy ${log.energy}/10`,
                  ].filter(Boolean).join(" · ")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogForm(true)}
                  className="w-full border-[#A7C2D7]/30 text-[#3C1E38]/80 hover:bg-[#A7C2D7]/10"
                >
                  Edit log
                </Button>
                <Link href="/app/prayer-history" className="flex items-center justify-center gap-1 text-xs text-[#A7C2D7] font-medium mt-2 hover:underline">
                  View Past Logs <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
            <div className="space-y-3">
              {/* Prayer 3-5am */}
              <button
                onClick={() => setLog(l => ({ ...l, prayer: !l.prayer }))}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border text-sm transition-all ${log.prayer ? "bg-emerald-50 border-emerald-200 text-[#3C1E38]" : "border-[#A7C2D7]/10 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}
              >
                {log.prayer ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-[#3C1E38]/30" />}
                <span>Prayer (3-5am)</span>
              </button>

              {/* Declarations Recited */}
              <button
                onClick={() => setLog(l => ({ ...l, declarations: !l.declarations }))}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border text-sm transition-all ${log.declarations ? "bg-emerald-50 border-emerald-200 text-[#3C1E38]" : "border-[#A7C2D7]/10 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}
              >
                {log.declarations ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-[#3C1E38]/30" />}
                <span>Declarations Recited</span>
              </button>

              {/* Gratitude */}
              <div className={`p-3 rounded-lg border transition-all ${log.gratitude ? "bg-emerald-50 border-emerald-200" : "border-[#A7C2D7]/10"}`}>
                <button
                  onClick={() => setLog(l => ({ ...l, gratitude: !l.gratitude }))}
                  className="flex items-center gap-3 w-full text-sm mb-2"
                >
                  {log.gratitude ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-[#3C1E38]/30" />}
                  <span className={log.gratitude ? "text-[#3C1E38]" : "text-[#3C1E38]/50"}>Gratitude (3 items)</span>
                </button>
                {log.gratitude && (
                  <div className="space-y-2 ml-7">
                    {[0, 1, 2].map((i) => (
                      <input
                        key={i}
                        type="text"
                        value={gratitudeItems[i]}
                        onChange={(e) => {
                          const newItems = [...gratitudeItems]
                          newItems[i] = e.target.value
                          setGratitudeItems(newItems)
                        }}
                        placeholder={`Gratitude ${i + 1}...`}
                        className="w-full text-xs border border-[#A7C2D7]/20 rounded-md p-2 bg-white focus:ring-1 focus:ring-[#A7C2D7]/30 outline-none"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sermons Today */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[#A7C2D7]/10">
                <Headphones className="w-4 h-4 text-[#A7C2D7]" />
                <span className="text-sm text-[#3C1E38]/70 flex-1">Sermons today</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setLog(l => ({ ...l, sermons: Math.max(0, l.sermons - 1) }))}
                    className="w-6 h-6 rounded border border-[#A7C2D7]/20 text-[#3C1E38]/50 hover:bg-[#A7C2D7]/10"
                  >-</button>
                  <span className="text-sm font-medium text-[#3C1E38] w-4 text-center">{log.sermons}</span>
                  <button 
                    onClick={() => setLog(l => ({ ...l, sermons: l.sermons + 1 }))}
                    className="w-6 h-6 rounded border border-[#A7C2D7]/20 text-[#3C1E38]/50 hover:bg-[#A7C2D7]/10"
                  >+</button>
                </div>
              </div>

              {/* Energy Score */}
              <div className="p-3 rounded-lg border border-[#A7C2D7]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F9D57E]" />
                    <span className="text-sm text-[#3C1E38]/70">Energy Score</span>
                  </div>
                  <span className="text-sm font-bold text-[#3C1E38]">{log.energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={log.energy}
                  onChange={(e) => setLog(l => ({ ...l, energy: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-red-300 via-yellow-300 to-emerald-400"
                />
              </div>

              {/* Save Button */}
              <Button 
                onClick={() => saveLog(log)} 
                disabled={saving}
                className={`w-full font-medium mt-2 ${saved ? "bg-emerald-500 hover:bg-emerald-500" : "bg-[#3C1E38] hover:bg-[#3C1E38]/90"} text-white`}
              >
                {saving ? "Saving..." : saved ? "Saved!" : "Save Today's Log"}
              </Button>
              
              <Link href="/app/prayer-history" className="flex items-center justify-center gap-1 text-xs text-[#A7C2D7] font-medium mt-3 hover:underline">
                View Past Logs <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            )}
          </div>

          {/* Quick Download Capture — same form as FAB */}
          <div className="bg-gradient-to-br from-[#F9D57E]/10 to-[#F9D57E]/5 rounded-xl p-4 border border-[#F9D57E]/15">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#F9D57E]" />
              <span className="text-xs font-medium text-[#3C1E38]">Quick Download Capture</span>
            </div>
            <QuickCaptureForm userId={userId} onSaved={() => router.refresh()} />
          </div>
        </div>

        {/* Middle Column - This Week's Principle + Weekly Top 3 Goals */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-[#A7C2D7]/10">
            {/* Part A: This Week's Principle + Playlist */}
            <h3 className="font-playfair text-base font-bold text-[#3C1E38] mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#A7C2D7]" /> This Week&apos;s Focus
            </h3>
            {!showThisWeekFocusForm && allThisWeekFocusComplete && hasThisWeekFocusTrackers ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium text-[#3C1E38]">Completed</span>
                </div>
                <p className="text-xs text-[#3C1E38]/70">
                  {[
                    weeklySermonPrinciple ? "Weekly principle set" : null,
                    weeklySermonsList.length > 0
                      ? `${weeklySermonsList.filter((w) => w.listened).length}/${weeklySermonsList.length} sermons heard`
                      : null,
                    weeklyGoalSlotsWithText.length > 0
                      ? weeklyGoalSlotsWithText
                          .map((slot) => {
                            const raw =
                              slot === 1
                                ? localWeeklyGoals.goal_1_text
                                : slot === 2
                                  ? localWeeklyGoals.goal_2_text
                                  : localWeeklyGoals.goal_3_text
                            const t = (raw ?? "").trim()
                            if (!t) return null
                            return t.length > 40 ? `${t.slice(0, 40)}… ✓` : `${t} ✓`
                          })
                          .filter(Boolean)
                          .join(" · ")
                      : null,
                    dailyFocusChecklistItems.length > 0
                      ? `Today: ${dailyFocusChecklistItems.map((i) => i.text).join(" · ")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowThisWeekFocusForm(true)}
                  className="w-full border-[#A7C2D7]/30 text-[#3C1E38]/80 hover:bg-[#A7C2D7]/10"
                >
                  Edit focus
                </Button>
                <Link
                  href="/app/prayer-history"
                  className="flex items-center justify-center gap-1 text-xs font-medium text-[#A7C2D7] hover:underline"
                >
                  View Past Logs <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <>
                {weeklySermonPrinciple ? (
                  <div className="p-3 rounded-lg bg-[#A7C2D7]/5 border border-[#A7C2D7]/10 mb-3">
                    <p className="font-garamond text-sm italic text-[#3C1E38]">{weeklySermonPrinciple}</p>
                    {weeklyPrincipleSermonTitle && <p className="text-xs text-[#3C1E38]/50 mt-1">{weeklyPrincipleSermonTitle}</p>}
                    <Link href="/app/sermons#this-week" className="text-xs text-[#A7C2D7] font-medium mt-1 inline-block hover:underline">Change</Link>
                  </div>
                ) : weeklySermonsList.length > 0 ? (
                  <div className="mb-3">
                    <p className="text-sm text-[#3C1E38]/60 mb-2">{weeklySermonsList.length} sermons planned this week — select your principle</p>
                    <Link href="/app/sermons#this-week" className="text-xs text-[#A7C2D7] font-medium hover:underline">Go to This Week →</Link>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm text-[#3C1E38]/60 mb-2">Plan your sermons for this week.</p>
                    <Link href="/app/sermons#this-week" className="inline-flex items-center gap-1 text-sm font-medium text-[#A7C2D7] hover:underline">
                      + Add Sermons <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
                {weeklySermonsList.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-[#3C1E38]/50 mb-1.5">
                      Sermon Playlist: {weeklySermonsList.filter((w) => w.listened).length} of {weeklySermonsList.length} listened
                    </p>
                    <ul className="space-y-1">
                      {weeklySermonsList.slice(0, 6).map((w) => (
                        <li key={w.id}>
                          <Link href="/app/sermons#this-week" className="flex items-center gap-2 text-xs text-[#3C1E38]/70 hover:text-[#A7C2D7]">
                            {w.listened ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-[#3C1E38]/30 flex-shrink-0" />}
                            <span className="truncate">{w.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {weeklySermonsList.length > 6 && <p className="text-[10px] text-[#3C1E38]/40 mt-1">+{weeklySermonsList.length - 6} more</p>}
                  </div>
                )}

                {/* Today's daily focus — Phase 5 per-day plan from Sunday Planning */}
                <div className="mt-4 pt-4 border-t border-[#A7C2D7]/10">
                  <p className="text-xs font-medium text-[#3C1E38]/50 mb-1.5">
                    Today&apos;s plan <span className="text-[#3C1E38]/40">({todayDailyFocusLabel})</span>
                  </p>
                  <p className="text-[10px] text-[#3C1E38]/40 mb-2">From Sunday Planning — Daily focus (Phase 5)</p>
                  {dailyFocusChecklistItems.length > 0 ? (
                    <div className="space-y-2">
                      <ul className="space-y-2">
                        {dailyFocusChecklistItems.map((item) => {
                          const done = dailyFocusCompleted[item.completedKey]
                          return (
                            <li key={item.completedKey}>
                              <button
                                type="button"
                                aria-pressed={done}
                                aria-label={done ? `Mark incomplete: ${item.text}` : `Mark complete: ${item.text}`}
                                onClick={() => void toggleDailyFocusCompleted(item.completedKey)}
                                className="flex w-full items-start gap-2 rounded-lg border border-transparent p-1.5 text-left transition-colors hover:border-[#A7C2D7]/25 hover:bg-[#A7C2D7]/5"
                              >
                                <span className="mt-0.5 flex-shrink-0">
                                  {done ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                                  ) : (
                                    <Circle className="h-4 w-4 text-[#3C1E38]/30" aria-hidden />
                                  )}
                                </span>
                                <span
                                  className={`text-sm leading-snug text-[#3C1E38]/90 ${done ? "text-[#3C1E38]/45 line-through" : ""}`}
                                >
                                  {item.text}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                      <p className="text-[10px] text-[#3C1E38]/40">
                        Checklist is saved to your account. View this date anytime in{" "}
                        <Link href="/app/prayer-history" className="font-medium text-[#A7C2D7] hover:underline">
                          Prayer Log History
                        </Link>
                        .
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[#3C1E38]/55">
                      No daily focus saved for today yet. Add it in{" "}
                      <Link href="/app/pulse" className="text-[#A7C2D7] font-medium hover:underline">
                        Sunday Planning
                      </Link>{" "}
                      under Phase 5 — Daily focus.
                    </p>
                  )}
                </div>

                {/* This week's goal focus — from Sunday Planning session */}
                <p className="text-xs font-medium text-[#3C1E38]/50 mb-1.5 mt-4">
                  This week&apos;s goal focus <span className="text-[#3C1E38]/40">(from Sunday Planning)</span>
                </p>
                {(localWeeklyGoals.goal_1_text || localWeeklyGoals.goal_2_text || localWeeklyGoals.goal_3_text || showWeeklyGoalsForm) ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((slot) => (
                      <div key={slot} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleWeeklyGoalCompleted(slot as 1 | 2 | 3)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {(slot === 1 ? localWeeklyGoals.goal_1_completed : slot === 2 ? localWeeklyGoals.goal_2_completed : localWeeklyGoals.goal_3_completed) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#3C1E38]/30" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={slot === 1 ? localWeeklyGoals.goal_1_text : slot === 2 ? localWeeklyGoals.goal_2_text : localWeeklyGoals.goal_3_text}
                          onChange={(e) => {
                            const v = e.target.value
                            setLocalWeeklyGoals((prev) => ({
                              ...prev,
                              ...(slot === 1 && { goal_1_text: v }),
                              ...(slot === 2 && { goal_2_text: v }),
                              ...(slot === 3 && { goal_3_text: v }),
                            }))
                          }}
                          onBlur={() => saveWeeklyGoals(localWeeklyGoals)}
                          placeholder={`Goal ${slot}`}
                          className="flex-1 min-w-0 text-sm border border-[#A7C2D7]/20 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                        <select
                          value={slot === 1 ? localWeeklyGoals.goal_1_code : slot === 2 ? localWeeklyGoals.goal_2_code : localWeeklyGoals.goal_3_code}
                          onChange={(e) => {
                            const v = e.target.value
                            setLocalWeeklyGoals((prev) => ({
                              ...prev,
                              ...(slot === 1 && { goal_1_code: v }),
                              ...(slot === 2 && { goal_2_code: v }),
                              ...(slot === 3 && { goal_3_code: v }),
                            }))
                          }}
                          onBlur={() => saveWeeklyGoals(localWeeklyGoals)}
                          className="w-12 text-xs border border-[#A7C2D7]/20 rounded-lg px-1.5 py-1.5 bg-white text-[#3C1E38] focus:ring-1 focus:ring-[#A7C2D7]/30 outline-none"
                        >
                          {GOAL_CODES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {savingGoals && <p className="text-[10px] text-[#3C1E38]/40">Saving…</p>}
                    <Link href="/app/pulse" className="inline-flex items-center gap-1 text-xs text-[#A7C2D7] font-medium mt-1 hover:underline">
                      Open Sunday Planning <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="mb-2">
                    <p className="text-sm text-[#3C1E38]/60 mb-2">Set your top 3 goals in your Sunday Planning session; they&apos;ll show here.</p>
                    <Link href="/app/pulse" className="inline-flex items-center gap-1 text-sm font-medium text-[#A7C2D7] hover:underline">
                      {sunday ? "Set in Sunday Planning" : "Open Sunday Planning"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </>
            )}
            <Link href="/app/goals" className="flex items-center justify-center gap-1 text-xs text-[#A7C2D7] font-medium mt-4 hover:underline">
              View Strategic Goals <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quarter progress: personal DOMINION year (primary) + calendar quarter (reference) */}
          <div className="space-y-3">
            {personal && (
              <div className="bg-white rounded-xl p-4 border border-[#F9D57E]/25">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#3C1E38]">
                    Year {personal.yearNumber}: {personal.yearName} — Week {personal.weekNumber} of {personal.totalWeeks}
                  </span>
                  <span className="text-xs font-medium text-[#F9D57E]">{personal.progress}%</span>
                </div>
                <div className="h-2.5 bg-[#F9D57E]/15 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-[#F9D57E] rounded-full transition-all"
                    style={{ width: `${personal.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#3C1E38]/55">{formatBarDateRange(personal.startDate, personal.endDate)}</p>
                {personal.yearTheme && (
                  <p className="text-[10px] text-[#F9D57E] mt-0.5">{personal.yearTheme}</p>
                )}
              </div>
            )}
            <div className="bg-white rounded-xl p-3.5 border border-[#A7C2D7]/15 opacity-95">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#3C1E38]/50">
                  Year {calendarQ.halfYearPhase}: {calendarQ.halfYearPhaseName} — Week {calendarQ.weekInQuarter} of {calendarQ.totalWeeks}
                </span>
                <span className="text-[10px] font-medium text-[#A7C2D7]">{calendarQ.labelShort}</span>
              </div>
              <div className="h-2 bg-[#A7C2D7]/10 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-[#A7C2D7] rounded-full transition-all"
                  style={{ width: `${calendarQ.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#3C1E38]/45">{calendarQ.dateRangeLabel}</p>
              <p className="text-[10px] text-[#A7C2D7] mt-0.5">Calendar Year</p>
            </div>
          </div>
        </div>

        {/* Right Column - Today's Intercession */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 border border-[#A7C2D7]/10">
            <h3 className="font-playfair text-base font-bold text-[#3C1E38] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F9D57E]" /> Today's Intercession
            </h3>

            <div className="p-3 rounded-lg bg-[#F9D57E]/10 border border-[#F9D57E]/20 mb-4">
              <p className="text-xs text-[#3C1E38]/50 mb-1">{new Date().toLocaleDateString("en-US", { weekday: "long" })}'s Theme</p>
              <p className="font-playfair font-bold text-[#3C1E38]">{intercession.theme}</p>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs text-[#3C1E38]/50">Focus areas:</p>
              {intercession.focus.map((item, i) => (
                <div key={i} className="flex items-start gap-2 py-1">
                  <Heart className="w-3 h-3 text-[#F9D57E] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#3C1E38]/70">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#A7C2D7]/10">
              <p className="text-xs text-[#3C1E38]/50 mb-2">From 10-area rotation:</p>
              <div className="flex gap-2">
                {prayerAreas.map((area) => (
                  <span key={area} className="text-xs bg-[#A7C2D7]/10 text-[#3C1E38]/70 px-2.5 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/app/prayers" className="flex items-center justify-center gap-1 text-xs text-[#A7C2D7] font-medium mt-4 hover:underline">
              Open Prayer Tracker <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

