"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react"
import type { GoalConfig } from "@/lib/data/dominion"

interface GoalExpandedProps {
  goal: GoalConfig
  targetText: string | null
  reflection: string | null
  pulseHistoryDots: string[]
  onSaveNote?: (field: "target_text" | "reflection", value: string) => void
}

export function GoalExpanded({
  goal,
  targetText,
  reflection,
  pulseHistoryDots,
}: GoalExpandedProps) {
  const [whyOpen, setWhyOpen] = useState(false)
  const [notNowOpen, setNotNowOpen] = useState(false)

  return (
    <div className="space-y-4 pt-3 border-t border-[#A7C2D7]/10">
      {/* Why This Matters — collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setWhyOpen(!whyOpen)}
          className="flex items-center gap-2 text-sm font-medium text-[#3C1E38]"
        >
          {whyOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Why This Matters
        </button>
        {whyOpen && (
          <p className="font-garamond text-sm italic text-[#3C1E38]/80 mt-2 pl-6">{goal.description}</p>
        )}
      </div>

      {/* 3 Key Results */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#3C1E38]/50">Key Results</p>
        <div className="border-l-2 border-purple-400 pl-3 text-sm text-[#3C1E38]/90">{goal.kr10x}</div>
        <div className="border-l-2 border-teal-400 pl-3 text-sm text-[#3C1E38]/90">{goal.kr5x}</div>
        <div className="border-l-2 border-amber-400 pl-3 text-sm text-[#3C1E38]/90">{goal.kr2x}</div>
      </div>

      {/* Pulse History — 13 dots */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs text-[#3C1E38]/50 mr-2">Pulse history:</span>
        {pulseHistoryDots.map((bg, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${bg}`} title={`Week ${i + 1}`} />
        ))}
      </div>

      {/* NOT NOW — collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setNotNowOpen(!notNowOpen)}
          className="flex items-center gap-2 text-sm font-medium text-[#8B0000]"
        >
          {notNowOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          NOT NOW
        </button>
        {notNowOpen && (
          <ul className="list-disc list-inside text-sm text-[#3C1E38]/70 mt-2 pl-6 space-y-1">
            {goal.notNow.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* My Target & Notes */}
      {(targetText != null && targetText !== "") || (reflection != null && reflection !== "") ? (
        <div className="text-sm space-y-1">
          {targetText && <p><span className="text-[#3C1E38]/50">My Target:</span> {targetText}</p>}
          {reflection && <p><span className="text-[#3C1E38]/50">Notes:</span> {reflection}</p>}
        </div>
      ) : null}

      <Link
        href="/app/pulse"
        className="inline-flex items-center gap-1 text-sm font-medium text-[#A7C2D7] hover:underline"
      >
        Start Weekly Review <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
