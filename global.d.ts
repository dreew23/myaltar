/** Optional browser extension globals (not in default lib.dom). */
interface Window {
  ethereum?: unknown
  chrome?: {
    runtime?: { id?: string }
    [key: string]: unknown
  }
}
