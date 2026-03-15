"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const MARKETING_PATHS = ["/", "/product", "/features", "/testimonials", "/how-it-works", "/pricing", "/about"]

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showMarketingNav = pathname !== null && MARKETING_PATHS.some((p) => p === pathname || (p !== "/" && pathname.startsWith(p)))

  return (
    <div className="flex flex-col min-h-screen">
      {showMarketingNav && <Navbar />}
      <main className="flex-grow">{children}</main>
      {showMarketingNav && <Footer />}
    </div>
  )
}
