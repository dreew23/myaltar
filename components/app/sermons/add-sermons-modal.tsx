"use client"

import { useState, useMemo } from "react"
import { Search, Star, Crown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export interface SermonForPicker {
  id: string
  title: string
  speaker: string
  category: string
  resonance: number | null
  mastered: boolean
  created_at: string
  mastery_key_principle: string | null
  tags: string[]
}

interface AddSermonsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sermons: SermonForPicker[]
  alreadyAddedIds: string[]
  onAdd: (sermonIds: string[]) => void
  onOpenAddNew?: () => void
}

export function AddSermonsModal({
  open,
  onOpenChange,
  sermons,
  alreadyAddedIds,
  onAdd,
  onOpenAddNew,
}: AddSermonsModalProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const available = useMemo(() => {
    return sermons.filter((s) => !alreadyAddedIds.includes(s.id))
  }, [sermons, alreadyAddedIds])

  const filtered = useMemo(() => {
    let list = available
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.mastery_key_principle && s.mastery_key_principle.toLowerCase().includes(q)) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (categoryFilter.length > 0) {
      list = list.filter((s) => categoryFilter.includes(s.category))
    }
    return list
  }, [available, search, categoryFilter])

  const recentlyAdded = useMemo(() => [...available].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5), [available])
  const topRated = useMemo(() => [...available].filter((s) => s.resonance !== null && s.resonance >= 4).sort((a, b) => (b.resonance ?? 0) - (a.resonance ?? 0)).slice(0, 5), [available])
  const mastered = useMemo(() => [...available].filter((s) => s.mastered).slice(0, 5), [available])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    onAdd(Array.from(selectedIds))
    setSelectedIds(new Set())
    onOpenChange(false)
  }

  const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-playfair">Add sermons to this week</DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 min-h-0 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3C1E38]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, key principle, tags..."
              className="w-full pl-9 pr-3 py-2.5 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none bg-white"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-[#3C1E38]/50 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = categoryFilter.includes(cat.value)
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter((prev) => (active ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]))}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${active ? `${cat.color} text-white` : "bg-[#A7C2D7]/10 text-[#3C1E38]/60 hover:bg-[#A7C2D7]/20"}`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick add */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-[#A7C2D7]/15 p-2">
              <p className="text-[10px] uppercase text-[#3C1E38]/50 mb-1.5">Recently added</p>
              {recentlyAdded.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSelect(s.id)}
                  className="block w-full text-left text-xs py-1 truncate hover:bg-[#A7C2D7]/10 rounded px-1.5"
                >
                  {selectedIds.has(s.id) ? "✓ " : ""}{s.title}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-[#A7C2D7]/15 p-2">
              <p className="text-[10px] uppercase text-[#3C1E38]/50 mb-1.5 flex items-center gap-1"><Star className="w-3 h-3" /> Top rated</p>
              {topRated.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSelect(s.id)}
                  className="block w-full text-left text-xs py-1 truncate hover:bg-[#A7C2D7]/10 rounded px-1.5"
                >
                  {selectedIds.has(s.id) ? "✓ " : ""}{s.title}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-[#A7C2D7]/15 p-2">
              <p className="text-[10px] uppercase text-[#3C1E38]/50 mb-1.5 flex items-center gap-1"><Crown className="w-3 h-3" /> Mastered</p>
              {mastered.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSelect(s.id)}
                  className="block w-full text-left text-xs py-1 truncate hover:bg-[#A7C2D7]/10 rounded px-1.5"
                >
                  {selectedIds.has(s.id) ? "✓ " : ""}{s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto border border-[#A7C2D7]/10 rounded-lg">
            <p className="text-xs font-medium text-[#3C1E38]/50 px-3 py-2 border-b border-[#A7C2D7]/10">Browse all ({filtered.length})</p>
            <ul className="divide-y divide-[#A7C2D7]/10 max-h-48 overflow-y-auto">
              {filtered.map((s) => {
                const c = categoryMap[s.category] ?? categoryMap.uncategorized
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelect(s.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#FDFCF9] transition-colors"
                    >
                      <span className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${selectedIds.has(s.id) ? "bg-[#F9D57E] border-[#F9D57E]" : "border-[#A7C2D7]/30"}`}>
                        {selectedIds.has(s.id) && <span className="text-[#3C1E38] text-xs">✓</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#3C1E38] truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#3C1E38]/50">{s.speaker}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${c.color}`}>{c.label}</span>
                          {s.resonance != null && <span className="text-[10px] text-[#F9D57E]">★ {s.resonance}</span>}
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {onOpenAddNew && (
            <p className="text-xs text-[#3C1E38]/50">
              Don&apos;t see it?{" "}
              <button type="button" onClick={() => { onOpenChange(false); onOpenAddNew() }} className="text-[#A7C2D7] hover:underline font-medium">
                Add a new sermon
              </button>
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#A7C2D7]/10">
            <span className="text-sm text-[#3C1E38]/60">{selectedIds.size} selected</span>
            <Button onClick={handleAdd} disabled={selectedIds.size === 0} className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
              Add {selectedIds.size} sermon{selectedIds.size !== 1 ? "s" : ""} to this week
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
