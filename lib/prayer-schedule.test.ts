import { describe, expect, it } from "vitest"
import { normalizePrayerSchedule, computeLegacyPrayerComplete, slotDisplayLabel } from "./prayer-schedule"
import { watchId } from "./prayer-watches"

describe("prayer-schedule", () => {
  it("defaults to 4th watch enabled", () => {
    const config = normalizePrayerSchedule(null)
    expect(config.primarySlotId).toBe(watchId(4))
    expect(config.slots.filter((s) => s.enabled)).toHaveLength(1)
  })

  it("marks day complete when all enabled slots done", () => {
    const config = normalizePrayerSchedule({
      primarySlotId: watchId(4),
      slots: [
        { id: watchId(4), kind: "watch", watchNumber: 4, startTime: "03:00", endTime: "06:00", enabled: true },
        { id: watchId(5), kind: "watch", watchNumber: 5, startTime: "06:00", endTime: "09:00", enabled: true },
      ],
    })
    expect(computeLegacyPrayerComplete(config, { [watchId(4)]: true })).toBe(false)
    expect(
      computeLegacyPrayerComplete(config, { [watchId(4)]: true, [watchId(5)]: true })
    ).toBe(true)
  })

  it("formats watch labels", () => {
    const config = normalizePrayerSchedule(null)
    const slot = config.slots[0]
    expect(slotDisplayLabel(slot)).toContain("4th Watch")
  })
})
