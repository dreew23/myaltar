"use client"

import { useState, useEffect } from "react"
import { Play, Sparkles, ArrowRight, ArrowLeft, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/safe-analytics"
import AISpiritualGuidance from "./ai-spiritual-guidance"
import AIPrayerGuidance from "./ai-prayer-guidance"

const showcaseFeatures = [
  {
    id: "prayer-tracking",
    title: "Prayer Tracking & Testimony Building",
    description:
      "Record, organize, and celebrate answered prayers with our powerful prayer tracking system. Build a testimony of God's faithfulness over time.",
    image: "/placeholder.svg?height=400&width=600",
    demoType: "prayer-tracking" as const,
    stats: [
      { label: "Answered Prayers Tracked", value: "12,000+", trend: "+23% this month" },
      { label: "Prayer Circles", value: "1,500+", trend: "Growing daily" },
      { label: "Avg. Prayer Time Increase", value: "37%", trend: "After 30 days" },
    ],
    benefits: [
      "See God's faithfulness documented over time",
      "Organize prayers by category and urgency",
      "Share prayer requests with trusted circles",
      "Celebrate answered prayers with community",
    ],
    userStories: [
      { name: "Sarah M.", quote: "Seeing my answered prayers tracked has strengthened my faith immeasurably." },
      { name: "Maria R.", quote: "The prayer circles feature connected me with amazing women of faith." },
    ],
  },
  {
    id: "scripture-integration",
    title: "Scripture Integration & Divine Wisdom",
    description:
      "Weave biblical wisdom throughout your planning with personalized scripture selections aligned with your spiritual season and current challenges.",
    image: "/placeholder.svg?height=400&width=600",
    demoType: "scripture-integration" as const,
    stats: [
      { label: "Scripture Verses", value: "1,000+", trend: "Curated daily" },
      { label: "Daily Readings", value: "Personalized", trend: "AI-powered" },
      { label: "Memory Verses", value: "Built-in", trend: "Spaced repetition" },
    ],
    benefits: [
      "Personalized scripture for your spiritual season",
      "Contextual biblical insights for daily decisions",
      "Scripture memorization with spaced repetition",
      "Reflection prompts to deepen understanding",
    ],
    userStories: [
      { name: "Grace T.", quote: "Having God's word woven throughout my planning has been life-changing." },
      { name: "Rebecca C.", quote: "The scripture selections always seem perfectly timed for what I'm facing." },
    ],
  },
  {
    id: "sacred-planning",
    title: "Sacred Planning & Kingdom Priorities",
    description:
      "Transform ordinary tasks into sacred assignments with our Kingdom Priority Framework. Align your daily actions with your spiritual values and divine purpose.",
    image: "/placeholder.svg?height=400&width=600",
    demoType: "sacred-planning" as const,
    stats: [
      { label: "Time Saved Weekly", value: "2+ hours", trend: "Through divine focus" },
      { label: "Purpose Alignment", value: "95%", trend: "User satisfaction" },
      { label: "Spiritual Focus", value: "Increased", trend: "Measurable growth" },
    ],
    benefits: [
      "Organize tasks by eternal significance",
      "Protect sacred time for prayer and devotion",
      "Align daily actions with spiritual values",
      "Experience peace through divine order",
    ],
    userStories: [
      { name: "Jennifer L.", quote: "The Kingdom Priority Framework brought such peace to my planning." },
      { name: "Amanda K.", quote: "Now everything I do feels aligned with my spiritual calling." },
    ],
  },
  {
    id: "ai-guidance",
    title: "AI-Powered Spiritual Guidance",
    description:
      "Receive personalized spiritual insights and prayer guidance powered by AI that learns from your unique spiritual journey and current needs.",
    image: "/placeholder.svg?height=400&width=600",
    demoType: "ai-guidance" as const,
    component: <AISpiritualGuidance />,
    stats: [
      { label: "Personalized Insights", value: "Daily", trend: "Continuously learning" },
      { label: "Scripture Alignment", value: "100%", trend: "Bible-based" },
      { label: "Spiritual Growth", value: "Measurable", trend: "Weekly progress" },
    ],
    benefits: [
      "Receive insights based on your spiritual patterns",
      "Get scripture recommendations for your situation",
      "Discover blind spots in your spiritual journey",
      "Receive gentle nudges for spiritual growth",
    ],
    userStories: [
      { name: "Rachel M.", quote: "The AI guidance feels like having a wise spiritual mentor available 24/7." },
      {
        name: "Michael R.",
        quote: "When I don't know how to pray, the AI guidance gives me the perfect starting point.",
      },
    ],
  },
  {
    id: "prayer-guidance",
    title: "Intelligent Prayer Guidance",
    description:
      "Experience guided prayer sessions tailored to your current needs, spiritual maturity, and available time with our AI-powered prayer companion.",
    image: "/placeholder.svg?height=400&width=600",
    demoType: "prayer-guidance" as const,
    component: <AIPrayerGuidance />,
    stats: [
      { label: "Prayer Types", value: "12+", trend: "Continuously expanding" },
      { label: "Scripture Integration", value: "Seamless", trend: "Context-aware" },
      { label: "User Satisfaction", value: "98%", trend: "Deeply meaningful" },
    ],
    benefits: [
      "Prayer guidance for any situation",
      "Time-aware prayer sessions (2-15+ minutes)",
      "Scripture-integrated prayer prompts",
      "Progressive prayer development",
    ],
    userStories: [
      { name: "Lisa P.", quote: "The prayer guidance has transformed my prayer life completely." },
      { name: "David S.", quote: "I never knew how to pray for wisdom until the AI showed me biblical patterns." },
    ],
  },
]

export default function EnhancedFeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [showDemo, setShowDemo] = useState(false)
  const [viewMode, setViewMode] = useState<"overview" | "benefits" | "stories">("overview")
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % showcaseFeatures.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [autoPlay])

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % showcaseFeatures.length)
    setAutoPlay(false)
    trackEvent("feature_navigation", "showcase", "next")
  }

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + showcaseFeatures.length) % showcaseFeatures.length)
    setAutoPlay(false)
    trackEvent("feature_navigation", "showcase", "previous")
  }

  const handleDemoClick = () => {
    setShowDemo(true)
    trackEvent("demo_opened", "showcase", showcaseFeatures[activeFeature].id)
  }

  const currentFeature = showcaseFeatures[activeFeature]

  return (
    <section
      id="features-showcase"
      className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] to-white overflow-hidden"
    >
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
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 text-[#3C1E38]" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={nextFeature}
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <ArrowRight className="w-5 h-5 text-[#3C1E38]" />
              </Button>
            </div>

            {/* Feature Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-[#A7C2D7]/20 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Feature Image/Demo */}
                <div className="order-2 lg:order-1 p-6 lg:p-8">
                  {currentFeature.component ? (
                    currentFeature.component
                  ) : (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                      <img
                        src={currentFeature.image || "/placeholder.svg"}
                        alt={currentFeature.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                      {/* Interactive Demo Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          onClick={handleDemoClick}
                          className="bg-white/90 hover:bg-white text-[#3C1E38] backdrop-blur-sm shadow-lg"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Try Interactive Demo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Feature Description */}
                <div className="order-1 lg:order-2 p-6 lg:p-8 bg-gradient-to-br from-[#FBF8F3] to-white">
                  <div className="h-full flex flex-col">
                    {/* Feature Title */}
                    <h3 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38] mb-4">
                      {currentFeature.title}
                    </h3>

                    {/* View Mode Tabs */}
                    <div className="flex gap-2 mb-6">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "benefits", label: "Benefits" },
                        { id: "stories", label: "Stories" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as any)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            viewMode === mode.id
                              ? "bg-[#A7C2D7] text-white"
                              : "bg-[#A7C2D7]/10 text-[#3C1E38] hover:bg-[#A7C2D7]/20"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    {/* Content based on view mode */}
                    <div className="flex-1">
                      {viewMode === "overview" && (
                        <>
                          <p className="font-inter text-[#3C1E38]/70 leading-relaxed mb-6">
                            {currentFeature.description}
                          </p>

                          {/* Feature Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {currentFeature.stats.map((stat, index) => (
                              <div key={index} className="text-center">
                                <div className="font-playfair text-lg font-bold text-[#A7C2D7]">{stat.value}</div>
                                <div className="font-inter text-xs text-[#3C1E38]/60 mb-1">{stat.label}</div>
                                <div className="font-inter text-xs text-green-600">{stat.trend}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {viewMode === "benefits" && (
                        <div className="space-y-3">
                          {currentFeature.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#A7C2D7] mt-2 flex-shrink-0"></div>
                              <span className="font-inter text-[#3C1E38]/80">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {viewMode === "stories" && (
                        <div className="space-y-4">
                          {currentFeature.userStories.map((story, index) => (
                            <div key={index} className="bg-white/50 rounded-lg p-4 border border-[#A7C2D7]/20">
                              <blockquote className="font-inter italic text-[#3C1E38] mb-2">"{story.quote}"</blockquote>
                              <cite className="font-inter text-sm text-[#A7C2D7] font-medium">— {story.name}</cite>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                      <Button onClick={handleDemoClick} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black">
                        <Play className="w-4 h-4 mr-2" />
                        Try Demo
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7] hover:text-white"
                      >
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </div>

                    {/* Feature Navigation Dots */}
                    <div className="mt-6 flex justify-center gap-2">
                      {showcaseFeatures.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setActiveFeature(index)
                            setAutoPlay(false)
                          }}
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
