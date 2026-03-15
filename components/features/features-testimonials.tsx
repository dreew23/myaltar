"use client"

import { useState, useEffect } from "react"
import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Michelle",
    title: "Ministry Leader & Mother of 3",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "The prayer tracking feature has completely transformed my prayer life. Being able to see God's faithfulness documented over time has strengthened my faith immeasurably.",
    feature: "Prayer Tracking",
  },
  {
    name: "Maria Rodriguez",
    title: "Entrepreneur & Small Group Leader",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "The Kingdom Priority Framework changed how I approach my daily tasks. Now everything I do feels aligned with my spiritual calling and values. It's brought such peace to my planning.",
    feature: "Sacred Planning",
  },
  {
    name: "Grace Thompson",
    title: "Teacher & Mentor",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "The scripture integration is so seamless and meaningful. Having God's word woven throughout my planning has been like having a constant spiritual companion guiding my decisions.",
    feature: "Scripture Integration",
  },
  {
    name: "Rebecca Chen",
    title: "Worship Leader & Artist",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "The spiritual growth tracking has given me such clarity about my faith journey. Seeing my progress in different disciplines has motivated me to be more intentional in my walk with God.",
    feature: "Spiritual Growth",
  },
]

export default function FeaturesTestimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-4">What Women Are Saying</h2>
            <p className="font-inter text-lg text-[#3C1E38]/70">
              Hear how specific features have transformed the spiritual lives of our sacred companions
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <div className="bg-[#FBF8F3] rounded-3xl p-8 md:p-12 shadow-lg border border-[#A7C2D7]/20">
              {/* Quote Icon */}
              <div className="absolute -top-5 left-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Feature Badge */}
              <div className="absolute -top-3 right-10">
                <div className="bg-white px-4 py-2 rounded-full shadow-md border border-[#A7C2D7]/20">
                  <span className="font-inter text-sm font-medium text-[#A7C2D7]">
                    {testimonials[activeTestimonial].feature}
                  </span>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="pt-6">
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#F9D57E] fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-playfair text-xl md:text-2xl italic text-[#3C1E38] text-center leading-relaxed mb-8">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img
                      src={testimonials[activeTestimonial].image || "/placeholder.svg"}
                      alt={testimonials[activeTestimonial].name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div>
                    <h4 className="font-playfair font-semibold text-[#3C1E38] text-lg">
                      {testimonials[activeTestimonial].name}
                    </h4>
                    <p className="font-inter text-[#3C1E38]/60">{testimonials[activeTestimonial].title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
