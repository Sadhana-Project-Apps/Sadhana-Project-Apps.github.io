// Sadhana Site Records — lets the installed app open even with weak signal.
const CACHE = 'sde-app-v2';
const HOME = new URL('./', self.registration.scope).href;
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll([HOME]).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || /gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.href);
  if (!ok) return;
  // Always try for the latest version first; use the saved copy when there's no signal.
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match(HOME) : Response.error()))));
});
