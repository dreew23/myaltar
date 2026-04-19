"use client"

import { useEffect } from "react"

export default function ExtensionConflictHandler() {
  useEffect(() => {
    // Declare variables outside try-catch to ensure they're available in cleanup
    let originalConsoleError: typeof console.error
    let originalFetch: typeof window.fetch
    let observer: MutationObserver | null = null
    let handleWindowError: ((event: ErrorEvent) => boolean) | null = null

    const handleExtensionErrors = () => {
      // Prevent MetaMask detection attempts
      if (typeof window !== "undefined") {
        // Store original functions before modifying them
        originalConsoleError = console.error
        originalFetch = window.fetch

        try {
          // Define a dummy ethereum object that safely handles all operations
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
          console.error = (...args) => {
            const errorMessage = args.join(" ")
            if (
              errorMessage.includes("ChromeTransport") ||
              errorMessage.includes("MetaMask") ||
              errorMessage.includes("extension not found")
            ) {
              // Suppress the error
              return
            }
            originalConsoleError.apply(console, args)
          }
        } catch (error) {
          console.debug("Extension protection setup safely handled:", error)
        }

        // Monitor for extension-related network requests that might interfere
        window.fetch = function (...args) {
          try {
            // Block any MetaMask or extension-related fetches
            const url = args[0]?.toString() || ""
            if (url.includes("metamask") || url.includes("extension") || url.includes("chrome")) {
              console.debug("Blocked extension-related fetch:", url)
              return Promise.reject(new Error("Network request blocked for security"))
            }
            return originalFetch.apply(this, args)
          } catch (error) {
            if (
              error instanceof Error &&
              (error.message.includes("extension") ||
                error.message.includes("MetaMask") ||
                error.message.includes("Chrome"))
            ) {
              console.debug("Extension-related fetch error handled")
              return Promise.reject(new Error("Network request failed"))
            }
            throw error
          }
        }

        // Handle extension-related DOM mutations with improved safety
        observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              // Safely check if node is an Element and has the properties we need
              if (node instanceof Element) {
                try {
                  // Safely get className as string
                  const className = node.className
                  const classNameStr =
                    typeof className === "string"
                      ? className
                      : typeof className === "object" && className !== null && "baseVal" in className
                        ? String((className as { baseVal: string }).baseVal)
                        : String(className)

                  // Safely get id
                  const nodeId = node.id || ""

                  // Safely get data attributes
                  const dataExtension = node.getAttribute("data-extension") || ""

                  // Remove any extension-injected elements that might interfere
                  if (
                    nodeId.includes("metamask") ||
                    classNameStr.includes("extension") ||
                    dataExtension ||
                    classNameStr.includes("metamask")
                  ) {
                    console.debug("Extension element detected and isolated")
                    try {
                      node.remove()
                    } catch (removeError) {
                      console.debug("Could not remove extension element:", removeError)
                    }
                  }
                } catch (nodeError) {
                  console.debug("Error processing node:", nodeError)
                }
              }
            })
          })
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })

        // Intercept and handle window errors related to extensions
        handleWindowError = (event: ErrorEvent) => {
          if (
            event.message.includes("ChromeTransport") ||
            event.message.includes("MetaMask") ||
            event.message.includes("extension not found")
          ) {
            event.preventDefault()
            event.stopPropagation()
            return false
          }
          return true
        }

        window.addEventListener("error", handleWindowError, true)

        return () => {
          // Cleanup function with proper null checks
          if (observer) {
            observer.disconnect()
          }
          if (originalFetch) {
            window.fetch = originalFetch
          }
          if (handleWindowError) {
            window.removeEventListener("error", handleWindowError, true)
          }
          if (originalConsoleError) {
            console.error = originalConsoleError
          }
        }
      }

      // Return empty cleanup function if window is undefined
      return () => {}
    }

    const cleanup = handleExtensionErrors()

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  return null
}
