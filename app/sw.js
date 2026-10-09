/* Synthos: modo sin conexión. Versión 0a9ca72de8 */
const V = 'synthos-0a9ca72de8';
const CORE = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const CDN = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/;
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    // la página: primero internet (para tener la última versión); sin conexión, la copia guardada
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put('./', cp)); } return res; })
      .catch(() => caches.match('./').then((m) => m || caches.match(r))));
    return;
  }
  if (u.origin !== location.origin && !CDN.test(u.hostname)) return;
  // fuentes, librería 3D e íconos: copia guardada al instante y se actualiza en segundo plano
  e.respondWith(caches.open(V).then((c) => c.match(r).then((hit) => {
    const net = fetch(r).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
