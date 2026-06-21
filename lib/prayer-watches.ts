/** Canonical eight 3-hour prayer watches (24-hour coverage). */

export interface PrayerWatchDefinition {
  number: number
  name: string
  startTime: string // HH:mm 24h
  endTime: string
  focus: string
}

export const PRAYER_WATCHES: PrayerWatchDefinition[] = [
  {
    number: 1,
    name: "Evening Watch",
    startTime: "18:00",
    endTime: "21:00",
    focus: "Quiet reflection, covenant renewal, releasing anxieties",
  },
  {
    number: 2,
    name: "Late Night Watch",
    startTime: "21:00",
    endTime: "00:00",
    focus: "Divine judgment, deliverance, protection over families",
  },
  {
    number: 3,
    name: "Midnight Watch",
    startTime: "00:00",
    endTime: "03:00",
    focus: "Spiritual warfare, praying against attacks",
  },
  {
    number: 4,
    name: "Morning Watch",
    startTime: "03:00",
    endTime: "06:00",
    focus: "Deliverance, resurrection, commanding the day",
  },
  {
    number: 5,
    name: "Early Morning Watch",
    startTime: "06:00",
    endTime: "09:00",
    focus: "Healing, Holy Spirit equipping for service",
  },
  {
    number: 6,
    name: "Mid-Morning Watch",
    startTime: "09:00",
    endTime: "12:00",
    focus: "Harvest of promises, provision",
  },
  {
    number: 7,
    name: "Midday Watch",
    startTime: "12:00",
    endTime: "15:00",
    focus: "Rest, secret place, letting light shine",
  },
  {
    number: 8,
    name: "Evening Power Watch",
    startTime: "15:00",
    endTime: "18:00",
    focus: "Hour of power, shaping history, deliverance",
  },
]

export function watchId(number: number): string {
  return `watch-${number}`
}

export function getWatchByNumber(n: number): PrayerWatchDefinition | undefined {
  return PRAYER_WATCHES.find((w) => w.number === n)
}

/** e.g. "6:00 PM – 9:00 PM" */
export function formatWatchTimeRange(startTime: string, endTime: string): string {
  const fmt = (hhmm: string) => {
    const [hStr, mStr] = hhmm.split(":")
    let h = parseInt(hStr, 10)
    const m = mStr ?? "00"
    const ampm = h >= 12 ? "PM" : "AM"
    if (h === 0) h = 12
    else if (h > 12) h -= 12
    return m === "00" ? `${h}:00 ${ampm}` : `${h}:${m} ${ampm}`
  }
  return `${fmt(startTime)} – ${fmt(endTime)}`
}

export function watchShortLabel(number: number, name: string): string {
  const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]
  return `${ordinals[number - 1] ?? `${number}th`} Watch · ${name}`
}
