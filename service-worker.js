const APP_CACHE_NAME = 'roomfolio-cache-v2'; // New version for app shell
const STATIC_ASSETS_CACHE_NAME = 'roomfolio-static-assets-v2'; // New version for external assets

const APP_SHELL_URLS = [
  '/Roomfolio/',
  '/Roomfolio/index.html',
  '/Roomfolio/style.css',
  '/Roomfolio/script.js',
  '/Roomfolio/manifest.json',
  '/Roomfolio/icon-192x192.png',
  '/Roomfolio/icon-512x512.png'
];

const STATIC_ASSET_URLS = [
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event: Caches all assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    Promise.all([
        caches.open(APP_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching App Shell');
            return cache.addAll(APP_SHELL_URLS);
        }),
        caches.open(STATIC_ASSETS_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching Static Assets');
            return cache.addAll(STATIC_ASSET_URLS);
        })
    ]).catch((error) => {
      console.error('[Service Worker] Cache addAll failed:', error);
    })
  );
});

// Fetch event: Serves from cache, falls back to network
self.addEventListener('fetch', (event) => {
    const { hostname } = new URL(event.request.url);

    // For external assets (fonts, icons), use a cache-first strategy
    if (hostname === 'fonts.googleapis.com' || hostname === 'cdnjs.cloudflare.com') {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    // Optionally, update the cache with the new version
                    return caches.open(STATIC_ASSETS_CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // For the app shell, serve from cache first
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [APP_CACHE_NAME, STATIC_ASSETS_CACHE_NAME]; 
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});