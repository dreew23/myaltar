"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2, Check, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionCard } from "./section-card"
import type { PersonalYearConfigRow } from "@/lib/personal-year"

interface PersonalYearConfigProps {
  userId: string
  initialRows: PersonalYearConfigRow[]
  onRowsChange?: () => void
}

function formatRange(startStr: string, endStr: string) {
  const a = new Date(startStr + "T12:00:00")
  const b = new Date(endStr + "T12:00:00")
  return `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

function statusForRow(row: PersonalYearConfigRow, today: Date): "Completed" | "ACTIVE" | "Upcoming" {
  const s = new Date(row.start_date + "T12:00:00")
  const e = new Date(row.end_date + "T12:00:00")
  if (today > e) return "Completed"
  if (today < s) return "Upcoming"
  return "ACTIVE"
}

export function PersonalYearConfig({ userId, initialRows, onRowsChange }: PersonalYearConfigProps) {
  const [rows, setRows] = useState<PersonalYearConfigRow[]>(() =>
    [...initialRows].sort((a, b) => a.year_number - b.year_number)
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    year_code: "",
    year_name: "",
    year_number: 1,
    year_theme: "",
    start_date: "",
    end_date: "",
    is_active: false,
  })

  const today = new Date()
  today.setHours(12, 0, 0, 0)

  useEffect(() => {
    setRows([...initialRows].sort((a, b) => a.year_number - b.year_number))
  }, [initialRows])

  const saveRow = async (id: string, patch: Partial<PersonalYearConfigRow>) => {
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const { error } = await supabase.from("personal_year_config").update(patch).eq("id", id).eq("user_id", userId)
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return false
    }
    toast.success("Saved")
    onRowsChange?.()
    return true
  }

  const setActiveOnly = async (id: string) => {
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    await supabase.from("personal_year_config").update({ is_active: false }).eq("user_id", userId)
    const { error } = await supabase.from("personal_year_config").update({ is_active: true }).eq("id", id).eq("user_id", userId)
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Active year updated")
    onRowsChange?.()
  }

  const handleSaveEdit = async (row: PersonalYearConfigRow) => {
    const ok = await saveRow(row.id, {
      year_name: form.year_name,
      year_code: form.year_code,
      year_theme: form.year_theme || null,
      start_date: form.start_date,
      end_date: form.end_date,
      year_number: form.year_number,
    })
    if (ok) setEditingId(null)
  }

  const startEdit = (row: PersonalYearConfigRow) => {
    setEditingId(row.id)
    setForm({
      year_code: row.year_code,
      year_name: row.year_name,
      year_number: row.year_number,
      year_theme: row.year_theme ?? "",
      start_date: row.start_date,
      end_date: row.end_date,
      is_active: row.is_active,
    })
  }

  const nextYearNumber = Math.max(0, ...rows.map((r) => r.year_number)) + 1

  const addCycle = async () => {
    if (!form.year_code.trim() || !form.year_name.trim() || !form.start_date || !form.end_date) {
      toast.error("Fill code, name, start, and end")
      return
    }
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    const { data, error } = await supabase
      .from("personal_year_config")
      .insert({
        user_id: userId,
        year_code: form.year_code.trim(),
        year_name: form.year_name.trim(),
        year_number: form.year_number,
        year_theme: form.year_theme.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: false,
      })
      .select("id")
      .single()
    if (error || !data) {
      setSaving(false)
      toast.error(error?.message ?? "Insert failed")
      return
    }
    if (form.is_active) {
      await supabase.from("personal_year_config").update({ is_active: false }).eq("user_id", userId)
      await supabase.from("personal_year_config").update({ is_active: true }).eq("id", data.id).eq("user_id", userId)
    }
    setSaving(false)
    toast.success("Personal year added")
    setAdding(false)
    setForm({
      year_code: "",
      year_name: "",
      year_number: Math.max(form.year_number + 1, nextYearNumber),
      year_theme: "",
      start_date: "",
      end_date: "",
      is_active: false,
    })
    onRowsChange?.()
  }

  return (
    <SectionCard
      id="personal-year-config"
      icon={Sparkles}
      iconBg="bg-[#F9D57E]/25"
      iconColor="text-[#3C1E38]"
      title="Personal Year (DOMINION)"
      subtitle="Four ~13-week segments — your primary planning lens (above system calendar)"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#3C1E38]/60">
          Configure names, dates, and theme for each segment. Mark one as <strong>active</strong> for the current personal year, or rely on date ranges.
        </p>

        <ul className="space-y-3">
          {rows.map((row) => {
            const st = statusForRow(row, today)
            const isEditing = editingId === row.id
            return (
              <li
                key={row.id}
                className={`rounded-xl border p-4 ${
                  row.is_active || st === "ACTIVE" ? "border-[#F9D57E] bg-[#F9D57E]/8" : "border-[#A7C2D7]/15 bg-white"
                }`}
              >
                {!isEditing ? (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#3C1E38]">
                        Y{row.year_number}: {row.year_name}
                      </p>
                      <p className="text-xs text-[#3C1E38]/50 mt-0.5">{formatRange(row.start_date, row.end_date)}</p>
                      {row.year_theme && <p className="text-[10px] text-[#F9D57E] mt-1">{row.year_theme}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          st === "ACTIVE" || row.is_active
                            ? "bg-[#F9D57E]/50 text-[#3C1E38]"
                            : st === "Completed"
                              ? "bg-[#A7C2D7]/20 text-[#3C1E38]/60"
                              : "bg-[#3C1E38]/5 text-[#3C1E38]/50"
                        }`}
                      >
                        {st === "ACTIVE" || row.is_active ? "ACTIVE" : st}
                      </span>
                      <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => startEdit(row)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {(st === "ACTIVE" || row.is_active) && (
                        <span className="text-[10px] text-[#F9D57E] font-semibold">Gold</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Code</Label>
                        <Input
                          value={form.year_code}
                          onChange={(e) => setForm((p) => ({ ...p, year_code: e.target.value }))}
                          className="border-[#A7C2D7]/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Year #</Label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={form.year_number}
                          onChange={(e) => setForm((p) => ({ ...p, year_number: Number(e.target.value) }))}
                          className="border-[#A7C2D7]/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={form.year_name}
                          onChange={(e) => setForm((p) => ({ ...p, year_name: e.target.value }))}
                          className="border-[#A7C2D7]/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Theme (e.g. DOMINION 2026)</Label>
                        <Input
                          value={form.year_theme}
                          onChange={(e) => setForm((p) => ({ ...p, year_theme: e.target.value }))}
                          className="border-[#A7C2D7]/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start</Label>
                        <Input
                          type="date"
                          value={form.start_date}
                          onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                          className="border-[#A7C2D7]/30 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End</Label>
                        <Input
                          type="date"
                          value={form.end_date}
                          onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                          className="border-[#A7C2D7]/30 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={saving}
                        className="bg-[#F9D57E] text-[#3C1E38]"
                        onClick={() => void handleSaveEdit(row)}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => void setActiveOnly(row.id)}>
                        Set active
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {!adding ? (
          <Button
            type="button"
            variant="outline"
            className="border-[#F9D57E] text-[#3C1E38]"
            onClick={() => {
              setForm({
                year_code: "",
                year_name: "",
                year_number: nextYearNumber,
                year_theme: "",
                start_date: "",
                end_date: "",
                is_active: false,
              })
              setAdding(true)
            }}
          >
            Add Personal Year Cycle
          </Button>
        ) : (
          <div className="rounded-xl border border-[#A7C2D7]/20 p-4 space-y-3 bg-[#FDFCF9]">
            <p className="text-sm font-medium text-[#3C1E38]">New cycle (e.g. after Oct 2026)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Code</Label>
                <Input
                  placeholder="DOMINION-Y5"
                  value={form.year_code}
                  onChange={(e) => setForm((p) => ({ ...p, year_code: e.target.value }))}
                  className="border-[#A7C2D7]/30 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Year #</Label>
                <Input
                  type="number"
                  value={form.year_number || nextYearNumber}
                  onChange={(e) => setForm((p) => ({ ...p, year_number: Number(e.target.value) }))}
                  className="border-[#A7C2D7]/30 text-sm"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Name</Label>
                <Input
                  value={form.year_name}
                  onChange={(e) => setForm((p) => ({ ...p, year_name: e.target.value }))}
                  className="border-[#A7C2D7]/30 text-sm"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Theme</Label>
                <Input
                  value={form.year_theme}
                  onChange={(e) => setForm((p) => ({ ...p, year_theme: e.target.value }))}
                  className="border-[#A7C2D7]/30 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                  className="border-[#A7C2D7]/30 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                  className="border-[#A7C2D7]/30 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Set as active
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={saving} className="bg-[#3C1E38] text-[#F9D57E]" onClick={() => void addCycle()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
