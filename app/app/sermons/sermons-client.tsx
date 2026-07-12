"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Plus, Star, CheckCircle2, Circle, ArrowUpDown, Filter, X,
  Headphones, BookOpen, ChevronRight, ChevronLeft, Upload, Sparkles, Crown,
  ExternalLink, Tag, Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { ThisWeekTab } from "@/components/app/sermons/this-week-tab"
import { SermonJournal } from "@/components/app/sermons/sermon-journal"
import { getMondayOfWeek, localCalendarDateString } from "@/lib/prayer-week"

// ─── Types ───────────────────────────────────────────────────
export interface KeyScripture {
  ref: string
  angle: string
}

export type EntryStatus = "captured" | "processed" | "living"

export interface Sermon {
  id: string
  user_id: string
  title: string
  speaker: string
  category: string
  resonance: number | null
  source_url: string | null
  tags: string[]
  mastered: boolean
  applied: boolean
  mastery_summary: string | null
  mastery_revelation: string | null
  mastery_key_principle: string | null
  mastery_life_areas: string[]
  application_how: string | null
  application_outcome: string | null
  application_date: string | null
  created_at: string
  updated_at: string
  // ── Sermon Journal (8 sections) ──
  // 1 · The Record (minister = speaker, recording link = source_url)
  platform: string | null
  sermon_date: string | null
  series: string | null
  scripture_anchors: string[]
  // 2 · The Burden
  burden: string | null
  // 3 · The Teaching
  core_points: string[]
  key_scriptures: KeyScripture[]
  quotes: string[]
  // 4 · The Revelation
  revelation: string | null
  revelation_download_id: string | null
  // 5 · The Response (exactly four)
  response_conviction: string | null
  response_declaration: string | null
  response_prayer_point: string | null
  response_action: string | null
  response_action_deadline: string | null
  response_declaration_id: string | null
  response_action_routed: boolean
  // 6 · The Formation Link
  formation_link: string | null
  // 7 · The Retention Loop
  teach_it_test: boolean
  seven_day_review: string | null
  spaced_summary: string | null
  // 8 · Verdict + Status
  relisten_worthy: boolean
  entry_status: EntryStatus
}

/** New rows from Supabase may return null for freshly-added journal columns; coerce to safe defaults. */
export function normalizeSermon(raw: Record<string, unknown>): Sermon {
  const asArray = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : [])
  const asScriptures = (v: unknown): KeyScripture[] =>
    Array.isArray(v)
      ? v
          .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : {}))
          .map((o) => ({ ref: String(o.ref ?? ""), angle: String(o.angle ?? "") }))
      : []
  const s = raw as Record<string, unknown>
  return {
    ...(raw as unknown as Sermon),
    tags: asArray(s.tags),
    mastery_life_areas: asArray(s.mastery_life_areas),
    scripture_anchors: asArray(s.scripture_anchors),
    core_points: asArray(s.core_points),
    key_scriptures: asScriptures(s.key_scriptures),
    quotes: asArray(s.quotes),
    platform: (s.platform as string | null) ?? null,
    sermon_date: (s.sermon_date as string | null) ?? null,
    series: (s.series as string | null) ?? null,
    burden: (s.burden as string | null) ?? null,
    revelation: (s.revelation as string | null) ?? null,
    revelation_download_id: (s.revelation_download_id as string | null) ?? null,
    response_conviction: (s.response_conviction as string | null) ?? null,
    response_declaration: (s.response_declaration as string | null) ?? null,
    response_prayer_point: (s.response_prayer_point as string | null) ?? null,
    response_action: (s.response_action as string | null) ?? null,
    response_action_deadline: (s.response_action_deadline as string | null) ?? null,
    response_declaration_id: (s.response_declaration_id as string | null) ?? null,
    response_action_routed: Boolean(s.response_action_routed),
    formation_link: (s.formation_link as string | null) ?? null,
    teach_it_test: Boolean(s.teach_it_test),
    seven_day_review: (s.seven_day_review as string | null) ?? null,
    spaced_summary: (s.spaced_summary as string | null) ?? null,
    relisten_worthy: Boolean(s.relisten_worthy),
    entry_status: (s.entry_status as EntryStatus) ?? "captured",
  }
}

export type WeeklySermonRow = {
  id: string
  sermon_id: string
  week_start_date: string
  display_order: number
  listened: boolean
  listened_date: string | null
  notes: string | null
  is_weekly_principle: boolean
  title: string
  speaker: string
  category: string
  mastery_key_principle: string | null
}

interface Props {
  sermons: Sermon[]
  userId: string
  initialWeekStartStr?: string
  initialWeeklySermons?: WeeklySermonRow[]
}

// ─── Constants ───────────────────────────────────────────────
const CATEGORIES = [
  { value: "uncategorized", label: "Uncategorized", color: "bg-gray-400" },
  { value: "prayer", label: "Prayer", color: "bg-[#A7C2D7]" },
  { value: "faith", label: "Faith", color: "bg-[#F9D57E]" },
  { value: "the-holy-spirit", label: "The Holy Spirit", color: "bg-purple-500" },
  { value: "wisdom", label: "Wisdom", color: "bg-emerald-500" },
  { value: "purpose-and-destiny", label: "Purpose & Destiny", color: "bg-orange-500" },
  { value: "relationships", label: "Relationships", color: "bg-rose-500" },
  { value: "prosperity", label: "Prosperity", color: "bg-amber-600" },
] as const

const LIFE_AREAS = [
  "Spiritual Growth", "Marriage & Family", "Career & Business", "Finances",
  "Health & Wellness", "Ministry & Service", "Relationships", "Education",
  "Emotional Health", "Purpose & Destiny",
] as const

type ViewTab = "library" | "uncategorized" | "top80" | "this-week"
type SortKey = "created_at" | "resonance" | "title"

const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

const STATUS_BADGE: Record<EntryStatus, { label: string; cls: string }> = {
  captured: { label: "Captured", cls: "bg-[#A7C2D7]/15 text-[#3C1E38]/60" },
  processed: { label: "Processed", cls: "bg-[#F9D57E]/25 text-[#3C1E38]" },
  living: { label: "Living", cls: "bg-emerald-100 text-emerald-700" },
}

// ─── Component ───────────────────────────────────────────────
/** Monday as start of week */
function getWeekStartMonday(d: Date): string {
  return localCalendarDateString(getMondayOfWeek(d))
}

export function SermonsClient({ sermons: initial, userId, initialWeekStartStr, initialWeeklySermons = [] }: Props) {
  const router = useRouter()
  const supabase = createClient()

  // Core state
  const [sermons, setSermons] = useState<Sermon[]>(() =>
    initial.map((s) => normalizeSermon(s as unknown as Record<string, unknown>)),
  )
  const [view, setView] = useState<ViewTab>("library")
  const [weekStartStr, setWeekStartStr] = useState(initialWeekStartStr ?? getWeekStartMonday(new Date()))
  const [weeklySermons, setWeeklySermons] = useState<WeeklySermonRow[]>(initialWeeklySermons)

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#this-week") setView("this-week")
  }, [])

  // Library filters
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("created_at")
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [filterResonanceMin, setFilterResonanceMin] = useState(1)
  const [filterMastered, setFilterMastered] = useState<boolean | null>(null)
  const [filterApplied, setFilterApplied] = useState<boolean | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Detail sheet
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)
  const [saving, setSaving] = useState(false)

  // Full journal (derive from live list so it always reflects the latest saved values)
  const [journalSermonId, setJournalSermonId] = useState<string | null>(null)
  const journalSermon = useMemo(
    () => (journalSermonId ? sermons.find((s) => s.id === journalSermonId) ?? null : null),
    [journalSermonId, sermons],
  )

  // Add / bulk import dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addMode, setAddMode] = useState<"single" | "bulk">("single")
  const [newSermon, setNewSermon] = useState({ title: "", speaker: "Apostle Joshua Selman", category: "uncategorized", resonance: 0, source_url: "", tags: "" })
  const [bulkText, setBulkText] = useState("")
  const [addSaving, setAddSaving] = useState(false)

  // Uncategorized queue
  const [queueIndex, setQueueIndex] = useState(0)
  const [queueResonance, setQueueResonance] = useState(0)

  // ─── Derived data ──────────────────────────────────────────
  const uncategorized = useMemo(() => sermons.filter((s) => s.category === "uncategorized"), [sermons])
  const top80 = useMemo(() =>
    sermons.filter((s) => s.resonance !== null && s.resonance >= 4)
      .sort((a, b) => (b.resonance ?? 0) - (a.resonance ?? 0))
      .slice(0, 80),
    [sermons]
  )
  const top80Mastered = useMemo(() => top80.filter((s) => s.mastered).length, [top80])

  const thisWeekSermonIds = useMemo(() => new Set(weeklySermons.map((w) => w.sermon_id)), [weeklySermons])

  const filteredSermons = useMemo(() => {
    let list = [...sermons]

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        (s.mastery_key_principle && s.mastery_key_principle.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (filterCategories.length > 0) {
      list = list.filter((s) => filterCategories.includes(s.category))
    }

    // Resonance min
    if (filterResonanceMin > 1) {
      list = list.filter((s) => s.resonance !== null && s.resonance >= filterResonanceMin)
    }

    // Mastered
    if (filterMastered !== null) {
      list = list.filter((s) => s.mastered === filterMastered)
    }

    // Applied
    if (filterApplied !== null) {
      list = list.filter((s) => s.applied === filterApplied)
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "created_at") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === "resonance") return (b.resonance ?? 0) - (a.resonance ?? 0)
      return a.title.localeCompare(b.title)
    })

    return list
  }, [sermons, search, filterCategories, filterResonanceMin, filterMastered, filterApplied, sortBy])

  // ─── Supabase helpers ──────────────────────────────────────
  const updateSermon = useCallback(async (id: string, updates: Partial<Sermon>) => {
    setSaving(true)
    const { error } = await supabase.from("sermons").update(updates).eq("id", id)
    if (!error) {
      setSermons((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s)))
      if (selectedSermon?.id === id) setSelectedSermon((prev) => prev ? { ...prev, ...updates } : prev)
    }
    setSaving(false)
  }, [supabase, selectedSermon])

  const deleteSermon = useCallback(async (id: string) => {
    await supabase.from("sermons").delete().eq("id", id)
    setSermons((prev) => prev.filter((s) => s.id !== id))
    setSelectedSermon(null)
  }, [supabase])

  const addSingle = async () => {
    if (!newSermon.title.trim()) return
    setAddSaving(true)
    const payload = {
      user_id: userId,
      title: newSermon.title.trim(),
      speaker: newSermon.speaker || "Apostle Joshua Selman",
      category: newSermon.category,
      resonance: newSermon.resonance > 0 ? newSermon.resonance : null,
      source_url: newSermon.source_url || null,
      tags: newSermon.tags ? newSermon.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    }
    const { data, error } = await supabase.from("sermons").insert(payload).select().single()
    if (!error && data) {
      setSermons((prev) => [normalizeSermon(data), ...prev])
      setNewSermon({ title: "", speaker: "Apostle Joshua Selman", category: "uncategorized", resonance: 0, source_url: "", tags: "" })
      setShowAddDialog(false)
    }
    setAddSaving(false)
  }

  const addBulk = async () => {
    const titles = bulkText.split("\n").map((l) => l.trim()).filter(Boolean)
    if (titles.length === 0) return
    setAddSaving(true)
    const rows = titles.map((title) => ({
      user_id: userId,
      title,
      speaker: "Apostle Joshua Selman",
      category: "uncategorized",
    }))
    const { data, error } = await supabase.from("sermons").insert(rows).select()
    if (!error && data) {
      setSermons((prev) => [...data.map((d) => normalizeSermon(d)), ...prev])
      setBulkText("")
      setShowAddDialog(false)
    }
    setAddSaving(false)
  }

  const setWeeklyPrinciple = async (principle: string) => {
    await supabase.from("profiles").update({ weekly_principle: principle }).eq("id", userId)
    router.refresh()
  }

  const loadWeeklySermons = useCallback(async (weekStart: string) => {
    const { data: ws } = await supabase
      .from("weekly_sermons")
      .select("id, sermon_id, week_start_date, display_order, listened, listened_date, notes, is_weekly_principle")
      .eq("user_id", userId)
      .eq("week_start_date", weekStart)
      .order("display_order")
    if (!ws?.length) {
      setWeeklySermons([])
      return
    }
    const sermonIds = [...new Set(ws.map((r) => r.sermon_id))]
    const sermonMap = new Map(sermons.filter((s) => sermonIds.includes(s.id)).map((s) => [s.id, s]))
    if (sermonMap.size < sermonIds.length) {
      const { data: extra } = await supabase.from("sermons").select("id, title, speaker, category, mastery_key_principle").in("id", sermonIds)
      extra?.forEach((s: { id: string; title: string; speaker: string; category: string; mastery_key_principle: string | null }) =>
        sermonMap.set(s.id, { ...s } as Sermon)
      )
    }
    setWeeklySermons(ws.map((r) => {
      const s = sermonMap.get(r.sermon_id)
      return {
        id: r.id,
        sermon_id: r.sermon_id,
        week_start_date: r.week_start_date,
        display_order: r.display_order ?? 0,
        listened: r.listened ?? false,
        listened_date: r.listened_date ?? null,
        notes: r.notes ?? null,
        is_weekly_principle: r.is_weekly_principle ?? false,
        title: s?.title ?? "",
        speaker: s?.speaker ?? "",
        category: s?.category ?? "uncategorized",
        mastery_key_principle: s?.mastery_key_principle ?? null,
      }
    }))
  }, [supabase, userId, sermons])

  const handleWeekChange = useCallback((newWeekStart: string) => {
    setWeekStartStr(newWeekStart)
    loadWeeklySermons(newWeekStart)
  }, [loadWeeklySermons])

  const handleAddSermonsToWeek = useCallback(async (sermonIds: string[]) => {
    const maxOrder = Math.max(0, ...weeklySermons.map((w) => w.display_order))
    const rows = sermonIds.map((id, i) => ({ user_id: userId, week_start_date: weekStartStr, sermon_id: id, display_order: maxOrder + i + 1 }))
    await supabase.from("weekly_sermons").insert(rows)
    await loadWeeklySermons(weekStartStr)
    router.refresh()
  }, [supabase, userId, weekStartStr, weeklySermons, loadWeeklySermons, router])

  const handleToggleListened = useCallback(async (wsId: string, listened: boolean) => {
    const today = localCalendarDateString()
    await supabase.from("weekly_sermons").update({ listened, listened_date: listened ? today : null }).eq("id", wsId)
    await loadWeeklySermons(weekStartStr)
    router.refresh()
  }, [supabase, weekStartStr, loadWeeklySermons, router])

  const handleUpdateNotes = useCallback(async (wsId: string, notes: string) => {
    await supabase.from("weekly_sermons").update({ notes: notes || null }).eq("id", wsId)
    setWeeklySermons((prev) => prev.map((w) => (w.id === wsId ? { ...w, notes } : w)))
  }, [supabase])

  const handleSetPrinciple = useCallback(async (wsId: string) => {
    const row = weeklySermons.find((w) => w.id === wsId)
    if (!row) return
    await supabase.from("weekly_sermons").update({ is_weekly_principle: false }).eq("user_id", userId).eq("week_start_date", weekStartStr)
    await supabase.from("weekly_sermons").update({ is_weekly_principle: true }).eq("id", wsId)
    if (row.mastery_key_principle) {
      await supabase.from("profiles").update({ weekly_principle: row.mastery_key_principle }).eq("id", userId)
    }
    await loadWeeklySermons(weekStartStr)
    router.refresh()
  }, [supabase, userId, weekStartStr, weeklySermons, loadWeeklySermons, router])

  const handleRemoveFromWeek = useCallback(async (wsId: string) => {
    await supabase.from("weekly_sermons").delete().eq("id", wsId)
    await loadWeeklySermons(weekStartStr)
    router.refresh()
  }, [supabase, weekStartStr, loadWeeklySermons, router])

  const handleReorder = useCallback(async (wsId: string, direction: "up" | "down") => {
    const sorted = [...weeklySermons].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((w) => w.id === wsId)
    if (idx < 0) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swapIdx]
    await supabase.from("weekly_sermons").update({ display_order: b.display_order }).eq("id", a.id)
    await supabase.from("weekly_sermons").update({ display_order: a.display_order }).eq("id", b.id)
    await loadWeeklySermons(weekStartStr)
    router.refresh()
  }, [supabase, weekStartStr, weeklySermons, loadWeeklySermons, router])

  const handleAddKeyPrinciple = useCallback(async (sermonId: string, principle: string) => {
    await supabase.from("sermons").update({ mastery_key_principle: principle }).eq("id", sermonId)
    setSermons((prev) => prev.map((s) => (s.id === sermonId ? { ...s, mastery_key_principle: principle } : s)))
  }, [supabase])

  // Queue helpers
  const queueSermon = uncategorized[queueIndex]
  const assignCategory = async (cat: string) => {
    if (!queueSermon) return
    const updates: Partial<Sermon> = { category: cat }
    if (queueResonance > 0) updates.resonance = queueResonance
    await updateSermon(queueSermon.id, updates)
    setQueueResonance(0)
    // Move to next (the list shrinks so index stays or resets)
    if (queueIndex >= uncategorized.length - 1) setQueueIndex(Math.max(0, uncategorized.length - 2))
  }

  // ─── Render helpers ────────────────────────────────────────
  const StarRating = ({ value, onChange, size = "w-4 h-4" }: { value: number; onChange?: (v: number) => void; size?: string }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(value === i ? 0 : i)}
          disabled={!onChange}
          className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star className={`${size} ${i <= value ? "text-[#F9D57E] fill-[#F9D57E]" : "text-[#3C1E38]/15"}`} />
        </button>
      ))}
    </div>
  )

  const CategoryBadge = ({ cat }: { cat: string }) => {
    const c = categoryMap[cat] ?? categoryMap["uncategorized"]
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${c.color}`}>
        {c.label}
      </span>
    )
  }

  // ─── VIEWS ─────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Sermon Library</h1>
          <p className="text-sm text-[#3C1E38]/50 mt-1">{sermons.length} sermons · {uncategorized.length} uncategorized</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
          <Plus className="w-4 h-4 mr-2" /> Add Sermon
        </Button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "library" as ViewTab, label: "Library" },
          { key: "this-week" as ViewTab, label: "This Week" },
          { key: "uncategorized" as ViewTab, label: `Uncategorized (${uncategorized.length})` },
          { key: "top80" as ViewTab, label: `Top 80 Mastery` },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setView(tab.key); setQueueIndex(0); setQueueResonance(0) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === tab.key ? "bg-[#A7C2D7]/15 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:bg-[#A7C2D7]/5"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── VIEW 1: LIBRARY ────────────────────────────────── */}
      {view === "library" && (
        <div>
          {/* Search + Sort + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C1E38]/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, key principle, tags..."
                className="w-full pl-9 pr-3 py-2.5 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
              >
                <option value="created_at">Date Added</option>
                <option value="resonance">Resonance ↓</option>
                <option value="title">Title A-Z</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-all ${showFilters ? "border-[#A7C2D7] bg-[#A7C2D7]/10 text-[#3C1E38]" : "border-[#A7C2D7]/20 text-[#3C1E38]/60 hover:border-[#A7C2D7]/40"}`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4 mb-4 space-y-4">
              {/* Categories */}
              <div>
                <p className="text-xs font-medium text-[#3C1E38]/50 mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = filterCategories.includes(cat.value)
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setFilterCategories((prev) => active ? prev.filter((c) => c !== cat.value) : [...prev, cat.value])}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${active ? `${cat.color} text-white` : "bg-[#A7C2D7]/10 text-[#3C1E38]/60 hover:bg-[#A7C2D7]/20"}`}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Resonance */}
              <div>
                <p className="text-xs font-medium text-[#3C1E38]/50 mb-2">Min Resonance: {filterResonanceMin}</p>
                <input type="range" min={1} max={5} value={filterResonanceMin} onChange={(e) => setFilterResonanceMin(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-[#A7C2D7]/20 to-[#F9D57E]" />
              </div>
              {/* Mastered / Applied */}
              <div className="flex gap-4">
                <div>
                  <p className="text-xs font-medium text-[#3C1E38]/50 mb-2">Mastered</p>
                  <div className="flex gap-1">
                    {[{ l: "All", v: null }, { l: "Yes", v: true }, { l: "No", v: false }].map((opt) => (
                      <button key={String(opt.v)} onClick={() => setFilterMastered(opt.v)} className={`text-xs px-3 py-1 rounded-full ${filterMastered === opt.v ? "bg-[#3C1E38] text-white" : "bg-[#A7C2D7]/10 text-[#3C1E38]/60"}`}>{opt.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#3C1E38]/50 mb-2">Applied</p>
                  <div className="flex gap-1">
                    {[{ l: "All", v: null }, { l: "Yes", v: true }, { l: "No", v: false }].map((opt) => (
                      <button key={String(opt.v)} onClick={() => setFilterApplied(opt.v)} className={`text-xs px-3 py-1 rounded-full ${filterApplied === opt.v ? "bg-[#3C1E38] text-white" : "bg-[#A7C2D7]/10 text-[#3C1E38]/60"}`}>{opt.l}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { setFilterCategories([]); setFilterResonanceMin(1); setFilterMastered(null); setFilterApplied(null) }} className="text-xs text-[#A7C2D7] hover:underline">Clear all filters</button>
            </div>
          )}

          {/* Sermon list */}
          {filteredSermons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
              <Headphones className="w-12 h-12 text-[#A7C2D7]/30 mx-auto mb-3" />
              <p className="text-[#3C1E38]/50">No sermons found</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4 border-[#A7C2D7]/30">
                <Plus className="w-4 h-4 mr-2" /> Add your first sermon
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#A7C2D7]/10 overflow-hidden divide-y divide-[#A7C2D7]/10">
              {filteredSermons.map((sermon) => {
                const status = STATUS_BADGE[sermon.entry_status] ?? STATUS_BADGE.captured
                return (
                <div
                  key={sermon.id}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#FDFCF9] transition-colors"
                >
                  <button onClick={() => setSelectedSermon(sermon)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-[#3C1E38] truncate">{sermon.title}</p>
                      {thisWeekSermonIds.has(sermon.id) && (
                        <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F9D57E]/20 text-[#3C1E38] border border-[#F9D57E]/40">This week</span>
                      )}
                      <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                    </div>
                    {sermon.burden && (
                      <p className="text-xs italic text-[#3C1E38]/45 truncate mb-1">&ldquo;{sermon.burden}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[#3C1E38]/40">
                      <span>{sermon.speaker}</span>
                      <CategoryBadge cat={sermon.category} />
                    </div>
                  </button>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {sermon.resonance && <StarRating value={sermon.resonance} size="w-3.5 h-3.5" />}
                    {sermon.mastered && <Crown className="w-4 h-4 text-[#F9D57E]" aria-label="Mastered" />}
                    {sermon.applied && <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-label="Applied" />}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJournalSermonId(sermon.id)}
                    className="flex-shrink-0 text-xs border-[#A7C2D7]/30 text-[#3C1E38] hover:bg-[#A7C2D7]/10"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" /> Journal
                  </Button>
                </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── VIEW: THIS WEEK ────────────────────────────────── */}
      {view === "this-week" && (
        <ThisWeekTab
          weekStartStr={weekStartStr}
          weeklySermons={weeklySermons}
          sermons={sermons.map((s) => ({
            id: s.id,
            title: s.title,
            speaker: s.speaker,
            category: s.category,
            resonance: s.resonance,
            mastered: s.mastered,
            created_at: s.created_at,
            mastery_key_principle: s.mastery_key_principle,
            tags: s.tags ?? [],
          }))}
          onWeekChange={handleWeekChange}
          onAddSermons={handleAddSermonsToWeek}
          onToggleListened={handleToggleListened}
          onUpdateNotes={handleUpdateNotes}
          onSetPrinciple={handleSetPrinciple}
          onRemove={handleRemoveFromWeek}
          onReorder={handleReorder}
          onAddKeyPrinciple={handleAddKeyPrinciple}
          onOpenAddSermon={() => setShowAddDialog(true)}
          categoryLabels={Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))}
        />
      )}

      {/* ─── VIEW 2: UNCATEGORIZED QUEUE ────────────────────── */}
      {view === "uncategorized" && (
        <div>
          {uncategorized.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
              <p className="font-playfair text-lg font-bold text-[#3C1E38]">All caught up!</p>
              <p className="text-sm text-[#3C1E38]/50 mt-1">Every sermon has been categorized.</p>
            </div>
          ) : (
            <div>
              {/* Progress banner */}
              <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-xl p-4 border border-[#A7C2D7]/15 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#3C1E38]">{uncategorized.length} sermons need categorization</p>
                  <span className="text-xs text-[#3C1E38]/40">{queueIndex + 1} of {uncategorized.length}</span>
                </div>
                <Progress value={((queueIndex) / uncategorized.length) * 100} className="h-2" />
              </div>

              {/* Current sermon card */}
              {queueSermon && (
                <div className="bg-white rounded-2xl border border-[#A7C2D7]/10 p-6 mb-6">
                  <p className="text-xs text-[#3C1E38]/40 mb-2">Categorize this sermon:</p>
                  <h2 className="font-playfair text-xl font-bold text-[#3C1E38] mb-1">{queueSermon.title}</h2>
                  <p className="text-sm text-[#3C1E38]/50 mb-6">{queueSermon.speaker}</p>

                  {/* Resonance (optional) */}
                  <div className="mb-6">
                    <p className="text-xs text-[#3C1E38]/50 mb-2">Resonance (optional)</p>
                    <StarRating value={queueResonance} onChange={setQueueResonance} size="w-6 h-6" />
                  </div>

                  {/* Category buttons */}
                  <p className="text-xs text-[#3C1E38]/50 mb-3">Assign a category:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {CATEGORIES.filter((c) => c.value !== "uncategorized").map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => assignCategory(cat.value)}
                        className={`${cat.color} text-white text-sm font-medium py-3 px-4 rounded-xl hover:opacity-90 transition-opacity`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#A7C2D7]/10">
                    <button
                      onClick={() => setQueueIndex(Math.max(0, queueIndex - 1))}
                      disabled={queueIndex === 0}
                      className="flex items-center gap-1 text-sm text-[#3C1E38]/50 hover:text-[#3C1E38] disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      onClick={() => setQueueIndex(Math.min(uncategorized.length - 1, queueIndex + 1))}
                      disabled={queueIndex >= uncategorized.length - 1}
                      className="flex items-center gap-1 text-sm text-[#A7C2D7] font-medium hover:text-[#3C1E38] disabled:opacity-30"
                    >
                      Skip <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── VIEW 3: TOP 80 MASTERY ─────────────────────────── */}
      {view === "top80" && (
        <div>
          {/* Progress banner */}
          <div className="bg-gradient-to-r from-[#F9D57E]/15 to-[#3C1E38]/5 rounded-xl p-4 border border-[#F9D57E]/20 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#F9D57E]" />
                <p className="text-sm font-medium text-[#3C1E38]">Mastery Progress</p>
              </div>
              <span className="font-playfair text-lg font-bold text-[#3C1E38]">{top80Mastered} of {top80.length}</span>
            </div>
            <Progress value={top80.length > 0 ? (top80Mastered / Math.min(top80.length, 80)) * 100 : 0} className="h-2" />
          </div>

          {top80.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
              <Star className="w-12 h-12 text-[#F9D57E]/30 mx-auto mb-3" />
              <p className="text-[#3C1E38]/50">No sermons with 4+ resonance yet</p>
              <p className="text-xs text-[#3C1E38]/35 mt-1">Rate sermons in the Library to build your Top 80</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top80.map((sermon) => (
                <div key={sermon.id} className={`bg-white rounded-xl border p-5 transition-all ${sermon.mastered ? "border-[#F9D57E]/30 ring-1 ring-[#F9D57E]/20" : "border-[#A7C2D7]/10"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => setSelectedSermon(sermon)} className="font-medium text-[#3C1E38] hover:underline text-left truncate">{sermon.title}</button>
                        {sermon.mastered && <Badge className="bg-[#F9D57E]/20 text-[#3C1E38] border-[#F9D57E]/30 text-[10px]">Mastered</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <CategoryBadge cat={sermon.category} />
                        <StarRating value={sermon.resonance ?? 0} size="w-3.5 h-3.5" />
                      </div>
                      {sermon.mastery_key_principle && (
                        <div className="bg-[#A7C2D7]/5 rounded-lg p-3 mt-2">
                          <p className="text-xs text-[#3C1E38]/50 mb-0.5">Key Principle</p>
                          <p className="text-sm text-[#3C1E38] font-medium">{sermon.mastery_key_principle}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!sermon.mastered && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSermon(sermon)}
                          className="text-xs border-[#F9D57E]/30 text-[#F9D57E] hover:bg-[#F9D57E]/10"
                        >
                          <Crown className="w-3 h-3 mr-1" /> Master
                        </Button>
                      )}
                      {sermon.mastery_key_principle && (
                        <Button
                          size="sm"
                          onClick={() => setWeeklyPrinciple(sermon.mastery_key_principle!)}
                          className="text-xs bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-white"
                        >
                          <Sparkles className="w-3 h-3 mr-1" /> This Week
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SERMON DETAIL SHEET ────────────────────────────── */}
      <Sheet open={!!selectedSermon} onOpenChange={(open) => { if (!open) setSelectedSermon(null) }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedSermon && (
            <>
              <SheetHeader>
                <SheetTitle className="font-playfair text-[#3C1E38]">Sermon Details</SheetTitle>
                <SheetDescription className="sr-only">Edit sermon details</SheetDescription>
              </SheetHeader>

              <Button
                onClick={() => setJournalSermonId(selectedSermon.id)}
                className="mt-4 w-full bg-[#3C1E38] hover:bg-[#3C1E38]/90 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Open Full Journal
              </Button>

              <div className="mt-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedSermon.title}
                    onChange={(e) => setSelectedSermon({ ...selectedSermon, title: e.target.value })}
                    onBlur={() => updateSermon(selectedSermon.id, { title: selectedSermon.title })}
                    className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                  />
                </div>

                {/* Speaker */}
                <div>
                  <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Speaker</label>
                  <input
                    type="text"
                    value={selectedSermon.speaker}
                    onChange={(e) => setSelectedSermon({ ...selectedSermon, speaker: e.target.value })}
                    onBlur={() => updateSermon(selectedSermon.id, { speaker: selectedSermon.speaker })}
                    className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Category</label>
                  <select
                    value={selectedSermon.category}
                    onChange={(e) => { setSelectedSermon({ ...selectedSermon, category: e.target.value }); updateSermon(selectedSermon.id, { category: e.target.value }) }}
                    className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Resonance */}
                <div>
                  <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Resonance</label>
                  <StarRating
                    value={selectedSermon.resonance ?? 0}
                    onChange={(v) => { setSelectedSermon({ ...selectedSermon, resonance: v || null }); updateSermon(selectedSermon.id, { resonance: v || null }) }}
                    size="w-6 h-6"
                  />
                </div>

                {/* Source URL */}
                <div>
                  <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Source URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={selectedSermon.source_url ?? ""}
                      onChange={(e) => setSelectedSermon({ ...selectedSermon, source_url: e.target.value })}
                      onBlur={() => updateSermon(selectedSermon.id, { source_url: selectedSermon.source_url || null })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                    />
                    {selectedSermon.source_url && (
                      <a href={selectedSermon.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#A7C2D7]/20 text-[#A7C2D7] hover:bg-[#A7C2D7]/10">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={selectedSermon.tags.join(", ")}
                    onChange={(e) => setSelectedSermon({ ...selectedSermon, tags: e.target.value.split(",").map((t) => t.trim()) })}
                    onBlur={() => updateSermon(selectedSermon.id, { tags: selectedSermon.tags.filter(Boolean) })}
                    placeholder="e.g. grace, 2024, conference"
                    className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                  />
                </div>

                {/* Mastered toggle */}
                <div className="pt-2 border-t border-[#A7C2D7]/10">
                  <button
                    onClick={() => { const v = !selectedSermon.mastered; setSelectedSermon({ ...selectedSermon, mastered: v }); updateSermon(selectedSermon.id, { mastered: v }) }}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg border text-sm transition-all ${selectedSermon.mastered ? "bg-[#F9D57E]/10 border-[#F9D57E]/30 text-[#3C1E38]" : "border-[#A7C2D7]/10 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}
                  >
                    {selectedSermon.mastered ? <Crown className="w-4 h-4 text-[#F9D57E]" /> : <Circle className="w-4 h-4 text-[#3C1E38]/30" />}
                    <span>Mastered</span>
                  </button>

                  {selectedSermon.mastered && (
                    <div className="mt-3 ml-2 space-y-3 pl-4 border-l-2 border-[#F9D57E]/30">
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Summary</label>
                        <textarea
                          value={selectedSermon.mastery_summary ?? ""}
                          onChange={(e) => setSelectedSermon({ ...selectedSermon, mastery_summary: e.target.value })}
                          onBlur={() => updateSermon(selectedSermon.id, { mastery_summary: selectedSermon.mastery_summary || null })}
                          rows={2}
                          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Personal Revelation</label>
                        <textarea
                          value={selectedSermon.mastery_revelation ?? ""}
                          onChange={(e) => setSelectedSermon({ ...selectedSermon, mastery_revelation: e.target.value })}
                          onBlur={() => updateSermon(selectedSermon.id, { mastery_revelation: selectedSermon.mastery_revelation || null })}
                          rows={2}
                          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Key Principle</label>
                        <input
                          type="text"
                          value={selectedSermon.mastery_key_principle ?? ""}
                          onChange={(e) => setSelectedSermon({ ...selectedSermon, mastery_key_principle: e.target.value })}
                          onBlur={() => updateSermon(selectedSermon.id, { mastery_key_principle: selectedSermon.mastery_key_principle || null })}
                          placeholder="One-liner principle to apply"
                          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Life Area Connection</label>
                        <div className="flex flex-wrap gap-1.5">
                          {LIFE_AREAS.map((area) => {
                            const active = selectedSermon.mastery_life_areas.includes(area)
                            return (
                              <button
                                key={area}
                                onClick={() => {
                                  const updated = active ? selectedSermon.mastery_life_areas.filter((a) => a !== area) : [...selectedSermon.mastery_life_areas, area]
                                  setSelectedSermon({ ...selectedSermon, mastery_life_areas: updated })
                                  updateSermon(selectedSermon.id, { mastery_life_areas: updated })
                                }}
                                className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${active ? "bg-[#A7C2D7] text-white" : "bg-[#A7C2D7]/10 text-[#3C1E38]/50 hover:bg-[#A7C2D7]/20"}`}
                              >
                                {area}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Applied toggle */}
                <div className="pt-2 border-t border-[#A7C2D7]/10">
                  <button
                    onClick={() => { const v = !selectedSermon.applied; setSelectedSermon({ ...selectedSermon, applied: v }); updateSermon(selectedSermon.id, { applied: v }) }}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg border text-sm transition-all ${selectedSermon.applied ? "bg-emerald-50 border-emerald-200 text-[#3C1E38]" : "border-[#A7C2D7]/10 text-[#3C1E38]/50 hover:border-[#A7C2D7]/30"}`}
                  >
                    {selectedSermon.applied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-[#3C1E38]/30" />}
                    <span>Applied</span>
                  </button>

                  {selectedSermon.applied && (
                    <div className="mt-3 ml-2 space-y-3 pl-4 border-l-2 border-emerald-300/50">
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">How I Applied It</label>
                        <textarea
                          value={selectedSermon.application_how ?? ""}
                          onChange={(e) => setSelectedSermon({ ...selectedSermon, application_how: e.target.value })}
                          onBlur={() => updateSermon(selectedSermon.id, { application_how: selectedSermon.application_how || null })}
                          rows={2}
                          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Outcome</label>
                        <textarea
                          value={selectedSermon.application_outcome ?? ""}
                          onChange={(e) => setSelectedSermon({ ...selectedSermon, application_outcome: e.target.value })}
                          onBlur={() => updateSermon(selectedSermon.id, { application_outcome: selectedSermon.application_outcome || null })}
                          rows={2}
                          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#3C1E38]/50 block mb-1">Date Applied</label>
                        <input
                          type="date"
                          value={selectedSermon.application_date ?? ""}
                          onChange={(e) => { setSelectedSermon({ ...selectedSermon, application_date: e.target.value }); updateSermon(selectedSermon.id, { application_date: e.target.value || null }) }}
                          className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <div className="pt-4 border-t border-[#A7C2D7]/10">
                  <button
                    onClick={() => { if (confirm("Delete this sermon?")) deleteSermon(selectedSermon.id) }}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete sermon
                  </button>
                </div>

                {/* Meta */}
                <p className="text-[10px] text-[#3C1E38]/30">
                  Added {new Date(selectedSermon.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  {saving && " · Saving..."}
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── SERMON JOURNAL (full 8-section capture) ─────────── */}
      {journalSermon && (
        <SermonJournal
          sermon={journalSermon}
          userId={userId}
          open={!!journalSermon}
          onClose={() => setJournalSermonId(null)}
          onUpdate={updateSermon}
        />
      )}

      {/* ─── ADD / BULK IMPORT DIALOG ───────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Add Sermons</DialogTitle>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setAddMode("single")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${addMode === "single" ? "bg-[#A7C2D7]/15 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:bg-[#A7C2D7]/5"}`}>
              <Plus className="w-3.5 h-3.5 inline mr-1.5" />Single
            </button>
            <button onClick={() => setAddMode("bulk")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${addMode === "bulk" ? "bg-[#A7C2D7]/15 text-[#3C1E38]" : "text-[#3C1E38]/50 hover:bg-[#A7C2D7]/5"}`}>
              <Upload className="w-3.5 h-3.5 inline mr-1.5" />Bulk Import
            </button>
          </div>

          {addMode === "single" ? (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Title *</label>
                <input type="text" value={newSermon.title} onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })} placeholder="Sermon title" className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Speaker</label>
                <input type="text" value={newSermon.speaker} onChange={(e) => setNewSermon({ ...newSermon, speaker: e.target.value })} className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Category</label>
                  <select value={newSermon.category} onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })} className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#F9D57E]/30 outline-none">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Resonance</label>
                  <StarRating value={newSermon.resonance} onChange={(v) => setNewSermon({ ...newSermon, resonance: v })} size="w-5 h-5" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Source URL</label>
                <input type="url" value={newSermon.source_url} onChange={(e) => setNewSermon({ ...newSermon, source_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Tags</label>
                <input type="text" value={newSermon.tags} onChange={(e) => setNewSermon({ ...newSermon, tags: e.target.value })} placeholder="comma-separated tags" className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={addSingle} disabled={addSaving || !newSermon.title.trim()} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
                  {addSaving ? "Adding..." : "Add Sermon"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-[#3C1E38]/70 block mb-1.5">Paste sermon titles (one per line)</label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={12}
                  placeholder={"The Mystery of the Holy Spirit\nUnderstanding Prayer\nWalking in Dominion\n..."}
                  className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#F9D57E] outline-none font-mono"
                />
                <p className="text-xs text-[#3C1E38]/40 mt-1">
                  {bulkText.split("\n").filter((l) => l.trim()).length} titles detected · All will be added as Uncategorized by Apostle Joshua Selman
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={addBulk} disabled={addSaving || !bulkText.trim()} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
                  {addSaving ? "Importing..." : `Import ${bulkText.split("\n").filter((l) => l.trim()).length} Sermons`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
