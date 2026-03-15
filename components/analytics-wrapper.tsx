"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackPageView, trackScrollDepth, isAnalyticsAvailable } from "@/lib/safe-analytics"

export default function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Only proceed if analytics is safely available
    if (!isAnalyticsAvailable()) {
      console.debug("Analytics not available, skipping tracking")
      return
    }

    // Track page view on route change with comprehensive error handling
    try {
      trackPageView(pathname)
    } catch (error) {
      console.debug("Page view tracking skipped")
    }
  }, [pathname])

  useEffect(() => {
    // Only set up scroll tracking if analytics is available
    if (!isAnalyticsAvailable()) return

    let maxScrollDepth = 0
    const scrollDepthThresholds = [25, 50, 75, 90, 100]
    const trackedDepths = new Set<number>()

    const handleScroll = () => {
      try {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = Math.round((scrollTop / docHeight) * 100)

        if (scrollPercent > maxScrollDepth) {
          maxScrollDepth = scrollPercent

          scrollDepthThresholds.forEach((threshold) => {
            if (scrollPercent >= threshold && !trackedDepths.has(threshold)) {
              trackedDepths.add(threshold)
              trackScrollDepth(threshold)
            }
          })
        }
      } catch (error) {
        console.debug("Scroll tracking skipped")
      }
    }

    const handleBeforeUnload = () => {
      try {
        const startTime = Date.now()
        const timeOnPage = Date.now() - startTime
        if (timeOnPage > 10000) {
          trackScrollDepth(maxScrollDepth)
        }
      } catch (error) {
        console.debug("Exit tracking skipped")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return <>{children}</>
}
