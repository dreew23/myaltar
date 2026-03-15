"use client"

import { useState, useEffect } from "react"
import { Cookie, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    try {
      const consent = localStorage.getItem("altar-cookie-consent")
      if (!consent) {
        setIsVisible(true)
      }
    } catch (error) {
      console.debug("Cookie consent check failed:", error)
    }
  }, [])

  const handleAcceptAll = () => {
    try {
      const consent = {
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: Date.now(),
      }
      localStorage.setItem("altar-cookie-consent", JSON.stringify(consent))
      setIsVisible(false)

      // Initialize analytics if accepted with error handling
      if (consent.analytics && typeof window !== "undefined" && window.gtag) {
        try {
          window.gtag("consent", "update", {
            analytics_storage: "granted",
            ad_storage: "granted",
          })
        } catch (error) {
          console.debug("Analytics consent update failed:", error)
        }
      }
    } catch (error) {
      console.debug("Cookie consent save failed:", error)
      setIsVisible(false)
    }
  }

  const handleSavePreferences = () => {
    try {
      const consent = {
        ...preferences,
        timestamp: Date.now(),
      }
      localStorage.setItem("altar-cookie-consent", JSON.stringify(consent))
      setIsVisible(false)

      // Update analytics consent with error handling
      if (typeof window !== "undefined" && window.gtag) {
        try {
          window.gtag("consent", "update", {
            analytics_storage: preferences.analytics ? "granted" : "denied",
            ad_storage: preferences.marketing ? "granted" : "denied",
          })
        } catch (error) {
          console.debug("Analytics consent update failed:", error)
        }
      }
    } catch (error) {
      console.debug("Cookie preferences save failed:", error)
      setIsVisible(false)
    }
  }

  const handleRejectAll = () => {
    try {
      const consent = {
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: Date.now(),
      }
      localStorage.setItem("altar-cookie-consent", JSON.stringify(consent))
      setIsVisible(false)
    } catch (error) {
      console.debug("Cookie rejection save failed:", error)
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="container mx-auto max-w-6xl">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-[#A7C2D7] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-playfair text-lg font-semibold text-[#3C1E38] mb-1">Sacred Privacy Notice</h3>
                <p className="font-inter text-sm text-[#3C1E38]/70 leading-relaxed">
                  We use cookies to enhance your spiritual journey with ALTAR. These help us understand how you engage
                  with our sacred tools and improve your experience.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="font-inter text-xs">
                <Settings className="w-4 h-4 mr-1" />
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll} className="font-inter text-xs">
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter text-xs"
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-lg font-semibold text-[#3C1E38]">Cookie Preferences</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-inter font-medium text-[#3C1E38]">Necessary Cookies</h4>
                  <p className="font-inter text-xs text-[#3C1E38]/60">Required for basic site functionality</p>
                </div>
                <input type="checkbox" checked disabled className="rounded" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-inter font-medium text-[#3C1E38]">Analytics Cookies</h4>
                  <p className="font-inter text-xs text-[#3C1E38]/60">Help us improve your experience</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-inter font-medium text-[#3C1E38]">Marketing Cookies</h4>
                  <p className="font-inter text-xs text-[#3C1E38]/60">Personalized content and offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))}
                  className="rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleRejectAll} className="font-inter text-xs">
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={handleSavePreferences}
                className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter text-xs"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
