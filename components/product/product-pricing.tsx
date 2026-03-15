"use client"

import { Check, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackButtonClick, trackEvent } from "@/lib/safe-analytics"

const plans = [
  {
    name: "Sacred Starter",
    price: "Free",
    period: "Forever",
    description: "Perfect for beginning your spiritual planning journey",
    features: [
      "Daily scripture readings",
      "Basic prayer tracking",
      "Simple task management",
      "Morning devotional prompts",
      "Community access",
    ],
    limitations: ["Limited to 3 prayer requests", "Basic scripture library", "Standard support"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Sacred Companion",
    price: "$9",
    period: "per month",
    description: "For women ready to deepen their spiritual practice",
    features: [
      "Everything in Sacred Starter",
      "Unlimited prayer requests",
      "Advanced scripture study tools",
      "Spiritual growth analytics",
      "Custom prayer circles",
      "Mentor matching",
      "Offline access",
      "Priority support",
    ],
    limitations: [],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Sacred Leadership",
    price: "$19",
    period: "per month",
    description: "For spiritual leaders and mentors guiding others",
    features: [
      "Everything in Sacred Companion",
      "Lead prayer circles (up to 50 members)",
      "Advanced mentorship tools",
      "Group study materials",
      "Leadership development resources",
      "Custom branding for groups",
      "Advanced analytics dashboard",
      "White-glove onboarding",
    ],
    limitations: [],
    cta: "Start Leadership Trial",
    popular: false,
  },
]

export default function ProductPricing() {
  const handlePlanSelect = (planName: string, price: string) => {
    trackButtonClick(`Select ${planName}`, "product_pricing")
    trackEvent("pricing_plan_selected", "product", planName.toLowerCase().replace(" ", "_"))
    // Handle plan selection logic
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                Sacred Pricing
              </h2>
              <Sparkles className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              Choose the plan that best supports your spiritual journey. All plans include our core commitment to your
              sacred privacy and growth.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "border-[#A7C2D7] shadow-lg scale-105" : "border-gray-200 hover:border-[#A7C2D7]/50"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white px-4 py-2 rounded-full flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="font-inter text-sm font-medium">Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-2">{plan.name}</h3>
                    <p className="font-inter text-[#3C1E38]/70 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="font-playfair text-4xl font-bold text-[#3C1E38]">{plan.price}</span>
                      {plan.period !== "Forever" && (
                        <span className="font-inter text-[#3C1E38]/60">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
                        <span className="font-inter text-[#3C1E38]/80">{feature}</span>
                      </div>
                    ))}

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start gap-3 mb-2">
                            <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                              <div className="w-1 h-1 bg-[#3C1E38]/40 rounded-full"></div>
                            </div>
                            <span className="font-inter text-[#3C1E38]/60 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePlanSelect(plan.name, plan.price)}
                    className={`w-full font-inter text-lg py-3 rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? "bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_20px_rgba(249,213,126,0.6)] text-black"
                        : "bg-white border-2 border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7] hover:text-black"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-[#FBF8F3] rounded-2xl p-8">
              <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-4">Sacred Guarantee</h3>
              <p className="font-inter text-[#3C1E38]/70 max-w-2xl mx-auto">
                We believe in the transformative power of ALTAR. If you're not completely satisfied within your first 30
                days, we'll refund your investment with grace and gratitude for trying our sacred companion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
