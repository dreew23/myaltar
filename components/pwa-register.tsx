"use client"

import { useEffect, useRef } from "react"

type ApplyUpdateFn = () => void

interface Props {
  onUpdateReady?: (applyUpdate: ApplyUpdateFn) => void
  onUpdateCleared?: () => void
}

export function PWARegister({ onUpdateReady, onUpdateCleared }: Props) {
  const didReloadForController = useRef(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    // In development the SW caches stale chunk manifests and force-reloads on
    // controllerchange, which surfaces as ChunkLoadError (especially with the
    // slow compiles caused by running from a OneDrive-synced folder). Never
    // register it in dev, and proactively remove any already-installed worker
    // + its caches so a previously-installed SW stops interfering.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations?.()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {})
      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k)))
          .catch(() => {})
      }
      onUpdateCleared?.()
      return
    }

    const emitReady = (registration: ServiceWorkerRegistration) => {
      if (!registration.waiting) return
      onUpdateReady?.(() => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" })
      })
    }

    const wireRegistration = (registration: ServiceWorkerRegistration) => {
      emitReady(registration)

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller &&
            registration.waiting
          ) {
            emitReady(registration)
          }
        })
      })
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        })
        wireRegistration(registration)
        onUpdateCleared?.()
        registration.update().catch(() => {})
      } catch {
        // Silently ignore registration issues in unsupported/blocked contexts.
      }
    }

    register()

    const onVisible = () => {
      if (document.visibilityState === "visible") register()
    }

    const onControllerChange = () => {
      if (didReloadForController.current) return
      didReloadForController.current = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [onUpdateCleared, onUpdateReady])

  return null
}
