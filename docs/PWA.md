# PWA and service worker

ALTAR registers a service worker (`public/sw.js`) from `components/pwa-register.tsx` so the app can be installable and use a small offline shell for icons and manifest.

## Design

- **Same-origin navigation** is handled with a **network-first** strategy so HTML and the Next.js app are not served from a stale cache by default.
- **Supabase** requests use network-first with cache fallback; failures return a 503 instead of calling `respondWith` with `undefined`.
- Bump `CACHE_NAME` in `public/sw.js` when you change caching rules so clients drop old caches.
- App shell now shows a global **offline banner** when `navigator.onLine` is false.
- Critical client writes are guarded while offline (journal, prayer tracker mutations, declaration counter writes).

## Update flow

- The app detects when a new service worker is waiting and shows an in-app **Update now** banner.
- Choosing **Update now** sends `SKIP_WAITING` to the worker and reloads once on `controllerchange`.
- Choosing **Later** dismisses the current prompt until a future update check.

## Install UX and shortcuts

- Install CTA appears when `beforeinstallprompt` is available.
- On iOS, where `beforeinstallprompt` is not supported, the CTA shows manual guidance: **Share -> Add to Home Screen**.
- The web app manifest includes shortcuts for:
  - Dashboard (`/app/dashboard`)
  - Prayer (`/app/prayer`)
  - Log Wisdom (`/app/journal?open=log`)

## If something looks “stuck” after a deploy

1. Hard refresh the tab, or open the site in a private window.
2. In Chrome: **Application → Service Workers → Unregister**, then reload.
3. Or **Settings → Privacy → Clear browsing data → Cached images and files** (and optionally “Site settings” / stored data for your domain).
4. On mobile installed PWA: remove the home-screen icon and add it again after visiting the live URL once in the browser.

## Disabling the service worker

If installability is not required, remove `<PWARegister />` from the root layout and delete or stop shipping `public/sw.js`. That is the most reliable way to avoid SW-related support issues.
