"use client"

import Link from "next/link"
import { buildDailyFocusChecklist, type DailyFocusRow } from "@/lib/daily-focus-checklist"
import { localCalendarDateString } from "@/lib/prayer-week"
import { ArrowLeft, CheckCircle2, Circle, Flame, Headphones, Zap, Calendar, ChevronDown } from "lucide-react"

interface LogEntry {
  id: string
  date: string
  prayer_complete: boolean
  declarations_complete: boolean
  gratitude_complete: boolean
  sermons_today: number
  energy_score: number
  gratitude_items: string[] | null
}

interface Props {
  logs: LogEntry[]
  /** Per calendar date: Phase 5 daily focus + saved checklist state from `daily_focus` */
  dailyFocusByDate: Record<string, DailyFocusRow>
}

export function PrayerHistoryClient({ logs, dailyFocusByDate }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateStr === localCalendarDateString(today)) return "Today"
    if (dateStr === localCalendarDateString(yesterday)) return "Yesterday"
    
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const getCompletionScore = (log: LogEntry) => {
    let score = 0
    if (log.prayer_complete) score++
    if (log.declarations_complete) score++
    if (log.gratitude_complete) score++
    if (log.sermons_today > 0) score++
    return score
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/app/dashboard" className="p-2 rounded-lg hover:bg-[#A7C2D7]/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#3C1E38]/50" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Prayer Log History</h1>
          <p className="text-sm text-[#3C1E38]/50">
            Your spiritual journey over the past 30 days — expand a day to see your saved Sunday Planning daily focus checklist.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-[#3C1E38]/50">Prayer Days</span>
          </div>
          <p className="font-playfair text-2xl font-bold text-[#3C1E38]">
            {logs.filter(l => l.prayer_complete).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
          <div className="flex items-center gap-2 mb-1">
            <Headphones className="w-4 h-4 text-[#A7C2D7]" />
            <span className="text-xs text-[#3C1E38]/50">Total Sermons</span>
          </div>
          <p className="font-playfair text-2xl font-bold text-[#3C1E38]">
            {logs.reduce((sum, l) => sum + (l.sermons_today || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#F9D57E]" />
            <span className="text-xs text-[#3C1E38]/50">Avg Energy</span>
          </div>
          <p className="font-playfair text-2xl font-bold text-[#3C1E38]">
            {logs.length > 0 ? (logs.reduce((sum, l) => sum + (l.energy_score || 5), 0) / logs.length).toFixed(1) : "-"}
          </p>
        </div>
      </div>

      {/* Log List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-[#A7C2D7]/10 text-center">
            <Calendar className="w-12 h-12 text-[#A7C2D7]/30 mx-auto mb-3" />
            <p className="text-[#3C1E38]/50">No prayer logs yet</p>
            <p className="text-xs text-[#3C1E38]/30 mt-1">Start logging your daily devotions from the dashboard</p>
          </div>
        ) : (
          logs.map((log) => {
            const df = dailyFocusByDate[log.date]
            const dailyChecklist = df ? buildDailyFocusChecklist(df) : []
            return (
            <div key={log.id} className="bg-white rounded-xl p-4 border border-[#A7C2D7]/10 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    getCompletionScore(log) >= 3 ? "bg-emerald-100" : getCompletionScore(log) >= 2 ? "bg-amber-100" : "bg-gray-100"
                  }`}>
                    <span className={`text-sm font-bold ${
                      getCompletionScore(log) >= 3 ? "text-emerald-600" : getCompletionScore(log) >= 2 ? "text-amber-600" : "text-gray-400"
                    }`}>
                      {getCompletionScore(log)}/4
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#3C1E38]">{formatDate(log.date)}</p>
                    <p className="text-xs text-[#3C1E38]/40">{log.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#F9D57E]/10 rounded-full">
                    <Zap className="w-3 h-3 text-[#F9D57E]" />
                    <span className="text-xs font-medium text-[#3C1E38]">{log.energy_score}/10</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                  log.prayer_complete ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"
                }`}>
                  {log.prayer_complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  Prayer
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                  log.declarations_complete ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"
                }`}>
                  {log.declarations_complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  Declarations
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                  log.gratitude_complete ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"
                }`}>
                  {log.gratitude_complete ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  Gratitude
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                  log.sermons_today > 0 ? "bg-[#A7C2D7]/10 text-[#3C1E38]" : "bg-gray-50 text-gray-400"
                }`}>
                  <Headphones className="w-3 h-3" />
                  {log.sermons_today} sermon{log.sermons_today !== 1 ? "s" : ""}
                </span>
              </div>

              {log.gratitude_items && log.gratitude_items.length > 0 && log.gratitude_items.some(Boolean) && (
                <div className="mt-3 pt-3 border-t border-[#A7C2D7]/10">
                  <p className="text-xs text-[#3C1E38]/40 mb-1">Gratitude:</p>
                  <ul className="space-y-1">
                    {log.gratitude_items.filter(Boolean).map((item, i) => (
                      <li key={i} className="text-sm text-[#3C1E38]/70">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {dailyChecklist.length > 0 && df && (
                <details className="group mt-3 pt-3 border-t border-[#A7C2D7]/10">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-[#A7C2D7] hover:underline [&::-webkit-details-marker]:hidden">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                    Daily plan checklist (Sunday Planning)
                  </summary>
                  <p className="mt-2 text-[10px] text-[#3C1E38]/40">Saved from your dashboard — same as Phase 5 daily focus for this date.</p>
                  <ul className="mt-2 space-y-2">
                    {dailyChecklist.map((item) => {
                      const done = Boolean(df[item.completedKey])
                      return (
                        <li key={item.completedKey} className="flex items-start gap-2 text-sm">
                          {done ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#3C1E38]/30" aria-hidden />
                          )}
                          <span className={done ? "leading-snug text-[#3C1E38]/45 line-through" : "leading-snug text-[#3C1E38]/85"}>
                            {item.text}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </details>
              )}
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}
