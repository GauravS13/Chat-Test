// Service Worker for Decentralized Game Room - Offline-First Design
// Memory optimization: minimal caching strategy, no heavy operations

const CACHE_NAME = 'decentralized-game-room-v1';
const CACHE_FILES = [
    '/',
    '/index.html',
    '/sw.js'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell files');
                return cache.addAll(CACHE_FILES);
            })
            .catch(error => {
                console.log('Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - cache-first strategy for app shell
self.addEventListener('fetch', (event) => {
    // Memory optimization: only handle GET requests
    if (event.request.method !== 'GET') return;
    
    // Memory optimization: only cache HTML and JS files
    const url = new URL(event.request.url);
    const isAppShell = url.pathname === '/' || 
                      url.pathname === '/index.html' || 
                      url.pathname === '/sw.js';
    
    if (isAppShell) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Return cached version if available
                    if (response) {
                        console.log('Serving from cache:', event.request.url);
                        return response;
                    }
                    
                    // Fetch from network and cache
                    return fetch(event.request)
                        .then(response => {
                            // Memory optimization: only cache successful responses
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(error => {
                            console.log('Network fetch failed:', error);
                            // Return cached version if network fails
                            return caches.match(event.request);
                        });
                })
        );
    } else {
        // For non-app shell files, try network first, fallback to cache
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
});

// Memory optimization: handle message events for memory management
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

// Memory optimization: minimal error handling
self.addEventListener('error', (event) => {
    console.log('Service Worker error:', event.error);
});

// Memory optimization: minimal unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
    console.log('Service Worker unhandled rejection:', event.reason);
});
