"use client"

import { useState } from "react"
import { ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { AREAS, TARGET_PRESETS, type Declaration, type Area } from "./types"

interface Props {
  userId: string
  onCreated: (declarations: Declaration[]) => void
  onSkip: () => void
}

interface Slot {
  area: Area
  content: string
  scripture_reference: string
  scripture_text: string
  target_count: number
}

export function FirstTime({ userId, onCreated, onSkip }: Props) {
  const supabase = createClient()
  const [slots, setSlots] = useState<Slot[]>(
    AREAS.map((a) => ({
      area: a.key,
      content: "",
      scripture_reference: "",
      scripture_text: "",
      target_count: 1,
    }))
  )
  const [saving, setSaving] = useState(false)

  const updateSlot = (i: number, fields: Partial<Slot>) => {
    setSlots((prev) => prev.map((s, j) => j === i ? { ...s, ...fields } : s))
  }

  const filled = slots.filter((s) => s.content.trim() && s.scripture_reference.trim())

  const submit = async () => {
    if (filled.length === 0) { toast.error("Add at least one declaration"); return }
    setSaving(true)

    const rows = filled.map((s, i) => ({
      user_id: userId,
      display_order: i + 1,
      area: s.area,
      content: s.content.trim(),
      scripture_reference: s.scripture_reference.trim(),
      scripture_text: s.scripture_text.trim() || null,
      target_count: s.target_count,
      active: true,
    }))

    const { data, error } = await supabase.from("declarations").insert(rows).select()
    if (error) {
      toast.error("Failed to save — " + error.message)
      setSaving(false)
      return
    }
    if (data) {
      onCreated((data as Declaration[]).sort((a, b) => a.display_order - b.display_order))
      toast.success("Declarations created — let's recite!")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#F9D57E]/20 flex items-center justify-center mx-auto mb-4">
          <ScrollText className="w-8 h-8 text-[#F9D57E]" />
        </div>
        <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Create Your DOMINION Declarations</h1>
        <p className="text-sm text-[#3C1E38]/60 mt-2 max-w-md mx-auto">Scripture-rooted statements you speak over your life daily during prayer. Each covers a different area of your DOMINION journey.</p>
      </div>

      <div className="space-y-4">
        {slots.map((slot, i) => {
          const area = AREAS.find((a) => a.key === slot.area)
          return (
            <div key={i} className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-[#A7C2D7]/30 flex items-center justify-center text-xs font-medium text-[#3C1E38]/40">{i + 1}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#A7C2D7] font-medium">{area?.label}</span>
              </div>

              <textarea
                value={slot.content}
                onChange={(e) => updateSlot(i, { content: e.target.value })}
                rows={2}
                placeholder="I declare that..."
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-[#F9D57E]/30 font-garamond"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={slot.scripture_reference}
                  onChange={(e) => updateSlot(i, { scripture_reference: e.target.value })}
                  placeholder="e.g., Isaiah 60:1"
                  className="px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#A7C2D7]/20"
                />
                <input
                  type="text"
                  value={slot.scripture_text}
                  onChange={(e) => updateSlot(i, { scripture_text: e.target.value })}
                  placeholder="The verse text"
                  className="px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#A7C2D7]/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#3C1E38]/40">Daily target:</span>
                {TARGET_PRESETS.slice(0, 5).map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSlot(i, { target_count: n })}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${slot.target_count === n ? "bg-[#F9D57E]/20 border-[#F9D57E]/50 text-[#3C1E38]" : "border-[#A7C2D7]/15 text-[#3C1E38]/40"}`}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number" min={1}
                  value={slot.target_count}
                  onChange={(e) => updateSlot(i, { target_count: parseInt(e.target.value) || 1 })}
                  className="w-14 px-2 py-0.5 border border-[#A7C2D7]/20 rounded text-[10px] text-center outline-none"
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        <Button
          onClick={submit}
          disabled={filled.length === 0 || saving}
          className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] font-medium py-6 text-base"
        >
          {saving ? "Creating..." : `Save & Start Reciting (${filled.length} declaration${filled.length !== 1 ? "s" : ""})`}
        </Button>
        <button
          onClick={onSkip}
          className="w-full text-center text-sm text-[#3C1E38]/40 hover:text-[#3C1E38]/60 py-2"
        >
          Skip for now — I'll add declarations later
        </button>
      </div>
    </div>
  )
}
