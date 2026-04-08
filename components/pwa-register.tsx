'use client'
import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {})
        })
        .catch(() => {})
    }

    register()

    const onVisible = () => {
      if (document.visibilityState === 'visible') register()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])
  return null
}
