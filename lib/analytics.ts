"use client"

// Google Analytics tracking functions
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}

// Safe gtag wrapper to prevent errors
const safeGtag = (command: string, targetId: string, config?: Record<string, any>) => {
  try {
    if (typeof window !== "undefined" && window.gtag && typeof window.gtag === "function") {
      window.gtag(command, targetId, config)
    }
  } catch (error) {
    // Silently handle gtag errors to prevent disruption
    console.debug("Analytics tracking skipped:", error)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  safeGtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
    page_path: url,
  })
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  safeGtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Track conversions (for important actions)
export const trackConversion = (conversionId: string, value?: number, currency?: string) => {
  safeGtag("event", "conversion", {
    send_to: conversionId,
    value: value,
    currency: currency || "USD",
  })
}

// Track user engagement
export const trackEngagement = (engagementTime: number) => {
  safeGtag("event", "user_engagement", {
    engagement_time_msec: engagementTime,
  })
}

// Track scroll depth
export const trackScrollDepth = (scrollDepth: number) => {
  safeGtag("event", "scroll", {
    event_category: "engagement",
    event_label: `${scrollDepth}%`,
    value: scrollDepth,
  })
}

// Track form submissions
export const trackFormSubmission = (formName: string, success = true) => {
  safeGtag("event", success ? "form_submit" : "form_error", {
    event_category: "form",
    event_label: formName,
  })
}

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  safeGtag("event", "click", {
    event_category: "button",
    event_label: `${buttonName} - ${location}`,
  })
}

// Track video interactions
export const trackVideoEvent = (action: string, videoTitle: string, progress?: number) => {
  safeGtag("event", action, {
    event_category: "video",
    event_label: videoTitle,
    value: progress,
  })
}
