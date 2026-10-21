const CACHE_NAME = 'vetdesk-shell-v2'
const QUEUE_NAME = 'vetdesk-offline-requests'
const APP_SHELL = ['/manifest.webmanifest', '/icon-light-32x32.png', '/apple-icon.png']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

async function queueRequest(request) {
  const db = await openQueue()
  const body = request.method === 'GET' || request.method === 'HEAD' ? null : await request.clone().arrayBuffer()
  const headers = [...request.headers.entries()]
  await new Promise((resolve, reject) => { const tx = db.transaction(QUEUE_NAME, 'readwrite'); tx.objectStore(QUEUE_NAME).add({ url: request.url, method: request.method, headers, body }); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) })
  return new Response(JSON.stringify({ queued: true, offline: true }), { status: 202, headers: { 'content-type': 'application/json' } })
}
function openQueue() { return new Promise((resolve, reject) => { const request = indexedDB.open('vetdesk-offline', 1); request.onupgradeneeded = () => request.result.createObjectStore(QUEUE_NAME, { keyPath: 'id', autoIncrement: true }); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }) }
async function flushQueue() { const db = await openQueue(); const items = await new Promise((resolve, reject) => { const tx = db.transaction(QUEUE_NAME, 'readonly'); const request = tx.objectStore(QUEUE_NAME).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }); for (const item of items) { try { const response = await fetch(item.url, { method: item.method, headers: Object.fromEntries(item.headers), body: item.body }); if (!response.ok) continue; await new Promise(resolve => { const tx = db.transaction(QUEUE_NAME, 'readwrite'); tx.objectStore(QUEUE_NAME).delete(item.id); tx.oncomplete = resolve }) } catch {} } }
self.addEventListener('sync', event => { if (event.tag === 'vetdesk-sync') event.waitUntil(flushQueue()) })
self.addEventListener('message', event => { if (event.data?.type === 'SYNC_NOW') event.waitUntil(flushQueue()) })
self.addEventListener('online', () => { void flushQueue() })
self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method === 'GET' && request.url.startsWith(self.location.origin)) event.respondWith(fetch(request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); return response }).catch(() => caches.match(request).then(cached => cached || new Response('Offline', { status: 503 }))))
  else if (request.method !== 'GET' && request.url.startsWith(self.location.origin)) event.respondWith(fetch(request).catch(() => queueRequest(request)))
})
