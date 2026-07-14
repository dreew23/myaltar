"use client"

import { useId } from "react"
import Link from "next/link"

/** Brand mark — hollow silver→gold drop matching the uploaded ALTAR logo. */
export function AltarMark({ className = "w-8 h-8" }: { className?: string }) {
  const uid = useId().replace(/:/g, "")
  const gradId = `altarMarkGrad-${uid}`
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      role="img"
      aria-label="ALTAR"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="18%" y1="8%" x2="82%" y2="96%">
          <stop offset="0%" stopColor="#C5CCD4" />
          <stop offset="42%" stopColor="#B8A37A" />
          <stop offset="100%" stopColor="#C8963A" />
        </linearGradient>
      </defs>
      <path
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="11"
        strokeLinejoin="round"
        d="M64 14 C78 34, 94 52, 94 74 C94 94, 81 108, 64 108 C47 108, 34 94, 34 74 C34 52, 50 34, 64 14 Z"
      />
      <path
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="8"
        strokeLinejoin="round"
        d="M64 36 C73 48, 82 60, 82 74 C82 88, 74 97, 64 97 C54 97, 46 88, 46 74 C46 60, 55 48, 64 36 Z"
      />
      <circle cx="64" cy="78" r="9" fill={`url(#${gradId})`} />
    </svg>
  )
}

// Main Logo with Icon and Text
export function AltarLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <AltarMark className="mr-3 h-8 w-8 flex-shrink-0" />
      <span className="font-playfair text-2xl font-bold tracking-tight bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">
        ALTAR
      </span>
    </div>
  )
}

// Icon Only — also accepts a PNG fallback via className sizing
export function AltarIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <AltarMark className="h-full w-full" />
    </span>
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
