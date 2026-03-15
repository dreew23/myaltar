"use client"

import { useState, useEffect } from "react"
import { Star, Heart, Sparkles } from "lucide-react"

const testimonialWall = [
  {
    name: "Lisa M.",
    quote: "My prayer life has never been deeper.",
    rating: 5,
    location: "Texas",
  },
  {
    name: "Rachel K.",
    quote: "ALTAR helped me find God's rhythm for my busy life.",
    rating: 5,
    location: "California",
  },
  {
    name: "Michelle S.",
    quote: "Every morning feels like a divine appointment now.",
    rating: 5,
    location: "Florida",
  },
  {
    name: "Jennifer L.",
    quote: "My children notice how much more peaceful I am.",
    rating: 5,
    location: "New York",
  },
  {
    name: "Amanda R.",
    quote: "This app transformed my relationship with God.",
    rating: 5,
    location: "Georgia",
  },
  {
    name: "Sarah D.",
    quote: "I finally feel aligned with heaven's priorities.",
    rating: 5,
    location: "Arizona",
  },
  {
    name: "Maria G.",
    quote: "ALTAR made my morning routine sacred.",
    rating: 5,
    location: "Illinois",
  },
  {
    name: "Grace W.",
    quote: "Divine guidance for every decision I make.",
    rating: 5,
    location: "Ohio",
  },
  {
    name: "Rebecca T.",
    quote: "My faith has grown exponentially.",
    rating: 5,
    location: "Michigan",
  },
  {
    name: "Nicole P.",
    quote: "I wake up excited for my time with God.",
    rating: 5,
    location: "Virginia",
  },
  {
    name: "Jessica H.",
    quote: "ALTAR brought order to my spiritual chaos.",
    rating: 5,
    location: "Colorado",
  },
  {
    name: "Ashley M.",
    quote: "Every task now has divine purpose.",
    rating: 5,
    location: "Washington",
  },
]

export default function TestimonialWall() {
  const [visibleTestimonials, setVisibleTestimonials] = useState<boolean[]>(
    new Array(testimonialWall.length).fill(false),
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleTestimonials((prev) => {
        const newVisible = [...prev]
        const randomIndex = Math.floor(Math.random() * testimonialWall.length)
        newVisible[randomIndex] = !newVisible[randomIndex]
        return newVisible
      })
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
            Voices of the Sacred Community
          </h2>
          <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
            Quick glimpses into the hearts of women transformed by divine-guided living
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
          {testimonialWall.map((testimonial, index) => (
            <div
              key={index}
              className={`transform transition-all duration-1000 ${
                visibleTestimonials[index] ? "scale-100 opacity-100 rotate-0" : "scale-95 opacity-70 rotate-1"
              }`}
            >
              <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#F9D57E] fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-garamond text-sm italic text-[#3C1E38] mb-3 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter text-sm font-semibold text-[#3C1E38]">{testimonial.name}</p>
                    <p className="font-inter text-xs text-[#3C1E38]/60">{testimonial.location}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Stats */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          <div className="flex items-center space-x-2 bg-white/90 rounded-full px-6 py-3 shadow-lg">
            <Sparkles className="w-5 h-5 text-[#F9D57E]" />
            <span className="font-inter font-semibold text-[#3C1E38]">4.9/5 Average Rating</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/90 rounded-full px-6 py-3 shadow-lg">
            <Heart className="w-5 h-5 text-[#A7C2D7]" />
            <span className="font-inter font-semibold text-[#3C1E38]">2,400+ Reviews</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/90 rounded-full px-6 py-3 shadow-lg">
            <Star className="w-5 h-5 text-[#F9D57E]" />
            <span className="font-inter font-semibold text-[#3C1E38]">97% Recommend</span>
          </div>
        </div>
      </div>
    </section>
  )
}
