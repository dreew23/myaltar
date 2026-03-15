"use client"

import { useState } from "react"
import { Check, X, Sparkles, Crown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const comparisonData = [
  {
    category: "Spiritual Integration",
    features: [
      {
        feature: "Prayer-guided planning",
        altar: true,
        competitors: false,
        description: "Begin each planning session with divine guidance",
        impact: "Reduces decision anxiety by 67%",
      },
      {
        feature: "Scripture integration",
        altar: true,
        competitors: false,
        description: "Biblical wisdom woven throughout your planning",
        impact: "Increases spiritual awareness daily",
      },
      {
        feature: "Spiritual growth tracking",
        altar: true,
        competitors: false,
        description: "Monitor your faith journey over time",
        impact: "Builds spiritual momentum",
      },
    ],
  },
  {
    category: "Community & Support",
    features: [
      {
        feature: "Prayer circles",
        altar: true,
        competitors: false,
        description: "Join small groups for mutual prayer support",
        impact: "Creates lasting spiritual friendships",
      },
      {
        feature: "Spiritual mentorship",
        altar: true,
        competitors: false,
        description: "Connect with experienced women of faith",
        impact: "Accelerates spiritual growth",
      },
      {
        feature: "Faith-based accountability",
        altar: true,
        competitors: false,
        description: "Gentle accountability rooted in grace",
        impact: "Builds consistency without guilt",
      },
    ],
  },
  {
    category: "Planning Features",
    features: [
      {
        feature: "Basic task management",
        altar: true,
        competitors: true,
        description: "Standard to-do list functionality",
        impact: "Organizes daily tasks",
      },
      {
        feature: "Calendar integration",
        altar: true,
        competitors: true,
        description: "Sync with your existing calendars",
        impact: "Centralizes scheduling",
      },
      {
        feature: "Sacred time blocking",
        altar: true,
        competitors: false,
        description: "Protect time for prayer and devotion",
        impact: "Ensures spiritual priorities",
      },
    ],
  },
]

export default function MobileComparisonTable() {
  const [currentCategory, setCurrentCategory] = useState(0)
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")

  const nextCategory = () => {
    setCurrentCategory((prev) => (prev + 1) % comparisonData.length)
  }

  const prevCategory = () => {
    setCurrentCategory((prev) => (prev - 1 + comparisonData.length) % comparisonData.length)
  }

  return (
    <section id="features-comparison" className="py-16 md:py-24 bg-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                The ALTAR Difference
              </h2>
              <Crown className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              See how ALTAR's faith-first approach sets it apart from traditional planning tools
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg border border-[#A7C2D7]/20">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-6 py-2 rounded-full font-inter text-sm font-medium transition-colors ${
                  viewMode === "cards" ? "bg-[#A7C2D7] text-white" : "text-[#3C1E38] hover:bg-[#A7C2D7]/10"
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-6 py-2 rounded-full font-inter text-sm font-medium transition-colors ${
                  viewMode === "table" ? "bg-[#A7C2D7] text-white" : "text-[#3C1E38] hover:bg-[#A7C2D7]/10"
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          {viewMode === "cards" && (
            <div className="lg:hidden">
              {/* Category Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="icon" onClick={prevCategory}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <h3 className="font-playfair text-xl font-semibold text-[#3C1E38]">
                    {comparisonData[currentCategory].category}
                  </h3>
                  <p className="text-sm text-[#3C1E38]/60">
                    {currentCategory + 1} of {comparisonData.length}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={nextCategory}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                {comparisonData[currentCategory].features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-[#A7C2D7]/20">
                    <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-2">{feature.feature}</h4>
                    <p className="font-inter text-sm text-[#3C1E38]/70 mb-4">{feature.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-[#FBF8F3] rounded-lg">
                        <div className="flex justify-center mb-2">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h5 className="font-inter font-semibold text-[#3C1E38] mb-1">ALTAR</h5>
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                          </div>
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-center mb-2">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-2xl">📱</span>
                          </div>
                        </div>
                        <h5 className="font-inter font-semibold text-[#3C1E38] mb-1">Other Apps</h5>
                        <div className="flex justify-center">
                          {feature.competitors ? (
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                              <X className="w-5 h-5 text-red-400" strokeWidth={2} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-3">
                      <p className="font-inter text-sm text-[#3C1E38] font-medium">💫 Impact: {feature.impact}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Dots */}
              <div className="flex justify-center mt-6 gap-2">
                {comparisonData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCategory(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentCategory ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          {viewMode === "table" && (
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#A7C2D7]/20">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 p-6 border-b border-[#A7C2D7]/20">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3 className="font-playfair text-xl font-semibold text-[#3C1E38]">Features</h3>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mb-3 shadow-lg">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-playfair text-xl font-semibold text-[#3C1E38]">ALTAR</h3>
                        <p className="font-inter text-sm text-[#3C1E38]/60">Sacred Planning</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="font-playfair text-xl font-semibold text-[#3C1E38]">Other Apps</h3>
                        <p className="font-inter text-sm text-[#3C1E38]/60">Traditional Planning</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Content */}
                <div className="p-6">
                  {comparisonData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-8 last:mb-0">
                      <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4 pb-2 border-b border-gray-200">
                        {category.category}
                      </h4>
                      <div className="space-y-3">
                        {category.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="grid grid-cols-3 gap-6 items-center py-3 hover:bg-[#FBF8F3]/50 rounded-lg px-3"
                          >
                            <div>
                              <h5 className="font-inter font-medium text-[#3C1E38] mb-1">{feature.feature}</h5>
                              <p className="font-inter text-sm text-[#3C1E38]/60 mb-2">{feature.description}</p>
                              <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded px-2 py-1">
                                <p className="font-inter text-xs text-[#3C1E38] font-medium">💫 {feature.impact}</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex justify-center">
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="flex justify-center">
                                {feature.competitors ? (
                                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                    <X className="w-5 h-5 text-red-400" strokeWidth={2} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] rounded-full shadow-lg">
              <Sparkles className="w-5 h-5 text-white mr-2" />
              <span className="font-inter font-semibold text-white">Experience the Sacred Difference</span>
              <Sparkles className="w-5 h-5 text-white ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
