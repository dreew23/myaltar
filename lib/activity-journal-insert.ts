/** Row shape for `activity_journal_entries` insert (Sacred Focus journal). */
export interface ActivityJournalInsertRow {
  user_id: string
  activity_id: string
  entry_type: string
  content: string
  scripture_reference: string | null
  speaker: string | null
  is_highlight: boolean
  date: string
}

export function buildActivityJournalInsert(input: {
  userId: string
  activityId: string
  entryType: string
  content: string
  scriptureRef: string
  speaker: string
  isHighlight: boolean
  entryDate: string
}): ActivityJournalInsertRow {
  return {
    user_id: input.userId,
    activity_id: input.activityId,
    entry_type: input.entryType,
    content: input.content.trim(),
    scripture_reference: input.scriptureRef.trim() || null,
    speaker: input.speaker.trim() || null,
    is_highlight: input.isHighlight,
    date: input.entryDate,
  }
}
