// DOMINION Spiritual Operating System - Core Data

import { getLegacyQuarterProgressFromCalendar } from "@/lib/personal-year"
import { dayOfYearIndex } from "@/lib/pulse-session-dates"

export const dominionDeclarations = [
  "I am a son of God, chosen before the foundation of the world.",
  "I walk in divine wisdom that surpasses human understanding.",
  "I am led by the Holy Spirit in every decision and direction.",
  "I have dominion over my thoughts, emotions, and actions.",
  "I am a steward of divine resources, multiplying what God entrusts to me.",
  "I operate in supernatural favor with God and man.",
  "I am positioned for divine appointments and kingdom connections.",
  "I break every generational curse and walk in generational blessing.",
  "I am disciplined, focused, and aligned with God's purpose for my life.",
  "I declare that this is my season of breakthrough and acceleration.",
]

// Intercession rotation by day of week
export const intercessionRotation: Record<number, { theme: string; focus: string[] }> = {
  0: { theme: "Personal & Family", focus: ["Your own spiritual growth", "Family members by name", "Personal breakthrough areas"] },
  1: { theme: "Personal Growth", focus: ["Character development", "Spiritual disciplines", "Areas of weakness"] },
  2: { theme: "SwiftLink Team", focus: ["Team members by name", "Project success", "Divine wisdom for decisions"] },
  3: { theme: "Business & Career", focus: ["Kingdom impact at work", "Professional relationships", "Financial stewardship"] },
  4: { theme: "Ministry & Outreach", focus: ["Those you're discipling", "Evangelism opportunities", "Church leadership"] },
  5: { theme: "Health & Relationships", focus: ["Physical health", "Key relationships", "Emotional healing"] },
  6: { theme: "Personal Warfare", focus: ["Spiritual strongholds in your life", "Mind and thought life", "Health and body", "Family and household"] },
}

// 10-area prayer focus rotation (2 per day across 5-day cycle)
export const prayerAreas = [
  "Spiritual Growth",
  "Family",
  "Career/Business",
  "Finances",
  "Health",
  "Relationships",
  "Ministry",
  "Character",
  "Wisdom",
  "Purpose",
]

// ─── 7 Spiritual Goals (comprehensive config) ────────────────
export interface GoalConfig {
  id: string
  name: string
  subtitle: string
  description: string  // WHY this matters
  iconKey: string
  pulseQuestion: string
  pulseType: "yesno" | "scale"
  dbField: string      // pulse_checks value column (e.g. g1_prayer); notes use g1_note … g7_note
  kr10x: string
  kr5x: string
  kr2x: string
  notNow: string[]
}

export const GOALS: GoalConfig[] = [
  {
    id: "G1",
    name: "Prayer Foundation",
    subtitle: "Maintain 95%+ consistency with your chosen prayer watches",
    description: "DOMINION requires a foundation that cannot be moved. Without consistent, deep communion with God, every other life area lacks its power source. Your career decisions, health management, financial wisdom, and relational discernment all flow from this place.",
    iconKey: "flame",
    pulseQuestion: "Did I maintain 95%+ prayer consistency on my watches this week?",
    pulseType: "yesno",
    dbField: "g1_prayer",
    kr10x: "Achieve 95%+ consistency on your primary prayer watch across the quarter (87+ of 91 days), with 30+ divine downloads documented and actioned",
    kr5x: "Build a prayer framework with rotating focus across 10 life areas",
    kr2x: "Maintain daily gratitude practice (3 entries) as bookend to prayer session, 90%+ consistency",
    notNow: ["Elaborate prayer journaling with 7+ fields per entry", "Teaching others to pray or creating prayer content publicly", "Multiple fasting cycles this quarter"],
  },
  {
    id: "G2",
    name: "Sermon Engagement",
    subtitle: "1,000+ sermons/year with weekly application",
    description: "You own an extraordinary resource — 1,000+ sermons — that most people would pay thousands for. But a library has zero power until it becomes applied wisdom that changes decisions. This goal transforms passive consumption into an active system where every teaching gets tested against real life.",
    iconKey: "headphones",
    pulseQuestion: "Did I listen to 5+ sermons and apply one principle this week?",
    pulseType: "yesno",
    dbField: "g2_sermons",
    kr10x: "Complete categorization of all 1,000+ sermons across 7 pillars, extract top 80 with mastery notes — 25 mastered this quarter",
    kr5x: "Apply 1 sermon principle per week to a real-life decision and document outcome",
    kr2x: "Engage minimum 5 sermons per week (65+ this quarter)",
    notNow: ["Public sermon notes blog or podcast", "Shareable Notion template of the sermon library", "Expanding beyond Apostle Selman to 5+ other teachers"],
  },
  {
    id: "G3",
    name: "DOMINION Alignment",
    subtitle: "Daily declarations + weekly self-assessment",
    description: "DOMINION is your 2026 word. But themes without operational teeth become motivational posters that fade by March. This goal ensures DOMINION shows up in your posture at Krystal when they push your boundaries, in your SwiftLink vendor negotiations, in your health choices when energy is low, and in your financial decisions.",
    iconKey: "crown",
    pulseQuestion: "Rate your DOMINION alignment this week (1-10)",
    pulseType: "scale",
    dbField: "g3_dominion",
    kr10x: "Complete Year 2 with 3 Big Rocks at 80%+ completion, each with documented DOMINION evidence",
    kr5x: "Weekly DOMINION alignment check (1-10), specific notes when below 7",
    kr2x: "Create and recite 10 DOMINION declarations daily, 90%+ consistency",
    notNow: ["Full 12-piece visual illustration series", "Publishing DOMINION content externally", "Elaborate quarterly DOMINION review ceremonies"],
  },
  {
    id: "G4",
    name: "Intercession Discipline",
    subtitle: "Structured daily prayer for others",
    description: "You navigate complex organizational politics daily, manage chronic health challenges (SCD, ADHD), and build multiple ventures simultaneously. Spiritual warfare is practical: fighting for your outcomes in the spiritual realm before they manifest naturally. This is about having the spiritual tools to match the complexity of your actual life.",
    iconKey: "heart",
    pulseQuestion: "Did I follow the intercession rotation this week?",
    pulseType: "yesno",
    dbField: "g4_warfare",
    kr10x: "Personal Spiritual Warfare Playbook — 5 battle categories, each with 2+ proven strategies from personal application",
    kr5x: "Weekly intercession rotation maintained (Mon-Sun themed), 85%+ weeks",
    kr2x: "Pray for SwiftLink team members by name 3x per week, 85%+ weeks",
    notNow: ["Teaching spiritual warfare to others", "Extended multi-day prayer retreats", "Organizing intercession groups"],
  },
  {
    id: "G5",
    name: "Decision Alignment",
    subtitle: "5-step spiritual filter for every major choice",
    description: "You make high-stakes decisions constantly: whether to push back on Krystal scope creep, which bank partner to prioritize at SwiftLink, how to price TPM Academy offerings, whether to accept a health treatment. Each carries consequences that compound. This goal creates a simple decision filter that prevents reactive choices and ensures your actions match your faith.",
    iconKey: "scale",
    pulseQuestion: "Did any major decision skip the 5-step card this week?",
    pulseType: "yesno",
    dbField: "g5_decisions",
    kr10x: "Process 100% of major decisions through 5-step spiritual filter with documented outcomes",
    kr5x: "2 trusted spiritual advisors identified, 3+ consultations this quarter",
    kr2x: "Weekly wisdom lens from Sermon Category 3 in Sunday planning",
    notNow: ["Elaborate Decision Log with 10+ fields per entry", "Public Faith-Integrated Decision-Making framework for TPM Academy", "Seeking 5+ advisors (quality over quantity — 2 trusted voices are enough)"],
  },
  {
    id: "G6",
    name: "Intentional Community",
    subtitle: "Accountability partnership + active church engagement",
    description: "Your multi-role life (SwiftLink CTO, Krystal advisor, TPM Academy founder, health management) can become all-consuming. Without spiritual anchors outside of your personal practice and work life, your faith becomes a solo operation that lacks the sharpening, correction, and encouragement that community provides.",
    iconKey: "users",
    pulseQuestion: "Did I attend church and send my encouragement message?",
    pulseType: "yesno",
    dbField: "g6_community",
    kr10x: "1 accountability partnership with biweekly check-ins, maintained full quarter (6+ check-ins)",
    kr5x: "90%+ Sunday church attendance with active engagement (12+ of 13 Sundays)",
    kr2x: "One encouragement message per week to spiritual community (85%+)",
    notNow: ["Starting or leading a small group", "Formal spiritual mentorship with structured curriculum", "Organizing community prayer events"],
  },
  {
    id: "G7",
    name: "Kingdom Stewardship",
    subtitle: "Faithful management of resources",
    description: "You have a natural desire to share spiritual insights at the intersection of faith and professional excellence. But the previous version of this plan risked instrumentalizing your spiritual growth — praying not just for communion but for the blog post it would generate. Content emerges from overflow, not obligation.",
    iconKey: "target",
    pulseQuestion: "Did I capture any insights worth sharing this week?",
    pulseType: "yesno",
    dbField: "g7_content",
    kr10x: "Private library of 15+ spiritual insights, 3-4 genuinely ready to share publicly",
    kr5x: "3 visual spiritual illustrations from genuine breakthrough moments",
    kr2x: "Weekly end-of-week capture: anything worth sharing? Track the impulse ratio",
    notNow: ["Weekly spiritual content publishing schedule", "Faith & Excellence branded content series", "Monthly spiritual newsletter", "Monetizing spiritual content in any form"],
  },
]

/** pulse_checks note columns are g1_note … g7_note, not g1_prayer_note. */
export function pulseCheckNoteField(valueField: string): string {
  const m = valueField.match(/^g(\d+)_/)
  return m ? `g${m[1]}_note` : `${valueField}_note`
}

// Backward-compat exports used by dashboard
export const spiritualGoals = GOALS.map((g) => ({ id: g.id, name: g.name, description: g.subtitle }))
export const pulseQuestions = GOALS.map((g) => ({
  id: g.dbField.replace("g", "pulse_g"),
  question: g.pulseQuestion,
  goal: g.id,
  ...(g.pulseType === "scale" ? { type: "scale" as const } : {}),
}))

// Helper functions
export function getTodayDeclaration() {
  const dayOfYear = dayOfYearIndex()
  return dominionDeclarations[dayOfYear % dominionDeclarations.length]
}

export function getTodayIntercession() {
  const dayOfWeek = new Date().getDay()
  return intercessionRotation[dayOfWeek]
}

export function getTodayPrayerAreas() {
  const dayOfYear = dayOfYearIndex()
  const cycleDay = dayOfYear % 5 // 5-day cycle
  const startIndex = cycleDay * 2
  return [prayerAreas[startIndex], prayerAreas[startIndex + 1]]
}

export function isSunday() {
  return new Date().getDay() === 0
}

/** Calendar quarter + half-year labels (Jan–Jun vs Jul–Dec). See `getCalendarQuarterProgress` in `lib/personal-year.ts`. */
export function getQuarterProgress() {
  return getLegacyQuarterProgressFromCalendar()
}

// Scripture verses (keeping from original)
export const dailyVerses = [
  { ref: "Psalm 143:8", text: "Let the morning bring me word of your unfailing love, for I have put my trust in you." },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
  { ref: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "Lamentations 3:22-23", text: "His mercies are new every morning; great is your faithfulness." },
  { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him." },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
  { ref: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you." },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged." },
]

export function getTodayVerse() {
  const dayOfYear = dayOfYearIndex()
  return dailyVerses[dayOfYear % dailyVerses.length]
}
