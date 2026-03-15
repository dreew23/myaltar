"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoverQuote, setHoverQuote] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    const currentFooter = footerRef.current
    if (currentFooter) {
      observer.observe(currentFooter)
    }

    return () => {
      if (currentFooter) {
        observer.unobserve(currentFooter)
      }
      observer.disconnect()
    }
  }, [])

  const navigationLinks = [
    { name: "About", href: "/about" },
    { name: "Support", href: "/support" },
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
  ]

  return (
    <footer
      ref={footerRef}
      className={`bg-[#FBF8F3] border-t border-gray-200/50 py-10 relative overflow-hidden transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Subtle background animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A7C2D7]/30 to-transparent transform transition-transform duration-1500 ease-out ${
            isVisible ? "translate-y-0" : "-translate-y-4"
          }`}
          style={{ transitionDelay: "200ms" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Logo and Links */}
          <div
            className={`space-y-6 transform transition-all duration-1000 ease-out ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {/* ALTAR Logotype with Icon */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center relative group overflow-hidden"
                onMouseEnter={() => setHoverQuote(true)}
                onMouseLeave={() => setHoverQuote(false)}
              >
                {/* Logo Icon */}
                <div className="w-8 h-8 mr-3">
                  <svg viewBox="0 0 32 32" className="w-full h-full">
                    <defs>
                      <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A7C2D7" />
                        <stop offset="100%" stopColor="#F9D57E" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M16 2 C20 6, 24 10, 24 16 C24 22, 20 26, 16 26 C12 26, 8 22, 8 16 C8 10, 12 6, 16 2 Z"
                      fill="url(#footerLogoGradient)"
                      opacity="0.9"
                    />
                    <path
                      d="M16 6 C18 8, 20 10, 20 14 C20 18, 18 20, 16 20 C14 20, 12 18, 12 14 C12 10, 14 8, 16 6 Z"
                      fill="#FFFFFF"
                      opacity="0.8"
                    />
                    <circle cx="16" cy="14" r="2" fill="url(#footerLogoGradient)" />
                  </svg>
                </div>
                <span className="font-playfair text-2xl md:text-3xl font-bold text-[#3C1E38] tracking-tight relative z-10 transition-colors duration-300">
                  ALTAR
                </span>
                <span className="absolute bottom-0 left-0 w-full h-px bg-[#A7C2D7] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap gap-6 md:gap-8">
              {navigationLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-inter text-[#3C1E38]/70 hover:text-[#3C1E38] relative group text-sm md:text-base transform transition-all duration-1000 ease-out ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100 + 400}ms` }}
                >
                  <span className="relative z-10 transition-colors duration-300">{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-full h-px bg-[#A7C2D7] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Column - Quote */}
          <div
            className={`flex items-center md:justify-end transform transition-all duration-1000 ease-out ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <blockquote
              className={`text-center md:text-right relative transition-all duration-500 ease-out ${
                hoverQuote ? "scale-[1.02]" : "scale-100"
              }`}
              onMouseEnter={() => setHoverQuote(true)}
              onMouseLeave={() => setHoverQuote(false)}
            >
              <p className="font-playfair text-lg md:text-xl italic text-[#3C1E38] leading-relaxed">
                "Excellence is my incense. Obedience is my blueprint."
              </p>
              <div
                className={`absolute -bottom-2 left-1/2 md:left-auto md:right-0 w-16 h-px bg-gradient-to-r from-transparent via-[#F9D57E] to-transparent transform -translate-x-1/2 md:translate-x-0 transition-opacity duration-500 ease-out ${
                  hoverQuote ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                className={`absolute -right-6 top-0 transition-opacity duration-500 ease-out ${
                  hoverQuote ? "opacity-100" : "opacity-0"
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#F9D57E]/70" />
              </div>
            </blockquote>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div
          className={`mt-8 pt-6 border-t border-gray-200/30 transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          <div className="text-center md:text-left">
            <p className="font-inter text-sm text-[#3C1E38]/50">
              © {new Date().getFullYear()} ALTAR. A sacred companion for divine-guided living.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#A7C2D7]/20 to-transparent transform transition-transform duration-1500 ease-out ${
            isVisible ? "translate-y-0" : "translate-y-4"
          }`}
          style={{ transitionDelay: "900ms" }}
        />
      </div>
    </footer>
  )
}
