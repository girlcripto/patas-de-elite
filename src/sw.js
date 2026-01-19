/**
 * Patas de Elite - Service Worker
 * Handles offline caching and asset management
 */

const CACHE_NAME = 'patas-de-elite-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/app.js',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap'
];

// Install Event - Cache assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
    self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// Fetch Event - Network first, then cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response.ok) {
                    const cache = caches.open(CACHE_NAME);
                    cache.then((c) => c.put(request, response.clone()));
                }
                return response;
            })
            .catch(() => {
                // Fall back to cache on network error
                return caches.match(request)
                    .then((response) => {
                        return response || createOfflineResponse();
                    });
            })
    );
});

// Offline Response Fallback
function createOfflineResponse() {
    return new Response(
        '<html><body><h1>Offline</h1><p>You are offline. Please check your connection.</p></body></html>',
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/html'
            })
        }
    );
}
