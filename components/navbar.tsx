"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-[#FDFCF9] font-inter">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center">
            {/* Logo SVG */}
            <div className="w-8 h-8 mr-3">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A7C2D7" />
                    <stop offset="100%" stopColor="#F9D57E" />
                  </linearGradient>
                </defs>
                {/* Sacred flame/light symbol */}
                <path
                  d="M16 2 C20 6, 24 10, 24 16 C24 22, 20 26, 16 26 C12 26, 8 22, 8 16 C8 10, 12 6, 16 2 Z"
                  fill="url(#logoGradient)"
                  opacity="0.9"
                />
                <path
                  d="M16 6 C18 8, 20 10, 20 14 C20 18, 18 20, 16 20 C14 20, 12 18, 12 14 C12 10, 14 8, 16 6 Z"
                  fill="#FFFFFF"
                  opacity="0.8"
                />
                <circle cx="16" cy="14" r="2" fill="url(#logoGradient)" />
              </svg>
            </div>
            <span className="font-playfair text-2xl font-bold tracking-tight bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">
              ALTAR
            </span>
            <span className="sr-only">ALTAR - Sacred Companion for Divine Living</span>
          </Link>
        </div>

        <nav className="hidden items-center space-x-6 text-sm md:flex">
          <Link href="/product" className="transition-colors hover:text-gray-500">
            Product
          </Link>
          <Link href="/features" className="transition-colors hover:text-gray-500">
            Features
          </Link>
          <Link href="/testimonials" className="transition-colors hover:text-gray-500">
            Testimonials
          </Link>
          <Link href="/how-it-works" className="transition-colors hover:text-gray-500">
            How It Works
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-gray-500">
            Pricing
          </Link>
        </nav>

        <div className="hidden items-center space-x-4 md:flex">
          <Button variant="ghost" className="font-inter text-sm" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button
            className="bg-[#A7C2D7] font-inter text-sm text-black hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_10px_rgba(249,213,126,0.5)]"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "absolute left-0 right-0 bg-[#FDFCF9] px-4 pb-6 pt-2 shadow-lg md:hidden",
          isMenuOpen ? "block" : "hidden",
        )}
      >
        <div className="space-y-4">
          <Link href="/product" className="block py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
            Product
          </Link>
          <Link href="/features" className="block py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
            Features
          </Link>
          <Link href="/testimonials" className="block py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
            Testimonials
          </Link>
          <Link href="/how-it-works" className="block py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
            How It Works
          </Link>
          <Link href="/pricing" className="block py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </Link>
          <div className="flex flex-col space-y-3 pt-4">
            <Button variant="ghost" className="w-full justify-start font-inter" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button
              className="w-full bg-[#A7C2D7] font-inter text-black hover:bg-[#A7C2D7]/90 hover:shadow-[0_0_10px_rgba(249,213,126,0.5)]"
              asChild
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
