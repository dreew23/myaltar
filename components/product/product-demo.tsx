"use client"

import { useState } from "react"
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const demoSteps = [
  {
    title: "Morning Sacred Hour",
    description: "Begin your day with guided prayer and scripture reading",
    content: {
      scripture: "Be still and know that I am God; I will be exalted among the nations...",
      reference: "Psalm 46:10",
      prayer: "Heavenly Father, as I begin this new day, help me to be still in Your presence...",
      reflection: "How can I honor God in my tasks today?",
    },
  },
  {
    title: "Divine Task Planning",
    description: "Transform your to-do list into sacred assignments",
    content: {
      tasks: [
        { text: "Review quarterly goals with prayer", priority: "Kingdom", completed: false },
        { text: "Call mom to check on her health", priority: "Love", completed: true },
        { text: "Prepare presentation with excellence", priority: "Stewardship", completed: false },
      ],
    },
  },
  {
    title: "Prayer Request Tracking",
    description: "Organize and track your prayer life with intention",
    content: {
      requests: [
        { text: "Sarah's job interview", category: "Friends", status: "Answered", date: "2 days ago" },
        { text: "Church building fund", category: "Community", status: "Ongoing", date: "1 week ago" },
        { text: "Wisdom for parenting", category: "Family", status: "Ongoing", date: "3 days ago" },
      ],
    },
  },
]

export default function ProductDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % demoSteps.length)
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  return (
    <section className="py-16 md:py-24 bg-[#FBF8F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#A7C2D7] mr-3" />
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-[#3C1E38]">
                See ALTAR in Action
              </h2>
              <Sparkles className="w-6 h-6 text-[#A7C2D7] ml-3" />
            </div>
            <p className="font-inter text-lg md:text-xl text-[#3C1E38]/70 max-w-3xl mx-auto">
              Experience how ALTAR transforms ordinary planning into extraordinary spiritual practice
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Interface */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-2xl border border-[#A7C2D7]/20 overflow-hidden">
                {/* Demo Header */}
                <div className="bg-gradient-to-r from-[#A7C2D7]/10 to-[#F9D57E]/10 p-4 border-b border-[#A7C2D7]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E]"></div>
                      <span className="font-playfair text-lg font-semibold text-[#3C1E38]">
                        {demoSteps[currentStep].title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 p-0"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetDemo} className="w-8 h-8 p-0">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-6 min-h-[400px]">
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      {/* Scripture Card */}
                      <div className="bg-gradient-to-br from-[#A7C2D7]/10 to-[#F9D57E]/10 rounded-lg p-4">
                        <div className="text-xs text-[#A7C2D7] font-medium mb-2">Today's Scripture</div>
                        <blockquote className="font-garamond italic text-[#3C1E38] text-lg leading-relaxed mb-2">
                          "{demoSteps[0].content.scripture}"
                        </blockquote>
                        <cite className="text-sm text-[#3C1E38]/60">— {demoSteps[0].content.reference}</cite>
                      </div>

                      {/* Prayer Section */}
                      <div className="space-y-4">
                        <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Morning Prayer</h4>
                        <p className="font-inter text-[#3C1E38]/70 leading-relaxed">{demoSteps[0].content.prayer}</p>
                      </div>

                      {/* Reflection */}
                      <div className="space-y-4">
                        <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Reflection Prompt</h4>
                        <p className="font-inter text-[#3C1E38]/70 italic">{demoSteps[0].content.reflection}</p>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Sacred Intentions</h4>
                      <div className="space-y-3">
                        {demoSteps[1].content.tasks?.map((task, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-4 p-3 rounded-lg border ${
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
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">Prayer Requests</h4>
                      <div className="space-y-3">
                        {demoSteps[2].content.requests?.map((request, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-[#A7C2D7]/20">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-inter text-[#3C1E38]">{request.text}</span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  request.status === "Answered"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-[#A7C2D7]/20 text-[#A7C2D7]"
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#3C1E38]/60">
                              <span>{request.category}</span>
                              <span>•</span>
                              <span>{request.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Demo Controls & Info */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h3 className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38] mb-4">
                  {demoSteps[currentStep].title}
                </h3>
                <p className="font-inter text-lg text-[#3C1E38]/70 leading-relaxed">
                  {demoSteps[currentStep].description}
                </p>
              </div>

              {/* Step Navigation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {demoSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentStep ? "bg-[#A7C2D7] scale-125" : "bg-[#A7C2D7]/30"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={nextStep} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter">
                    Next Step
                  </Button>
                  <Button variant="outline" onClick={resetDemo} className="font-inter">
                    Reset Demo
                  </Button>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-3">
                <h4 className="font-playfair text-lg font-semibold text-[#3C1E38]">What You'll Experience:</h4>
                <ul className="space-y-2">
                  {[
                    "Seamless scripture integration",
                    "Prayer-guided task management",
                    "Spiritual growth tracking",
                    "Divine timing awareness",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#A7C2D7]"></div>
                      <span className="font-inter text-[#3C1E38]/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
