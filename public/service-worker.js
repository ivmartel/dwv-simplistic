// https://developers.google.com/web/fundamentals/primers/service-workers/
// chrome: chrome://inspect/#service-workers

const CACHE_NAME = 'dwv-simplistic-cache_v0.11.0-beta.0';
const urlsToCache = [
  './',
  './index.html',
  // js
  './register-sw.js',
  './dist/dwvsimplistic.min.js',
  './dist/dwvsimplistic.min.js.map',
  // images
  './assets/icons/icon-16.png',
  './assets/icons/icon-32.png',
  './assets/icons/icon-64.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-256.png',
  './assets/help/double_tap.png',
  './assets/help/tap_and_hold.png',
  './assets/help/tap.png',
  './assets/help/touch_drag.png',
  './assets/help/twotouch_drag.png',
  './assets/help/twotouch_pinch.png',

  // js: dwv workers (bundled next to the main script)
  './dist/jpeg2000.worker.min.js',
  './dist/jpeg2000.worker.min.js.map',
  './dist/jpegbaseline.worker.min.js',
  './dist/jpegbaseline.worker.min.js.map',
  './dist/jpegloss.worker.min.js',
  './dist/jpegloss.worker.min.js.map',
  './dist/labeling.worker.min.js',
  './dist/labeling.worker.min.js.map',
  './dist/resampling.worker.min.js',
  './dist/resampling.worker.min.js.map',
  './dist/rle.worker.min.js',
  './dist/rle.worker.min.js.map',
];

// install
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// fetch
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .match(event.request, {ignoreSearch: true})
      .then(function (response) {
        // cache hit: return response
        if (response) {
          return response;
        }
        // fetch on network
        return fetch(event.request);
      })
  );
});

// activate
self.addEventListener('activate', function (event) {
  // delete caches which name starts with the same root as this one
  let cacheRootName = CACHE_NAME;
  const uPos = cacheRootName.lastIndexOf('_');
  if (uPos !== -1) {
    cacheRootName = cacheRootName.substr(0, uPos);
  }

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME && cacheName.startsWith(cacheRootName)) {
            console.log('Deleting cache: ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
