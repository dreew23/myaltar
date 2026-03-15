"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Star, Heart, Sparkles, Clock, BookOpen } from "lucide-react"

const stats = [
  {
    icon: Users,
    number: "8,247",
    label: "Sacred Companions",
    description: "Women transformed by ALTAR",
    color: "from-[#A7C2D7] to-[#8BB5D1]",
  },
  {
    icon: Star,
    number: "4.9",
    label: "Average Rating",
    description: "Based on 2,400+ reviews",
    color: "from-[#F9D57E] to-[#F7C94B]",
  },
  {
    icon: Heart,
    number: "97%",
    label: "Report Deeper Faith",
    description: "Within first 30 days",
    color: "from-[#E8A5C4] to-[#D48BB8]",
  },
  {
    icon: Clock,
    number: "23min",
    label: "Daily Sacred Time",
    description: "Average morning routine",
    color: "from-[#A7C2D7] to-[#F9D57E]",
  },
  {
    icon: BookOpen,
    number: "156%",
    label: "More Scripture Reading",
    description: "Compared to before ALTAR",
    color: "from-[#B8D4A8] to-[#9BC49A]",
  },
  {
    icon: Sparkles,
    number: "89%",
    label: "Feel More Connected",
    description: "To God's daily guidance",
    color: "from-[#F9D57E] to-[#A7C2D7]",
  },
]

export default function TestimonialStats() {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedNumbers, setAnimatedNumbers] = useState<{ [key: string]: string }>({})
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            animateNumbers()
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

  const animateNumbers = () => {
    stats.forEach((stat, index) => {
      setTimeout(() => {
        const target = stat.number
        const isPercentage = target.includes("%")
        const isDecimal = target.includes(".")
        const isTime = target.includes("min")

        let numericTarget: number
        let suffix = ""

        if (isPercentage) {
          numericTarget = Number.parseInt(target.replace("%", ""))
          suffix = "%"
        } else if (isDecimal) {
          numericTarget = Number.parseFloat(target) * 10
          suffix = ""
        } else if (isTime) {
          numericTarget = Number.parseInt(target.replace("min", ""))
          suffix = "min"
        } else {
          numericTarget = Number.parseInt(target.replace(",", ""))
          suffix = ""
        }

        let current = 0
        const increment = numericTarget / 30
        const timer = setInterval(() => {
          current += increment
          if (current >= numericTarget) {
            current = numericTarget
            clearInterval(timer)
          }

          let displayValue: string
          if (isDecimal) {
            displayValue = (current / 10).toFixed(1)
          } else if (target.includes(",")) {
            displayValue = Math.floor(current).toLocaleString()
          } else {
            displayValue = Math.floor(current).toString()
          }

          setAnimatedNumbers((prev) => ({
            ...prev,
            [index]: displayValue + suffix,
          }))
        }, 50)
      }, index * 200)
    })
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Sacred Impact by the Numbers
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Real data from real women experiencing divine transformation through ALTAR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`relative group transform transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                ></div>

                {/* Card */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Number */}
                  <div className="mb-4">
                    <div className="font-playfair text-4xl md:text-5xl font-bold text-[#3C1E38] mb-2">
                      {animatedNumbers[index] || "0"}
                    </div>
                    <h3 className="font-inter text-lg font-semibold text-[#3C1E38] mb-2">{stat.label}</h3>
                    <p className="font-inter text-sm text-[#3C1E38]/60">{stat.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Quote */}
        <div className="text-center mt-16">
          <blockquote className="font-garamond text-xl md:text-2xl italic text-[#3C1E38]/80 max-w-3xl mx-auto">
            "These aren't just numbers—they're sacred stories of women discovering God's rhythm for their lives."
          </blockquote>
          <cite className="font-inter text-[#3C1E38]/60 mt-4 block">— ALTAR Community Research, 2024</cite>
        </div>
      </div>
    </section>
  )
}
