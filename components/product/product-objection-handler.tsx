"use client"

import { useState } from "react"
import { ChevronDown, Shield, Clock, Heart, DollarSign, Users, CheckCircle } from "lucide-react"

const objections = [
  {
    icon: Clock,
    objection: "I don't have time to learn another app",
    response:
      "ALTAR is designed for busy women of faith. Our 5-minute onboarding gets you started immediately, and most features are intuitive from day one. Plus, the time you save through divine-guided planning more than pays for the learning curve.",
    proof: "Average setup time: 5 minutes • 95% of users are productive on day 1",
  },
  {
    icon: DollarSign,
    objection: "Is it worth the investment?",
    response:
      "Consider the cost of spiritual stagnation and scattered priorities. ALTAR users report saving 2+ hours weekly through better planning, plus the priceless benefit of deeper spiritual connection. At less than $10/month, it's cheaper than a coffee subscription.",
    proof: "ROI: 2+ hours saved weekly • 30-day money-back guarantee",
  },
  {
    icon: Shield,
    objection: "Is my spiritual journey private and secure?",
    response:
      "Your sacred thoughts and prayers are completely private. We use bank-level encryption and never share your personal spiritual content. Your journey with God remains between you and Him—we're just the secure vessel.",
    proof: "256-bit encryption • GDPR compliant • Zero data sharing",
  },
  {
    icon: Heart,
    objection: "What if I'm new to spiritual practices?",
    response:
      "ALTAR meets you exactly where you are. Our gentle guidance system adapts to your spiritual maturity level, offering simple practices for beginners and deeper disciplines for seasoned believers. Grace, not guilt, guides every interaction.",
    proof: "Adaptive guidance • Beginner-friendly • 24/7 support",
  },
  {
    icon: Users,
    objection: "Will this work with my denomination/beliefs?",
    response:
      "ALTAR is built on universal Christian principles that transcend denominational boundaries. Our scripture selections and practices are carefully chosen to honor diverse traditions while maintaining biblical truth. You can customize everything to match your specific beliefs.",
    proof: "Multi-denominational • Customizable content • 15+ traditions represented",
  },
]

export default function ProductObjectionHandler() {
  const [openObjection, setOpenObjection] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-4">
              Common Questions Answered
            </h2>
            <p className="font-inter text-lg text-[#3C1E38]/70 max-w-2xl mx-auto">
              We understand you might have concerns. Here are honest answers to the questions we hear most often.
            </p>
          </div>

          {/* Objections */}
          <div className="space-y-4">
            {objections.map((item, index) => (
              <div
                key={index}
                className="bg-[#FBF8F3] rounded-xl border border-[#A7C2D7]/20 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => setOpenObjection(openObjection === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <item.icon className="w-5 h-5 text-[#A7C2D7]" />
                    </div>
                    <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">"{item.objection}"</h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#A7C2D7] transition-transform duration-300 ${
                      openObjection === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openObjection === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-[#A7C2D7]/10">
                      <p className="font-inter text-[#3C1E38]/80 leading-relaxed mb-4">{item.response}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-inter text-[#3C1E38]/60">{item.proof}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <p className="font-inter text-[#3C1E38]/60 mb-4">Still have questions?</p>
            <a
              href="mailto:support@altar.app"
              className="font-inter text-[#A7C2D7] hover:text-[#A7C2D7]/80 transition-colors underline"
            >
              Speak with our Sacred Success team
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
