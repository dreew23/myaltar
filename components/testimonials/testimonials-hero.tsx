"use client"

import { useState, useEffect } from "react"
import { Star, Quote, Heart, Sparkles } from "lucide-react"

const heroTestimonials = [
  {
    quote: "ALTAR didn't just organize my day—it transformed my entire relationship with God.",
    name: "Sarah Chen",
    title: "Mother of 3, Ministry Leader",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
  {
    quote: "My morning routine went from chaotic to sacred. I finally feel aligned with heaven's rhythm.",
    name: "Maria Rodriguez",
    title: "Entrepreneur & Bible Study Leader",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
  {
    quote: "The way ALTAR connects my daily tasks with divine purpose has brought such clarity to my life.",
    name: "Grace Thompson",
    title: "Teacher & Worship Leader",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
  },
]

export default function TestimonialsHero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % heroTestimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#A7C2D7]/10 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-40 h-40 bg-[#F9D57E]/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#A7C2D7]/5 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] rounded-full px-6 py-2">
                <Star className="w-5 h-5 text-white fill-current" />
                <span className="text-white font-semibold">8,000+ Sacred Stories</span>
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
            </div>

            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#3C1E38] mb-6">
              Sacred Stories of
              <span className="block bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">
                Divine Transformation
              </span>
            </h1>

            <p className="font-inter text-xl md:text-2xl text-[#3C1E38]/70 max-w-3xl mx-auto leading-relaxed">
              Real women sharing how ALTAR transformed their spiritual journey, morning routines, and daily walk with
              God
            </p>
          </div>

          {/* Rotating Testimonials */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
              {/* Quote Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="text-center">
                <div className="mb-8 min-h-[120px] flex items-center justify-center">
                  <blockquote className="font-garamond text-2xl md:text-3xl italic text-[#3C1E38] leading-relaxed">
                    "{heroTestimonials[currentTestimonial].quote}"
                  </blockquote>
                </div>

                {/* Author */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg ring-4 ring-white/50">
                    <img
                      src={heroTestimonials[currentTestimonial].image || "/placeholder.svg"}
                      alt={heroTestimonials[currentTestimonial].name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">
                      {heroTestimonials[currentTestimonial].name}
                    </h4>
                    <p className="font-inter text-[#3C1E38]/60">{heroTestimonials[currentTestimonial].title}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center space-x-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-[#F9D57E] fill-current" />
                  ))}
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center space-x-3">
                {heroTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30 hover:bg-[#A7C2D7]/50"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 hidden lg:block">
            <div className="flex items-center space-x-2 bg-white/90 rounded-full px-4 py-2 shadow-lg">
              <Heart className="w-5 h-5 text-[#A7C2D7]" />
              <span className="text-sm font-medium text-[#3C1E38]">4.9/5 Rating</span>
            </div>
          </div>

          <div className="absolute bottom-20 right-10 hidden lg:block">
            <div className="flex items-center space-x-2 bg-white/90 rounded-full px-4 py-2 shadow-lg">
              <Sparkles className="w-5 h-5 text-[#F9D57E]" />
              <span className="text-sm font-medium text-[#3C1E38]">Life-Changing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
