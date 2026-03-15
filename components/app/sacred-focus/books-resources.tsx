"use client"

import { useState } from "react"
import { BookOpen, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Props {
  activityId: string
  resources: string[]
  onResourcesChange: (resources: string[]) => void
}

export function BooksResources({ activityId, resources, onResourcesChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState("")

  const handleAdd = async () => {
    if (!newItem.trim()) return
    const updated = [...resources, newItem.trim()]
    const supabase = createClient()
    const { error } = await supabase
      .from("spiritual_activities")
      .update({ books_resources: updated })
      .eq("id", activityId)

    if (error) {
      toast.error("Failed to add resource")
      return
    }
    onResourcesChange(updated)
    setNewItem("")
    setAdding(false)
  }

  const handleRemove = async (index: number) => {
    const updated = resources.filter((_, i) => i !== index)
    const supabase = createClient()
    const { error } = await supabase
      .from("spiritual_activities")
      .update({ books_resources: updated })
      .eq("id", activityId)

    if (error) {
      toast.error("Failed to remove resource")
      return
    }
    onResourcesChange(updated)
  }

  if (resources.length === 0 && !adding) {
    return (
      <button
        onClick={() => { setAdding(true); setExpanded(true) }}
        className="flex items-center gap-1.5 text-xs text-[#3C1E38]/30 hover:text-[#3C1E38]/50 transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5" />
        Add Books & Resources
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#A7C2D7]/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-[#A7C2D7]/5 transition-colors"
      >
        <BookOpen className="w-4 h-4 text-[#A7C2D7]" />
        <span className="text-sm font-medium text-[#3C1E38] flex-1">
          Books & Resources ({resources.length})
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#3C1E38]/30" /> : <ChevronDown className="w-4 h-4 text-[#3C1E38]/30" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1.5">
          {resources.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 group py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A7C2D7]/40 flex-shrink-0" />
              <span className="text-sm text-[#3C1E38]/70 flex-1">{item}</span>
              <button
                onClick={() => handleRemove(i)}
                className="opacity-0 group-hover:opacity-100 text-[#3C1E38]/20 hover:text-red-500 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {adding ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Book or resource name"
                autoFocus
                className="flex-1 px-2.5 py-1.5 border border-[#A7C2D7]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#A7C2D7]/30 focus:border-[#A7C2D7] outline-none"
              />
              <button onClick={handleAdd} className="text-[#A7C2D7] hover:text-[#A7C2D7]/80 text-sm font-medium">Add</button>
              <button onClick={() => { setAdding(false); setNewItem("") }} className="text-[#3C1E38]/30 hover:text-[#3C1E38]/50">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-[#A7C2D7] hover:text-[#A7C2D7]/80 mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Resource
            </button>
          )}
        </div>
      )}
    </div>
  )
}
