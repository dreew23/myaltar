"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent, trackFormSubmission, trackButtonClick } from "@/lib/safe-analytics"
import SuccessMessage from "@/components/success-message"

const sacredRhythms = [
  "Morning Prayer & Devotion",
  "Evening Reflection",
  "Weekly Fasting",
  "Daily Scripture Reading",
  "Sabbath Observance",
  "Monthly Retreats",
  "Seasonal Celebrations",
  "Continuous Prayer",
]

export default function EmailSignupSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sacredRhythm: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Track form field interactions
    trackEvent("form_field_focus", "email_signup", name)
  }

  const handleRhythmSelect = (rhythm: string) => {
    setFormData((prev) => ({
      ...prev,
      sacredRhythm: rhythm,
    }))
    setIsDropdownOpen(false)

    // Track dropdown selection
    trackEvent("dropdown_select", "sacred_rhythm", rhythm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Track form submission attempt
      trackEvent("form_submit_attempt", "email_signup", "main_signup_form")

      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Form submitted:", formData)

      // Track successful form submission
      trackFormSubmission("email_signup", true)
      trackEvent("lead_generation", "email_signup", formData.sacredRhythm)

      // Show success message
      setShowSuccess(true)

      // Reset form
      setFormData({ name: "", email: "", sacredRhythm: "" })
    } catch (error) {
      // Track form submission error
      trackFormSubmission("email_signup", false)
      trackEvent("form_error", "email_signup", "submission_failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="email-signup"
      className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-[#FDFCF9] to-[#FBF8F3] overflow-hidden"
    >
      {/* Background Mist Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="signup-mist signup-mist-1"></div>
        <div className="signup-mist signup-mist-2"></div>
        <div className="signup-mist signup-mist-3"></div>
        <div className="signup-mist signup-mist-4"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Main Sign-up Container */}
        <div className="max-w-4xl mx-auto">
          {/* Golden Glow Border Container */}
          <div className="relative">
            {/* Golden Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F9D57E]/30 via-[#F9D57E]/20 to-[#F9D57E]/30 rounded-3xl blur-xl transform scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#F9D57E]/20 via-transparent to-[#F9D57E]/20 rounded-3xl"></div>

            {/* Main Content Card */}
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-[#F9D57E]/30">
              {/* Header Section */}
              <div className="text-center mb-8 md:mb-12">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#F9D57E] mr-3" />
                  <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                    Reserve Your Altar Seat
                  </h2>
                  <Sparkles className="w-6 h-6 text-[#F9D57E] ml-3" />
                </div>
                <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-2xl mx-auto">
                  Join thousands of women who start each day with divine intention
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block font-inter text-sm font-medium text-[#3C1E38]">
                      Your Sacred Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#A7C2D7] focus:ring-2 focus:ring-[#A7C2D7]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-inter placeholder-gray-400"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block font-inter text-sm font-medium text-[#3C1E38]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#A7C2D7] focus:ring-2 focus:ring-[#A7C2D7]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-inter placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Sacred Rhythm Dropdown */}
                <div className="space-y-2">
                  <label className="block font-inter text-sm font-medium text-[#3C1E38]">
                    What's your sacred rhythm?
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(!isDropdownOpen)
                        trackEvent("dropdown_open", "sacred_rhythm", "form_interaction")
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#A7C2D7] focus:ring-2 focus:ring-[#A7C2D7]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm font-inter text-left flex items-center justify-between"
                    >
                      <span className={formData.sacredRhythm ? "text-[#3C1E38]" : "text-gray-400"}>
                        {formData.sacredRhythm || "Select your spiritual practice"}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                        {sacredRhythms.map((rhythm, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleRhythmSelect(rhythm)}
                            className="w-full px-4 py-3 text-left font-inter text-[#3C1E38] hover:bg-[#A7C2D7]/10 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {rhythm}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => trackButtonClick("Sign Up Free", "email_signup_section")}
                    className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_30px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                        Reserving...
                      </div>
                    ) : (
                      "Sign Up Free"
                    )}
                  </Button>
                </div>

                {/* Spiritual Affirming Text */}
                <div className="text-center pt-6 border-t border-gray-200/50">
                  <p className="font-playfair text-xl md:text-2xl italic text-[#3C1E38] leading-relaxed">
                    "This is not a journal. This is divine technology."
                  </p>
                  <div className="flex items-center justify-center mt-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#F9D57E] to-transparent w-24"></div>
                    <Sparkles className="w-4 h-4 text-[#F9D57E] mx-4" />
                    <div className="h-px bg-gradient-to-r from-transparent via-[#F9D57E] to-transparent w-24"></div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>}

      {/* Success Message */}
      <SuccessMessage
        title="Welcome to Your Sacred Journey!"
        message="Thank you for reserving your seat at the altar. You'll receive exclusive early access updates and spiritual resources to prepare for your divine planning experience."
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  )
}
