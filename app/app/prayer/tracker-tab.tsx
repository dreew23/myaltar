"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  type PrayerRequest,
} from "@/lib/prayer"

export interface PrayEvent {
  request_id: string
  prayed_date: string
}

interface Props {
  prayerRequests: PrayerRequest[]
  prayEvents: PrayEvent[]
  userId: string
  onRequestsUpdate: (r: PrayerRequest[]) => void
}

const CATEGORY_FILTER = [
  { value: "all", label: "All" },
  ...REQUEST_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
]

function heatmap8(requestId: string, events: PrayEvent[]): number[] {
  const out = Array.from({ length: 8 }, () => 0)
  const monday = new Date()
  monday.setHours(0, 0, 0, 0)
  const dow = monday.getDay()
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1))
  for (let i = 0; i < 8; i++) {
    const ws = new Date(monday)
    ws.setDate(monday.getDate() - (7 * (7 - i)))
    const we = new Date(ws)
    we.setDate(ws.getDate() + 6)
    const wk = ws.toISOString().split("T")[0]!
    const count = events.filter(
      (e) =>
        e.request_id === requestId &&
        new Date(e.prayed_date + "T12:00:00") >= ws &&
        new Date(e.prayed_date + "T12:00:00") <= we
    ).length
    out[i] = Math.min(5, count)
  }
  return out
}

export function TrackerTab({ prayerRequests, prayEvents, userId, onRequestsUpdate }: Props) {
  const [filter, setFilter] = useState<"active" | "answered" | "all">("active")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [editRequest, setEditRequest] = useState<PrayerRequest | null>(null)
  const [form, setForm] = useState({
    request: "",
    category: "" as PrayerRequest["category"] | "",
    scripture_anchor: "",
    priority: "normal" as PrayerRequest["priority"],
  })
  const [answerForm, setAnswerForm] = useState({
    status: "answered" as PrayerRequest["status"],
    date_answered: new Date().toISOString().split("T")[0],
    answer_note: "",
    answer_type: "fulfilled" as string,
    create_testimony: false,
  })

  const supabase = createClient()

  const activeCount = prayerRequests.filter((r) => r.status === "active").length
  const answered = prayerRequests.filter((r) => r.status === "answered")
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const answeredThisMonth = answered.filter(
    (r) => r.date_answered && new Date(r.date_answered) >= monthStart
  ).length
  const testimoniesCount = answered.filter((r) => r.is_testimony).length

  const filtered = useMemo(() => {
    let list =
      filter === "all" ? prayerRequests : prayerRequests.filter((r) => r.status === filter)
    if (catFilter !== "all") {
      list = list.filter((r) => r.category === catFilter)
    }
    return list
  }, [prayerRequests, filter, catFilter])

  const trackRecord = answered.length >= 2 ? [...answered].sort((a, b) => (a.date_answered ?? "").localeCompare(b.date_answered ?? "")) : []

  const handleAdd = async () => {
    if (!form.request.trim()) return
    const { data } = await supabase
      .from("prayer_requests")
      .insert({
        user_id: userId,
        request: form.request.trim(),
        category: form.category || null,
        scripture_anchor: form.scripture_anchor.trim() || null,
        priority: form.priority,
        status: "active",
      })
      .select()
      .single()
    if (data) {
      onRequestsUpdate([data as PrayerRequest, ...prayerRequests])
      setAddOpen(false)
      setForm({ request: "", category: "", scripture_anchor: "", priority: "normal" })
    }
  }

  const prayedToday = async (r: PrayerRequest) => {
    const today = new Date().toISOString().split("T")[0]!
    await supabase.from("prayer_request_pray_events").upsert(
      { user_id: userId, request_id: r.id, prayed_date: today },
      { onConflict: "request_id,prayed_date" }
    )
    const next = (r.prayed_count ?? 0) + 1
    const { data } = await supabase
      .from("prayer_requests")
      .update({ prayed_count: next, last_prayed_at: today })
      .eq("id", r.id)
      .select()
      .single()
    if (data) {
      onRequestsUpdate(prayerRequests.map((x) => (x.id === r.id ? (data as PrayerRequest) : x)))
      router.refresh()
    }
  }

  const handleUpdateStatus = async () => {
    if (!editRequest) return
    const updates: Record<string, unknown> = {
      status: answerForm.status,
      date_answered: answerForm.status === "answered" ? answerForm.date_answered : null,
      answer_note: answerForm.answer_note.trim() || null,
      answer_type: answerForm.answer_type,
      is_testimony: answerForm.create_testimony,
    }
    const { data } = await supabase
      .from("prayer_requests")
      .update(updates)
      .eq("id", editRequest.id)
      .select()
      .single()
    if (data) {
      onRequestsUpdate(prayerRequests.map((r) => (r.id === editRequest.id ? (data as PrayerRequest) : r)))
      if (answerForm.create_testimony && answerForm.status === "answered") {
        await supabase.from("wisdom_entries").insert({
          user_id: userId,
          entry_type: "testimony",
          title: editRequest.request.slice(0, 80),
          content: `Request: ${editRequest.request}\n\nAnswer: ${answerForm.answer_note}`,
          date: new Date().toISOString().split("T")[0],
        })
      }
      setEditRequest(null)
    }
  }

  const deleteRequest = async (id: string) => {
    await supabase.from("prayer_requests").delete().eq("id", id)
    onRequestsUpdate(prayerRequests.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-prayer-display text-2xl font-semibold text-[#2c2419]">Tracker</h1>
          <p className="text-sm text-[#2c2419]/55">Prayer requests & momentum</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="shrink-0 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white hover:opacity-95"
        >
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", v: activeCount },
          { label: "Answered (month)", v: answeredThisMonth },
          { label: "Testimonies", v: testimoniesCount },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-[#f5f2ec] p-4 text-center"
            style={{ borderColor: "var(--prayer-border)" }}
          >
            <p className="font-prayer-display text-2xl text-[#b8860b]">{s.v}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#2c2419]/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["active", "answered", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
              filter === f ? "border-[#b8860b] bg-[#f5f2ec] text-[#b8860b]" : "border-[var(--prayer-border)] bg-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTER.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCatFilter(c.value)}
            className={`rounded-full px-2.5 py-1 text-xs ${
              catFilter === c.value ? "bg-[#b8860b]/20 text-[#b8860b]" : "bg-[#ede9e0] text-[#2c2419]/70"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#2c2419]/50">No requests in this filter.</p>
        ) : (
          filtered.map((r) => {
            const cat = REQUEST_CATEGORIES.find((c) => c.value === r.category)
            const isAnswered = r.status === "answered"
            const border =
              r.priority === "urgent"
                ? "border-l-4 border-[#c0392b]"
                : r.priority === "high"
                  ? "border-l-4 border-[#d35400]"
                  : r.priority === "ongoing"
                    ? "border-l-4 border-[#2471a3]"
                    : "border-l-4 border-[#b8b3a8]"
            const hm = heatmap8(r.id, prayEvents)
            return (
              <div
                key={r.id}
                className={`rounded-xl border border-[var(--prayer-border)] bg-white p-4 ${border} ${isAnswered ? "opacity-[0.65]" : ""}`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {cat && (
                    <span className="rounded-full bg-[#ede9e0] px-2 py-0.5 text-xs text-[#2c2419]">{cat.label}</span>
                  )}
                  {isAnswered && (
                    <span className="rounded-full bg-[#1e8449]/15 px-2 py-0.5 text-xs text-[#1e8449]">Answered</span>
                  )}
                </div>
                <p className="font-prayer-display text-lg font-medium text-[#2c2419]">{r.title || r.request}</p>
                {r.scripture_anchor && (
                  <p className="mt-1 font-prayer-display text-sm italic text-[#b8860b]">{r.scripture_anchor}</p>
                )}
                <p className="mt-2 line-clamp-3 text-sm text-[#2c2419]/75">{r.request}</p>
                <p className="mt-2 text-xs text-[#2c2419]/45">
                  Started {new Date(r.date_started).toLocaleDateString("en-US")} · Prayed {r.prayed_count ?? 0}x
                  {r.last_prayed_at && ` · Last ${new Date(r.last_prayed_at).toLocaleDateString("en-US")}`}
                </p>
                <div className="mt-2 flex gap-0.5">
                  {hm.map((v, i) => (
                    <div
                      key={i}
                      className="h-4 flex-1 rounded-sm"
                      style={{
                        background:
                          v === 0 ? "#ede9e0" : v === 1 ? "#e8d5a3" : v < 4 ? "#d4a017" : "#b8860b",
                      }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === "active" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void prayedToday(r)}
                        className="rounded-lg bg-[#f5f2ec] px-3 py-1.5 text-xs font-medium text-[#b8860b]"
                      >
                        Prayed Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditRequest(r)
                          setAnswerForm({
                            status: "answered",
                            date_answered: new Date().toISOString().split("T")[0]!,
                            answer_note: "",
                            answer_type: "fulfilled",
                            create_testimony: false,
                          })
                        }}
                        className="rounded-lg border border-[var(--prayer-border)] px-3 py-1.5 text-xs"
                      >
                        Mark Answered
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteRequest(r.id)}
                        className="text-xs text-[#c0392b]"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {trackRecord.length > 0 && (
        <div
          className="rounded-2xl border bg-gradient-to-br from-[#f5f2ec] to-[#faf8f4] p-6"
          style={{ borderColor: "var(--prayer-border)" }}
        >
          <h2 className="font-prayer-display text-xl italic text-[#b8860b]">God&apos;s Track Record</h2>
          <p className="mt-1 text-sm text-[#2c2419]/65">
            On dry days, scroll through here and remember — He answers prayer.
          </p>
          <div className="relative mt-6 space-y-6 border-l-2 border-[#d4a017]/40 pl-6">
            {trackRecord.map((r) => (
              <div key={r.id} className="relative">
                <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-[#d4a017]" />
                <p className="text-xs text-[#2c2419]/50">
                  {r.date_answered && new Date(r.date_answered).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </p>
                <p className="font-prayer-display font-semibold text-[#2c2419]">{r.title || r.request}</p>
                {r.answer_note && <p className="mt-2 text-sm text-[#2c2419]/80 whitespace-pre-wrap">{r.answer_note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md border-[#e8e2d6] bg-[#faf8f4]">
          <DialogHeader>
            <DialogTitle className="font-prayer-display">New Prayer Request</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <textarea
              value={form.request}
              onChange={(e) => setForm({ ...form, request: e.target.value })}
              placeholder="What are you asking God for?"
              rows={4}
              className="w-full rounded-lg border border-[#e8e2d6] bg-white p-3 text-sm"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as PrayerRequest["category"] })}
              className="w-full rounded-lg border border-[#e8e2d6] bg-white p-2 text-sm"
            >
              <option value="">Category</option>
              {REQUEST_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              value={form.scripture_anchor}
              onChange={(e) => setForm({ ...form, scripture_anchor: e.target.value })}
              placeholder="Scripture anchor (optional)"
              className="w-full rounded-lg border border-[#e8e2d6] bg-white p-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {REQUEST_PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p.value })}
                  className={`rounded-full px-3 py-1 text-xs ${form.priority === p.value ? "bg-[#b8860b]/20 text-[#b8860b]" : "bg-white"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button
              onClick={() => void handleAdd()}
              disabled={!form.request.trim()}
              className="w-full bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white"
            >
              Save Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRequest} onOpenChange={() => setEditRequest(null)}>
        <DialogContent className="max-w-md border-[#e8e2d6] bg-[#faf8f4]">
          <DialogHeader>
            <DialogTitle className="font-prayer-display">Mark Answered</DialogTitle>
          </DialogHeader>
          {editRequest && (
            <div className="mt-4 space-y-3">
              <select
                value={answerForm.answer_type}
                onChange={(e) => setAnswerForm({ ...answerForm, answer_type: e.target.value })}
                className="w-full rounded-lg border bg-white p-2 text-sm"
              >
                <option value="fulfilled">Yes — fulfilled</option>
                <option value="door_closed">No — door closed</option>
                <option value="not_yet">Not Yet</option>
                <option value="different">Different than expected</option>
                <option value="in_progress">In Progress</option>
              </select>
              <input
                type="date"
                value={answerForm.date_answered}
                onChange={(e) => setAnswerForm({ ...answerForm, date_answered: e.target.value })}
                className="w-full rounded-lg border bg-white p-2 text-sm"
              />
              <textarea
                value={answerForm.answer_note}
                onChange={(e) => setAnswerForm({ ...answerForm, answer_note: e.target.value })}
                placeholder="What happened?"
                rows={4}
                className="w-full rounded-lg border bg-white p-3 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={answerForm.create_testimony}
                  onChange={(e) => setAnswerForm({ ...answerForm, create_testimony: e.target.checked })}
                />
                Flag as testimony
              </label>
              <Button
                onClick={() => void handleUpdateStatus()}
                className="w-full bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white"
              >
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
