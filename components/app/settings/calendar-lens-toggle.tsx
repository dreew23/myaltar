"use client"

import { useState } from "react"
import { Calendar, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SectionCard } from "./section-card"
import type { CalendarLens } from "@/lib/personal-year"

interface CalendarLensToggleProps {
  userId: string
  initialLens: CalendarLens
  onSave?: () => void
}

const OPTIONS: { value: CalendarLens; label: string; hint: string }[] = [
  { value: "personal", label: "Personal Year", hint: "Your DOMINION 13-week segments lead" },
  { value: "system", label: "System Calendar", hint: "Calendar quarters lead" },
]

export function CalendarLensToggle({ userId, initialLens, onSave }: CalendarLensToggleProps) {
  const [lens, setLens] = useState<CalendarLens>(initialLens)
  const [saving, setSaving] = useState(false)

  const handleSelect = async (next: CalendarLens) => {
    if (next === lens || saving) return
    const prev = lens
    setLens(next)
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ primary_calendar_lens: next })
      .eq("id", userId)
    setSaving(false)
    if (error) {
      setLens(prev)
      toast.error("Could not save — " + error.message)
      return
    }
    toast.success("Primary lens updated")
    onSave?.()
  }

  return (
    <SectionCard
      id="calendar-lens"
      icon={Calendar}
      iconBg="bg-[#A7C2D7]/15"
      iconColor="text-[#3C1E38]"
      title="Primary Planning Lens"
      subtitle="Choose which date system leads across Pulse, Goals, and Dashboard. Both are always shown."
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const active = lens === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => void handleSelect(opt.value)}
                disabled={saving}
                aria-pressed={active}
                className={`text-left rounded-xl border p-4 transition-colors ${
                  active
                    ? "border-[#F9D57E] bg-[#F9D57E]/10"
                    : "border-[#A7C2D7]/20 bg-white hover:border-[#A7C2D7]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[#3C1E38]">{opt.label}</span>
                  {active && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F9D57E]/50 text-[#3C1E38]">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#3C1E38]/55 mt-1">{opt.hint}</p>
              </button>
            )
          })}
        </div>
        {saving && (
          <p className="text-xs text-[#3C1E38]/50 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
          </p>
        )}
        <p className="text-xs text-[#3C1E38]/45">
          Display only — your saved Pulse sessions and checks are unaffected.
        </p>
      </div>
    </SectionCard>
  )
}
