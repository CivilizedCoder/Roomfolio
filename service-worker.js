const CACHE_NAME = 'roomfolio-cache-v1'; // Increment this version number when you update your cached assets
const urlsToCache = [
  // IMPORTANT: For GitHub Pages, all paths must include your repository name
  '/Roomfolio/',             // The root of your app (index.html is implicitly covered)
  '/Roomfolio/index.html',   // Explicitly list your main HTML file
  '/Roomfolio/style.css',   // Your CSS file
  '/Roomfolio/script.js',    // Your JavaScript file
  '/Roomfolio/icon-192x192.png', // Your 192x192 icon
  '/Roomfolio/icon-512x512.png'  // Your 512x512 icon
  // Add any other static assets your app needs to function offline
  // e.g., other HTML pages, more images, fonts, etc.
];

// Install event: Caches all the assets listed in urlsToCache
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// Fetch event: Intercepts network requests and serves from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the asset is found in the cache, return it
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        // Otherwise, fetch from the network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        // You might want to serve a custom offline page here if the fetch fails
      })
  );
});

// Activate event: Cleans up old caches when the service worker is updated
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache version
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
