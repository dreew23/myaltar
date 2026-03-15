"use client"

interface StorageUsageProps {
  counts: Record<string, number>
}

export function StorageUsage({ counts }: StorageUsageProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const labels: Record<string, string> = {
    daily_devotions: "Devotion logs",
    declarations: "Declarations",
    declaration_logs: "Declaration logs",
    divine_downloads: "Divine downloads",
    sermons: "Sermons",
    prayer_sessions: "Prayer sessions",
    prayer_requests: "Prayer requests",
    prayers: "Prayers (intercession)",
    wisdom_entries: "Wisdom entries",
    pulse_checks: "Pulse checks",
    pulse_sessions: "Pulse sessions",
    goal_notes: "Goal notes",
    weekly_goals: "Weekly goals",
  }

  return (
    <div className="rounded-lg border border-[#A7C2D7]/20 bg-[#FDFCF9] p-4">
      <p className="text-sm font-medium text-[#3C1E38] mb-2">Storage usage</p>
      <ul className="space-y-1 text-sm text-[#3C1E38]/80">
        {Object.entries(counts).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span>{labels[key] ?? key}</span>
            <span>{value} records</span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium text-[#3C1E38] mt-3 pt-2 border-t border-[#A7C2D7]/15">
        Total: {total} records across all tables
      </p>
    </div>
  )
}
