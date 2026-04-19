"use client"

import { useState, useMemo } from "react"
import { Plus, Heart, Sparkles, X, Users, Check, Church, Briefcase, Building2, Globe, Baby, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { intercessionRotation } from "@/lib/data/dominion"

export interface Prayer {
  id: string
  title: string
  description: string | null
  prayer_type: string
  status: string
  answer_notes: string | null
  created_at: string
}

interface Props {
  prayers: Prayer[]
  userId: string
  todayIntercession: { theme: string; focus: string[] }
}

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Day-specific card styling (previous card look — white text on colored background)
const DAY_CARD_STYLE: Record<number, { color: string; icon: typeof Users }> = {
  0: { color: "bg-[#F9D57E]", icon: Church },
  1: { color: "bg-[#A7C2D7]", icon: Users },
  2: { color: "bg-emerald-500", icon: Briefcase },
  3: { color: "bg-purple-500", icon: Building2 },
  4: { color: "bg-rose-500", icon: Globe },
  5: { color: "bg-orange-500", icon: Baby },
  6: { color: "bg-[#3C1E38]", icon: Shield },
}

export function PrayersClient({ prayers: initialPrayers, userId, todayIntercession }: Props) {
  const [prayers, setPrayers] = useState(initialPrayers)
  const [showModal, setShowModal] = useState(false)
  const [showAnsweredModal, setShowAnsweredModal] = useState<Prayer | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "answered">("active")
  const [form, setForm] = useState({ title: "", description: "", prayer_type: "intercession" })
  const [answerNotes, setAnswerNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const dayOfWeek = useMemo(() => new Date().getDay(), [])
  const todayLabel = DAY_LABELS[dayOfWeek]

  const filteredPrayers = prayers.filter((p) => {
    if (filter === "active") return p.status === "active"
    if (filter === "answered") return p.status === "answered"
    return true
  })

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("prayers").insert({
      user_id: userId,
      title: form.title,
      description: form.description || null,
      prayer_type: form.prayer_type,
      status: "active",
    }).select().single()

    if (!error && data) {
      setPrayers([data, ...prayers])
      setForm({ title: "", description: "", prayer_type: "intercession" })
      setShowModal(false)
    }
    setSaving(false)
  }

  const markAnswered = async () => {
    if (!showAnsweredModal) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from("prayers").update({ status: "answered", answer_notes: answerNotes || null }).eq("id", showAnsweredModal.id)
    setPrayers(prayers.map((p) => (p.id === showAnsweredModal.id ? { ...p, status: "answered", answer_notes: answerNotes } : p)))
    setShowAnsweredModal(null)
    setAnswerNotes("")
    setSaving(false)
  }

  const deletePrayer = async (id: string) => {
    const supabase = createClient()
    await supabase.from("prayers").delete().eq("id", id)
    setPrayers(prayers.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Today's Intercession Focus — previous card view (dominion data, day styling) */}
      <div className={`${DAY_CARD_STYLE[dayOfWeek].color} rounded-2xl p-6 mb-6 text-white`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {(() => {
              const Icon = DAY_CARD_STYLE[dayOfWeek].icon
              return <Icon className="w-7 h-7" />
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-medium">{todayLabel}'s Intercession Focus</p>
            <h2 className="text-2xl font-bold mt-1">{todayIntercession.theme}</h2>
            <p className="text-white/90 mt-2 text-sm leading-relaxed">
              {todayIntercession.focus.join(" · ")}
            </p>
          </div>
        </div>
        {/* Weekly Preview — day labels + icons */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-[10px] text-white/60 uppercase tracking-wide mb-2">Days</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {([0, 1, 2, 3, 4, 5, 6] as const).map((d) => {
              const Icon = DAY_CARD_STYLE[d].icon
              const isToday = d === dayOfWeek
              return (
                <div
                  key={d}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-center transition-all ${isToday ? "bg-white/30" : "bg-white/10 hover:bg-white/15"}`}
                >
                  <p className="text-[10px] text-white/70 mb-1">{DAY_LABELS[d].slice(0, 3)}</p>
                  <Icon className="w-4 h-4 mx-auto text-white/90" />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Intercession Journal</h1>
          <p className="text-sm text-[#3C1E38]/50 mt-1">Track prayers and testimonies of answered prayer</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
          <Plus className="w-4 h-4 mr-2" /> Add Prayer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "answered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-[#F9D57E]/15 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:bg-[#F9D57E]/5"}`}
          >
            {f === "answered" ? "Testimonies" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Prayer Grid */}
      {filteredPrayers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
          <Heart className="w-12 h-12 text-[#F9D57E]/30 mx-auto mb-3" />
          <p className="text-[#3C1E38]/50">No prayers found</p>
          <Button onClick={() => setShowModal(true)} variant="outline" className="mt-4 border-[#F9D57E]/30">
            <Plus className="w-4 h-4 mr-2" /> Add your first prayer
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPrayers.map((prayer) => (
            <div key={prayer.id} className={`bg-white rounded-xl p-5 border border-[#A7C2D7]/10 ${prayer.status === "answered" ? "ring-2 ring-[#F9D57E]/30" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${prayer.status === "answered" ? "text-[#F9D57E] fill-[#F9D57E]" : "text-[#A7C2D7]"}`} />
                  <span className="text-xs text-[#3C1E38]/40 capitalize">{prayer.prayer_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  {prayer.status === "answered" && <Sparkles className="w-4 h-4 text-[#F9D57E]" />}
                  <button onClick={() => deletePrayer(prayer.id)} className="text-[#3C1E38]/30 hover:text-red-500 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-[#3C1E38] mb-2">{prayer.title}</h3>
              {prayer.description && <p className="text-sm text-[#3C1E38]/50 mb-3">{prayer.description}</p>}
              {prayer.answer_notes && (
                <div className="bg-[#F9D57E]/10 rounded-lg p-3 mb-3">
                  <p className="text-xs text-[#3C1E38]/60 font-medium mb-1">Testimony:</p>
                  <p className="text-sm text-[#3C1E38]/80">{prayer.answer_notes}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#3C1E38]/30">
                  {new Date(prayer.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {prayer.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAnsweredModal(prayer)}
                    className="text-xs border-[#F9D57E]/30 text-[#F9D57E] hover:bg-[#F9D57E]/10"
                  >
                    <Check className="w-3 h-3 mr-1" /> Answered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair">Add Prayer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Prayer Request</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`e.g., Pray for ${todayIntercession.theme.toLowerCase()}`}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Details (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving || !form.title.trim()} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
                {saving ? "Adding..." : "Add Prayer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark Answered Modal */}
      <Dialog open={!!showAnsweredModal} onOpenChange={() => setShowAnsweredModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F9D57E]" /> Record Testimony
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-[#3C1E38]/70">How did God answer this prayer? Your testimony builds faith.</p>
            <textarea
              value={answerNotes}
              onChange={(e) => setAnswerNotes(e.target.value)}
              rows={4}
              placeholder="Describe what God did..."
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAnsweredModal(null)}>Cancel</Button>
              <Button onClick={markAnswered} disabled={saving} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
                {saving ? "Saving..." : "Save Testimony"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
