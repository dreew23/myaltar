import type { Metadata } from "next"
import { BookOpen, Heart, Target, Calendar, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How ALTAR Works - Sacred Planning Made Simple",
  description:
    "Discover how ALTAR transforms your daily routine into a sacred practice through divine-guided planning, prayer integration, and spiritual growth tracking.",
}

const steps = [
  {
    icon: BookOpen,
    title: "Begin with Sacred Intention",
    description:
      "Start each day with personalized devotionals and scripture readings that align with your spiritual season.",
    details: [
      "Curated daily devotionals based on your faith journey",
      "Scripture verses that speak to your current challenges",
      "Guided prayer prompts for morning connection",
      "Reflection questions to deepen understanding",
    ],
  },
  {
    icon: Heart,
    title: "Receive Divine Guidance",
    description: "Allow the Holy Spirit to guide your planning as you set intentions rooted in biblical wisdom.",
    details: [
      "Prayer-guided goal setting process",
      "Scripture-based decision making tools",
      "Divine timing calendar integration",
      "Spiritual discernment exercises",
    ],
  },
  {
    icon: Target,
    title: "Align Tasks with Purpose",
    description: "Transform ordinary to-dos into sacred assignments by connecting them to your spiritual calling.",
    details: [
      "Purpose-driven task categorization",
      "Biblical principle integration",
      "Kingdom priority framework",
      "Stewardship accountability tracking",
    ],
  },
  {
    icon: Calendar,
    title: "Live Your Sacred Rhythm",
    description: "Create sustainable spiritual practices that honor both divine timing and earthly responsibilities.",
    details: [
      "Sabbath rest planning and protection",
      "Prayer time blocking and reminders",
      "Seasonal spiritual focus areas",
      "Grace-filled progress tracking",
    ],
  },
]

const features = [
  {
    title: "Morning Sacred Hour",
    description:
      "Transform your early morning into a sanctuary of connection with guided prayers, scripture, and intention setting.",
  },
  {
    title: "Divine Task Management",
    description: "Organize your responsibilities through the lens of stewardship, calling, and kingdom priorities.",
  },
  {
    title: "Prayer Request Tracking",
    description: "Record, pray for, and celebrate answered prayers while building a testimony of God's faithfulness.",
  },
  {
    title: "Spiritual Growth Metrics",
    description: "Track your faith journey with gentle accountability that celebrates progress over perfection.",
  },
  {
    title: "Scripture Integration",
    description: "Weave biblical wisdom throughout your planning with relevant verses and spiritual insights.",
  },
  {
    title: "Community Connection",
    description: "Join other women on similar journeys for encouragement, prayer support, and shared wisdom.",
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] to-[#FDFCF9]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-[#A7C2D7] mr-3" />
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#3C1E38]">
                How ALTAR Works
              </h1>
              <Sparkles className="w-8 h-8 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-xl md:text-2xl text-[#3C1E38]/70 leading-relaxed max-w-3xl mx-auto">
              Discover how divine technology transforms your daily routine into a sacred practice of connection,
              purpose, and spiritual growth.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-4">
                Your Sacred Journey in Four Steps
              </h2>
              <p className="font-inter text-lg text-[#3C1E38]/70 max-w-2xl mx-auto">
                Each step is designed to deepen your connection with the divine while organizing your earthly
                responsibilities
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  <div className={`lg:w-1/2 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#A7C2D7]/20">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center mr-4">
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="font-inter text-sm text-[#A7C2D7] font-medium mb-1">Step {index + 1}</div>
                          <h3 className="font-playfair text-2xl font-bold text-[#3C1E38]">{step.title}</h3>
                        </div>
                      </div>
                      <p className="font-inter text-[#3C1E38]/70 mb-6 leading-relaxed">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start">
                            <ArrowRight className="w-4 h-4 text-[#A7C2D7] mt-1 mr-3 flex-shrink-0" />
                            <span className="font-inter text-sm text-[#3C1E38]/70">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={`lg:w-1/2 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="aspect-square bg-gradient-to-br from-[#A7C2D7]/20 to-[#F9D57E]/20 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-24 h-24 text-[#A7C2D7]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-[#FBF8F3]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-4">
                Sacred Features for Divine Living
              </h2>
              <p className="font-inter text-lg text-[#3C1E38]/70 max-w-2xl mx-auto">
                Every feature is thoughtfully designed to support your spiritual growth and practical needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg border border-[#A7C2D7]/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-3">{feature.title}</h3>
                  <p className="font-inter text-[#3C1E38]/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-6">
              Ready to Begin Your Sacred Journey?
            </h2>
            <p className="font-inter text-lg text-[#3C1E38]/70 mb-8 max-w-2xl mx-auto">
              Join thousands of women who have discovered the transformative power of divine-guided planning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_20px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/#email-signup">Reserve Your Sacred Seat</Link>
              </Button>
              <Button variant="outline" asChild className="font-inter text-lg px-8 py-4 rounded-full">
                <Link href="/">Explore More Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
