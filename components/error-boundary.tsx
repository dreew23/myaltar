"use client"

import React from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error; reset: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    // Track error in analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: false,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <Sparkles className="w-16 h-16 text-[#A7C2D7] mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold text-[#3C1E38] mb-2">Something went wrong</h1>
          <p className="font-inter text-[#3C1E38]/70">
            Even in moments of difficulty, grace finds a way. Let's try again.
          </p>
        </div>
        {error && (
          <details className="mb-6 text-left bg-white/50 rounded-lg p-4">
            <summary className="font-inter text-sm text-[#3C1E38]/60 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs text-[#3C1E38]/50 overflow-auto">{error.message}</pre>
          </details>
        )}
        <Button onClick={reset} className="bg-[#A7C2D7] hover:bg-[#A7C2D7]/90 text-black font-inter">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default ErrorBoundary
