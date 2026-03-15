"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionCard } from "./section-card"
import { NewQuarterFlow } from "./new-quarter-flow"
import { getQuarterProgress } from "@/lib/data/dominion"

export interface QuarterRow {
  id: string
  code: string
  name: string
  start_date: string
  end_date: string
  year_number: number | null
  is_active: boolean
}

interface QuarterConfigProps {
  userId: string
  quarters: QuarterRow[]
  onQuartersChange?: () => void
}

const YEAR_NAMES: Record<number, string> = {
  1: "Foundation & Spiritual Awakening",
  2: "Momentum & Mastery",
  3: "Breakthrough & Visibility",
  4: "Harvest & Legacy Seeding",
}

export function QuarterConfig({ userId, quarters, onQuartersChange }: QuarterConfigProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showNewQuarter, setShowNewQuarter] = useState(false)
  const dominionQuarter = getQuarterProgress()

  const activeQuarter = quarters.find((q) => q.is_active)
  const displayName = activeQuarter
    ? `Year ${activeQuarter.year_number ?? 2}: ${activeQuarter.name}`
    : `Year ${dominionQuarter.year}: ${YEAR_NAMES[dominionQuarter.year] ?? "Momentum & Mastery"}`
  const displayDates = activeQuarter
    ? `${formatDate(activeQuarter.start_date)} – ${formatDate(activeQuarter.end_date)}`
    : "—"
  const weekProgress = activeQuarter
    ? dominionQuarter.weekInQuarter
    : dominionQuarter.weekInQuarter

  const [form, setForm] = useState({
    name: activeQuarter?.name ?? YEAR_NAMES[dominionQuarter.year] ?? "",
    code: activeQuarter?.code ?? `Y${dominionQuarter.year}-${new Date().getFullYear()}`,
    year_number: activeQuarter?.year_number ?? dominionQuarter.year,
    start_date: activeQuarter?.start_date ?? "",
    end_date: activeQuarter?.end_date ?? "",
  })

  function formatDate(d: string) {
    if (!d) return "—"
    const dt = new Date(d + "T12:00:00")
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleSave = async () => {
    if (!activeQuarter) return
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const { error } = await supabase
      .from("quarter_config")
      .update({
        name: form.name,
        code: form.code,
        year_number: form.year_number,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      })
      .eq("id", activeQuarter.id)
    setSaving(false)
    if (error) {
      toast.error("Could not save quarter — " + error.message)
      return
    }
    setSaved(true)
    toast.success("Quarter saved")
    setTimeout(() => setSaved(false), 2000)
    onQuartersChange?.()
  }

  return (
    <>
      <SectionCard
        id="quarter-config"
        icon={Calendar}
        iconBg="bg-[#F9D57E]/20"
        iconColor="text-[#3C1E38]"
        title="Quarter Configuration"
        subtitle="Manage your 13-week year cycles"
      >
        <div className="space-y-6">
          {/* Current Quarter Display */}
          <div className="rounded-xl border border-[#A7C2D7]/20 bg-[#FDFCF9] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-playfair font-bold text-[#3C1E38]">{displayName}</p>
                <p className="text-sm text-[#3C1E38]/60">{displayDates}</p>
                <p className="text-xs text-[#3C1E38]/50 mt-1">Week {weekProgress} of 13</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ACTIVE
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-[#A7C2D7]/20 overflow-hidden">
              <div
                className="h-full bg-[#F9D57E] rounded-full transition-all"
                style={{ width: `${(weekProgress / 13) * 100}%` }}
              />
            </div>
          </div>

          {/* Quarter Settings Form — only when we have an active quarter from DB */}
          {activeQuarter && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quarter Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Momentum & Mastery"
                    className="border-[#A7C2D7]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quarter Code</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. Y2-2026"
                    className="border-[#A7C2D7]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year Number</Label>
                  <select
                    value={form.year_number}
                    onChange={(e) => setForm((p) => ({ ...p, year_number: Number(e.target.value) }))}
                    className="flex h-9 w-full rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-1 text-sm"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>Year {n}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                    className="border-[#A7C2D7]/30"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                    className="border-[#A7C2D7]/30"
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <Check className="mr-2 h-4 w-4" /> : null}
                Save Changes
              </Button>
            </div>
          )}

          {/* Quarter History */}
          {quarters.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[#3C1E38]/70 mb-2">Past quarters</p>
              <ul className="space-y-2 text-sm text-[#3C1E38]/80">
                {[...quarters].sort((a, b) => b.start_date.localeCompare(a.start_date)).map((q) => (
                  <li key={q.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#A7C2D7]/15 px-3 py-2">
                    <span className="font-medium">{q.code}</span>
                    <span>{q.name}</span>
                    <span className="text-[#3C1E38]/50">{formatDate(q.start_date)} – {formatDate(q.end_date)}</span>
                    {q.is_active && <span className="text-emerald-600 text-xs font-medium">Active</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setShowNewQuarter(true)}
            className="border-[#F9D57E] text-[#3C1E38] hover:bg-[#F9D57E]/10"
          >
            Start New Quarter
          </Button>
        </div>
      </SectionCard>

      {showNewQuarter && (
        <NewQuarterFlow
          userId={userId}
          currentQuarters={quarters}
          onClose={() => setShowNewQuarter(false)}
          onComplete={() => {
            setShowNewQuarter(false)
            onQuartersChange?.()
          }}
        />
      )}
    </>
  )
}
