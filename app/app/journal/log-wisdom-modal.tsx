"use client"

import { useState } from "react"
import { Zap, MessageCircle, Star, Flame, Heart, BookOpen, Scale, Search, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  type WisdomEntryType,
  WISDOM_ENTRY_TYPES,
  WISDOM_TITLE_PLACEHOLDERS,
  LIFE_AREAS,
  GOAL_CODES,
} from "@/lib/wisdom-log"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  MessageCircle,
  Star,
  Flame,
  Heart,
  BookOpen,
  Scale,
  Search,
  Briefcase,
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  activities: { id: string; title: string }[]
  onSaved: (entry: import("@/lib/wisdom-log").WisdomEntry) => void
  onOpenDecisionFlow: () => void
}

export function LogWisdomModal({
  open,
  onOpenChange,
  userId,
  activities,
  onSaved,
  onOpenDecisionFlow,
}: Props) {
  const [step, setStep] = useState<"type" | "form">("type")
  const [entryType, setEntryType] = useState<WisdomEntryType>("revelation")
  const [form, setForm] = useState({
    title: "",
    content: "",
    scripture_reference: "",
    scripture_text: "",
    sources: "",
    life_areas: [] as string[],
    connected_goal_code: "",
    connected_activity_id: "",
    is_highlight: false,
    shareable: false,
  })
  const [saving, setSaving] = useState(false)

  const handleChooseType = (type: WisdomEntryType) => {
    setEntryType(type)
    if (type === "aligned_decision") {
      onOpenChange(false)
      onOpenDecisionFlow()
      return
    }
    setStep("form")
  }

  const toggleLifeArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      life_areas: prev.life_areas.includes(area)
        ? prev.life_areas.filter((a) => a !== area)
        : [...prev.life_areas, area],
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("wisdom_entries")
      .insert({
        user_id: userId,
        entry_type: entryType,
        title: form.title.trim(),
        content: form.content.trim(),
        scripture_reference: form.scripture_reference.trim() || null,
        scripture_text: form.scripture_text.trim() || null,
        sources: form.sources.trim() || null,
        life_areas: form.life_areas.length ? form.life_areas : null,
        connected_goal_code: form.connected_goal_code || null,
        connected_activity_id: form.connected_activity_id || null,
        shareable: form.shareable,
        is_highlight: form.is_highlight,
        date: today,
      })
      .select()
      .single()

    if (!error && data) {
      onSaved(data)
      setStep("type")
      setEntryType("revelation")
      setForm({
        title: "",
        content: "",
        scripture_reference: "",
        scripture_text: "",
        sources: "",
        life_areas: [],
        connected_goal_code: "",
        connected_activity_id: "",
        is_highlight: false,
        shareable: false,
      })
      onOpenChange(false)
    }
    setSaving(false)
  }

  const handleBack = () => {
    setStep("type")
    setEntryType("revelation")
    setForm((prev) => ({ ...prev, title: "", content: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair">
            {step === "type" ? "What kind of wisdom is this?" : "Log Wisdom"}
          </DialogTitle>
        </DialogHeader>

        {step === "type" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {WISDOM_ENTRY_TYPES.map((t) => {
              const Icon = ICONS[t.icon] ?? Zap
              const selected = entryType === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleChooseType(t.value)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${selected ? `border-[#F9D57E] ring-2 ring-[#F9D57E]/30 ${t.cardBg}` : `border-[#A7C2D7]/20 hover:border-[#A7C2D7]/40 ${t.cardBg}`}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${t.iconBg} flex items-center justify-center self-start`}>
                    <Icon className={`w-4 h-4 ${t.iconColor}`} />
                  </div>
                  <span className="font-medium text-sm text-[#3C1E38]">{t.label}</span>
                  <span className="text-[10px] text-[#3C1E38]/55 line-clamp-2">{t.description}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Title / Summary</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={WISDOM_TITLE_PLACEHOLDERS[entryType]}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#A7C2D7] outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Full Entry</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                placeholder="Take your time with this. This isn't a quick capture — it's processed understanding. What happened, what you learned, and why it matters."
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-y focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#A7C2D7] outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Scripture Reference (optional)</label>
              <input
                type="text"
                value={form.scripture_reference}
                onChange={(e) => setForm({ ...form, scripture_reference: e.target.value })}
                placeholder="e.g., Isaiah 43:19"
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Scripture Text (optional)</label>
              <input
                type="text"
                value={form.scripture_text}
                onChange={(e) => setForm({ ...form, scripture_text: e.target.value })}
                placeholder="The actual verse"
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Sources (optional)</label>
              <input
                type="text"
                value={form.sources}
                onChange={(e) => setForm({ ...form, sources: e.target.value })}
                placeholder="e.g., TYOB Day 5 + Koinonia Mar 9 + personal prayer March 11"
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-2">Life Areas (optional)</label>
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
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1.5">Connected Activity</label>
                <select
                  value={form.connected_activity_id}
                  onChange={(e) => setForm({ ...form, connected_activity_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 outline-none"
                >
                  <option value="">None</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[#3C1E38]/80">
                <input
                  type="checkbox"
                  checked={form.is_highlight}
                  onChange={(e) => setForm({ ...form, is_highlight: e.target.checked })}
                  className="rounded border-[#A7C2D7]/30"
                />
                Mark as Highlight
              </label>
              <label className="flex items-center gap-2 text-sm text-[#3C1E38]/80">
                <input
                  type="checkbox"
                  checked={form.shareable}
                  onChange={(e) => setForm({ ...form, shareable: e.target.checked })}
                  className="rounded border-[#A7C2D7]/30"
                />
                Shareable (could become content for G7)
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.content.trim()}
                className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
              >
                {saving ? "Saving..." : "Save Wisdom"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
