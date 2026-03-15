"use client"

import { useState, useEffect } from "react"
import { Star, Play, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah Michelle",
    title: "Ministry Leader & Mother of 3",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "ALTAR transformed my chaotic mornings into sacred encounters with God. I finally feel aligned with His purpose for my day.",
    result: "Reduced morning stress by 80%",
    videoId: "sarah-testimony",
  },
  {
    name: "Maria Rodriguez",
    title: "Entrepreneur & Small Group Leader",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "The prayer tracking feature revolutionized my prayer life. Seeing God's faithfulness documented has strengthened my faith immeasurably.",
    result: "Tracked 50+ answered prayers",
    videoId: "maria-testimony",
  },
  {
    name: "Grace Thompson",
    title: "Teacher & Mentor",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    quote:
      "Leading prayer circles through ALTAR brought our group closer. It's like having a digital prayer closet for our community.",
    result: "Leads 3 prayer circles with 45 women",
    videoId: "grace-testimony",
  },
]

const stats = [
  { number: "8,247", label: "Sacred Companions", sublabel: "and growing daily" },
  { number: "12,000+", label: "Answered Prayers", sublabel: "tracked and celebrated" },
  { number: "95%", label: "Daily Active Users", sublabel: "use ALTAR every morning" },
  { number: "4.9/5", label: "Average Rating", sublabel: "from 1,200+ reviews" },
]

export default function ProductSocialProof() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-4">
              Real Stories, Real Transformation
            </h2>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              Hear from women whose spiritual lives have been transformed by ALTAR's divine-guided planning
            </p>
          </div>

          {/* Featured Testimonial */}
          <div className="mb-16">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#A7C2D7]/20 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/5 to-[#F9D57E]/5"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Testimonial Content */}
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#F9D57E] fill-current" />
                    ))}
                  </div>

                  <blockquote className="font-playfair text-xl md:text-2xl italic text-[#3C1E38] leading-relaxed mb-6">
                    "{testimonials[activeTestimonial].quote}"
                  </blockquote>

                  <div className="flex items-center gap-4 mb-6">
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

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                    <div className="font-inter text-sm font-medium text-[#3C1E38] mb-1">Result:</div>
                    <div className="font-inter text-sm text-green-700">{testimonials[activeTestimonial].result}</div>
                  </div>
                </div>

                {/* Video Testimonial */}
                <div className="relative">
                  {playingVideo === testimonials[activeTestimonial].videoId ? (
                    <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                      <div className="text-white text-center">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Video Testimonial</p>
                        <p className="text-sm opacity-70">Coming Soon</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="aspect-video bg-gradient-to-br from-[#A7C2D7]/20 to-[#F9D57E]/20 rounded-xl flex items-center justify-center cursor-pointer group hover:from-[#A7C2D7]/30 hover:to-[#F9D57E]/30 transition-all duration-300"
                      onClick={() => setPlayingVideo(testimonials[activeTestimonial].videoId)}
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Play className="w-8 h-8 text-[#A7C2D7] ml-1" />
                        </div>
                        <p className="font-inter font-medium text-[#3C1E38]">
                          Watch {testimonials[activeTestimonial].name}'s Story
                        </p>
                        <p className="font-inter text-sm text-[#3C1E38]/60">2 min video</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-6 gap-2">
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-playfair text-3xl md:text-4xl font-bold text-[#3C1E38] mb-2">{stat.number}</div>
                <div className="font-inter font-medium text-[#3C1E38] mb-1">{stat.label}</div>
                <div className="font-inter text-sm text-[#3C1E38]/60">{stat.sublabel}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-2xl p-8">
              <h3 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-4">Join These Sacred Companions</h3>
              <p className="font-inter text-[#3C1E38]/70 mb-6 max-w-2xl mx-auto">
                Start your own transformation story today. Join thousands of women who've discovered the life-changing
                power of divine-guided planning.
              </p>
              <Button className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter text-lg px-8 py-4 rounded-full">
                Start Your Sacred Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
