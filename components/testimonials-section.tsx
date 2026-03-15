"use client"

import { useEffect, useRef, useState } from "react"
import { Quote } from "lucide-react"

const mainTestimonial = {
  quote:
    "ALTAR has transformed my morning routine into a sacred ritual. The way it connects my daily tasks with divine purpose has brought such clarity and peace to my life. I finally feel aligned with heaven's rhythm.",
  name: "Sarah Michelle",
  title: "Mother & Ministry Leader",
  image: "/placeholder.svg?height=120&width=120",
}

const affirmations = [
  {
    quote: "Every dawn becomes an opportunity to touch heaven through ALTAR's gentle guidance.",
    name: "Rebecca Chen",
    title: "Entrepreneur",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "My faith journey has deepened immeasurably since discovering this sacred companion.",
    name: "Maria Rodriguez",
    title: "Teacher",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "ALTAR bridges the gap between spiritual insight and meaningful daily action beautifully.",
    name: "Grace Thompson",
    title: "Counselor",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleAffirmations, setVisibleAffirmations] = useState<boolean[]>([false, false, false])
  const mainRef = useRef<HTMLDivElement>(null)
  const affirmationRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -100px 0px",
    }

    // Observer for main testimonial
    const mainObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      })
    }, observerOptions)

    // Observer for affirmations
    const affirmationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = affirmationRefs.current.indexOf(entry.target as HTMLDivElement)
          if (index !== -1) {
            setVisibleAffirmations((prev) => {
              const newState = [...prev]
              newState[index] = true
              return newState
            })
          }
        }
      })
    }, observerOptions)

    if (mainRef.current) {
      mainObserver.observe(mainRef.current)
    }

    affirmationRefs.current.forEach((ref) => {
      if (ref) {
        affirmationObserver.observe(ref)
      }
    })

    return () => {
      mainObserver.disconnect()
      affirmationObserver.disconnect()
    }
  }, [])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-white to-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Sacred Stories
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Hear from women who have discovered the transformative power of divine-guided planning
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="flex justify-center mb-16 md:mb-20">
          <div
            ref={mainRef}
            className={`relative max-w-4xl mx-auto transform transition-all duration-1000 ease-out ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {/* Ambient Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/20 via-[#F9D57E]/10 to-[#A7C2D7]/20 rounded-3xl blur-xl transform scale-110"></div>

            {/* Main Card */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Portrait */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-xl ring-4 ring-white/50">
                    <img
                      src={mainTestimonial.image || "/placeholder.svg"}
                      alt={mainTestimonial.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-center mb-8">
                <p className="font-garamond text-xl md:text-2xl lg:text-3xl italic text-[#3C1E38] leading-relaxed">
                  "{mainTestimonial.quote}"
                </p>
              </blockquote>

              {/* Attribution */}
              <div className="text-center">
                <h4 className="font-playfair text-lg md:text-xl font-semibold text-[#3C1E38] mb-1">
                  {mainTestimonial.name}
                </h4>
                <p className="font-inter text-[#3C1E38]/60">{mainTestimonial.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Affirmation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {affirmations.map((affirmation, index) => (
            <div
              key={index}
              ref={(el) => {
                affirmationRefs.current[index] = el
              }}
              className={`transform transition-all duration-700 ease-out ${
                visibleAffirmations[index] ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative group">
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Card */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* Portrait */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg ring-2 ring-white/50">
                      <img
                        src={affirmation.image || "/placeholder.svg"}
                        alt={affirmation.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-center mb-4">
                    <p className="font-garamond text-base md:text-lg italic text-[#3C1E38] leading-relaxed">
                      "{affirmation.quote}"
                    </p>
                  </blockquote>

                  {/* Attribution */}
                  <div className="text-center">
                    <h5 className="font-playfair text-sm font-semibold text-[#3C1E38] mb-1">{affirmation.name}</h5>
                    <p className="font-inter text-xs text-[#3C1E38]/60">{affirmation.title}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#A7C2D7]/40 animate-pulse"></div>
            <div
              className="w-2 h-2 rounded-full bg-[#F9D57E]/40 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-2 h-2 rounded-full bg-[#A7C2D7]/40 animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}
