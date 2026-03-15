"use client"

import { useState } from "react"
import { Heart, ChevronDown, ChevronRight, X, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionCard } from "./section-card"
import { intercessionRotation } from "@/lib/data/dominion"
import { prayerAreas } from "@/lib/data/dominion"

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export interface IntercessionDayRow {
  day_of_week: number
  theme: string
  people: string[]
  life_areas: string[]
}

interface IntercessionEditorProps {
  userId: string
  initialSchedule: IntercessionDayRow[] | null
  onSave?: () => void
}

export function IntercessionEditor({ userId, initialSchedule, onSave }: IntercessionEditorProps) {
  const [saving, setSaving] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const [schedule, setSchedule] = useState<IntercessionDayRow[]>(() => {
    if (initialSchedule && initialSchedule.length === 7) return initialSchedule
    return ([0, 1, 2, 3, 4, 5, 6] as const).map((d) => ({
      day_of_week: d,
      theme: intercessionRotation[d].theme,
      people: [] as string[],
      life_areas: [] as string[],
    }))
  })
  const [newPerson, setNewPerson] = useState<Record<number, string>>({})

  const updateDay = (dayOfWeek: number, patch: Partial<IntercessionDayRow>) => {
    setSchedule((prev) =>
      prev.map((row) => (row.day_of_week === dayOfWeek ? { ...row, ...patch } : row))
    )
  }

  const addPerson = (dayOfWeek: number) => {
    const name = (newPerson[dayOfWeek] ?? "").trim()
    if (!name) return
    const row = schedule.find((r) => r.day_of_week === dayOfWeek)
    if (row && !row.people.includes(name)) {
      updateDay(dayOfWeek, { people: [...row.people, name] })
      setNewPerson((p) => ({ ...p, [dayOfWeek]: "" }))
    }
  }

  const removePerson = (dayOfWeek: number, name: string) => {
    const row = schedule.find((r) => r.day_of_week === dayOfWeek)
    if (row) updateDay(dayOfWeek, { people: row.people.filter((p) => p !== name) })
  }

  const toggleLifeArea = (dayOfWeek: number, area: string) => {
    const row = schedule.find((r) => r.day_of_week === dayOfWeek)
    if (!row) return
    const next = row.life_areas.includes(area)
      ? row.life_areas.filter((a) => a !== area)
      : [...row.life_areas, area]
    updateDay(dayOfWeek, { life_areas: next })
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    let hadError = false
    for (const row of schedule) {
      const { error } = await supabase.from("intercession_schedule").upsert(
        {
          user_id: userId,
          day_of_week: row.day_of_week,
          theme: row.theme,
          people: row.people,
          life_areas: row.life_areas,
        },
        { onConflict: "user_id,day_of_week" }
      )
      if (error) {
        hadError = true
        toast.error("Could not save schedule — " + error.message)
        break
      }
    }
    setSaving(false)
    if (!hadError) {
      toast.success("Intercession schedule saved")
      onSave?.()
    }
  }

  return (
    <SectionCard
      id="intercession-schedule"
      icon={Heart}
      iconBg="bg-rose-500/10"
      iconColor="text-rose-600"
      title="Intercession Schedule"
      subtitle="Who you're praying for each day"
    >
      <div className="space-y-4">
        {schedule.map((row) => {
          const isCollapsed = collapsed[row.day_of_week]
          return (
            <div key={row.day_of_week} className="rounded-xl border border-[#A7C2D7]/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setCollapsed((p) => ({ ...p, [row.day_of_week]: !p[row.day_of_week] }))}
                className="w-full flex items-center justify-between p-3 text-left bg-[#FDFCF9] hover:bg-[#A7C2D7]/5"
              >
                <span className="font-playfair font-bold text-[#3C1E38]">{DAY_LABELS[row.day_of_week]}</span>
                <span className="text-sm text-[#3C1E38]/60">{row.theme}</span>
                <span className="text-xs text-[#3C1E38]/50">{row.people.length} people</span>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {!isCollapsed && (
                <div className="p-4 space-y-3 border-t border-[#A7C2D7]/15 bg-white">
                  <div className="space-y-1.5">
                    <Label>Theme</Label>
                    <Input
                      value={row.theme}
                      onChange={(e) => updateDay(row.day_of_week, { theme: e.target.value })}
                      className="border-[#A7C2D7]/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>People</Label>
                    <div className="flex flex-wrap gap-2">
                      {row.people.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 rounded-full bg-[#A7C2D7]/15 px-2.5 py-1 text-sm"
                        >
                          {p}
                          <button type="button" onClick={() => removePerson(row.day_of_week, p)} className="text-[#3C1E38]/50 hover:text-rose-500">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add person"
                        value={newPerson[row.day_of_week] ?? ""}
                        onChange={(e) => setNewPerson((p) => ({ ...p, [row.day_of_week]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPerson(row.day_of_week))}
                        className="border-[#A7C2D7]/30"
                      />
                      <Button type="button" size="sm" variant="outline" onClick={() => addPerson(row.day_of_week)} className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Life areas</Label>
                    <div className="flex flex-wrap gap-2">
                      {prayerAreas.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleLifeArea(row.day_of_week, area)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            row.life_areas.includes(area)
                              ? "bg-[#F9D57E]/30 text-[#3C1E38] border border-[#F9D57E]/50"
                              : "bg-[#FDFCF9] border border-[#A7C2D7]/20 text-[#3C1E38]/60"
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <Button onClick={handleSave} disabled={saving} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
          Save Schedule
        </Button>
      </div>
    </SectionCard>
  )
}
