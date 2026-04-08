/* Bump CACHE_NAME when you change caching rules so old caches are dropped. */
const CACHE_NAME = 'altar-v4'
const STATIC_SHELL = ['/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Supabase API: network-first, cache fallback — never pass undefined to respondWith.
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request)
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        } catch {
          const cached = await caches.match(event.request)
          if (cached) return cached
          return new Response(null, { status: 503, statusText: 'Network unavailable' })
        }
      })()
    )
    return
  }

  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone()
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            }
            return response
          })
      )
    )
    return
  }

  // HTML and app routes: network only. Never use caches.match fallback here — a cache miss
  // resolves to undefined and breaks navigation (ERR_FAILED after login, etc.).
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(fetch(event.request))
})
