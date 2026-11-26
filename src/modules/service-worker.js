/** Registra el service worker de la app en producción. */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* La app sigue funcionando sin service worker. */
    });
  });
}
