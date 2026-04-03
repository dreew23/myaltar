// Shared analytics helpers (no hooks). Safe when called from client; no-op on server.
// Enhanced safe analytics wrapper with extension conflict protection
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
    dataLayer: any[]
  }
}

// Ultra-safe gtag wrapper with comprehensive error handling
const ultraSafeGtag = (command: string, targetId: string, config?: Record<string, any>) => {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return

    // Ensure gtag exists and is a function
    if (!window.gtag || typeof window.gtag !== "function") {
      console.debug("Analytics not available")
      return
    }

    // Ensure dataLayer exists
    if (!window.dataLayer || !Array.isArray(window.dataLayer)) {
      console.debug("DataLayer not available")
      return
    }

    // Wrap the gtag call in a try-catch to prevent any errors
    try {
      // Execute gtag with additional error protection
      window.gtag(command, targetId, config)
    } catch (innerError) {
      // Silently handle any errors that might occur during gtag execution
      console.debug("Analytics call execution error:", innerError)
    }
  } catch (error) {
    // Completely silent error handling to prevent any disruption
    console.debug("Analytics call skipped due to environment conflict")
  }
}

// Safe initialization check
export const isAnalyticsAvailable = (): boolean => {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return false

    // Check if we're on localhost (development)
    if (window.location.hostname.includes("localhost")) return false

    // Check if gtag is available and is a function
    if (typeof window.gtag !== "function") return false

    // Check if dataLayer exists and is an array
    if (!Array.isArray(window.dataLayer)) return false

    // Check if any browser extension might be interfering
    if (document.documentElement.hasAttribute("data-extension-installed")) return false

    // Check if we're in an iframe (some extensions operate in iframes)
    if (window !== window.top) return false

    return true
  } catch (error) {
    // Any error means analytics is not safely available
    console.debug("Analytics availability check failed:", error)
    return false
  }
}

// Enhanced tracking functions with safety checks
export const trackPageView = (url: string) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
    page_path: url,
    custom_map: { dimension1: "altar_user" },
  })
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    non_interaction: false,
  })
}

export const trackConversion = (conversionId: string, value?: number, currency?: string) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", "conversion", {
    send_to: conversionId,
    value: value,
    currency: currency || "USD",
  })
}

export const trackEngagement = (engagementTime: number) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", "user_engagement", {
    engagement_time_msec: engagementTime,
  })
}

export const trackScrollDepth = (scrollDepth: number) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", "scroll", {
    event_category: "engagement",
    event_label: `${scrollDepth}%`,
    value: scrollDepth,
  })
}

export const trackFormSubmission = (formName: string, success = true) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", success ? "form_submit" : "form_error", {
    event_category: "form",
    event_label: formName,
  })
}

export const trackButtonClick = (buttonName: string, location: string) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", "click", {
    event_category: "button",
    event_label: `${buttonName} - ${location}`,
  })
}

export const trackVideoEvent = (action: string, videoTitle: string, progress?: number) => {
  if (!isAnalyticsAvailable()) return

  ultraSafeGtag("event", action, {
    event_category: "video",
    event_label: videoTitle,
    value: progress,
  })
}
