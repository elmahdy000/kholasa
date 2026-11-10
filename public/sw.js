// El Kholasa PWA Service Worker
// Strategy:
//  - precache only public static shells (offline page, manifest, icons)
//  - cache-first for /_next/static/** (content-hashed), fonts and icons
//  - network-first for navigations; only public pages are cached, otherwise fall back to /offline
//  - never touch /api/** or non-GET requests (lessons for offline use live in IndexedDB)
const VERSION = "v6";
const STATIC_CACHE = `kholasa-static-${VERSION}`;
const PAGE_CACHE = `kholasa-pages-${VERSION}`;
const OFFLINE_MEDIA_CACHE = "el-kholasa-media-v1";
const CACHE_PREFIX = "kholasa-";

const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/apple-icon.png",
];
// Navigations to these paths may be stored; everything else (auth routes) is never cached.
const CACHEABLE_PAGES = new Set(["/", "/login", "/register", "/forgot-password", OFFLINE_URL]);

async function precache() {
  const cache = await caches.open(STATIC_CACHE);
  // Individual failures (e.g. a missing icon) must not abort installation.
  await Promise.all(
    PRECACHE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { credentials: "same-origin" });
        if (res.ok) await cache.put(url, res);
      } catch (_) {
        /* ignore */
      }
    })
  );

  // Cache the static assets the offline page needs so it renders without network.
  try {
    const res = await cache.match(OFFLINE_URL);
    if (res) {
      const html = await res.clone().text();
      const assets = new Set(html.match(/\/_next\/static\/[^"'\s\)]+/g) || []);
      await Promise.all(
        Array.from(assets).map(async (asset) => {
          try {
            const r = await fetch(asset);
            if (r.ok) await cache.put(asset, r);
          } catch (_) {
            /* ignore */
          }
        })
      );
    }
  } catch (_) {
    /* ignore */
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, PAGE_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && !keep.has(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    cache.put(request, response.clone());
  }
  return response;
}

async function offlineFallback() {
  const cache = await caches.open(STATIC_CACHE);
  return (
    (await cache.match(OFFLINE_URL)) ||
    new Response("لا يوجد اتصال بالإنترنت", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

async function handleNavigation(request) {
  const url = new URL(request.url);
  const cacheable = CACHEABLE_PAGES.has(url.pathname);
  try {
    const response = await fetch(request);
    if (cacheable && response.ok && response.type === "basic" && !response.redirected) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(url.pathname, response.clone());
    }
    return response;
  } catch (_) {
    // 1. Retry once after a brief 250ms pause for momentary network switch (e.g. ERR_NETWORK_CHANGED)
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const retryResponse = await fetch(request);
      if (retryResponse.ok) return retryResponse;
    } catch (_) {
      /* still offline */
    }

    // 2. Serve cached page if available for cacheable public routes
    if (cacheable) {
      const cache = await caches.open(PAGE_CACHE);
      const cached = await cache.match(url.pathname);
      if (cached) return cached;
    }

    // 3. If already on offline page, return cached offline HTML
    if (url.pathname === OFFLINE_URL) {
      return offlineFallback();
    }

    // 4. Redirect cleanly to /offline so the browser address bar matches the rendered view,
    // completely eliminating React hydration mismatch Error #418!
    return Response.redirect(OFFLINE_URL, 307);
  }
}

async function buildRangeResponseFromFull(cachedResponse, rangeHeader) {
  const fullBuffer = await cachedResponse.arrayBuffer();
  const size = fullBuffer.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || (match[1] === "" && match[2] === "")) {
    return cachedResponse;
  }

  let start;
  let end;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  const sliced = fullBuffer.slice(start, end + 1);
  const headers = new Headers(cachedResponse.headers);
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(sliced.byteLength));
  headers.set("Accept-Ranges", "bytes");

  return new Response(sliced, {
    status: 206,
    statusText: "Partial Content",
    headers,
  });
}

async function handleOfflineMediaRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.ok || networkResponse.status === 206)) {
      return networkResponse;
    }
  } catch {
    // Fall back to cached offline media when network is unavailable.
  }

  const mediaCache = await caches.open(OFFLINE_MEDIA_CACHE);
  const cached = await mediaCache.match(request.url);
  if (cached) {
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      return buildRangeResponseFromFull(cached, rangeHeader);
    }
    return cached;
  }

  return new Response(
    JSON.stringify({
      error: "الملف غير محفوظ أوفلاين — افتح الدرس مع وجود إنترنت واضغط حفظ أوفلاين أولاً.",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/media/")) {
    event.respondWith(handleOfflineMediaRequest(request));
    return;
  }
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    /^\/(icon|apple-icon)[^/]*\.png$/.test(url.pathname) ||
    url.pathname === "/manifest.json" ||
    /\.(?:woff2?|ttf|otf)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request));
  }
  // Everything else (RSC payloads, uploads, images) goes straight to the network.
});
