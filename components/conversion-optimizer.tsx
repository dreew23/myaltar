"use client"

import { useEffect, useState } from "react"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

export default function ConversionOptimizer() {
  const [showUrgency, setShowUrgency] = useState(false)
  const [userCount, setUserCount] = useState(8247)

  useEffect(() => {
    // Show urgency after user scrolls 50%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      if (scrollPercent > 50 && !showUrgency) {
        setShowUrgency(true)
        trackEvent("urgency_triggered", "conversion", "scroll_50_percent")
      }
    }

    // Simulate growing user base
    const userInterval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 2))
    }, 45000)

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(userInterval)
    }
  }, [showUrgency])

  return (
    <>
      {/* Floating CTA */}
      {showUrgency && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-[#A7C2D7]/20 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-playfair text-sm font-semibold text-[#3C1E38] mb-1">Don't Miss Your Sacred Seat</h4>
                <p className="font-inter text-xs text-[#3C1E38]/70 mb-3">
                  {userCount.toLocaleString()}+ women have already joined. Reserve yours now!
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    trackEvent("floating_cta_click", "conversion", "bottom_right")
                    document.getElementById("email-signup")?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="w-full bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter text-xs py-2"
                >
                  Reserve Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof Notifications */}
      <SocialProofNotifications />
    </>
  )
}

function SocialProofNotifications() {
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; visible: boolean }>>([])

  const messages = [
    "Sarah from Texas just reserved her sacred seat",
    "Maria from California joined 2 minutes ago",
    "Grace from New York started her spiritual journey",
    "Rebecca from Florida reserved her altar space",
  ]

  useEffect(() => {
    const showNotification = () => {
      const message = messages[Math.floor(Math.random() * messages.length)]
      const id = Date.now()

      setNotifications((prev) => [...prev, { id, message, visible: true }])

      // Hide after 4 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, visible: false } : n)))
      }, 4000)

      // Remove after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 4500)
    }

    // Show first notification after 20 seconds
    const initialTimer = setTimeout(showNotification, 20000)

    // Then show every 30-60 seconds
    const interval = setInterval(
      () => {
        if (Math.random() > 0.3) {
          // 70% chance to show
          showNotification()
        }
      },
      Math.random() * 30000 + 30000,
    )

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white rounded-lg p-3 shadow-lg border border-[#A7C2D7]/20 max-w-xs transform transition-all duration-500 ${
            notification.visible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="font-inter text-xs text-[#3C1E38]/80">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
