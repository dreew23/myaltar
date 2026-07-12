"use client"

import { useEffect, useState } from "react"
import {
  Plus, X, Sparkles, Crown, ExternalLink, ArrowUpRight, CheckCircle2, Circle,
  BookOpen, Flame, Target, RefreshCw, Repeat, Star,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { Sermon, KeyScripture, EntryStatus } from "@/app/app/sermons/sermons-client"

interface Props {
  sermon: Sermon
  userId: string
  open: boolean
  onClose: () => void
  /** Persists changes to Supabase + parent state. */
  onUpdate: (id: string, updates: Partial<Sermon>) => void
}

const PLATFORMS = [
  { value: "koinonia", label: "Koinonia" },
  { value: "ntc", label: "NTC" },
  { value: "other", label: "Other" },
]

const STATUS_STEPS: { value: EntryStatus; label: string; hint: string }[] = [
  { value: "captured", label: "Captured", hint: "The record + notes are in." },
  { value: "processed", label: "Processed", hint: "Revelation & response distilled." },
  { value: "living", label: "Living", hint: "Section 5 items actually deployed." },
]

const inputClass =
  "w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none bg-white"

function SectionHeader({ n, title, icon, subtitle }: { n: number; title: string; icon: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#3C1E38] text-white text-xs font-bold">{n}</span>
      <div>
        <h3 className="font-playfair text-base font-bold text-[#3C1E38] flex items-center gap-2">
          {icon} {title}
        </h3>
        {subtitle && <p className="text-xs text-[#3C1E38]/45 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">{children}</label>
}

export function SermonJournal({ sermon, userId, open, onClose, onUpdate }: Props) {
  const supabase = createClient()
  const [form, setForm] = useState<Sermon>(sermon)

  // Re-seed local state only when switching to a different sermon.
  useEffect(() => {
    setForm(sermon)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sermon.id])

  const set = (patch: Partial<Sermon>) => setForm((f) => ({ ...f, ...patch }))
  const commit = (patch: Partial<Sermon>) => {
    set(patch)
    onUpdate(sermon.id, patch)
  }

  // ── Section 3 list editors ──────────────────────────────────
  const setCorePoint = (i: number, v: string) => {
    const next = [...form.core_points]
    next[i] = v
    set({ core_points: next })
  }
  const commitCorePoints = () => commit({ core_points: form.core_points.map((p) => p).filter((p) => p.trim() !== "") })
  const addCorePoint = () => {
    if (form.core_points.length >= 5) {
      toast("Three to five max — more means transcribing, not distilling.")
      return
    }
    set({ core_points: [...form.core_points, ""] })
  }
  const removeCorePoint = (i: number) => commit({ core_points: form.core_points.filter((_, idx) => idx !== i) })

  const setQuote = (i: number, v: string) => {
    const next = [...form.quotes]
    next[i] = v
    set({ quotes: next })
  }
  const commitQuotes = () => commit({ quotes: form.quotes.filter((q) => q.trim() !== "") })
  const addQuote = () => set({ quotes: [...form.quotes, ""] })
  const removeQuote = (i: number) => commit({ quotes: form.quotes.filter((_, idx) => idx !== i) })

  const setScripture = (i: number, patch: Partial<KeyScripture>) => {
    const next = form.key_scriptures.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    set({ key_scriptures: next })
  }
  const commitScriptures = () =>
    commit({ key_scriptures: form.key_scriptures.filter((s) => s.ref.trim() !== "" || s.angle.trim() !== "") })
  const addScripture = () => set({ key_scriptures: [...form.key_scriptures, { ref: "", angle: "" }] })
  const removeScripture = (i: number) => commit({ key_scriptures: form.key_scriptures.filter((_, idx) => idx !== i) })

  // ── Integrations ────────────────────────────────────────────
  const sendRevelationToDownloads = async () => {
    const content = (form.revelation ?? "").trim()
    if (!content) return toast.error("Write the revelation first.")
    if (form.revelation_download_id) return toast("Already in Divine Downloads.")
    const { data, error } = await supabase
      .from("divine_downloads")
      .insert({ user_id: userId, content, category: "revelation", source: "sermon", linked_sermon_id: sermon.id })
      .select("id")
      .single()
    if (error) return toast.error("Failed — " + error.message)
    commit({ revelation_download_id: data.id as string })
    toast.success("Graduated to Divine Downloads")
  }

  const addToDeclarations = async () => {
    const content = (form.response_declaration ?? "").trim()
    if (!content) return toast.error("Write the declaration first.")
    if (form.response_declaration_id) return toast("Already in your Declarations.")
    const { data: existing } = await supabase
      .from("declarations")
      .select("display_order")
      .eq("user_id", userId)
      .order("display_order", { ascending: false })
      .limit(1)
    const nextOrder = ((existing?.[0]?.display_order as number | undefined) ?? 0) + 1
    const scriptureRef = form.scripture_anchors[0]?.trim() || `Sermon: ${form.title}`
    const { data, error } = await supabase
      .from("declarations")
      .insert({
        user_id: userId,
        display_order: nextOrder,
        area: "purpose",
        content,
        scripture_reference: scriptureRef,
        active: true,
      })
      .select("id")
      .single()
    if (error) return toast.error("Failed — " + error.message)
    commit({ response_declaration_id: data.id as string })
    toast.success("Added to your Declarations")
  }

  const responseComplete =
    !!form.response_conviction?.trim() &&
    !!form.response_declaration?.trim() &&
    !!form.response_prayer_point?.trim() &&
    !!form.response_action?.trim()

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#A7C2D7]/15 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="font-playfair text-lg text-[#3C1E38] pr-8">{form.title || "Sermon Journal"}</DialogTitle>
            <DialogDescription className="sr-only">Structured sermon journal capture</DialogDescription>
          </DialogHeader>

          {/* Status stepper + verdict */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {STATUS_STEPS.map((s) => {
              const active = form.entry_status === s.value
              const disableLiving = s.value === "living" && !responseComplete && form.entry_status !== "living"
              return (
                <button
                  key={s.value}
                  type="button"
                  title={disableLiving ? "Deploy your Section 5 items first" : s.hint}
                  onClick={() => {
                    if (disableLiving) return toast("A sermon is 'Living' only when your Section 5 items are deployed.")
                    commit({ entry_status: s.value })
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    active ? "bg-[#3C1E38] text-white" : "bg-[#A7C2D7]/10 text-[#3C1E38]/55 hover:bg-[#A7C2D7]/20"
                  } ${disableLiving ? "opacity-50" : ""}`}
                >
                  {s.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => commit({ relisten_worthy: !form.relisten_worthy })}
              className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                form.relisten_worthy ? "bg-[#F9D57E]/25 text-[#3C1E38] border border-[#F9D57E]/40" : "bg-[#A7C2D7]/10 text-[#3C1E38]/55"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${form.relisten_worthy ? "fill-[#F9D57E] text-[#F9D57E]" : ""}`} />
              Relisten-worthy
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-8">
          {/* 1 · THE RECORD */}
          <section>
            <SectionHeader n={1} title="The Record" icon={<BookOpen className="w-4 h-4 text-[#A7C2D7]" />} subtitle="Fill in ~30 seconds." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Title</FieldLabel>
                <input className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} onBlur={() => commit({ title: form.title })} />
              </div>
              <div>
                <FieldLabel>Minister</FieldLabel>
                <input className={inputClass} value={form.speaker} onChange={(e) => set({ speaker: e.target.value })} onBlur={() => commit({ speaker: form.speaker })} />
              </div>
              <div>
                <FieldLabel>Platform</FieldLabel>
                <select
                  className={inputClass}
                  value={PLATFORMS.some((p) => p.value === form.platform) ? form.platform ?? "" : form.platform ? "other" : ""}
                  onChange={(e) => commit({ platform: e.target.value || null })}
                >
                  <option value="">—</option>
                  {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Date preached</FieldLabel>
                <input type="date" className={inputClass} value={form.sermon_date ?? ""} onChange={(e) => commit({ sermon_date: e.target.value || null })} />
              </div>
              <div>
                <FieldLabel>Series</FieldLabel>
                <input className={inputClass} value={form.series ?? ""} onChange={(e) => set({ series: e.target.value })} onBlur={() => commit({ series: form.series || null })} />
              </div>
              <div>
                <FieldLabel>Recording link</FieldLabel>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://..." className={inputClass} value={form.source_url ?? ""} onChange={(e) => set({ source_url: e.target.value })} onBlur={() => commit({ source_url: form.source_url || null })} />
                  {form.source_url && (
                    <a href={form.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#A7C2D7]/20 text-[#A7C2D7] hover:bg-[#A7C2D7]/10 flex-shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Scripture anchors (comma-separated)</FieldLabel>
                <input
                  className={inputClass}
                  value={form.scripture_anchors.join(", ")}
                  onChange={(e) => set({ scripture_anchors: e.target.value.split(",").map((s) => s.trimStart()) })}
                  onBlur={() => commit({ scripture_anchors: form.scripture_anchors.map((s) => s.trim()).filter(Boolean) })}
                  placeholder="e.g. John 15:5, Romans 8:28"
                />
              </div>
            </div>
          </section>

          {/* 2 · THE BURDEN */}
          <section className="rounded-xl border border-[#F9D57E]/30 bg-[#F9D57E]/5 p-4">
            <SectionHeader n={2} title="The Burden" icon={<Flame className="w-4 h-4 text-[#F9D57E]" />} subtitle="One sentence: what was the Spirit actually saying? Not the topic — the burden." />
            <textarea
              rows={2}
              className={inputClass + " resize-none"}
              value={form.burden ?? ""}
              onChange={(e) => set({ burden: e.target.value })}
              onBlur={() => commit({ burden: form.burden || null })}
              placeholder="If you can't write this line, you heard content, not a word."
            />
          </section>

          {/* 3 · THE TEACHING */}
          <section>
            <SectionHeader n={3} title="The Teaching" icon={<BookOpen className="w-4 h-4 text-[#A7C2D7]" />} subtitle="Distil, don't transcribe." />

            <FieldLabel>Core points (3–5 max)</FieldLabel>
            <div className="space-y-2 mb-4">
              {form.core_points.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-[#3C1E38]/30 w-4 text-right">{i + 1}</span>
                  <input className={inputClass} value={p} onChange={(e) => setCorePoint(i, e.target.value)} onBlur={commitCorePoints} />
                  <button type="button" onClick={() => removeCorePoint(i)} className="text-[#3C1E38]/30 hover:text-rose-500 flex-shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
              {form.core_points.length < 5 && (
                <button type="button" onClick={addCorePoint} className="flex items-center gap-1 text-xs text-[#A7C2D7] hover:text-[#3C1E38] font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add point
                </button>
              )}
            </div>

            <FieldLabel>Key scriptures (with the minister&apos;s angle)</FieldLabel>
            <div className="space-y-2 mb-4">
              {form.key_scriptures.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input className={inputClass + " sm:w-40 flex-shrink-0"} placeholder="Reference" value={s.ref} onChange={(e) => setScripture(i, { ref: e.target.value })} onBlur={commitScriptures} />
                  <input className={inputClass} placeholder="The specific angle taken" value={s.angle} onChange={(e) => setScripture(i, { angle: e.target.value })} onBlur={commitScriptures} />
                  <button type="button" onClick={() => removeScripture(i)} className="text-[#3C1E38]/30 hover:text-rose-500 flex-shrink-0 mt-2"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addScripture} className="flex items-center gap-1 text-xs text-[#A7C2D7] hover:text-[#3C1E38] font-medium">
                <Plus className="w-3.5 h-3.5" /> Add scripture
              </button>
            </div>

            <FieldLabel>Quotes worth keeping (short, verbatim)</FieldLabel>
            <div className="space-y-2">
              {form.quotes.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#F9D57E] text-lg leading-none flex-shrink-0">&ldquo;</span>
                  <input className={inputClass} value={q} onChange={(e) => setQuote(i, e.target.value)} onBlur={commitQuotes} />
                  <button type="button" onClick={() => removeQuote(i)} className="text-[#3C1E38]/30 hover:text-rose-500 flex-shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addQuote} className="flex items-center gap-1 text-xs text-[#A7C2D7] hover:text-[#3C1E38] font-medium">
                <Plus className="w-3.5 h-3.5" /> Add quote
              </button>
            </div>
          </section>

          {/* 4 · THE REVELATION */}
          <section className="rounded-xl border border-[#A7C2D7]/25 bg-[#A7C2D7]/5 p-4">
            <SectionHeader n={4} title="The Revelation" icon={<Sparkles className="w-4 h-4 text-[#A7C2D7]" />} subtitle="What did I see for the first time? (Information = I knew this. Revelation = I now see this.)" />
            <textarea
              rows={3}
              className={inputClass + " resize-none"}
              value={form.revelation ?? ""}
              onChange={(e) => set({ revelation: e.target.value })}
              onBlur={() => commit({ revelation: form.revelation || null })}
              placeholder="The gold. If empty three sermons running from the same source, that itself is data."
            />
            <div className="mt-2">
              {form.revelation_download_id ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Graduated to Divine Downloads
                </span>
              ) : (
                <Button size="sm" onClick={sendRevelationToDownloads} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-white text-xs">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Send to Divine Downloads
                </Button>
              )}
            </div>
          </section>

          {/* 5 · THE RESPONSE */}
          <section>
            <SectionHeader n={5} title="The Response" icon={<Target className="w-4 h-4 text-emerald-500" />} subtitle="Exactly one of each. Ten takeaways produce zero change; one conviction with a deadline produces one." />
            <div className="space-y-3">
              <div>
                <FieldLabel>One conviction — what must change in me</FieldLabel>
                <input className={inputClass} value={form.response_conviction ?? ""} onChange={(e) => set({ response_conviction: e.target.value })} onBlur={() => commit({ response_conviction: form.response_conviction || null })} />
              </div>
              <div>
                <FieldLabel>One declaration — worded, ready for ALTAR</FieldLabel>
                <div className="flex gap-2">
                  <input className={inputClass} value={form.response_declaration ?? ""} onChange={(e) => set({ response_declaration: e.target.value })} onBlur={() => commit({ response_declaration: form.response_declaration || null })} />
                  {form.response_declaration_id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium whitespace-nowrap self-center px-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <Button size="sm" onClick={addToDeclarations} className="bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-white text-xs whitespace-nowrap flex-shrink-0">
                      <Crown className="w-3.5 h-3.5 mr-1" /> Add to Declarations
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <FieldLabel>One prayer point — for the 3–5 AM watch</FieldLabel>
                <input className={inputClass} value={form.response_prayer_point ?? ""} onChange={(e) => set({ response_prayer_point: e.target.value })} onBlur={() => commit({ response_prayer_point: form.response_prayer_point || null })} />
              </div>
              <div>
                <FieldLabel>One action with a deadline — routed to NEXUS</FieldLabel>
                <input className={inputClass} value={form.response_action ?? ""} onChange={(e) => set({ response_action: e.target.value })} onBlur={() => commit({ response_action: form.response_action || null })} placeholder="The only line that leaves the altar." />
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#3C1E38]/50">Deadline</span>
                    <input type="date" className={inputClass + " w-auto"} value={form.response_action_deadline ?? ""} onChange={(e) => commit({ response_action_deadline: e.target.value || null })} />
                  </div>
                  <button
                    type="button"
                    onClick={() => commit({ response_action_routed: !form.response_action_routed })}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      form.response_action_routed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[#A7C2D7]/10 text-[#3C1E38]/55 hover:bg-[#A7C2D7]/20"
                    }`}
                  >
                    {form.response_action_routed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    Routed to NEXUS
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 6 · THE FORMATION LINK */}
          <section>
            <SectionHeader n={6} title="The Formation Link" icon={<RefreshCw className="w-4 h-4 text-[#A7C2D7]" />} subtitle="How does this connect to the current season — the DOMINION cycle theme, this month's devotional, the fruit you're cultivating?" />
            <textarea
              rows={2}
              className={inputClass + " resize-none"}
              value={form.formation_link ?? ""}
              onChange={(e) => set({ formation_link: e.target.value })}
              onBlur={() => commit({ formation_link: form.formation_link || null })}
              placeholder="A sermon that connects to your season compounds; an orphaned insight evaporates."
            />
          </section>

          {/* 7 · THE RETENTION LOOP */}
          <section>
            <SectionHeader n={7} title="The Retention Loop" icon={<Repeat className="w-4 h-4 text-[#A7C2D7]" />} />
            <button
              type="button"
              onClick={() => commit({ teach_it_test: !form.teach_it_test })}
              className={`flex items-center gap-3 w-full p-3 rounded-lg border text-sm transition-all mb-3 ${
                form.teach_it_test ? "bg-emerald-50 border-emerald-200 text-[#3C1E38]" : "border-[#A7C2D7]/10 text-[#3C1E38]/55 hover:border-[#A7C2D7]/30"
              }`}
            >
              {form.teach_it_test ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-[#3C1E38]/30" />}
              <span className="text-left">Teach-it test: I could teach this in 5 minutes at NTC</span>
            </button>
            <div className="space-y-3">
              <div>
                <FieldLabel>7-day review — did the action happen? Is the conviction still alive?</FieldLabel>
                <input className={inputClass} value={form.seven_day_review ?? ""} onChange={(e) => set({ seven_day_review: e.target.value })} onBlur={() => commit({ seven_day_review: form.seven_day_review || null })} />
              </div>
              <div>
                <FieldLabel>One-line summary for spaced review</FieldLabel>
                <input className={inputClass} value={form.spaced_summary ?? ""} onChange={(e) => set({ spaced_summary: e.target.value })} onBlur={() => commit({ spaced_summary: form.spaced_summary || null })} />
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
