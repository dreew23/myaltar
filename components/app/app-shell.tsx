"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Target, Heart, ScrollText, Lightbulb, Crown, GitBranch, Settings, LogOut,
  Menu, X, ChevronLeft, Sparkles, BookOpen, Zap, Flame, CalendarCheck,
} from "lucide-react"
import { AltarIcon } from "@/components/logo-variations"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/app/dashboard", label: "DOMINION", icon: Crown },
  { href: "/app/pulse", label: "Sunday Pulse", icon: CalendarCheck, sundayHighlight: true },
  { href: "/app/tasks", label: "Sacred Focus", icon: Target },
  { href: "/app/prayer", label: "Prayer", icon: Flame },
  { href: "/app/prayers", label: "Intercession", icon: Heart },
  { href: "/app/declarations", label: "Declarations", icon: ScrollText },
  { href: "/app/sermons", label: "Sermon Library", icon: BookOpen },
  { href: "/app/downloads", label: "Divine Downloads", icon: Zap },
  { href: "/app/journal", label: "Wisdom Log", icon: Lightbulb },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

interface AppShellProps {
  children: ReactNode
  user: { id: string; email: string; displayName: string; avatarUrl?: string | null }
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const update = () => setIsOffline(!navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign("/")
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="flex h-screen bg-[#FDFCF9] overflow-hidden">
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[100] py-1.5 px-4 bg-amber-500 text-amber-950 text-center text-sm font-medium">
          You&apos;re offline — some features may be limited
        </div>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col bg-white border-r border-[#A7C2D7]/15
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-[#A7C2D7]/10 ${collapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/app/dashboard" className="flex items-center gap-2.5">
            <AltarIcon className="w-8 h-8 flex-shrink-0" />
            {!collapsed && <span className="font-playfair text-lg font-bold bg-gradient-to-r from-[#A7C2D7] to-[#F9D57E] bg-clip-text text-transparent">ALTAR</span>}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-[#A7C2D7]/10 text-[#3C1E38]/40">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-[#3C1E38]/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            const isSunday = new Date().getDay() === 0
            const isSundayPulse = "sundayHighlight" in item && item.sundayHighlight
            const sundayPulseNotActive = isSundayPulse && isSunday && !active
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-[#A7C2D7]/15 text-[#3C1E38]"
                    : sundayPulseNotActive
                      ? "text-[#3C1E38]/55 hover:bg-[#A7C2D7]/8 hover:text-[#3C1E38]"
                      : "text-[#3C1E38]/55 hover:bg-[#A7C2D7]/8 hover:text-[#3C1E38]"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className="relative flex-shrink-0">
                  <item.icon className={`w-5 h-5 ${active ? "text-[#A7C2D7]" : ""}`} />
                  {sundayPulseNotActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F9D57E]" aria-hidden />
                  )}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-[#A7C2D7]/10">
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#3C1E38]/55 hover:bg-red-50 hover:text-red-600 transition-all ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="flex items-center h-16 px-4 lg:px-8 border-b border-[#A7C2D7]/10 bg-white/50 backdrop-blur-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-3 text-[#3C1E38]/60">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm text-[#3C1E38]/50 font-inter">{greeting}, <span className="text-[#3C1E38] font-medium">{user.displayName}</span></p>
            <p className="text-xs text-[#3C1E38]/35">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A7C2D7] to-[#F9D57E] flex items-center justify-center text-white text-xs font-bold">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
