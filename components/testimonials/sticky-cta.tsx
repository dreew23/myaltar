"use client"

import { useState, useEffect } from "react"
import { Sparkles, X } from "lucide-react"

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight

      // Show CTA after scrolling 50% of viewport height
      if (scrollPosition > windowHeight * 0.5 && !isDismissed) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isDismissed])

  if (isDismissed) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
      }`}
    >
      <div className="bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] rounded-2xl shadow-2xl p-4 max-w-sm">
        {/* Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <X className="w-4 h-4 text-[#3C1E38]" />
        </button>

        <div className="text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-inter font-semibold">Inspired by these stories?</span>
          </div>
          <p className="font-inter text-sm text-white/90 mb-4">Join 8,000+ women experiencing divine transformation</p>
          <button className="w-full bg-white text-[#3C1E38] font-semibold py-3 px-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Start Your Sacred Journey
          </button>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
        <div
          className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/40 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  )
}
