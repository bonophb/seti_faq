const CACHE_PREFIX = 'seti-faq-';
const CACHE_NAME = CACHE_PREFIX + 'v7';
const LOCAL_ASSETS = [
  './', './index.html', './randomizer.html', './manifest.json',
  './icon-192.png', './icon-512.png',
  './shared.js', './faq.js', './randomizer.js'
];
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js'
];
const FAQ_URLS = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYjGO3WyNoP4Pg3AJ8neCz4GYD1o9wVOjWnxvyIGpmImV3KnERKDG3Q_1_TdtQxWGwC22E8CbM6SWf/pub?output=csv',
  'https://docs.google.com/spreadsheets/d/1H8VjQ4cSiOKzghHHUsna8KWBzVYm-YB-GPgj_haSr88/gviz/tq?tqx=out:csv'
];

// Cache only this app's resources, excluding tracking and non-GET requests.
function cacheKey(request) {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  url.searchParams.delete('_cb');
  url.searchParams.delete('_t');
  url.searchParams.sort();
  const href = url.href;
  const local = LOCAL_ASSETS.map(path => new URL(path, self.registration.scope).href);
  const allowed = [...local, ...EXTERNAL_ASSETS, ...FAQ_URLS].map(value => {
    const resource = new URL(value);
    resource.searchParams.sort();
    return resource.href;
  });
  return allowed.includes(href) ? href : null;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(LOCAL_ASSETS);
    // A CDN outage must not prevent installation of the local app shell.
    await Promise.allSettled(EXTERNAL_ASSETS.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function markDataSource(response, key, source) {
  if (!key.startsWith('https://docs.google.com/') || !response.ok) return response;
  const headers = new Headers(response.headers);
  headers.set('X-SETI-Data-Source', source);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function networkFirst(request, key) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let response;
  try {
    response = await fetch(request, { cache: 'no-store', signal: controller.signal });
    if (response.ok) {
      // Storage failure must not discard a successful network response.
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(key, response.clone());
      } catch (error) {}
      return markDataSource(response, key, 'network');
    }
  } catch (error) {
    // Offline or timed out: try the last successful response below.
  } finally {
    clearTimeout(timer);
  }
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(key);
    if (cached) return markDataSource(cached, key, 'cache');
  } catch (error) {}
  return response || Response.error();
}

self.addEventListener('fetch', event => {
  const key = cacheKey(event.request);
  if (key) event.respondWith(networkFirst(event.request, key));
});

