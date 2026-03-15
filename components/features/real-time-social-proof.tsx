"use client"

import { useState, useEffect } from "react"
import { Users, Heart, CheckCircle, Sparkles } from "lucide-react"

interface Activity {
  id: string
  user: string
  action: string
  feature: string
  timeAgo: string
  type: "prayer" | "growth" | "community" | "planning"
}

const activities: Activity[] = [
  {
    id: "1",
    user: "Sarah M.",
    action: "tracked her 50th answered prayer",
    feature: "Prayer Tracking",
    timeAgo: "2 minutes ago",
    type: "prayer",
  },
  {
    id: "2",
    user: "Maria R.",
    action: "completed her morning sacred hour",
    feature: "Morning Devotions",
    timeAgo: "5 minutes ago",
    type: "growth",
  },
  {
    id: "3",
    user: "Grace T.",
    action: "joined a prayer circle",
    feature: "Sacred Community",
    timeAgo: "8 minutes ago",
    type: "community",
  },
  {
    id: "4",
    user: "Rebecca C.",
    action: "organized tasks with Kingdom priorities",
    feature: "Sacred Planning",
    timeAgo: "12 minutes ago",
    type: "planning",
  },
  {
    id: "5",
    user: "Jennifer L.",
    action: "reached a 30-day prayer streak",
    feature: "Spiritual Growth",
    timeAgo: "15 minutes ago",
    type: "growth",
  },
  {
    id: "6",
    user: "Amanda K.",
    action: "shared wisdom in her prayer circle",
    feature: "Community",
    timeAgo: "18 minutes ago",
    type: "community",
  },
  {
    id: "7",
    user: "Lisa P.",
    action: "completed scripture meditation",
    feature: "Scripture Integration",
    timeAgo: "22 minutes ago",
    type: "growth",
  },
  {
    id: "8",
    user: "Michelle D.",
    action: "scheduled sacred time blocks",
    feature: "Sacred Planning",
    timeAgo: "25 minutes ago",
    type: "planning",
  },
]

const stats = [
  { label: "Active Sacred Companions", value: "8,247", icon: Users, color: "text-[#A7C2D7]" },
  { label: "Prayers Tracked This Week", value: "12,456", icon: Heart, color: "text-red-500" },
  { label: "Answered Prayers Celebrated", value: "3,891", icon: CheckCircle, color: "text-green-500" },
  { label: "Sacred Hours Completed", value: "15,623", icon: Sparkles, color: "text-[#F9D57E]" },
]

export default function RealTimeSocialProof() {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "prayer":
        return "🙏"
      case "growth":
        return "🌱"
      case "community":
        return "👥"
      case "planning":
        return "📋"
      default:
        return "✨"
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm">
      {/* Live Activity Feed */}
      <div className="bg-white rounded-2xl shadow-2xl border border-[#A7C2D7]/20 p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-inter text-sm font-medium text-[#3C1E38]">Live Activity</span>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto text-[#3C1E38]/60 hover:text-[#3C1E38] text-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#FBF8F3] rounded-lg">
            <div className="text-lg">{getActivityIcon(activities[currentActivity].type)}</div>
            <div className="flex-1">
              <p className="font-inter text-sm text-[#3C1E38]">
                <span className="font-semibold">{activities[currentActivity].user}</span>{" "}
                {activities[currentActivity].action}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#A7C2D7] font-medium">{activities[currentActivity].feature}</span>
                <span className="text-xs text-[#3C1E38]/60">• {activities[currentActivity].timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-2xl border border-[#A7C2D7]/20 p-4 backdrop-blur-sm">
        <h4 className="font-playfair font-semibold text-[#3C1E38] mb-3 text-center">Sacred Community</h4>
        <div className="grid grid-cols-2 gap-3">
          {stats.slice(0, 2).map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-[#3C1E38]/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
