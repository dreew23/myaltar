"use client"

import { YearTimeline } from "./year-timeline"
import { YearDeclarations } from "./year-declarations"
import { YearFruits } from "./year-fruits"
import type { PersonalYearConfigRow } from "@/lib/personal-year"

interface YearViewProps {
  personalYears: PersonalYearConfigRow[]
  currentPersonalYearNumber: number
  quarterSummaries?: Record<number, string>
  calendarOverlayLabels: string[]
  yearFruits: {
    testimonies: number
    answeredPrayers: number
    wisdomEntries: number
    prayerSessions: number
    declarationsSpoken: number
  }
}

export function YearView({
  personalYears,
  currentPersonalYearNumber,
  quarterSummaries,
  calendarOverlayLabels,
  yearFruits,
}: YearViewProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-playfair font-bold text-[#3C1E38] mb-3">Year Timeline</h3>
        <YearTimeline
          segments={personalYears}
          currentYearNumber={currentPersonalYearNumber}
          quarterSummaries={quarterSummaries}
          calendarOverlayLabels={calendarOverlayLabels}
        />
      </section>

      <section>
        <YearDeclarations />
      </section>

      <section>
        <YearFruits {...yearFruits} />
      </section>
    </div>
  )
}
