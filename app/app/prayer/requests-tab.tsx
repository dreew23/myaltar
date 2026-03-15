"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  type PrayerRequest,
} from "@/lib/prayer"

interface Props {
  prayerRequests: PrayerRequest[]
  userId: string
  onRequestsUpdate: (r: PrayerRequest[]) => void
}

export function RequestsTab({ prayerRequests, onRequestsUpdate }: Props) {
  const [filter, setFilter] = useState<"active" | "answered" | "all">("active")
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
    create_testimony: false,
  })

  const supabase = createClient()

  const activeCount = prayerRequests.filter((r) => r.status === "active").length
  const urgentCount = prayerRequests.filter((r) => r.priority === "urgent" && r.status === "active").length
  const answeredCount = prayerRequests.filter((r) => r.status === "answered").length

  const filtered = filter === "all"
    ? prayerRequests
    : prayerRequests.filter((r) => r.status === filter)

  const daysPraying = (dateStarted: string) => {
    const start = new Date(dateStarted).getTime()
    return Math.floor((Date.now() - start) / 86400000)
  }

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
      onRequestsUpdate([data, ...prayerRequests])
      setAddOpen(false)
      setForm({ request: "", category: "", scripture_anchor: "", priority: "normal" })
    }
  }

  const handleUpdateStatus = async () => {
    if (!editRequest) return
    const updates: Partial<PrayerRequest> = {
      status: answerForm.status,
      date_answered: answerForm.status === "answered" ? answerForm.date_answered : null,
      answer_note: answerForm.answer_note.trim() || null,
    }
    const { data } = await supabase
      .from("prayer_requests")
      .update(updates)
      .eq("id", editRequest.id)
      .select()
      .single()
    if (data) {
      onRequestsUpdate(prayerRequests.map((r) => (r.id === editRequest.id ? data : r)))
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
      setAnswerForm({ status: "answered", date_answered: new Date().toISOString().split("T")[0], answer_note: "", create_testimony: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Prayer Requests</h1>
          <p className="text-[#3C1E38]/50 text-sm mt-1">What I&apos;m believing God for</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
          <p className="text-2xl font-bold text-[#3C1E38]">{activeCount}</p>
          <p className="text-xs text-[#3C1E38]/50">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
          <p className="text-2xl font-bold text-[#3C1E38]">{urgentCount}</p>
          <p className="text-xs text-[#3C1E38]/50">Urgent</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
          <p className="text-2xl font-bold text-[#3C1E38]">{answeredCount}</p>
          <p className="text-xs text-[#3C1E38]/50">Answered</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
          <p className="text-2xl font-bold text-[#3C1E38]">{prayerRequests.length}</p>
          <p className="text-xs text-[#3C1E38]/50">Total</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["active", "answered", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize ${filter === f ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-[#3C1E38]/50 text-sm">No requests in this filter</p>
        ) : (
          filtered.map((r) => {
            const cat = REQUEST_CATEGORIES.find((c) => c.value === r.category)
            const isAnswered = r.status === "answered"
            const borderClass = isAnswered
              ? "border-l-4 border-emerald-500"
              : r.priority === "urgent"
              ? "border-l-4 border-rose-500"
              : r.priority === "high"
              ? "border-l-4 border-amber-500"
              : r.priority === "ongoing"
              ? "border-l-4 border-[#A7C2D7]"
              : ""
            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl p-4 border border-[#A7C2D7]/10 ${borderClass}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {r.priority === "urgent" && <span className="text-rose-500 text-sm">🔴</span>}
                  {r.priority === "high" && <span className="text-amber-500 text-sm">🟡</span>}
                  {r.priority === "ongoing" && <span className="text-[#A7C2D7] text-sm">🔵</span>}
                  {cat && <span className="text-xs px-2 py-0.5 rounded-full bg-[#A7C2D7]/20 text-[#3C1E38]">{cat.label}</span>}
                  {isAnswered && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Answered!</span>}
                </div>
                <p className="font-medium text-[#3C1E38]">{r.request}</p>
                {r.scripture_anchor && <p className="text-sm text-[#A7C2D7] mt-1">{r.scripture_anchor}</p>}
                <p className="text-xs text-[#3C1E38]/50 mt-2">
                  Praying since {new Date(r.date_started).toLocaleDateString("en-US")} · {daysPraying(r.date_started)} days
                </p>
                {isAnswered && r.date_answered && (
                  <p className="text-xs text-emerald-600 mt-1">Answered {new Date(r.date_answered).toLocaleDateString("en-US")}</p>
                )}
                {isAnswered && r.answer_note && (
                  <p className="text-sm text-[#3C1E38]/70 mt-2">{r.answer_note}</p>
                )}
                {r.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-[#A7C2D7]/30"
                    onClick={() => {
                      setEditRequest(r)
                      setAnswerForm({
                        status: "answered",
                        date_answered: new Date().toISOString().split("T")[0],
                        answer_note: "",
                        create_testimony: false,
                      })
                    }}
                  >
                    Mark Answered / Update
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add request modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair">New Prayer Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">What are you asking God for?</label>
              <textarea
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
                placeholder="Your request..."
                rows={3}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg resize-y"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PrayerRequest["category"] })}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg"
              >
                <option value="">—</option>
                {REQUEST_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Scripture anchor (optional)</label>
              <input
                type="text"
                value={form.scripture_anchor}
                onChange={(e) => setForm({ ...form, scripture_anchor: e.target.value })}
                placeholder="A verse you're standing on"
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-2">Priority</label>
              <div className="flex flex-wrap gap-2">
                {REQUEST_PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`px-3 py-1.5 rounded-full text-sm ${form.priority === p.value ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!form.request.trim()} className="w-full bg-[#F9D57E] text-[#3C1E38]">
              Save Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update status / answer modal */}
      <Dialog open={!!editRequest} onOpenChange={() => setEditRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair">Update Request</DialogTitle>
          </DialogHeader>
          {editRequest && (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-[#3C1E38]/80">{editRequest.request}</p>
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/80 block mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(["answered", "redirected", "released"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setAnswerForm({ ...answerForm, status: s })}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize ${answerForm.status === s ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {answerForm.status === "answered" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Date answered</label>
                    <input
                      type="date"
                      value={answerForm.date_answered}
                      onChange={(e) => setAnswerForm({ ...answerForm, date_answered: e.target.value })}
                      className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">How did God answer?</label>
                    <textarea
                      value={answerForm.answer_note}
                      onChange={(e) => setAnswerForm({ ...answerForm, answer_note: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg resize-y"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#3C1E38]/80">
                    <input
                      type="checkbox"
                      checked={answerForm.create_testimony}
                      onChange={(e) => setAnswerForm({ ...answerForm, create_testimony: e.target.checked })}
                    />
                    Create Testimony in Wisdom Log
                  </label>
                </>
              )}
              <Button onClick={handleUpdateStatus} className="w-full bg-[#F9D57E] text-[#3C1E38]">
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
