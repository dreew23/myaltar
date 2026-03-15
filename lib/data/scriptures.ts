// Curated scripture collections for the Scripture Reader

export const scriptureCollections = [
  {
    id: "peace",
    name: "Peace & Rest",
    icon: "Feather",
    description: "Scriptures for finding calm in chaos",
    verses: [
      { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." },
      { ref: "Isaiah 26:3", text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you." },
      { ref: "Matthew 11:28-30", text: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls." },
      { ref: "Psalm 46:10", text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth." },
      { ref: "John 14:27", text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid." },
    ],
  },
  {
    id: "strength",
    name: "Strength & Courage",
    icon: "Shield",
    description: "For times when you need divine strength",
    verses: [
      { ref: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." },
      { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
      { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
      { ref: "Psalm 27:1", text: "The Lord is my light and my salvation— whom shall I fear? The Lord is the stronghold of my life— of whom shall I be afraid?" },
      { ref: "2 Timothy 1:7", text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." },
    ],
  },
  {
    id: "guidance",
    name: "Guidance & Wisdom",
    icon: "Compass",
    description: "Direction for life's decisions",
    verses: [
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
      { ref: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." },
      { ref: "Psalm 32:8", text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you." },
      { ref: "Proverbs 16:9", text: "In their hearts humans plan their course, but the Lord establishes their steps." },
      { ref: "Isaiah 30:21", text: "Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, 'This is the way; walk in it.'" },
    ],
  },
  {
    id: "hope",
    name: "Hope & Promise",
    icon: "Sunrise",
    description: "Promises to anchor your hope",
    verses: [
      { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
      { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
      { ref: "Lamentations 3:22-23", text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness." },
      { ref: "Psalm 30:5", text: "For his anger lasts only a moment, but his favor lasts a lifetime; weeping may stay for the night, but rejoicing comes in the morning." },
      { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit." },
    ],
  },
  {
    id: "love",
    name: "Love & Grace",
    icon: "Heart",
    description: "The depth of God's love for you",
    verses: [
      { ref: "Romans 8:38-39", text: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord." },
      { ref: "1 John 4:19", text: "We love because he first loved us." },
      { ref: "Ephesians 2:8-9", text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast." },
      { ref: "Zephaniah 3:17", text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing." },
      { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
    ],
  },
  {
    id: "purpose",
    name: "Purpose & Calling",
    icon: "Target",
    description: "Discovering your divine purpose",
    verses: [
      { ref: "Ephesians 2:10", text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." },
      { ref: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will." },
      { ref: "Psalm 139:13-14", text: "For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made." },
      { ref: "1 Peter 2:9", text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession, that you may declare the praises of him who called you out of darkness into his wonderful light." },
      { ref: "Colossians 3:23-24", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward." },
    ],
  },
]

export function getAllVerses() {
  return scriptureCollections.flatMap((c) => c.verses.map((v) => ({ ...v, collection: c.id })))
}

export function getVerseByRef(ref: string) {
  for (const col of scriptureCollections) {
    const verse = col.verses.find((v) => v.ref === ref)
    if (verse) return { ...verse, collection: col.id, collectionName: col.name }
  }
  return null
}
