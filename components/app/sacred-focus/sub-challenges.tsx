"use client"

import { useState, useMemo } from "react"
import { Plus, Minus, Check, Clock, Flame, ChevronRight, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { localCalendarDateString } from "@/lib/prayer-week"
import { toast } from "sonner"
import type { SubChallenge, SubChallengeLog } from "./types"

interface Props {
  challenges: SubChallenge[]
  logs: SubChallengeLog[]  // all logs for these challenges (not just today)
  todayLogs: Record<string, SubChallengeLog>  // sub_challenge_id → today's log
  userId: string
  onLogUpdate: (challengeId: string, log: SubChallengeLog) => void
}

export function SubChallenges({ challenges, logs, todayLogs, userId, onLogUpdate }: Props) {
  const [detailId, setDetailId] = useState<string | null>(null)

  if (challenges.length === 0) return null

  const detailChallenge = challenges.find((c) => c.id === detailId)

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-[#3C1E38]/50 uppercase tracking-wide">Active Challenges</h3>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {challenges.filter((c) => c.active).map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            todayLog={todayLogs[challenge.id]}
            allLogs={logs.filter((l) => l.sub_challenge_id === challenge.id)}
            userId={userId}
            onLogUpdate={onLogUpdate}
            onViewDetail={() => setDetailId(challenge.id)}
          />
        ))}
      </div>

      {/* Detail overlay */}
      {detailChallenge && (
        <ChallengeDetail
          challenge={detailChallenge}
          logs={logs.filter((l) => l.sub_challenge_id === detailChallenge.id)}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}

// ─── Individual challenge card ───────────────────────
interface CardProps {
  challenge: SubChallenge
  todayLog: SubChallengeLog | undefined
  allLogs: SubChallengeLog[]
  userId: string
  onLogUpdate: (challengeId: string, log: SubChallengeLog) => void
  onViewDetail: () => void
}

function ChallengeCard({ challenge, todayLog, allLogs, userId, onLogUpdate, onViewDetail }: CardProps) {
  const [saving, setSaving] = useState(false)

  const todayValue = todayLog?.value ?? 0
  const todayCompleted = todayLog?.completed ?? false

  // Calculate streak
  const streak = useMemo(() => {
    const completedDates = new Set(allLogs.filter((l) => l.completed).map((l) => l.date))
    let count = 0
    const d = new Date()
    // Check today first
    const todayStr = localCalendarDateString(d)
    if (!completedDates.has(todayStr)) {
      // Check yesterday in case today isn't done yet
      d.setDate(d.getDate() - 1)
    }
    for (let i = 0; i < 365; i++) {
      const dateStr = localCalendarDateString(d)
      if (completedDates.has(dateStr)) {
        count++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [allLogs])

  const upsertLog = async (newValue: number, completed: boolean) => {
    setSaving(true)
    const today = localCalendarDateString()
    const supabase = createClient()

    const logData = {
      user_id: userId,
      sub_challenge_id: challenge.id,
      date: today,
      value: newValue,
      completed,
    }

    const { data, error } = await supabase
      .from("sub_challenge_logs")
      .upsert(logData, { onConflict: "user_id,sub_challenge_id,date" })
      .select()
      .single()

    if (error) {
      toast.error("Failed to update")
    } else {
      const saved: SubChallengeLog = data ?? {
        id: todayLog?.id ?? crypto.randomUUID(),
        ...logData,
        note: null,
        created_at: new Date().toISOString(),
      }
      onLogUpdate(challenge.id, saved)
    }
    setSaving(false)
  }

  // Render tracker based on target_type
  const renderTracker = () => {
    switch (challenge.target_type) {
      case "daily_count":
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => upsertLog(Math.max(0, todayValue - 1), Math.max(0, todayValue - 1) >= challenge.target_value)}
              disabled={saving || todayValue <= 0}
              className="w-8 h-8 rounded-full border border-[#A7C2D7]/30 flex items-center justify-center text-[#3C1E38]/40 hover:bg-[#A7C2D7]/10 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className={`text-lg font-bold tabular-nums ${todayCompleted ? "text-[#2E7D32]" : "text-[#3C1E38]"}`}>
              {todayValue}/{challenge.target_value}
            </span>
            <button
              onClick={() => upsertLog(todayValue + 1, todayValue + 1 >= challenge.target_value)}
              disabled={saving}
              className="w-8 h-8 rounded-full bg-[#A7C2D7] text-white flex items-center justify-center hover:bg-[#A7C2D7]/80"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )

      case "daily_boolean":
        return (
          <button
            onClick={() => upsertLog(todayCompleted ? 0 : 1, !todayCompleted)}
            disabled={saving}
            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
              todayCompleted
                ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                : "border-[#A7C2D7]/30 hover:border-[#A7C2D7] text-[#3C1E38]/30"
            }`}
          >
            <Check className="w-5 h-5" />
          </button>
        )

      case "daily_duration":
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={todayValue || ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0
                  upsertLog(v, v >= challenge.target_value)
                }}
                className="w-16 px-2 py-1.5 text-center border border-[#A7C2D7]/20 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#A7C2D7]/30 outline-none"
                placeholder="0"
              />
              <span className="text-xs text-[#3C1E38]/40">/ {challenge.target_value} {challenge.target_unit}</span>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-shrink-0 w-[200px] bg-white rounded-2xl border border-[#A7C2D7]/10 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#3C1E38] truncate">{challenge.title}</p>
          <p className="text-[10px] text-[#3C1E38]/40 mt-0.5">
            {challenge.target_value} {challenge.target_unit}/{challenge.target_type === "daily_boolean" ? "day" : "day"}
          </p>
        </div>
      </div>

      <div className="flex justify-center">{renderTracker()}</div>

      <div className="flex items-center justify-between">
        {streak > 0 ? (
          <span className="flex items-center gap-1 text-[10px] text-[#C2690C] font-medium">
            <Flame className="w-3 h-3" /> {streak} day streak
          </span>
        ) : (
          <span className="text-[10px] text-[#3C1E38]/25">No streak yet</span>
        )}
        <button onClick={onViewDetail} className="text-[#3C1E38]/30 hover:text-[#3C1E38]/60">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Detail view (overlay) ──────────────────────────
function ChallengeDetail({ challenge, logs, onClose }: { challenge: SubChallenge; logs: SubChallengeLog[]; onClose: () => void }) {
  const sortedLogs = useMemo(() => [...logs].sort((a, b) => b.date.localeCompare(a.date)), [logs])

  return (
    <div className="bg-white rounded-2xl border border-[#A7C2D7]/15 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[#3C1E38]">{challenge.title}</h4>
          {challenge.description && <p className="text-xs text-[#3C1E38]/50 mt-1">{challenge.description}</p>}
        </div>
        <button onClick={onClose} className="text-[#3C1E38]/30 hover:text-[#3C1E38]/60">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {sortedLogs.length === 0 ? (
          <p className="text-xs text-[#3C1E38]/30 text-center py-4">No history yet</p>
        ) : (
          sortedLogs.map((log) => {
            const d = new Date(log.date + "T12:00:00")
            return (
              <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FDFCF9]">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.completed ? "bg-[#2E7D32] text-white" : "bg-[#3C1E38]/10 text-[#3C1E38]/30"
                }`}>
                  {log.completed ? <Check className="w-3 h-3" /> : null}
                </div>
                <span className="text-xs text-[#3C1E38]/60 flex-1">
                  {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="text-xs font-medium text-[#3C1E38]/70">
                  {challenge.target_type === "daily_boolean"
                    ? (log.completed ? "Done" : "Missed")
                    : `${log.value}/${challenge.target_value} ${challenge.target_unit ?? ""}`
                  }
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
