// Prayer page: types and constants. Theme: #A7C2D7, #F9D57E, #3C1E38, #FDFCF9. Prayer Mode dark: #1B2341.

export type SessionType = "morning" | "evening" | "midnight" | "spontaneous"
export type MoodBefore = "heavy" | "anxious" | "neutral" | "expectant" | "joyful" | "desperate" | "grateful"
export type MoodAfter = "heavy" | "anxious" | "neutral" | "peaceful" | "joyful" | "empowered" | "grateful" | "convicted"
export type SavedPrayerCategory =
  | "repentance" | "intercession" | "warfare" | "blessing" | "thanksgiving"
  | "petition" | "consecration" | "declaration" | "healing" | "deliverance" | "personal" | "other"
export type WarfareCategory =
  | "career_politics" | "health_crises" | "financial_pressure" | "relational_challenges"
  | "purpose_confusion" | "general_warfare"
export type RequestCategory = "personal" | "family" | "career" | "health" | "relationships" | "ministry" | "financial" | "nation" | "other"
export type RequestStatus = "active" | "answered" | "redirected" | "released"
export type RequestPriority = "urgent" | "high" | "normal" | "ongoing"

export interface PrayerSession {
  id: string
  user_id: string
  date: string
  start_time: string | null
  end_time: string | null
  duration_minutes: number | null
  session_type: SessionType
  quality_rating: number | null
  presence_level: number | null
  focus_areas_covered: string[]
  intercession_theme_completed: boolean
  declarations_completed: boolean
  tongues_minutes: number
  worship_included: boolean
  warfare_engaged: boolean
  journal_entry: string | null
  breakthroughs: string | null
  what_god_said: string | null
  prayer_requests_prayed: string[]
  scripture_used: string[]
  mood_before: MoodBefore | null
  mood_after: MoodAfter | null
  notes: string | null
  connected_activity_id: string | null
  created_at: string
  updated_at: string
}

export interface SavedPrayer {
  id: string
  user_id: string
  title: string
  content: string
  category: SavedPrayerCategory
  scripture_references: string[]
  tags: string[]
  source: string | null
  is_favorite: boolean
  use_count: number
  last_used_date: string | null
  display_order: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface WarfareScripture {
  id: string
  user_id: string
  battle_category: WarfareCategory
  scripture_reference: string
  scripture_text: string
  how_to_pray_it: string | null
  personal_note: string | null
  is_tested: boolean
  test_outcome: string | null
  display_order: number | null
  created_at: string
}

export interface PrayerRequest {
  id: string
  user_id: string
  request: string
  category: RequestCategory | null
  scripture_anchor: string | null
  status: RequestStatus
  date_started: string
  date_answered: string | null
  answer_note: string | null
  priority: RequestPriority
  created_at: string
  updated_at: string
}

export const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "midnight", label: "Midnight" },
  { value: "spontaneous", label: "Spontaneous" },
]

export const MOOD_BEFORE_OPTIONS: { value: MoodBefore; label: string }[] = [
  { value: "heavy", label: "Heavy" },
  { value: "anxious", label: "Anxious" },
  { value: "neutral", label: "Neutral" },
  { value: "expectant", label: "Expectant" },
  { value: "joyful", label: "Joyful" },
  { value: "desperate", label: "Desperate" },
  { value: "grateful", label: "Grateful" },
]

export const MOOD_AFTER_OPTIONS: { value: MoodAfter; label: string }[] = [
  { value: "heavy", label: "Heavy" },
  { value: "anxious", label: "Anxious" },
  { value: "neutral", label: "Neutral" },
  { value: "peaceful", label: "Peaceful" },
  { value: "joyful", label: "Joyful" },
  { value: "empowered", label: "Empowered" },
  { value: "grateful", label: "Grateful" },
  { value: "convicted", label: "Convicted" },
]

export const SAVED_PRAYER_CATEGORIES: { value: SavedPrayerCategory; label: string }[] = [
  { value: "repentance", label: "Repentance" },
  { value: "intercession", label: "Intercession" },
  { value: "warfare", label: "Warfare" },
  { value: "blessing", label: "Blessing" },
  { value: "thanksgiving", label: "Thanksgiving" },
  { value: "petition", label: "Petition" },
  { value: "consecration", label: "Consecration" },
  { value: "declaration", label: "Declaration" },
  { value: "healing", label: "Healing" },
  { value: "deliverance", label: "Deliverance" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
]

export const WARFARE_CATEGORIES: { value: WarfareCategory; label: string }[] = [
  { value: "career_politics", label: "Career & Politics" },
  { value: "health_crises", label: "Health Crises" },
  { value: "financial_pressure", label: "Financial Pressure" },
  { value: "relational_challenges", label: "Relational Challenges" },
  { value: "purpose_confusion", label: "Purpose Confusion" },
  { value: "general_warfare", label: "General Warfare" },
]

export const REQUEST_CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "career", label: "Career" },
  { value: "health", label: "Health" },
  { value: "relationships", label: "Relationships" },
  { value: "ministry", label: "Ministry" },
  { value: "financial", label: "Financial" },
  { value: "nation", label: "Nation" },
  { value: "other", label: "Other" },
]

export const REQUEST_PRIORITIES: { value: RequestPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "ongoing", label: "Ongoing" },
]
