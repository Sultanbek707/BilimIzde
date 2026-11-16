/* BilimIzde — серверге қосылу.
   Сайт ашылғанда /api/bootstrap-тан барлық мәліметті жүктейді, содан кейін app.js пен extras.js-ті іске қосады.
   Frontend бөлек хостингте тұрса, index.html-де window.BZ_API = 'https://сервер-адресі' деп көрсетіңіз. */
const API_BASE = (window.BZ_API || '').replace(/\/$/, '');

async function api(path, opts) {
  const r = await fetch(API_BASE + path, opts);
  if (!r.ok) { const e = new Error('API ' + r.status + ': ' + path); e.status = r.status; throw e; }
  return r.json();
}

(async () => {
  const count = document.getElementById('count');
  if (count) count.textContent = 'Мәліметтер жүктелуде…';
  try {
    const d = await api('/api/bootstrap');
    // app.js бұрынғыдай осы атаулармен жұмыс істейді
    Object.assign(window, {
      majors: d.majors, universities: d.universities, FIELDS: d.fields, SITES: d.sites,
      SITE_EXTRA: d.site_extra, GC: d.grants_2025, GY: d.grants_other_years, G26: d.grants_2026,
      Q26: d.quotas_2026, Q26N: d.quota_names_2026, PS: d.passing_scores, MU: d.major_universities,
      FOREIGN: d.foreign, WIKI: d.foreign_wiki, HIST: d.foreign_history, FAQ: d.faq,
      BZ_AI: d.ai_enabled, BZ_CLUB_N: d.club_count,
    });
    for (const src of ['js/app.js', 'js/extras.js']) {
      const s = document.createElement('script');
      s.src = src; s.async = false;
      document.body.appendChild(s);
    }
  } catch (e) {
    console.error(e);
    if (count) count.textContent = 'Серверге қосылу мүмкін болмады. Бетті жаңартып көріңіз.';
  }
})();
