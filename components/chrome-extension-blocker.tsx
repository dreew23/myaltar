"use client"

import { useEffect } from "react"

export default function ChromeExtensionBlocker() {
  useEffect(() => {
    // Execute immediately and aggressively block all extension-related APIs
    const blockExtensions = () => {
      if (typeof window === "undefined") return

      try {
        // 1. Completely remove and block chrome object
        delete (window as any).chrome
        Object.defineProperty(window, "chrome", {
          value: undefined,
          writable: false,
          configurable: false,
          enumerable: false,
        })

        // 2. Block ethereum/MetaMask completely
        delete (window as any).ethereum
        Object.defineProperty(window, "ethereum", {
          value: undefined,
          writable: false,
          configurable: false,
          enumerable: false,
        })

        // 3. Block web3 objects
        delete (window as any).web3
        Object.defineProperty(window, "web3", {
          value: undefined,
          writable: false,
          configurable: false,
          enumerable: false,
        })

        // 4. Override console methods to completely suppress extension errors
        const originalError = console.error
        const originalWarn = console.warn
        const originalLog = console.log

        console.error = (...args) => {
          const message = String(args[0] || "")
          if (
            message.includes("ChromeTransport") ||
            message.includes("connectChrome") ||
            message.includes("MetaMask") ||
            message.includes("extension not found") ||
            message.includes("chrome.runtime") ||
            message.includes("ethereum")
          ) {
            return // Completely suppress
          }
          originalError.apply(console, args)
        }

        console.warn = (...args) => {
          const message = String(args[0] || "")
          if (
            message.includes("ChromeTransport") ||
            message.includes("connectChrome") ||
            message.includes("MetaMask") ||
            message.includes("extension not found") ||
            message.includes("chrome.runtime") ||
            message.includes("ethereum")
          ) {
            return // Completely suppress
          }
          originalWarn.apply(console, args)
        }

        // 5. Block all error events related to extensions
        const blockErrorEvent = (event: ErrorEvent) => {
          const message = event.message || ""
          if (
            message.includes("ChromeTransport") ||
            message.includes("connectChrome") ||
            message.includes("MetaMask") ||
            message.includes("extension not found") ||
            message.includes("chrome.runtime") ||
            message.includes("ethereum")
          ) {
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            return false
          }
        }

        // 6. Block unhandled promise rejections from extensions
        const blockPromiseRejection = (event: PromiseRejectionEvent) => {
          const reason = String(event.reason || "")
          if (
            reason.includes("ChromeTransport") ||
            reason.includes("connectChrome") ||
            reason.includes("MetaMask") ||
            reason.includes("extension not found") ||
            reason.includes("chrome.runtime") ||
            reason.includes("ethereum")
          ) {
            event.preventDefault()
            event.stopPropagation()
            return false
          }
        }

        // Add event listeners with capture phase
        window.addEventListener("error", blockErrorEvent, true)
        window.addEventListener("unhandledrejection", blockPromiseRejection, true)

        // 7. Override setTimeout and setInterval to catch extension code
        const originalSetTimeout = window.setTimeout
        const originalSetInterval = window.setInterval

        window.setTimeout = (callback: any, delay?: number, ...args: any[]) => {
          try {
            if (typeof callback === "function") {
              const wrappedCallback = (...callbackArgs: any[]) => {
                try {
                  return callback.apply(this, callbackArgs)
                } catch (error) {
                  const errorMessage = String(error)
                  if (
                    errorMessage.includes("ChromeTransport") ||
                    errorMessage.includes("connectChrome") ||
                    errorMessage.includes("MetaMask")
                  ) {
                    return // Suppress extension errors
                  }
                  throw error
                }
              }
              return originalSetTimeout.call(window, wrappedCallback, delay, ...args)
            }
            return originalSetTimeout.call(window, callback, delay, ...args)
          } catch (error) {
            return 0 // Return dummy timer ID
          }
        }

        // 8. Prevent any dynamic script injection from extensions
        const originalAppendChild = Element.prototype.appendChild
        Element.prototype.appendChild = function <T extends Node>(newChild: T): T {
          if (newChild instanceof HTMLScriptElement) {
            const src = newChild.src || ""
            const content = newChild.textContent || ""
            if (
              src.includes("metamask") ||
              src.includes("chrome-extension") ||
              content.includes("ChromeTransport") ||
              content.includes("connectChrome")
            ) {
              return newChild // Block the script but don't throw error
            }
          }
          return originalAppendChild.call(this, newChild)
        }

        // Cleanup function
        return () => {
          console.error = originalError
          console.warn = originalWarn
          window.removeEventListener("error", blockErrorEvent, true)
          window.removeEventListener("unhandledrejection", blockPromiseRejection, true)
          window.setTimeout = originalSetTimeout
          window.setInterval = originalSetInterval
          Element.prototype.appendChild = originalAppendChild
        }
      } catch (error) {
        // Silently handle any setup errors
        console.debug("Extension blocking setup failed:", error)
      }
    }

    // Execute blocking immediately
    const cleanup = blockExtensions()

    // Also execute on DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", blockExtensions)
    }

    return cleanup
  }, [])

  return null
}
