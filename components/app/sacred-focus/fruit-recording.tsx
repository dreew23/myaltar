"use client"

import { useState } from "react"
import { Plus, Leaf, X, Pencil, Trash2 } from "lucide-react"
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
import { FRUIT_CATEGORIES, getSacredFocusEntryDateBounds } from "./types"
import type { ActivityFruit, FruitCategory, SpiritualActivity } from "./types"

interface Props {
  activityId: string
  activity?: SpiritualActivity
  fruits: ActivityFruit[]
  userId: string
  onFruitAdded: (fruit: ActivityFruit) => void
  onFruitUpdated: (fruit: ActivityFruit) => void
  onFruitDeleted: (id: string) => void
}

export function FruitRecording({
  activityId,
  activity,
  fruits,
  userId,
  onFruitAdded,
  onFruitUpdated,
  onFruitDeleted,
}: Props) {
  const { min: dateMin, max: dateMax } = getSacredFocusEntryDateBounds(activity)
  const [adding, setAdding] = useState(false)
  const [fruitDate, setFruitDate] = useState(dateMax)
  const [category, setCategory] = useState<FruitCategory>("spiritual_growth")
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState("")
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setCategory("spiritual_growth")
    setFruitDate(dateMax)
    setDescription("")
    setEvidence("")
    setAdding(false)
  }

  const handleSave = async () => {
    if (!description.trim()) return
    if (fruitDate < dateMin || fruitDate > dateMax) {
      toast.error("Choose a date between the allowed range (not in the future).")
      return
    }
    setSaving(true)

    const entry = {
      user_id: userId,
      activity_id: activityId,
      category,
      description: description.trim(),
      evidence: evidence.trim() || null,
      date_recorded: fruitDate,
    }

    const supabase = createClient()
    const { data, error } = await supabase.from("activity_fruits").insert(entry).select().single()

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

  const sortedFruits = [...fruits].sort(
    (a, b) =>
      b.date_recorded.localeCompare(a.date_recorded) ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-4">
      {!adding && (
        <button
          onClick={() => {
            setFruitDate(dateMax)
            setAdding(true)
          }}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#2E7D32]/20 text-[#2E7D32]/40 hover:border-[#2E7D32]/40 hover:text-[#2E7D32]/60 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Record Fruit / Gain</span>
        </button>
      )}

      {adding && (
        <div className="bg-white rounded-2xl border border-[#2E7D32]/15 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#3C1E38]">Record Fruit</p>
            <button onClick={reset} className="text-[#3C1E38]/30 hover:text-[#3C1E38]/60">
              <X className="w-4 h-4" />
            </button>
          </div>

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

          <div>
            <label className="text-xs text-[#3C1E38]/40 mb-1.5 block">Date recorded</label>
            <input
              type="date"
              value={fruitDate}
              min={dateMin}
              max={dateMax}
              onChange={(e) => setFruitDate(e.target.value)}
              className="w-full max-w-[220px] px-3 py-2 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]/40 outline-none"
            />
            <p className="text-[10px] text-[#3C1E38]/35 mt-1.5">
              Defaults to today. Pick a past day to record fruit for that day.
            </p>
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What fruit did you gain from this activity?"
              className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-xl text-sm text-[#3C1E38] resize-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]/40 outline-none placeholder:text-[#3C1E38]/30"
            />
          </div>

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

      {fruits.length === 0 && !adding ? (
        <div className="text-center py-12 text-[#3C1E38]/30">
          <Leaf className="w-8 h-8 mx-auto mb-2 text-[#2E7D32]/20" />
          <p className="text-sm">No fruits recorded yet.</p>
          <p className="text-xs mt-1">Record tangible outcomes and gains from this activity.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFruits.map((fruit) => (
            <FruitEntryRow
              key={fruit.id}
              fruit={fruit}
              dateMin={dateMin}
              dateMax={dateMax}
              onUpdated={onFruitUpdated}
              onDeleted={onFruitDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FruitEntryRow({
  fruit,
  dateMin,
  dateMax,
  onUpdated,
  onDeleted,
}: {
  fruit: ActivityFruit
  dateMin: string
  dateMax: string
  onUpdated: (fruit: ActivityFruit) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [category, setCategory] = useState<FruitCategory>(fruit.category)
  const [fruitDate, setFruitDate] = useState(fruit.date_recorded)
  const [description, setDescription] = useState(fruit.description)
  const [evidence, setEvidence] = useState(fruit.evidence ?? "")

  const resetFromFruit = () => {
    setCategory(fruit.category)
    setFruitDate(fruit.date_recorded)
    setDescription(fruit.description)
    setEvidence(fruit.evidence ?? "")
  }

  const handleSave = async () => {
    if (!description.trim()) return
    if (fruitDate < dateMin || fruitDate > dateMax) {
      toast.error("Date must be within the allowed range.")
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activity_fruits")
      .update({
        category,
        description: description.trim(),
        evidence: evidence.trim() || null,
        date_recorded: fruitDate,
      })
      .eq("id", fruit.id)
      .select()
      .single()

    if (error || !data) {
      toast.error("Failed to update fruit")
      setSaving(false)
      return
    }

    onUpdated(data as ActivityFruit)
    toast.success("Fruit updated")
    setEditing(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("activity_fruits").delete().eq("id", fruit.id)
    setDeleting(false)
    setDeleteOpen(false)
    if (error) {
      toast.error("Failed to delete fruit")
      return
    }
    onDeleted(fruit.id)
    toast.success("Fruit deleted")
  }

  const cat = FRUIT_CATEGORIES.find((c) => c.key === fruit.category)
  const d = new Date(fruit.date_recorded + "T12:00:00")

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-[#2E7D32]/25 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {FRUIT_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                category === c.key
                  ? "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30"
                  : "border-[#A7C2D7]/20 text-[#3C1E38]/40"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-[#3C1E38]/40 mb-1 block">Date recorded</label>
          <input
            type="date"
            value={fruitDate}
            min={dateMin}
            max={dateMax}
            onChange={(e) => setFruitDate(e.target.value)}
            className="w-full max-w-[220px] px-3 py-2 border border-[#A7C2D7]/20 rounded-xl text-sm"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-xl text-sm resize-none"
        />
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          rows={2}
          placeholder="Evidence (optional)"
          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-xl text-sm resize-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              resetFromFruit()
              setEditing(false)
            }}
            disabled={saving}
            className="px-4 py-2 text-sm text-[#3C1E38]/60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !description.trim()}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#2E7D32] text-white disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-[#A7C2D7]/10 p-3.5 group relative">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100">
          <button
            type="button"
            onClick={() => {
              resetFromFruit()
              setEditing(true)
            }}
            className="p-1.5 rounded-lg text-[#3C1E38]/35 hover:bg-[#2E7D32]/10 hover:text-[#2E7D32]"
            aria-label="Edit fruit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-lg text-[#3C1E38]/35 hover:bg-red-50 hover:text-red-700"
            aria-label="Delete fruit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-start gap-2.5 pr-14">
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fruit / gain?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The record will be removed from this activity.
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
