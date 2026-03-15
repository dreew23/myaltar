"use client"

import { useState, useRef } from "react"
import { Database, Download, Upload, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionCard } from "./section-card"
import { StorageUsage } from "./storage-usage"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface DataManagementProps {
  userId: string
  storageCounts: Record<string, number>
  quarterStartStr: string
  quarterEndStr: string
  quarterCode: string
  onExport?: () => void
  onImport?: () => void
  onReset?: () => void
}

export function DataManagement({
  userId,
  storageCounts,
  quarterStartStr,
  quarterEndStr,
  quarterCode,
  onExport,
  onImport,
  onReset,
}: DataManagementProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resetTyped, setResetTyped] = useState("")
  const [resetting, setResetting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const tables = [
        "quarter_config", "daily_devotions", "profiles", "declarations", "declaration_logs",
        "divine_downloads", "wisdom_entries", "aligned_decisions", "prayer_sessions", "prayer_requests",
        "prayers", "pulse_checks", "pulse_sessions", "goal_notes", "weekly_goals", "intercession_schedule", "goals", "daily_focus",
      ]
      const data: Record<string, unknown[]> = {
        exported_at: [new Date().toISOString()],
        user_id: [userId],
      }
      await Promise.all(
        tables.map(async (table) => {
          try {
            const { data: rows } = await supabase.from(table).select("*").eq("user_id", userId)
            data[table] = rows ?? []
          } catch {
            data[table] = []
          }
        })
      )
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `altar-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported ✓")
      onExport?.()
    } catch (e) {
      console.error(e)
      toast.error("Export failed")
    }
    setExporting(false)
  }

  const handleImportClick = () => fileInputRef.current?.click()
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const json = JSON.parse(text) as Record<string, unknown[]>
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const tables = Object.keys(json).filter((k) => Array.isArray(json[k]) && k !== "exported_at" && k !== "user_id")
      for (const table of tables) {
        const rows = json[table] as Record<string, unknown>[]
        for (const row of rows) {
          if (row && typeof row === "object" && "user_id" in row) {
            try {
              await supabase.from(table).upsert({ ...row, user_id: userId }, { onConflict: "id", ignoreDuplicates: true })
            } catch {
              // skip failed rows
            }
          }
        }
      }
      toast.success("Import complete")
      onImport?.()
    } catch (err) {
      toast.error("Invalid or failed import")
    }
    setImporting(false)
    e.target.value = ""
  }

  const handleResetConfirm = async () => {
    if (resetTyped !== "RESET") return
    setResetting(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      await supabase.from("daily_devotions").delete().eq("user_id", userId).gte("date", quarterStartStr).lte("date", quarterEndStr)
      await supabase.from("declaration_logs").delete().eq("user_id", userId).gte("date", quarterStartStr).lte("date", quarterEndStr)
      await supabase.from("pulse_checks").delete().eq("user_id", userId).eq("quarter_code", quarterCode)
      await supabase.from("pulse_sessions").delete().eq("user_id", userId).gte("date", quarterStartStr).lte("date", quarterEndStr)
      await supabase.from("daily_focus").delete().eq("user_id", userId).gte("date", quarterStartStr).lte("date", quarterEndStr)
      const { data: wg } = await supabase.from("weekly_goals").select("id, week_start_date").eq("user_id", userId)
      for (const row of wg ?? []) {
        const d = row.week_start_date
        if (d >= quarterStartStr && d <= quarterEndStr) await supabase.from("weekly_goals").delete().eq("id", row.id)
      }
      toast.success("Quarter data reset ✓")
      setResetConfirmOpen(false)
      setResetTyped("")
      onReset?.()
    } catch (e) {
      toast.error("Reset failed")
    }
    setResetting(false)
  }

  return (
    <SectionCard
      id="data-management"
      icon={Database}
      iconBg="bg-[#A7C2D7]/20"
      iconColor="text-[#3C1E38]"
      title="Data Management"
      subtitle="Export, backup, and manage your spiritual data"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-[#A7C2D7]/20 p-4">
          <p className="font-medium text-[#3C1E38]">Export All Data</p>
          <p className="text-sm text-[#3C1E38]/60 mt-1">Download all your ALTAR data as a JSON file.</p>
          <Button variant="outline" onClick={handleExport} disabled={exporting} className="mt-2 border-[#F9D57E] text-[#3C1E38] hover:bg-[#F9D57E]/10">
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export as JSON
          </Button>
        </div>
        <div className="rounded-lg border border-[#A7C2D7]/20 p-4">
          <p className="font-medium text-[#3C1E38]">Import Data</p>
          <p className="text-sm text-[#3C1E38]/60 mt-1">Restore from a previous ALTAR backup file. Merges with existing data.</p>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          <Button variant="outline" onClick={handleImportClick} disabled={importing} className="mt-2 border-[#A7C2D7]/30">
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import JSON
          </Button>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4">
          <p className="font-medium text-rose-800">Reset Current Quarter</p>
          <p className="text-sm text-rose-700/80 mt-1">Clear daily devotions, pulse checks, and declaration logs for the current quarter. Keeps declarations, goals, sermons, prayers, and permanent data.</p>
          <Button variant="outline" onClick={() => setResetConfirmOpen(true)} className="mt-2 border-rose-300 text-rose-700 hover:bg-rose-100">
            Reset Quarter Data
          </Button>
        </div>
        <StorageUsage counts={storageCounts} />
      </div>

      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-[#FDFCF9] border-[#A7C2D7]/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
              Confirm reset
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#3C1E38]/80">Type <strong>RESET</strong> to confirm. This cannot be undone.</p>
          <div className="space-y-2">
            <Label>Confirmation</Label>
            <Input value={resetTyped} onChange={(e) => setResetTyped(e.target.value)} placeholder="RESET" className="border-rose-200 font-mono" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetConfirm} disabled={resetTyped !== "RESET" || resetting}>
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  )
}
