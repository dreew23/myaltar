import { dayOfYearIndex } from "@/lib/pulse-session-dates"

/** Seven verses cycling by day-of-year (spec: Prayer Mode Settle). */
export const ROTATING_SCRIPTURE_VERSES: { ref: string; text: string }[] = [
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { ref: "Psalm 5:3", text: "In the morning I lay my requests before you and wait expectantly." },
  { ref: "Jeremiah 33:3", text: "Call to me and I will answer you and tell you great and unsearchable things you do not know." },
  { ref: "James 4:8", text: "Come near to God and he will come near to you." },
  { ref: "Isaiah 40:31", text: "Those who hope in the Lord will renew their strength." },
  { ref: "Matthew 7:7", text: "Ask and it will be given to you; seek and you will find." },
]

export function getVerseForToday(): { ref: string; text: string } {
  const i = dayOfYearIndex() % ROTATING_SCRIPTURE_VERSES.length
  return ROTATING_SCRIPTURE_VERSES[i]!
}
