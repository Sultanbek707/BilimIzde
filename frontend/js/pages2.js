/* BilimIzde — «Сайт туралы» және «Өткен жылдардың грант нәтижелері» беттері.
   Деректер тек сайттың өз базасынан: majors, universities, GC (2025), G26 (2026), GY, PS, MU. */
(function () {
  const L = () => ({ kk: 0, ru: 1, en: 2 }[window.BZ_LANG || 'kk'] || 0);
  const t3 = (kk, ru, en) => [kk, ru, en][L()];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => (n == null || n === '' ? '—' : Number(n).toLocaleString('ru-RU'));
  const nm = m => esc(m.name);
  const uniName = c => { const u = (window.universities || []).find(x => x.code === c); return u ? u.name : c; };
  const uniCity = c => { const u = (window.universities || []).find(x => x.code === c); return u ? u.city : ''; };

  /* ===== Сайт туралы ===== */
  window.BZ_ABOUT = e => {
    const U = window.universities || [], M = window.majors || [], F = window.FOREIGN || [];
    const feat = [
      ['#/calc', t3('Грант есептегіш', 'Расчёт гранта', 'Grant calculator'), t3('Балың бойынша қай мамандыққа мүмкіндігің бар екенін көрсетеді.', 'Показывает, на какие специальности хватает баллов.', 'Shows which majors your score can reach.')],
      ['#/majors', t3('Мамандықтар', 'Специальности', 'Majors'), t3(`${M.length} мамандық тобы: пәндер, шектік балл, грант саны.`, `${M.length} групп программ: предметы, пороговый балл, гранты.`, `${M.length} program groups: subjects, thresholds, grants.`)],
      ['#/universities', t3('Университеттер', 'Университеты', 'Universities'), t3(`${U.length} ЖОО: мамандықтары, жатақхана, рейтинг, пікірлер.`, `${U.length} вузов: программы, общежитие, рейтинг, отзывы.`, `${U.length} universities: programs, dorms, rankings, reviews.`)],
      ['#/results', t3('Өткен жылдар', 'Прошлые годы', 'Past years'), t3('Грант саны мен өту балдарын өзің талдайтын кесте.', 'Таблица для самостоятельного анализа грантов и баллов.', 'A table to analyse past grants and scores yourself.')],
      ['#/abroad', t3('Шетелдік ЖОО', 'Зарубежные вузы', 'Study abroad'), t3(`${F.length} университет: оқу ақысы, талаптар, мерзімдер.`, `${F.length} вузов: стоимость, требования, сроки.`, `${F.length} universities: fees, requirements, deadlines.`)],
      ['#/ai', t3('AI кеңесші', 'AI-советник', 'AI advisor'), t3('Сайттағы деректер бойынша сұрағыңа жауап береді.', 'Отвечает на вопросы по данным сайта.', 'Answers questions using the site’s data.')],
    ];
    const src = [
      [t3('Мамандықтар, пәндер, шектік балл', 'Специальности, предметы, пороговый балл', 'Majors, subjects, thresholds'), 'testcenter.kz, gov.kz', 'https://www.testcenter.kz'],
      [t3('2025 және 2026 жылғы грант саны', 'Число грантов 2025 и 2026', '2025 and 2026 grant counts'), t3('ҒЖБМ бұйрықтары, univision.kz', 'Приказы МНВО, univision.kz', 'Ministry orders, univision.kz'), 'https://univision.kz'],
      [t3('Университеттер және мамандықтары', 'Вузы и их программы', 'Universities and programs'), t3('ЕПВО тізілімі, ЖОО ресми сайттары', 'Реестр ЕПВО, сайты вузов', 'EPVO registry, university websites'), 'https://epvo.kz'],
      [t3('Жатақхана және әскери кафедра', 'Общежитие и военная кафедра', 'Dorms and military department'), t3('ЖОО ресми сайттары (әр бетте сілтеме)', 'Сайты вузов (ссылка на каждой странице)', 'University websites (link on each page)'), ''],
      [t3('QS рейтингі', 'Рейтинг QS', 'QS rankings'), 'topuniversities.com', 'https://www.topuniversities.com'],
      [t3('Салалар бойынша жалақы', 'Зарплаты по отраслям', 'Salaries by sector'), 'stat.gov.kz', 'https://stat.gov.kz'],
      [t3('2026 жылғы өту балдары (Max/Min, ЖОО бойынша)', 'Проходные баллы 2026 (Max/Min, по вузам)', '2026 passing scores (max/min, by university)'), t3('ҒЖБМ: 2026-2027 оқу жылына арналған грант иегерлерінің тізімі', 'МНВО: список обладателей грантов на 2026-2027 уч. год', 'Ministry list of 2026-2027 grant holders'), 'https://www.gov.kz/memleket/entities/sci/press/news/details/1268738'],
      [t3('Шетелдік университеттер', 'Зарубежные вузы', 'Foreign universities'), t3('Университеттердің ресми сайттары', 'Официальные сайты вузов', 'Official university websites'), ''],
    ];
    const ico = { '#/calc': '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5v3"/>', '#/majors': '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>', '#/universities': '<path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>', '#/results': '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>', '#/abroad': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/>', '#/ai': '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>' };
    e.innerHTML = `<div class="ab2">
      <div class="ab-lead"><p>${t3('BilimIzde — Қазақстандағы ЖОО, мамандықтар және ҰБТ гранттары туралы ақпаратты бір жерге жинайтын портал. Мақсаты — талапкер мен ата-ана мамандықты, университетті және грант мүмкіндігін бір сайттан, түсінікті түрде көре алуы.', 'BilimIzde собирает в одном месте информацию о вузах Казахстана, специальностях и грантах ЕНТ, чтобы абитуриент и родители могли понятно сравнить специальности, вузы и шансы на грант.', 'BilimIzde brings together information on Kazakhstan’s universities, majors and UNT grants, so applicants and parents can compare majors, universities and grant chances in one clear place.')}</p>
        <div class="ab-st"><div><b>${U.length}</b><span>${t3('Қазақстан ЖОО-сы', 'вузов Казахстана', 'KZ universities')}</span></div><div><b>${M.length}</b><span>${t3('мамандық тобы', 'групп программ', 'program groups')}</span></div><div><b>${F.length}</b><span>${t3('шетелдік ЖОО', 'зарубежных вузов', 'foreign universities')}</span></div><div><b>3</b><span>${t3('тіл: қаз, орыс, ағыл', 'языка: каз, рус, англ', 'languages')}</span></div></div></div>
      <h3 class="ab-h">${t3('Сайтта не бар', 'Что есть на сайте', 'What’s inside')}</h3>
      <div class="ab-f">${feat.map(([h, t, d]) => `<a class="ab-c" href="${h}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico[h]}</svg><b>${t}</b><span>${d}</span></a>`).join('')}</div>
      <h3 class="ab-h">${t3('Деректер қайдан алынады', 'Откуда данные', 'Where the data comes from')}</h3>
      <div class="ab-tw"><table class="ab-t"><thead><tr><th>${t3('Дерек', 'Данные', 'Data')}</th><th>${t3('Дереккөз', 'Источник', 'Source')}</th></tr></thead><tbody>${src.map(([a, b, u]) => `<tr><td>${a}</td><td>${u ? `<a href="${u}" target="_blank" rel="noopener">${b}</a>` : b}</td></tr>`).join('')}</tbody></table></div>
      <div class="ab-n"><b>${t3('Маңызды', 'Важно', 'Important')}</b><p>${t3('Сайттағы мәліметтер анықтамалық сипатта. Құжат тапсырар алдында шарттарды, мерзімдерді және балдарды testcenter.kz, egov.kz және университеттің ресми сайтынан тексеріңіз. Нақты дерек табылмаған жерде «Белгісіз» немесе «—» деп жазылады.', 'Данные носят справочный характер. Перед подачей документов проверьте условия, сроки и баллы на testcenter.kz, egov.kz и сайте вуза. Где данных нет, стоит «Неизвестно» или «—».', 'Information is for reference. Before applying, check conditions, deadlines and scores on testcenter.kz, egov.kz and the university’s website. Missing data is marked “Unknown” or “—”.')}</p></div>
      <div class="ab-fb"><div><b>${t3('Қате таптыңыз ба?', 'Нашли ошибку?', 'Found a mistake?')}</b><span>${t3('Университет бетінде пікір қалдырыңыз немесе жиі қойылатын сұрақтарды қараңыз.', 'Оставьте отзыв на странице вуза или загляните в вопросы и ответы.', 'Leave a comment on a university page or check the FAQ.')}</span></div><a class="btn" href="#/faq">${t3('Сұрақ-жауап', 'Вопросы и ответы', 'FAQ')}</a></div>
      <p class="ab-cp">© 2026 BilimIzde</p></div>`;
  };

  /* ===== Өткен жылдардың грант нәтижелері ===== */
  const ST = { q: '', field: '', sort: 'g26', dir: -1, score: '', sel: '' };
  try { Object.assign(ST, JSON.parse(localStorage.getItem('bz-res') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('bz-res', JSON.stringify({ field: ST.field, score: ST.score, sort: ST.sort, dir: ST.dir })); } catch (e) {} };
  const g25 = c => ((window.GC || {})[c] || [])[0];
  const g26 = c => ((window.G26 || {})[c] || [])[1];
  const g24 = c => (((window.GY || {})[c] || {})[2024] || [])[0];
  const pmin = c => { const g = ((window.PS || {})[c] || {}).gen || {}; const y = Object.keys(g).map(Number).sort((a, b) => b - a)[0]; return y ? { y, max: g[y][0], min: g[y][1] } : null; };
  const rows = () => (window.majors || []).map(m => {
    const a = g25(m.code), b = g26(m.code), p = pmin(m.code);
    return { m, c: m.code, thr: parseInt(m.grantScore) || null, g24: g24(m.code), g25: a, g26: b, d: a && b ? Math.round((b - a) / a * 100) : null, min: p ? p.min : null, max: p ? p.max : null, py: p ? p.y : null, mu: !!((window.MU || {})[m.code]) };
  });

  window.BZ_RESULTS = e => {
    const R = rows(), fields = [...new Set((window.majors || []).map(m => m.field).filter(Boolean))];
    const FN = window.FIELDS || {};
    const sum = (k) => R.reduce((s, r) => s + (r[k] || 0), 0), s25 = sum('g25'), s26 = sum('g26');
    e.innerHTML = `<div class="rs">
      <p class="rs-lead">${t3('Әр мамандыққа бөлінген грант саны мен өту балдарын салыстырып, өзің талда. Бағанның атын басып сұрыпта, мамандықты басып толығырақ қара.', 'Сравнивай число грантов и проходные баллы по специальностям. Нажми на заголовок столбца для сортировки, на специальность — для деталей.', 'Compare grant counts and passing scores by major. Click a column to sort, a major for details.')}</p>
      <div class="rs-k">
        <div><span>${t3('2025 жылы гранттар', 'Грантов в 2025', 'Grants in 2025')}</span><b>${fmt(s25)}</b></div>
        <div><span>${t3('2026 жылы гранттар', 'Грантов в 2026', 'Grants in 2026')}</span><b>${fmt(s26)}</b><i class="${s26 >= s25 ? 'up' : 'dn'}">${s25 ? (s26 >= s25 ? '+' : '') + Math.round((s26 - s25) / s25 * 100) + '%' : ''}</i></div>
        <div><span>${t3('Мамандық тобы', 'Групп программ', 'Program groups')}</span><b>${R.length}</b></div>
        <div><span>${t3('Өту балы белгілі', 'Известен проходной', 'Passing score known')}</span><b>${R.filter(r => r.min != null).length}</b></div>
      </div>
      <div class="rs-f">
        <input id="rsQ" type="search" placeholder="${t3('Мамандық: B057 немесе атауы', 'Специальность: B057 или название', 'Major: B057 or name')}" value="${esc(ST.q)}" aria-label="${t3('Мамандық іздеу', 'Поиск', 'Search')}">
        <select id="rsF" aria-label="${t3('Сала', 'Область', 'Field')}"><option value="">${t3('Барлық сала', 'Все области', 'All fields')}</option>${fields.map(f => `<option value="${esc(f)}"${f === ST.field ? ' selected' : ''}>${esc((FN[f] && FN[f][0]) || f)}</option>`).join('')}</select>
        <label class="rs-sc">${t3('Менің балым', 'Мой балл', 'My score')}<input id="rsS" type="number" min="0" max="140" inputmode="numeric" value="${esc(ST.score)}" placeholder="—"></label>
      </div>
      <div class="rs-tw"><table class="rs-t"><thead><tr>
        <th data-k="c">${t3('Мамандық', 'Специальность', 'Major')}</th>
        <th data-k="thr" class="n">${t3('Шектік', 'Порог', 'Min.')}</th>
        <th data-k="g25" class="n">2025</th>
        <th data-k="g26" class="n">2026</th>
        <th data-k="d" class="n">${t3('Өзгеріс', 'Изм.', 'Change')}</th>
        <th data-k="min" class="n">${t3('Өту балы', 'Проходной', 'Passing')}</th>
      </tr></thead><tbody id="rsB"></tbody></table></div>
      <p class="rs-note">${t3('2025, 2026 — күндізгі толық оқуға бөлінген гранттар. «Өту балы» — грантқа түскендердің ең төменгі және ең жоғары балы (жалпы конкурс); 2026 жылғы өту балдары ҒЖБМ-нің грант иегерлері тізімінен есептелді; «—» деректің әлі жоқ екенін білдіреді.', '2025, 2026 — гранты на очное полное обучение. «Проходной» — минимальный и максимальный балл обладателей грантов (общий конкурс); проходные 2026 рассчитаны по списку обладателей грантов МНВО; «—» — данных пока нет.', '2025, 2026 are full-time grants. “Passing” is the lowest and highest score of grant winners (general competition); 2026 scores are computed from the Ministry’s list of grant holders; “—” means no data yet.')}</p>
      <div id="rsD"></div></div>`;
    const B = e.querySelector('#rsB'), D = e.querySelector('#rsD');
    const draw = () => {
      const q = ST.q.trim().toLowerCase(), sc = +ST.score || 0;
      let L = R.filter(r => (!ST.field || fo(r.c) === ST.field) && (!q || (r.c + ' ' + r.m.name).toLowerCase().includes(q)));
      L.sort((a, b) => { const k = ST.sort; if (k === 'c') return a.c.localeCompare(b.c) * ST.dir; const x = a[k], y = b[k]; if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1; return (x - y) * ST.dir; });
      e.querySelectorAll('.rs-t th').forEach(th => th.className = (th.dataset.k === 'c' ? '' : 'n') + (th.dataset.k === ST.sort ? (ST.dir > 0 ? ' asc' : ' desc') : ''));
      B.innerHTML = L.length ? L.map(r => {
        const ok = sc && r.thr ? (sc < r.thr ? 'lo' : r.min != null ? (sc >= r.min ? 'hi' : 'mid') : 'ok') : '';
        return `<tr data-c="${r.c}" class="${r.c === ST.sel ? 'on ' : ''}${ok ? 'sc-' + ok : ''}"><td><b>${r.c}</b> ${nm(r.m)}${r.mu ? ` <em class="rs-tag">${t3('ЖОО бойынша', 'по вузам', 'by university')}</em>` : ''}</td><td class="n">${r.thr || '—'}</td><td class="n">${fmt(r.g25)}</td><td class="n"><b>${fmt(r.g26)}</b></td><td class="n ${r.d == null ? '' : r.d >= 0 ? 'up' : 'dn'}">${r.d == null ? '—' : (r.d > 0 ? '+' : '') + r.d + '%'}</td><td class="n">${r.min != null ? `${r.min}–${r.max}` : '—'}</td></tr>`;
      }).join('') : `<tr><td colspan="6" class="rs-e">${t3('Бұл сүзгі бойынша мамандық табылмады.', 'По этому фильтру ничего не найдено.', 'No majors match this filter.')}</td></tr>`;
    };
    const detail = c => {
      const r = R.find(x => x.c === c); if (!r) { D.innerHTML = ''; return; }
      const mu = ((window.MU || {})[c] || {}), y = Object.keys(mu).sort().pop(), sc = +ST.score || 0;
      const list = y ? mu[y].slice().sort((a, b) => a[1] - b[1]) : [];
      const top = Math.max(1, ...[r.g24, r.g25, r.g26].filter(Boolean));
      D.innerHTML = `<div class="rs-d"><div class="rs-dh"><div><small>${r.c}</small><h3>${nm(r.m)}</h3><p>${esc(r.m.combo_kk || r.m.combo || '')} · ${t3('шектік балл', 'пороговый балл', 'threshold')} ${r.thr || '—'}</p></div><a class="btn" href="#/major/${r.c}">${t3('Мамандық беті', 'Страница специальности', 'Major page')}</a></div>
        <div class="rs-bars">${[[2024, r.g24], [2025, r.g25], [2026, r.g26]].map(([yy, v]) => `<div class="rs-bar"><span>${yy}</span><i style="--w:${v ? Math.round(v / top * 100) : 0}%"></i><b>${fmt(v)}</b></div>`).join('')}</div>
        ${list.length ? `<h4>${t3(`${y} жылы университеттер бойынша ең төменгі өту балы`, `Минимальный проходной балл по вузам, ${y}`, `Lowest passing score by university, ${y}`)}</h4><div class="rs-tw"><table class="rs-t rs-u"><thead><tr><th>${t3('Университет', 'Вуз', 'University')}</th><th class="n">${t3('Ең төменгі балл', 'Мин. балл', 'Min score')}</th><th class="n">${t3('Грант', 'Гранты', 'Grants')}</th></tr></thead><tbody>${list.map(([u, s, g]) => `<tr class="${sc ? (sc >= s ? 'sc-hi' : 'sc-lo') : ''}"><td>${/^\d{3}$/.test(u) ? `<a href="#/uni/${u}">${esc(uniName(u))}</a> <small>${esc(uniCity(u))}</small>` : esc(u)}</td><td class="n">${s}</td><td class="n">${fmt(g)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="rs-note">${t3('Бұл мамандық бойынша университеттер кесіндісіндегі өту балдары әзірге енгізілмеген.', 'Проходные баллы по вузам для этой специальности пока не внесены.', 'University-level passing scores for this major are not added yet.')}</p>`}</div>`;
      D.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    e.querySelector('#rsQ').oninput = ev => { ST.q = ev.target.value; draw(); };
    e.querySelector('#rsF').onchange = ev => { ST.field = ev.target.value; save(); draw(); };
    e.querySelector('#rsS').oninput = ev => { const v = ev.target.value; ST.score = v && (v < 0 || v > 140) ? '' : v; save(); draw(); if (ST.sel) detail(ST.sel); };
    e.querySelector('.rs-t thead').onclick = ev => { const th = ev.target.closest('th'); if (!th) return; const k = th.dataset.k; ST.dir = ST.sort === k ? -ST.dir : (k === 'c' ? 1 : -1); ST.sort = k; save(); draw(); };
    B.onclick = ev => { const tr = ev.target.closest('tr[data-c]'); if (!tr) return; ST.sel = tr.dataset.c; draw(); detail(ST.sel); };
    draw(); if (ST.sel) detail(ST.sel);
  };
  /* Скрипт кешірек жүктелсе, ашық тұрған бетті қайта салу */
  if (/^(about|results)$/.test(document.body.dataset.page || '') && typeof route === 'function') route();
})();
