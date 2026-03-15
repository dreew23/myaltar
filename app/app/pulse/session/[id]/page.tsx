import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TIME_CATEGORIES, SESSION_QUALITY_LABELS } from "@/lib/pulse"
import type { PulseSessionRow } from "@/lib/pulse"

export const metadata = { title: "Planning Session | ALTAR" }

/** Next Monday after session date (session is typically Sunday). */
function getPlannedWeekStart(sessionDate: string): string {
  const d = new Date(sessionDate + "T12:00:00")
  const day = d.getDay()
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  d.setDate(d.getDate() + daysUntilMonday)
  return d.toISOString().split("T")[0]
}

function getPlannedWeekDates(weekStart: string): string[] {
  const start = new Date(weekStart + "T12:00:00")
  const out: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push(d.toISOString().split("T")[0])
  }
  return out
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default async function PulseSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: session, error: sessionError } = await supabase
    .from("pulse_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (sessionError || !session) notFound()
  const row = session as PulseSessionRow

  const plannedWeekStart = getPlannedWeekStart(row.date)
  const plannedWeekDates = getPlannedWeekDates(plannedWeekStart)

  let dailyFocus: { date: string; focus_1?: string; focus_2?: string; focus_3?: string; goal_1?: string; goal_2?: string; goal_3?: string }[] = []
  let pulseCheck: Record<string, unknown> | null = null

  const [focusRes, checkRes] = await Promise.all([
    supabase
      .from("daily_focus")
      .select("*")
      .eq("user_id", user.id)
      .in("date", plannedWeekDates),
    row.phase3_pulse_check_id
      ? supabase.from("pulse_checks").select("*").eq("id", row.phase3_pulse_check_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  if (focusRes.data?.length) dailyFocus = focusRes.data as typeof dailyFocus
  if (checkRes.data) pulseCheck = checkRes.data as Record<string, unknown>

  const sessionDate = new Date(row.date + "T12:00:00")
  const weekStartDate = new Date(plannedWeekStart + "T12:00:00")
  const weekEndDate = new Date(plannedWeekStart + "T12:00:00")
  weekEndDate.setDate(weekEndDate.getDate() + 6)

  let timeAnalysis: Record<string, number> = {}
  try {
    if (row.phase4_time_analysis) timeAnalysis = JSON.parse(row.phase4_time_analysis) as Record<string, number>
  } catch {}

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/app/pulse"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#3C1E38]/70 hover:text-[#3C1E38]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pulse
        </Link>
      </div>

      <header>
        <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">
          Sunday Planning Session
        </h1>
        <p className="text-[#3C1E38]/70 mt-1">
          {sessionDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {row.total_duration_minutes != null && (
            <span className="ml-2 text-sm">
              · {Math.floor(row.total_duration_minutes / 60)}h {row.total_duration_minutes % 60}m
            </span>
          )}
          {row.session_quality != null && (
            <span className="ml-2 text-sm">
              · {SESSION_QUALITY_LABELS[row.session_quality] ?? `${row.session_quality}/5`}
            </span>
          )}
        </p>
      </header>

      {/* Phase 4 – Learn & Analyze */}
      <section className="rounded-xl border border-[#A7C2D7]/20 bg-white p-5 space-y-4">
        <h2 className="font-playfair text-lg font-semibold text-[#3C1E38]">
          Learn & Analyze
        </h2>
        {row.phase4_time_analysis && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#3C1E38]/80">Time (hours by category)</p>
            <ul className="text-sm text-[#3C1E38]/80 space-y-1">
              {TIME_CATEGORIES.map((cat) => {
                const val = timeAnalysis[cat.key]
                if (val == null) return null
                return (
                  <li key={cat.key} className="flex justify-between max-w-xs">
                    <span>{cat.label}</span>
                    <span>{val}h</span>
                  </li>
                )
              })}
            </ul>
            {Object.keys(timeAnalysis).length > 0 && (
              <p className="text-xs text-[#3C1E38]/50 pt-1">
                Total: {Object.values(timeAnalysis).reduce((a, b) => a + b, 0).toFixed(1)} hours
              </p>
            )}
          </div>
        )}
        {row.phase4_constraint_changes && (
          <div>
            <p className="text-sm font-medium text-[#3C1E38]/80">What was different about that week</p>
            <p className="text-sm text-[#3C1E38]/90 mt-1 whitespace-pre-wrap">
              {row.phase4_constraint_changes}
            </p>
          </div>
        )}
        {row.phase4_declaration_reviewed && (
          <div>
            <p className="text-sm font-medium text-[#3C1E38]/80">Declaration reviewed</p>
            <p className="text-sm text-[#3C1E38]/90 mt-1 whitespace-pre-wrap">
              {row.phase4_declaration_reviewed}
            </p>
          </div>
        )}
        {!row.phase4_time_analysis && !row.phase4_constraint_changes && !row.phase4_declaration_reviewed && (
          <p className="text-sm text-[#3C1E38]/50">No Phase 4 notes saved.</p>
        )}
      </section>

      {/* Phase 3 – Pulse Check (if linked) */}
      {pulseCheck && (
        <section className="rounded-xl border border-[#A7C2D7]/20 bg-white p-5 space-y-4">
          <h2 className="font-playfair text-lg font-semibold text-[#3C1E38]">
            Review & Pulse Check
          </h2>
          {pulseCheck.overall_reflection && (
            <div>
              <p className="text-sm font-medium text-[#3C1E38]/80">Overall reflection</p>
              <p className="text-sm text-[#3C1E38]/90 mt-1 whitespace-pre-wrap">
                {String(pulseCheck.overall_reflection)}
              </p>
            </div>
          )}
          {typeof pulseCheck.g3_dominion === "number" && (
            <p className="text-sm text-[#3C1E38]/80">
              DOMINION alignment: {pulseCheck.g3_dominion}/10
            </p>
          )}
        </section>
      )}

      {/* Phase 5 – Plan Forward */}
      <section className="rounded-xl border border-[#A7C2D7]/20 bg-white p-5 space-y-4">
        <h2 className="font-playfair text-lg font-semibold text-[#3C1E38]">
          Plan Forward
        </h2>
        <p className="text-sm text-[#3C1E38]/70">
          Week planned: {weekStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          {" – "}
          {weekEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        {row.phase5_next_week_focus?.length ? (
          <div>
            <p className="text-sm font-medium text-[#3C1E38]/80">Next week&apos;s priorities</p>
            <ol className="list-decimal list-inside text-sm text-[#3C1E38]/90 mt-1 space-y-1">
              {row.phase5_next_week_focus.filter(Boolean).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>
        ) : null}
        {dailyFocus.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#3C1E38]/80">Daily focus</p>
            <div className="space-y-3">
              {plannedWeekDates.map((dateStr, i) => {
                const focus = dailyFocus.find((f) => f.date === dateStr)
                const d = new Date(dateStr + "T12:00:00")
                if (!focus || (!focus.focus_1 && !focus.focus_2 && !focus.focus_3 && !focus.goal_1 && !focus.goal_2 && !focus.goal_3))
                  return null
                return (
                  <div
                    key={dateStr}
                    className="rounded-lg border border-[#A7C2D7]/15 p-3 text-sm"
                  >
                    <p className="font-medium text-[#3C1E38]/80 mb-2">
                      {DAY_LABELS[i]} {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <ul className="text-[#3C1E38]/90 space-y-1">
                      {focus.focus_1 && <li>Focus 1: {focus.focus_1}</li>}
                      {focus.focus_2 && <li>Focus 2: {focus.focus_2}</li>}
                      {focus.focus_3 && <li>Focus 3: {focus.focus_3}</li>}
                      {focus.goal_1 && <li>Goal 1: {focus.goal_1}</li>}
                      {focus.goal_2 && <li>Goal 2: {focus.goal_2}</li>}
                      {focus.goal_3 && <li>Goal 3: {focus.goal_3}</li>}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {!row.phase5_next_week_focus?.length && dailyFocus.length === 0 && (
          <p className="text-sm text-[#3C1E38]/50">No Phase 5 plan saved.</p>
        )}
      </section>

      {/* Phase 6 – Monday top 3 */}
      {row.phase6_monday_top3?.length ? (
        <section className="rounded-xl border border-[#A7C2D7]/20 bg-white p-5 space-y-2">
          <h2 className="font-playfair text-lg font-semibold text-[#3C1E38]">
            Monday top 3
          </h2>
          <ol className="list-decimal list-inside text-sm text-[#3C1E38]/90 space-y-1">
            {row.phase6_monday_top3.filter(Boolean).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {row.phase5_weekly_plan_notes && (
        <section className="rounded-xl border border-[#A7C2D7]/20 bg-white p-5">
          <h2 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-2">
            Weekly plan notes
          </h2>
          <p className="text-sm text-[#3C1E38]/90 whitespace-pre-wrap">
            {row.phase5_weekly_plan_notes}
          </p>
        </section>
      )}

      {row.overall_session_notes && (
        <section className="rounded-xl border border-[#A7C2D7]/20 bg-white p-5">
          <h2 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-2">
            Session notes
          </h2>
          <p className="text-sm text-[#3C1E38]/90 whitespace-pre-wrap">
            {row.overall_session_notes}
          </p>
        </section>
      )}
    </div>
  )
}
