"use client"

import { useState } from "react"
import { trackEvent } from "@/lib/safe-analytics"

interface Testimonial {
  id: string
  name: string
  role: string
  spiritualStage: "seeker" | "growing" | "mature" | "leader"
  scenario: string
  quote: string
  feature: string
  outcome: string
  timeframe: string
  avatar: string
  rating: number
  verified: boolean
}

const testimonials: Testimonial[] = [
  {
    id: "sarah-newbeliever",
    name: "Sarah M.",
    role: "New Believer",
    spiritualStage: "seeker",
    scenario: "Just started her faith journey, overwhelmed by where to begin",
    quote:
      "ALTAR made prayer feel approachable instead of intimidating. The gentle prompts helped me find my voice with God, and seeing my answered prayers tracked gave me such encouragement!",
    feature: "Prayer Tracking",
    outcome: "Consistent daily prayer habit established",
    timeframe: "3 months",
    avatar: "👩‍💼",
    rating: 5,
    verified: true,
  },
  {
    id: "michael-busyparent",
    name: "Michael R.",
    role: "Father of Three",
    spiritualStage: "growing",
    scenario: "Struggling to maintain spiritual life amid family chaos",
    quote:
      "The sacred planning feature changed everything. I can now see how God wants to use even my parenting challenges for His glory. My kids see me prioritizing Kingdom values.",
    feature: "Sacred Planning",
    outcome: "Integrated faith into daily family life",
    timeframe: "6 months",
    avatar: "👨‍👧‍👦",
    rating: 5,
    verified: true,
  },
  {
    id: "grace-prayerwarrior",
    name: "Grace L.",
    role: "Prayer Warrior",
    spiritualStage: "mature",
    scenario: "Leading intercession ministry, needed better organization",
    quote:
      "Finally, a tool that understands the depth of intercessory prayer! The team prayer features and answered prayer testimonies have revolutionized our prayer ministry.",
    feature: "Advanced Prayer Management",
    outcome: "Prayer ministry grew 300%",
    timeframe: "1 year",
    avatar: "👩‍🦳",
    rating: 5,
    verified: true,
  },
  {
    id: "pastor-david",
    name: "Pastor David K.",
    role: "Ministry Leader",
    spiritualStage: "leader",
    scenario: "Managing congregation needs while maintaining personal spiritual health",
    quote:
      "ALTAR helps me balance pastoral care with personal spiritual formation. The insights help me understand my congregation's spiritual health patterns.",
    feature: "Ministry Dashboard",
    outcome: "Improved pastoral effectiveness",
    timeframe: "8 months",
    avatar: "👨‍💼",
    rating: 5,
    verified: true,
  },
  {
    id: "emma-student",
    name: "Emma T.",
    role: "College Student",
    spiritualStage: "growing",
    scenario: "Balancing academic pressure with spiritual growth",
    quote:
      "The scripture integration during study breaks transformed my academic stress into worship opportunities. My grades improved AND my faith deepened!",
    feature: "Scripture Integration",
    outcome: "4.0 GPA + spiritual growth",
    timeframe: "2 semesters",
    avatar: "👩‍🎓",
    rating: 5,
    verified: true,
  },
  {
    id: "james-entrepreneur",
    name: "James W.",
    role: "Christian Entrepreneur",
    spiritualStage: "mature",
    scenario: "Building business while maintaining Kingdom values",
    quote:
      "ALTAR helped me align my business decisions with biblical principles. The ethical reflection prompts saved me from compromising my values for profit.",
    feature: "Values-Based Planning",
    outcome: "Ethical business growth",
    timeframe: "18 months",
    avatar: "👨‍💻",
    rating: 5,
    verified: true,
  },
  {
    id: "margaret-retiree",
    name: "Margaret S.",
    role: "Retired Volunteer",
    spiritualStage: "mature",
    scenario: "Seeking God's purpose in retirement season",
    quote:
      "At 68, I discovered God had new adventures for me! ALTAR's life season guidance helped me launch a ministry to widows that's now serving 200+ women.",
    feature: "Life Season Guidance",
    outcome: "New ministry launched",
    timeframe: "10 months",
    avatar: "👵",
    rating: 5,
    verified: true,
  },
  {
    id: "alex-professional",
    name: "Alex C.",
    role: "Young Professional",
    spiritualStage: "growing",
    scenario: "Climbing career ladder while maintaining spiritual priorities",
    quote:
      "The workplace witness prompts gave me courage to share my faith naturally. Three colleagues have started asking about my 'different' approach to work stress.",
    feature: "Workplace Ministry",
    outcome: "Effective workplace witness",
    timeframe: "4 months",
    avatar: "👨‍💼",
    rating: 5,
    verified: true,
  },
]

export default function ScenarioBasedTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [filterStage, setFilterStage] = useState<string>("all")

  const filteredTestimonials = filterStage === "all" 
    ? testimonials 
    : testimonials.filter(t => t.spiritualStage === filterStage)

  const activeTestimonial = filteredTestimonials[currentTestimonial] || testimonials[0]

  const handleNext = () => {
    setCurrentTestimonial((prev) => (prev + 1) % filteredTestimonials.length)
    trackEvent("testimonial_navigation", "features", "next")
  }

  const handlePrev = () => {
    setCurrentTestimonial((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length)
    trackEvent("testimonial_navigation", "features", "prev")
  }

  const handleFilterChange = (stage: string) => {
    setFilterStage(stage)
    setCurrentTestimonial(0)
    trackEvent("testimonial_filter", "features")
  }

  const stages = ["all", "seeker", "growing", "mature", "leader"] as const

  if (filteredTestimonials.length === 0) {
    return (
      <section className="py-12 px-4 text-center text-sm text-[#3C1E38]/60">
        No stories match this filter.
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-[#FDFCF9]">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-center gap-2">
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => handleFilterChange(stage)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filterStage === stage
                  ? "bg-[#F9D57E] text-[#3C1E38] font-medium"
                  : "bg-white border border-[#A7C2D7]/30 text-[#3C1E38]/70 hover:bg-[#A7C2D7]/10"
              }`}
            >
              {stage === "all" ? "All" : stage.charAt(0).toUpperCase() + stage.slice(1)}
            </button>
          ))}
        </div>
        <blockquote className="font-garamond text-lg sm:text-xl text-[#3C1E38] leading-relaxed">
          &ldquo;{activeTestimonial.quote}&rdquo;
        </blockquote>
        <p className="text-sm font-medium text-[#3C1E38]">
          {activeTestimonial.name} — {activeTestimonial.role}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrev}
            className="px-4 py-2 rounded-lg border border-[#A7C2D7]/40 text-sm text-[#3C1E38] hover:bg-[#A7C2D7]/10"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-lg border border-[#A7C2D7]/40 text-sm text-[#3C1E38] hover:bg-[#A7C2D7]/10"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
