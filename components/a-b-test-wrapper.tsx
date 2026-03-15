"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { trackEvent } from "@/lib/analytics"

interface ABTestProps {
  testName: string
  variants: {
    control: React.ReactNode
    variant: React.ReactNode
  }
  trafficSplit?: number // 0-1, default 0.5
}

export default function ABTestWrapper({ testName, variants, trafficSplit = 0.5 }: ABTestProps) {
  const [variant, setVariant] = useState<"control" | "variant">("control")

  useEffect(() => {
    // Determine variant based on user ID or session
    const userId = localStorage.getItem("altar-user-id") || Math.random().toString(36)
    if (!localStorage.getItem("altar-user-id")) {
      localStorage.setItem("altar-user-id", userId)
    }

    // Simple hash function for consistent assignment
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const assignedVariant = Math.abs(hash) % 100 < trafficSplit * 100 ? "variant" : "control"
    setVariant(assignedVariant)

    // Track assignment
    trackEvent("ab_test_assignment", testName, assignedVariant)
  }, [testName, trafficSplit])

  return <>{variants[variant]}</>
}
