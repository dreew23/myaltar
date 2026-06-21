import { describe, expect, it } from "vitest"
import {
  COMMITMENT_TYPES,
  COMMITMENT_TYPE_META,
  intercessionThemesForPicker,
  intercessionTitleForDay,
  weeklyCommitmentInsertPayload,
} from "./weekly-commitments"

describe("weekly-commitments", () => {
  it("defines meta for every commitment type in the picker", () => {
    for (const type of COMMITMENT_TYPES) {
      const meta = COMMITMENT_TYPE_META[type]
      expect(meta.label.length).toBeGreaterThan(0)
      expect(meta.defaultUnit.length).toBeGreaterThan(0)
      expect(meta.defaultTarget).toBeGreaterThan(0)
      expect(meta.step).toBeGreaterThan(0)
    }
  })

  it("lists new spiritual types before legacy types and custom last", () => {
    expect(COMMITMENT_TYPES[0]).toBe("bible_reading")
    expect(COMMITMENT_TYPES.at(-1)).toBe("custom")
    expect(COMMITMENT_TYPES).toContain("worship_minutes")
    expect(COMMITMENT_TYPES).toContain("intercession")
  })

  it("returns seven intercession themes with dominion fallback", () => {
    const themes = intercessionThemesForPicker(null)
    expect(themes).toHaveLength(7)
    expect(themes[0]?.dayLabel).toBe("Sunday")
    expect(themes.every((t) => t.theme.length > 0)).toBe(true)
  })

  it("omits intercession_day_of_week unless intercession type with a day", () => {
    const bible = weeklyCommitmentInsertPayload({
      userId: "u1",
      weekStartStr: "2026-06-01",
      type: "bible_reading",
      title: "Read",
      dailyTarget: 1,
      unit: "chapters",
      declarationId: null,
      intercessionDayOfWeek: null,
      displayOrder: 0,
    })
    expect(bible).not.toHaveProperty("intercession_day_of_week")

    const intercession = weeklyCommitmentInsertPayload({
      userId: "u1",
      weekStartStr: "2026-06-01",
      type: "intercession",
      title: "Intercession — Family",
      dailyTarget: 15,
      unit: "min",
      declarationId: null,
      intercessionDayOfWeek: 2,
      displayOrder: 1,
    })
    expect(intercession.intercession_day_of_week).toBe(2)
  })

  it("uses user schedule themes when provided", () => {
    const schedule = Array.from({ length: 7 }, (_, day_of_week) => ({
      day_of_week,
      theme: `Theme ${day_of_week}`,
      people: [],
      life_areas: [],
    }))
    const themes = intercessionThemesForPicker(schedule)
    expect(themes[3]?.theme).toBe("Theme 3")
    expect(intercessionTitleForDay(3, schedule)).toBe("Intercession — Theme 3")
  })
})
