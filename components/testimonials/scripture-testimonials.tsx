"use client"

import { useRef, useEffect, useState } from "react"
import { BookOpen, Quote } from "lucide-react"

const scriptureTestimonials = [
  {
    id: 1,
    name: "Rebecca Johnson",
    title: "Bible Study Leader",
    image: "/placeholder.svg?height=80&width=80",
    scripture: "Isaiah 40:31",
    scriptureText:
      "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    testimony:
      "This verse became my daily anchor through ALTAR's scripture integration. When my schedule felt overwhelming, the app reminded me to hope in the Lord first, and my strength was truly renewed.",
    bibleImage: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 2,
    name: "Michelle Garcia",
    title: "Worship Leader & Mother",
    image: "/placeholder.svg?height=80&width=80",
    scripture: "Philippians 4:6-7",
    scriptureText:
      "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
    testimony:
      "ALTAR's morning prayer prompts helped me transform my anxiety into specific prayers. The difference was immediate—that peace that passes understanding became my daily reality instead of just a nice verse.",
    bibleImage: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 3,
    name: "Sarah Thompson",
    title: "Healthcare Administrator",
    image: "/placeholder.svg?height=80&width=80",
    scripture: "Proverbs 16:3",
    scriptureText: "Commit to the LORD whatever you do, and he will establish your plans.",
    testimony:
      "This verse transformed how I approach my work calendar. ALTAR helped me commit each meeting and task to the Lord first, and I've seen Him establish my plans in ways I never imagined possible.",
    bibleImage: "/placeholder.svg?height=300&width=400",
  },
]

export default function ScriptureTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const current = scriptureTestimonials[activeIndex]

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-white to-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Scripture That Transforms
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            How God's Word comes alive through ALTAR's sacred rhythms
          </p>
        </div>

        <div
          className={`max-w-6xl mx-auto transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Scripture Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={current.bibleImage || "/placeholder.svg"}
                  alt={`Bible open to ${current.scripture}`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{current.scripture}</span>
                  </div>
                </div>
              </div>

              {/* Scripture Text Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                <blockquote className="font-garamond text-xl italic text-[#3C1E38] leading-relaxed">
                  "{current.scriptureText}"
                </blockquote>
              </div>
            </div>

            {/* Testimony */}
            <div className="bg-white rounded-2xl p-8 shadow-xl relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>

              <div className="mb-8">
                <blockquote className="font-garamond text-xl italic text-[#3C1E38] leading-relaxed mb-6">
                  "{current.testimony}"
                </blockquote>

                {/* Profile */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                    <img
                      src={current.image || "/placeholder.svg"}
                      alt={current.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">{current.name}</h3>
                    <p className="font-inter text-sm text-[#3C1E38]/60">{current.title}</p>
                  </div>
                </div>
              </div>

              {/* Scripture Selection */}
              <div className="border-t border-[#A7C2D7]/20 pt-6">
                <h4 className="font-inter text-sm font-medium text-[#3C1E38]/70 mb-4">
                  Explore more scripture testimonies:
                </h4>
                <div className="flex flex-wrap gap-3">
                  {scriptureTestimonials.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIndex(index)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        index === activeIndex
                          ? "bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white"
                          : "bg-[#A7C2D7]/10 text-[#3C1E38] hover:bg-[#A7C2D7]/20"
                      }`}
                    >
                      {item.scripture}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
