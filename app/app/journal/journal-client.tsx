"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Plus, Zap, MessageCircle, Star, Flame, Heart, BookOpen, Scale, Search, Briefcase,
  ChevronRight, BookMarked, Share2, Trash2, Pencil, X, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  type WisdomEntry,
  type AlignedDecision,
  type WisdomEntryType,
  type DecisionCategory,
  WISDOM_ENTRY_TYPES,
  WISDOM_TITLE_PLACEHOLDERS,
  LIFE_AREAS,
  GOAL_CODES,
  DECISION_CATEGORIES,
  OUTCOME_RATING_LABELS,
} from "@/lib/wisdom-log"
import { LogWisdomModal } from "./log-wisdom-modal"
import { DecisionFlowForm } from "./decision-flow-form"
import { InsightsDashboard } from "./insights-dashboard"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  MessageCircle,
  Star,
  Flame,
  Heart,
  BookOpen,
  Scale,
  Search,
  Briefcase,
}

interface Props {
  initialEntries: WisdomEntry[]
  initialDecisions: AlignedDecision[]
  activities: { id: string; title: string }[]
  userId: string
}

type SortOption = "newest" | "oldest" | "highlights"

export function JournalClient({
  initialEntries,
  initialDecisions,
  activities,
  userId,
}: Props) {
  const [entries, setEntries] = useState<WisdomEntry[]>(initialEntries)
  const [decisions, setDecisions] = useState<AlignedDecision[]>(initialDecisions)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [decisionFlowOpen, setDecisionFlowOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WisdomEntry | null>(null)
  const [selectedDecision, setSelectedDecision] = useState<AlignedDecision | null>(null)
  const [typeFilter, setTypeFilter] = useState<WisdomEntryType | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<SortOption>("newest")
  const [decisionCategoryFilter, setDecisionCategoryFilter] = useState<DecisionCategory | "all">("all")
  const [decisionListFilter, setDecisionListFilter] = useState<"all" | "aligned_only" | "needs_outcome">("all")
  const searchParams = useSearchParams()

  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get("open") === "log") setLogModalOpen(true)
    if (searchParams.get("open") === "decision") setDecisionFlowOpen(true)
  }, [searchParams])

  const getTypeConfig = (type: WisdomEntryType) =>
    WISDOM_ENTRY_TYPES.find((t) => t.value === type) ?? WISDOM_ENTRY_TYPES[0]
  const getIcon = (type: WisdomEntryType) => ICONS[getTypeConfig(type).icon] ?? Zap

  // Tab 1: filtered & sorted entries
  const filteredEntries = useMemo(() => {
    let list = entries
    if (typeFilter !== "all") list = list.filter((e) => e.entry_type === typeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
      )
    }
    if (sort === "highlights") list = list.filter((e) => e.is_highlight)
    if (sort === "oldest")
      list = [...list].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    else list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [entries, typeFilter, searchQuery, sort])

  // Tab 2: filtered decisions
  const filteredDecisions = useMemo(() => {
    let list = decisions
    if (decisionCategoryFilter !== "all")
      list = list.filter((d) => d.category === decisionCategoryFilter)
    if (decisionListFilter === "aligned_only") list = list.filter((d) => d.aligned === true)
    if (decisionListFilter === "needs_outcome") list = list.filter((d) => !d.outcome)
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [decisions, decisionCategoryFilter, decisionListFilter])

  // Stat counts for Tab 1 (8 from wisdom_entries, 1 from aligned_decisions)
  const statCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    WISDOM_ENTRY_TYPES.forEach((t) => {
      if (t.value === "aligned_decision") counts[t.value] = decisions.length
      else counts[t.value] = entries.filter((e) => e.entry_type === t.value).length
    })
    return counts
  }, [entries, decisions])

  const handleSaveWisdom = (entry: WisdomEntry) => {
    setEntries((prev) => [entry, ...prev])
    setLogModalOpen(false)
  }

  const handleSaveDecision = (decision: AlignedDecision, linkedEntry: WisdomEntry) => {
    setDecisions((prev) => [decision, ...prev])
    setEntries((prev) => [linkedEntry, ...prev])
    setDecisionFlowOpen(false)
  }

  const handleUpdateEntry = (updated: WisdomEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    setSelectedEntry(null)
  }

  const handleDeleteEntry = async (id: string) => {
    await supabase.from("wisdom_entries").delete().eq("id", id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setSelectedEntry(null)
  }

  const handleUpdateDecision = (updated: AlignedDecision) => {
    setDecisions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setSelectedDecision(null)
  }

  const handleDeleteDecision = async (id: string) => {
    await supabase.from("aligned_decisions").delete().eq("id", id)
    setDecisions((prev) => prev.filter((d) => d.id !== id))
    setSelectedDecision(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[#A7C2D7]/10 border border-[#A7C2D7]/20 p-1 rounded-xl">
          <TabsTrigger value="entries" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Wisdom Entries
          </TabsTrigger>
          <TabsTrigger value="decisions" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Decisions
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-[#F9D57E]/30 data-[state=active]:text-[#3C1E38]">
            Insights Dashboard
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Wisdom Entries */}
        <TabsContent value="entries" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Wisdom Log</h1>
              <p className="text-[#3C1E38]/50 text-sm mt-1">
                Processed understanding, not raw capture. What do I now know that I didn&apos;t before?
              </p>
            </div>
            <Button
              onClick={() => setLogModalOpen(true)}
              className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Log Wisdom
            </Button>
          </div>

          {/* Stat cards - horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`shrink-0 w-24 rounded-xl p-3 border text-center transition-all ${typeFilter === "all" ? "border-[#F9D57E] bg-[#F9D57E]/15 ring-2 ring-[#F9D57E]/30" : "border-[#A7C2D7]/25 bg-[#FDFCF9]"}`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#A7C2D7]/25 flex items-center justify-center mx-auto mb-1.5">
                <BookOpen className="w-4 h-4 text-[#3C1E38]" />
              </div>
              <p className="text-lg font-bold text-[#3C1E38]">{entries.length}</p>
              <p className="text-[10px] text-[#3C1E38]/60">All</p>
            </button>
            {WISDOM_ENTRY_TYPES.map((t) => {
              const Icon = getIcon(t.value)
              const count = statCounts[t.value] ?? 0
              const active = typeFilter === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className={`shrink-0 w-24 rounded-xl p-3 border text-center transition-all ${active ? "border-[#F9D57E] bg-[#F9D57E]/15 ring-2 ring-[#F9D57E]/30" : "border-[#A7C2D7]/25 bg-[#FDFCF9]"}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${t.iconBg} flex items-center justify-center mx-auto mb-1.5`}>
                    <Icon className={`w-4 h-4 ${t.iconColor}`} />
                  </div>
                  <p className="text-lg font-bold text-[#3C1E38]">{count}</p>
                  <p className="text-[10px] text-[#3C1E38]/60 truncate">{t.label}</p>
                </button>
              )
            })}
          </div>

          {/* Filter & search */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#F9D57E]/30 focus:border-[#A7C2D7] outline-none"
            />
            <div className="flex gap-1 flex-wrap">
              {(["newest", "oldest", "highlights"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${sort === s ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
                >
                  {s === "highlights" ? "Highlights Only" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Entry list */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
              <BookOpen className="w-12 h-12 text-[#A7C2D7]/40 mx-auto mb-3" />
              <p className="text-[#3C1E38]/50">No wisdom entries yet</p>
              <p className="text-sm text-[#3C1E38]/40 mt-1">Processed understanding lives here — not quick capture</p>
              <Button onClick={() => setLogModalOpen(true)} variant="outline" className="mt-4 border-[#F9D57E]/30 text-[#3C1E38]">
                <Plus className="w-4 h-4 mr-2" /> Log your first entry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => {
                const typeCfg = getTypeConfig(entry.entry_type)
                const Icon = getIcon(entry.entry_type)
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`w-full rounded-xl p-4 border border-[#A7C2D7]/15 text-left hover:shadow-md hover:border-[#F9D57E]/25 transition-all flex items-start gap-4 ${typeCfg.cardBg}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${typeCfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${typeCfg.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeCfg.badgeClass}`}>
                          {typeCfg.label}
                        </span>
                        {entry.is_highlight && <Star className="w-4 h-4 text-[#F9D57E] fill-[#F9D57E] inline" />}
                        {entry.shareable && <Share2 className="w-4 h-4 text-[#A7C2D7] inline" />}
                        {entry.connected_goal_code && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[#3C1E38]/10 text-[#3C1E38]">
                            {entry.connected_goal_code}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-[#3C1E38] mb-1">{entry.title}</h3>
                      <p className="text-sm text-[#3C1E38]/60 line-clamp-2">{entry.content}</p>
                      {entry.scripture_reference && (
                        <p className="text-xs text-[#A7C2D7] mt-1 flex items-center gap-1">
                          <BookMarked className="w-3 h-3" /> {entry.scripture_reference}
                        </p>
                      )}
                      {entry.life_areas?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.life_areas.slice(0, 3).map((area) => (
                            <span key={area} className="text-[10px] px-1.5 py-0.5 rounded bg-[#A7C2D7]/10 text-[#3C1E38]/70">
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#3C1E38]/40 shrink-0">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Decisions */}
        <TabsContent value="decisions" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Decision Log</h1>
              <p className="text-[#3C1E38]/50 text-sm mt-1">Major decisions filtered through the 5-step card</p>
            </div>
            <Button
              onClick={() => {
                setDecisionFlowOpen(true)
              }}
              className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" /> New Decision
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
              <p className="text-2xl font-bold text-[#3C1E38]">{decisions.length}</p>
              <p className="text-xs text-[#3C1E38]/50">Total Decisions</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
              <p className="text-2xl font-bold text-[#3C1E38]">
                {decisions.filter((d) => d.aligned === true).length}
              </p>
              <p className="text-xs text-[#3C1E38]/50">
                Aligned ({decisions.length ? Math.round((decisions.filter((d) => d.aligned === true).length / decisions.length) * 100) : 0}%)
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-center">
              <p className="text-2xl font-bold text-[#3C1E38]">{decisions.filter((d) => d.outcome).length}</p>
              <p className="text-xs text-[#3C1E38]/50">With Outcomes</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DECISION_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setDecisionCategoryFilter(decisionCategoryFilter === c.value ? "all" : c.value)}
                className={`text-xs px-3 py-1.5 rounded-full ${decisionCategoryFilter === c.value ? c.badgeClass + " font-medium" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
              >
                {c.label}
              </button>
            ))}
            <span className="text-[#3C1E38]/40 text-xs self-center mx-1">|</span>
            {(["all", "aligned_only", "needs_outcome"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDecisionListFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full capitalize ${decisionListFilter === f ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          {filteredDecisions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#A7C2D7]/10">
              <Scale className="w-12 h-12 text-[#A7C2D7]/40 mx-auto mb-3" />
              <p className="text-[#3C1E38]/50">No decisions logged yet</p>
              <Button onClick={() => setDecisionFlowOpen(true)} variant="outline" className="mt-4 border-[#F9D57E]/30 text-[#3C1E38]">
                <Plus className="w-4 h-4 mr-2" /> Add your first decision
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDecisions.map((d) => {
                const cat = DECISION_CATEGORIES.find((c) => c.value === d.category)
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDecision(d)}
                    className="w-full bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-left hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs text-[#3C1E38]/50">
                        {new Date(d.date).toLocaleDateString("en-US")}
                      </span>
                      {cat && <span className={`text-xs px-2 py-0.5 rounded-full ${cat.badgeClass}`}>{cat.label}</span>}
                      {d.aligned === true && <span className="text-xs text-emerald-600">✅ Aligned</span>}
                      {d.aligned === false && <span className="text-xs text-amber-600">⚠️ Misaligned</span>}
                    </div>
                    <p className="font-medium text-[#3C1E38]">{d.description}</p>
                    <div className="flex gap-1 mt-2">
                      {[d.step1_prayed, !!d.step2_scripture, d.step3_counsel, d.step4_peace, !!d.step5_dominion].map((done, i) => (
                        <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${done ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                          {done ? <Check className="w-3 h-3" /> : "—"}
                        </span>
                      ))}
                    </div>
                    {d.outcome ? (
                      <p className="text-sm text-[#3C1E38]/60 mt-2 line-clamp-1">{d.outcome}</p>
                    ) : (
                      <p className="text-xs text-[#A7C2D7] mt-2">Record Outcome →</p>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Monthly summary */}
          <div className="mt-6 p-4 bg-[#FDFCF9] rounded-xl border border-[#A7C2D7]/10 text-sm text-[#3C1E38]/70">
            This month: {decisions.filter((d) => new Date(d.date).getMonth() === new Date().getMonth()).length} decisions,{" "}
            {decisions.filter((d) => d.aligned === true && new Date(d.date).getMonth() === new Date().getMonth()).length} aligned.
            {decisions.filter((d) => !d.outcome).length > 0 && ` ${decisions.filter((d) => !d.outcome).length} awaiting outcomes.`}
          </div>
        </TabsContent>

        {/* TAB 3: Insights */}
        <TabsContent value="insights" className="mt-4">
          <InsightsDashboard entries={entries} decisions={decisions} />
        </TabsContent>
      </Tabs>

      {/* Log Wisdom Modal */}
      <LogWisdomModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        userId={userId}
        activities={activities}
        onSaved={handleSaveWisdom}
        onOpenDecisionFlow={() => {
          setLogModalOpen(false)
          setDecisionFlowOpen(true)
        }}
      />

      {/* Decision Flow Modal */}
      <Dialog open={decisionFlowOpen} onOpenChange={setDecisionFlowOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair">Aligned Decision — 5-Step Card</DialogTitle>
          </DialogHeader>
          <DecisionFlowForm
            userId={userId}
            onSaved={handleSaveDecision}
            onCancel={() => setDecisionFlowOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Entry detail modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <EntryDetailView
              entry={selectedEntry}
              getTypeConfig={getTypeConfig}
              getIcon={getIcon}
              onEdit={() => {}}
              onDelete={() => handleDeleteEntry(selectedEntry.id)}
              onClose={() => setSelectedEntry(null)}
              onViewDecision={() => {
                if (selectedEntry.entry_type === "aligned_decision") {
                  const dec = decisions.find((d) => d.wisdom_entry_id === selectedEntry.id)
                  if (dec) setSelectedDecision(dec)
                }
                setSelectedEntry(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Decision detail modal */}
      <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedDecision && (
            <DecisionDetailView
              decision={selectedDecision}
              onClose={() => setSelectedDecision(null)}
              onDelete={() => handleDeleteDecision(selectedDecision.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EntryDetailView({
  entry,
  getTypeConfig,
  getIcon,
  onEdit,
  onDelete,
  onClose,
  onViewDecision,
}: {
  entry: WisdomEntry
  getTypeConfig: (t: WisdomEntryType) => (typeof WISDOM_ENTRY_TYPES)[0]
  getIcon: (t: WisdomEntryType) => React.ComponentType<{ className?: string }>
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  onViewDecision: () => void
}) {
  const typeCfg = getTypeConfig(entry.entry_type)
  const Icon = getIcon(entry.entry_type)
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${typeCfg.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${typeCfg.iconColor}`} />
          </div>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeCfg.badgeClass}`}>{typeCfg.label}</span>
            <DialogTitle className="font-playfair mt-1">{entry.title}</DialogTitle>
          </div>
        </div>
      </DialogHeader>
      <div className="mt-4 space-y-4">
        <p className="text-xs text-[#3C1E38]/50">
          {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <p className="text-[#3C1E38]/90 whitespace-pre-wrap">{entry.content}</p>
        {entry.scripture_reference && (
          <p className="text-sm text-[#A7C2D7] flex items-center gap-1">
            <BookMarked className="w-4 h-4" /> {entry.scripture_reference}
            {entry.scripture_text && <span className="text-[#3C1E38]/70"> — {entry.scripture_text}</span>}
          </p>
        )}
        {entry.sources && <p className="text-sm text-[#3C1E38]/60"><strong>Sources:</strong> {entry.sources}</p>}
        {entry.life_areas?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.life_areas.map((a) => (
              <span key={a} className="text-xs px-2 py-1 rounded bg-[#A7C2D7]/10 text-[#3C1E38]/80">{a}</span>
            ))}
          </div>
        )}
        {entry.connected_goal_code && <p className="text-sm">Goal: {entry.connected_goal_code}</p>}
        {entry.entry_type === "aligned_decision" && (
          <Button variant="outline" size="sm" onClick={onViewDecision} className="border-[#A7C2D7]/30">
            View Decision Details
          </Button>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onDelete} className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  )
}

function DecisionDetailView({
  decision,
  onClose,
  onDelete,
}: {
  decision: AlignedDecision
  onClose: () => void
  onDelete: () => void
}) {
  const cat = DECISION_CATEGORIES.find((c) => c.value === decision.category)
  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-playfair">Decision: {decision.description}</DialogTitle>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-xs text-[#3C1E38]/50">{new Date(decision.date).toLocaleDateString("en-US")}</span>
          {cat && <span className={`text-xs px-2 py-0.5 rounded-full ${cat.badgeClass}`}>{cat.label}</span>}
          {decision.aligned !== null && (
            <span className={decision.aligned ? "text-emerald-600 text-xs" : "text-amber-600 text-xs"}>
              {decision.aligned ? "✅ Aligned" : "⚠️ Misaligned"}
            </span>
          )}
        </div>
      </DialogHeader>
      <div className="mt-4 space-y-4 text-sm">
        {decision.context && <p><strong>Context:</strong> {decision.context}</p>}
        <div>
          <strong>5 steps:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Prayed: {decision.step1_prayed ? "Yes" : "No"} {decision.step1_note && `— ${decision.step1_note}`}</li>
            <li>Scripture: {decision.step2_scripture || "—"} {decision.step2_note && `— ${decision.step2_note}`}</li>
            <li>Counsel: {decision.step3_counsel ? `Yes (${decision.step3_who})` : "No"} {decision.step3_note && `— ${decision.step3_note}`}</li>
            <li>Peace: {decision.step4_peace ? "Yes" : "No"} {decision.step4_note && `— ${decision.step4_note}`}</li>
            <li>Dominion: {decision.step5_dominion || "—"}</li>
          </ul>
        </div>
        {decision.outcome && (
          <div>
            <strong>Outcome:</strong> {decision.outcome}
            {decision.outcome_date && <span className="text-[#3C1E38]/50 ml-2">({new Date(decision.outcome_date).toLocaleDateString()})</span>}
            {decision.outcome_rating != null && (
              <p className="mt-1">{OUTCOME_RATING_LABELS[decision.outcome_rating]}</p>
            )}
          </div>
        )}
        {decision.lesson_learned && <p><strong>Lesson:</strong> {decision.lesson_learned}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onDelete} className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  )
}
