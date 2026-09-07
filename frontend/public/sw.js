// ========================================================
// TERANGA FOOD — SERVICE WORKER PWA LUXURY OFFLINE-READY
// Version: 5.0.0 (Cloud Aiven MySQL Integration & Serverless API Direct Sync)
// ========================================================

const CACHE_NAME = 'teranga-pwa-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.svg',
  '/favicon.svg'
];

// Installation : Mise en cache ultra-rapide du shell d'application
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage des anciennes versions de caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de requêtes intelligente
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Ne pas intercepter les requêtes non-GET ou externes
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 2. Ne JAMAIS cacher les appels API ou WebSockets en temps réel (Network Only)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    return;
  }

  // 3. Navigation HTML (pages) : Network-First avec fallback vers le cache pour fonctionnement 100% hors-ligne
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Hors-ligne : servir la coquille de l'application (SPA)
          return caches.match('/index.html').then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 4. Fichiers statiques (JS, CSS, images, polices Google Fonts) : Stale-While-Revalidate
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('res.cloudinary.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => null);

        // Renvoie immédiatement le cache si disponible, sinon attend le réseau
        return cachedResponse || fetchPromise;
      })
    );
  }
});
