"use client"

import { useState, useMemo } from "react"
import { Pencil, X } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { RecitationMode } from "@/components/app/declarations/recitation-mode"
import { ViewAll } from "@/components/app/declarations/view-all"
import { History } from "@/components/app/declarations/history"
import { EditFlow } from "@/components/app/declarations/edit-flow"
import { FirstTime } from "@/components/app/declarations/first-time"
import type { Declaration, DeclarationLog } from "@/components/app/declarations/types"

interface Props {
  declarations: Declaration[]
  todayLogs: DeclarationLog[]
  userId: string
}

export function DeclarationsClient({ declarations: initial, todayLogs: initialLogs, userId }: Props) {
  const [declarations, setDeclarations] = useState<Declaration[]>(initial)
  const [todayLogs, setTodayLogs] = useState<DeclarationLog[]>(initialLogs)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState("recite")
  const [skipped, setSkipped] = useState(false)

  const isFirstTime = declarations.length === 0 && !skipped

  // Build logs lookup: declaration_id → log
  const logsMap = useMemo(() => {
    const map: Record<string, DeclarationLog> = {}
    todayLogs.forEach((l) => { map[l.declaration_id] = l })
    return map
  }, [todayLogs])

  // Update count from recitation mode (optimistic)
  const handleCountUpdate = (declId: string, count: number) => {
    setTodayLogs((prev) => {
      const existing = prev.find((l) => l.declaration_id === declId)
      const decl = declarations.find((d) => d.id === declId)
      const target = decl?.target_count ?? 1
      if (existing) {
        return prev.map((l) =>
          l.declaration_id === declId
            ? { ...l, current_count: count, completed: count >= target }
            : l
        )
      }
      // Optimistic new log entry
      return [...prev, {
        id: crypto.randomUUID(),
        user_id: userId,
        declaration_id: declId,
        date: new Date().toISOString().split("T")[0],
        current_count: count,
        target_count: target,
        completed: count >= target,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]
    })
  }

  // Jump from View All to Recite tab at specific index
  const jumpToRecite = (index: number) => {
    setTab("recite")
    // Small hack: force remount by setting a key (handled in RecitationMode via startIndex)
  }

  // First-time experience
  if (isFirstTime) {
    return (
      <FirstTime
        userId={userId}
        onCreated={(decls) => {
          setDeclarations(decls)
          setTab("recite")
        }}
        onSkip={() => {
          setSkipped(true)
          setEditing(true)
        }}
      />
    )
  }

  // Edit mode
  if (editing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Edit Declarations</h1>
          <button onClick={() => setEditing(false)} className="text-[#3C1E38]/40 hover:text-[#3C1E38] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <EditFlow
          declarations={declarations}
          userId={userId}
          onSaved={(updated) => {
            setDeclarations(updated.filter((d) => d.active))
            setEditing(false)
          }}
          onArchiveAll={() => {
            setDeclarations([])
            setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38]">Declarations</h1>
          <p className="text-sm text-[#3C1E38]/50 mt-1">Scripture-rooted words of power</p>
        </div>
        <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-[#A7C2D7]/10 text-[#3C1E38]/40 hover:text-[#3C1E38] transition-colors">
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 bg-[#A7C2D7]/10">
          <TabsTrigger value="recite">Recite</TabsTrigger>
          <TabsTrigger value="viewall">View All</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="recite">
          {declarations.length > 0 ? (
            <RecitationMode
              declarations={declarations}
              logs={logsMap}
              userId={userId}
              onCountUpdate={handleCountUpdate}
            />
          ) : (
            <div className="text-center py-16 text-[#3C1E38]/30">
              <p className="text-sm">No active declarations. <button onClick={() => setEditing(true)} className="text-[#A7C2D7] hover:underline">Create some</button></p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewall">
          <ViewAll
            declarations={declarations}
            logs={logsMap}
            onJumpToRecite={jumpToRecite}
          />
        </TabsContent>

        <TabsContent value="history">
          <History declarations={declarations} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
