import { describe, expect, it } from "vitest"
import { normalizePulseCheckRow } from "./pulse-check-row"

describe("normalizePulseCheckRow", () => {
  it("maps legacy g1_prayer_note to g1_note", () => {
    const row = normalizePulseCheckRow({
      g1_prayer: "yes",
      g1_prayer_note: "Prayed daily",
      g1_prayer_note_extra: "ignored",
    })
    expect(row.g1_note).toBe("Prayed daily")
    expect(row.g1_prayer).toBe("yes")
    expect("g1_prayer_note" in row).toBe(false)
    expect("g1_prayer_note_extra" in row).toBe(false)
  })

  it("keeps correct g1_note when already present", () => {
    const row = normalizePulseCheckRow({
      g1_note: "correct",
      g1_prayer_note: "legacy",
    })
    expect(row.g1_note).toBe("correct")
  })
})
