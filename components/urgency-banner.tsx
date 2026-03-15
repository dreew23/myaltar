"use client"

import { useState, useEffect } from "react"
import { Clock, X } from "lucide-react"

export default function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    // Show banner after 30 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 30000)

    // Calculate time until end of day
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
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => {
      clearTimeout(showTimer)
      clearInterval(interval)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#F9D57E] to-[#A7C2D7] text-black py-3 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5" />
          <span className="font-inter text-sm font-medium">
            🎁 Limited Time: Early Access Blessing Package - Only {timeLeft} left today!
          </span>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-black/70 hover:text-black transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
