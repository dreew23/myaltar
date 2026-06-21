/**
 * Server-only: resolve intercession and goals from DB first, with dominion.ts fallback.
 * Use from Server Components or Route Handlers only.
 */

import { getTodayIntercession } from "./dominion"
import { GOALS, type GoalConfig } from "./dominion"
import { normalizePrayerSchedule, type PrayerScheduleConfig } from "@/lib/prayer-schedule"
import type { SupabaseClient } from "@supabase/supabase-js"

export type TodayIntercession = { theme: string; focus: string[] }

/**
 * Returns today's intercession for the user.
 * Reads from intercession_schedule if 7 rows exist; otherwise uses dominion default.
 */
export async function getTodayIntercessionForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<TodayIntercession> {
  try {
    const dayOfWeek = new Date().getDay()
    const { data: rows } = await supabase
      .from("intercession_schedule")
      .select("day_of_week, theme, people, life_areas")
      .eq("user_id", userId)
      .order("day_of_week")

    if (rows && rows.length === 7) {
      const row = rows.find((r) => (r as { day_of_week: number }).day_of_week === dayOfWeek)
      if (row) {
        const r = row as { theme: string; people?: string[]; life_areas?: string[] }
        const people = r.people ?? []
        const lifeAreas = r.life_areas ?? []
        return {
          theme: r.theme ?? "",
          focus: [...people, ...lifeAreas],
        }
      }
    }
  } catch {
    // Table may not exist
  }
  const fallback = getTodayIntercession()
  return { theme: fallback.theme, focus: fallback.focus }
}

/** DB row shape for goals table */
interface GoalRow {
  code: string
  title: string
  subtitle: string | null
  description: string | null
  pulse_question: string | null
  pulse_type: string
  db_field: string | null
  kr_10x: string | null
  kr_5x: string | null
  kr_2x: string | null
  not_now: string[] | null
  icon_name: string | null
}

function mapGoalRowToConfig(r: GoalRow): GoalConfig {
  return {
    id: r.code,
    name: r.title,
    subtitle: r.subtitle ?? "",
    description: r.description ?? "",
    iconKey: r.icon_name ?? "target",
    pulseQuestion: r.pulse_question ?? "",
    pulseType: (r.pulse_type === "scale" ? "scale" : "yesno") as "yesno" | "scale",
    dbField: r.db_field ?? "",
    kr10x: r.kr_10x ?? "",
    kr5x: r.kr_5x ?? "",
    kr2x: r.kr_2x ?? "",
    notNow: r.not_now ?? [],
  }
}

/**
 * Returns the user's 7 goals. Reads from goals table if rows exist; otherwise uses dominion GOALS.
 */
export async function getGoalsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<GoalConfig[]> {
  try {
    const { data: rows } = await supabase
      .from("goals")
      .select("code, title, subtitle, description, pulse_question, pulse_type, db_field, kr_10x, kr_5x, kr_2x, not_now, icon_name")
      .eq("user_id", userId)
      .order("display_order")

    if (rows && rows.length >= 7) {
      return rows.map((r) => mapGoalRowToConfig(r as GoalRow))
    }
  } catch {
    // Table may not exist
  }
  return GOALS
}

/** User prayer watches / custom times from profiles.prayer_schedule. */
export async function getPrayerScheduleForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<PrayerScheduleConfig> {
  try {
    const { data } = await supabase.from("profiles").select("prayer_schedule").eq("id", userId).maybeSingle()
    return normalizePrayerSchedule(data?.prayer_schedule)
  } catch {
    return normalizePrayerSchedule(null)
  }
}
