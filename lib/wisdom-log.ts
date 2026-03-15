// Wisdom Log: types, entry types, life areas, decision categories, goal codes.
// Differentiates from Divine Downloads (quick capture) — Wisdom Log = processed understanding.

export type WisdomEntryType =
  | "revelation"
  | "prophetic_word"
  | "testimony"
  | "holy_spirit_conviction"
  | "gratitude"
  | "applied_principle"
  | "aligned_decision"
  | "pattern_recognition"
  | "spiritual_professional"

export type DecisionCategory =
  | "career"
  | "health"
  | "financial"
  | "relational"
  | "spiritual"
  | "tpm_academy"
  | "swiftlink"
  | "krystal"
  | "other"

export interface WisdomEntry {
  id: string
  user_id: string
  entry_type: WisdomEntryType
  title: string
  content: string
  scripture_reference: string | null
  scripture_text: string | null
  sources: string | null
  life_areas: string[]
  connected_goal_code: string | null
  connected_activity_id: string | null
  shareable: boolean
  is_highlight: boolean
  date: string
  created_at: string
  updated_at: string
}

export interface AlignedDecision {
  id: string
  user_id: string
  wisdom_entry_id: string | null
  date: string
  description: string
  context: string | null
  category: DecisionCategory | null
  step1_prayed: boolean
  step1_note: string | null
  step2_scripture: string | null
  step2_note: string | null
  step3_counsel: boolean
  step3_who: string | null
  step3_note: string | null
  step4_peace: boolean
  step4_note: string | null
  step5_dominion: string | null
  aligned: boolean | null
  outcome: string | null
  outcome_date: string | null
  outcome_rating: number | null
  lesson_learned: string | null
  created_at: string
  updated_at: string
}

// 9 wisdom entry types — colors use theme: #A7C2D7 blue, #F9D57E gold, #3C1E38 plum, #FDFCF9 cream
export const WISDOM_ENTRY_TYPES: {
  value: WisdomEntryType
  label: string
  description: string
  icon: string
  badgeClass: string
  /** Stat card & entry card tint — theme-aligned */
  cardBg: string
  /** Icon container background */
  iconBg: string
  /** Icon color */
  iconColor: string
}[] = [
  { value: "revelation", label: "Revelation", description: "Deep understanding formed over time", icon: "Zap", badgeClass: "bg-[#F9D57E]/25 text-[#B8860B]", cardBg: "bg-[#F9D57E]/15", iconBg: "bg-[#F9D57E]/40", iconColor: "text-[#3C1E38]" },
  { value: "prophetic_word", label: "Prophetic Word", description: "A word spoken over my life or situation", icon: "MessageCircle", badgeClass: "bg-[#3C1E38]/15 text-[#3C1E38]", cardBg: "bg-[#3C1E38]/8", iconBg: "bg-[#3C1E38]/25", iconColor: "text-[#3C1E38]" },
  { value: "testimony", label: "Testimony", description: "Evidence of God's faithfulness", icon: "Star", badgeClass: "bg-amber-100 text-amber-800", cardBg: "bg-amber-50/90", iconBg: "bg-amber-200/70", iconColor: "text-amber-900" },
  { value: "holy_spirit_conviction", label: "Holy Spirit Conviction", description: "Correction, redirection, or conviction", icon: "Flame", badgeClass: "bg-rose-100 text-rose-800", cardBg: "bg-rose-50/90", iconBg: "bg-rose-200/70", iconColor: "text-rose-900" },
  { value: "gratitude", label: "Gratitude", description: "Processed thankfulness — why it matters", icon: "Heart", badgeClass: "bg-pink-100 text-pink-800", cardBg: "bg-pink-50/90", iconBg: "bg-pink-200/70", iconColor: "text-pink-900" },
  { value: "applied_principle", label: "Applied Principle", description: "A sermon or scripture principle I tested in real life", icon: "BookOpen", badgeClass: "bg-[#A7C2D7]/25 text-[#2E5A7B]", cardBg: "bg-[#A7C2D7]/12", iconBg: "bg-[#A7C2D7]/35", iconColor: "text-[#3C1E38]" },
  { value: "aligned_decision", label: "Aligned Decision", description: "A major decision made through the 5-step filter", icon: "Scale", badgeClass: "bg-teal-100 text-teal-800", cardBg: "bg-teal-50/90", iconBg: "bg-teal-200/70", iconColor: "text-teal-900" },
  { value: "pattern_recognition", label: "Pattern Recognition", description: "A spiritual pattern across multiple experiences", icon: "Search", badgeClass: "bg-indigo-100 text-indigo-800", cardBg: "bg-indigo-50/90", iconBg: "bg-indigo-200/70", iconColor: "text-indigo-900" },
  { value: "spiritual_professional", label: "Spiritual-Professional", description: "Where faith met career/business and produced results", icon: "Briefcase", badgeClass: "bg-emerald-100 text-emerald-800", cardBg: "bg-emerald-50/90", iconBg: "bg-emerald-200/70", iconColor: "text-emerald-900" },
]

// Title placeholders by type for the Log Wisdom form
export const WISDOM_TITLE_PLACEHOLDERS: Record<WisdomEntryType, string> = {
  revelation: "What do you now understand?",
  prophetic_word: "What word was spoken?",
  testimony: "What did God do?",
  holy_spirit_conviction: "What is the Spirit showing you?",
  gratitude: "What are you deeply grateful for and why?",
  applied_principle: "What principle did you test?",
  aligned_decision: "What decision are you making?",
  pattern_recognition: "What pattern have you identified?",
  spiritual_professional: "How did faith show up in your work?",
}

// 10 life areas for multi-select
export const LIFE_AREAS = [
  "Spiritual",
  "Career",
  "Health",
  "Finance",
  "Brand",
  "AI",
  "Education",
  "Systems",
  "Relationships",
  "TPM Academy",
] as const

// Goal codes G1–G7 for dropdown
export const GOAL_CODES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"] as const

// Decision categories with badge styles
export const DECISION_CATEGORIES: { value: DecisionCategory; label: string; badgeClass: string }[] = [
  { value: "career", label: "Career", badgeClass: "bg-blue-50 text-blue-600" },
  { value: "health", label: "Health", badgeClass: "bg-emerald-50 text-emerald-600" },
  { value: "financial", label: "Financial", badgeClass: "bg-amber-50 text-amber-600" },
  { value: "relational", label: "Relational", badgeClass: "bg-pink-50 text-pink-600" },
  { value: "spiritual", label: "Spiritual", badgeClass: "bg-purple-50 text-purple-600" },
  { value: "tpm_academy", label: "TPM Academy", badgeClass: "bg-teal-50 text-teal-600" },
  { value: "swiftlink", label: "SwiftLink", badgeClass: "bg-indigo-50 text-indigo-600" },
  { value: "krystal", label: "Krystal", badgeClass: "bg-orange-50 text-orange-600" },
  { value: "other", label: "Other", badgeClass: "bg-gray-50 text-gray-600" },
]

export const OUTCOME_RATING_LABELS: Record<number, string> = {
  5: "Exactly right",
  4: "Mostly right",
  3: "Mixed results",
  2: "Mostly wrong",
  1: "Completely wrong",
}
