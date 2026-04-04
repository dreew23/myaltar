"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SessionBanner } from "@/components/app/pulse/session-banner"
import { PhaseCard, type PhaseStatus } from "@/components/app/pulse/phase-card"
import { Phase1Setup } from "@/components/app/pulse/phase1-setup"
import { Phase2Measure } from "@/components/app/pulse/phase2-measure"
import { Phase3Review } from "@/components/app/pulse/phase3-review"
import { Phase4Learn } from "@/components/app/pulse/phase4-learn"
import { Phase5Plan } from "@/components/app/pulse/phase5-plan"
import { Phase6Close } from "@/components/app/pulse/phase6-close"
import { SessionHistory } from "@/components/app/pulse/session-history"
import type { GoalConfig } from "@/lib/data/dominion"
import { PHASES, type PhaseId, type PulseSessionRow } from "@/lib/pulse"
import { findSessionForWeek, getRecentSundays, toLocalISODate } from "@/lib/pulse-session-dates"
import type { PersonalYearConfigRow } from "@/lib/personal-year"
import {
  formatDualPulseContextLine,
  formatCalendarQuarterEndingLine,
  getCalendarQuarterProgress,
  getPersonalYearProgress,
} from "@/lib/personal-year"

type SessionState = {
  id: string
  date: string
  started_at: string | null
  completed_at: string | null
  phases_completed: string[]
  phase1_completed: boolean
  phase2_backfill_count: number
  phase3_pulse_check_id: string | null
  phase4_time_analysis: string | null
  phase4_constraint_changes: string | null
  phase4_declaration_reviewed: string | null
  phase5_next_week_focus: string[]
  phase6_monday_top3: string[]
  session_quality: number | null
  total_duration_minutes: number | null
}

const PHASE_IDS: PhaseId[] = ["setup", "measure", "review", "learn", "plan", "close"]

function formatRelativeSaved(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 60) return `${Math.max(0, s)}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  return `${Math.floor(m / 60)}h ago`
}

interface PulseClientProps {
  mode?: "create" | "edit"
  editSessionId?: string
  calendarTodayStr: string
  sessionDateStr: string
  goals: GoalConfig[]
  userId: string
  todaySession: PulseSessionRow | null
  pastSessions: PulseSessionRow[]
  sessionsForWeekMatching: PulseSessionRow[]
  weekDevotions: Record<string, unknown>[]
  weekPrayerSessions: { date: string }[]
  weekDownloads: { id: string; content: string; created_at?: string }[]
  declarationLogsSummary: { daysAllMet: number; totalDays: number }
  thisWeekPulseCheck: Record<string, unknown> | null
  declarations: { id: string; content: string; scripture_reference: string }[]
  lastWeekTimeAnalysis: string | null
  nextWeekFocusDates: string[]
  nextWeekDailyFocus: {
    date: string
    focus_1?: string
    focus_2?: string
    focus_3?: string
    goal_1?: string
    goal_2?: string
    goal_3?: string
  }[]
  quarter: { weekInQuarter: number; phaseName: string }
  weekNumber: number
  quarterCode: string
  sevenDaysAgoStr: string
}

function sessionToState(s: PulseSessionRow | null): SessionState | null {
  if (!s) return null
  return {
    id: s.id,
    date: s.date,
    started_at: s.started_at,
    completed_at: s.completed_at,
    phases_completed: s.phases_completed ?? [],
    phase1_completed: s.phase1_completed ?? false,
    phase2_backfill_count: s.phase2_backfill_count ?? 0,
    phase3_pulse_check_id: s.phase3_pulse_check_id,
    phase4_time_analysis: s.phase4_time_analysis,
    phase4_constraint_changes: s.phase4_constraint_changes,
    phase4_declaration_reviewed: s.phase4_declaration_reviewed,
    phase5_next_week_focus: s.phase5_next_week_focus ?? [],
    phase6_monday_top3: s.phase6_monday_top3 ?? [],
    session_quality: s.session_quality,
    total_duration_minutes: s.total_duration_minutes,
  }
}

export function PulseClient(props: PulseClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const mode = props.mode ?? "create"
  const isSunday = new Date().getDay() === 0

  const [session, setSession] = useState<SessionState | null>(() => sessionToState(props.todaySession))
  const [expandedPhase, setExpandedPhase] = useState<PhaseId | null>(PHASE_IDS[0])
  const [skippedPhases, setSkippedPhases] = useState<Set<PhaseId>>(new Set())
  const [phase4Time, setPhase4Time] = useState(props.todaySession?.phase4_time_analysis ?? "")
  const [phase4Constraint, setPhase4Constraint] = useState(props.todaySession?.phase4_constraint_changes ?? "")
  const [phase4Declaration, setPhase4Declaration] = useState(props.todaySession?.phase4_declaration_reviewed ?? "")
  const [nextWeekFocus, setNextWeekFocus] = useState<string[]>(props.todaySession?.phase5_next_week_focus ?? [])
  const [mondayTop3, setMondayTop3] = useState<string[]>(props.todaySession?.phase6_monday_top3 ?? [])
  const [sessionQuality, setSessionQuality] = useState<number | null>(props.todaySession?.session_quality ?? null)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(
    session?.started_at ? new Date(session.started_at).getTime() : null
  )
  const [completing, setCompleting] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const skipPlanPersist = useRef(true)

  useEffect(() => {
    skipPlanPersist.current = true
    setSession(sessionToState(props.todaySession))
    const row = props.todaySession
    if (row) {
      setPhase4Time(row.phase4_time_analysis ?? "")
      setPhase4Constraint(row.phase4_constraint_changes ?? "")
      setPhase4Declaration(row.phase4_declaration_reviewed ?? "")
      setNextWeekFocus(row.phase5_next_week_focus ?? [])
      setMondayTop3(row.phase6_monday_top3 ?? [])
      setSessionQuality(row.session_quality ?? null)
      setSessionStartTime(row.started_at ? new Date(row.started_at).getTime() : null)
    }
  }, [props.todaySession])

  const upsertWeeklyGoalsForSession = useCallback(
    async (focus: string[], sessionDate: string) => {
      const [y, mo, d] = sessionDate.split("-").map(Number)
      const dt = new Date(y, mo - 1, d)
      const day = dt.getDay()
      const daysUntilNextMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day
      dt.setDate(dt.getDate() + daysUntilNextMonday)
      const weekStartStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
      await supabase.from("weekly_goals").upsert(
        {
          user_id: props.userId,
          week_start_date: weekStartStr,
          goal_1_text: focus[0]?.trim() || null,
          goal_1_code: null,
          goal_1_completed: false,
          goal_2_text: focus[1]?.trim() || null,
          goal_2_code: null,
          goal_2_completed: false,
          goal_3_text: focus[2]?.trim() || null,
          goal_3_code: null,
          goal_3_completed: false,
        },
        { onConflict: "user_id,week_start_date" }
      )
    },
    [props.userId, supabase]
  )

  const updateSession = useCallback(
    async (updates: Partial<SessionState>) => {
      if (!session) return
      setSession((p) => (p ? { ...p, ...updates } : null))
      const { error } = await supabase.from("pulse_sessions").update(updates).eq("id", session.id)
      if (error) console.error("[Pulse] update error:", error.message)
      else {
        setLastSavedAt(Date.now())
        router.refresh()
      }
    },
    [session, supabase, router]
  )

  const beginSession = useCallback(async () => {
    if (session) {
      setSessionStartTime(session.started_at ? new Date(session.started_at).getTime() : Date.now())
      setExpandedPhase(
        PHASE_IDS.find((id) => !session.phases_completed?.includes(id) && !skippedPhases.has(id)) ?? PHASE_IDS[0]
      )
      return
    }
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("pulse_sessions")
      .insert({
        user_id: props.userId,
        date: props.sessionDateStr,
        quarter_code: props.quarterCode,
        week_number: props.weekNumber,
        started_at: now,
        phases_completed: [],
      })
      .select()
      .single()
    if (error) {
      console.error("[Pulse] create error:", error.message)
      return
    }
    const newSession = sessionToState(data as PulseSessionRow)
    if (newSession) {
      setSession(newSession)
      setSessionStartTime(Date.now())
      setExpandedPhase("setup")
      setLastSavedAt(Date.now())
    }
    router.refresh()
  }, [session, props.userId, props.sessionDateStr, props.quarterCode, props.weekNumber, skippedPhases, supabase, router])

  const getPhaseStatus = (phaseId: PhaseId): PhaseStatus => {
    if (skippedPhases.has(phaseId)) return "skipped"
    if (session?.phases_completed?.includes(phaseId)) return "complete"
    if (expandedPhase === phaseId) return "in_progress"
    return "not_started"
  }

  const markPhaseComplete = useCallback(
    async (phaseId: PhaseId) => {
      if (!session) return
      const next = [...(session.phases_completed ?? []), phaseId]
      if (phaseId === "setup") await updateSession({ phases_completed: next, phase1_completed: true })
      else if (phaseId === "measure") await updateSession({ phases_completed: next })
      else if (phaseId === "review") await updateSession({ phases_completed: next })
      else if (phaseId === "learn") await updateSession({ phases_completed: next })
      else if (phaseId === "plan") {
        await updateSession({ phases_completed: next, phase5_next_week_focus: nextWeekFocus, phase6_monday_top3: mondayTop3 })
        await upsertWeeklyGoalsForSession(nextWeekFocus, session.date)
      } else await updateSession({ phases_completed: next, session_quality: sessionQuality })
      setSession((p) => (p ? { ...p, phases_completed: next } : null))
      const nextExpanded = PHASE_IDS.find((id) => !next.includes(id) && !skippedPhases.has(id))
      setExpandedPhase(nextExpanded ?? null)
    },
    [
      session,
      updateSession,
      nextWeekFocus,
      mondayTop3,
      sessionQuality,
      skippedPhases,
      upsertWeeklyGoalsForSession,
    ]
  )

  const skipPhase = useCallback(
    (phaseId: PhaseId) => {
      const nextSkipped = new Set(skippedPhases).add(phaseId)
      setSkippedPhases(nextSkipped)
      const nextExpanded = PHASE_IDS.find(
        (id) => !session?.phases_completed?.includes(id) && !nextSkipped.has(id)
      )
      setExpandedPhase(nextExpanded ?? null)
    },
    [session, skippedPhases]
  )

  const backfillDay = useCallback(
    async (date: string, data: Record<string, unknown>) => {
      await supabase.from("daily_devotions").upsert(
        { user_id: props.userId, date, ...data },
        { onConflict: "user_id,date" }
      )
      if (session) {
        const count = (session.phase2_backfill_count ?? 0) + 1
        await updateSession({ phase2_backfill_count: count })
        setSession((p) => (p ? { ...p, phase2_backfill_count: count } : null))
      }
      router.refresh()
    },
    [props.userId, session, updateSession, supabase, router]
  )

  const savePulseCheck = useCallback(
    async (row: Record<string, unknown>): Promise<string | null> => {
      if (session?.phase3_pulse_check_id) {
        const { error } = await supabase.from("pulse_checks").update(row).eq("id", session.phase3_pulse_check_id)
        if (error) {
          console.error("[Pulse] pulse_check update:", error.message)
          return null
        }
        setLastSavedAt(Date.now())
        router.refresh()
        return session.phase3_pulse_check_id
      }
      const { data, error } = await supabase
        .from("pulse_checks")
        .insert({ ...row, user_id: props.userId })
        .select("id")
        .single()
      if (error || !data) return null
      if (session) await updateSession({ phase3_pulse_check_id: data.id })
      setLastSavedAt(Date.now())
      return data.id
    },
    [props.userId, session, updateSession, supabase, router]
  )

  const saveDailyFocus = useCallback(
    async (date: string, row: { focus_1: string; focus_2: string; focus_3: string; goal_1?: string; goal_2?: string; goal_3?: string }) => {
      await supabase.from("daily_focus").upsert({ user_id: props.userId, date, ...row }, { onConflict: "user_id,date" })
      setLastSavedAt(Date.now())
      router.refresh()
    },
    [props.userId, supabase, router]
  )

  const completeSession = useCallback(async () => {
    if (!session) return
    setCompleting(true)
    const completedAt = new Date().toISOString()
    const start = session.started_at ? new Date(session.started_at).getTime() : Date.now()
    const totalMinutes = Math.round((Date.now() - start) / 60000)

    const payloadBase = {
      phase5_next_week_focus: nextWeekFocus,
      phase6_monday_top3: mondayTop3,
      session_quality: sessionQuality,
      phase4_time_analysis: phase4Time || null,
      phase4_constraint_changes: phase4Constraint || null,
      phase4_declaration_reviewed: phase4Declaration || null,
    }

    if (session.completed_at) {
      await supabase.from("pulse_sessions").update(payloadBase).eq("id", session.id)
    } else {
      await supabase
        .from("pulse_sessions")
        .update({
          ...payloadBase,
          completed_at: completedAt,
          total_duration_minutes: totalMinutes,
          phases_completed: [...PHASE_IDS],
        })
        .eq("id", session.id)
      setSession((p) =>
        p ? { ...p, completed_at: completedAt, total_duration_minutes: totalMinutes, phases_completed: [...PHASE_IDS] } : null
      )
    }

    await upsertWeeklyGoalsForSession(nextWeekFocus, session.date)
    setLastSavedAt(Date.now())
    setCompleting(false)
    router.refresh()
  }, [
    session,
    nextWeekFocus,
    mondayTop3,
    sessionQuality,
    phase4Time,
    phase4Constraint,
    phase4Declaration,
    props.userId,
    supabase,
    router,
    upsertWeeklyGoalsForSession,
  ])

  useEffect(() => {
    if (mode !== "edit" || !session?.completed_at) return
    if (skipPlanPersist.current) {
      skipPlanPersist.current = false
      return
    }
    const t = setTimeout(async () => {
      await supabase
        .from("pulse_sessions")
        .update({ phase5_next_week_focus: nextWeekFocus })
        .eq("id", session.id)
      await upsertWeeklyGoalsForSession(nextWeekFocus, session.date)
      setLastSavedAt(Date.now())
      router.refresh()
    }, 800)
    return () => clearTimeout(t)
  }, [nextWeekFocus, mode, session?.completed_at, session?.id, session?.date, supabase, router, upsertWeeklyGoalsForSession])

  const elapsedMinutes = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 60000) : 0

  const sessionAnchorDate = useMemo(() => new Date(props.sessionDateStr + "T12:00:00"), [props.sessionDateStr])
  const personalProgress = useMemo(
    () => getPersonalYearProgress(props.personalYears, sessionAnchorDate),
    [props.personalYears, sessionAnchorDate]
  )
  const calendarForSession = useMemo(() => getCalendarQuarterProgress(sessionAnchorDate), [sessionAnchorDate])
  const dualContextLine = useMemo(
    () => formatDualPulseContextLine(personalProgress, calendarForSession),
    [personalProgress, calendarForSession]
  )
  const phase5PersonalLine = personalProgress
    ? `Personal year ${personalProgress.progress}% complete (Week ${personalProgress.weekNumber} of 13)`
    : undefined
  const phase5CalendarLine = formatCalendarQuarterEndingLine(calendarForSession)

  const weekStats = useMemo(() => {
    const devotions = props.weekDevotions as {
      date: string
      prayer_complete?: boolean
      declarations_complete?: boolean
      sermons_today?: number
      energy_score?: number
    }[]
    const prayerDays = devotions.filter((d) => d.prayer_complete).length
    const sermonsTotal = devotions.reduce((s, d) => s + (d.sermons_today ?? 0), 0)
    const energySum = devotions.filter((d) => typeof d.energy_score === "number").reduce((a, d) => a + (d.energy_score ?? 0), 0)
    const energyCount = devotions.filter((d) => typeof d.energy_score === "number").length
    return {
      prayerDays,
      declarationDays: props.declarationLogsSummary.daysAllMet,
      sermonsTotal,
      energyAvg: energyCount ? energySum / energyCount : 0,
      downloadsCount: props.weekDownloads.length,
      focusDays: 0,
    }
  }, [props.weekDevotions, props.declarationLogsSummary, props.weekDownloads])

  const sessionsForStreak = useMemo(() => {
    const list = [...props.pastSessions]
    if (session?.completed_at) {
      list.push(session as unknown as PulseSessionRow)
    } else if (props.todaySession?.completed_at) {
      list.push(props.todaySession)
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [props.pastSessions, session, props.todaySession])

  const streakCount = useMemo(() => {
    let streak = 0
    for (const s of sessionsForStreak) {
      if (s.completed_at) streak++
      else break
    }
    return streak
  }, [sessionsForStreak])

  const longestStreak = useMemo(() => {
    let max = 0
    let cur = 0
    for (const s of sessionsForStreak) {
      if (s.completed_at) cur++
      else {
        max = Math.max(max, cur)
        cur = 0
      }
    }
    return Math.max(max, cur)
  }, [sessionsForStreak])

  const quarterSundays = 13
  const quarterSessionCount = useMemo(() => {
    const qc = props.quarterCode
    return (
      props.pastSessions.filter((s) => s.completed_at && s.quarter_code === qc).length +
      (props.todaySession?.completed_at && props.todaySession.quarter_code === qc ? 1 : 0)
    )
  }, [props.pastSessions, props.quarterCode, props.todaySession])

  const weekHistoryRows = useMemo(() => {
    const sundays = getRecentSundays(13)
    const calendarToday = new Date(props.calendarTodayStr + "T12:00:00")
    const lastSunday = new Date(calendarToday)
    lastSunday.setDate(calendarToday.getDate() - calendarToday.getDay())
    const currentSundayStr = toLocalISODate(lastSunday)

    return sundays.map((sun) => {
      const rowSession = findSessionForWeek(sun, props.sessionsForWeekMatching)
      const start = new Date(sun + "T12:00:00")
      start.setDate(start.getDate() - 6)
      const end = new Date(sun + "T12:00:00")
      const weekLabel = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      return {
        sundayDate: sun,
        weekLabel,
        session: rowSession,
        isCurrentWeek: sun === currentSundayStr,
      }
    })
  }, [props.sessionsForWeekMatching, props.calendarTodayStr])

  const showPhases = Boolean(session && (mode === "edit" || !session.completed_at))
  const sessionDayLabel = new Date(props.sessionDateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {mode === "edit" && (
        <div className="space-y-3">
          <Link
            href="/app/pulse"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#3C1E38]/70 hover:text-[#3C1E38]"
          >
            ← Back to Pulse
          </Link>
          <div className="bg-[#F9D57E]/10 text-[#F9D57E] rounded-lg p-3 border border-[#F9D57E]/25">
            <p className="font-medium text-[#3C1E38]">
              Editing: Week {props.quarter.weekInQuarter} — {sessionDayLabel}
            </p>
            <p className="text-xs text-[#3C1E38]/60 mt-1">
              Session date, week, and quarter are fixed. Other fields save as you edit.
            </p>
          </div>
        </div>
      )}

      {mode === "create" && (
        <SessionBanner
          isSunday={isSunday}
          weekNumber={props.quarter.weekInQuarter}
          quarterName={props.quarter.phaseName}
          dualContextLine={dualContextLine}
          hasSession={!!session}
          sessionComplete={!!session?.completed_at}
          sessionQuality={session?.session_quality ?? null}
          onBegin={beginSession}
        />
      )}

      {lastSavedAt !== null && (
        <p className="text-xs text-[#3C1E38]/50 text-right">Last saved: {formatRelativeSaved(lastSavedAt)}</p>
      )}

      {session && !session.completed_at && mode === "create" && (
        <div className="text-center py-2 px-3 rounded-lg bg-[#A7C2D7]/10 text-sm text-[#3C1E38]/70">
          Session: {elapsedMinutes} min elapsed
        </div>
      )}

      {session && mode === "edit" && !session.completed_at && (
        <div className="text-center py-2 px-3 rounded-lg bg-[#A7C2D7]/10 text-sm text-[#3C1E38]/70">
          Session: {elapsedMinutes} min elapsed
        </div>
      )}

      {showPhases && (
        <div className="space-y-3">
          <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">The 6 phases</h2>
          {PHASES.map((phase, i) => (
            <PhaseCard
              key={phase.id}
              phaseNumber={i + 1}
              title={phase.title}
              estimate={phase.estimate}
              status={getPhaseStatus(phase.id)}
              expanded={expandedPhase === phase.id}
              onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
              onMarkComplete={() => void markPhaseComplete(phase.id)}
              onSkip={() => skipPhase(phase.id)}
              canSkip={true}
            >
              {phase.id === "setup" && <Phase1Setup />}
              {phase.id === "measure" && (
                <Phase2Measure
                  sevenDaysAgoStr={props.sevenDaysAgoStr}
                  windowEndStr={props.sessionDateStr}
                  calendarTodayStr={props.calendarTodayStr}
                  weekDevotions={
                    props.weekDevotions as {
                      date: string
                      prayer_complete?: boolean
                      declarations_complete?: boolean
                      gratitude_complete?: boolean
                      sermons_today?: number
                      energy_score?: number
                    }[]
                  }
                  prayerSessionDates={props.weekPrayerSessions.map((p) => p.date)}
                  declarationLogsSummary={props.declarationLogsSummary}
                  backfillCount={session?.phase2_backfill_count ?? 0}
                  userId={props.userId}
                  onBackfillDay={backfillDay}
                />
              )}
              {phase.id === "review" && (
                <Phase3Review
                  goals={props.goals}
                  weekStats={weekStats}
                  weekDownloads={props.weekDownloads}
                  existingPulseCheck={props.thisWeekPulseCheck}
                  userId={props.userId}
                  quarterCode={props.quarterCode}
                  weekNumber={props.weekNumber}
                  pulseCheckDate={props.sessionDateStr}
                  onSavePulseCheck={savePulseCheck}
                  dualContextLine={dualContextLine}
                />
              )}
              {phase.id === "learn" && (
                <Phase4Learn
                  lastWeekTimeAnalysis={props.lastWeekTimeAnalysis}
                  declarations={props.declarations}
                  onTimeAnalysisChange={(v) => {
                    setPhase4Time(v)
                    void updateSession({ phase4_time_analysis: v })
                  }}
                  onConstraintChange={(v) => {
                    setPhase4Constraint(v)
                    void updateSession({ phase4_constraint_changes: v })
                  }}
                  onDeclarationReviewedChange={(v) => {
                    setPhase4Declaration(v)
                    void updateSession({ phase4_declaration_reviewed: v })
                  }}
                />
              )}
              {phase.id === "plan" && (
                <Phase5Plan
                  quarterName={props.quarter.phaseName}
                  weekNumber={props.quarter.weekInQuarter}
                  personalYearProgressLine={phase5PersonalLine}
                  calendarQuarterContextLine={phase5CalendarLine}
                  nextWeekFocusDates={props.nextWeekFocusDates}
                  nextWeekDailyFocus={props.nextWeekDailyFocus}
                  nextWeekPriorities={nextWeekFocus}
                  mondayTop3={mondayTop3}
                  onNextWeekFocusChange={setNextWeekFocus}
                  onDailyFocusChange={saveDailyFocus}
                  onMondayTop3Change={setMondayTop3}
                />
              )}
              {phase.id === "close" && (
                <Phase6Close
                  sessionDurationMinutes={elapsedMinutes}
                  phasesCompletedCount={session?.phases_completed?.length ?? 0}
                  backfillCount={session?.phase2_backfill_count ?? 0}
                  constraintNoted={phase4Constraint}
                  nextWeekPriorities={nextWeekFocus}
                  mondayTop3={mondayTop3}
                  sessionQuality={sessionQuality}
                  onSessionQualityChange={(n) => {
                    setSessionQuality(n)
                    void updateSession({ session_quality: n })
                  }}
                  onCompleteSession={completeSession}
                  completing={completing}
                  sessionAlreadyComplete={!!session?.completed_at}
                />
              )}
            </PhaseCard>
          ))}
        </div>
      )}

      <SessionHistory
        rows={weekHistoryRows}
        streakCount={streakCount}
        longestStreak={longestStreak}
        quarterSessionCount={quarterSessionCount}
        quarterTotalSundays={quarterSundays}
      />
    </div>
  )
}
