"use client"

interface YearFruitsProps {
  testimonies: number
  answeredPrayers: number
  wisdomEntries: number
  prayerSessions: number
  declarationsSpoken: number
}

export function YearFruits({
  testimonies,
  answeredPrayers,
  wisdomEntries,
  prayerSessions,
  declarationsSpoken,
}: YearFruitsProps) {
  const items = [
    { label: "Testimonies", value: testimonies },
    { label: "Answered prayers", value: answeredPrayers },
    { label: "Wisdom entries", value: wisdomEntries },
    { label: "Prayer sessions", value: prayerSessions },
    { label: "Declarations spoken", value: declarationsSpoken },
  ]

  return (
    <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
      <h3 className="font-playfair font-bold text-[#3C1E38] mb-3">Your year in numbers</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(({ label, value }) => (
          <div key={label} className="p-2 rounded-lg bg-[#A7C2D7]/5 border border-[#A7C2D7]/10">
            <p className="font-playfair text-xl font-bold text-[#3C1E38]">{value}</p>
            <p className="text-xs text-[#3C1E38]/50">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
