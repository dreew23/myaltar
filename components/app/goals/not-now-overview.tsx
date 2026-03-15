"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { GoalConfig } from "@/lib/data/dominion"

interface NotNowOverviewProps {
  goals: GoalConfig[]
  totalCount: number
}

export function NotNowOverview({ goals, totalCount }: NotNowOverviewProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-[#A7C2D7]/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-playfair font-bold text-[#8B0000]">
          What You're NOT Doing This Quarter
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-[#3C1E38]/50" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#3C1E38]/50" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[#A7C2D7]/10 pt-3 space-y-2">
          {goals.map((g) => (
            <div key={g.id}>
              <span className="text-xs font-semibold text-[#3C1E38]/70">{g.id}:</span>{" "}
              <span className="text-sm text-[#3C1E38]/80">{g.notNow.length} items</span>
            </div>
          ))}
          <p className="text-sm text-[#3C1E38]/60 pt-2 border-t border-[#A7C2D7]/10 mt-2">
            {totalCount} strategic no's protecting your execution
          </p>
        </div>
      )}
    </div>
  )
}
