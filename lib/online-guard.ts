"use client"

import { toast } from "sonner"

export function isOnlineNow(): boolean {
  if (typeof navigator === "undefined") return true
  return navigator.onLine
}

export function ensureOnlineFor(action: string): boolean {
  if (isOnlineNow()) return true
  toast.error(`You're offline. Reconnect to ${action}.`)
  return false
}
