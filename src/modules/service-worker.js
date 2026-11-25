const RELOAD_FLAG = 'aire-sw-cleanup-done';

/**
 * Removes service workers and caches left behind by older builds.
 * A stale worker can keep serving an outdated `main.js` from Cache Storage,
 * which produces null-reference errors and failed HMR connections.
 */
export async function clearObsoleteServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // An unregistered worker still controls this document until a reload.
    if (navigator.serviceWorker.controller && !window.sessionStorage.getItem(RELOAD_FLAG)) {
      window.sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    }
  } catch {
    /* Best effort: unavailable storage APIs must not break the app. */
  }
}
