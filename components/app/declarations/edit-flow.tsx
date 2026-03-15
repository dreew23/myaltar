"use client"

import { useState } from "react"
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { AREAS, TARGET_PRESETS, type Declaration, type Area } from "./types"

interface Props {
  declarations: Declaration[]
  userId: string
  onSaved: (updated: Declaration[]) => void
  onArchiveAll: () => void
}

interface EditRow {
  id?: string
  area: Area
  content: string
  scripture_reference: string
  scripture_text: string
  target_count: number
  active: boolean
  _delete?: boolean
}

export function EditFlow({ declarations, userId, onSaved, onArchiveAll }: Props) {
  const supabase = createClient()
  const [rows, setRows] = useState<EditRow[]>(
    declarations.map((d) => ({
      id: d.id,
      area: d.area,
      content: d.content,
      scripture_reference: d.scripture_reference,
      scripture_text: d.scripture_text ?? "",
      target_count: d.target_count,
      active: d.active,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [archiveConfirm, setArchiveConfirm] = useState(false)

  const updateRow = (i: number, fields: Partial<EditRow>) => {
    setRows((prev) => prev.map((r, j) => j === i ? { ...r, ...fields } : r))
  }

  const moveRow = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    setRows((prev) => {
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const addRow = () => {
    setRows((prev) => [...prev, {
      area: AREAS[Math.min(prev.length, AREAS.length - 1)].key,
      content: "",
      scripture_reference: "",
      scripture_text: "",
      target_count: 1,
      active: true,
    }])
  }

  const markDelete = (i: number) => {
    const row = rows[i]
    if (row.id) {
      updateRow(i, { _delete: true })
    } else {
      setRows((prev) => prev.filter((_, j) => j !== i))
    }
    setDeleteConfirm(null)
  }

  const save = async () => {
    setSaving(true)

    // Delete marked rows
    const toDelete = rows.filter((r) => r._delete && r.id)
    for (const r of toDelete) {
      await supabase.from("declarations").delete().eq("id", r.id!)
    }

    // Upsert remaining rows
    const active = rows.filter((r) => !r._delete)
    const upserts = active.map((r, i) => ({
      ...(r.id ? { id: r.id } : {}),
      user_id: userId,
      display_order: i + 1,
      area: r.area,
      content: r.content,
      scripture_reference: r.scripture_reference,
      scripture_text: r.scripture_text || null,
      target_count: r.target_count,
      active: r.active,
    }))

    const results: Declaration[] = []
    for (const row of upserts) {
      if ("id" in row && row.id) {
        const { data } = await supabase.from("declarations").update(row).eq("id", row.id).select().single()
        if (data) results.push(data as Declaration)
      } else {
        const { data } = await supabase.from("declarations").insert(row).select().single()
        if (data) results.push(data as Declaration)
      }
    }

    onSaved(results.sort((a, b) => a.display_order - b.display_order))
    toast.success("Declarations saved")
    setSaving(false)
  }

  const handleArchiveAll = async () => {
    setSaving(true)
    await supabase.from("declarations").update({ active: false }).eq("user_id", userId).eq("active", true)
    setArchiveConfirm(false)
    setSaving(false)
    onArchiveAll()
    toast.success("All declarations archived")
  }

  const activeRows = rows.filter((r) => !r._delete)

  return (
    <div className="space-y-4">
      {activeRows.map((row, i) => {
        const realIndex = rows.indexOf(row)
        return (
          <div key={realIndex} className="bg-white rounded-xl border border-[#A7C2D7]/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#3C1E38]/50">{i + 1}.</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveRow(realIndex, -1)} disabled={i === 0} className="p-1 text-[#3C1E38]/30 hover:text-[#3C1E38] disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => moveRow(realIndex, 1)} disabled={i === activeRows.length - 1} className="p-1 text-[#3C1E38]/30 hover:text-[#3C1E38] disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirm(realIndex)} className="p-1 text-rose-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide">Area</label>
              <select value={row.area} onChange={(e) => updateRow(realIndex, { area: e.target.value as Area })} className="w-full mt-1 px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#A7C2D7]/20">
                {AREAS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select>
            </div>

            {/* Declaration text */}
            <div>
              <label className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide">Declaration</label>
              <textarea value={row.content} onChange={(e) => updateRow(realIndex, { content: e.target.value })} rows={2} placeholder="I declare that..." className="w-full mt-1 px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-[#A7C2D7]/20" />
            </div>

            {/* Scripture */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide">Scripture Ref</label>
                <input type="text" value={row.scripture_reference} onChange={(e) => updateRow(realIndex, { scripture_reference: e.target.value })} placeholder="e.g., Psalm 23:1" className="w-full mt-1 px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#A7C2D7]/20" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide">Verse text</label>
                <input type="text" value={row.scripture_text} onChange={(e) => updateRow(realIndex, { scripture_text: e.target.value })} placeholder="The actual verse" className="w-full mt-1 px-3 py-2 border border-[#A7C2D7]/20 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#A7C2D7]/20" />
              </div>
            </div>

            {/* Target + Active */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide">Daily Target</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" min={1} value={row.target_count} onChange={(e) => updateRow(realIndex, { target_count: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-[#A7C2D7]/20" />
                  <div className="flex gap-1">
                    {TARGET_PRESETS.slice(0, 5).map((n) => (
                      <button key={n} onClick={() => updateRow(realIndex, { target_count: n })} className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${row.target_count === n ? "bg-[#F9D57E]/20 border-[#F9D57E]/50 text-[#3C1E38]" : "border-[#A7C2D7]/15 text-[#3C1E38]/40"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-medium text-[#3C1E38]/40 uppercase tracking-wide">Active</label>
                <Switch checked={row.active} onCheckedChange={(v) => updateRow(realIndex, { active: v })} />
              </div>
            </div>
          </div>
        )
      })}

      {/* Add */}
      <button onClick={addRow} className="w-full py-3 rounded-xl border-2 border-dashed border-[#A7C2D7]/20 text-[#A7C2D7] hover:border-[#A7C2D7]/40 hover:text-[#3C1E38] transition-all flex items-center justify-center gap-2 text-sm">
        <Plus className="w-4 h-4" /> Add Declaration
      </button>

      {/* Save */}
      <Button onClick={save} disabled={saving} className="w-full bg-[#F9D57E] hover:bg-[#F9D57E]/90 text-[#3C1E38] font-medium py-6">
        {saving ? "Saving..." : "Save All Changes"}
      </Button>

      {/* Archive */}
      <div className="pt-4 border-t border-[#A7C2D7]/10">
        <p className="text-xs text-[#3C1E38]/40 italic mb-3">Review your declarations at each quarter boundary. Archive what feels flat. Write what resonates with where God has you now.</p>
        <Button variant="outline" onClick={() => setArchiveConfirm(true)} className="w-full text-rose-500 border-rose-200 hover:bg-rose-50">
          Archive All & Start Fresh
        </Button>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete declaration?</DialogTitle></DialogHeader>
          <p className="text-sm text-[#3C1E38]/60">History will be preserved.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
            <Button onClick={() => deleteConfirm !== null && markDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive confirm */}
      <Dialog open={archiveConfirm} onOpenChange={setArchiveConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Archive all declarations?</DialogTitle></DialogHeader>
          <p className="text-sm text-[#3C1E38]/60">This will archive all current declarations and give you fresh slots. Your history is preserved.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setArchiveConfirm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleArchiveAll} disabled={saving} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">
              {saving ? "Archiving..." : "Archive All"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
