"use client"

import { YearTimeline } from "./year-timeline"
import { YearDeclarations } from "./year-declarations"
import { YearFruits } from "./year-fruits"

interface YearViewProps {
  currentQuarterId: number
  quarterSummaries?: Record<number, string>
  yearFruits: {
    testimonies: number
    answeredPrayers: number
    wisdomEntries: number
    prayerSessions: number
    declarationsSpoken: number
  }
}

export function YearView({
  currentQuarterId,
  quarterSummaries,
  yearFruits,
}: YearViewProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-playfair font-bold text-[#3C1E38] mb-3">Year Timeline</h3>
        <YearTimeline currentQuarterId={currentQuarterId} quarterSummaries={quarterSummaries} />
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
