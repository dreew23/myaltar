"use client"

import { useEffect } from "react"

export default function MetaMaskErrorHandler() {
  useEffect(() => {
    // Specifically handle MetaMask and Chrome extension errors
    if (typeof window !== "undefined") {
      try {
        // Create a proxy for ethereum to prevent MetaMask errors
        const dummyEthereum = {
          isMetaMask: false,
          request: () => Promise.reject(new Error("MetaMask not available")),
          on: () => {},
          removeListener: () => {},
          autoRefreshOnNetworkChange: false,
          _metamask: {
            isUnlocked: () => Promise.resolve(false),
          },
        }

        // Only define if not already defined
        if (!window.ethereum) {
          Object.defineProperty(window, "ethereum", {
            value: dummyEthereum,
            writable: false,
            configurable: true,
          })
        }

        // Handle chrome.runtime access which MetaMask might try to use
        if (!window.chrome) {
          window.chrome = {} as any
        }
        const chromeApi = window.chrome

        if (chromeApi && !chromeApi.runtime) {
          chromeApi.runtime = {
            connect: () => {
              // Return a dummy object instead of throwing an error
              return {
                postMessage: () => {},
                onMessage: { addListener: () => {} },
                disconnect: () => {},
              }
            },
            sendMessage: () => Promise.resolve({}),
          } as any
        }

        // Specifically handle ChromeTransport errors
        const originalConsoleError = console.error
        console.error = (...args) => {
          const errorMessage = args.join(" ")
          if (
            errorMessage.includes("ChromeTransport") ||
            errorMessage.includes("connectChrome") ||
            errorMessage.includes("MetaMask extension not found")
          ) {
            // Suppress the error completely
            return
          }
          originalConsoleError.apply(console, args)
        }

        // Handle window errors for ChromeTransport
        const handleWindowError = (event: ErrorEvent) => {
          if (
            event.message.includes("ChromeTransport") ||
            event.message.includes("connectChrome") ||
            event.message.includes("MetaMask extension not found")
          ) {
            event.preventDefault()
            event.stopPropagation()
            return false
          }
          return true
        }

        window.addEventListener("error", handleWindowError, true)

        // Return cleanup function
        return () => {
          console.error = originalConsoleError
          window.removeEventListener("error", handleWindowError, true)
        }
      } catch (error) {
        console.debug("MetaMask error handler setup failed:", error)
      }
    }
  }, [])

  return null
}
