import {
  PRAYER_WATCHES,
  formatWatchTimeRange,
  getWatchByNumber,
  watchId,
  watchShortLabel,
} from "@/lib/prayer-watches"

export type PrayerSlotKind = "watch" | "custom"

export interface PrayerScheduleSlot {
  id: string
  kind: PrayerSlotKind
  /** 1–8 when kind === "watch" */
  watchNumber?: number
  /** Optional override label */
  label?: string
  startTime: string
  endTime: string
  enabled: boolean
}

export interface PrayerScheduleConfig {
  slots: PrayerScheduleSlot[]
  /** Used for dashboard card subtitle and legacy prayer_complete fallback */
  primarySlotId: string
}

export const DEFAULT_PRAYER_SCHEDULE: PrayerScheduleConfig = {
  primarySlotId: watchId(4),
  slots: [
    {
      id: watchId(4),
      kind: "watch",
      watchNumber: 4,
      startTime: "03:00",
      endTime: "06:00",
      enabled: true,
    },
  ],
}

function slotFromWatch(w: (typeof PRAYER_WATCHES)[number], enabled: boolean): PrayerScheduleSlot {
  return {
    id: watchId(w.number),
    kind: "watch",
    watchNumber: w.number,
    startTime: w.startTime,
    endTime: w.endTime,
    enabled,
  }
}

export function allWatchSlots(enabled = false): PrayerScheduleSlot[] {
  return PRAYER_WATCHES.map((w) => slotFromWatch(w, enabled))
}

export function normalizePrayerSchedule(raw: unknown): PrayerScheduleConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_PRAYER_SCHEDULE
  const obj = raw as Partial<PrayerScheduleConfig>
  const slotsRaw = Array.isArray(obj.slots) ? obj.slots : []
  const slots: PrayerScheduleSlot[] = []

  for (const item of slotsRaw) {
    if (!item || typeof item !== "object") continue
    const s = item as Partial<PrayerScheduleSlot>
    if (typeof s.id !== "string" || !s.id) continue
    if (s.kind !== "watch" && s.kind !== "custom") continue
    if (typeof s.startTime !== "string" || typeof s.endTime !== "string") continue
    slots.push({
      id: s.id,
      kind: s.kind,
      watchNumber: typeof s.watchNumber === "number" ? s.watchNumber : undefined,
      label: typeof s.label === "string" ? s.label : undefined,
      startTime: s.startTime,
      endTime: s.endTime,
      enabled: s.enabled !== false,
    })
  }

  if (slots.length === 0) return DEFAULT_PRAYER_SCHEDULE

  const primary =
    typeof obj.primarySlotId === "string" && slots.some((s) => s.id === obj.primarySlotId)
      ? obj.primarySlotId
      : slots.find((s) => s.enabled)?.id ?? slots[0].id

  return { slots, primarySlotId: primary }
}

export function enabledSlots(config: PrayerScheduleConfig): PrayerScheduleSlot[] {
  return config.slots.filter((s) => s.enabled)
}

export function slotDisplayLabel(slot: PrayerScheduleSlot): string {
  if (slot.label?.trim()) return slot.label.trim()
  if (slot.kind === "watch" && slot.watchNumber) {
    const w = getWatchByNumber(slot.watchNumber)
    if (w) return watchShortLabel(w.number, w.name)
  }
  return formatWatchTimeRange(slot.startTime, slot.endTime)
}

export function slotDisplayWithTime(slot: PrayerScheduleSlot): string {
  return `${slotDisplayLabel(slot)} (${formatWatchTimeRange(slot.startTime, slot.endTime)})`
}

export function primarySlot(config: PrayerScheduleConfig): PrayerScheduleSlot | undefined {
  return config.slots.find((s) => s.id === config.primarySlotId) ?? enabledSlots(config)[0]
}

export function primarySlotSummary(config: PrayerScheduleConfig): string {
  const enabled = enabledSlots(config)
  if (enabled.length === 0) return "Configure your prayer watches in Settings"
  if (enabled.length === 1) return slotDisplayWithTime(enabled[0])
  const primary = primarySlot(config)
  return primary
    ? `${slotDisplayLabel(primary)} + ${enabled.length - 1} more`
    : `${enabled.length} prayer watches`
}

export type PrayerSlotsCompleted = Record<string, boolean>

export function normalizePrayerSlotsCompleted(raw: unknown): PrayerSlotsCompleted {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: PrayerSlotsCompleted = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "boolean") out[k] = v
  }
  return out
}

/** True when every enabled slot is marked complete. Falls back to legacy prayer_complete. */
export function isPrayerDayComplete(
  config: PrayerScheduleConfig,
  slotsCompleted: PrayerSlotsCompleted,
  legacyPrayerComplete?: boolean
): boolean {
  const enabled = enabledSlots(config)
  if (enabled.length === 0) return Boolean(legacyPrayerComplete)
  return enabled.every((s) => slotsCompleted[s.id] === true)
}

export function computeLegacyPrayerComplete(
  config: PrayerScheduleConfig,
  slotsCompleted: PrayerSlotsCompleted
): boolean {
  return isPrayerDayComplete(config, slotsCompleted, false)
}

export function newCustomSlotId(): string {
  return `custom-${crypto.randomUUID().slice(0, 8)}`
}
