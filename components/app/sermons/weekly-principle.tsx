"use client"

interface WeeklyPrincipleProps {
  title: string
  principle: string
  scriptureReference?: string | null
}

export function WeeklyPrinciple({ title, principle, scriptureReference }: WeeklyPrincipleProps) {
  return (
    <div className="bg-[#F9D57E]/10 border border-[#F9D57E]/20 rounded-xl p-4">
      <p className="text-[#F9D57E] text-xs uppercase font-medium tracking-wider mb-1">This Week&apos;s Principle</p>
      <p className="font-playfair font-bold text-[#3C1E38] mb-2">{title}</p>
      <p className="font-garamond text-sm italic text-[#3C1E38]">{principle}</p>
      {scriptureReference && (
        <p className="text-xs text-[#3C1E38]/60 mt-2">{scriptureReference}</p>
      )}
      <p className="text-xs text-[#3C1E38]/40 mt-2">This appears on your dashboard</p>
    </div>
  )
}
