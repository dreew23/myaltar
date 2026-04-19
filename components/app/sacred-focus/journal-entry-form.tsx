"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Star, X } from "lucide-react"
import { buildActivityJournalInsert } from "@/lib/activity-journal-insert"
import { createClient } from "@/lib/supabase/client"
import { ensureOnlineFor } from "@/lib/online-guard"
import { toast } from "sonner"
import type { EntryType, JournalEntry, SpiritualActivity } from "./types"
import { ENTRY_TYPES, getSacredFocusEntryDateBounds, JOURNAL_OPTIONAL_FIELDS_BY_TYPE } from "./types"

interface Props {
  activityId: string
  activity?: SpiritualActivity
  userId: string
  onEntryAdded: (entry: JournalEntry) => void
}

export function JournalEntryForm({ activityId, activity, userId, onEntryAdded }: Props) {
  const { min: dateMin, max: dateMax } = getSacredFocusEntryDateBounds(activity)
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<EntryType | null>(null)
  const [entryDate, setEntryDate] = useState(dateMax)
  const [content, setContent] = useState("")
  const [scriptureRef, setScriptureRef] = useState("")
  const [speaker, setSpeaker] = useState("")
  const [isHighlight, setIsHighlight] = useState(false)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (selectedType && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [selectedType])

  const reset = () => {
    setSelectedType(null)
    setEntryDate(dateMax)
    setContent("")
    setScriptureRef("")
    setSpeaker("")
    setIsHighlight(false)
  }

  const handleSave = async () => {
    if (!selectedType || !content.trim()) return
    if (!ensureOnlineFor("save this journal entry")) return
    if (entryDate < dateMin || entryDate > dateMax) {
      toast.error("Choose a date between the allowed range (not in the future).")
      return
    }
    setSaving(true)

    const entry = buildActivityJournalInsert({
      userId,
      activityId,
      entryType: selectedType,
      content,
      scriptureRef,
      speaker,
      isHighlight,
      entryDate,
    })

    const supabase = createClient()
    const { data, error } = await supabase
      .from("activity_journal_entries")
      .insert(entry)
      .select()
      .single()

    if (error) {
      toast.error("Failed to save entry")
      setSaving(false)
      return
    }

    // Optimistic: use local data if DB returns null
    const saved: JournalEntry = data ?? {
      id: crypto.randomUUID(),
      ...entry,
      created_at: new Date().toISOString(),
    }

    onEntryAdded(saved)
    toast.success("Entry added")
    reset()
    setSaving(false)
    // Keep form open for rapid entry
  }

  const optionalFields = selectedType ? JOURNAL_OPTIONAL_FIELDS_BY_TYPE[selectedType] ?? [] : []

  if (!open) {
    return (
      <button
        onClick={() => {
          setEntryDate(dateMax)
          setOpen(true)
        }}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#A7C2D7]/30 text-[#3C1E38]/40 hover:border-[#A7C2D7]/60 hover:text-[#3C1E38]/60 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add Journal Entry</span>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#A7C2D7]/15 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#3C1E38]">New Entry</p>
        <button onClick={() => { reset(); setOpen(false) }} className="text-[#3C1E38]/30 hover:text-[#3C1E38]/60">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step 1: Type chips — large & tappable */}
      <div>
        <p className="text-xs text-[#3C1E38]/40 mb-2">What type of entry?</p>
        <div className="flex flex-wrap gap-2">
          {ENTRY_TYPES.map((t) => {
            const isSelected = selectedType === t.key
            return (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2"
                style={{
                  backgroundColor: isSelected ? t.color : "transparent",
                  color: isSelected ? t.textColor : t.color,
                  borderColor: isSelected ? t.color : `${t.color}40`,
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Content — auto-focused */}
      {selectedType && (
        <>
          <div>
            <label className="text-xs text-[#3C1E38]/40 mb-1.5 block">Entry date</label>
            <input
              type="date"
              value={entryDate}
              min={dateMin}
              max={dateMax}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full max-w-[220px] px-3 py-2 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none"
            />
            <p className="text-[10px] text-[#3C1E38]/35 mt-1.5">
              Defaults to today. Pick a past day to backdate this entry. Future dates are not allowed.
            </p>
          </div>

          <div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="What did you receive?"
              className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none placeholder:text-[#3C1E38]/30"
            />
          </div>

          {/* Step 3: Optional fields (based on type) */}
          <div className="flex flex-wrap gap-3">
            {optionalFields.includes("scripture_reference") && (
              <input
                type="text"
                value={scriptureRef}
                onChange={(e) => setScriptureRef(e.target.value)}
                placeholder="Scripture ref (e.g., John 3:16)"
                className="flex-1 min-w-[200px] px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none placeholder:text-[#3C1E38]/25"
              />
            )}
            {optionalFields.includes("speaker") && (
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="Speaker"
                className="flex-1 min-w-[160px] px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none placeholder:text-[#3C1E38]/25"
              />
            )}
          </div>

          {/* Highlight toggle + save */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setIsHighlight(!isHighlight)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isHighlight
                  ? "bg-[#F9D57E]/20 text-[#B8860B] border border-[#F9D57E]/50"
                  : "text-[#3C1E38]/30 hover:text-[#3C1E38]/50"
              }`}
            >
              <Star className="w-3.5 h-3.5" fill={isHighlight ? "currentColor" : "none"} />
              Highlight
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#A7C2D7] text-white hover:bg-[#A7C2D7]/90 disabled:opacity-40 transition-all"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
