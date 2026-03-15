"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const showcaseFeatures = [
  {
    id: "prayer-tracking",
    title: "Prayer Tracking",
    description:
      "Record, organize, and celebrate answered prayers with our powerful prayer tracking system. Build a testimony of God's faithfulness over time.",
    image: "/placeholder.svg?height=400&width=600",
    stats: [
      { label: "Answered Prayers Tracked", value: "12,000+" },
      { label: "Prayer Circles", value: "1,500+" },
      { label: "Avg. Prayer Time Increase", value: "37%" },
    ],
  },
  {
    id: "scripture-integration",
    title: "Scripture Integration",
    description:
      "Weave biblical wisdom throughout your planning with personalized scripture selections aligned with your spiritual season and current challenges.",
    image: "/placeholder.svg?height=400&width=600",
    stats: [
      { label: "Scripture Verses", value: "1,000+" },
      { label: "Daily Readings", value: "Personalized" },
      { label: "Scripture Memory", value: "Built-in" },
    ],
  },
  {
    id: "sacred-planning",
    title: "Sacred Planning",
    description:
      "Transform ordinary tasks into sacred assignments with our Kingdom Priority Framework. Align your daily actions with your spiritual values and divine purpose.",
    image: "/placeholder.svg?height=400&width=600",
    stats: [
      { label: "Time Saved Weekly", value: "2+ hours" },
      { label: "Purpose Alignment", value: "95%" },
      { label: "Spiritual Focus", value: "Increased" },
    ],
  },
  {
    id: "community",
    title: "Sacred Community",
    description:
      "Connect with other women on similar spiritual journeys through prayer circles, wisdom sharing, and mentorship opportunities. Grow together in faith and purpose.",
    image: "/placeholder.svg?height=400&width=600",
    stats: [
      { label: "Active Members", value: "8,000+" },
      { label: "Prayer Circles", value: "1,500+" },
      { label: "Mentorship Connections", value: "3,200+" },
    ],
  },
]

export default function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % showcaseFeatures.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % showcaseFeatures.length)
  }

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + showcaseFeatures.length) % showcaseFeatures.length)
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] to-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                Featured Highlights
              </h2>
              <Sparkles className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              Discover our most beloved features that transform ordinary planning into extraordinary spiritual practice
            </p>
          </div>

          {/* Feature Showcase */}
          <div className="relative">
            {/* Navigation Arrows */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={prevFeature}
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <ArrowLeft className="w-5 h-5 text-[#3C1E38]" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={nextFeature}
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <ArrowRight className="w-5 h-5 text-[#3C1E38]" />
              </Button>
            </div>

            {/* Feature Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-[#A7C2D7]/20 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Feature Image */}
                <div className="order-2 lg:order-1 p-6 lg:p-8">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={showcaseFeatures[activeFeature].image || "/placeholder.svg"}
                      alt={showcaseFeatures[activeFeature].title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                </div>

                {/* Feature Description */}
                <div className="order-1 lg:order-2 p-6 lg:p-8 bg-gradient-to-br from-[#FBF8F3] to-white">
                  <div className="h-full flex flex-col">
                    <h3 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38] mb-4">
                      {showcaseFeatures[activeFeature].title}
                    </h3>
                    <p className="font-inter text-[#3C1E38]/70 leading-relaxed mb-6">
                      {showcaseFeatures[activeFeature].description}
                    </p>

                    {/* Feature Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {showcaseFeatures[activeFeature].stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="font-playfair text-xl font-bold text-[#A7C2D7]">{stat.value}</div>
                          <div className="font-inter text-xs text-[#3C1E38]/60">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Feature Navigation Dots */}
                    <div className="mt-auto flex justify-center gap-2">
                      {showcaseFeatures.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveFeature(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === activeFeature ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
