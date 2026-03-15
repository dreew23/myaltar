"use client"

import Link from "next/link"

// Main Logo with Icon and Text
export function AltarLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center`}>
      <div className="w-8 h-8 mr-3">
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <defs>
            <linearGradient id="mainLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7C2D7" />
              <stop offset="100%" stopColor="#F9D57E" />
            </linearGradient>
          </defs>
          <path
            d="M16 2 C20 6, 24 10, 24 16 C24 22, 20 26, 16 26 C12 26, 8 22, 8 16 C8 10, 12 6, 16 2 Z"
            fill="url(#mainLogoGradient)"
            opacity="0.9"
          />
          <path
            d="M16 6 C18 8, 20 10, 20 14 C20 18, 18 20, 16 20 C14 20, 12 18, 12 14 C12 10, 14 8, 16 6 Z"
            fill="#FFFFFF"
            opacity="0.8"
          />
          <circle cx="16" cy="14" r="2" fill="url(#mainLogoGradient)" />
        </svg>
      </div>
      <span className="font-playfair text-2xl font-bold tracking-tight bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">
        ALTAR
      </span>
    </div>
  )
}

// Icon Only
export function AltarIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7C2D7" />
            <stop offset="100%" stopColor="#F9D57E" />
          </linearGradient>
        </defs>
        <path
          d="M16 2 C20 6, 24 10, 24 16 C24 22, 20 26, 16 26 C12 26, 8 22, 8 16 C8 10, 12 6, 16 2 Z"
          fill="url(#iconGradient)"
          opacity="0.9"
        />
        <path
          d="M16 6 C18 8, 20 10, 20 14 C20 18, 18 20, 16 20 C14 20, 12 18, 12 14 C12 10, 14 8, 16 6 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />
        <circle cx="16" cy="14" r="2" fill="url(#iconGradient)" />
      </svg>
    </div>
  )
}

// Wordmark Only
export function AltarWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-playfair text-2xl font-bold tracking-tight bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent ${className}`}
    >
      ALTAR
    </span>
  )
}

// Logo Link Component
export function AltarLogoLink({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center group ${className}`}>
      <AltarLogo />
      <span className="sr-only">ALTAR - Sacred Companion for Divine Living</span>
    </Link>
  )
}
