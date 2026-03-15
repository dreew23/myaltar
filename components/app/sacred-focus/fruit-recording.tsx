"use client"

import { useState } from "react"
import { Plus, Leaf, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { FRUIT_CATEGORIES } from "./types"
import type { ActivityFruit, FruitCategory } from "./types"

interface Props {
  activityId: string
  fruits: ActivityFruit[]
  userId: string
  onFruitAdded: (fruit: ActivityFruit) => void
}

export function FruitRecording({ activityId, fruits, userId, onFruitAdded }: Props) {
  const [adding, setAdding] = useState(false)
  const [category, setCategory] = useState<FruitCategory>("spiritual_growth")
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState("")
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setCategory("spiritual_growth")
    setDescription("")
    setEvidence("")
    setAdding(false)
  }

  const handleSave = async () => {
    if (!description.trim()) return
    setSaving(true)

    const entry = {
      user_id: userId,
      activity_id: activityId,
      category,
      description: description.trim(),
      evidence: evidence.trim() || null,
      date_recorded: new Date().toISOString().split("T")[0],
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("activity_fruits")
      .insert(entry)
      .select()
      .single()

    if (error) {
      toast.error("Failed to record fruit")
      setSaving(false)
      return
    }

    const saved: ActivityFruit = data ?? {
      id: crypto.randomUUID(),
      ...entry,
      created_at: new Date().toISOString(),
    }

    onFruitAdded(saved)
    toast.success("Fruit recorded")
    reset()
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#2E7D32]/20 text-[#2E7D32]/40 hover:border-[#2E7D32]/40 hover:text-[#2E7D32]/60 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Record Fruit / Gain</span>
        </button>
      )}

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl border border-[#2E7D32]/15 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#3C1E38]">Record Fruit</p>
            <button onClick={reset} className="text-[#3C1E38]/30 hover:text-[#3C1E38]/60">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs text-[#3C1E38]/40 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {FRUIT_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    category === c.key
                      ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30"
                      : "border-[#A7C2D7]/20 text-[#3C1E38]/40 hover:border-[#A7C2D7]/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What fruit did you gain from this activity?"
              className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] resize-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]/40 outline-none placeholder:text-[#3C1E38]/30"
            />
          </div>

          {/* Evidence (optional) */}
          <div>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={2}
              placeholder="Evidence / tangible proof (optional)"
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] resize-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]/40 outline-none placeholder:text-[#3C1E38]/30"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !description.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#2E7D32] text-white hover:bg-[#2E7D32]/90 disabled:opacity-40 transition-all"
            >
              {saving ? "Saving..." : "Record Fruit"}
            </button>
          </div>
        </div>
      )}

      {/* Fruits list */}
      {fruits.length === 0 && !adding ? (
        <div className="text-center py-12 text-[#3C1E38]/30">
          <Leaf className="w-8 h-8 mx-auto mb-2 text-[#2E7D32]/20" />
          <p className="text-sm">No fruits recorded yet.</p>
          <p className="text-xs mt-1">Record tangible outcomes and gains from this activity.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fruits.map((fruit) => {
            const cat = FRUIT_CATEGORIES.find((c) => c.key === fruit.category)
            const d = new Date(fruit.date_recorded + "T12:00:00")
            return (
              <div key={fruit.id} className="bg-white rounded-xl border border-[#A7C2D7]/10 p-3.5">
                <div className="flex items-start gap-2.5">
                  <Leaf className="w-4 h-4 text-[#2E7D32]/50 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#2E7D32]/10 text-[#2E7D32]">
                        {cat?.label ?? fruit.category}
                      </span>
                      <span className="text-[10px] text-[#3C1E38]/30">
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-[#3C1E38] leading-relaxed">{fruit.description}</p>
                    {fruit.evidence && (
                      <p className="text-xs text-[#3C1E38]/50 mt-1.5 italic">Evidence: {fruit.evidence}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
