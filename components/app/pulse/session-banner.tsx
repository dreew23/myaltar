"use client"

import Link from "next/link"
import { CalendarCheck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionQualityStars } from "@/components/app/pulse/session-history"

interface SessionBannerProps {
  isSunday: boolean
  weekNumber: number
  quarterName: string
  /** When set, replaces the single “Week … — phase” line with dual personal + calendar context. */
  dualContextLine?: string
  hasSession: boolean
  sessionComplete: boolean
  /** 1–5 from Phase 6; shown when the session is complete. */
  sessionQuality?: number | null
  onBegin: () => void
}

export function SessionBanner({
  isSunday,
  weekNumber,
  quarterName,
  dualContextLine,
  hasSession,
  sessionComplete,
  sessionQuality = null,
  onBegin,
}: SessionBannerProps) {
  const nextSunday = (() => {
    const d = new Date()
    const day = d.getDay()
    const add = day === 0 ? 7 : 7 - day
    const next = new Date(d)
    next.setDate(d.getDate() + add)
    return next.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  })()

  if (isSunday) {
    return (
      <div className="bg-gradient-to-r from-[#F9D57E]/90 via-[#F9D57E]/70 to-[#F9D57E]/50 rounded-2xl p-6 border border-[#F9D57E]/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#3C1E38] flex items-center gap-2">
              <CalendarCheck className="w-7 h-7 text-[#3C1E38]" />
              Sunday Planning Session
            </h1>
            <p className="text-[#3C1E38]/70 mt-1">Your weekly rhythm of review, reflection, and planning</p>
            <p className="text-sm text-[#3C1E38]/60 mt-2">
              {dualContextLine ? (
                <>
                  {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {dualContextLine}
                </>
              ) : (
                <>
                  {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · Week {weekNumber} of 13 — {quarterName}
                </>
              )}
            </p>
            <Link
              href="/app/prayer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#3C1E38]/75 hover:text-[#3C1E38] underline-offset-4 hover:underline"
            >
              <Heart className="w-4 h-4 text-[#B8860B]" aria-hidden />
              Open Prayer Mode
            </Link>
          </div>
          <div className="flex-shrink-0">
            {sessionComplete ? (
              <div className="bg-white/60 rounded-xl px-4 py-3 border border-[#3C1E38]/10 space-y-2">
                <p className="font-medium text-[#3C1E38]">Session complete ✓</p>
                {sessionQuality != null && (
                  <div className="flex flex-wrap items-center gap-2">
                    <SessionQualityStars rating={sessionQuality} size="sm" />
                    <span className="text-xs font-semibold text-[#3C1E38] tabular-nums">{sessionQuality}/5</span>
                  </div>
                )}
                <p className="text-xs text-[#3C1E38]/60">Great stewardship this week</p>
              </div>
            ) : (
              <Button
                onClick={onBegin}
                size="lg"
                className="bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-[#F9D57E] border-2 border-[#3C1E38] font-playfair"
              >
                {hasSession ? "Resume Session" : "Begin Session"}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#A7C2D7]/10 rounded-2xl p-6 border border-[#A7C2D7]/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-xl font-bold text-[#3C1E38] flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#3C1E38]/70" />
            Your Sunday planning session
          </h1>
          <p className="text-[#3C1E38]/60 mt-1">Next session: {nextSunday} at 2pm</p>
          <p className="text-sm text-[#3C1E38]/50 mt-1">
            {dualContextLine ?? `Week ${weekNumber} of 13 — ${quarterName}`}
          </p>
          <Link
            href="/app/prayer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#3C1E38]/70 hover:text-[#3C1E38] underline-offset-4 hover:underline"
          >
            <Heart className="w-4 h-4 text-[#A7C2D7]" aria-hidden />
            Open Prayer Mode
          </Link>
        </div>
        <Button onClick={onBegin} variant="outline" className="border-[#A7C2D7]/40 text-[#3C1E38]">
          Start session anyway
        </Button>
      </div>
    </div>
  )
}
