// Sunday Pulse session types and constants

export type PhaseId = "setup" | "measure" | "review" | "learn" | "plan" | "close"

export const PHASES: { id: PhaseId; title: string; estimate: string }[] = [
  { id: "setup", title: "Setup & Sacred Transition", estimate: "10 min" },
  { id: "measure", title: "Measure & Backfill", estimate: "20 min" },
  { id: "review", title: "Review & Pulse Check", estimate: "40 min" },
  { id: "learn", title: "Learn & Analyze", estimate: "20 min" },
  { id: "plan", title: "Plan Forward", estimate: "25 min" },
  { id: "close", title: "Setdown & Close", estimate: "5 min" },
]

export interface PulseSessionRow {
  id: string
  user_id: string
  date: string
  quarter_code: string | null
  week_number: number | null
  started_at: string | null
  completed_at: string | null
  phases_completed: string[] | null
  total_duration_minutes: number | null
  phase1_completed: boolean | null
  phase2_backfill_count: number | null
  phase3_pulse_check_id: string | null
  phase4_time_analysis: string | null
  phase4_constraint_changes: string | null
  phase4_declaration_reviewed: string | null
  phase5_weekly_plan_notes: string | null
  phase5_next_week_focus: string[] | null
  phase6_monday_top3: string[] | null
  overall_session_notes: string | null
  session_quality: number | null
  created_at: string
  updated_at: string
}

export const OPENING_PRAYER =
  "Father, I come before you to steward the week you've given me. Give me eyes to see what you see — where I grew, where I stumbled, and where you're leading me next. Let this session be guided by your Spirit, not my anxiety. In Jesus name, Amen."

export const CLOSING_PRAYER =
  "Father, thank you for the clarity of this session. I commit this coming week to you — every meeting, every prayer, every decision. Where I've planned, give me discipline to execute. Where I've missed something, give me grace to adapt. I trust that your hand is on this week. In Jesus name, Amen."

export const SESSION_QUALITY_LABELS: Record<number, string> = {
  5: "Deeply productive — clear vision for the week",
  4: "Good — covered what matters",
  3: "Okay — went through the motions",
  2: "Rushed — skipped important parts",
  1: "Barely did it — need to protect this time better",
}

export const CONSTRAINT_CHIPS = [
  "SCD flare / low energy",
  "Krystal deadline",
  "SwiftLink incident",
  "Travel",
  "Fasting (reduced energy)",
  "Spiritual activity intensive",
  "Personal/family commitment",
  "Nothing unusual",
]

export const TIME_CATEGORIES = [
  { key: "swiftlink", label: "SwiftLink" },
  { key: "krystal", label: "Krystal", maxHours: 15 },
  { key: "tpm_academy", label: "TPM Academy", maxHours: 8 },
  { key: "prayer", label: "Prayer/Spiritual" },
  { key: "altar", label: "ALTAR development" },
  { key: "rest", label: "Rest/Personal" },
  { key: "other", label: "Other" },
] as const
