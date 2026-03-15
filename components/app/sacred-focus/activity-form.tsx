"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ACTIVITY_TYPES, RECURRENCE_PRESETS, DAYS_OF_WEEK } from "./types"
import type { SpiritualActivity, ActivityType, SubChallenge, TargetType } from "./types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: SpiritualActivity | null  // null = create, existing = edit
  existingSubChallenges?: SubChallenge[]
  userId: string
  onSaved: (activity: SpiritualActivity, subChallenges: SubChallenge[]) => void
}

interface SubChallengeForm {
  id?: string
  title: string
  description: string
  target_type: TargetType
  target_value: number
  target_unit: string
}

export function ActivityForm({ open, onOpenChange, activity, existingSubChallenges, userId, onSaved }: Props) {
  const isEdit = !!activity

  const [title, setTitle] = useState(activity?.title ?? "")
  const [type, setType] = useState<ActivityType>(activity?.type ?? "fellowship")
  const [organizer, setOrganizer] = useState(activity?.organizer ?? "")
  const [description, setDescription] = useState(activity?.description ?? "")
  const [isRecurring, setIsRecurring] = useState(activity?.is_recurring ?? false)
  const [startDate, setStartDate] = useState(activity?.start_date ?? "")
  const [endDate, setEndDate] = useState(activity?.end_date ?? "")
  const [recurrencePreset, setRecurrencePreset] = useState(activity?.recurrence_pattern ?? "weekly_sunday")
  const [customDays, setCustomDays] = useState<number[]>(() => {
    if (activity?.recurrence_pattern?.startsWith("custom:")) {
      return activity.recurrence_pattern.replace("custom:", "").split(",").map(Number)
    }
    return []
  })
  const [tagsInput, setTagsInput] = useState(activity?.tags?.join(", ") ?? "")
  const [resources, setResources] = useState<string[]>(activity?.books_resources ?? [])
  const [newResource, setNewResource] = useState("")
  const [subChallenges, setSubChallenges] = useState<SubChallengeForm[]>(
    existingSubChallenges?.map((sc) => ({
      id: sc.id,
      title: sc.title,
      description: sc.description ?? "",
      target_type: sc.target_type,
      target_value: sc.target_value,
      target_unit: sc.target_unit ?? "",
    })) ?? []
  )
  const [saving, setSaving] = useState(false)

  // When opening for edit, prefill form from activity (useState init only runs on mount)
  useEffect(() => {
    if (!open) return
    if (activity) {
      setTitle(activity.title ?? "")
      setType(activity.type ?? "fellowship")
      setOrganizer(activity.organizer ?? "")
      setDescription(activity.description ?? "")
      setIsRecurring(activity.is_recurring ?? false)
      setStartDate(activity.start_date ?? "")
      setEndDate(activity.end_date ?? "")
      setRecurrencePreset(activity.recurrence_pattern ?? "weekly_sunday")
      setCustomDays(
        activity.recurrence_pattern?.startsWith("custom:")
          ? activity.recurrence_pattern.replace("custom:", "").split(",").map(Number)
          : []
      )
      setTagsInput(activity.tags?.join(", ") ?? "")
      setResources(activity.books_resources ?? [])
      setSubChallenges(
        existingSubChallenges?.map((sc) => ({
          id: sc.id,
          title: sc.title,
          description: sc.description ?? "",
          target_type: sc.target_type,
          target_value: sc.target_value,
          target_unit: sc.target_unit ?? "",
        })) ?? []
      )
    } else {
      setTitle("")
      setType("fellowship")
      setOrganizer("")
      setDescription("")
      setIsRecurring(false)
      setStartDate("")
      setEndDate("")
      setRecurrencePreset("weekly_sunday")
      setCustomDays([])
      setTagsInput("")
      setResources([])
      setSubChallenges([])
    }
  }, [open, activity, existingSubChallenges])

  const recurrencePattern = recurrencePreset === "custom"
    ? `custom:${customDays.sort().join(",")}`
    : recurrencePreset

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()

    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
    const status = isRecurring ? "active" : (startDate && new Date(startDate) > new Date() ? "upcoming" : "active")

    const activityData = {
      user_id: userId,
      title: title.trim(),
      type,
      organizer: organizer.trim() || null,
      description: description.trim() || null,
      start_date: isRecurring ? null : (startDate || null),
      end_date: isRecurring ? null : (endDate || null),
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      status,
      tags,
      books_resources: resources,
    }

    let savedActivity: SpiritualActivity

    if (isEdit && activity) {
      const { data, error } = await supabase
        .from("spiritual_activities")
        .update({ ...activityData, updated_at: new Date().toISOString() })
        .eq("id", activity.id)
        .select()
        .single()

      if (error) { toast.error("Failed to update activity"); setSaving(false); return }
      savedActivity = data ?? { ...activity, ...activityData, updated_at: new Date().toISOString() }
    } else {
      const { data, error } = await supabase
        .from("spiritual_activities")
        .insert(activityData)
        .select()
        .single()

      if (error) { toast.error("Failed to create activity"); setSaving(false); return }
      savedActivity = data ?? {
        id: crypto.randomUUID(), ...activityData,
        overall_reflection: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // Save sub-challenges
    const savedSubs: SubChallenge[] = []
    for (const sc of subChallenges) {
      if (!sc.title.trim()) continue
      const scData = {
        user_id: userId,
        activity_id: savedActivity.id,
        title: sc.title.trim(),
        description: sc.description.trim() || null,
        target_type: sc.target_type,
        target_value: sc.target_value,
        target_unit: sc.target_unit.trim() || null,
        start_date: isRecurring ? null : (startDate || null),
        end_date: isRecurring ? null : (endDate || null),
        active: true,
      }

      if (sc.id) {
        const { data } = await supabase.from("activity_sub_challenges").update(scData).eq("id", sc.id).select().single()
        if (data) savedSubs.push(data)
      } else {
        const { data } = await supabase.from("activity_sub_challenges").insert(scData).select().single()
        if (data) savedSubs.push(data)
      }
    }

    onSaved(savedActivity, savedSubs)
    toast.success(isEdit ? "Activity updated" : "Activity created")
    onOpenChange(false)
    setSaving(false)
  }

  const addSubChallenge = () => {
    setSubChallenges([...subChallenges, {
      title: "", description: "", target_type: "daily_boolean", target_value: 1, target_unit: "completed"
    }])
  }

  const removeSubChallenge = (index: number) => {
    setSubChallenges(subChallenges.filter((_, i) => i !== index))
  }

  const updateSubChallenge = (index: number, field: string, value: string | number) => {
    setSubChallenges(subChallenges.map((sc, i) => i === index ? { ...sc, [field]: value } : sc))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair">{isEdit ? "Edit Activity" : "New Spiritual Activity"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Activity type */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    type === t.key
                      ? "bg-[#A7C2D7]/15 text-[#3C1E38] border-[#A7C2D7]/40"
                      : "border-[#A7C2D7]/20 text-[#3C1E38]/40 hover:border-[#A7C2D7]/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., TYOB 2026"
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none"
            />
          </div>

          {/* Organizer */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Organizer</label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g., Prophetess Tiphani Montgomery"
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none"
            />
          </div>

          {/* Date Range vs Recurring toggle */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-2">Activity Schedule</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  !isRecurring ? "bg-[#A7C2D7]/15 border-[#A7C2D7]/40 text-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/40"
                }`}
              >
                Date Range
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  isRecurring ? "bg-[#A7C2D7]/15 border-[#A7C2D7]/40 text-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/40"
                }`}
              >
                Recurring
              </button>
            </div>

            {isRecurring ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {RECURRENCE_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setRecurrencePreset(p.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        recurrencePreset === p.value
                          ? "bg-[#A7C2D7]/15 text-[#3C1E38] border-[#A7C2D7]/40"
                          : "border-[#A7C2D7]/20 text-[#3C1E38]/40"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {recurrencePreset === "custom" && (
                  <div className="flex gap-1.5">
                    {DAYS_OF_WEEK.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setCustomDays(
                          customDays.includes(d.value)
                            ? customDays.filter((v) => v !== d.value)
                            : [...customDays, d.value]
                        )}
                        className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all ${
                          customDays.includes(d.value)
                            ? "bg-[#A7C2D7] text-white border-[#A7C2D7]"
                            : "border-[#A7C2D7]/20 text-[#3C1E38]/40"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#3C1E38]/40 block mb-1">Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#3C1E38]/40 block mb-1">End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., teaching, fellowship, worship"
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
            />
          </div>

          {/* Books & Resources */}
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Books & Resources</label>
            <div className="space-y-1.5">
              {resources.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-[#3C1E38]/60 flex-1">{r}</span>
                  <button onClick={() => setResources(resources.filter((_, j) => j !== i))} className="text-[#3C1E38]/20 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newResource.trim()) {
                      setResources([...resources, newResource.trim()])
                      setNewResource("")
                    }
                  }}
                  placeholder="Add resource..."
                  className="flex-1 px-2.5 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                />
                <button
                  onClick={() => { if (newResource.trim()) { setResources([...resources, newResource.trim()]); setNewResource("") } }}
                  className="text-xs text-[#A7C2D7] font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Challenges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#3C1E38]/70">Sub-Challenges</label>
              <button onClick={addSubChallenge} className="flex items-center gap-1 text-xs text-[#A7C2D7] hover:text-[#A7C2D7]/80 font-medium">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {subChallenges.map((sc, i) => (
                <div key={i} className="bg-[#FDFCF9] rounded-xl p-3 space-y-2 border border-[#A7C2D7]/10">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sc.title}
                      onChange={(e) => updateSubChallenge(i, "title", e.target.value)}
                      placeholder="Challenge title"
                      className="flex-1 px-2.5 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                    />
                    <button onClick={() => removeSubChallenge(i)} className="text-[#3C1E38]/20 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={sc.description}
                    onChange={(e) => updateSubChallenge(i, "description", e.target.value)}
                    rows={1}
                    placeholder="Description..."
                    className="w-full px-2.5 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-xs resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {(["daily_count", "daily_boolean", "daily_duration"] as TargetType[]).map((tt) => (
                      <button
                        key={tt}
                        type="button"
                        onClick={() => updateSubChallenge(i, "target_type", tt)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all ${
                          sc.target_type === tt
                            ? "bg-[#A7C2D7]/15 text-[#3C1E38] border-[#A7C2D7]/40"
                            : "border-[#A7C2D7]/20 text-[#3C1E38]/40"
                        }`}
                      >
                        {tt === "daily_count" ? "Count" : tt === "daily_boolean" ? "Yes/No" : "Duration"}
                      </button>
                    ))}
                  </div>
                  {sc.target_type !== "daily_boolean" && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={sc.target_value}
                        onChange={(e) => updateSubChallenge(i, "target_value", parseInt(e.target.value) || 1)}
                        className="w-20 px-2.5 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-xs focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        min={1}
                      />
                      <input
                        type="text"
                        value={sc.target_unit}
                        onChange={(e) => updateSubChallenge(i, "target_unit", e.target.value)}
                        placeholder="Unit (times, minutes...)"
                        className="flex-1 px-2.5 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-xs focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90">
              {saving ? "Saving..." : isEdit ? "Update" : "Create Activity"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
