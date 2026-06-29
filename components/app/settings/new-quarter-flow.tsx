"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, Calendar, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { QuarterRow } from "./quarter-config"
import { localCalendarDateString } from "@/lib/prayer-week"
import { countCompletedSessionsForQuarter } from "@/lib/quarter-context"

interface NewQuarterFlowProps {
  userId: string
  currentQuarters: QuarterRow[]
  onClose: () => void
  onComplete: () => void
}

export function NewQuarterFlow({ userId, currentQuarters, onClose, onComplete }: NewQuarterFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [completedSessionCount, setCompletedSessionCount] = useState<number | null>(null)

  const activeQuarter = currentQuarters.find((q) => q.is_active)
  const nextStart = activeQuarter
    ? (() => {
        const d = new Date(activeQuarter.end_date + "T12:00:00")
        d.setDate(d.getDate() + 1)
        return localCalendarDateString(d)
      })()
    : localCalendarDateString()
  const defaultEnd = (() => {
    const d = new Date(nextStart + "T12:00:00")
    d.setDate(d.getDate() + 90)
    return localCalendarDateString(d)
  })()

  const [form, setForm] = useState({
    name: "Momentum & Mastery",
    start_date: nextStart,
    end_date: defaultEnd,
    year_number: 2,
  })

  useEffect(() => {
    if (!activeQuarter) {
      setCompletedSessionCount(0)
      return
    }
    let cancelled = false
    ;(async () => {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const { data } = await supabase
        .from("pulse_sessions")
        .select("completed_at, quarter_code")
        .eq("user_id", userId)
        .eq("quarter_code", activeQuarter.code)
      if (cancelled) return
      setCompletedSessionCount(countCompletedSessionsForQuarter(activeQuarter.code, data ?? [], null))
    })()
    return () => {
      cancelled = true
    }
  }, [activeQuarter, userId])

  const handleActivate = async () => {
    setSaving(true)
    const supabase = (await import("@/lib/supabase/client")).createClient()

    // Deactivate the current quarter. Stamp archived_at when available, but fall
    // back gracefully if that column hasn't been migrated yet.
    if (activeQuarter) {
      const archivedAt = new Date().toISOString()
      let deErr = (
        await supabase
          .from("quarter_config")
          .update({ is_active: false, archived_at: archivedAt })
          .eq("id", activeQuarter.id)
      ).error
      if (deErr && /archived_at/i.test(deErr.message)) {
        deErr = (
          await supabase
            .from("quarter_config")
            .update({ is_active: false })
            .eq("id", activeQuarter.id)
        ).error
      }
      if (deErr) {
        setSaving(false)
        toast.error("Could not archive current quarter — " + deErr.message)
        return
      }
    }

    const code = `Y${form.year_number}-${new Date(form.start_date + "T12:00:00").getFullYear()}`
    const { error: insErr } = await supabase.from("quarter_config").insert({
      user_id: userId,
      code,
      name: form.name,
      start_date: form.start_date,
      end_date: form.end_date,
      year_number: form.year_number,
      is_active: true,
    })
    setSaving(false)
    if (insErr) {
      toast.error("Could not create new quarter — " + insErr.message)
      return
    }
    toast.success("New quarter activated")
    onComplete()
    router.refresh()
  }

  const totalSteps = activeQuarter ? 4 : 3
  const formStep = activeQuarter ? 2 : 1

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#FDFCF9] border-[#A7C2D7]/20">
        <DialogHeader>
          <DialogTitle className="font-playfair text-[#3C1E38] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#F9D57E]" />
            Start New Quarter
          </DialogTitle>
        </DialogHeader>

        {step === 1 && activeQuarter && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-[#A7C2D7]/25 bg-[#A7C2D7]/5 p-4">
              <Archive className="h-5 w-5 text-[#3C1E38]/60 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-[#3C1E38]/80">
                <p className="font-medium text-[#3C1E38]">Archive current quarter</p>
                <p>
                  <strong>{activeQuarter.name}</strong> ({activeQuarter.code})
                </p>
                <p>
                  {activeQuarter.start_date} – {activeQuarter.end_date}
                </p>
                <p>
                  Completed planning sessions:{" "}
                  {completedSessionCount == null ? "…" : `${completedSessionCount}/13`}
                </p>
                <p className="text-[#3C1E38]/60">
                  Your pulse sessions and checklists are kept — they move to Past Quarters for review. Nothing is
                  deleted.
                </p>
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === formStep && (
          <div className="space-y-4">
            <p className="text-sm text-[#3C1E38]/70">Set up your new quarter.</p>
            <div className="space-y-2">
              <Label>Quarter Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Momentum & Mastery"
                className="border-[#A7C2D7]/30"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => {
                  const start = e.target.value
                  const d = new Date(start + "T12:00:00")
                  d.setDate(d.getDate() + 90)
                  setForm((p) => ({ ...p, start_date: start, end_date: localCalendarDateString(d) }))
                }}
                className="border-[#A7C2D7]/30"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                className="border-[#A7C2D7]/30"
              />
            </div>
            <div className="space-y-2">
              <Label>Year Number (1–4)</Label>
              <select
                value={form.year_number}
                onChange={(e) => setForm((p) => ({ ...p, year_number: Number(e.target.value) }))}
                className="flex h-9 w-full rounded-md border border-[#A7C2D7]/30 bg-white px-3 py-1 text-sm"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>Year {n}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {activeQuarter && (
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-[#A7C2D7]/30">
                  Back
                </Button>
              )}
              <Button
                onClick={() => setStep(formStep + 1)}
                className={`${activeQuarter ? "flex-1" : "w-full"} bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]`}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === formStep + 1 && (
          <div className="space-y-4">
            <p className="text-sm text-[#3C1E38]/70">Review & refresh (optional)</p>
            <div className="space-y-3 rounded-lg border border-[#A7C2D7]/20 p-3">
              <p className="text-sm font-medium text-[#3C1E38]">Would you like to review and refresh your declarations?</p>
              <Link href="/app/declarations" className="text-sm text-[#A7C2D7] hover:underline block">Edit declarations →</Link>
            </div>
            <div className="space-y-3 rounded-lg border border-[#A7C2D7]/20 p-3">
              <p className="text-sm font-medium text-[#3C1E38]">Any goals to adjust for the new quarter?</p>
              <a href="#goal-config" onClick={onClose} className="text-sm text-[#A7C2D7] hover:underline block">Goal Configuration below →</a>
            </div>
            <div className="space-y-3 rounded-lg border border-[#A7C2D7]/20 p-3">
              <p className="text-sm font-medium text-[#3C1E38]">Update your intercession schedule?</p>
              <a href="#intercession-schedule" onClick={onClose} className="text-sm text-[#A7C2D7] hover:underline block">Intercession Schedule below →</a>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(formStep)} className="flex-1 border-[#A7C2D7]/30">Back</Button>
              <Button onClick={() => setStep(formStep + 2)} className="flex-1 bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === formStep + 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-[#3C1E38]">Start {form.name}?</p>
            <div className="rounded-lg bg-[#A7C2D7]/10 p-3 text-sm text-[#3C1E38]/80">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Dates:</strong> {form.start_date} – {form.end_date}</p>
              <p><strong>Year:</strong> {form.year_number}</p>
              {activeQuarter && (
                <p className="mt-2 text-[#3C1E38]/60">
                  {activeQuarter.name} will be archived. Your next Pulse session starts at Week 1.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(formStep + 1)} className="flex-1 border-[#A7C2D7]/30">Back</Button>
              <Button
                onClick={handleActivate}
                disabled={saving}
                className="flex-1 bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38]"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate Quarter"}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-[#3C1E38]/40">Step {step} of {totalSteps}</p>
      </DialogContent>
    </Dialog>
  )
}
