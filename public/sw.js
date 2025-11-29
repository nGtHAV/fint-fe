const CACHE_NAME = 'fint-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Fint PWA: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Fint PWA: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Fint PWA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseToCache = response.clone();
        
        if (response.status === 200) {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});
