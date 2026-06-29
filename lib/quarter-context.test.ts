import { describe, expect, it } from "vitest"
import {
  buildQuarterWeekHistoryRows,
  findBackfillCandidate,
  getSundayForQuarterWeek,
  getWeekInQuarterRange,
  listArchivableQuarters,
  resolvePulseQuarterContext,
  type QuarterConfigRow,
} from "./quarter-context"

const activeQuarter: QuarterConfigRow = {
  id: "q1",
  code: "Y2-2026",
  name: "Momentum & Mastery",
  start_date: "2026-03-02",
  end_date: "2026-05-31",
  year_number: 2,
  is_active: true,
}

describe("getWeekInQuarterRange", () => {
  it("returns week 1 on start date", () => {
    expect(getWeekInQuarterRange("2026-03-02", "2026-05-31", "2026-03-02")).toBe(1)
  })

  it("returns week 2 after seven days", () => {
    expect(getWeekInQuarterRange("2026-03-02", "2026-05-31", "2026-03-09")).toBe(2)
  })

  it("caps at week 13", () => {
    expect(getWeekInQuarterRange("2026-03-02", "2026-05-31", "2026-06-15")).toBe(13)
  })

  it("returns 0 before quarter start", () => {
    expect(getWeekInQuarterRange("2026-03-02", "2026-05-31", "2026-02-01")).toBe(0)
  })
})

describe("getSundayForQuarterWeek", () => {
  it("returns first Sunday when quarter starts on Monday", () => {
    expect(getSundayForQuarterWeek("2026-03-02", 1)).toBe("2026-03-08")
  })

  it("returns start date when quarter starts on Sunday", () => {
    expect(getSundayForQuarterWeek("2026-03-01", 1)).toBe("2026-03-01")
  })

  it("advances by seven days per week", () => {
    expect(getSundayForQuarterWeek("2026-03-02", 2)).toBe("2026-03-15")
  })
})

describe("resolvePulseQuarterContext", () => {
  it("uses active quarter_config when date is in range", () => {
    const ctx = resolvePulseQuarterContext("2026-03-15", activeQuarter, [activeQuarter])
    expect(ctx.source).toBe("quarter_config")
    expect(ctx.quarterCode).toBe("Y2-2026")
    expect(ctx.quarterName).toBe("Momentum & Mastery")
    expect(ctx.weekNumber).toBeGreaterThanOrEqual(1)
    expect(ctx.weekNumber).toBeLessThanOrEqual(13)
  })

  it("marks week 13 as complete", () => {
    const ctx = resolvePulseQuarterContext("2026-05-25", activeQuarter, [activeQuarter])
    expect(ctx.weekNumber).toBe(13)
    expect(ctx.isComplete).toBe(true)
  })

  it("falls back to calendar when no active quarter", () => {
    const ctx = resolvePulseQuarterContext("2026-04-15", null, [])
    expect(ctx.source).toBe("calendar")
    expect(ctx.quarterCode).toBe("2026-Q2")
  })

  it("resolves archived quarter for historical dates", () => {
    const archived: QuarterConfigRow = {
      ...activeQuarter,
      id: "q0",
      code: "Y1-2025",
      name: "Foundation",
      start_date: "2025-12-01",
      end_date: "2026-02-28",
      is_active: false,
    }
    const ctx = resolvePulseQuarterContext("2026-01-15", null, [archived])
    expect(ctx.quarterCode).toBe("Y1-2025")
    expect(ctx.source).toBe("quarter_config")
  })
})

describe("listArchivableQuarters", () => {
  it("merges config rows and historical pulse codes", () => {
    const list = listArchivableQuarters([activeQuarter], [
      { quarter_code: "2026-Q2", date: "2026-04-01" },
      { quarter_code: "Y2-2026", date: "2026-03-08" },
    ])
    expect(list.some((q) => q.code === "Y2-2026" && q.isActive)).toBe(true)
    expect(list.some((q) => q.code === "2026-Q2" && !q.isActive)).toBe(true)
  })
})

describe("findBackfillCandidate", () => {
  it("detects sessions stored under calendar code in active quarter range", () => {
    const candidate = findBackfillCandidate(
      activeQuarter,
      [{ quarter_code: "2026-Q2", date: "2026-03-08" }],
      [{ quarter_code: "2026-Q2", date: "2026-03-08" }],
    )
    expect(candidate).not.toBeNull()
    expect(candidate?.oldCode).toBe("2026-Q2")
    expect(candidate?.newCode).toBe("Y2-2026")
    expect(candidate?.sessionCount).toBe(1)
  })
})

describe("buildQuarterWeekHistoryRows", () => {
  it("builds 13 rows for a quarter", () => {
    const rows = buildQuarterWeekHistoryRows(
      { code: "Y2-2026", startDate: "2026-03-02" },
      [],
      "2026-03-10",
      "Y2-2026",
    )
    expect(rows).toHaveLength(13)
    expect(rows[0]!.weekNumber).toBe(1)
    expect(rows[12]!.weekNumber).toBe(13)
  })
})
