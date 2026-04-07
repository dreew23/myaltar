"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CookieConsent from "@/components/cookie-consent"
import { PWARegister } from "@/components/pwa-register"
import { Toaster } from "sonner"

const MARKETING_PATHS = ["/", "/product", "/features", "/testimonials", "/how-it-works", "/pricing", "/about"]

/** Root client shell: one module boundary for marketing nav + global UI (fewer HMR edge cases than splitting). */
export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showMarketingNav =
    pathname !== null &&
    MARKETING_PATHS.some((p) => p === pathname || (p !== "/" && pathname.startsWith(p)))

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {showMarketingNav && <Navbar />}
        <main className="flex-grow">{children}</main>
        {showMarketingNav && <Footer />}
      </div>
      <CookieConsent />
      <PWARegister />
      <Toaster position="top-right" richColors />
    </>
  )
}
