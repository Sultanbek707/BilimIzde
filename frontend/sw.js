/* BilimIzde service worker: сайт интернетсіз де ашылады (соңғы жүктелген нұсқа). */
const CACHE = 'bilimizde-v13';
const SHELL = ['/', '/index.html', '/css/style.css', '/js/i18n.js', '/js/api.js', '/js/plan.js', '/js/test.js', '/js/more.js', '/js/app.js', '/js/calc.js',
  '/js/extras.js', '/js/auth.js', '/js/reviews.js', '/js/pages2.js', '/js/track.js', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Тек /api/bootstrap кэштеледі (интернетсіз деректер), қалған API тікелей
  if (url.pathname.startsWith('/api/') && url.pathname !== '/api/bootstrap') return;
  // Алдымен желі, болмаса кэш — жаңа нұсқа әрқашан бірінші
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
  );
});
