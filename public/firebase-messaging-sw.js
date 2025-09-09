// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyC8nFez_Ye_qT0kVxEYK7uhGB6oQRbRfU0",
    authDomain: "learnwise-r6us0.firebaseapp.com",
    projectId: "learnwise-r6us0",
    storageBucket: "learnwise-r6us0.appspot.com",
    messagingSenderId: "224206262515",
    appId: "1:224206262515:web:d5960f2bc62f97be5ba786"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
