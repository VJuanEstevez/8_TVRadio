const CACHE_NAME = "aire-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

const STREAM_PATTERN = /\.(m3u8|mp3|aac|ts|m4s|mp4|ogg|webm)(\?|$)/i;

function isStream(request, url) {
  return (
    ["audio", "video", "media"].includes(request.destination) || STREAM_PATTERN.test(url.pathname)
  );
}

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  const urls = new Set(APP_SHELL);

  try {
    const response = await fetch("./index.html");
    if (response.ok) {
      const html = await response.text();
      for (const match of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)) urls.add(match[1]);
    }
  } catch {
    /* La lectura del HTML es opcional: el shell mínimo ya está en APP_SHELL. */
  }

  await Promise.all([...urls].map((url) => cache.add(url).catch(() => undefined)));
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put("./index.html", response.clone());
    return response;
  } catch {
    return (await cache.match("./index.html")) ?? (await cache.match("./")) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const updated = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? updated;
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("aire-") && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.pathname.endsWith("/sw.js")) return;

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isStream(request, url)) return;

  event.respondWith(staleWhileRevalidate(request));
});
