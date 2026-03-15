"use client"

import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Michelle",
    title: "Ministry Leader & Mother",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "ALTAR has completely transformed how I approach my daily planning. The integration of prayer and scripture makes every task feel like a sacred assignment. I finally feel aligned with God's purpose for my day.",
    highlight: "Sacred Assignment",
  },
  {
    name: "Maria Rodriguez",
    title: "Entrepreneur & Mentor",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "The prayer request tracking feature has revolutionized my prayer life. Seeing God's faithfulness documented over time has strengthened my faith immeasurably. This isn't just an app—it's a testimony builder.",
    highlight: "Testimony Builder",
  },
  {
    name: "Grace Thompson",
    title: "Teacher & Small Group Leader",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "Leading a prayer circle through ALTAR has brought our group closer together. The shared prayer requests and celebration of answered prayers has created such beautiful community. It's like having a digital prayer closet.",
    highlight: "Digital Prayer Closet",
  },
]

export default function ProductTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
              Sacred Stories
            </h2>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              Hear from women whose lives have been transformed by integrating ALTAR into their spiritual practice
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-[#A7C2D7]/20 hover:shadow-xl transition-all duration-300 relative"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 pt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#F9D57E] fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-inter text-[#3C1E38]/80 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Highlight */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-[#A7C2D7]/10 text-[#A7C2D7] text-sm font-medium rounded-full">
                    {testimonial.highlight}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div>
                    <h4 className="font-playfair font-semibold text-[#3C1E38]">{testimonial.name}</h4>
                    <p className="font-inter text-sm text-[#3C1E38]/60">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "8,000+", label: "Sacred Companions" },
              { number: "4.9/5", label: "Average Rating" },
              { number: "95%", label: "Daily Active Users" },
              { number: "12,000+", label: "Answered Prayers Tracked" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="font-playfair text-3xl font-bold text-[#3C1E38] mb-2">{stat.number}</div>
                <div className="font-inter text-[#3C1E38]/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
