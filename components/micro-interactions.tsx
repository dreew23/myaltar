"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function FloatingSparkles() {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setSparkles(newSparkles)
    }

    generateSparkles()
    const interval = setInterval(generateSparkles, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <Sparkles
          key={sparkle.id}
          className="absolute w-4 h-4 text-[#F9D57E]/30 animate-pulse"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export function HoverGlow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#A7C2D7]/0 via-[#A7C2D7]/10 to-[#F9D57E]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      <div className="relative">{children}</div>
    </div>
  )
}
