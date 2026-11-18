/* BilimIzde — қарапайым аналитика: қай бет ашылды, не ізделді. IP мен жеке дерек жиналмайды. */
(function () {
  const lang = window.BZ_LANG || 'kk';
  const send = (kind, value) => {
    if (!value) return;
    try {
      const body = JSON.stringify({ kind, value: String(value).slice(0, 120), lang });
      (navigator.sendBeacon && navigator.sendBeacon(API_BASE + '/api/track', new Blob([body], { type: 'application/json' })))
        || fetch(API_BASE + '/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    } catch (e) {}
  };
  const page = () => send('page', (location.hash || '#/').replace(/^#/, '').replace(/\/h$/, '') || '/');
  addEventListener('hashchange', page); page();
  // Іздеу: 1.2 секунд жазбай тұрса, бір рет жібереміз
  let t; const q = document.getElementById('q');
  if (q) q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => q.value.trim().length > 1 && send('search', q.value.trim()), 1200); });
  // AI сұрақтары
  const ai = document.getElementById('aiIn');
  if (ai) ai.addEventListener('keydown', e => { if (e.key === 'Enter' && ai.value.trim()) send('ai', ai.value.trim()); });
  // PWA: service worker
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
