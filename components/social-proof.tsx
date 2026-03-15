"use client"

import { useEffect, useState } from "react"
import { Star, Users, Heart } from "lucide-react"

export default function SocialProof() {
  const [userCount, setUserCount] = useState(8247)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate counter
    setIsVisible(true)

    // Simulate growing user base
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* User Count */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#A7C2D7]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#A7C2D7]" />
            </div>
            <div>
              <div className="font-playfair text-2xl font-bold text-[#3C1E38]">
                {isVisible ? userCount.toLocaleString() : "0"}+
              </div>
              <div className="font-inter text-sm text-[#3C1E38]/60">Sacred Companions</div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F9D57E]/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-[#F9D57E] fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#F9D57E] fill-current" />
                ))}
                <span className="font-playfair text-lg font-bold text-[#3C1E38] ml-2">4.9</span>
              </div>
              <div className="font-inter text-sm text-[#3C1E38]/60">Average Rating</div>
            </div>
          </div>

          {/* Testimonial Count */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A7C2D7]/20 to-[#F9D57E]/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#A7C2D7]" />
            </div>
            <div>
              <div className="font-playfair text-2xl font-bold text-[#3C1E38]">1,200+</div>
              <div className="font-inter text-sm text-[#3C1E38]/60">Life Transformations</div>
            </div>
          </div>
        </div>

        {/* Live Activity */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-inter text-sm text-[#3C1E38]/70">
              3 women joined their sacred journey in the last hour
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
