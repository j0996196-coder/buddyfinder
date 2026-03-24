// sw.js — ActivityHub Service Worker
const CACHE = "activityhub-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── INSTALL: pre-cache shell ──────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean old caches ────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH: network-first for API, cache-first for assets ──────────
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Always go network for API calls
  if (url.pathname.startsWith("/api/") || url.hostname !== self.location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Return a JSON error for API calls when offline
        if (e.request.headers.get("content-type")?.includes("application/json")) {
          return new Response(JSON.stringify({ error: "You are offline" }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      })
    );
    return;
  }

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          // Cache successful GET responses
          if (e.request.method === "GET" && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────
self.addEventListener("push", (e) => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "ActivityHub", {
      body:    data.body  || "You have a new notification",
      icon:    "/icons/icon-192.png",
      badge:   "/icons/icon-96.png",
      tag:     data.tag   || "activityhub",
      data:    data.url   || "/",
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    })
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data || "/";
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((ws) => {
      const existing = ws.find((w) => w.url === url);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

// ── BACKGROUND SYNC (resend failed messages) ──────────────────────
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-messages") {
    e.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // Read pending messages from IndexedDB and retry sending
  // (IndexedDB logic handled in main app)
  const clients_list = await clients.matchAll();
  clients_list.forEach((c) => c.postMessage({ type: "SYNC_MESSAGES" }));
}
