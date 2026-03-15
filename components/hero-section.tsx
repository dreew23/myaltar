"use client"

import { ChevronDown, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackButtonClick, trackEvent } from "@/lib/safe-analytics"

export default function HeroSection() {
  const handleStartFreeClick = () => {
    trackButtonClick("Start Free", "hero_section")
    trackEvent("cta_click", "hero", "start_free_primary")
  }

  const handleWatchVideoClick = () => {
    trackButtonClick("Watch How It Works", "hero_section")
    trackEvent("video_intent", "hero", "how_it_works")
  }

  const handleScrollClick = () => {
    trackEvent("scroll_indicator_click", "hero", "chevron_down")
    // Smooth scroll to next section
    const nextSection = document.querySelector("section:nth-of-type(2)")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen bg-[#FDFCF9] flex items-center justify-center overflow-hidden">
      {/* Animated Mist/Particle Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="mist-particle mist-1"></div>
        <div className="mist-particle mist-2"></div>
        <div className="mist-particle mist-3"></div>
        <div className="mist-particle mist-4"></div>
        <div className="mist-particle mist-5"></div>
        <div className="mist-particle mist-6"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
          I am a woman who rises before dawn to touch heaven.
        </h1>

        {/* Manifesto Paragraph */}
        <p className="font-inter text-lg sm:text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
          In the quiet hours before the world awakens, when the veil between earth and eternity grows thin, we find our
          truest selves. ALTAR is your sacred companion for those precious moments of connection, reflection, and
          spiritual growth. Here, faith meets intention, and every dawn becomes an opportunity to align your heart with
          heaven's rhythm.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            size="lg"
            onClick={handleStartFreeClick}
            className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_20px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Start Free
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleWatchVideoClick}
            className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 bg-transparent hover:bg-white/50"
          >
            <Play className="w-5 h-5 mr-2" />
            Watch How It Works
          </Button>
        </div>

        {/* Scroll Down Indicator */}
        <div className="animate-bounce">
          <ChevronDown
            className="w-8 h-8 text-gray-400 mx-auto cursor-pointer hover:text-gray-600 transition-colors"
            onClick={handleScrollClick}
          />
        </div>
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFCF9]/20 pointer-events-none"></div>
    </section>
  )
}
