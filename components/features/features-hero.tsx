"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackButtonClick, trackEvent } from "@/lib/safe-analytics"

interface FeaturesHeroProps {
  onStartQuiz: () => void
}

export default function FeaturesHero({ onStartQuiz }: FeaturesHeroProps) {
  const [activeTab, setActiveTab] = useState("morning")

  const handleExploreClick = () => {
    trackButtonClick("Explore Features", "features_hero")
    trackEvent("cta_click", "features", "explore_features")
    document.getElementById("features-categories")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleStartFreeClick = () => {
    trackButtonClick("Start Free Trial", "features_hero")
    trackEvent("cta_click", "features", "start_free_trial")
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FBF8F3] via-[#FDFCF9] to-[#FBF8F3] overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="product-mist product-mist-1"></div>
        <div className="product-mist product-mist-2"></div>
        <div className="product-mist product-mist-3"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#A7C2D7] mr-3" />
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#3C1E38]">
                Sacred Features
              </h1>
              <Sparkles className="w-8 h-8 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-xl md:text-2xl text-[#3C1E38]/70 leading-relaxed max-w-3xl mx-auto">
              Discover how ALTAR transforms ordinary planning into extraordinary spiritual practice through
              divine-guided tools and sacred features.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#A7C2D7]/20 overflow-hidden mb-12">
            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-[#A7C2D7]/20">
              {[
                { id: "morning", label: "Morning Sacred Hour" },
                { id: "planning", label: "Divine Planning" },
                { id: "prayer", label: "Prayer Tracking" },
                { id: "growth", label: "Spiritual Growth" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-inter font-medium text-sm md:text-base transition-colors relative ${
                    activeTab === tab.id
                      ? "text-[#3C1E38] bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10"
                      : "text-[#3C1E38]/60 hover:text-[#3C1E38]/80 hover:bg-[#FBF8F3]/50"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E]"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {activeTab === "morning" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">
                      Begin Each Day in Sacred Stillness
                    </h2>
                    <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                      Transform your morning routine into a sacred ritual with guided scripture readings, personalized
                      devotionals, and prayer prompts aligned with your spiritual journey. Create space for divine
                      wisdom to flow into your day.
                    </p>
                    <div className="space-y-3">
                      {[
                        "Personalized daily scripture selections",
                        "Guided prayer templates for different needs",
                        "Reflection prompts to deepen understanding",
                        "Sacred atmosphere with ambient sounds",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-[#3C1E38]/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#FBF8F3] rounded-xl p-6 border border-[#A7C2D7]/20">
                    {/* Morning Sacred Hour Preview */}
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
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

                      <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4 mb-4">
                        <div className="text-xs text-[#A7C2D7] font-medium mb-2">Today's Scripture</div>
                        <blockquote className="font-garamond italic text-[#3C1E38] text-lg leading-relaxed mb-2">
                          "Trust in the Lord with all your heart and lean not on your own understanding."
                        </blockquote>
                        <div className="text-xs text-[#3C1E38]/60">— Proverbs 3:5</div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Morning Reflection</h4>
                        <p className="font-inter text-sm text-[#3C1E38]/70 leading-relaxed">
                          Where in your life are you struggling to trust God's plan? How might surrendering control
                          bring you peace today?
                        </p>
                        <div className="border border-dashed border-[#A7C2D7]/40 rounded-lg p-3 bg-[#FBF8F3]/50">
                          <p className="font-inter text-sm text-[#3C1E38]/60 italic">Tap to journal your thoughts...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "planning" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">
                      Transform Tasks into Sacred Assignments
                    </h2>
                    <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                      Align your daily planning with divine purpose through our Kingdom Priority Framework. Organize
                      tasks based on spiritual significance, protect sacred time blocks, and ensure your daily actions
                      reflect your deepest values.
                    </p>
                    <div className="space-y-3">
                      {[
                        "Kingdom Priority Framework for task organization",
                        "Sacred time blocking for prayer and devotion",
                        "Divine timing awareness for better scheduling",
                        "Purpose-driven task categorization",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-[#3C1E38]/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#FBF8F3] rounded-xl p-6 border border-[#A7C2D7]/20">
                    {/* Divine Planning Preview */}
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4">Sacred Intentions</h4>
                      <div className="space-y-3">
                        {[
                          { text: "Review quarterly goals with prayer", priority: "Kingdom", completed: false },
                          { text: "Call mom to check on her health", priority: "Love", completed: true },
                          { text: "Prepare presentation with excellence", priority: "Stewardship", completed: false },
                          { text: "Bible study preparation", priority: "Kingdom", completed: false },
                          { text: "Exercise - temple stewardship", priority: "Stewardship", completed: true },
                        ].map((task, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              task.completed
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-[#A7C2D7]/20 hover:bg-[#FBF8F3]"
                            } transition-colors`}
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              readOnly
                              className="w-4 h-4 text-[#A7C2D7] rounded"
                            />
                            <div className="flex-1">
                              <span
                                className={`font-inter ${
                                  task.completed ? "line-through text-[#3C1E38]/50" : "text-[#3C1E38]"
                                }`}
                              >
                                {task.text}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
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
              )}

              {activeTab === "prayer" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">
                      Track Your Prayer Journey
                    </h2>
                    <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                      Record, organize, and celebrate answered prayers with our powerful prayer tracking system. Build a
                      testimony of God's faithfulness over time, set prayer reminders, and share prayer requests with
                      trusted circles.
                    </p>
                    <div className="space-y-3">
                      {[
                        "Organized prayer request management",
                        "Answered prayer celebration and testimony building",
                        "Prayer circles for community support",
                        "Prayer analytics to see patterns in your prayer life",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-[#3C1E38]/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#FBF8F3] rounded-xl p-6 border border-[#A7C2D7]/20">
                    {/* Prayer Tracking Preview */}
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Prayer Requests</h4>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="text-xs text-green-600">2 answered this week</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          {
                            text: "Sarah's job interview",
                            category: "Friends",
                            status: "answered",
                            date: "2 days ago",
                          },
                          {
                            text: "Church building fund",
                            category: "Community",
                            status: "ongoing",
                            date: "1 week ago",
                          },
                          { text: "Wisdom for parenting", category: "Family", status: "ongoing", date: "3 days ago" },
                          { text: "Healing for mom's knee", category: "Family", status: "answered", date: "yesterday" },
                        ].map((prayer, i) => (
                          <div key={i} className="bg-white rounded-lg p-4 border border-[#A7C2D7]/20">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-inter text-[#3C1E38]">{prayer.text}</span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  prayer.status === "answered"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-[#A7C2D7]/20 text-[#A7C2D7]"
                                }`}
                              >
                                {prayer.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#3C1E38]/60">
                              <span>{prayer.category}</span>
                              <span>•</span>
                              <span>{prayer.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "growth" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38]">
                      Track Your Spiritual Growth
                    </h2>
                    <p className="font-inter text-[#3C1E38]/70 leading-relaxed">
                      Monitor your spiritual journey with gentle accountability tools that celebrate progress, not
                      perfection. Track spiritual disciplines, set sacred goals, and witness your transformation over
                      time through meaningful metrics.
                    </p>
                    <div className="space-y-3">
                      {[
                        "Spiritual discipline tracking for 12+ practices",
                        "Growth visualization and progress charts",
                        "Scripture memorization system",
                        "Seasonal spiritual focus areas",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#A7C2D7] mt-0.5 flex-shrink-0" />
                          <span className="font-inter text-[#3C1E38]/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#FBF8F3] rounded-xl p-6 border border-[#A7C2D7]/20">
                    {/* Spiritual Growth Preview */}
                    <div className="bg-white rounded-lg p-4 shadow-md">
                      <h4 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-4">Spiritual Disciplines</h4>
                      <div className="space-y-4">
                        {[
                          { name: "Prayer", progress: 80, streak: 21 },
                          { name: "Scripture Reading", progress: 65, streak: 14 },
                          { name: "Meditation", progress: 45, streak: 7 },
                          { name: "Fasting", progress: 30, streak: 3 },
                        ].map((discipline, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-inter font-medium text-[#3C1E38]">{discipline.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#A7C2D7]">{discipline.streak} day streak</span>
                                <span className="text-xs text-[#3C1E38]/60">{discipline.progress}%</span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E]"
                                style={{ width: `${discipline.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onStartQuiz}
              className="bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] hover:shadow-[0_0_30px_rgba(249,213,126,0.6)] text-black font-inter text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Take Spiritual Assessment
            </Button>
            <Button
              onClick={handleExploreClick}
              variant="outline"
              className="border-2 border-[#A7C2D7] text-[#A7C2D7] hover:bg-[#A7C2D7] hover:text-white font-inter text-lg px-8 py-4 rounded-full"
            >
              Explore All Features
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
