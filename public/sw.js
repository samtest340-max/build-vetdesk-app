const CACHE_NAME = 'vetdesk-shell-v1'
const APP_SHELL = ['/manifest.webmanifest', '/icon-light-32x32.png', '/apple-icon.png']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})
