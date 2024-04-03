/* global Promise */

// https://developers.google.com/web/fundamentals/primers/service-workers/
// chrome: chrome://inspect/#service-workers

var CACHE_NAME = 'dwv-simplistic-cache_v0.9.0-beta.0';
var urlsToCache = [
  './',
  './index.html',
  // css
  './css/style.css',
  // js
  './src/applauncher.js',
  './src/appgui.js',
  './src/register-sw.js',
  './src/gui/dropboxLoader.js',
  // images
  './resources/icons/icon-16.png',
  './resources/icons/icon-32.png',
  './resources/icons/icon-64.png',
  './resources/icons/icon-128.png',
  './resources/icons/icon-256.png',
  './resources/help/double_tap.png',
  './resources/help/tap_and_hold.png',
  './resources/help/tap.png',
  './resources/help/touch_drag.png',
  './resources/help/twotouch_drag.png',
  './resources/help/twotouch_pinch.png',

  // third party

  // js: dwv
  './node_modules/dwv/dist/dwv.min.js',
  './node_modules/jszip/dist/jszip.min.js',
  // js: decoders
  './node_modules/dwv/decoders/dwv/rle.js',
  './node_modules/dwv/decoders/dwv/decode-rle.js',
  './node_modules/dwv/decoders/pdfjs/jpx.js',
  './node_modules/dwv/decoders/pdfjs/arithmetic_decoder.js',
  './node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js',
  './node_modules/dwv/decoders/pdfjs/util.js',
  './node_modules/dwv/decoders/pdfjs/jpg.js',
  './node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  './node_modules/dwv/decoders/rii-mango/lossless-min.js',
  './node_modules/dwv/decoders/rii-mango/decode-jpegloss.js'
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
  var cacheRootName = CACHE_NAME;
  var uPos = cacheRootName.lastIndexOf('_');
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
