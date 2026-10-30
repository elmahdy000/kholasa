// Service Worker for El-Kholasa Web Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "منصة الخلاصة";
    const options = {
      body: data.body || "لديك إشعار جديد في منصة الخلاصة",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/icon-192x192.png",
      dir: "rtl",
      lang: "ar",
      vibrate: [100, 50, 100],
      data: {
        url: data.data?.url || "/dashboard",
      },
      tag: data.tag || "kholasa-push",
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Push event handling error:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an existing window is open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
