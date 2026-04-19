"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import {
  SAVED_PRAYER_CATEGORIES,
  WARFARE_CATEGORIES,
  type PrayerChallengeRow,
  type SavedPrayer,
  type WarfareScripture,
} from "@/lib/prayer"
import { prayerAreas } from "@/lib/data/dominion"
import { localCalendarDateString, mondayDateString } from "@/lib/prayer-week"
import type { IntercessionDayRow } from "@/components/app/settings/intercession-editor"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface Props {
  savedPrayers: SavedPrayer[]
  warfareScriptures: WarfareScripture[]
  userId: string
  onSavedPrayersUpdate: (p: SavedPrayer[]) => void
  onWarfareUpdate: (w: WarfareScripture[]) => void
  intercessionSchedule: IntercessionDayRow[] | null
  challenges: PrayerChallengeRow[]
  onChallengesUpdate: (rows: PrayerChallengeRow[]) => void
}

export function ToolkitTab({
  savedPrayers,
  warfareScriptures,
  userId,
  onSavedPrayersUpdate,
  onWarfareUpdate,
  intercessionSchedule,
  challenges,
  onChallengesUpdate,
}: Props) {
  const [prayerFilter, setPrayerFilter] = useState<string>("all")
  const [prayerFormOpen, setPrayerFormOpen] = useState(false)
  const [warfareFormOpen, setWarfareFormOpen] = useState(false)
  const [prayNowPrayer, setPrayNowPrayer] = useState<SavedPrayer | null>(null)
  const [prayNowWarfare, setPrayNowWarfare] = useState<WarfareScripture | null>(null)
  const [challengeRows, setChallengeRows] = useState(challenges)

  useEffect(() => {
    setChallengeRows(challenges)
  }, [challenges])

  const supabase = createClient()
  const schedule =
    intercessionSchedule && intercessionSchedule.length === 7
      ? [...intercessionSchedule].sort((a, b) => a.day_of_week - b.day_of_week)
      : null

  const bumpChallenge = async (c: PrayerChallengeRow, delta: number) => {
    const mon = mondayDateString()
    let base = c
    if (c.week_start_monday !== mon) {
      await supabase.from("prayer_challenges").update({ weekly_progress: 0, week_start_monday: mon }).eq("id", c.id)
      base = { ...c, weekly_progress: 0, week_start_monday: mon }
    }
    const next = Math.max(0, base.weekly_progress + delta)
    const { data } = await supabase
      .from("prayer_challenges")
      .update({ weekly_progress: next, week_start_monday: mon })
      .eq("id", c.id)
      .select()
      .single()
    if (data) {
      const row = data as PrayerChallengeRow
      setChallengeRows((prev) => {
        const u = prev.map((x) => (x.id === c.id ? row : x))
        onChallengesUpdate(u)
        return u
      })
    }
  }
  const filteredPrayers = prayerFilter === "all"
    ? savedPrayers
    : savedPrayers.filter((p) => p.category === prayerFilter)

  const markPrayerUsed = async (prayer: SavedPrayer) => {
    const today = localCalendarDateString()
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
    <div className="space-y-6">
      <div>
        <h1 className="font-prayer-display text-2xl font-semibold text-[#2c2419]">Toolkit</h1>
        <p className="mt-1 text-sm text-[#2c2419]/55">Saved prayers, warfare, framework, intercession, challenges</p>
      </div>

      <Tabs defaultValue="saved" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-[#ede9e0] p-1 sm:grid-cols-5">
          <TabsTrigger value="saved" className="text-xs sm:text-sm">
            Saved Prayers
          </TabsTrigger>
          <TabsTrigger value="warfare" className="text-xs sm:text-sm">
            Warfare
          </TabsTrigger>
          <TabsTrigger value="framework" className="text-xs sm:text-sm">
            Framework
          </TabsTrigger>
          <TabsTrigger value="intercession" className="text-xs sm:text-sm">
            Intercession
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs sm:text-sm">
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-4">
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
        </TabsContent>

        <TabsContent value="warfare" className="mt-4">
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
        </TabsContent>

        <TabsContent value="framework" className="mt-4">
          <section className="rounded-2xl border border-[var(--prayer-border)] bg-[#faf8f4] p-4">
            <h2 className="font-prayer-display mb-3 text-lg text-[#b8860b]">Weekly framework</h2>
            <p className="mb-4 text-sm text-[#2c2419]/70">
              Seven columns — life areas assigned per day. Edit in Settings for full control.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 max-[600px]:grid-cols-2">
              {DAY_LABELS.map((label, i) => {
                const row = schedule?.find((r) => r.day_of_week === i)
                const isToday = new Date().getDay() === i
                return (
                  <div
                    key={label}
                    className={`min-h-[100px] rounded-xl border p-2 text-xs ${
                      isToday ? "border-[#d4a017] bg-[#f5f2ec]" : "border-[var(--prayer-border)] bg-white"
                    }`}
                  >
                    <p className="font-medium text-[#2c2419]">{label}</p>
                    <p className="mt-1 line-clamp-3 text-[#2c2419]/70">
                      {(row?.life_areas ?? []).join(", ") || "—"}
                    </p>
                  </div>
                )
              })}
            </div>
            <Link href="/app/settings#intercession-schedule" className="mt-4 inline-block text-sm text-[#2471a3] underline">
              Edit rotation in Settings →
            </Link>
          </section>
        </TabsContent>

        <TabsContent value="intercession" className="mt-4">
          <section className="space-y-3">
            <p className="text-sm text-[#2c2419]/70">
              Daily themes and people power the gold focus card in Prayer Mode. Edit below in Settings.
            </p>
            {schedule?.map((row) => {
              const isToday = new Date().getDay() === row.day_of_week
              return (
                <div
                  key={row.day_of_week}
                  className={`rounded-xl border p-4 ${isToday ? "border-[#d4a017] bg-[#f5f2ec]" : "border-[var(--prayer-border)] bg-white"}`}
                >
                  <p className="font-prayer-display text-lg italic text-[#b8860b]">{DAY_LABELS[row.day_of_week]}</p>
                  <p className="mt-1 font-medium">{row.theme}</p>
                  <p className="mt-2 text-sm text-[#2c2419]/80">People: {(row.people ?? []).join(", ") || "—"}</p>
                  <p className="mt-1 text-sm text-[#2c2419]/70">Areas: {(row.life_areas ?? []).join(", ") || "—"}</p>
                </div>
              )
            })}
            {!schedule && (
              <p className="text-sm text-[#2c2419]/50">No 7-day schedule yet — set it in Settings.</p>
            )}
            <Link href="/app/settings#intercession-schedule" className="inline-block text-sm font-medium text-[#2471a3] underline">
              Open Intercession Schedule →
            </Link>
          </section>
        </TabsContent>

        <TabsContent value="challenges" className="mt-4">
          <section className="rounded-2xl border border-[var(--prayer-border)] bg-[#f5f2ec] p-4">
            <h2 className="font-prayer-display text-lg text-[#b8860b]">Weekly challenges</h2>
            <p className="mt-1 text-sm text-[#2c2419]/65">Cumulative progress this week (resets each Monday).</p>
            <div className="mt-4 space-y-3">
              {challengeRows.length === 0 ? (
                <p className="text-sm text-[#2c2419]/50">No challenges — defaults are created when you run the latest migration.</p>
              ) : (
                challengeRows.map((c) => {
                  const target = c.daily_target * 7
                  const pct = Math.min(100, (c.weekly_progress / Math.max(1, target)) * 100)
                  return (
                    <div key={c.id} className="rounded-xl border border-[var(--prayer-border)] bg-white p-3">
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{c.label}</span>
                        <span className="text-[#b8860b]">
                          {c.weekly_progress}/{target} {c.unit}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#ede9e0]">
                        <div className="h-full bg-[#d4a017]" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded border px-2 text-xs"
                          onClick={() => void bumpChallenge(c, -1)}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="rounded border px-2 text-xs"
                          onClick={() => void bumpChallenge(c, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <section className="rounded-2xl border border-[var(--prayer-border)] bg-white p-4">
        <h2 className="font-prayer-display text-lg text-[#2c2419]">10-area reference</h2>
        <div className="mt-2 grid gap-1 text-sm text-[#2c2419]/80">
          {prayerAreas.map((area, i) => (
            <div key={area} className="flex gap-2">
              <span className="w-6 text-[#2c2419]/40">{i + 1}.</span>
              <span>{area}</span>
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
