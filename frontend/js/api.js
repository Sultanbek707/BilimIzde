/* BilimIzde — серверге қосылу.
   Сайт ашылғанда /api/bootstrap-тан барлық мәліметті жүктейді, содан кейін app.js пен extras.js-ті іске қосады.
   Frontend бөлек хостингте тұрса, index.html-де window.BZ_API = 'https://сервер-адресі' деп көрсетіңіз. */
const API_BASE = (window.BZ_API || '').replace(/\/$/, '');

async function api(path, opts) {
  const r = await fetch(API_BASE + path, opts);
  if (!r.ok) { const e = new Error('API ' + r.status + ': ' + path); e.status = r.status; throw e; }
  return r.json();
}

/* Деректерді таңдалған тілге ауыстыру (атаулар, қалалар, пәндер, салалар) */
function translateData(d, lang) {
  const i = lang === 'ru' ? 0 : lang === 'en' ? 1 : -1;
  const T = d.i18n || {};
  // ЖОО-ның қазақша атауын (іздеу мен AI үшін) сақтап қоямыз
  d.universities.forEach(u => { u.name_kk = u.name; });
  d.majors.forEach(m => { m.name_kk = m.name; });
  if (i < 0) return;
  d.majors.forEach(m => {
    const t = (T.majors || {})[m.code]; if (t) m.name = t[i];
    const c = (T.combo || {})[m.combo]; if (c) m.combo = c[i];
  });
  d.universities.forEach(u => {
    const t = (T.universities || {})[u.code]; if (t) u.name = t[i];
    const c = (T.cities || {})[u.city]; if (c) u.city = c[i];
    if (window.BZ_T) { u.type = BZ_T(u.type); u.grantScore = BZ_T(u.grantScore); }
  });
  for (const k in d.fields) { const f = (T.fields || {})[k]; if (f) d.fields[k] = f[i]; }
  d.foreign.forEach(f => {
    const n = (T.foreign_names || {})[f.id]; if (n) f.kz = n[i];
    if (i === 1) { const c = (T.foreign_cities_en || {})[f.city]; if (c) f.city = c; }
    if (window.BZ_T) f.country = BZ_T(f.country);
  });
}

(async () => {
  const count = document.getElementById('count');
  if (count) count.textContent = 'Мәліметтер жүктелуде…';
  try {
    const d = await api('/api/bootstrap');
    translateData(d, window.BZ_LANG || 'kk');
    window.UX = d.university_extra;
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
