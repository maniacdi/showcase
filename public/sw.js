/*
 * Showcase service worker (hand-written, no Workbox).
 *
 * - Precache: the main demo pages and the localised /offline page.
 * - Pages (navigations): network-first; fall back to the cached copy, then
 *   to /offline (or /en/offline).
 * - Static assets and images (_next/static, /images, /icons, fonts):
 *   cache-first, filled on first use.
 * - Everything else (APIs, RSC payloads, cross-origin): network, with the
 *   cached copy only as an offline fallback for same-origin RSC payloads.
 *
 * Bump VERSION to drop old caches after changing this file.
 * Registered from src/components/pwa/ServiceWorkerRegister.tsx (production,
 * or any environment with ?sw=1; ?sw=0 unregisters it).
 */
const VERSION = "v1";
const PAGES = `showcase-pages-${VERSION}`;
const STATIC = `showcase-static-${VERSION}`;
const PRECACHE = ["/", "/tienda", "/reservas", "/servicios", "/offline", "/en/offline"];
const MAX_PAGES = 40;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((cache) =>
      // One failing URL must not abort the install.
      Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("showcase-") && k !== PAGES && k !== STATIC)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStatic(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:css|js|woff2?|png|jpe?g|webp|avif|gif|svg|ico)$/.test(url.pathname)
  );
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const precached = new Set(PRECACHE.map((p) => new URL(p, self.location.origin).href));
  const extra = keys.filter((k) => !precached.has(k.url));
  for (let i = 0; i < extra.length - max; i++) await cache.delete(extra[i]);
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") cache.put(request, res.clone());
  return res;
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok && res.type === "basic") {
      cache.put(request, res.clone()).then(() => trim(PAGES, MAX_PAGES));
    }
    return res;
  } catch {
    const hit =
      (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
    if (hit) return hit;
    const path = new URL(request.url).pathname;
    const offline = path === "/en" || path.startsWith("/en/") ? "/en/offline" : "/offline";
    return (
      (await cache.match(offline)) ||
      new Response("Sin conexión / Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function networkWithCacheFallback(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok && res.type === "basic") cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Dev tooling and the SW itself always go to the network.
  if (url.pathname.startsWith("/_next/webpack-hmr") || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }
  // Client-side navigations fetch RSC payloads (header RSC: 1 / ?_rsc=).
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
    event.respondWith(networkWithCacheFallback(request));
    return;
  }
  if (isStatic(url)) {
    event.respondWith(cacheFirst(request));
  }
});
