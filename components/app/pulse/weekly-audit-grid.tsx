"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type DayRecord = {
  date: string
  dayLabel: string
  isToday: boolean
  prayer_complete?: boolean
  declarations_complete?: boolean
  gratitude_complete?: boolean
  sermons_today?: number
  energy_score?: number
}

function dayLabel(dateStr: string, isToday: boolean): string {
  if (isToday) return "Today"
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

function rowStatus(day: DayRecord): "complete" | "partial" | "missing" | "today" {
  if (day.isToday) return "today"
  const hasPrayer = day.prayer_complete === true
  const hasDecl = day.declarations_complete === true
  const hasGrat = day.gratitude_complete === true
  const hasSermons = typeof day.sermons_today === "number" && day.sermons_today >= 0
  const hasEnergy = typeof day.energy_score === "number"
  const filled = [hasPrayer, hasDecl, hasGrat, hasSermons, hasEnergy].filter(Boolean).length
  if (filled === 5) return "complete"
  if (filled > 0) return "partial"
  return "missing"
}

interface WeeklyAuditGridProps {
  days: DayRecord[]
  onEditDay: (date: string, data: Partial<DayRecord>) => Promise<void>
  backfillCount: number
  userId: string
}

export function WeeklyAuditGrid({ days, onEditDay, backfillCount, userId }: WeeklyAuditGridProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const completeCount = days.filter((d) => rowStatus(d) === "complete").length
  const needAttention = days.filter((d) => rowStatus(d) === "partial" || rowStatus(d) === "missing" && !d.isToday).length

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#3C1E38]/70">Before you review, make sure your data is complete.</p>
      <div className="rounded-lg border border-[#A7C2D7]/20 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_auto] gap-2 p-3 bg-[#A7C2D7]/10 text-xs font-medium text-[#3C1E38]/70">
          <span>Day</span>
          <span>Prayer</span>
          <span>Decl</span>
          <span>Gratitude</span>
          <span>Sermons</span>
          <span>Energy</span>
          <span>Status</span>
        </div>
        {days.map((day) => (
          <AuditRow
            key={day.date}
            day={day}
            status={rowStatus(day)}
            isEditing={editingDate === day.date}
            onEdit={() => setEditingDate(day.date)}
            onCloseEdit={() => setEditingDate(null)}
            onSave={async (data) => {
              await onEditDay(day.date, data)
              setEditingDate(null)
            }}
          />
        ))}
      </div>
      <p className="text-sm text-[#3C1E38]/70">
        {needAttention === 0 && completeCount === days.filter((d) => !d.isToday).length
          ? "All caught up ✓"
          : `${completeCount} of 7 days complete. ${needAttention} day(s) need attention.`}
      </p>
      {backfillCount > 0 && (
        <p className="text-xs text-[#3C1E38]/50">Backfilled {backfillCount} record(s)</p>
      )}
    </div>
  )
}

function AuditRow({
  day,
  status,
  isEditing,
  onEdit,
  onCloseEdit,
  onSave,
}: {
  day: DayRecord
  status: "complete" | "partial" | "missing" | "today"
  isEditing: boolean
  onEdit: () => void
  onCloseEdit: () => void
  onSave: (data: Partial<DayRecord>) => Promise<void>
}) {
  const [form, setForm] = useState({
    prayer_complete: day.prayer_complete ?? false,
    declarations_complete: day.declarations_complete ?? false,
    gratitude_complete: day.gratitude_complete ?? false,
    sermons_today: day.sermons_today ?? 0,
    energy_score: day.energy_score ?? 5,
  })
  const [saving, setSaving] = useState(false)

  const rowBg =
    status === "complete" ? "bg-emerald-50/50" : status === "partial" ? "bg-amber-50/50" : status === "missing" ? "bg-rose-50/30" : "bg-[#FDFCF9]"

  const StatusIcon = status === "complete" ? CheckCircle2 : status === "partial" ? AlertCircle : status === "missing" ? XCircle : null

  if (isEditing) {
    return (
      <div className={`grid grid-cols-1 p-4 gap-3 ${rowBg} border-t border-[#A7C2D7]/10`}>
        <p className="font-medium text-[#3C1E38]">{dayLabel(day.date, day.isToday)} — Backfill</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.prayer_complete} onChange={(e) => setForm((p) => ({ ...p, prayer_complete: e.target.checked }))} />
            Prayer
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.declarations_complete} onChange={(e) => setForm((p) => ({ ...p, declarations_complete: e.target.checked }))} />
            Declarations
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.gratitude_complete} onChange={(e) => setForm((p) => ({ ...p, gratitude_complete: e.target.checked }))} />
            Gratitude
          </label>
          <label className="text-sm">
            Sermons: <input type="number" min={0} className="w-14 ml-1 border rounded px-2 py-1" value={form.sermons_today} onChange={(e) => setForm((p) => ({ ...p, sermons_today: parseInt(e.target.value, 10) || 0 }))} />
          </label>
          <label className="text-sm">
            Energy (1-10): <input type="number" min={1} max={10} className="w-14 ml-1 border rounded px-2 py-1" value={form.energy_score} onChange={(e) => setForm((p) => ({ ...p, energy_score: Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 5)) }))} />
          </label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setSaving(true); onSave(form).then(() => setSaving(false)) }} disabled={saving} className="px-3 py-1.5 rounded bg-[#A7C2D7]/30 text-sm font-medium">Save</button>
          <button type="button" onClick={onCloseEdit} className="px-3 py-1.5 rounded border text-sm">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_auto] gap-2 p-3 items-center border-t border-[#A7C2D7]/10 text-sm ${rowBg}`}>
      <span className="font-medium text-[#3C1E38]">{dayLabel(day.date, day.isToday)}</span>
      <span>{day.prayer_complete ? "✅" : "—"}</span>
      <span>{day.declarations_complete ? "✅" : "—"}</span>
      <span>{day.gratitude_complete ? "✅" : "—"}</span>
      <span>{typeof day.sermons_today === "number" ? day.sermons_today : "—"}</span>
      <span>{typeof day.energy_score === "number" ? day.energy_score : "—"}</span>
      <div className="flex items-center gap-2">
        {StatusIcon && <StatusIcon className={`w-4 h-4 ${status === "complete" ? "text-emerald-500" : status === "partial" ? "text-amber-500" : "text-rose-400"}`} />}
        <span className="text-xs text-[#3C1E38]/60">
          {status === "today" ? "Today" : status === "complete" ? "Complete" : status === "partial" ? "Partial" : "Not logged"}
        </span>
        {!day.isToday && status !== "complete" && (
          <button type="button" onClick={onEdit} className="text-xs text-[#A7C2D7] font-medium hover:underline">Edit</button>
        )}
      </div>
    </div>
  )
}
