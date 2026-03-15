"use client"

import { useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { OPENING_PRAYER } from "@/lib/pulse"

const CHECKLIST_ITEMS = [
  "Open Notion databases / ALTAR app",
  "Put phone on Do Not Disturb",
  "Play worship music",
  "Get journal/pen ready",
  "Opening prayer",
]

interface Phase1SetupProps {
  spiritualSeasonReminder?: string | null
}

export function Phase1Setup({ spiritualSeasonReminder }: Phase1SetupProps) {
  const [checklist, setChecklist] = useState<Record<number, boolean>>({})
  const [prayerOpen, setPrayerOpen] = useState(true)

  const toggle = (i: number) => setChecklist((p) => ({ ...p, [i]: !p[i] }))

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#3C1E38]/70">Context-switch from weekend mode to planning mode.</p>
      <ul className="space-y-2">
        {CHECKLIST_ITEMS.map((label, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left text-sm transition-all ${checklist[i] ? "bg-emerald-50 border-emerald-200 text-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/80 hover:border-[#A7C2D7]/40"}`}
            >
              {checklist[i] ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-[#3C1E38]/40 flex-shrink-0" />}
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <button
          type="button"
          onClick={() => setPrayerOpen(!prayerOpen)}
          className="text-xs font-medium text-[#3C1E38]/60 hover:text-[#3C1E38]"
        >
          {prayerOpen ? "▾" : "▸"} Opening prayer
        </button>
        {prayerOpen && (
          <blockquote className="font-garamond text-base italic text-[#3C1E38]/80 mt-2 pl-4 border-l-2 border-[#A7C2D7]/40 py-2">
            {OPENING_PRAYER}
          </blockquote>
        )}
      </div>

      {spiritualSeasonReminder && (
        <div className="rounded-lg bg-[#F9D57E]/15 border border-[#F9D57E]/30 p-3 text-sm text-[#3C1E38]/80">
          <span className="font-medium">Remember:</span> {spiritualSeasonReminder}
        </div>
      )}
    </div>
  )
}
