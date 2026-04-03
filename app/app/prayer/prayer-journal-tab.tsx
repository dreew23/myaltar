"use client"

import { useMemo, useState } from "react"
import { prayerAreas } from "@/lib/data/dominion"
import type { PrayerSession } from "@/lib/prayer"

const ATMOSPHERE_EMOJI: Record<string, string> = {
  peaceful: "🕊",
  intense: "🔥",
  warfare: "⚔️",
  dry: "🏜",
  breakthrough: "⚡",
  mixed: "🌤",
}

interface Props {
  sessions: PrayerSession[]
}

export function PrayerJournalTab({ sessions }: Props) {
  const [view, setView] = useState<"list" | "calendar" | "heatmap">("list")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [calMonth, setCalMonth] = useState(() => new Date())

  const completed = useMemo(() => sessions.filter((s) => s.end_time), [sessions])

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = completed.filter((s) => new Date(s.date) >= monthStart).length
    const durations = completed.map((s) => s.duration_minutes ?? 0).filter((m) => m > 0)
    const avg =
      durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
    const streak = (() => {
      const done = new Set(completed.map((s) => s.date))
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      const tk = d.toISOString().split("T")[0]!
      if (!done.has(tk)) d.setDate(d.getDate() - 1)
      let n = 0
      for (;;) {
        const k = d.toISOString().split("T")[0]!
        if (done.has(k)) {
          n++
          d.setDate(d.getDate() - 1)
        } else break
      }
      return n
    })()
    return { total: completed.length, thisMonth, streak, avg }
  }, [completed])

  const weekStats = useMemo(() => {
    const d = new Date()
    const day = d.getDay()
    const mon = new Date(d)
    mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    mon.setHours(0, 0, 0, 0)
    const weekSessions = completed.filter((s) => new Date(s.date) >= mon)
    const totalMin = weekSessions.reduce((a, s) => a + (s.duration_minutes ?? 0), 0)
    const breakthroughs = weekSessions.filter((s) => s.breakthroughs && s.breakthroughs.trim()).length
    const areaCounts: Record<string, number> = {}
    prayerAreas.forEach((a) => {
      areaCounts[a] = 0
    })
    weekSessions.forEach((s) => {
      ;(s.focus_areas_covered ?? []).forEach((a) => {
        if (areaCounts[a] !== undefined) areaCounts[a]++
      })
    })
    const sorted = [...prayerAreas].sort((a, b) => (areaCounts[b] ?? 0) - (areaCounts[a] ?? 0))
    return { weekSessions, totalMin, breakthroughs, areaCounts, most: sorted[0], least: sorted[sorted.length - 1] }
  }, [completed])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return completed
    return completed.filter(
      (s) =>
        (s.journal_entry ?? "").toLowerCase().includes(q) ||
        (s.breakthroughs ?? "").toLowerCase().includes(q) ||
        (s.notes ?? "").toLowerCase().includes(q)
    )
  }, [completed, search])

  const heatmapWeeks = useMemo(() => {
    const weeks = 13
    const grid: number[][] = Array.from({ length: weeks }, () => prayerAreas.map(() => 0))
    const monday = new Date()
    monday.setHours(0, 0, 0, 0)
    const dow = monday.getDay()
    monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1))
    for (let w = 0; w < weeks; w++) {
      const weekStart = new Date(monday)
      weekStart.setDate(monday.getDate() - (weeks - 1 - w) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      const inWeek = completed.filter((s) => {
        const t = new Date(s.date + "T12:00:00")
        return t >= weekStart && t <= weekEnd
      })
      inWeek.forEach((s) => {
        ;(s.focus_areas_covered ?? []).forEach((area) => {
          const ai = prayerAreas.indexOf(area)
          if (ai >= 0) grid[w]![ai] = Math.min(4, (grid[w]![ai] ?? 0) + 1)
        })
      })
    }
    return grid
  }, [completed])

  const calDays = useMemo(() => {
    const y = calMonth.getFullYear()
    const m = calMonth.getMonth()
    const first = new Date(y, m, 1)
    const startPad = (first.getDay() + 6) % 7
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells: { day: number | null; sessions: PrayerSession[]; isToday: boolean }[] = []
    const today = new Date().toISOString().split("T")[0]!
    for (let i = 0; i < startPad; i++) cells.push({ day: null, sessions: [], isToday: false })
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const sess = completed.filter((s) => s.date === ds)
      cells.push({ day: d, sessions: sess, isToday: ds === today })
    }
    return cells
  }, [calMonth, completed])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total sessions", v: stats.total },
          { label: "This month", v: stats.thisMonth },
          { label: "Streak", v: `${stats.streak}d` },
          { label: "Avg duration", v: `${stats.avg}m` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-[#f5f2ec] p-4 text-center"
            style={{ borderColor: "var(--prayer-border)" }}
          >
            <p className="font-prayer-display text-3xl text-[#b8860b]">{s.v}</p>
            <p className="text-xs font-medium text-[#2c2419]/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl border bg-gradient-to-br from-[#f5f2ec] to-[#faf8f4] p-4"
        style={{ borderColor: "var(--prayer-border)" }}
      >
        <p className="font-prayer-display text-lg italic text-[#b8860b]">This week</p>
        <p className="mt-1 text-sm text-[#2c2419]/80">
          {weekStats.weekSessions.length} sessions · {weekStats.totalMin} min · {weekStats.breakthroughs} with
          breakthrough notes
        </p>
        <div className="mt-3 flex gap-1">
          {prayerAreas.map((a) => {
            const n = weekStats.areaCounts[a] ?? 0
            const shade = n === 0 ? "bg-[#ede9e0]" : n === 1 ? "bg-[#e8d5a3]" : n >= 3 ? "bg-[#b8860b]" : "bg-[#d4a017]/60"
            return <div key={a} title={a} className={`h-6 flex-1 rounded ${shade}`} />
          })}
        </div>
        <p className="mt-2 text-xs">
          <span className="text-[#1e8449]">Most covered: {weekStats.most}</span>
          {" · "}
          <span className="text-[#c0392b]">Least: {weekStats.least}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["list", "calendar", "heatmap"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize ${
              view === v ? "border-[#b8860b] bg-[#f5f2ec] text-[#b8860b]" : "border-[var(--prayer-border)] bg-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "list" && (
        <>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes & breakthroughs…"
            className="w-full rounded-xl border px-4 py-2 text-sm"
            style={{ borderColor: "var(--prayer-border)" }}
          />
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-[#2c2419]/50">No sessions match.</p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  className="w-full rounded-xl border bg-white p-4 text-left"
                  style={{ borderColor: "var(--prayer-border)" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    {s.start_time && (
                      <span className="text-xs text-[#2c2419]/50">
                        {new Date(s.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    )}
                    <span className="font-prayer-display text-lg text-[#b8860b]">{s.duration_minutes ?? "—"}m</span>
                    {s.atmosphere && <span className="text-lg">{ATMOSPHERE_EMOJI[s.atmosphere] ?? "✦"}</span>}
                    <div className="flex gap-0.5">
                      {prayerAreas.map((a) => (
                        <span
                          key={a}
                          className={`h-2 w-2 rounded-full ${
                            (s.focus_areas_covered ?? []).includes(a) ? "bg-[#d4a017]" : "bg-[#ede9e0]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {expandedId === s.id && (
                    <div className="mt-3 space-y-2 border-t pt-3 text-sm text-[#2c2419]/80" style={{ borderColor: "var(--prayer-border)" }}>
                      {s.journal_entry && <p className="whitespace-pre-wrap">{s.journal_entry}</p>}
                      {s.breakthroughs && <p className="whitespace-pre-wrap"><strong>Breakthroughs:</strong> {s.breakthroughs}</p>}
                      <p className="text-xs text-[#2c2419]/50">
                        Areas: {(s.focus_areas_covered ?? []).join(", ") || "—"}
                      </p>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}

      {view === "calendar" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm"
              onClick={() => setCalMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
            >
              ←
            </button>
            <span className="font-prayer-display text-lg">
              {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-sm"
              onClick={() => setCalMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#2c2419]/50">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d}>{d}</div>
            ))}
            {calDays.map((c, i) => (
              <div
                key={i}
                className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg border text-sm ${
                  c.day === null ? "border-transparent" : ""
                } ${c.isToday ? "ring-2 ring-[#d4a017]" : ""}`}
                style={{
                  borderColor: c.sessions.length ? "var(--prayer-border)" : "transparent",
                  background:
                    c.sessions.length === 0
                      ? "transparent"
                      : (c.sessions[0]?.duration_minutes ?? 0) >= 60
                        ? "rgba(184,134,11,0.35)"
                        : "rgba(184,134,11,0.15)",
                }}
              >
                {c.day !== null && (
                  <>
                    <span className="font-medium">{c.day}</span>
                    {c.sessions.length > 0 && <span className="text-[10px] text-[#2c2419]/60">{c.sessions.length}</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "heatmap" && (
        <div className="overflow-x-auto">
          <p className="mb-2 text-sm text-[#2c2419]/70">
            13 weeks × 10 areas — intensity by coverage in each week.
          </p>
          <div className="flex gap-1">
            <div className="w-24 shrink-0" />
            {Array.from({ length: 13 }).map((_, wi) => (
              <div key={wi} className="w-6 shrink-0 text-center text-[10px] text-[#2c2419]/40">
                W{wi + 1}
              </div>
            ))}
          </div>
          {prayerAreas.map((area, ai) => (
            <div key={area} className="mt-0.5 flex items-center gap-1">
              <div className="w-24 shrink-0 truncate text-[10px] text-[#2c2419]/70">{area}</div>
              {heatmapWeeks.map((week, wi) => {
                const v = week[ai] ?? 0
                const bg =
                  v === 0 ? "#ede9e0" : v === 1 ? "#e8d5a3" : v === 2 ? "#d4a017" : "#b8860b"
                return (
                  <div
                    key={`${wi}-${ai}`}
                    className="h-5 w-6 shrink-0 rounded-sm"
                    style={{ background: bg }}
                  />
                )
              })}
            </div>
          ))}
          <div className="mt-3 flex items-center gap-3 text-xs text-[#2c2419]/60">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#ede9e0]" /> None</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#e8d5a3]" /> Light</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#d4a017]" /> Medium</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-[#b8860b]" /> Full</span>
          </div>
        </div>
      )}
    </div>
  )
}
