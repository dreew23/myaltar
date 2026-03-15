"use client"

import { Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Declaration, DeclarationLog } from "./types"

interface Props {
  declarations: Declaration[]
  logs: Record<string, DeclarationLog>
  onJumpToRecite: (index: number) => void
}

export function ViewAll({ declarations, logs, onJumpToRecite }: Props) {
  return (
    <div className="space-y-3">
      {declarations.length === 0 && (
        <div className="text-center py-12 text-[#3C1E38]/30">
          <p className="text-sm">No declarations yet — create yours to get started</p>
        </div>
      )}

      {declarations.map((decl, i) => {
        const log = logs[decl.id]
        const count = log?.current_count ?? 0
        const target = decl.target_count
        const done = count >= target
        const pct = target > 0 ? Math.min((count / target) * 100, 100) : 0

        return (
          <button
            key={decl.id}
            onClick={() => onJumpToRecite(i)}
            className={`w-full text-left bg-white rounded-xl border overflow-hidden p-4 hover:bg-[#FDFCF9] transition-all ${done ? "border-l-[3px] border-l-[#F9D57E] border-r border-t border-b border-r-[#A7C2D7]/10 border-t-[#A7C2D7]/10 border-b-[#A7C2D7]/10" : "border-[#A7C2D7]/10"}`}
          >
            <div className="flex items-start gap-3">
              {/* Order number */}
              <div className="w-8 h-8 rounded-full border border-[#A7C2D7]/30 flex items-center justify-center flex-shrink-0 text-sm font-medium text-[#3C1E38]/50">
                {decl.display_order}
              </div>

              <div className="flex-1 min-w-0">
                {/* Area badge */}
                <span className="text-[10px] uppercase tracking-wide text-[#A7C2D7] bg-[#A7C2D7]/10 px-2 py-0.5 rounded-full font-medium">
                  {decl.area}
                </span>

                {/* Declaration text */}
                <p className="font-garamond text-base text-[#3C1E38] mt-1.5 leading-relaxed">{decl.content}</p>

                {/* Scripture */}
                <p className="text-[#A7C2D7] text-sm mt-1">{decl.scripture_reference}</p>
              </div>

              {/* Today's status */}
              <div className="flex-shrink-0 text-right">
                {done ? (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <span className="text-sm font-medium">{count}/{target}</span>
                    <Check className="w-4 h-4" />
                  </div>
                ) : count > 0 ? (
                  <div>
                    <p className="text-sm text-[#3C1E38]/50">{count}/{target}</p>
                    <Progress value={pct} className="w-16 h-1 mt-1" />
                  </div>
                ) : (
                  <p className="text-sm text-[#3C1E38]/30">0/{target}</p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
