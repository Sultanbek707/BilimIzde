/* BilimIzde — серверге қосылу.
   Сайт ашылғанда /api/bootstrap-тан барлық мәліметті жүктейді, содан кейін app.js пен extras.js-ті іске қосады.
   Frontend бөлек хостингте тұрса, index.html-де window.BZ_API = 'https://сервер-адресі' деп көрсетіңіз. */
const API_BASE = (window.BZ_API || '').replace(/\/$/, '');

async function api(path, opts) {
  opts = opts || {};
  // Кірген қолданушы болса, токенді қосамыз (клуб, жоспар)
  if (window.BZ_AUTH_HEADERS && !(opts.headers && opts.headers.Authorization)) {
    try { opts.headers = Object.assign({}, opts.headers, await window.BZ_AUTH_HEADERS()); } catch (e) {}
  }
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
  d.majors.forEach(m => { m.name_kk = m.name; m.combo_kk = m.combo; });
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
    const o = (d.foreign_i18n || {})[f.id];
    if (o) {
      for (const k of ['country', 'city', 'address', 'status', 'tuition', 'tuition_note', 'deadlines', 'aid', 'entry', 'process']) if (o[k] != null) f[k] = o[k];
      if (o.sources) f.sources = f.sources.map((s, j) => [o.sources[j] || s[0], s[1]]);
      if (o.hist) d.foreign_history[f.id] = o.hist;
    } else if (window.BZ_T) f.country = BZ_T(f.country);
  });
}

(async () => {
  const count = document.getElementById('count');
  if (count) count.textContent = 'Мәліметтер жүктелуде…';
  try {
    const d = await api('/api/bootstrap?lang=' + encodeURIComponent(window.BZ_LANG || 'kk'));
    translateData(d, window.BZ_LANG || 'kk');
    window.UX = d.university_extra;
    // app.js бұрынғыдай осы атаулармен жұмыс істейді
    Object.assign(window, {
      majors: d.majors, universities: d.universities, FIELDS: d.fields, SITES: d.sites,
      SITE_EXTRA: d.site_extra, GC: d.grants_2025, GY: d.grants_other_years, G26: d.grants_2026,
      Q26: d.quotas_2026, Q26N: d.quota_names_2026, PS: d.passing_scores, MU: d.major_universities,
      FOREIGN: d.foreign, WIKI: d.foreign_wiki, HIST: d.foreign_history, FAQ: d.faq,
      BZ_AI: d.ai_enabled, BZ_CLUB_N: d.club_count,
      RANK: d.rankings, SAL: d.salaries,
    });
    for (const src of ['js/plan.js', 'js/test.js', 'js/more.js', 'js/app.js', 'js/extras.js', 'js/calc.js', 'js/auth.js', 'js/track.js']) {
      const s = document.createElement('script');
      s.src = src + '?v=20261120'; s.async = false;
      document.body.appendChild(s);
    }
  } catch (e) {
    console.error(e);
    if (count) count.textContent = 'Серверге қосылу мүмкін болмады. Бетті жаңартып көріңіз.';
  }
})();
