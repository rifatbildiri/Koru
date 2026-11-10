/* Koru phone: keeps the program on the device so it opens without internet. Notes are never cached here. */
const VERSION = '1.7.3-503d9dc1e8e7';
const FILES = ["./","app.css","app.js","art/seoul-amber-olive-rain.gif","art/seoul-header-panorama-rain.webp","art/seoul-header-panorama.png","favicon.svg","fonts/workshop-0.ttf","fonts/workshop-1.ttf","fonts/workshop-2.ttf","fonts/workshop-3.ttf","fonts/workshop-4.ttf","fonts/workshop-5.ttf","fonts/workshop-6.ttf","fonts/workshop-7.ttf","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","index.html","koru/koru.svg","manifest.webmanifest"];
const CACHE = `koru-phone-${VERSION}`;
const INDEX = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // A partial update must never replace a working copy: addAll fails as a whole.
    await cache.addAll(FILES.map(file => new Request(new URL(file, self.registration.scope), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('koru-phone-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (request.mode === 'navigate') return (await cache.match(INDEX)) ?? fetch(request);
    return (await cache.match(request, { ignoreSearch: true })) ?? fetch(request);
  })());
});
