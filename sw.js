// Sadhana Site Records — lets the installed app open even with weak signal.
const CACHE = 'sde-app-v4';
const HOME = new URL('./', self.registration.scope).href;
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll([HOME]).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  const ok = same || /gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.href);
  if (!ok) return;
  // the app's "is there a new version?" check must always go to the network and is never stored
  if (same && u.searchParams.has('check')) return;
  // one saved copy per page of the app, whatever ?v=… it was opened with
  const key = same ? u.origin + u.pathname : r;
  // Always try for the latest version first; use the saved copy when there's no signal.
  // the app page itself: always ask the server whether it changed (no 10-minute browser cache), so a refresh gets the newest version
  const page = same && (r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html'));
  const req = page ? new Request(r.url, {cache: 'no-cache', credentials: 'same-origin'}) : r;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key).then(m => m || (r.mode === 'navigate' ? caches.match(HOME) : Response.error()))));
});
