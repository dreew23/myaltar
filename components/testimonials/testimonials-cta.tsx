"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, Star, Heart, Sparkles, CheckCircle } from "lucide-react"

export default function TestimonialsCTA() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#A7C2D7]/10 via-white to-[#F9D57E]/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38] mb-6">
              Ready to Write Your Own
              <span className="block bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">
                Sacred Story?
              </span>
            </h2>
            <p className="font-inter text-xl md:text-2xl text-[#3C1E38]/70 leading-relaxed">
              Join 8,000+ women who have transformed their spiritual lives with ALTAR
            </p>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 bg-white/90 rounded-full px-6 py-3 shadow-lg">
              <Star className="w-5 h-5 text-[#F9D57E] fill-current" />
              <span className="font-inter font-semibold text-[#3C1E38]">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/90 rounded-full px-6 py-3 shadow-lg">
              <Heart className="w-5 h-5 text-[#A7C2D7]" />
              <span className="font-inter font-semibold text-[#3C1E38]">8,000+ Users</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/90 rounded-full px-6 py-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-[#F9D57E]" />
              <span className="font-inter font-semibold text-[#3C1E38]">Life-Changing</span>
            </div>
          </div>

          {/* CTA Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 mb-12">
            <h3 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38] mb-6">
              Start Your Sacred Transformation Today
            </h3>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-full border border-[#A7C2D7]/30 focus:border-[#A7C2D7] focus:outline-none focus:ring-2 focus:ring-[#A7C2D7]/20 font-inter"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Begin Your Journey</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-3 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="font-inter text-lg font-semibold">Welcome to the sacred community!</span>
              </div>
            )}

            <p className="font-inter text-sm text-[#3C1E38]/60 mt-4">
              Free to start • No credit card required • Join 8,000+ sacred companions
            </p>
          </div>

          {/* Final Quote */}
          <blockquote className="font-garamond text-xl md:text-2xl italic text-[#3C1E38]/80 max-w-3xl mx-auto mb-8">
            "This is not just another app. This is divine technology for sacred living."
          </blockquote>
          <cite className="font-inter text-[#3C1E38]/60">— The ALTAR Community</cite>
        </div>
      </div>
    </section>
  )
}
