export type Area = "identity" | "authority" | "health" | "career" | "finances" | "wisdom" | "protection" | "relationships" | "purpose" | "legacy"

export const AREAS: { key: Area; label: string }[] = [
  { key: "identity", label: "Identity" },
  { key: "authority", label: "Authority" },
  { key: "health", label: "Health" },
  { key: "career", label: "Career" },
  { key: "finances", label: "Finances" },
  { key: "wisdom", label: "Wisdom" },
  { key: "protection", label: "Protection" },
  { key: "relationships", label: "Relationships" },
  { key: "purpose", label: "Purpose" },
  { key: "legacy", label: "Legacy" },
]

export interface Declaration {
  id: string
  user_id: string
  display_order: number
  area: Area
  content: string
  scripture_reference: string
  scripture_text: string | null
  target_count: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface DeclarationLog {
  id: string
  user_id: string
  declaration_id: string
  date: string
  current_count: number
  target_count: number
  completed: boolean
  created_at: string
  updated_at: string
}

export const TARGET_PRESETS = [1, 3, 7, 10, 21, 50, 100]
