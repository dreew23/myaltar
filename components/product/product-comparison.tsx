"use client"

import { Check, X, Sparkles, Crown } from "lucide-react"

const comparisonData = [
  {
    category: "Spiritual Integration",
    features: [
      {
        feature: "Prayer-guided planning",
        altar: true,
        competitors: false,
        description: "Begin each planning session with divine guidance",
      },
      {
        feature: "Scripture integration",
        altar: true,
        competitors: false,
        description: "Biblical wisdom woven throughout your planning",
      },
      {
        feature: "Spiritual growth tracking",
        altar: true,
        competitors: false,
        description: "Monitor your faith journey over time",
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
      },
      {
        feature: "Spiritual mentorship",
        altar: true,
        competitors: false,
        description: "Connect with experienced women of faith",
      },
      {
        feature: "Faith-based accountability",
        altar: true,
        competitors: false,
        description: "Gentle accountability rooted in grace",
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
      },
      {
        feature: "Calendar integration",
        altar: true,
        competitors: true,
        description: "Sync with your existing calendars",
      },
      {
        feature: "Sacred time blocking",
        altar: true,
        competitors: false,
        description: "Protect time for prayer and devotion",
      },
    ],
  },
]

export default function ProductComparison() {
  return (
    <section className="py-16 md:py-24 bg-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                Why Choose ALTAR?
              </h2>
              <Crown className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              See how ALTAR's faith-first approach sets it apart from traditional planning tools
            </p>
          </div>

          {/* Comparison Table */}
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
                          <p className="font-inter text-sm text-[#3C1E38]/60">{feature.description}</p>
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
