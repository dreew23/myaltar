"use client"

import { useState, useMemo } from "react"
import {
  Zap, Sparkles, Eye, Shield, Compass, Flame, Headphones, Calendar,
  BookOpen, MoreHorizontal, ChevronDown, ChevronRight, Check, X,
  Trash2, Link2, Share2, Award, AlertCircle, Filter, Plus, Lightbulb,
  Globe, Lock, PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { prayerAreas } from "@/lib/data/dominion"

// ─── Types ───────────────────────────────────────────────────
type Category = "action_required" | "revelation" | "promise" | "warning" | "direction"
type Source = "prayer" | "sermon" | "life_event" | "scripture" | "other"

interface Download {
  id: string
  user_id: string
  content: string
  category: Category
  source: Source
  life_areas: string[]
  action_taken: boolean
  action_note: string | null
  became_testimony: boolean
  testimony_note: string | null
  shareable: boolean
  linked_sermon_id: string | null
  created_at: string
}

interface Insight {
  id: string
  user_id: string
  content: string
  source: Source | null
  shareable: boolean
  format_tag: string | null
  created_at: string
}

interface SermonRef {
  id: string
  title: string
}

interface Props {
  downloads: Download[]
  insights: Insight[]
  recentSermons: SermonRef[]
  userId: string
}

// ─── Constants ───────────────────────────────────────────────
const CATEGORIES: { key: Category; label: string; icon: typeof Zap; color: string; bg: string }[] = [
  { key: "action_required", label: "Action Required", icon: Zap, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  { key: "revelation", label: "Revelation", icon: Eye, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { key: "promise", label: "Promise", icon: Sparkles, color: "text-[#F9D57E]", bg: "bg-amber-50 border-amber-200" },
  { key: "warning", label: "Warning", icon: Shield, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { key: "direction", label: "Direction", icon: Compass, color: "text-[#A7C2D7]", bg: "bg-sky-50 border-sky-200" },
]

const SOURCES: { key: Source; label: string; icon: typeof Flame }[] = [
  { key: "prayer", label: "Prayer", icon: Flame },
  { key: "sermon", label: "Sermon", icon: Headphones },
  { key: "life_event", label: "Life Event", icon: Calendar },
  { key: "scripture", label: "Scripture", icon: BookOpen },
  { key: "other", label: "Other", icon: MoreHorizontal },
]

const LIFE_AREAS = prayerAreas // 10 areas from dominion.ts

type FilterKey = "all" | "needs_action" | "testimonies" | "shareable" | string

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_action", label: "Needs Action" },
  { key: "testimonies", label: "Testimonies" },
  { key: "shareable", label: "Shareable" },
]

const FORMAT_TAGS = ["Reflection", "Meditation", "Vision", "Lesson", "Observation", "Poem/Prayer"]

// ─── Helpers ─────────────────────────────────────────────────
function relativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getCatConfig(cat: Category) {
  return CATEGORIES.find((c) => c.key === cat) ?? CATEGORIES[0]
}

function getSourceConfig(src: Source) {
  return SOURCES.find((s) => s.key === src) ?? SOURCES[4]
}

// ─── Shared Quick Capture Form (used in page + FAB modal) ───
export function QuickCaptureForm({ userId, onSaved }: { userId: string; onSaved: (d: Download) => void }) {
  const supabase = createClient()
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<Category | null>(null)
  const [source, setSource] = useState<Source | null>(null)
  const [lifeAreas, setLifeAreas] = useState<string[]>([])
  const [showAreas, setShowAreas] = useState(false)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const toggleArea = (area: string) => {
    setLifeAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area])
  }

  const canSubmit = content.trim().length > 0 && !!category && !!source

  const submit = async () => {
    setAttempted(true)
    if (!canSubmit) return
    setSaving(true)
    const payload = {
      user_id: userId,
      content: content.trim(),
      category: category!,
      source: source!,
      life_areas: lifeAreas,
    }
    const { data, error } = await supabase.from("divine_downloads").insert(payload).select().single()
    if (error) {
      toast.error("Failed to save — " + error.message)
      setSaving(false)
      return
    }
    // Use returned data if available, otherwise build optimistic entry
    const entry: Download = data ? (data as Download) : {
      id: crypto.randomUUID(),
      ...payload,
      action_taken: false,
      action_note: null,
      became_testimony: false,
      testimony_note: null,
      shareable: false,
      linked_sermon_id: null,
      created_at: new Date().toISOString(),
    }
    onSaved(entry)
    setContent("")
    setCategory(null)
    setSource(null)
    setLifeAreas([])
    setShowAreas(false)
    setAttempted(false)
    setFlash(true)
    setTimeout(() => setFlash(false), 1200)
    toast.success("Download captured ✦")
    setSaving(false)
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all ${flash ? "bg-emerald-50 border-emerald-300" : "bg-white border-[#A7C2D7]/15"}`}>
      {flash && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <Check className="w-4 h-4" /> Captured! The Spirit's word is stored.
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="What did the Spirit reveal?"
        className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none placeholder:text-[#3C1E38]/30 font-inter"
      />

      {/* Category chips */}
      <div>
        <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${attempted && !category ? "text-rose-500" : "text-[#3C1E38]/40"}`}>Category <span className="text-rose-400">*</span></p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const selected = category === c.key
            return (
              <button
                key={c.key}
                onClick={() => setCategory(selected ? null : c.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? `${c.bg} ${c.color}` : "border-[#A7C2D7]/15 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}
              >
                <c.icon className="w-3.5 h-3.5" /> {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Source chips */}
      <div>
        <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 ${attempted && !source ? "text-rose-500" : "text-[#3C1E38]/40"}`}>Source <span className="text-rose-400">*</span></p>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => {
            const selected = source === s.key
            return (
              <button
                key={s.key}
                onClick={() => setSource(selected ? null : s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? "bg-[#A7C2D7]/15 border-[#A7C2D7]/40 text-[#3C1E38]" : "border-[#A7C2D7]/15 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Life Areas (optional) */}
      <div>
        <button onClick={() => setShowAreas(!showAreas)} className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide flex items-center gap-1 hover:text-[#3C1E38]/60">
          Life Areas (optional) {showAreas ? "▾" : "▸"} {lifeAreas.length > 0 && <span className="text-[#A7C2D7]">({lifeAreas.length})</span>}
        </button>
        {showAreas && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {LIFE_AREAS.map((area) => {
              const selected = lifeAreas.includes(area)
              return (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${selected ? "bg-[#F9D57E]/20 border-[#F9D57E]/50 text-[#3C1E38]" : "border-[#A7C2D7]/15 text-[#3C1E38]/40 hover:border-[#A7C2D7]/30"}`}
                >
                  {area}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Validation hint */}
      {attempted && !canSubmit && (
        <p className="text-xs text-rose-500">
          {!content.trim() ? "Type what the Spirit revealed" : !category ? "Pick a category above" : "Pick a source above"}
        </p>
      )}

      {/* Submit */}
      <Button
        onClick={submit}
        disabled={saving}
        className={`w-full font-medium ${canSubmit ? "bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]" : "bg-[#A7C2D7]/20 text-[#3C1E38]/40 hover:bg-[#A7C2D7]/30"}`}
      >
        {saving ? "Saving..." : "Capture ✦"}
      </Button>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export function DownloadsClient({ downloads: initial, insights: initialInsights, recentSermons, userId }: Props) {
  const supabase = createClient()
  const [downloads, setDownloads] = useState<Download[]>(initial)
  const [insights, setInsights] = useState<Insight[]>(initialInsights)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [areaFilter, setAreaFilter] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Insight form
  const [insightContent, setInsightContent] = useState("")
  const [insightSource, setInsightSource] = useState<Source | null>(null)
  const [insightFormat, setInsightFormat] = useState<string | null>(null)
  const [insightShareable, setInsightShareable] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: "download" | "insight"; id: string } | null>(null)

  // ─── Stats ─────────────────────────────────────────────────
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const downloadsThisMonth = downloads.filter((d) => new Date(d.created_at) >= monthStart).length
  const monthTarget = 10
  const monthColor = downloadsThisMonth >= monthTarget ? "text-emerald-600" : downloadsThisMonth >= 5 ? "text-[#F9D57E]" : "text-rose-500"

  const shareableInsights = insights.filter((i) => i.shareable).length

  // ─── Filtered downloads ────────────────────────────────────
  const filtered = useMemo(() => {
    let list = downloads
    if (filter === "needs_action") list = list.filter((d) => d.category === "action_required" && !d.action_taken)
    else if (filter === "testimonies") list = list.filter((d) => d.became_testimony)
    else if (filter === "shareable") list = list.filter((d) => d.shareable)
    if (areaFilter) list = list.filter((d) => d.life_areas.includes(areaFilter))
    return list
  }, [downloads, filter, areaFilter])

  // ─── Download CRUD ─────────────────────────────────────────
  const updateDownload = async (id: string, fields: Partial<Download>) => {
    setSaving(true)
    await supabase.from("divine_downloads").update(fields).eq("id", id)
    setDownloads((prev) => prev.map((d) => d.id === id ? { ...d, ...fields } : d))
    setSaving(false)
  }

  const deleteDownload = async (id: string) => {
    await supabase.from("divine_downloads").delete().eq("id", id)
    setDownloads((prev) => prev.filter((d) => d.id !== id))
    setDeleteTarget(null)
    toast.success("Download removed")
  }

  // ─── Insight CRUD ──────────────────────────────────────────
  const submitInsight = async () => {
    if (!insightContent.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from("spiritual_insights").insert({
      user_id: userId,
      content: insightContent.trim(),
      source: insightSource,
      shareable: insightShareable,
      format_tag: insightFormat,
    }).select().single()
    if (!error && data) {
      setInsights((prev) => [data as Insight, ...prev])
      setInsightContent("")
      setInsightSource(null)
      setInsightFormat(null)
      setInsightShareable(false)
      toast.success("Insight recorded")
    }
    setSaving(false)
  }

  const deleteInsight = async (id: string) => {
    await supabase.from("spiritual_insights").delete().eq("id", id)
    setInsights((prev) => prev.filter((i) => i.id !== id))
    setDeleteTarget(null)
    toast.success("Insight removed")
  }

  const toggleInsightShareable = async (id: string, val: boolean) => {
    await supabase.from("spiritual_insights").update({ shareable: val }).eq("id", id)
    setInsights((prev) => prev.map((i) => i.id === id ? { ...i, shareable: val } : i))
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Divine Downloads</h1>
        <p className="text-sm text-[#3C1E38]/50 mt-1">Quick-capture spiritual insights & revelations</p>
      </div>

      <Tabs defaultValue="downloads">
        <TabsList className="mb-6 bg-[#A7C2D7]/10">
          <TabsTrigger value="downloads">Divine Downloads</TabsTrigger>
          <TabsTrigger value="insights">Spiritual Insights</TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB 1: DIVINE DOWNLOADS ═══════════════ */}
        <TabsContent value="downloads">
          {/* Monthly counter */}
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${monthColor}`} />
            <p className="text-sm text-[#3C1E38]/60">
              <span className={`font-bold ${monthColor}`}>{downloadsThisMonth}</span> downloads this month
              <span className="text-[#3C1E38]/30"> (target: {monthTarget}+)</span>
            </p>
          </div>

          {/* Quick capture */}
          <div className="mb-6">
            <QuickCaptureForm userId={userId} onSaved={(d) => setDownloads((prev) => [d, ...prev])} />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Filter className="w-3.5 h-3.5 text-[#3C1E38]/30" />
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setAreaFilter(null) }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === f.key && !areaFilter ? "bg-[#3C1E38] text-white border-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/50 hover:border-[#A7C2D7]/40"}`}
              >
                {f.label}
                {f.key === "needs_action" && (() => {
                  const count = downloads.filter((d) => d.category === "action_required" && !d.action_taken).length
                  return count > 0 ? ` (${count})` : ""
                })()}
              </button>
            ))}
            {/* Life Area dropdown */}
            <div className="relative group">
              <button className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${areaFilter ? "bg-[#3C1E38] text-white border-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/50 hover:border-[#A7C2D7]/40"}`}>
                {areaFilter ? `📍 ${areaFilter}` : "By Life Area"}
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg border border-[#A7C2D7]/15 shadow-lg p-1.5 hidden group-hover:block z-10">
                {areaFilter && (
                  <button onClick={() => setAreaFilter(null)} className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 rounded">Clear filter</button>
                )}
                {LIFE_AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => { setAreaFilter(area); setFilter("all") }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-[#FDFCF9] ${areaFilter === area ? "font-medium text-[#3C1E38]" : "text-[#3C1E38]/60"}`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Downloads list */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#3C1E38]/30">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {filter === "all" && !areaFilter ? "No downloads yet — capture your first insight above" : "No downloads match this filter"}
                </p>
              </div>
            )}

            {filtered.map((dl) => {
              const cat = getCatConfig(dl.category)
              const src = getSourceConfig(dl.source)
              const isExpanded = expanded === dl.id

              return (
                <div key={dl.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${isExpanded ? "border-[#A7C2D7]/30 shadow-md" : "border-[#A7C2D7]/10"}`}>
                  {/* Card header */}
                  <button onClick={() => setExpanded(isExpanded ? null : dl.id)} className="w-full text-left p-4 hover:bg-[#FDFCF9] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.bg} border`}>
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#3C1E38] leading-relaxed">{dl.content}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cat.bg} ${cat.color}`}>{cat.label}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#A7C2D7]/10 text-[#3C1E38]/50 border border-[#A7C2D7]/15">
                            <src.icon className="w-3 h-3 inline mr-0.5 -mt-0.5" /> {src.label}
                          </span>
                          {dl.life_areas.map((area) => (
                            <span key={area} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F9D57E]/10 text-[#3C1E38]/40 border border-[#F9D57E]/20">{area}</span>
                          ))}
                          {dl.action_taken && <span className="text-[10px] text-emerald-600">✅ Acted</span>}
                          {dl.became_testimony && <span className="text-[10px] text-purple-600">🏆 Testimony</span>}
                          {dl.shareable && <Share2 className="w-3 h-3 text-[#A7C2D7]" />}
                          <span className="text-[10px] text-[#3C1E38]/25 ml-auto flex-shrink-0">{relativeDate(dl.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-[#3C1E38]/25" /> : <ChevronRight className="w-4 h-4 text-[#3C1E38]/25" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#A7C2D7]/10 space-y-3">
                      {/* Action Taken */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => updateDownload(dl.id, { action_taken: !dl.action_taken })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${dl.action_taken ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-[#A7C2D7]/15 text-[#3C1E38]/50 hover:border-emerald-200"}`}
                        >
                          <Check className="w-3.5 h-3.5" /> Action Taken
                        </button>
                        {dl.action_taken && (
                          <input
                            type="text"
                            defaultValue={dl.action_note ?? ""}
                            onBlur={(e) => updateDownload(dl.id, { action_note: e.target.value || null })}
                            placeholder="What action did you take?"
                            className="flex-1 px-3 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#A7C2D7]/20"
                          />
                        )}
                      </div>

                      {/* Became Testimony */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => updateDownload(dl.id, { became_testimony: !dl.became_testimony })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${dl.became_testimony ? "bg-purple-50 border-purple-200 text-purple-700" : "border-[#A7C2D7]/15 text-[#3C1E38]/50 hover:border-purple-200"}`}
                        >
                          <Award className="w-3.5 h-3.5" /> Became Testimony
                        </button>
                        {dl.became_testimony && (
                          <input
                            type="text"
                            defaultValue={dl.testimony_note ?? ""}
                            onBlur={(e) => updateDownload(dl.id, { testimony_note: e.target.value || null })}
                            placeholder="What happened? How did God show up?"
                            className="flex-1 px-3 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#A7C2D7]/20"
                          />
                        )}
                      </div>

                      {/* Shareable + Link to Sermon + Delete */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => updateDownload(dl.id, { shareable: !dl.shareable })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${dl.shareable ? "bg-sky-50 border-sky-200 text-sky-700" : "border-[#A7C2D7]/15 text-[#3C1E38]/50 hover:border-sky-200"}`}
                        >
                          <Share2 className="w-3.5 h-3.5" /> {dl.shareable ? "Shareable" : "Mark Shareable"}
                        </button>

                        {dl.source === "sermon" && (
                          <div className="relative group/sermon">
                            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${dl.linked_sermon_id ? "bg-[#A7C2D7]/10 border-[#A7C2D7]/30 text-[#3C1E38]" : "border-[#A7C2D7]/15 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}>
                              <Link2 className="w-3.5 h-3.5" /> {dl.linked_sermon_id ? "Linked" : "Link Sermon"}
                            </button>
                            <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-white rounded-lg border border-[#A7C2D7]/15 shadow-lg p-1.5 hidden group-hover/sermon:block z-10">
                              {dl.linked_sermon_id && (
                                <button onClick={() => updateDownload(dl.id, { linked_sermon_id: null })} className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 rounded">Unlink</button>
                              )}
                              {recentSermons.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => updateDownload(dl.id, { linked_sermon_id: s.id })}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-[#FDFCF9] truncate ${dl.linked_sermon_id === s.id ? "font-medium text-[#3C1E38]" : "text-[#3C1E38]/60"}`}
                                >
                                  {s.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => setDeleteTarget({ type: "download", id: dl.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#A7C2D7]/15 text-rose-400 hover:bg-rose-50 hover:border-rose-200 transition-all ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* ═══════════════ TAB 2: SPIRITUAL INSIGHTS ═══════════════ */}
        <TabsContent value="insights">
          {/* Stats */}
          <div className="mb-4 flex items-center gap-4">
            <p className="text-sm text-[#3C1E38]/60">
              <span className="font-bold text-[#3C1E38]">{insights.length}</span> insights collected,{" "}
              <span className="font-bold text-emerald-600">{shareableInsights}</span> shareable
            </p>
          </div>

          {/* End-of-quarter prompt */}
          {(() => {
            const now = new Date()
            const quarter = Math.floor(now.getMonth() / 3) + 1
            const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0)
            const daysLeft = Math.ceil((quarterEnd.getTime() - now.getTime()) / 86400000)
            if (daysLeft <= 14) return (
              <div className="mb-4 p-3 bg-[#F9D57E]/10 rounded-xl border border-[#F9D57E]/30">
                <p className="text-sm text-[#3C1E38]/70"><AlertCircle className="w-4 h-4 inline mr-1 text-[#F9D57E]" /> <strong>{daysLeft} days</strong> left in the quarter. Review your insights — which feel ready to share?</p>
              </div>
            )
            return null
          })()}

          {/* New insight form */}
          <div className="bg-white rounded-xl border border-[#A7C2D7]/15 p-4 space-y-3 mb-6">
            <textarea
              value={insightContent}
              onChange={(e) => setInsightContent(e.target.value)}
              rows={4}
              placeholder="A deeper reflection, meditation, or spiritual observation..."
              className="w-full px-3 py-2.5 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none placeholder:text-[#3C1E38]/30 font-inter"
            />

            <div className="flex flex-wrap items-center gap-2">
              {/* Source */}
              {SOURCES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setInsightSource(insightSource === s.key ? null : s.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${insightSource === s.key ? "bg-[#A7C2D7]/15 border-[#A7C2D7]/40 text-[#3C1E38]" : "border-[#A7C2D7]/15 text-[#3C1E38]/40"}`}
                >
                  <s.icon className="w-3 h-3" /> {s.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Format tags */}
              {FORMAT_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setInsightFormat(insightFormat === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${insightFormat === tag ? "bg-purple-50 border-purple-200 text-purple-700" : "border-[#A7C2D7]/15 text-[#3C1E38]/40"}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setInsightShareable(!insightShareable)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-all ${insightShareable ? "text-emerald-600" : "text-[#3C1E38]/40"}`}
              >
                {insightShareable ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {insightShareable ? "Shareable" : "Private"}
              </button>
              <Button
                onClick={submitInsight}
                disabled={!insightContent.trim() || saving}
                className="bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-white text-xs"
                size="sm"
              >
                <PenLine className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Record Insight"}
              </Button>
            </div>
          </div>

          {/* Insights list */}
          <div className="space-y-3">
            {insights.length === 0 && (
              <div className="text-center py-12 text-[#3C1E38]/30">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No insights yet — your first reflection is waiting</p>
              </div>
            )}

            {insights.map((ins) => {
              const srcCfg = ins.source ? getSourceConfig(ins.source) : null
              return (
                <div key={ins.id} className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4">
                  <p className="text-sm text-[#3C1E38] leading-relaxed whitespace-pre-wrap">{ins.content}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {srcCfg && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#A7C2D7]/10 text-[#3C1E38]/50 border border-[#A7C2D7]/15">
                        <srcCfg.icon className="w-3 h-3 inline mr-0.5 -mt-0.5" /> {srcCfg.label}
                      </span>
                    )}
                    {ins.format_tag && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">{ins.format_tag}</span>
                    )}
                    <button
                      onClick={() => toggleInsightShareable(ins.id, !ins.shareable)}
                      className={`text-[10px] font-medium flex items-center gap-1 ${ins.shareable ? "text-emerald-600" : "text-[#3C1E38]/30"}`}
                    >
                      {ins.shareable ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {ins.shareable ? "Shareable" : "Private"}
                    </button>
                    <span className="text-[10px] text-[#3C1E38]/25 ml-auto">{relativeDate(ins.created_at)}</span>
                    <button
                      onClick={() => setDeleteTarget({ type: "insight", id: ins.id })}
                      className="text-rose-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════ DELETE CONFIRM DIALOG ═══════════════ */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-playfair">Delete {deleteTarget?.type === "download" ? "Download" : "Insight"}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#3C1E38]/60">This cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
            <Button
              onClick={() => deleteTarget?.type === "download" ? deleteDownload(deleteTarget.id) : deleteInsight(deleteTarget!.id)}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
