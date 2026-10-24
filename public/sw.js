
const CACHE_NAME = "vc-static-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/vc-round-logo.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("vc-static-") &&
              key !== CACHE_NAME,
          )
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        return cached || Response.error();
      }),
    );
    return;
  }

  const isNextStatic = url.pathname.startsWith(
    "/_next/static/",
  );

  const isBrandIcon = new Set(
    PRECACHE_URLS.slice(1),
  ).has(url.pathname);

  if (!isNextStatic && !isBrandIcon) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        return Response.error();
      }
    }),
  );
});

// --------------------------------------------------
// PUSH NOTIFICATIONS
// --------------------------------------------------

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};

      try {
        payload = event.data
          ? event.data.json()
          : {};
      } catch {
        payload = {
          body: event.data?.text() || "",
        };
      }

      const title =
        typeof payload.title === "string" &&
        payload.title.trim()
          ? payload.title
          : "Vaishnavi Collections";

      const body =
        typeof payload.body === "string"
          ? payload.body
          : "You have a new notification.";

      const notificationUrl =
        typeof payload.url === "string"
          ? payload.url
          : "/";

      let targetUrl = new URL(
        "/",
        self.location.origin,
      ).href;

      try {
        const candidate = new URL(
          notificationUrl,
          self.location.origin,
        );

        // Only allow navigation within our own website.
        if (candidate.origin === self.location.origin) {
          targetUrl = candidate.href;
        }
      } catch {
        // Keep the safe homepage destination.
      }

      const options = {
        body,
        icon: "/android-chrome-192x192.png",
        badge: "/vc-round-logo.png",
        tag:
          typeof payload.tag === "string"
            ? payload.tag
            : undefined,
        data: {
          url: targetUrl,
        },
      };

      await self.registration.showNotification(
        title,
        options,
      );
    })(),
  );
});

// --------------------------------------------------
// NOTIFICATION CLICK
// --------------------------------------------------

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      let targetUrl = new URL(
        "/",
        self.location.origin,
      ).href;

      try {
        const candidate = new URL(
          event.notification.data?.url || "/",
          self.location.origin,
        );

        if (candidate.origin === self.location.origin) {
          targetUrl = candidate.href;
        }
      } catch {
        // Keep the safe homepage destination.
      }

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Focus the exact destination if it is already open.
      for (const client of windows) {
        if (client.url === targetUrl) {
          await client.focus();
          return;
        }
      }

      // Otherwise open the destination in a new window/tab.
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
