"use client"

import { useState } from "react"
import { Pencil, Trash2, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ENTRY_TYPES,
  getEntryTypeConfig,
  getSacredFocusEntryDateBounds,
  JOURNAL_OPTIONAL_FIELDS_BY_TYPE,
} from "./types"
import type { EntryType, JournalEntry, SpiritualActivity } from "./types"

interface Props {
  entry: JournalEntry
  activity: SpiritualActivity
  onUpdated: (entry: JournalEntry) => void
  onDeleted: (id: string) => void
}

export function JournalEntryCard({ entry, activity, onUpdated, onDeleted }: Props) {
  const { min: dateMin, max: dateMax } = getSacredFocusEntryDateBounds(activity)
  const config = getEntryTypeConfig(entry.entry_type)
  const [editing, setEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [selectedType, setSelectedType] = useState<EntryType>(entry.entry_type)
  const [entryDate, setEntryDate] = useState(entry.date)
  const [content, setContent] = useState(entry.content)
  const [scriptureRef, setScriptureRef] = useState(entry.scripture_reference ?? "")
  const [speaker, setSpeaker] = useState(entry.speaker ?? "")
  const [isHighlight, setIsHighlight] = useState(entry.is_highlight)

  const resetFromEntry = () => {
    setSelectedType(entry.entry_type)
    setEntryDate(entry.date)
    setContent(entry.content)
    setScriptureRef(entry.scripture_reference ?? "")
    setSpeaker(entry.speaker ?? "")
    setIsHighlight(entry.is_highlight)
  }

  const optionalFields = JOURNAL_OPTIONAL_FIELDS_BY_TYPE[selectedType] ?? []

  const handleSave = async () => {
    if (!content.trim()) return
    if (entryDate < dateMin || entryDate > dateMax) {
      toast.error("Date must be within the allowed range.")
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activity_journal_entries")
      .update({
        entry_type: selectedType,
        content: content.trim(),
        scripture_reference: scriptureRef.trim() || null,
        speaker: speaker.trim() || null,
        is_highlight: isHighlight,
        date: entryDate,
      })
      .eq("id", entry.id)
      .select()
      .single()

    if (error || !data) {
      toast.error("Failed to update entry")
      setSaving(false)
      return
    }

    onUpdated(data as JournalEntry)
    toast.success("Entry updated")
    setEditing(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("activity_journal_entries").delete().eq("id", entry.id)
    setDeleting(false)
    setDeleteOpen(false)
    if (error) {
      toast.error("Failed to delete entry")
      return
    }
    onDeleted(entry.id)
    toast.success("Entry deleted")
  }

  const cancelEdit = () => {
    resetFromEntry()
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-[#A7C2D7]/25 bg-white p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {ENTRY_TYPES.map((t) => {
            const isSelected = selectedType === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedType(t.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2"
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

        <div>
          <label className="text-xs text-[#3C1E38]/40 mb-1 block">Entry date</label>
          <input
            type="date"
            value={entryDate}
            min={dateMin}
            max={dateMax}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full max-w-[220px] px-3 py-2 border border-[#A7C2D7]/20 rounded-xl text-sm"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] resize-none"
        />

        <div className="flex flex-wrap gap-3">
          {optionalFields.includes("scripture_reference") && (
            <input
              type="text"
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              placeholder="Scripture ref"
              className="flex-1 min-w-[180px] px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm"
            />
          )}
          {optionalFields.includes("speaker") && (
            <input
              type="text"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="Speaker"
              className="flex-1 min-w-[140px] px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setIsHighlight(!isHighlight)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              isHighlight ? "bg-[#F9D57E]/20 text-[#B8860B] border border-[#F9D57E]/50" : "text-[#3C1E38]/30"
            }`}
          >
            <Star className="w-3.5 h-3.5" fill={isHighlight ? "currentColor" : "none"} />
            Highlight
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm text-[#3C1E38]/60 hover:bg-[#3C1E38]/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !content.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#A7C2D7] text-white disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`rounded-xl p-3.5 border transition-all group relative ${
          entry.is_highlight ? "border-l-4 bg-[#F9D57E]/5" : "bg-white border-[#A7C2D7]/10"
        }`}
        style={{ borderLeftColor: entry.is_highlight ? "#F9D57E" : undefined }}
      >
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100">
          <button
            type="button"
            onClick={() => {
              resetFromEntry()
              setEditing(true)
            }}
            className="p-1.5 rounded-lg text-[#3C1E38]/35 hover:bg-[#A7C2D7]/15 hover:text-[#3C1E38]"
            aria-label="Edit entry"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-lg text-[#3C1E38]/35 hover:bg-red-50 hover:text-red-700"
            aria-label="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-start gap-2.5 pr-16">
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${config.color}18`, color: config.color }}
          >
            {config.label}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#3C1E38] whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            {entry.scripture_reference && (
              <p className="text-xs text-[#A7C2D7] font-garamond italic mt-1.5">{entry.scripture_reference}</p>
            )}
            {entry.speaker && (
              <p className="text-xs text-[#3C1E38]/40 font-garamond italic mt-1">— {entry.speaker}</p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this journal entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The entry will be removed from this activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-600/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
