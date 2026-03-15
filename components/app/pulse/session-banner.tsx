"use client"

import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SessionBannerProps {
  isSunday: boolean
  weekNumber: number
  quarterName: string
  hasSession: boolean
  sessionComplete: boolean
  onBegin: () => void
}

export function SessionBanner({
  isSunday,
  weekNumber,
  quarterName,
  hasSession,
  sessionComplete,
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
              {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · Week {weekNumber} of 13 — {quarterName}
            </p>
          </div>
          <div className="flex-shrink-0">
            {sessionComplete ? (
              <div className="bg-white/60 rounded-xl px-4 py-3 border border-[#3C1E38]/10">
                <p className="font-medium text-[#3C1E38]">Session complete ✓</p>
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
          <p className="text-sm text-[#3C1E38]/50 mt-1">Week {weekNumber} of 13 — {quarterName}</p>
        </div>
        <Button onClick={onBegin} variant="outline" className="border-[#A7C2D7]/40 text-[#3C1E38]">
          Start session anyway
        </Button>
      </div>
    </div>
  )
}
