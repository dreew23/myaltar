"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  SESSION_TYPES,
  MOOD_BEFORE_OPTIONS,
  MOOD_AFTER_OPTIONS,
} from "@/lib/prayer"
import { prayerAreas, getTodayPrayerAreas } from "@/lib/data/dominion"
import type { PrayerSession } from "@/lib/prayer"

interface Props {
  sessions: PrayerSession[]
  todaySession: PrayerSession | null
  activities: { id: string; title: string }[]
  userId: string
  onSessionsUpdate: (sessions: PrayerSession[]) => void
}

export function JournalTab({
  sessions,
  todaySession,
  activities,
  userId,
  onSessionsUpdate,
}: Props) {
  const [filterType, setFilterType] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    session_type: (todaySession?.session_type ?? "morning") as PrayerSession["session_type"],
    duration_minutes: todaySession?.duration_minutes ?? 30,
    connected_activity_id: todaySession?.connected_activity_id ?? "",
    journal_entry: todaySession?.journal_entry ?? "",
    breakthroughs: todaySession?.breakthroughs ?? "",
    what_god_said: todaySession?.what_god_said ?? "",
    quality_rating: todaySession?.quality_rating ?? null as number | null,
    presence_level: todaySession?.presence_level ?? null as number | null,
    tongues_minutes: todaySession?.tongues_minutes ?? 0,
    worship_included: todaySession?.worship_included ?? false,
    warfare_engaged: todaySession?.warfare_engaged ?? false,
    mood_before: todaySession?.mood_before ?? "" as PrayerSession["mood_before"] | "",
    mood_after: todaySession?.mood_after ?? "" as PrayerSession["mood_after"] | "",
    focus_areas_covered: todaySession?.focus_areas_covered ?? [] as string[],
    scripture_used: todaySession?.scripture_used ?? [] as string[],
    prayer_requests_prayed: todaySession?.prayer_requests_prayed ?? [] as string[],
    intercession_theme_completed: todaySession?.intercession_theme_completed ?? false,
  })
  const [saving, setSaving] = useState(false)
  const todayAreas = getTodayPrayerAreas()

  const supabase = createClient()
  const todayStr = new Date().toISOString().split("T")[0]

  const showForm = !todaySession || !todaySession.journal_entry
  const filteredSessions = filterType === "all"
    ? sessions
    : sessions.filter((s) => s.session_type === filterType)

  const toggleArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      focus_areas_covered: prev.focus_areas_covered.includes(area)
        ? prev.focus_areas_covered.filter((a) => a !== area)
        : [...prev.focus_areas_covered, area],
    }))
  }

  const saveSession = async () => {
    setSaving(true)
    if (todaySession) {
      const { data } = await supabase
        .from("prayer_sessions")
        .update({
          session_type: form.session_type,
          duration_minutes: form.duration_minutes,
          connected_activity_id: form.connected_activity_id || null,
          journal_entry: form.journal_entry || null,
          breakthroughs: form.breakthroughs || null,
          what_god_said: form.what_god_said || null,
          quality_rating: form.quality_rating,
          presence_level: form.presence_level,
          tongues_minutes: form.tongues_minutes,
          worship_included: form.worship_included,
          warfare_engaged: form.warfare_engaged,
          mood_before: form.mood_before || null,
          mood_after: form.mood_after || null,
          focus_areas_covered: form.focus_areas_covered,
          scripture_used: form.scripture_used,
          prayer_requests_prayed: form.prayer_requests_prayed,
          intercession_theme_completed: form.intercession_theme_completed,
        })
        .eq("id", todaySession.id)
        .select()
        .single()
      if (data) onSessionsUpdate(sessions.map((s) => (s.id === todaySession.id ? data : s)))
    } else {
      const { data } = await supabase
        .from("prayer_sessions")
        .insert({
          user_id: userId,
          date: todayStr,
          session_type: form.session_type,
          duration_minutes: form.duration_minutes,
          connected_activity_id: form.connected_activity_id || null,
          journal_entry: form.journal_entry || null,
          breakthroughs: form.breakthroughs || null,
          what_god_said: form.what_god_said || null,
          quality_rating: form.quality_rating,
          presence_level: form.presence_level,
          tongues_minutes: form.tongues_minutes,
          worship_included: form.worship_included,
          warfare_engaged: form.warfare_engaged,
          mood_before: form.mood_before || null,
          mood_after: form.mood_after || null,
          focus_areas_covered: form.focus_areas_covered,
          scripture_used: form.scripture_used,
          prayer_requests_prayed: form.prayer_requests_prayed,
          intercession_theme_completed: form.intercession_theme_completed,
        })
        .select()
        .single()
      if (data) onSessionsUpdate([data, ...sessions])
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Prayer Journal</h1>
        <p className="text-[#3C1E38]/50 text-sm mt-1">Record what happened during your time with God</p>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#A7C2D7]/20 p-6 space-y-6">
          <h2 className="font-playfair text-lg text-[#3C1E38]">How was your time with God today?</h2>

          <div>
            <p className="text-sm font-medium text-[#3C1E38]/80 mb-2">Session type</p>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setForm({ ...form, session_type: t.value })}
                  className={`px-3 py-1.5 rounded-full text-sm ${form.session_type === t.value ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-[#FDFCF9] border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Duration (min)</label>
              <input
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Connected activity</label>
              <select
                value={form.connected_activity_id}
                onChange={(e) => setForm({ ...form, connected_activity_id: e.target.value })}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg"
              >
                <option value="">None</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Journal entry</label>
            <textarea
              value={form.journal_entry}
              onChange={(e) => setForm({ ...form, journal_entry: e.target.value })}
              placeholder="What happened in prayer today? What did you pray about, what did you sense, what shifted?"
              rows={6}
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg resize-y"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Breakthroughs (optional)</label>
            <textarea
              value={form.breakthroughs}
              onChange={(e) => setForm({ ...form, breakthroughs: e.target.value })}
              placeholder="Any breakthrough moments?"
              rows={2}
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg resize-y"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">What God said (optional)</label>
            <textarea
              value={form.what_god_said}
              onChange={(e) => setForm({ ...form, what_god_said: e.target.value })}
              placeholder="What did you hear? You can also capture as Divine Download."
              rows={2}
              className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg resize-y"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Quality (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, quality_rating: n })}
                    className={`w-8 h-8 rounded-full text-sm ${form.quality_rating === n ? "bg-[#F9D57E] text-[#3C1E38]" : "bg-[#A7C2D7]/20 text-[#3C1E38]/60"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Presence (1-10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={form.presence_level ?? 5}
                onChange={(e) => setForm({ ...form, presence_level: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-[#3C1E38]/50">{form.presence_level ?? 5}</span>
            </div>
            <div>
              <label className="text-sm font-medium text-[#3C1E38]/80 block mb-1">Tongues (min)</label>
              <input
                type="number"
                min={0}
                value={form.tongues_minutes}
                onChange={(e) => setForm({ ...form, tongues_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#A7C2D7]/20 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="worship"
                checked={form.worship_included}
                onChange={(e) => setForm({ ...form, worship_included: e.target.checked })}
              />
              <label htmlFor="worship" className="text-sm text-[#3C1E38]/80">Worship included</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="warfare"
                checked={form.warfare_engaged}
                onChange={(e) => setForm({ ...form, warfare_engaged: e.target.checked })}
              />
              <label htmlFor="warfare" className="text-sm text-[#3C1E38]/80">Warfare engaged</label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#3C1E38]/80 block mb-2">Mood before → after</label>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={form.mood_before}
                onChange={(e) => setForm({ ...form, mood_before: e.target.value as PrayerSession["mood_before"] })}
                className="px-3 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-sm"
              >
                <option value="">—</option>
                {MOOD_BEFORE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="text-[#3C1E38]/50">→</span>
              <select
                value={form.mood_after}
                onChange={(e) => setForm({ ...form, mood_after: e.target.value as PrayerSession["mood_after"] })}
                className="px-3 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-sm"
              >
                <option value="">—</option>
                {MOOD_AFTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#3C1E38]/80 block mb-2">Life areas prayed for</label>
            <div className="flex flex-wrap gap-2">
              {prayerAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-full text-xs ${form.focus_areas_covered.includes(area) ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-[#FDFCF9] border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
                >
                  {todayAreas.includes(area) ? `🎯 ${area}` : area}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="intercession"
              checked={form.intercession_theme_completed}
              onChange={(e) => setForm({ ...form, intercession_theme_completed: e.target.checked })}
            />
            <label htmlFor="intercession" className="text-sm text-[#3C1E38]/80">Intercession theme complete</label>
          </div>

          <Button
            onClick={saveSession}
            disabled={saving}
            className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
          >
            {saving ? "Saving..." : "Save Session"}
          </Button>
        </div>
      )}

      <div>
        <h2 className="font-playfair text-lg text-[#3C1E38] mb-3">Session history</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full text-sm ${filterType === "all" ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
          >
            All
          </button>
          {SESSION_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 rounded-full text-sm ${filterType === t.value ? "bg-[#A7C2D7]/30 text-[#3C1E38]" : "bg-white border border-[#A7C2D7]/20 text-[#3C1E38]/70"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filteredSessions.length === 0 ? (
          <p className="text-[#3C1E38]/50 text-sm">No sessions yet</p>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="w-full bg-white rounded-xl p-4 border border-[#A7C2D7]/10 text-left hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#3C1E38]">
                    {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#A7C2D7]/20 text-[#3C1E38] capitalize">{s.session_type}</span>
                  {s.duration_minutes && <span className="text-[#3C1E38]/50 text-sm">{s.duration_minutes} min</span>}
                  {s.quality_rating && <span className="text-[#F9D57E] text-sm">★ {s.quality_rating}</span>}
                  {s.warfare_engaged && <span className="text-xs text-rose-600">Warfare</span>}
                  {s.tongues_minutes > 0 && <span className="text-xs text-[#3C1E38]/50">🗣️ {s.tongues_minutes}m</span>}
                </div>
                {(s.mood_before || s.mood_after) && (
                  <p className="text-xs text-[#3C1E38]/50 capitalize">
                    {s.mood_before} → {s.mood_after}
                  </p>
                )}
                {s.journal_entry && (
                  <p className="text-sm text-[#3C1E38]/70 mt-1 line-clamp-2">{s.journal_entry}</p>
                )}
                {expandedId === s.id && (
                  <div className="mt-4 pt-4 border-t border-[#A7C2D7]/10 text-sm text-[#3C1E38]/80 whitespace-pre-wrap">
                    {s.journal_entry}
                    {s.breakthroughs && <p className="mt-2"><strong>Breakthroughs:</strong> {s.breakthroughs}</p>}
                    {s.what_god_said && <p className="mt-2"><strong>What God said:</strong> {s.what_god_said}</p>}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
