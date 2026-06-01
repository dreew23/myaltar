import type { SupabaseClient } from "@supabase/supabase-js"

const PULSE_CLOSE_TAG = "[Sunday Pulse] Planning session complete — closing prayer."

/**
 * When a Sunday Pulse session is completed, log a finished `prayer_sessions` row so the Prayer
 * module / history shows the closing prayer. Uses `session_type: spontaneous` (one per local day);
 * merges journal text if a spontaneous row already exists.
 */
export async function recordSundayPulseClosingPrayer(
  supabase: SupabaseClient,
  opts: {
    userId: string
    sessionDate: string
    startedAt: string | null
    completedAt: string
    totalMinutes: number
    sessionQuality: number | null
  }
): Promise<{ error: { message: string } | null }> {
  const duration = Math.max(1, opts.totalMinutes)
  const start = opts.startedAt ?? opts.completedAt

  const { data: existing, error: selErr } = await supabase
    .from("prayer_sessions")
    .select("id, journal_entry")
    .eq("user_id", opts.userId)
    .eq("date", opts.sessionDate)
    .eq("session_type", "spontaneous")
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (selErr) return { error: { message: selErr.message } }

  const q = opts.sessionQuality
  const qualityPatch =
    q != null && q >= 1 && q <= 5 ? { quality_rating: q } : {}

  if (existing?.id) {
    const prev = (existing.journal_entry as string | null)?.trim() ?? ""
    const nextJournal = prev.includes(PULSE_CLOSE_TAG) ? prev : prev ? `${prev}\n\n${PULSE_CLOSE_TAG}` : PULSE_CLOSE_TAG
    const { error } = await supabase
      .from("prayer_sessions")
      .update({
        end_time: opts.completedAt,
        duration_minutes: duration,
        journal_entry: nextJournal,
        ...qualityPatch,
      })
      .eq("id", existing.id)
    return { error: error ? { message: error.message } : null }
  }

  const { error } = await supabase.from("prayer_sessions").insert({
    user_id: opts.userId,
    date: opts.sessionDate,
    session_type: "spontaneous",
    start_time: start,
    end_time: opts.completedAt,
    duration_minutes: duration,
    journal_entry: PULSE_CLOSE_TAG,
    ...qualityPatch,
  })

  return { error: error ? { message: error.message } : null }
}
