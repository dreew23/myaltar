"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  SAVED_PRAYER_CATEGORIES,
  WARFARE_CATEGORIES,
  type SavedPrayer,
  type WarfareScripture,
} from "@/lib/prayer"
import { prayerAreas } from "@/lib/data/dominion"

interface Props {
  savedPrayers: SavedPrayer[]
  warfareScriptures: WarfareScripture[]
  userId: string
  onSavedPrayersUpdate: (p: SavedPrayer[]) => void
  onWarfareUpdate: (w: WarfareScripture[]) => void
}

export function ToolkitTab({
  savedPrayers,
  warfareScriptures,
  userId,
  onSavedPrayersUpdate,
  onWarfareUpdate,
}: Props) {
  const [prayerFilter, setPrayerFilter] = useState<string>("all")
  const [prayerFormOpen, setPrayerFormOpen] = useState(false)
  const [warfareFormOpen, setWarfareFormOpen] = useState(false)
  const [prayNowPrayer, setPrayNowPrayer] = useState<SavedPrayer | null>(null)
  const [prayNowWarfare, setPrayNowWarfare] = useState<WarfareScripture | null>(null)

  const supabase = createClient()
  const filteredPrayers = prayerFilter === "all"
    ? savedPrayers
    : savedPrayers.filter((p) => p.category === prayerFilter)

  const markPrayerUsed = async (prayer: SavedPrayer) => {
    const today = new Date().toISOString().split("T")[0]
    await supabase
      .from("saved_prayers")
      .update({
        use_count: (prayer.use_count ?? 0) + 1,
        last_used_date: today,
      })
      .eq("id", prayer.id)
    onSavedPrayersUpdate(
      savedPrayers.map((p) =>
        p.id === prayer.id
          ? { ...p, use_count: (p.use_count ?? 0) + 1, last_used_date: today }
          : p
      )
    )
    setPrayNowPrayer(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Prayer Toolkit</h1>
        <p className="text-[#3C1E38]/50 text-sm mt-1">Saved prayers, warfare scriptures, and rotation reference</p>
      </div>

      {/* Saved Prayers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-lg text-[#3C1E38]">My Prayer Collection</h2>
          <Button
            size="sm"
            onClick={() => setPrayerFormOpen(true)}
            className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
          >
            <Plus className="w-4 h-4 mr-1" /> Save Prayer
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setPrayerFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm ${prayerFilter === "all" ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
          >
            All
          </button>
          {SAVED_PRAYER_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setPrayerFilter(c.value)}
              className={`px-3 py-1.5 rounded-full text-sm ${prayerFilter === c.value ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredPrayers.length === 0 ? (
            <p className="text-[#3C1E38]/50 text-sm">No saved prayers yet</p>
          ) : (
            filteredPrayers.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-[#3C1E38]">{p.title}</h3>
                    <p className="text-xs text-[#3C1E38]/50 mt-0.5">{SAVED_PRAYER_CATEGORIES.find((c) => c.value === p.category)?.label} · {p.source || "Personal"}</p>
                    <p className="text-sm text-[#3C1E38]/70 mt-2 line-clamp-2">{p.content}</p>
                    {p.scripture_references?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.scripture_references.map((ref) => (
                          <span key={ref} className="text-xs px-2 py-0.5 rounded bg-[#A7C2D7]/10 text-[#3C1E38]/80">{ref}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-[#3C1E38]/40 mt-2">Prayed {p.use_count ?? 0} times</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#A7C2D7]/30 shrink-0"
                    onClick={() => setPrayNowPrayer(p)}
                  >
                    Pray Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Warfare Scriptures */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-lg text-[#3C1E38]">Warfare Arsenal</h2>
          <Button
            size="sm"
            onClick={() => setWarfareFormOpen(true)}
            className="bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Scripture
          </Button>
        </div>
        <div className="space-y-4">
          {WARFARE_CATEGORIES.map((cat) => {
            const list = warfareScriptures.filter((w) => w.battle_category === cat.value)
            if (list.length === 0) return null
            return (
              <div key={cat.value} className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
                <h3 className="font-medium text-[#3C1E38] mb-2">{cat.label} ({list.length})</h3>
                <div className="space-y-3">
                  {list.map((w) => (
                    <div key={w.id} className="border-t border-[#A7C2D7]/10 pt-3 first:border-0 first:pt-0">
                      <p className="font-medium text-[#3C1E38]">{w.scripture_reference}</p>
                      <p className="text-sm text-[#3C1E38]/70 font-[family-name:var(--font-eb-garamond)] italic">{w.scripture_text}</p>
                      {w.how_to_pray_it && <p className="text-xs text-[#A7C2D7] mt-1">{w.how_to_pray_it.slice(0, 120)}…</p>}
                      {w.is_tested && <span className="text-xs text-emerald-600">Tested ✓</span>}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 text-[#A7C2D7]"
                        onClick={() => setPrayNowWarfare(w)}
                      >
                        Pray This
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {warfareScriptures.length === 0 && (
            <p className="text-[#3C1E38]/50 text-sm">No warfare scriptures yet</p>
          )}
        </div>
      </section>

      {/* 10-Area Rotation Reference */}
      <section className="bg-[#FDFCF9] rounded-2xl border border-[#A7C2D7]/20 p-6">
        <h2 className="font-playfair text-lg text-[#3C1E38] mb-4">10-Area Prayer Rotation</h2>
        <p className="text-sm text-[#3C1E38]/70 mb-4">
          This rotation ensures every area of your DOMINION journey receives focused prayer attention each week.
        </p>
        <div className="grid gap-2 text-sm">
          {prayerAreas.map((area, i) => (
            <div key={area} className="flex items-center gap-2">
              <span className="text-[#3C1E38]/50 w-6">{i + 1}.</span>
              <span className="text-[#3C1E38]">{area}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pray Now modal - saved prayer (dark) */}
      {prayNowPrayer && (
        <div className="fixed inset-0 z-50 bg-[#1B2341] flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-playfair text-xl text-[#F9D57E]">{prayNowPrayer.title}</h2>
            <button onClick={() => setPrayNowPrayer(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className="font-[family-name:var(--font-eb-garamond)] text-lg text-white/90 leading-relaxed whitespace-pre-wrap">
              {prayNowPrayer.content}
            </p>
            {prayNowPrayer.scripture_references?.length > 0 && (
              <p className="text-[#F9D57E] mt-4">{prayNowPrayer.scripture_references.join(" · ")}</p>
            )}
          </div>
          <Button
            className="w-full mt-4 bg-[#F9D57E] text-[#1B2341]"
            onClick={() => markPrayerUsed(prayNowPrayer)}
          >
            Mark as Prayed
          </Button>
        </div>
      )}

      {/* Pray Now - warfare (dark) */}
      {prayNowWarfare && (
        <div className="fixed inset-0 z-50 bg-[#1B2341] flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-playfair text-xl text-[#F9D57E]">{prayNowWarfare.scripture_reference}</h2>
            <button onClick={() => setPrayNowWarfare(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            <p className="font-[family-name:var(--font-eb-garamond)] text-lg text-white/90 italic">{prayNowWarfare.scripture_text}</p>
            {prayNowWarfare.how_to_pray_it && (
              <div>
                <p className="text-[#F9D57E] text-sm font-medium">How to pray it</p>
                <p className="text-white/80 text-sm whitespace-pre-wrap">{prayNowWarfare.how_to_pray_it}</p>
              </div>
            )}
          </div>
          <button onClick={() => setPrayNowWarfare(null)} className="mt-4 text-white/60 text-sm">Close</button>
        </div>
      )}

      {/* Add prayer modal - minimal for now */}
      <Dialog open={prayerFormOpen} onOpenChange={setPrayerFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Save Prayer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#3C1E38]/60">Add prayer form (title, category, content, scripture refs) — implement full form as needed.</p>
          <Button onClick={() => setPrayerFormOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={warfareFormOpen} onOpenChange={setWarfareFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Add Warfare Scripture</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#3C1E38]/60">Add warfare form (category, reference, text, how to pray) — implement full form as needed.</p>
          <Button onClick={() => setWarfareFormOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
