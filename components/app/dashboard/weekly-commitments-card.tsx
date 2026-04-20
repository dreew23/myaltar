"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import {
  BookOpen,
  ChevronRight,
  Flame,
  Minus,
  MoreHorizontal,
  Music,
  Pencil,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import {
  COMMITMENT_TYPES,
  COMMITMENT_TYPE_META,
  DAY_LABELS,
  daysForWeek,
  daysHitTarget,
  logMapByCommitmentAndDate,
  type CommitmentType,
  type WeeklyCommitment,
  type WeeklyCommitmentLog,
} from "@/lib/weekly-commitments"

const ICONS = { Music, ScrollText, BookOpen, Flame, Sparkles } as const

interface Props {
  userId: string
  weekStartStr: string
  todayDateStr: string
  initialCommitments: WeeklyCommitment[]
  initialLogs: WeeklyCommitmentLog[]
  declarations: { id: string; text: string }[]
}

type AddFormState = {
  type: CommitmentType
  title: string
  daily_target: string
  unit: string
  declaration_id: string
}

const EMPTY_ADD_FORM: AddFormState = {
  type: "worship_minutes",
  title: COMMITMENT_TYPE_META.worship_minutes.suggestedTitle,
  daily_target: String(COMMITMENT_TYPE_META.worship_minutes.defaultTarget),
  unit: COMMITMENT_TYPE_META.worship_minutes.defaultUnit,
  declaration_id: "",
}

export function WeeklyCommitmentsCard({
  userId,
  weekStartStr,
  todayDateStr,
  initialCommitments,
  initialLogs,
  declarations,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [commitments, setCommitments] = useState<WeeklyCommitment[]>(initialCommitments)
  const [logs, setLogs] = useState<WeeklyCommitmentLog[]>(initialLogs)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<AddFormState>(EMPTY_ADD_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const days = useMemo(() => daysForWeek(weekStartStr), [weekStartStr])
  const logMap = useMemo(() => logMapByCommitmentAndDate(logs), [logs])

  const handleTypeChange = (type: CommitmentType) => {
    const meta = COMMITMENT_TYPE_META[type]
    setForm((f) => ({
      ...f,
      type,
      title: meta.suggestedTitle || f.title,
      daily_target: String(meta.defaultTarget),
      unit: meta.defaultUnit,
      declaration_id: type === "declaration_reps" ? f.declaration_id : "",
    }))
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(form.daily_target, 10)
    if (!form.title.trim() || !Number.isFinite(target) || target <= 0) return
    const payload = {
      user_id: userId,
      week_start_date: weekStartStr,
      type: form.type,
      title: form.title.trim(),
      daily_target: target,
      unit: form.unit.trim() || COMMITMENT_TYPE_META[form.type].defaultUnit,
      declaration_id:
        form.type === "declaration_reps" && form.declaration_id ? form.declaration_id : null,
      display_order: commitments.length,
    }
    const { data, error } = await supabase
      .from("weekly_commitments")
      .insert(payload)
      .select()
      .single()
    if (error || !data) return
    setCommitments((prev) => [...prev, data as WeeklyCommitment])
    setForm(EMPTY_ADD_FORM)
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    const prev = commitments
    setCommitments((c) => c.filter((x) => x.id !== id))
    setLogs((l) => l.filter((x) => x.commitment_id !== id))
    const { error } = await supabase.from("weekly_commitments").delete().eq("id", id)
    if (error) setCommitments(prev)
  }

  const handleUpdateCommitment = async (id: string, patch: Partial<WeeklyCommitment>) => {
    const prev = commitments
    setCommitments((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    const { error } = await supabase.from("weekly_commitments").update(patch).eq("id", id)
    if (error) setCommitments(prev)
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#A7C2D7]/15">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-playfair text-base font-bold text-[#3C1E38] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F9D57E]" />
            This Week&apos;s Commitments
          </h3>
          <p className="text-xs text-[#3C1E38]/50 mt-0.5">
            Set daily targets; log each day to build the week.
          </p>
        </div>
        {!adding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            className="shrink-0 border-[#A7C2D7]/40 text-[#3C1E38] hover:bg-[#A7C2D7]/10"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        )}
      </div>

      {adding && (
        <AddCommitmentForm
          form={form}
          setForm={setForm}
          onTypeChange={handleTypeChange}
          onSubmit={handleAddSubmit}
          onCancel={() => {
            setForm(EMPTY_ADD_FORM)
            setAdding(false)
          }}
          declarations={declarations}
        />
      )}

      {commitments.length === 0 && !adding ? (
        <div className="rounded-lg border border-dashed border-[#A7C2D7]/30 bg-[#FDFCF9]/60 p-5 text-center">
          <p className="text-sm text-[#3C1E38]/70 font-medium">
            Set 1-3 commitments to build this week.
          </p>
          <p className="text-xs text-[#3C1E38]/50 mt-1">
            e.g. 10 min of worship daily, or declaration reps.
          </p>
          <Button
            size="sm"
            onClick={() => setAdding(true)}
            className="mt-3 bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-[#F9D57E]"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add commitment
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {commitments.map((c) => (
            <CommitmentRow
              key={c.id}
              commitment={c}
              days={days}
              todayDateStr={todayDateStr}
              logMap={logMap}
              setLogs={setLogs}
              supabase={supabase}
              userId={userId}
              editing={editingId === c.id}
              onEditStart={() => setEditingId(c.id)}
              onEditDone={() => setEditingId(null)}
              onUpdate={handleUpdateCommitment}
              onDelete={handleDelete}
              startTransition={startTransition}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function AddCommitmentForm({
  form,
  setForm,
  onTypeChange,
  onSubmit,
  onCancel,
  declarations,
}: {
  form: AddFormState
  setForm: React.Dispatch<React.SetStateAction<AddFormState>>
  onTypeChange: (type: CommitmentType) => void
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  onCancel: () => void
  declarations: { id: string; text: string }[]
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-4 rounded-lg border border-[#A7C2D7]/25 bg-[#FDFCF9]/60 p-4 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-[#3C1E38]/60">Type</Label>
          <Select value={form.type} onValueChange={(v) => onTypeChange(v as CommitmentType)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMITMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {COMMITMENT_TYPE_META[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[#3C1E38]/60">Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. 10 min of worship"
            className="h-9"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[#3C1E38]/60">Daily target</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={form.daily_target}
            onChange={(e) => setForm((f) => ({ ...f, daily_target: e.target.value }))}
            className="h-9"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[#3C1E38]/60">Unit</Label>
          <Input
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="min / reps / times"
            className="h-9"
            required
          />
        </div>
        {form.type === "declaration_reps" && declarations.length > 0 && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-[#3C1E38]/60">Pin a declaration (optional)</Label>
            <Select
              value={form.declaration_id || "none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, declaration_id: v === "none" ? "" : v }))
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select declaration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific declaration</SelectItem>
                {declarations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.text.length > 60 ? `${d.text.slice(0, 60)}...` : d.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="text-[#3C1E38]/60"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-[#F9D57E]"
        >
          Save commitment
        </Button>
      </div>
    </form>
  )
}

function CommitmentRow({
  commitment,
  days,
  todayDateStr,
  logMap,
  setLogs,
  supabase,
  userId,
  editing,
  onEditStart,
  onEditDone,
  onUpdate,
  onDelete,
  startTransition,
}: {
  commitment: WeeklyCommitment
  days: string[]
  todayDateStr: string
  logMap: Map<string, WeeklyCommitmentLog>
  setLogs: React.Dispatch<React.SetStateAction<WeeklyCommitmentLog[]>>
  supabase: ReturnType<typeof createClient>
  userId: string
  editing: boolean
  onEditStart: () => void
  onEditDone: () => void
  onUpdate: (id: string, patch: Partial<WeeklyCommitment>) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  startTransition: React.TransitionStartFunction
}) {
  const meta = COMMITMENT_TYPE_META[commitment.type]
  const Icon = ICONS[meta.icon]
  const step = meta.step
  const hit = daysHitTarget(commitment.id, commitment.daily_target, days, logMap)
  const pct = Math.round((hit / 7) * 100)

  const [editTitle, setEditTitle] = useState(commitment.title)
  const [editTarget, setEditTarget] = useState(String(commitment.daily_target))

  const upsertLog = async (date: string, actual: number) => {
    const clamped = Math.max(0, Math.floor(actual))
    const existing = logMap.get(`${commitment.id}|${date}`)
    const optimistic: WeeklyCommitmentLog = existing
      ? { ...existing, actual: clamped }
      : {
          id: `optimistic-${commitment.id}-${date}`,
          commitment_id: commitment.id,
          user_id: userId,
          date,
          actual: clamped,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.commitment_id === commitment.id && l.date === date)
      if (idx >= 0) {
        const next = prev.slice()
        next[idx] = optimistic
        return next
      }
      return [...prev, optimistic]
    })
    const { data, error } = await supabase
      .from("weekly_commitment_logs")
      .upsert(
        {
          commitment_id: commitment.id,
          user_id: userId,
          date,
          actual: clamped,
        },
        { onConflict: "commitment_id,date" }
      )
      .select()
      .single()
    if (error || !data) return
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.commitment_id === commitment.id && l.date === date)
      const next = prev.slice()
      if (idx >= 0) next[idx] = data as WeeklyCommitmentLog
      else next.push(data as WeeklyCommitmentLog)
      return next
    })
  }

  const saveEdit = () => {
    const target = parseInt(editTarget, 10)
    if (!editTitle.trim() || !Number.isFinite(target) || target <= 0) {
      onEditDone()
      return
    }
    startTransition(() => {
      onUpdate(commitment.id, { title: editTitle.trim(), daily_target: target })
    })
    onEditDone()
  }

  return (
    <li className="rounded-lg border border-[#A7C2D7]/15 bg-[#FDFCF9]/50 p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex items-start gap-2">
          <Icon className="w-4 h-4 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            {editing ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-7 text-sm w-48"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="h-7 text-sm w-20"
                />
                <span className="text-xs text-[#3C1E38]/50">{commitment.unit}/day</span>
                <Button size="sm" className="h-7 px-2" onClick={saveEdit}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => {
                    setEditTitle(commitment.title)
                    setEditTarget(String(commitment.daily_target))
                    onEditDone()
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-[#3C1E38] truncate">{commitment.title}</p>
                <p className="text-[11px] text-[#3C1E38]/50">
                  {commitment.daily_target} {commitment.unit}/day
                  {commitment.declaration_id && (
                    <>
                      {" · "}
                      <a
                        href="/app/declarations"
                        className="text-[#A7C2D7] hover:underline inline-flex items-center"
                      >
                        open declaration <ChevronRight className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-[#3C1E38]/50 tabular-nums">
              {hit}/7 days
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded hover:bg-[#A7C2D7]/10 text-[#3C1E38]/40"
                  aria-label="Commitment menu"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditTitle(commitment.title)
                    setEditTarget(String(commitment.daily_target))
                    onEditStart()
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(commitment.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {days.map((date, i) => {
          const isFuture = date > todayDateStr
          const isToday = date === todayDateStr
          const actual = logMap.get(`${commitment.id}|${date}`)?.actual ?? 0
          const hitToday = actual >= commitment.daily_target
          return (
            <DayCell
              key={date}
              label={DAY_LABELS[i]}
              date={date}
              actual={actual}
              target={commitment.daily_target}
              unit={commitment.unit}
              step={step}
              isFuture={isFuture}
              isToday={isToday}
              hitToday={hitToday}
              onChange={(next) => upsertLog(date, next)}
            />
          )
        })}
      </div>

      <div className="h-1.5 rounded-full bg-[#A7C2D7]/15 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            hit >= 7 ? "bg-emerald-500" : "bg-[#A7C2D7]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  )
}

function DayCell({
  label,
  date,
  actual,
  target,
  unit,
  step,
  isFuture,
  isToday,
  hitToday,
  onChange,
}: {
  label: string
  date: string
  actual: number
  target: number
  unit: string
  step: number
  isFuture: boolean
  isToday: boolean
  hitToday: boolean
  onChange: (next: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(String(actual))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const commit = (value: string) => {
    const n = parseInt(value, 10)
    if (!Number.isFinite(n)) return
    if (n === actual) return
    onChange(Math.max(0, n))
  }

  const scheduleCommit = (value: string) => {
    setDraft(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => commit(value), 400)
  }

  const baseCell =
    "flex flex-col items-center justify-center rounded-md border text-[11px] h-12 transition-colors"

  if (isFuture) {
    return (
      <div
        className={`${baseCell} border-dashed border-[#A7C2D7]/20 text-[#3C1E38]/25 bg-[#FDFCF9]/30`}
        aria-label={`${date} locked`}
      >
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">—</span>
      </div>
    )
  }

  const stateClass = hitToday
    ? "border-emerald-400/60 bg-emerald-50 text-emerald-700"
    : actual > 0
    ? "border-[#F9D57E]/60 bg-[#F9D57E]/10 text-[#B8860B]"
    : "border-[#A7C2D7]/25 bg-white text-[#3C1E38]/55"

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(String(actual))
          setOpen(true)
        }}
        className={`${baseCell} ${stateClass} ${
          isToday ? "ring-1 ring-[#A7C2D7]" : ""
        } hover:border-[#A7C2D7]/50`}
        aria-label={`${date} ${actual} of ${target} ${unit}`}
      >
        <span className="font-medium">{label}</span>
        <span className="tabular-nums font-semibold">{actual}</span>
      </button>
    )
  }

  return (
    <div
      className={`${baseCell} ${stateClass} p-0.5 gap-0.5 ${
        isToday ? "ring-1 ring-[#A7C2D7]" : ""
      }`}
    >
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label="decrement"
          className="p-0.5 rounded hover:bg-black/5 disabled:opacity-40"
          disabled={actual <= 0}
          onClick={() => {
            const next = Math.max(0, actual - step)
            setDraft(String(next))
            onChange(next)
          }}
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={draft}
          onChange={(e) => scheduleCommit(e.target.value)}
          onBlur={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            commit(draft)
            setOpen(false)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (debounceRef.current) clearTimeout(debounceRef.current)
              commit(draft)
              setOpen(false)
            }
            if (e.key === "Escape") {
              setDraft(String(actual))
              setOpen(false)
            }
          }}
          className="w-8 bg-transparent text-center text-[11px] outline-none tabular-nums font-semibold"
          autoFocus
        />
        <button
          type="button"
          aria-label="increment"
          className="p-0.5 rounded hover:bg-black/5"
          onClick={() => {
            const next = actual + step
            setDraft(String(next))
            onChange(next)
          }}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="text-[9px] text-[#3C1E38]/40">{label}</span>
    </div>
  )
}
