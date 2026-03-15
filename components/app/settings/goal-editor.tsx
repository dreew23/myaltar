"use client"

import { useState } from "react"
import { Target, ChevronDown, ChevronRight, Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionCard } from "./section-card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { GOALS, type GoalConfig } from "@/lib/data/dominion"

export interface GoalRow {
  id?: string
  code: string
  title: string
  subtitle: string | null
  description: string | null
  pulse_question: string | null
  pulse_type: string
  db_field: string | null
  kr_10x: string | null
  kr_5x: string | null
  kr_2x: string | null
  not_now: string[]
  icon_name: string | null
  active: boolean
  display_order: number | null
}

function goalConfigToRow(g: GoalConfig, order: number): GoalRow {
  return {
    code: g.id,
    title: g.name,
    subtitle: g.subtitle,
    description: g.description,
    pulse_question: g.pulseQuestion,
    pulse_type: g.pulseType,
    db_field: g.dbField,
    kr_10x: g.kr10x,
    kr_5x: g.kr5x,
    kr_2x: g.kr2x,
    not_now: [...g.notNow],
    icon_name: g.iconKey,
    active: true,
    display_order: order,
  }
}

interface GoalEditorProps {
  userId: string
  initialGoals: GoalRow[] | null
  onSave?: () => void
}

export function GoalEditor({ userId, initialGoals, onSave }: GoalEditorProps) {
  const [saving, setSaving] = useState(false)
  const [goals, setGoals] = useState<GoalRow[]>(() => {
    if (initialGoals && initialGoals.length > 0) return initialGoals
    return GOALS.map((g, i) => goalConfigToRow(g, i + 1))
  })
  const [openId, setOpenId] = useState<string | null>(goals[0]?.code ?? null)

  const updateGoal = (code: string, patch: Partial<GoalRow>) => {
    setGoals((prev) => prev.map((g) => (g.code === code ? { ...g, ...patch } : g)))
  }

  const addNotNow = (code: string) => {
    const g = goals.find((x) => x.code === code)
    if (g) updateGoal(code, { not_now: [...g.not_now, ""] })
  }
  const updateNotNow = (code: string, index: number, value: string) => {
    const g = goals.find((x) => x.code === code)
    if (!g) return
    const next = [...g.not_now]
    next[index] = value
    updateGoal(code, { not_now: next })
  }
  const removeNotNow = (code: string, index: number) => {
    const g = goals.find((x) => x.code === code)
    if (!g) return
    updateGoal(code, { not_now: g.not_now.filter((_, i) => i !== index) })
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    let hadError = false
    for (const g of goals) {
      const { error } = await supabase.from("goals").upsert(
        {
          user_id: userId,
          code: g.code,
          title: g.title,
          subtitle: g.subtitle,
          description: g.description,
          pulse_question: g.pulse_question,
          pulse_type: g.pulse_type,
          db_field: g.db_field,
          kr_10x: g.kr_10x,
          kr_5x: g.kr_5x,
          kr_2x: g.kr_2x,
          not_now: g.not_now.filter(Boolean),
          icon_name: g.icon_name,
          active: g.active,
          display_order: g.display_order,
        },
        { onConflict: "user_id,code" }
      )
      if (error) {
        hadError = true
        toast.error("Could not save goals — " + error.message)
        break
      }
    }
    setSaving(false)
    if (!hadError) {
      toast.success("Goals saved")
      onSave?.()
    }
  }

  return (
    <SectionCard
      id="goal-config"
      icon={Target}
      iconBg="bg-[#F9D57E]/20"
      iconColor="text-[#3C1E38]"
      title="Goal Configuration"
      subtitle="Edit your 7 DOMINION goals, Key Results, and strategic boundaries"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-[#A7C2D7]/20 bg-[#FDFCF9] p-3 text-sm text-[#3C1E38]/80">
          Goals are your strategic architecture. Edit them thoughtfully — ideally during your quarterly Sacred Year Review ceremony, not on a random Tuesday. Changes here affect your Dashboard, Sunday Pulse, and Goals cockpit.
        </div>
        {goals.map((g, idx) => (
          <Collapsible key={g.code} open={openId === g.code} onOpenChange={(o) => setOpenId(o ? g.code : null)}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-[#A7C2D7]/20 bg-white px-4 py-3 text-left font-medium text-[#3C1E38] hover:bg-[#A7C2D7]/5">
              <span className="flex items-center gap-2">
                <span className="rounded bg-[#A7C2D7]/20 px-2 py-0.5 text-xs font-semibold">{g.code}</span>
                {g.title}
              </span>
              {openId === g.code ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-3 rounded-b-lg border border-t-0 border-[#A7C2D7]/20 bg-[#FDFCF9] p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={g.title} onChange={(e) => updateGoal(g.code, { title: e.target.value })} className="border-[#A7C2D7]/30" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subtitle</Label>
                    <Input value={g.subtitle ?? ""} onChange={(e) => updateGoal(g.code, { subtitle: e.target.value })} className="border-[#A7C2D7]/30" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description (WHY)</Label>
                  <textarea
                    value={g.description ?? ""}
                    onChange={(e) => updateGoal(g.code, { description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pulse Question</Label>
                  <Input value={g.pulse_question ?? ""} onChange={(e) => updateGoal(g.code, { pulse_question: e.target.value })} className="border-[#A7C2D7]/30" />
                </div>
                <div className="space-y-1.5">
                  <Label>10x Key Result</Label>
                  <textarea value={g.kr_10x ?? ""} onChange={(e) => updateGoal(g.code, { kr_10x: e.target.value })} rows={2} className="w-full rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label>5x Key Result</Label>
                  <textarea value={g.kr_5x ?? ""} onChange={(e) => updateGoal(g.code, { kr_5x: e.target.value })} rows={2} className="w-full rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label>2x Key Result</Label>
                  <textarea value={g.kr_2x ?? ""} onChange={(e) => updateGoal(g.code, { kr_2x: e.target.value })} rows={2} className="w-full rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1.5 border-l-4 border-rose-300 pl-3">
                  <Label>NOT NOW</Label>
                  {g.not_now.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateNotNow(g.code, i, e.target.value)} className="border-[#A7C2D7]/30" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeNotNow(g.code, i)} className="text-rose-500 shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addNotNow(g.code)} className="border-rose-200 text-rose-700">
                    <Plus className="mr-1 h-3 w-3" /> Add NOT NOW item
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={g.active} onChange={(e) => updateGoal(g.code, { active: e.target.checked })} className="rounded border-[#A7C2D7]/30" />
                    Active
                  </label>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Order</Label>
                    <Input type="number" min={1} max={7} value={g.display_order ?? idx + 1} onChange={(e) => updateGoal(g.code, { display_order: Number(e.target.value) || null })} className="w-16 border-[#A7C2D7]/30" />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        <Button onClick={handleSave} disabled={saving} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save All Goals
        </Button>
      </div>
    </SectionCard>
  )
}
