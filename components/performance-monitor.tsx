"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming

          // Track page load time
          trackEvent("performance", "page_load_time", "total", Math.round(navEntry.loadEventEnd - navEntry.fetchStart))

          // Track Time to First Byte
          trackEvent("performance", "ttfb", "server_response", Math.round(navEntry.responseStart - navEntry.fetchStart))
        }

        if (entry.entryType === "paint") {
          // Track First Contentful Paint
          if (entry.name === "first-contentful-paint") {
            trackEvent("performance", "fcp", "render_time", Math.round(entry.startTime))
          }
        }
      })
    })

    observer.observe({ entryTypes: ["navigation", "paint"] })

    // Track JavaScript errors
    const errorHandler = (event: ErrorEvent) => {
      trackEvent("error", "javascript_error", event.message, 1)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      observer.disconnect()
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  return null
}
