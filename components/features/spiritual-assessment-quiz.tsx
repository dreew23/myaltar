"use client"

import type React from "react"

import { useState } from "react"
import { Heart, BookOpen, Users, Calendar, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/safe-analytics"

interface QuizQuestion {
  id: string
  question: string
  options: {
    id: string
    text: string
    icon: React.ElementType
    features: string[]
  }[]
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "spiritual-maturity",
    question: "Where are you in your spiritual journey?",
    options: [
      {
        id: "new-believer",
        text: "New to faith, seeking foundation",
        icon: Sparkles,
        features: ["morning-devotions", "scripture-integration", "prayer-basics"],
      },
      {
        id: "growing",
        text: "Growing in faith, building habits",
        icon: BookOpen,
        features: ["spiritual-disciplines", "prayer-tracking", "growth-metrics"],
      },
      {
        id: "mature",
        text: "Mature believer, seeking deeper connection",
        icon: Heart,
        features: ["advanced-prayer", "mentorship", "community-leadership"],
      },
      {
        id: "leader",
        text: "Spiritual leader, guiding others",
        icon: Users,
        features: ["prayer-circles", "mentorship", "community-tools"],
      },
    ],
  },
  {
    id: "biggest-challenge",
    question: "What's your biggest spiritual challenge right now?",
    options: [
      {
        id: "consistency",
        text: "Staying consistent with spiritual practices",
        icon: Calendar,
        features: ["habit-tracking", "gentle-reminders", "progress-celebration"],
      },
      {
        id: "time",
        text: "Finding time for God in a busy schedule",
        icon: Calendar,
        features: ["sacred-time-blocking", "micro-moments", "priority-framework"],
      },
      {
        id: "depth",
        text: "Going deeper in prayer and scripture",
        icon: BookOpen,
        features: ["advanced-study-tools", "contemplative-prayer", "scripture-meditation"],
      },
      {
        id: "community",
        text: "Finding spiritual community and support",
        icon: Users,
        features: ["prayer-circles", "mentorship-matching", "accountability-partners"],
      },
    ],
  },
  {
    id: "prayer-life",
    question: "How would you describe your current prayer life?",
    options: [
      {
        id: "struggling",
        text: "I struggle to pray regularly",
        icon: Heart,
        features: ["prayer-prompts", "guided-prayers", "prayer-reminders"],
      },
      {
        id: "basic",
        text: "I pray but want to grow deeper",
        icon: BookOpen,
        features: ["prayer-journaling", "different-prayer-types", "prayer-tracking"],
      },
      {
        id: "strong",
        text: "I have a strong prayer life",
        icon: Sparkles,
        features: ["prayer-analytics", "intercession-tools", "prayer-leadership"],
      },
    ],
  },
]

interface SpiritualAssessmentQuizProps {
  onComplete: (recommendations: string[]) => void
  onClose: () => void
}

export default function SpiritualAssessmentQuiz({ onComplete, onClose }: SpiritualAssessmentQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleting, setIsCompleting] = useState(false)

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }))

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsCompleting(true)

    // Calculate recommendations based on answers
    const allFeatures = new Set<string>()
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = quizQuestions.find((q) => q.id === questionId)
      const option = question?.options.find((o) => o.id === answerId)
      option?.features.forEach((feature) => allFeatures.add(feature))
    })

    trackEvent("quiz_completed", "features", "spiritual_assessment", Object.keys(answers).length)

    setTimeout(() => {
      onComplete(Array.from(allFeatures))
    }, 1500)
  }

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  if (isCompleting) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-4">
            Preparing Your Sacred Recommendations...
          </h3>
          <p className="font-inter text-[#3C1E38]/70">
            We're personalizing your ALTAR experience based on your spiritual journey.
          </p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] h-2 rounded-full animate-pulse"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-[#3C1E38]">Spiritual Assessment</h2>
              <p className="font-inter text-sm text-[#3C1E38]/60">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#3C1E38]/60 hover:text-[#3C1E38] text-2xl">
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="font-playfair text-2xl font-semibold text-[#3C1E38] mb-6 text-center">
            {quizQuestions[currentQuestion].question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizQuestions[currentQuestion].options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(quizQuestions[currentQuestion].id, option.id)}
                className="p-6 rounded-xl border-2 border-[#A7C2D7]/20 hover:border-[#A7C2D7] hover:bg-[#FBF8F3] transition-all duration-300 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#A7C2D7]/10 group-hover:bg-[#A7C2D7]/20 flex items-center justify-center transition-colors">
                    <option.icon className="w-6 h-6 text-[#A7C2D7]" />
                  </div>
                  <div>
                    <h4 className="font-inter font-semibold text-[#3C1E38] mb-1">{option.text}</h4>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            {quizQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentQuestion ? "bg-[#A7C2D7]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
