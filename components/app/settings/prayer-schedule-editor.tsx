"use client"

import { useState } from "react"
import { Clock, Plus, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionCard } from "./section-card"
import { PRAYER_WATCHES, formatWatchTimeRange, watchId, watchShortLabel } from "@/lib/prayer-watches"
import {
  type PrayerScheduleConfig,
  type PrayerScheduleSlot,
  allWatchSlots,
  enabledSlots,
  newCustomSlotId,
  normalizePrayerSchedule,
  slotDisplayWithTime,
} from "@/lib/prayer-schedule"

interface PrayerScheduleEditorProps {
  userId: string
  initialSchedule: PrayerScheduleConfig | null
  onSave?: () => void
}

function mergeWithAllWatches(config: PrayerScheduleConfig): PrayerScheduleSlot[] {
  const byId = new Map(config.slots.map((s) => [s.id, s]))
  return PRAYER_WATCHES.map((w) => {
    const id = watchId(w.number)
    const existing = byId.get(id)
    if (existing) return existing
    return {
      id,
      kind: "watch" as const,
      watchNumber: w.number,
      startTime: w.startTime,
      endTime: w.endTime,
      enabled: false,
    }
  })
}

export function PrayerScheduleEditor({ userId, initialSchedule, onSave }: PrayerScheduleEditorProps) {
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<PrayerScheduleConfig>(() =>
    normalizePrayerSchedule(initialSchedule ?? null)
  )
  const [watchSlots, setWatchSlots] = useState(() => mergeWithAllWatches(config))
  const customSlots = config.slots.filter((s) => s.kind === "custom")

  const syncConfig = (watches: PrayerScheduleSlot[], customs: PrayerScheduleSlot[], primaryId: string) => {
    const all = [...watches.filter((s) => s.enabled), ...customs.filter((s) => s.enabled)]
    let primary = primaryId
    if (!all.some((s) => s.id === primary)) {
      primary = all[0]?.id ?? watchId(4)
    }
    setConfig({
      primarySlotId: primary,
      slots: [...watches, ...customs],
    })
  }

  const toggleWatch = (id: string) => {
    const next = watchSlots.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    setWatchSlots(next)
    syncConfig(next, customSlots, config.primarySlotId)
  }

  const setPrimary = (id: string) => {
    setConfig((c) => ({ ...c, primarySlotId: id }))
  }

  const updateCustom = (id: string, patch: Partial<PrayerScheduleSlot>) => {
    const nextCustoms = customSlots.map((s) => (s.id === id ? { ...s, ...patch } : s))
    syncConfig(watchSlots, nextCustoms, config.primarySlotId)
  }

  const addCustomSlot = () => {
    const slot: PrayerScheduleSlot = {
      id: newCustomSlotId(),
      kind: "custom",
      label: "Custom prayer time",
      startTime: "07:00",
      endTime: "07:30",
      enabled: true,
    }
    syncConfig(watchSlots, [...customSlots, slot], config.primarySlotId)
  }

  const removeCustom = (id: string) => {
    syncConfig(
      watchSlots,
      customSlots.filter((s) => s.id !== id),
      config.primarySlotId
    )
  }

  const loadFiveWatchPreset = () => {
    const preset = new Set([5, 6, 7, 8, 1].map((n) => watchId(n)))
    const next = allWatchSlots(false).map((s) => ({ ...s, enabled: preset.has(s.id) }))
    setWatchSlots(next)
    syncConfig(next, customSlots, watchId(5))
  }

  const handleSave = async () => {
    const enabled = enabledSlots(config)
    if (enabled.length === 0) {
      toast.error("Enable at least one prayer watch or custom time")
      return
    }
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        prayer_schedule: config,
      },
      { onConflict: "id" }
    )
    setSaving(false)
    if (error) {
      toast.error("Could not save prayer schedule — " + error.message)
      return
    }
    toast.success("Prayer schedule saved")
    onSave?.()
  }

  const enabled = enabledSlots(config)

  return (
    <SectionCard
      id="prayer-schedule"
      icon={Clock}
      title="Prayer Watches & Times"
      subtitle="Choose your prayer watches (3-hour intervals) or add custom times. Dashboard and streaks follow what you enable here."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={loadFiveWatchPreset}>
            5-watch preset (6 AM · 9 AM · noon · 3 PM · 6 PM)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = allWatchSlots(true)
              setWatchSlots(next)
              syncConfig(next, customSlots, watchId(4))
            }}
          >
            Enable all 8 watches
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-[#3C1E38]">Eight prayer watches</Label>
          <div className="space-y-2">
            {watchSlots.map((slot) => {
              const w = PRAYER_WATCHES.find((x) => x.number === slot.watchNumber)
              const isPrimary = config.primarySlotId === slot.id
              return (
                <div
                  key={slot.id}
                  className={`flex flex-wrap items-start gap-3 rounded-lg border p-3 ${
                    slot.enabled ? "border-[#A7C2D7]/40 bg-[#FDFCF9]" : "border-[#A7C2D7]/15 opacity-70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => toggleWatch(slot.id)}
                    className="mt-1"
                    aria-label={`Enable ${w ? watchShortLabel(w.number, w.name) : slot.id}`}
                  />
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-medium text-sm text-[#3C1E38]">
                      {w ? watchShortLabel(w.number, w.name) : slot.id}
                    </p>
                    <p className="text-xs text-[#3C1E38]/55">
                      {formatWatchTimeRange(slot.startTime, slot.endTime)}
                    </p>
                    {w && <p className="text-[10px] text-[#3C1E38]/45 mt-0.5">{w.focus}</p>}
                  </div>
                  {slot.enabled && (
                    <button
                      type="button"
                      onClick={() => setPrimary(slot.id)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        isPrimary ? "bg-[#F9D57E]/40 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:bg-[#A7C2D7]/10"
                      }`}
                      title="Primary watch shown on dashboard card"
                    >
                      <Star className={`w-3 h-3 ${isPrimary ? "fill-current" : ""}`} />
                      {isPrimary ? "Primary" : "Set primary"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-[#3C1E38]">Custom prayer times</Label>
            <Button type="button" variant="outline" size="sm" onClick={addCustomSlot}>
              <Plus className="w-3 h-3 mr-1" />
              Add time
            </Button>
          </div>
          {customSlots.length === 0 ? (
            <p className="text-xs text-[#3C1E38]/50">Optional — for fixed times outside the 8-watch grid.</p>
          ) : (
            customSlots.map((slot) => (
              <div key={slot.id} className="rounded-lg border border-[#A7C2D7]/25 p-3 space-y-2">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={slot.label ?? ""}
                      onChange={(e) => updateCustom(slot.id, { label: e.target.value })}
                      className="border-[#A7C2D7]/30"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateCustom(slot.id, { startTime: e.target.value })}
                      className="border-[#A7C2D7]/30 w-[120px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateCustom(slot.id, { endTime: e.target.value })}
                      className="border-[#A7C2D7]/30 w-[120px]"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs pb-2">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={(e) => updateCustom(slot.id, { enabled: e.target.checked })}
                    />
                    Active
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCustom(slot.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {enabled.length > 0 && (
          <p className="text-xs text-[#3C1E38]/60">
            Active: {enabled.map((s) => slotDisplayWithTime(s)).join(" · ")}
          </p>
        )}

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
        >
          {saving ? "Saving…" : "Save Prayer Schedule"}
        </Button>
      </div>
    </SectionCard>
  )
}
