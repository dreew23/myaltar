"use client"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"

const faqs = [
  {
    question: "How is ALTAR different from regular planning apps?",
    answer:
      "ALTAR integrates faith and spirituality into every aspect of planning. Unlike traditional productivity tools, we help you align your daily tasks with divine purpose, incorporate prayer and reflection time, and track spiritual growth alongside practical goals.",
  },
  {
    question: "Can I use ALTAR if I'm new to spiritual practices?",
    answer:
      "ALTAR is designed for women at every stage of their faith journey. We provide gentle guidance, suggested practices, and customizable spiritual rhythms that grow with you. Start where you are, and let divine grace guide your path.",
  },
  {
    question: "What makes the morning focus so important?",
    answer:
      "The early morning hours offer a unique opportunity for connection with the divine before the world's demands take hold. ALTAR helps you create sacred morning rituals that set the tone for your entire day, aligning your heart with heaven's rhythm.",
  },
  {
    question: "Is my spiritual journey private and secure?",
    answer:
      "Your sacred thoughts and spiritual reflections are completely private. We use enterprise-grade security to protect your data and never share your personal spiritual content. Your journey with God remains between you and Him.",
  },
  {
    question: "How does the scripture integration work?",
    answer:
      "ALTAR weaves biblical wisdom throughout your planning experience. You'll receive relevant scripture for your goals, prayer prompts based on your challenges, and devotional content that speaks to your current season of life.",
  },
  {
    question: "Can I track answered prayers?",
    answer:
      "Yes! One of ALTAR's most beloved features is prayer request tracking. Record your prayers, set reminders to pray for specific needs, and celebrate when God answers. It's a beautiful way to see His faithfulness over time.",
  },
  {
    question: "What if I miss days or fall behind?",
    answer:
      "Grace is built into every aspect of ALTAR. There's no guilt or pressure—only gentle encouragement to return to your sacred practices. We believe in progress, not perfection, and every new day is an opportunity to begin again.",
  },
  {
    question: "Is there a community aspect?",
    answer:
      "While your personal spiritual content remains private, ALTAR offers optional community features where you can share encouragement, prayer requests (anonymously if preferred), and celebrate spiritual milestones with other women on similar journeys.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                Sacred Questions
              </h2>
              <Sparkles className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
              Find answers to common questions about your spiritual journey with ALTAR
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#FBF8F3] rounded-xl border border-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/50 transition-colors duration-200"
                >
                  <h3 className="font-playfair text-lg md:text-xl font-semibold text-[#3C1E38] pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-[#A7C2D7] transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5">
                    <p className="font-inter text-[#3C1E38]/70 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12">
            <p className="font-inter text-[#3C1E38]/60 mb-4">Still have questions about your spiritual journey?</p>
            <a
              href="mailto:support@altar.app"
              className="font-inter text-[#A7C2D7] hover:text-[#A7C2D7]/80 transition-colors underline"
            >
              Reach out to our support team
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
