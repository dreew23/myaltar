"use client"

import { useEffect, useState } from "react"
import { trackEvent } from "@/lib/safe-analytics"

interface PerformanceMetrics {
  pageLoadTime: number
  timeToInteractive: number
  scrollDepth: number
  engagementTime: number
  featureInteractions: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    timeToInteractive: 0,
    scrollDepth: 0,
    engagementTime: 0,
    featureInteractions: 0,
  })

  useEffect(() => {
    // Track page load performance
    const measurePageLoad = () => {
      if (typeof window !== "undefined" && window.performance) {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
        const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart

        setMetrics((prev) => ({ ...prev, pageLoadTime }))
        trackEvent("performance", "page_load", "features_page", pageLoadTime)
      }
    }

    // Track scroll depth
    const trackScrollDepth = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      setMetrics((prev) => ({ ...prev, scrollDepth: Math.max(prev.scrollDepth, scrollPercent) }))

      // Track milestone scroll depths
      if (scrollPercent >= 25 && scrollPercent < 50) {
        trackEvent("scroll_depth", "features", "25_percent")
      } else if (scrollPercent >= 50 && scrollPercent < 75) {
        trackEvent("scroll_depth", "features", "50_percent")
      } else if (scrollPercent >= 75 && scrollPercent < 90) {
        trackEvent("scroll_depth", "features", "75_percent")
      } else if (scrollPercent >= 90) {
        trackEvent("scroll_depth", "features", "90_percent")
      }
    }

    // Track engagement time
    let startTime = Date.now()
    let isActive = true

    const trackEngagement = () => {
      if (isActive) {
        const currentTime = Date.now()
        const engagementTime = currentTime - startTime
        setMetrics((prev) => ({ ...prev, engagementTime }))
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false
        trackEvent("engagement", "features", "page_hidden", Date.now() - startTime)
      } else {
        isActive = true
        startTime = Date.now()
      }
    }

    // Track feature interactions
    const trackFeatureInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.closest("[data-feature-interaction]")) {
        setMetrics((prev) => ({ ...prev, featureInteractions: prev.featureInteractions + 1 }))
        trackEvent(
          "feature_interaction",
          "features",
          target.closest("[data-feature-interaction]")?.getAttribute("data-feature-interaction") || "unknown",
        )
      }
    }

    // Set up event listeners
    window.addEventListener("load", measurePageLoad)
    window.addEventListener("scroll", trackScrollDepth, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("click", trackFeatureInteraction)

    const engagementInterval = setInterval(trackEngagement, 5000)

    // Cleanup
    return () => {
      window.removeEventListener("load", measurePageLoad)
      window.removeEventListener("scroll", trackScrollDepth)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("click", trackFeatureInteraction)
      clearInterval(engagementInterval)
    }
  }, [])

  // Track when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackEvent("page_exit", "features", "features_page", metrics.engagementTime)
      trackEvent("scroll_depth_final", "features", "final_depth", metrics.scrollDepth)
      trackEvent("feature_interactions_total", "features", "total_interactions", metrics.featureInteractions)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [metrics])

  return null // This component doesn't render anything visible
}
