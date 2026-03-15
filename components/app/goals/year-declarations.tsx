"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { dominionDeclarations } from "@/lib/data/dominion"

export function YearDeclarations() {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
      <h3 className="font-playfair font-bold text-[#3C1E38] mb-2">
        Your DOMINION Declarations for this year
      </h3>
      <ul className="text-sm text-[#3C1E38]/80 space-y-1 list-disc list-inside">
        {dominionDeclarations.slice(0, 5).map((d, i) => (
          <li key={i} className="truncate max-w-full" title={d}>
            {d.length > 60 ? d.slice(0, 60) + "…" : d}
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#3C1E38]/50 mt-1">+ 5 more</p>
      <Link
        href="/app/declarations"
        className="inline-flex items-center gap-1 text-sm font-medium text-[#A7C2D7] mt-2 hover:underline"
      >
        View All <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
