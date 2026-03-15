"use client"

import { ArrowRight, Sparkles, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackButtonClick, trackEvent } from "@/lib/safe-analytics"

// Features CTA component with trial and demo buttons
export default function FeaturesCTA() {
  const handleStartTrial = () => {
    trackButtonClick("Start Free Trial", "features_cta")
    trackEvent("conversion_intent", "features", "free_trial_bottom")
  }

  const handleScheduleDemo = () => {
    trackButtonClick("Schedule Demo", "features_cta")
    trackEvent("demo_request", "features", "personal_demo")
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-[#A7C2D7]/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/5 to-[#F9D57E]/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9D57E]/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#A7C2D7]/10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-center mb-6">
                <Gift className="w-8 h-8 text-[#A7C2D7] mr-3" />
                <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                  Ready to Transform Your Spiritual Practice?
                </h2>
                <Sparkles className="w-8 h-8 text-[#F9D57E] ml-3" />
              </div>

              <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 mb-8 max-w-2xl mx-auto">
                Join thousands of women who have discovered the life-changing power of divine-guided planning. Start
                your 14-day free trial and experience all these sacred features for yourself.
              </p>

              {/* Special Offer */}
              <div className="bg-gradient-to-r from-[#A7C2D7]/20 to-[#F9D57E]/20 rounded-xl p-6 mb-8">
                <h3 className="font-playfair text-xl font-semibold text-[#3C1E38] mb-2">
                  Limited Time: Early Access Blessing
                </h3>
                <p className="font-inter text-[#3C1E38]/70">
                  Start your free trial today and receive our exclusive Sacred Morning Ritual guide, plus 30 guided
                  prayer prompts to begin your journey.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  onClick={handleStartTrial}
                  className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_30px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleScheduleDemo}
                  className="border-2 border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7] hover:text-white font-inter text-lg px-8 py-4 rounded-full transition-all duration-300"
                >
                  Schedule Personal Demo
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#3C1E38]/60">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Full feature access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
