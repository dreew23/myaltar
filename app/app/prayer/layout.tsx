import type { ReactNode } from "react"
import { Cormorant_Garamond, Lato } from "next/font/google"
import "./prayer-design.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-prayer-display",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-prayer-sans",
  display: "swap",
})

export default function PrayerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`prayer-module ${cormorant.variable} ${lato.variable} min-h-[calc(100vh-4rem)]`}>
      {children}
    </div>
  )
}
