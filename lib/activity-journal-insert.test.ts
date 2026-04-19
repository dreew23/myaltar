import { describe, expect, it } from "vitest"
import { buildActivityJournalInsert } from "./activity-journal-insert"

describe("buildActivityJournalInsert", () => {
  it("builds a Supabase-ready row with trimmed strings and nulls for empty optionals", () => {
    const row = buildActivityJournalInsert({
      userId: "user-1",
      activityId: "act-1",
      entryType: "revelation",
      content: "  hello  ",
      scriptureRef: "  ",
      speaker: "",
      isHighlight: true,
      entryDate: "2026-04-04",
    })
    expect(row).toEqual({
      user_id: "user-1",
      activity_id: "act-1",
      entry_type: "revelation",
      content: "hello",
      scripture_reference: null,
      speaker: null,
      is_highlight: true,
      date: "2026-04-04",
    })
  })
})
