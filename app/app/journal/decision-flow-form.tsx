"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { AlignedDecision } from "@/lib/wisdom-log"
import type { WisdomEntry } from "@/lib/wisdom-log"
import { DECISION_CATEGORIES, LIFE_AREAS, GOAL_CODES } from "@/lib/wisdom-log"

type DecisionCategory = import("@/lib/wisdom-log").DecisionCategory

interface Props {
  userId: string
  onSaved: (decision: AlignedDecision, linkedEntry: WisdomEntry) => void
  onCancel: () => void
}

export function DecisionFlowForm({ userId, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    description: "",
    context: "",
    category: "" as DecisionCategory | "",
    step1_prayed: false,
    step1_note: "",
    step2_scripture: "",
    step2_note: "",
    step3_counsel: false,
    step3_who: "",
    step3_note: "",
    step4_peace: false,
    step4_note: "",
    step5_dominion: "",
    aligned: true,
    life_areas: [] as string[],
    connected_goal_code: "",
  })
  const [saving, setSaving] = useState(false)

  const toggleLifeArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      life_areas: prev.life_areas.includes(area)
        ? prev.life_areas.filter((a) => a !== area)
        : [...prev.life_areas, area],
    }))
  }

  const buildSummary = () => {
    const parts = [
      `Decision: ${form.description}.`,
      `Prayed: ${form.step1_prayed ? "Yes" : "No"}.`,
      form.step1_note && `Prayer note: ${form.step1_note}.`,
      form.step2_scripture && `Scripture: ${form.step2_scripture}.`,
      form.step2_note && form.step2_note,
      `Counsel: ${form.step3_counsel ? `Yes — ${form.step3_who || "someone"}. ${form.step3_note || ""}` : "No"}.`,
      `Peace: ${form.step4_peace ? "Yes" : "No"}.`,
      form.step4_note && form.step4_note,
      form.step5_dominion && `Dominion path: ${form.step5_dominion}.`,
    ]
    return parts.filter(Boolean).join(" ")
  }

  const handleSave = async () => {
    if (!form.description.trim()) return
    setSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    const summary = buildSummary()

    const { data: entryData, error: entryError } = await supabase
      .from("wisdom_entries")
      .insert({
        user_id: userId,
        entry_type: "aligned_decision",
        title: form.description.trim(),
        content: summary,
        scripture_reference: form.step2_scripture.trim() || null,
        scripture_text: form.step2_note.trim() || null,
        life_areas: form.life_areas.length ? form.life_areas : null,
        connected_goal_code: form.connected_goal_code || null,
        date: today,
      })
      .select()
      .single()

    if (entryError || !entryData) {
      setSaving(false)
      return
    }

    const { data: decisionData, error: decisionError } = await supabase
      .from("aligned_decisions")
      .insert({
        user_id: userId,
        wisdom_entry_id: entryData.id,
        date: today,
        description: form.description.trim(),
        context: form.context.trim() || null,
        category: form.category || null,
        step1_prayed: form.step1_prayed,
        step1_note: form.step1_note.trim() || null,
        step2_scripture: form.step2_scripture.trim() || null,
        step2_note: form.step2_note.trim() || null,
        step3_counsel: form.step3_counsel,
        step3_who: form.step3_who.trim() || null,
        step3_note: form.step3_note.trim() || null,
        step4_peace: form.step4_peace,
        step4_note: form.step4_note.trim() || null,
        step5_dominion: form.step5_dominion.trim() || null,
        aligned: form.aligned,
      })
      .select()
      .single()

    if (!decisionError && decisionData) {
      onSaved(decisionData, entryData)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Decision Description *</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g., Whether to accept the Krystal scope expansion"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Context</label>
        <input
          type="text"
          value={form.context}
          onChange={(e) => setForm({ ...form, context: e.target.value })}
          placeholder="What situation prompted this?"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as DecisionCategory })}
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        >
          <option value="">Select</option>
          {DECISION_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="border-t border-[#A7C2D7]/20 pt-4">
        <p className="text-sm font-medium text-[#3C1E38] mb-2">Step 1 — Have I prayed about this?</p>
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, step1_prayed: true })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${form.step1_prayed ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, step1_prayed: false })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!form.step1_prayed ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            No
          </button>
        </div>
        {!form.step1_prayed && <p className="text-xs text-amber-600 mb-2">Consider taking this to prayer first. You can still continue.</p>}
        <input
          type="text"
          value={form.step1_note}
          onChange={(e) => setForm({ ...form, step1_note: e.target.value })}
          placeholder="What specifically did I pray?"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>

      <div className="border-t border-[#A7C2D7]/20 pt-4">
        <p className="text-sm font-medium text-[#3C1E38] mb-2">Step 2 — What scripture applies?</p>
        <input
          type="text"
          value={form.step2_scripture}
          onChange={(e) => setForm({ ...form, step2_scripture: e.target.value })}
          placeholder="Reference"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none mb-2"
        />
        <input
          type="text"
          value={form.step2_note}
          onChange={(e) => setForm({ ...form, step2_note: e.target.value })}
          placeholder="How does this scripture speak to this situation?"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>

      <div className="border-t border-[#A7C2D7]/20 pt-4">
        <p className="text-sm font-medium text-[#3C1E38] mb-2">Step 3 — Have I sought counsel?</p>
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, step3_counsel: true })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${form.step3_counsel ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, step3_counsel: false })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!form.step3_counsel ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            No
          </button>
        </div>
        {form.step3_counsel && (
          <input
            type="text"
            value={form.step3_who}
            onChange={(e) => setForm({ ...form, step3_who: e.target.value })}
            placeholder="From whom?"
            className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none mb-2"
          />
        )}
        <input
          type="text"
          value={form.step3_note}
          onChange={(e) => setForm({ ...form, step3_note: e.target.value })}
          placeholder="What was their counsel?"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>

      <div className="border-t border-[#A7C2D7]/20 pt-4">
        <p className="text-sm font-medium text-[#3C1E38] mb-2">Step 4 — Do I have peace?</p>
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, step4_peace: true })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${form.step4_peace ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, step4_peace: false })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!form.step4_peace ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            No
          </button>
        </div>
        <input
          type="text"
          value={form.step4_note}
          onChange={(e) => setForm({ ...form, step4_note: e.target.value })}
          placeholder="Where is the peace (or lack of it)?"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>

      <div className="border-t border-[#A7C2D7]/20 pt-4">
        <p className="text-sm font-medium text-[#3C1E38] mb-2">Step 5 — What does DOMINION look like here?</p>
        <textarea
          value={form.step5_dominion}
          onChange={(e) => setForm({ ...form, step5_dominion: e.target.value })}
          rows={3}
          placeholder="If I were operating from authority and not survival, what would I do?"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-y focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        />
      </div>

      <div className="border-t border-[#A7C2D7]/20 pt-4">
        <p className="text-sm font-medium text-[#3C1E38] mb-2">Overall — was this decision aligned?</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, aligned: true })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${form.aligned ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, aligned: false })}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!form.aligned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-[#3C1E38]/60"}`}
          >
            No
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#3C1E38]/80 block mb-2">Life Areas</label>
        <div className="flex flex-wrap gap-2">
          {LIFE_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleLifeArea(area)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${form.life_areas.includes(area) ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Connected Goal</label>
        <select
          value={form.connected_goal_code}
          onChange={(e) => setForm({ ...form, connected_goal_code: e.target.value })}
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
        >
          <option value="">None</option>
          {GOAL_CODES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={saving || !form.description.trim()}
          className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
        >
          {saving ? "Saving..." : "Save Decision"}
        </Button>
      </div>
    </div>
  )
}
