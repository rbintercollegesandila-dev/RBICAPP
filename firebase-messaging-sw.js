// Import Firebase compatibility scripts into Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

// Initialize Firebase inside Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCSL9uPz5x52452JEvakeKZ55Qgvfryj24",
  projectId: "rambharose-inter-college",
  messagingSenderId: "1043303752475",
  appId: "1:1043303752475:web:20205c4b04faf93a3ae9be"
});

const messaging = firebase.messaging();

// Background message handler (Yeh band phone ya background app me notification bar trigger karega)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification ? payload.notification.title : (payload.data ? payload.data.title : 'RBIC Notice');
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : (payload.data ? payload.data.body : 'Naya update aaya hai.'),
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data || { url: '/portal.html#notifications' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click event (Notification par click karne par app open ho jayegi)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/portal.html#notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});