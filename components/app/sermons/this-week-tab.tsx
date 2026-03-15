"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WeeklyPrinciple } from "./weekly-principle"
import { WeeklySermonCard, type WeeklySermonRow } from "./weekly-sermon-card"
import { AddSermonsModal, type SermonForPicker } from "./add-sermons-modal"

function getWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate + "T12:00:00")
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export interface ThisWeekTabProps {
  weekStartStr: string
  weeklySermons: WeeklySermonRow[]
  sermons: SermonForPicker[]
  onWeekChange: (newWeekStart: string) => void
  onAddSermons: (sermonIds: string[]) => Promise<void>
  onToggleListened: (wsId: string, listened: boolean) => Promise<void>
  onUpdateNotes: (wsId: string, notes: string) => Promise<void>
  onSetPrinciple: (wsId: string) => Promise<void>
  onRemove: (wsId: string) => Promise<void>
  onReorder: (wsId: string, direction: "up" | "down") => Promise<void>
  onAddKeyPrinciple?: (sermonId: string, principle: string) => Promise<void>
  onOpenAddSermon?: () => void
  categoryLabels?: Record<string, string>
}

export function ThisWeekTab({
  weekStartStr,
  weeklySermons,
  sermons,
  onWeekChange,
  onAddSermons,
  onToggleListened,
  onUpdateNotes,
  onSetPrinciple,
  onRemove,
  onReorder,
  onAddKeyPrinciple,
  onOpenAddSermon,
  categoryLabels = {},
}: ThisWeekTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  const weekRange = getWeekRange(weekStartStr)
  const principleRow = weeklySermons.find((w) => w.is_weekly_principle)
  const listRows = weeklySermons
    .filter((w) => !w.is_weekly_principle)
    .sort((a, b) => a.display_order - b.display_order)
  const listenedCount = weeklySermons.filter((w) => w.listened).length
  const totalCount = weeklySermons.length

  const goPrevWeek = () => {
    const d = new Date(weekStartStr + "T12:00:00")
    d.setDate(d.getDate() - 7)
    onWeekChange(d.toISOString().split("T")[0])
  }

  const goNextWeek = () => {
    const d = new Date(weekStartStr + "T12:00:00")
    d.setDate(d.getDate() + 7)
    onWeekChange(d.toISOString().split("T")[0])
  }

  const handleAdd = async (sermonIds: string[]) => {
    await onAddSermons(sermonIds)
    setShowAddModal(false)
  }

  const sortedRows = principleRow ? [principleRow, ...listRows] : listRows

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">This Week&apos;s Sermons</h2>
          <div className="flex items-center gap-2 mt-1">
            <button type="button" onClick={goPrevWeek} className="p-1 rounded hover:bg-[#A7C2D7]/10 text-[#3C1E38]/60 hover:text-[#3C1E38]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-[#3C1E38]/70">{weekRange}</span>
            <button type="button" onClick={goNextWeek} className="p-1 rounded hover:bg-[#A7C2D7]/10 text-[#3C1E38]/60 hover:text-[#3C1E38]">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
          <Plus className="w-4 h-4 mr-2" /> Add Sermons
        </Button>
      </div>

      {/* Principle highlight at top */}
      {principleRow && principleRow.mastery_key_principle && (
        <WeeklyPrinciple
          title={principleRow.title}
          principle={principleRow.mastery_key_principle}
        />
      )}

      {/* List */}
      {weeklySermons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
          <Headphones className="w-12 h-12 text-[#A7C2D7]/30 mx-auto mb-3" />
          <p className="font-playfair text-lg font-bold text-[#3C1E38]">No sermons planned for this week</p>
          <p className="text-sm text-[#3C1E38]/50 mt-1">Add sermons from your library to plan your listening</p>
          <Button onClick={() => setShowAddModal(true)} className="mt-4 bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
            <Plus className="w-4 h-4 mr-2" /> Add Sermons
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRows.map((row, index) => (
            <WeeklySermonCard
              key={row.id}
              row={row}
              categoryLabel={categoryLabels[row.category]}
              onToggleListened={(listened) => onToggleListened(row.id, listened)}
              onNotesChange={(notes) => onUpdateNotes(row.id, notes)}
              onSetAsPrinciple={() => onSetPrinciple(row.id)}
              onRemove={() => onRemove(row.id)}
              onMoveUp={() => onReorder(row.id, "up")}
              onMoveDown={() => onReorder(row.id, "down")}
              canMoveUp={index > 0}
              canMoveDown={index < sortedRows.length - 1}
              onAddKeyPrinciple={onAddKeyPrinciple ? (principle) => onAddKeyPrinciple(row.sermon_id, principle) : undefined}
            />
          ))}
        </div>
      )}

      {/* Progress */}
      {weeklySermons.length > 0 && (
        <div className="rounded-xl border border-[#A7C2D7]/20 bg-[#FDFCF9] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#3C1E38]">{listenedCount} of {totalCount} listened this week</span>
          </div>
          <Progress value={totalCount > 0 ? (listenedCount / totalCount) * 100 : 0} className="h-2" />
          <p className="text-xs text-[#3C1E38]/50 mt-1">Goal: 5+ sermons per week (G2)</p>
        </div>
      )}

      <AddSermonsModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        sermons={sermons}
        alreadyAddedIds={weeklySermons.map((w) => w.sermon_id)}
        onAdd={handleAdd}
        onOpenAddNew={onOpenAddSermon}
      />
    </div>
  )
}
