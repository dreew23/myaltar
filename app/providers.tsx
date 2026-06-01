"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CookieConsent from "@/components/cookie-consent"
import { PWARegister } from "@/components/pwa-register"
import { Toaster } from "sonner"

const MARKETING_PATHS = [
  "/",
  "/product",
  "/features",
  "/testimonials",
  "/how-it-works",
  "/pricing",
  "/about",
]

type InstallPromptChoice = { outcome: "accepted" | "dismissed"; platform: string }
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<InstallPromptChoice>
}

/** Root client shell: one module boundary for marketing nav + global UI (fewer HMR edge cases than splitting). */
export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showMarketingNav =
    pathname !== null &&
    MARKETING_PATHS.some((p) => p === pathname || (p !== "/" && pathname.startsWith(p)))

  const [isOnline, setIsOnline] = useState(true)
  const [updateAction, setUpdateAction] = useState<null | (() => void)>(null)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [hideInstallCta, setHideInstallCta] = useState(false)

  useEffect(() => {
    const syncOnline = () => setIsOnline(navigator.onLine)
    const online = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    syncOnline()
    window.addEventListener("online", online)
    window.addEventListener("offline", offline)
    return () => {
      window.removeEventListener("online", online)
      window.removeEventListener("offline", offline)
    }
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
      setHideInstallCta(false)
    }
    const onInstalled = () => {
      setInstallPrompt(null)
      setHideInstallCta(true)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false
    return /iPad|iPhone|iPod/i.test(navigator.userAgent)
  }, [])
  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    )
  }, [])

  const showInstallCta = !hideInstallCta && !isStandalone && (Boolean(installPrompt) || isIos)
  const showUpdateBanner = Boolean(updateAction)

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === "accepted") {
      setInstallPrompt(null)
      setHideInstallCta(true)
    }
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed inset-x-0 top-0 z-[70] border-b border-amber-500 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          You are offline. Changes cannot be saved until your connection returns.
        </div>
      )}

      {showUpdateBanner && (
        <div className="fixed inset-x-0 top-0 z-[80] border-b border-blue-500 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
            <span>A new version of ALTAR is ready.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUpdateAction(null)
                }}
                className="rounded-md border border-blue-200 px-3 py-1 text-xs"
              >
                Later
              </button>
              <button
                onClick={() => {
                  updateAction?.()
                }}
                className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white"
              >
                Update now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        {showMarketingNav && <Navbar />}
        <main className="flex-grow">{children}</main>
        {showMarketingNav && <Footer />}
      </div>

      {showInstallCta && (
        <div className="fixed bottom-4 right-4 z-[60] max-w-xs rounded-xl border border-[#A7C2D7]/30 bg-white p-3 shadow-lg">
          <p className="text-sm font-medium text-[#3C1E38]">Install ALTAR</p>
          {installPrompt ? (
            <p className="mt-1 text-xs text-[#3C1E38]/70">
              Add ALTAR to your home screen for a faster app-like experience.
            </p>
          ) : (
            <p className="mt-1 text-xs text-[#3C1E38]/70">
              On iPhone/iPad, tap Share then Add to Home Screen.
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setHideInstallCta(true)}
              className="rounded-md border border-[#A7C2D7]/30 px-2.5 py-1 text-xs text-[#3C1E38]/75"
            >
              Dismiss
            </button>
            {installPrompt && (
              <button
                onClick={() => {
                  void handleInstall()
                }}
                className="rounded-md bg-[#F9D57E] px-2.5 py-1 text-xs font-medium text-[#3C1E38]"
              >
                Install
              </button>
            )}
          </div>
        </div>
      )}

      <CookieConsent />
      <PWARegister
        onUpdateReady={(apply) => setUpdateAction(() => apply)}
        onUpdateCleared={() => setUpdateAction(null)}
      />
      <Toaster position="top-right" richColors />
    </>
  )
}
