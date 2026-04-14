const VAPID_PUBLIC_KEY = 'BPq8swMerApXkBIkCaiugqctrT4zoP5KhxWyca5k9WuYMs49k75obEcSsPUdKqjdygcjIyWTKPjQdv6dBoXMAds';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('Service Worker registered:', registration);
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker available');
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function getPushSubscription(registration) {
  if (!registration) {
    return null;
  }

  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    return subscription;
  }

  try {
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return newSubscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

export async function subscribeToPush(registration) {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('Notification permission not granted');
    return null;
  }

  if (!registration) {
    registration = await registerServiceWorker();
  }

  if (!registration) {
    return null;
  }

  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  return subscription;
}

export async function unsubscribeFromPush(registration) {
  if (!registration) {
    return false;
  }

  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }

  return false;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4;
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function checkNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}