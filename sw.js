// Service worker RELAFUN — membuat aplikasi bisa dipasang dan dipakai tanpa internet.
//
// VERSION 'dev' (saat pengembangan): network-first → perubahan kode langsung terlihat.
// Rilis (dibuat oleh tools/siapkan_rilis.py): VERSION = hash isi file, PRECACHE = semua file
// aplikasi, strategi cache-first → cepat dan berfungsi penuh secara offline.

const VERSION = '766a293e43';
const CACHE = `relafun-${VERSION}`;
const IS_DEV = VERSION === 'dev';

const PRECACHE = [
  // __PRECACHE_START__
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/components.css',
  './css/tokens.css',
  './js/app.js',
  './js/data.js',
  './js/math.js',
  './js/profile.js',
  './js/progress.js',
  './js/pwa.js',
  './js/router.js',
  './js/storage.js',
  './js/transition.js',
  './js/ui.js',
  './js/views/home.js',
  './js/views/masuk.js',
  './js/views/placeholder.js',
  './js/views/progres.js',
  './data/concepts.json',
  './data/misconceptions.json',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-192.png',
  './assets/icons/maskable-512.png',
  './assets/latar/ikan.svg',
  './assets/latar/laut.svg',
  './assets/maskot/bedah.svg',
  './assets/maskot/beranda.svg',
  './assets/maskot/kenali.svg',
  './assets/maskot/latihan.svg',
  './assets/maskot/literasi.svg',
  './assets/maskot/materi.svg',
  './assets/maskot/meluncur.svg',
  './assets/maskot/progres.svg',
  // __PRECACHE_END__
];

// Folder pengembang tidak pernah di-cache.
const EXCLUDED = ['/analysis/', '/tools/', '/docs/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))),
  );
  if (IS_DEV) self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('relafun-') && key !== CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Halaman meminta versi baru dipakai sekarang (tombol "Muat ulang" pada notifikasi pembaruan).
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (EXCLUDED.some((part) => url.pathname.includes(part))) return;

  // Aplikasi satu halaman (router hash): semua navigasi dilayani index.html.
  if (request.mode === 'navigate') {
    event.respondWith(IS_DEV ? networkFirst(request, './index.html') : cacheFirst('./index.html'));
    return;
  }
  if (url.pathname.includes('/data/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  event.respondWith(IS_DEV ? networkFirst(request) : cacheFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(fallbackUrl ?? request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(fallbackUrl ?? request, { ignoreSearch: true });
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}
