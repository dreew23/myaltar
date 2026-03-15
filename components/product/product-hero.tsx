"use client"

import { useState, useEffect } from "react"
import { Play, Sparkles, ArrowRight, CheckCircle, Star, Clock, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackButtonClick, trackEvent } from "@/lib/safe-analytics"

export default function ProductHero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [userCount, setUserCount] = useState(8247)

  useEffect(() => {
    // Update user count periodically
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 45000)

    // Calculate time until end of day for urgency
    const updateTimer = () => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      const diff = endOfDay.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const timerInterval = setInterval(updateTimer, 60000)

    return () => {
      clearInterval(interval)
      clearInterval(timerInterval)
    }
  }, [])

  const handleWatchDemo = () => {
    setIsVideoPlaying(true)
    trackButtonClick("Watch Product Demo", "product_hero")
    trackEvent("video_play", "product", "hero_demo")
  }

  const handleStartFree = () => {
    trackButtonClick("Start Free Trial", "product_hero")
    trackEvent("cta_click", "product", "start_free_trial")
    document.getElementById("product-cta")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-[#FDFCF9] to-[#FBF8F3] overflow-hidden relative">
      {/* Limited Time Offer Banner */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#F9D57E] to-[#A7C2D7] text-black py-2 px-4 text-center z-20">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <Gift className="w-4 h-4" />
          <span>🎁 Limited Time: Get 30% off your first year + exclusive Sacred Morning Ritual guide</span>
          <Clock className="w-4 h-4 ml-2" />
          <span className="font-bold">{timeLeft} left!</span>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="product-mist product-mist-1"></div>
        <div className="product-mist product-mist-2"></div>
        <div className="product-mist product-mist-3"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Social Proof Bar */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span className="font-inter text-sm text-[#3C1E38]">
                    {userCount.toLocaleString()}+ sacred companions
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-2 shadow-sm">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 text-[#F9D57E] fill-current" />
                  ))}
                  <span className="font-inter text-sm text-[#3C1E38] ml-1">4.9/5 (1,200+ reviews)</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 rounded-full px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-inter text-xs text-green-700">3 women joined in the last hour</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#A7C2D7]" />
                  <span className="font-inter text-sm font-medium text-[#A7C2D7] uppercase tracking-wide">
                    #1 Faith-Based Planning Platform
                  </span>
                </div>

                <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#3C1E38] leading-tight">
                  Transform Your Morning Into
                  <br />
                  <span className="bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">
                    Sacred Ritual
                  </span>
                </h1>

                <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 leading-relaxed">
                  Join 8,000+ women who've discovered the life-changing power of divine-guided planning. ALTAR
                  seamlessly integrates prayer, scripture, and spiritual growth into every aspect of your daily
                  life—transforming ordinary moments into extraordinary encounters with God.
                </p>
              </div>

              {/* Key Benefits with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: "🙏",
                    text: "Prayer-Guided Planning",
                    desc: "Every task begins with divine guidance",
                    stat: "95% feel more aligned",
                  },
                  {
                    icon: "📖",
                    text: "Scripture Integration",
                    desc: "1,000+ verses woven throughout",
                    stat: "Daily biblical wisdom",
                  },
                  {
                    icon: "📈",
                    text: "Spiritual Growth Tracking",
                    desc: "Measure your faith journey",
                    stat: "Track 12+ disciplines",
                  },
                  {
                    icon: "⏰",
                    text: "Sacred Time Blocking",
                    desc: "Honor divine timing and rhythms",
                    stat: "Protect sacred hours",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-[#A7C2D7]/20 hover:bg-white/80 transition-colors"
                  >
                    <span className="text-xl">{benefit.icon}</span>
                    <div>
                      <div className="font-inter text-sm font-semibold text-[#3C1E38]">{benefit.text}</div>
                      <div className="font-inter text-xs text-[#3C1E38]/60 mb-1">{benefit.desc}</div>
                      <div className="font-inter text-xs text-[#A7C2D7] font-medium">{benefit.stat}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Risk Reversal */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-inter font-semibold text-[#3C1E38]">Sacred Guarantee</span>
                </div>
                <p className="font-inter text-sm text-[#3C1E38]/70">
                  Try ALTAR risk-free for 30 days. If it doesn't transform your spiritual practice, we'll refund every
                  penny with grace and gratitude.
                </p>
              </div>

              {/* CTA Buttons with Urgency */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleStartFree}
                    className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_20px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                  >
                    <span className="relative z-10">Start 14-Day Free Trial</span>
                    <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F9D57E]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleWatchDemo}
                    className="border-2 border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7] hover:text-white font-inter text-lg px-8 py-4 rounded-full transition-all duration-300"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch 2-Min Demo
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#3C1E38]/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Product Preview */}
            <div className="relative">
              {!isVideoPlaying ? (
                <div className="relative group cursor-pointer" onClick={handleWatchDemo}>
                  {/* Product Screenshot/Mockup */}
                  <div className="relative bg-white rounded-2xl shadow-2xl border border-[#A7C2D7]/20 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                    {/* Browser Chrome */}
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500">altar.app/dashboard</div>
                    </div>

                    <div className="aspect-[4/3] bg-gradient-to-br from-[#FBF8F3] to-[#FDFCF9] p-6">
                      {/* Enhanced Mock Interface */}
                      <div className="space-y-4">
                        {/* Header with time and weather */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center shadow-lg">
                              <span className="text-white text-sm">✨</span>
                            </div>
                            <div>
                              <div className="font-playfair text-lg font-semibold text-[#3C1E38]">
                                Good morning, Sarah
                              </div>
                              <div className="text-xs text-[#3C1E38]/60">Tuesday, December 10 • Sacred Hour</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-[#3C1E38]">6:00 AM</div>
                            <div className="text-xs text-[#3C1E38]/60">☀️ 42°F • Clear</div>
                          </div>
                        </div>

                        {/* Today's Focus with Animation */}
                        <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4 border border-[#A7C2D7]/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-[#A7C2D7] font-medium">Today's Scripture</div>
                            <div className="w-2 h-2 bg-[#A7C2D7] rounded-full animate-pulse"></div>
                          </div>
                          <div className="font-playfair italic text-[#3C1E38] text-sm leading-relaxed mb-2">
                            "Trust in the Lord with all your heart and lean not on your own understanding."
                          </div>
                          <div className="text-xs text-[#3C1E38]/60">— Proverbs 3:5</div>
                        </div>

                        {/* Prayer Requests with Status */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-[#3C1E38]/60 font-medium">Prayer Requests</div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="text-xs text-green-600">1 answered</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {[
                              { text: "Sarah's job interview", status: "answered", color: "green" },
                              { text: "Church building fund", status: "ongoing", color: "blue" },
                              { text: "Wisdom in parenting", status: "ongoing", color: "blue" },
                            ].map((prayer, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <div
                                  className={`w-2 h-2 rounded-full ${prayer.color === "green" ? "bg-green-500" : "bg-[#A7C2D7]"}`}
                                ></div>
                                <span
                                  className={`${prayer.status === "answered" ? "line-through text-[#3C1E38]/50" : "text-[#3C1E38]/70"}`}
                                >
                                  {prayer.text}
                                </span>
                                {prayer.status === "answered" && <span className="text-green-600 text-xs">✓</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sacred Intentions with Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-[#3C1E38]/60 font-medium">Sacred Intentions</div>
                            <div className="text-xs text-[#A7C2D7]">2 of 3 complete</div>
                          </div>
                          {[
                            { text: "Review quarterly goals with prayer", priority: "Kingdom", completed: false },
                            { text: "Call mom to check on her health", priority: "Love", completed: true },
                            { text: "Prepare presentation with excellence", priority: "Stewardship", completed: true },
                          ].map((task, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded hover:bg-white/50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                readOnly
                                className="w-3 h-3 text-[#A7C2D7] rounded"
                              />
                              <span
                                className={`text-xs flex-1 ${task.completed ? "line-through text-[#3C1E38]/50" : "text-[#3C1E38]/80"}`}
                              >
                                {task.text}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  task.priority === "Kingdom"
                                    ? "bg-[#A7C2D7]/20 text-[#A7C2D7]"
                                    : task.priority === "Love"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-[#F9D57E]/20 text-[#F9D57E]"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                      <Play className="w-8 h-8 text-[#A7C2D7] ml-1" />
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#F9D57E]/30 animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-[#A7C2D7]/30 animate-pulse delay-1000"></div>

                  {/* Feature Callouts */}
                  <div className="absolute -right-8 top-1/4 bg-white rounded-lg p-2 shadow-lg border border-[#A7C2D7]/20 hidden lg:block">
                    <div className="text-xs font-medium text-[#3C1E38]">Live Prayer Tracking</div>
                    <div className="text-xs text-[#3C1E38]/60">Real-time updates</div>
                  </div>

                  <div className="absolute -left-8 bottom-1/4 bg-white rounded-lg p-2 shadow-lg border border-[#A7C2D7]/20 hidden lg:block">
                    <div className="text-xs font-medium text-[#3C1E38]">Scripture Integration</div>
                    <div className="text-xs text-[#3C1E38]/60">Daily wisdom</div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-inter">Product Demo Video</p>
                      <p className="font-inter text-sm opacity-70">Coming Soon</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
