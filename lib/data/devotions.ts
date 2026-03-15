export const dailyVerses = [
  { ref: "Psalm 143:8", text: "Let the morning bring me word of your unfailing love, for I have put my trust in you." },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
  { ref: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "Lamentations 3:22-23", text: "His mercies are new every morning; great is your faithfulness." },
  { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him." },
  { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
  { ref: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you." },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged." },
  { ref: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path." },
  { ref: "Colossians 3:23", text: "Whatever you do, work at it with all your heart, as working for the Lord." },
]

export const prayerPrompts = [
  "Lord, guide my steps today and help me walk in Your purpose.",
  "Father, grant me wisdom for the decisions I face today.",
  "Holy Spirit, fill me with peace that surpasses all understanding.",
  "Lord, help me to be a light to everyone I encounter today.",
  "Father, I surrender my plans to You. Let Your will be done.",
  "Lord, strengthen me where I am weak and comfort me where I hurt.",
]

export const gratitudePrompts = [
  "What is one blessing you noticed this morning?",
  "Who has God placed in your life that you are grateful for?",
  "What answered prayer can you celebrate today?",
  "What simple joy did you experience recently?",
  "How has God provided for you this week?",
]

export function getTodayVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return dailyVerses[dayOfYear % dailyVerses.length]
}

export function getTodayPrayerPrompt() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return prayerPrompts[dayOfYear % prayerPrompts.length]
}

export function getTodayGratitudePrompt() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return gratitudePrompts[dayOfYear % gratitudePrompts.length]
}
