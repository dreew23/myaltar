"use client"

import { useEffect, useState } from "react"
import { X, Sparkles, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

export default function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true)
        setHasShown(true)
        trackEvent("exit_intent_triggered", "modal", "special_offer")
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [hasShown])

  const handleClose = () => {
    setIsVisible(false)
    trackEvent("exit_intent_closed", "modal", "dismissed")
  }

  const handleClaim = () => {
    setIsVisible(false)
    trackEvent("exit_intent_converted", "modal", "special_offer_claimed")
    // Scroll to signup form
    const signupSection = document.querySelector("#email-signup")
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl p-8 max-w-lg mx-auto shadow-2xl border border-[#F9D57E]/30 transform animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Golden Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F9D57E]/20 to-[#A7C2D7]/20 rounded-3xl blur-xl"></div>

        {/* Content */}
        <div className="relative text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Gift className="w-16 h-16 text-[#F9D57E]" />
              <Sparkles className="w-6 h-6 text-[#A7C2D7] absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <h3 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38] mb-4">
            Wait! Your Sacred Journey Awaits
          </h3>

          <p className="font-inter text-[#3C1E38]/70 mb-6 leading-relaxed">
            Before you go, claim your <strong>exclusive early access</strong> to ALTAR. Join the first 1,000 women and
            receive a special blessing package including guided morning prayers and sacred planning templates.
          </p>

          <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-xl p-4 mb-6">
            <div className="font-playfair text-lg font-semibold text-[#3C1E38] mb-2">🎁 Early Access Includes:</div>
            <ul className="font-inter text-sm text-[#3C1E38]/70 text-left space-y-1">
              <li>• 30 guided morning devotionals</li>
              <li>• Sacred goal-setting templates</li>
              <li>• Exclusive prayer journal prompts</li>
              <li>• Priority access when we launch</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClaim}
              className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_20px_rgba(249,213,126,0.6)] text-black font-inter px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Claim My Sacred Seat
            </Button>
            <Button variant="outline" onClick={handleClose} className="font-inter px-6 py-3 rounded-full">
              Maybe Later
            </Button>
          </div>

          <p className="font-inter text-xs text-[#3C1E38]/50 mt-4">Limited to the first 1,000 sacred companions</p>
        </div>
      </div>
    </div>
  )
}
