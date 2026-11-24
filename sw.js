/**
 * SERVICE WORKER: CACHE SHELL FOR OFFLINE PWA
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 */

const CACHE_NAME = 'yiqul-portal-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './bundle.css',
  './bundle.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './src/styles/style.css',
  './src/styles/landing.css',
  './src/app.js',
  './src/data/defaultApps.js',
  './src/services/storage.js',
  './src/services/sanitizer.js',
  './src/services/security.js',
  './src/services/analytics.js',
  './src/services/uploader.js',
  './src/services/cloudSync.js',
  './src/services/firebaseService.js',
  './src/components/Header.js',
  './src/components/SearchRibbon.js',
  './src/components/AppCard.js',
  './src/components/BentoGrid.js',
  './src/components/ModalViewer.js',
  './src/components/AdminPanel.js',
  './src/components/BannerSlider.js',
  './src/components/FileUploader.js',
  './src/components/LandingHero.js',
  './src/components/LandingFeatures.js',
  './src/components/PwaInstallPrompt.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets shell...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET http/https lokal
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic responses jika valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback jika offline
        return caches.match('./index.html');
      });
    })
  );
});
