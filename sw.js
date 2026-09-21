// Service Worker Self-Destruct & Cache Purge Script
// Cleanly unregisters any legacy service workers and purges all offline caches

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          console.log('[Service Worker] Purging cache:', cache);
          return caches.delete(cache);
        })
      );
    }).then(() => {
      return self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass all requests directly to the network
  event.respondWith(fetch(event.request));
});
