/* Bump CACHE_NAME when you change caching rules / icons so old caches are dropped. */
const CACHE_NAME = 'altar-v7'
const STATIC_SHELL = ['/manifest.json?v=7']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL).catch(() => undefined))
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

  // Icons + manifest: network-first so logo updates aren't stuck behind a stale SW cache.
  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request)
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
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

  // HTML and app routes: network only. Never use caches.match fallback here — a cache miss
  // resolves to undefined and breaks navigation (ERR_FAILED after login, etc.).
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(fetch(event.request))
})
