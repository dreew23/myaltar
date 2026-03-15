"use client"

import { useState, useRef, useEffect } from "react"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  width?: number
  height?: number
}

export default function LazyImage({ src, alt, className, placeholder, width, height }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#A7C2D7]/20 to-[#F9D57E]/20 transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        {placeholder && (
          <div className="flex items-center justify-center h-full text-[#3C1E38]/50 font-inter text-sm">
            {placeholder}
          </div>
        )}
      </div>

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  )
}
