"use client"

import { useState, useCallback, useMemo } from "react"
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

interface PulseClientProps {
  goals: GoalConfig[]
  userId: string
  todaySession: PulseSessionRow | null
  pastSessions: PulseSessionRow[]
  weekDevotions: Record<string, unknown>[]
  weekPrayerSessions: { date: string }[]
  weekDownloads: { id: string; content: string; created_at?: string }[]
  declarationLogsSummary: { daysAllMet: number; totalDays: number }
  thisWeekPulseCheck: Record<string, unknown> | null
  declarations: { id: string; content: string; scripture_reference: string }[]
  lastWeekTimeAnalysis: string | null
  nextWeekFocusDates: string[]
  nextWeekDailyFocus: { date: string; focus_1?: string; focus_2?: string; focus_3?: string; goal_1?: string; goal_2?: string; goal_3?: string }[]
  quarter: { weekInQuarter: number; phaseName: string }
  weekNumber: number
  quarterCode: string
  todayStr: string
  weekStartStr: string
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
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(session?.started_at ? new Date(session.started_at).getTime() : null)
  const [completing, setCompleting] = useState(false)

  const updateSession = useCallback(
    async (updates: Partial<SessionState>) => {
      if (!session) return
      setSession((p) => (p ? { ...p, ...updates } : null))
      const { error } = await supabase.from("pulse_sessions").update(updates).eq("id", session.id)
      if (error) console.error("[Pulse] update error:", error.message)
      else router.refresh()
    },
    [session, supabase, router]
  )

  const beginSession = useCallback(async () => {
    if (session) {
      setSessionStartTime(session.started_at ? new Date(session.started_at).getTime() : Date.now())
      setExpandedPhase(PHASE_IDS.find((id) => !session.phases_completed?.includes(id) && !skippedPhases.has(id)) ?? PHASE_IDS[0])
      return
    }
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("pulse_sessions")
      .insert({
        user_id: props.userId,
        date: props.todayStr,
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
    }
    router.refresh()
  }, [session, props.userId, props.todayStr, props.quarterCode, props.weekNumber, skippedPhases, supabase, router])

  const getPhaseStatus = (phaseId: PhaseId): PhaseStatus => {
    if (skippedPhases.has(phaseId)) return "skipped"
    if (session?.phases_completed?.includes(phaseId)) return "complete"
    if (expandedPhase === phaseId) return "in_progress"
    return "not_started"
  }

  const weekStats = useMemo(() => {
    const devotions = props.weekDevotions as { date: string; prayer_complete?: boolean; declarations_complete?: boolean; sermons_today?: number; energy_score?: number }[]
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

  const markPhaseComplete = useCallback(
    (phaseId: PhaseId) => {
      if (!session) return
      const next = [...(session.phases_completed ?? []), phaseId]
      if (phaseId === "setup") updateSession({ phases_completed: next, phase1_completed: true })
      else if (phaseId === "measure") updateSession({ phases_completed: next })
      else if (phaseId === "review") updateSession({ phases_completed: next })
      else if (phaseId === "learn") updateSession({ phases_completed: next })
      else if (phaseId === "plan") updateSession({ phases_completed: next, phase5_next_week_focus: nextWeekFocus, phase6_monday_top3: mondayTop3 })
      else updateSession({ phases_completed: next, session_quality: sessionQuality })
      setSession((p) => (p ? { ...p, phases_completed: next } : null))
      const nextExpanded = PHASE_IDS.find((id) => !next.includes(id) && !skippedPhases.has(id))
      setExpandedPhase(nextExpanded ?? null)
    },
    [session, updateSession, nextWeekFocus, mondayTop3, sessionQuality, skippedPhases]
  )

  const skipPhase = useCallback(
    (phaseId: PhaseId) => {
      const nextSkipped = new Set(skippedPhases).add(phaseId)
      setSkippedPhases(nextSkipped)
      const nextExpanded = PHASE_IDS.find((id) => !session?.phases_completed?.includes(id) && !nextSkipped.has(id))
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
        updateSession({ phase2_backfill_count: count })
        setSession((p) => (p ? { ...p, phase2_backfill_count: count } : null))
      }
      router.refresh()
    },
    [props.userId, session, updateSession, supabase, router]
  )

  const savePulseCheck = useCallback(
    async (row: Record<string, unknown>): Promise<string | null> => {
      const { data, error } = await supabase.from("pulse_checks").insert({ ...row, user_id: props.userId }).select("id").single()
      if (error || !data) return null
      if (session) updateSession({ phase3_pulse_check_id: data.id })
      return data.id
    },
    [props.userId, session, updateSession, supabase]
  )

  const saveDailyFocus = useCallback(
    async (date: string, row: { focus_1: string; focus_2: string; focus_3: string; goal_1?: string; goal_2?: string; goal_3?: string }) => {
      await supabase.from("daily_focus").upsert({ user_id: props.userId, date, ...row }, { onConflict: "user_id,date" })
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
    await supabase
      .from("pulse_sessions")
      .update({
        completed_at: completedAt,
        total_duration_minutes: totalMinutes,
        phases_completed: PHASE_IDS,
        phase5_next_week_focus: nextWeekFocus,
        phase6_monday_top3: mondayTop3,
        session_quality: sessionQuality,
        phase4_time_analysis: phase4Time || null,
        phase4_constraint_changes: phase4Constraint || null,
        phase4_declaration_reviewed: phase4Declaration || null,
      })
      .eq("id", session.id)
    // Planned week starts Monday; session is typically Sunday, so next Monday = session.date + 1 (timezone-safe)
    const [y, mo, d] = session.date.split("-").map(Number)
    const sessionDate = new Date(y, mo - 1, d)
    const day = sessionDate.getDay()
    const daysUntilNextMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day
    sessionDate.setDate(sessionDate.getDate() + daysUntilNextMonday)
    const weekStartStr = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, "0")}-${String(sessionDate.getDate()).padStart(2, "0")}`
    await supabase.from("weekly_goals").upsert(
      {
        user_id: props.userId,
        week_start_date: weekStartStr,
        goal_1_text: nextWeekFocus[0]?.trim() || null,
        goal_1_code: null,
        goal_1_completed: false,
        goal_2_text: nextWeekFocus[1]?.trim() || null,
        goal_2_code: null,
        goal_2_completed: false,
        goal_3_text: nextWeekFocus[2]?.trim() || null,
        goal_3_code: null,
        goal_3_completed: false,
      },
      { onConflict: "user_id,week_start_date" }
    )
    setSession((p) => (p ? { ...p, completed_at: completedAt, total_duration_minutes: totalMinutes } : null))
    setCompleting(false)
    router.refresh()
  }, [session, nextWeekFocus, mondayTop3, sessionQuality, phase4Time, phase4Constraint, phase4Declaration, props.userId, supabase, router])

  const elapsedMinutes = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 60000) : 0

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
      else { max = Math.max(max, cur); cur = 0 }
    }
    return Math.max(max, cur)
  }, [sessionsForStreak])

  const quarterSundays = 13
  const quarterSessionCount = useMemo(
    () => props.pastSessions.filter((s) => s.completed_at).length + (session?.completed_at ? 1 : 0),
    [props.pastSessions, session]
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SessionBanner
        isSunday={isSunday}
        weekNumber={props.quarter.weekInQuarter}
        quarterName={props.quarter.phaseName}
        hasSession={!!session}
        sessionComplete={!!session?.completed_at}
        onBegin={beginSession}
      />

      {session && !session.completed_at && (
        <div className="text-center py-2 px-3 rounded-lg bg-[#A7C2D7]/10 text-sm text-[#3C1E38]/70">
          Session: {elapsedMinutes} min elapsed
        </div>
      )}

      {session && !session.completed_at && (
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
              onMarkComplete={() => markPhaseComplete(phase.id)}
              onSkip={() => skipPhase(phase.id)}
              canSkip={true}
            >
              {phase.id === "setup" && <Phase1Setup />}
              {phase.id === "measure" && (
                <Phase2Measure
                  sevenDaysAgoStr={props.sevenDaysAgoStr}
                  todayStr={props.todayStr}
                  weekDevotions={props.weekDevotions as { date: string; prayer_complete?: boolean; declarations_complete?: boolean; gratitude_complete?: boolean; sermons_today?: number; energy_score?: number }[]}
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
                  onSavePulseCheck={savePulseCheck}
                />
              )}
              {phase.id === "learn" && (
                <Phase4Learn
                  lastWeekTimeAnalysis={props.lastWeekTimeAnalysis}
                  declarations={props.declarations}
                  onTimeAnalysisChange={(v) => { setPhase4Time(v); updateSession({ phase4_time_analysis: v }) }}
                  onConstraintChange={(v) => { setPhase4Constraint(v); updateSession({ phase4_constraint_changes: v }) }}
                  onDeclarationReviewedChange={(v) => { setPhase4Declaration(v); updateSession({ phase4_declaration_reviewed: v }) }}
                />
              )}
              {phase.id === "plan" && (
                <Phase5Plan
                  quarterName={props.quarter.phaseName}
                  weekNumber={props.quarter.weekInQuarter}
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
                  onSessionQualityChange={setSessionQuality}
                  onCompleteSession={completeSession}
                  completing={completing}
                />
              )}
            </PhaseCard>
          ))}
        </div>
      )}

      {(!session || session.completed_at) && (
        <SessionHistory
          pastSessions={sessionsForStreak}
          streakCount={streakCount}
          longestStreak={longestStreak}
          quarterSessionCount={quarterSessionCount}
          quarterTotalSundays={quarterSundays}
        />
      )}
    </div>
  )
}
