"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CounterRing } from "./counter-ring"
import { createClient } from "@/lib/supabase/client"
import { ensureOnlineFor, isOnlineNow } from "@/lib/online-guard"
import { localCalendarDateString } from "@/lib/prayer-week"
import type { Declaration, DeclarationLog } from "./types"

interface Props {
  declarations: Declaration[]
  logs: Record<string, DeclarationLog>
  userId: string
  onCountUpdate: (declId: string, count: number) => void
}

const AREAS: Record<string, string> = {
  identity: "IDENTITY", authority: "AUTHORITY", health: "HEALTH",
  career: "CAREER", finances: "FINANCES", wisdom: "WISDOM",
  protection: "PROTECTION", relationships: "RELATIONSHIPS",
  purpose: "PURPOSE", legacy: "LEGACY",
}

export function RecitationMode({ declarations, logs, userId, onCountUpdate }: Props) {
  const supabase = createClient()
  const [current, setCurrent] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const c: Record<string, number> = {}
    declarations.forEach((d) => { c[d.id] = logs[d.id]?.current_count ?? 0 })
    return c
  })
  const [tapAnim, setTapAnim] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [manualInput, setManualInput] = useState(false)
  const [manualValue, setManualValue] = useState("")

  // Touch swipe
  const touchStart = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced writes
  const pending = useRef<Record<string, number>>({})
  const timers = useRef<Record<string, NodeJS.Timeout>>({})

  const flushOne = useCallback(async (declId: string, increment: number) => {
    if (!isOnlineNow()) return
    const decl = declarations.find((d) => d.id === declId)
    if (!decl) return
    const newCount = counts[declId] ?? 0
    const completed = newCount >= decl.target_count

    const today = localCalendarDateString()
    await supabase.from("declaration_logs").upsert({
      user_id: userId,
      declaration_id: declId,
      date: today,
      current_count: newCount,
      target_count: decl.target_count,
      completed,
    }, { onConflict: "user_id,declaration_id,date" })
  }, [supabase, userId, declarations, counts])

  // Flush all pending on unmount
  useEffect(() => {
    return () => {
      Object.keys(pending.current).forEach((id) => {
        clearTimeout(timers.current[id])
        if (pending.current[id] > 0) flushOne(id, pending.current[id])
      })
    }
  }, [flushOne])

  const decl = declarations[current]
  if (!decl) return null

  const count = counts[decl.id] ?? 0
  const completed = count >= decl.target_count
  const totalCompleted = declarations.filter((d) => (counts[d.id] ?? 0) >= d.target_count).length
  const allDone = totalCompleted === declarations.length

  const handleDeclare = () => {
    if (!ensureOnlineFor("save declaration progress")) return
    const newCount = count + 1
    setCounts((p) => ({ ...p, [decl.id]: newCount }))
    onCountUpdate(decl.id, newCount)

    // Tap animation
    setTapAnim(true)
    setTimeout(() => setTapAnim(false), 150)

    // Haptic
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10)

    // Debounced write
    pending.current[decl.id] = (pending.current[decl.id] ?? 0) + 1
    clearTimeout(timers.current[decl.id])
    timers.current[decl.id] = setTimeout(() => {
      flushOne(decl.id, pending.current[decl.id])
      pending.current[decl.id] = 0
    }, 2000)
  }

  const handleReset = async () => {
    if (!ensureOnlineFor("reset this declaration count")) return
    setCounts((p) => ({ ...p, [decl.id]: 0 }))
    onCountUpdate(decl.id, 0)
    pending.current[decl.id] = 0
    clearTimeout(timers.current[decl.id])
    const today = localCalendarDateString()
    await supabase.from("declaration_logs").upsert({
      user_id: userId, declaration_id: decl.id, date: today,
      current_count: 0, target_count: decl.target_count, completed: false,
    }, { onConflict: "user_id,declaration_id,date" })
    setResetConfirm(false)
  }

  const handleManualSet = async () => {
    const val = parseInt(manualValue)
    if (isNaN(val) || val < 0) return
    if (!ensureOnlineFor("set this declaration count")) return
    setCounts((p) => ({ ...p, [decl.id]: val }))
    onCountUpdate(decl.id, val)
    pending.current[decl.id] = 0
    clearTimeout(timers.current[decl.id])
    const today = localCalendarDateString()
    await supabase.from("declaration_logs").upsert({
      user_id: userId, declaration_id: decl.id, date: today,
      current_count: val, target_count: decl.target_count, completed: val >= decl.target_count,
    }, { onConflict: "user_id,declaration_id,date" })
    setManualInput(false)
    setManualValue("")
  }

  const navigate = (dir: -1 | 1) => {
    // Flush current before navigating
    if (pending.current[decl.id] > 0) {
      clearTimeout(timers.current[decl.id])
      if (isOnlineNow()) {
        flushOne(decl.id, pending.current[decl.id])
      }
      pending.current[decl.id] = 0
    }
    setCurrent((p) => Math.max(0, Math.min(declarations.length - 1, p + dir)))
  }

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(diff) > 50) navigate(diff > 0 ? -1 : 1)
    touchStart.current = null
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#1B2341] rounded-2xl min-h-[70vh] flex flex-col relative select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-white/50 text-sm">Declaration {current + 1} of {declarations.length}</span>
        <span className="text-[#F9D57E] text-xs uppercase tracking-widest font-medium">{AREAS[decl.area] ?? decl.area}</span>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Declaration text */}
        <p className="font-garamond text-xl md:text-2xl text-white leading-relaxed text-center italic max-w-lg">
          {decl.content}
        </p>

        {/* Gold divider */}
        <div className="border-b border-[#F9D57E]/30 w-24 mx-auto my-4" />

        {/* Scripture */}
        <p className="text-[#F9D57E] font-medium text-base text-center">{decl.scripture_reference}</p>
        {decl.scripture_text && (
          <p className="text-white/60 text-sm text-center font-garamond mt-1 max-w-md">{decl.scripture_text}</p>
        )}

        {/* Counter ring */}
        <div className="mt-8 mb-4">
          <CounterRing current={count} target={decl.target_count} completed={completed} />
        </div>

        {/* Declare button */}
        <button
          onClick={handleDeclare}
          className={`w-16 h-16 rounded-full text-2xl font-bold transition-all duration-100 ${
            completed
              ? "bg-[#F9D57E]/10 border-2 border-[#F9D57E]/20 text-[#F9D57E]/60"
              : "bg-[#F9D57E]/20 border-2 border-[#F9D57E]/40 text-[#F9D57E]"
          } ${tapAnim ? "scale-95" : "scale-100"}`}
        >
          +
        </button>

        {completed && (
          <p className="text-[#F9D57E] text-sm mt-2 animate-in fade-in duration-300">✓ Complete</p>
        )}

        {/* Reset */}
        <button
          onClick={() => setResetConfirm(true)}
          className="text-white/20 hover:text-white/40 text-xs mt-3 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>

        {/* Manual input (double-click counter) */}
        <button
          onDoubleClick={() => { setManualValue(String(count)); setManualInput(true) }}
          className="sr-only"
        >
          manual
        </button>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => navigate(-1)}
        disabled={current === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 disabled:opacity-0 transition-all p-2"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => navigate(1)}
        disabled={current === declarations.length - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 disabled:opacity-0 transition-all p-2"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-3">
        {declarations.map((d, i) => {
          const c = counts[d.id] ?? 0
          const done = c >= d.target_count
          const inProgress = c > 0 && !done
          return (
            <button
              key={d.id}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current
                  ? "bg-[#F9D57E] w-4"
                  : done
                  ? "bg-[#F9D57E]/70"
                  : inProgress
                  ? "bg-[#F9D57E]/30"
                  : "border border-white/30 bg-transparent"
              }`}
            />
          )
        })}
      </div>

      {/* Bottom summary bar */}
      <div className={`rounded-b-2xl px-6 py-3 text-center text-sm font-medium transition-colors ${
        allDone ? "bg-[#F9D57E] text-[#1B2341]" : "bg-white/5 text-white/50"
      }`}>
        {allDone
          ? "All declarations complete ✦"
          : `Today: ${totalCompleted} of ${declarations.length} declarations completed`}
      </div>

      {/* Reset confirm dialog */}
      <Dialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Reset count?</DialogTitle></DialogHeader>
          <p className="text-sm text-[#3C1E38]/60">Reset count for this declaration today?</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setResetConfirm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleReset} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">Reset</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual input dialog */}
      <Dialog open={manualInput} onOpenChange={setManualInput}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Set count manually</DialogTitle></DialogHeader>
          <input
            type="number" min={0} value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-center text-2xl font-playfair outline-none focus:ring-2 focus:ring-[#F9D57E]/30"
            autoFocus
          />
          <Button onClick={handleManualSet} className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">Set</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
