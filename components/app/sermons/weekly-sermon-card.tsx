"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Star, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface WeeklySermonRow {
  id: string
  sermon_id: string
  display_order: number
  listened: boolean
  listened_date: string | null
  notes: string | null
  is_weekly_principle: boolean
  title: string
  speaker: string
  category: string
  mastery_key_principle: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  uncategorized: "bg-gray-400",
  prayer: "bg-[#A7C2D7]",
  faith: "bg-[#F9D57E]",
  "the-holy-spirit": "bg-purple-500",
  wisdom: "bg-emerald-500",
  "purpose-and-destiny": "bg-orange-500",
  relationships: "bg-rose-500",
  prosperity: "bg-amber-600",
}

interface WeeklySermonCardProps {
  row: WeeklySermonRow
  categoryLabel?: string
  onToggleListened: (listened: boolean) => void
  onNotesChange: (notes: string) => void
  onSetAsPrinciple: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onAddKeyPrinciple?: (principle: string) => Promise<void>
}

export function WeeklySermonCard({
  row,
  categoryLabel,
  onToggleListened,
  onNotesChange,
  onSetAsPrinciple,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onAddKeyPrinciple,
}: WeeklySermonCardProps) {
  const [notesOpen, setNotesOpen] = useState(!!row.notes)
  const [localNotes, setLocalNotes] = useState(row.notes ?? "")
  const [showAddPrinciple, setShowAddPrinciple] = useState(false)
  const [newPrinciple, setNewPrinciple] = useState("")

  const categoryColor = CATEGORY_COLORS[row.category] ?? "bg-gray-400"
  const label = categoryLabel ?? row.category

  const handleSaveNotes = () => {
    onNotesChange(localNotes)
  }

  const handleSetPrinciple = async () => {
    if (row.mastery_key_principle) {
      onSetAsPrinciple()
      return
    }
    if (showAddPrinciple && newPrinciple.trim() && onAddKeyPrinciple) {
      await onAddKeyPrinciple(newPrinciple.trim())
      setShowAddPrinciple(false)
      setNewPrinciple("")
      onSetAsPrinciple()
    } else {
      setShowAddPrinciple(true)
    }
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-[#A7C2D7]/20 bg-white hover:border-[#A7C2D7]/30 transition-colors">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 pt-0.5">
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="p-0.5 text-[#3C1E38]/40 hover:text-[#3C1E38] disabled:opacity-30">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="p-0.5 text-[#3C1E38]/40 hover:text-[#3C1E38] disabled:opacity-30">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Listened */}
      <button
        type="button"
        onClick={() => onToggleListened(!row.listened)}
        className="flex-shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded border-2 transition-all"
        style={{
          borderColor: row.listened ? "#F9D57E" : "#A7C2D7",
          backgroundColor: row.listened ? "#F9D57E" : "transparent",
        }}
      >
        {row.listened && <Check className="w-3.5 h-3.5 text-[#3C1E38]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[#3C1E38]">{row.title}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${categoryColor}`}>
            {label}
          </span>
          {row.listened && (
            <span className="text-xs text-[#3C1E38]/50">
              Listened ✓ {row.listened_date ? new Date(row.listened_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
            </span>
          )}
        </div>
        <p className="text-xs text-[#3C1E38]/50 mt-0.5">{row.speaker}</p>

        {/* Notes */}
        <div className="mt-2">
          {!notesOpen ? (
            <button type="button" onClick={() => setNotesOpen(true)} className="text-xs text-[#A7C2D7] hover:underline">
              {row.notes ? "Edit notes ▸" : "Add listening notes ▸"}
            </button>
          ) : (
            <div className="mt-1">
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Key takeaway from this sermon..."
                rows={2}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
              />
            </div>
          )}
        </div>

        {/* Set as principle + add key principle prompt */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {showAddPrinciple && !row.mastery_key_principle ? (
            <div className="flex flex-col gap-2 flex-1 min-w-0 rounded-lg border border-[#F9D57E]/30 bg-[#F9D57E]/5 p-3">
              <p className="text-xs text-[#3C1E38]/70">This sermon doesn&apos;t have a key principle yet. Add one?</p>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={newPrinciple}
                  onChange={(e) => setNewPrinciple(e.target.value)}
                  placeholder="One-liner key principle..."
                  className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#A7C2D7]/30 rounded-lg text-sm"
                />
                <Button size="sm" onClick={handleSetPrinciple} disabled={!newPrinciple.trim()} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
                  Save & set as principle
                </Button>
                <button type="button" onClick={() => { setShowAddPrinciple(false); setNewPrinciple("") }} className="text-xs text-[#3C1E38]/50 hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSetPrinciple}
                className="flex items-center gap-1.5 text-sm"
                title={row.is_weekly_principle ? "This week's principle" : "Set as weekly principle"}
              >
                <Star className={`w-4 h-4 ${row.is_weekly_principle ? "text-[#F9D57E] fill-[#F9D57E]" : "text-[#3C1E38]/30"}`} />
                <span className={row.is_weekly_principle ? "text-[#F9D57E] font-medium" : "text-[#3C1E38]/60"}>
                  {row.is_weekly_principle ? "Weekly principle" : "Set as weekly principle"}
                </span>
              </button>
              {!row.mastery_key_principle && !showAddPrinciple && (
                <span className="text-xs text-[#3C1E38]/40">(Add key principle in sermon details to use here)</span>
              )}
            </>
          )}
        </div>
      </div>

      <Button variant="ghost" size="icon" onClick={onRemove} className="flex-shrink-0 text-[#3C1E38]/40 hover:text-red-500 hover:bg-red-50">
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
