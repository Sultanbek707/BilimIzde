/* BilimIzde — грант есептегіш (2-нұсқа).
   Жалпы балл немесе пәндер бойынша балл, әр пәннің шекті балын тексеру, пәндер жұбы бойынша сүзгі,
   2026 жылғы грант саны, өткен жылғы өту балы бойынша мүмкіндік, салаға ортақ квота.
   extras.js-тегі window.calc функциясын ауыстырады. */
(() => {
const $ = id => document.getElementById(id);
const li = () => ({ kk: 0, ru: 1, en: 2 }[window.BZ_LANG || 'kk'] || 0);
const t3 = (kk, ru, en) => [kk, ru, en][li()];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n).toLocaleString('ru-RU').replace(/,/g, ' ');
const LS = { g(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, s(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ҰБТ 2026: пән, ең жоғары балл, шекті балл (gov.kz, testcenter.kz) */
const SUB = [
  ['hist', ['Қазақстан тарихы', 'История Казахстана', 'History of Kazakhstan'], 20, 5],
  ['read', ['Оқу сауаттылығы', 'Грамотность чтения', 'Reading literacy'], 10, 3],
  ['math', ['Математикалық сауаттылық', 'Математическая грамотность', 'Mathematical literacy'], 10, 3],
  ['p1', ['Бейіндік пән 1', 'Профильный предмет 1', 'Profile subject 1'], 50, 5],
  ['p2', ['Бейіндік пән 2', 'Профильный предмет 2', 'Profile subject 2'], 50, 5],
];
const thr = m => parseInt(m.grantScore);
const cre = m => (m.combo_kk || m.combo || '').startsWith('Шығарма');
const grants = c => { const b = (window.G26 || {})[c]; if (b) return { n: b[1], red: b[2], y: 2026 }; const a = (window.GC || {})[c]; return a ? { n: a[0], y: 2025 } : null; };
const passing = c => { const g = ((window.PS || {})[c] || {}).gen; if (!g) return null; const y = Math.max(...Object.keys(g).map(Number)); return { y, max: g[y][0], min: g[y][1] }; };
const chance = (m, s) => {
  const p = passing(m.code);
  if (!p) return { k: 'na', r: 2, t: t3('өту балы белгісіз', 'проходной неизвестен', 'passing score unknown') };
  if (s >= p.max) return { k: 'hi', r: 0, t: t3(`${p.y}: ең жоғары өту балынан жоғары`, `${p.y}: выше максимального проходного`, `${p.y}: above the top passing score`) };
  if (s >= p.min) return { k: 'mid', r: 1, t: t3(`${p.y}: ${p.min}–${p.max} аралығында`, `${p.y}: в диапазоне ${p.min}–${p.max}`, `${p.y}: within ${p.min}–${p.max}`) };
  return { k: 'lo', r: 3, t: t3(`${p.y}: ең төменгі өту балы ${p.min}`, `${p.y}: минимальный проходной ${p.min}`, `${p.y}: lowest passing score ${p.min}`) };
};
let LIM = 15;

function ui() {
  const box = $('calcOut'); if (!box || $('cxBox')) return;
  const st = LS.g('bz-calc', {});
  const pairs = [...new Map((window.majors || []).filter(m => m.combo_kk).map(m => [m.combo_kk, m.combo])).entries()].sort((a, b) => cre({ combo_kk: a[0] }) - cre({ combo_kk: b[0] }) || a[1].localeCompare(b[1]));
  $('score').closest('.row').insertAdjacentHTML('afterend', `<div id="cxBox" class="cx">
   <div class="cxt" role="tablist"><button type="button" data-m="sum" class="${st.mode !== 'sub' ? 'on' : ''}">${t3('Жалпы балл', 'Общий балл', 'Total score')}</button><button type="button" data-m="sub" class="${st.mode === 'sub' ? 'on' : ''}">${t3('Пәндер бойынша', 'По предметам', 'By subject')}</button></div>
   <div class="cxr"><input type="range" id="cxR" min="0" max="140" step="1" value="${LS.g('bz-score', 100)}" aria-label="${t3('ҰБТ балы', 'Балл ЕНТ', 'UNT score')}"><div class="cxq">${[70, 90, 100, 110, 120, 130].map(v => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div></div>
   <div class="cxs" ${st.mode === 'sub' ? '' : 'hidden'}>${SUB.map(([k, n, mx, mn]) => `<label>${n[li()]} <small>(0–${mx}, ${t3('шегі', 'порог', 'min')} ${mn})</small><input type="number" class="cxi" data-k="${k}" min="0" max="${mx}" value="${st.s && st.s[k] != null ? st.s[k] : ''}" placeholder="0–${mx}"></label>`).join('')}<div class="cxsum"></div></div>
   <div class="cxf"><label>${t3('Бейіндік пәндер жұбы', 'Пара профильных предметов', 'Profile subject pair')}<select id="cxPair"><option value="">${t3('Барлық жұп', 'Все пары', 'All pairs')}</option>${pairs.map(([k, v]) => `<option value="${esc(k)}" ${st.pair === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label></div>
  </div>`);
  const S = $('cxBox');
  const save = () => { const s = {}; S.querySelectorAll('.cxi').forEach(i => { if (i.value !== '') s[i.dataset.k] = +i.value; }); LS.s('bz-calc', { mode: S.querySelector('.cxt .on').dataset.m, s, pair: $('cxPair').value}); };
  S.querySelector('.cxt').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.querySelectorAll('.cxt button').forEach(x => x.classList.toggle('on', x === b)); S.querySelector('.cxs').hidden = b.dataset.m !== 'sub'; $('score').readOnly = b.dataset.m === 'sub'; save(); if (b.dataset.m === 'sub') subSum(); };
  S.querySelectorAll('.cxi').forEach(i => i.oninput = () => { subSum(); save(); });
  [$('cxPair')].forEach(x => x.onchange = () => { save(); if ($('score').value !== '') window.calc(); });
  if (st.mode === 'sub') { $('score').readOnly = true; subSum(true); }
  /* Тірі есептеу: балды жазғанда не жүгірткіні жылжытқанда нәтиже бірден жаңарады */
  const sc = $('score'), R = $('cxR'); let tm = 0;
  const live = () => { clearTimeout(tm); tm = setTimeout(() => { const v = parseInt(sc.value); if (!isNaN(v) && v >= 0 && v <= 140) window.calc(); }, 180); };
  sc.addEventListener('input', () => { const v = parseInt(sc.value); if (!isNaN(v) && v >= 0 && v <= 140) R.value = v; live(); });
  R.addEventListener('input', () => { if (sc.readOnly) return; sc.value = R.value; live(); });
  S.querySelector('.cxq').onclick = e => { const b = e.target.closest('button'); if (!b || sc.readOnly) return; sc.value = R.value = b.dataset.v; window.calc(); };
  if (sc.value === '' && st.mode !== 'sub') { const v = LS.g('bz-score', null); if (v != null) { sc.value = R.value = v; setTimeout(window.calc, 0); } }
}

/* Пәндер бойынша қосынды және шекті балл тексеру */
function subSum(silent) {
  const S = $('cxBox'); if (!S) return { ok: true, fails: [] };
  let tot = 0, filled = 0; const fails = [];
  SUB.forEach(([k, n, mx, mn]) => { const i = S.querySelector(`.cxi[data-k="${k}"]`); if (i.value === '') return; filled++; const v = Math.min(mx, Math.max(0, +i.value || 0)); tot += v; if (v < mn) fails.push(`${n[li()]}: ${v} < ${mn}`); });
  S.querySelector('.cxsum').innerHTML = filled ? `${t3('Жалпы', 'Итого', 'Total')}: <b>${tot}</b> / 140${fails.length ? ` · <span class="warn">${t3('Шекті балл жетпейді', 'Не набран порог', 'Below minimum')}: ${esc(fails.join(', '))}</span>` : ''}` : '';
  if (filled) $('score').value = tot;
  if (filled && !silent) window.calc();
  return { ok: !fails.length, fails, filled };
}

window.calc = function () {
  ui();
  const o = $('calcOut'), S = $('cxBox');
  const subMode = S && S.querySelector('.cxt .on').dataset.m === 'sub';
  const chk = subMode ? subSum(true) : { ok: true, fails: [] };
  const s = parseInt($('score').value);
  if (isNaN(s) || s < 0 || s > 140) { o.innerHTML = `<div class="cres"><p class="warn">${t3('0 мен 140 аралығындағы балды енгізіңіз.', 'Введите балл от 0 до 140.', 'Enter a score from 0 to 140.')}</p></div>`; return; }
  LS.s('bz-score', s);
  const pair = $('cxPair') ? $('cxPair').value : '';
  const PSx = window.PS || {}, MUx = window.MU || {}, U = window.universities || [];
  const uName = c => { const u = U.find(x => x.code === c); return u ? u.name : t3('ЖОО коды ', 'Вуз, код ', 'University code ') + c; };
  const pm = (c, k) => { const g = ((PSx[c] || {})[k] || {})['2026']; return g ? { max: g[0], min: g[1] } : null; };
  /* Таңдалған пәндер жұбындағы мамандықтар: шектік балдан өтуі және 2026 жылғы өту балы */
  const pool = (window.majors || []).filter(m => !pair || m.combo_kk === pair).filter(m => s >= thr(m));
  const rows = pool.map(m => ({ m, g: pm(m.code, 'gen'), r: pm(m.code, 'rural'), n: grants(m.code) })).filter(x => x.g);
  const pass = rows.filter(x => s >= x.g.min).sort((a, b) => (s - b.g.min) - (s - a.g.min) || ((b.n || {}).n || 0) - ((a.n || {}).n || 0));
  const near = rows.filter(x => s < x.g.min && x.g.min - s <= 10).sort((a, b) => a.g.min - b.g.min);
  const rural = rows.filter(x => s < x.g.min && x.r && s >= x.r.min).sort((a, b) => a.r.min - b.r.min);
  const unis = c => ((MUx[c] || {})['2026'] || []).filter(u => s >= u[1]).sort((a, b) => b[1] - a[1]);
  const row = (x, mode) => {
    const { m, g, r, n } = x, U2 = mode === 'pass' ? unis(m.code) : [];
    const tag = mode === 'pass' ? `<span class="tag hi">${s === g.min ? t3('өту балына тең', 'равен проходному', 'equals passing') : '+' + (s - g.min) + ' ' + t3('балл артық', 'выше', 'above')}</span>` : mode === 'near' ? `<span class="tag mid">${t3(`тағы ${g.min - s} балл`, `ещё ${g.min - s} б.`, `${g.min - s} more`)}</span>` : `<span class="tag mid">${t3('ауылдық квота', 'сельская квота', 'rural quota')}: ${r.min}</span>`;
    return `<div class="cpick"><a class="crow" href="#/major/${m.code}"><code>${m.code}</code><span>${esc(m.name)}<small class="cmeta">${t3('2026 өту балы', 'Проходной 2026', 'Passing 2026')}: ${g.min}–${g.max}${r ? ' · ' + t3('ауыл', 'село', 'rural') + ': ' + r.min : ''}</small></span><span class="g">${n ? t3(`${n.y}: ${fmt(n.n)} грант`, `${n.y}: ${fmt(n.n)} грантов`, `${n.y}: ${fmt(n.n)} grants`) : ''}</span>${tag}</a>${U2.length ? `<div class="cuni">${U2.slice(0, 6).map(u => `<a href="#/uni/${u[0]}" title="${esc(uName(u[0]))}">${esc(uName(u[0]).length > 34 ? uName(u[0]).slice(0, 32) + '…' : uName(u[0]))} <b>${u[1]}</b></a>`).join('')}${U2.length > 6 ? `<span>+${U2.length - 6}</span>` : ''}</div>` : ''}</div>`;
  };
  const head = (t, n) => `<h4 class="dsec">${t} <small>${n}</small></h4>`;
  o.innerHTML = `<div class="cres">
   ${chk.ok ? '' : `<p class="warn"><b>${t3('Назар аудар:', 'Внимание:', 'Note:')}</b> ${t3('бір пәннен шекті балл жиналмаса, грант конкурсына қатыса алмайсың', 'если по одному предмету не набран порог, участвовать в конкурсе нельзя', 'if you miss the minimum in any subject, you cannot enter the grant competition')} (${esc(chk.fails.join(', '))}).</p>`}
   ${pass.length ? head(t3('Балың 2026 жылғы өту балынан асатын мамандықтар', 'Специальности, где твой балл выше проходного 2026', 'Majors where your score beats the 2026 passing score'), pass.length) + `<p class="note">${t3('Астындағы тізім — балың сол ЖОО-ның 2026 жылғы ең төменгі өту балынан асатын университеттер (санды балл — сол ЖОО-ның өту балы).', 'Ниже — вузы, где твой балл выше их минимального проходного 2026 (число — проходной вуза).', 'Below each: universities whose 2026 lowest passing score you beat (number = that university’s passing score).')}</p><div class="clist">${pass.slice(0, LIM).map(x => row(x, 'pass')).join('')}</div>${pass.length > LIM ? `<button class="cmore" onclick="window.bzMore()">${t3(`Барлығын көрсету (${pass.length})`, `Показать все (${pass.length})`, `Show all (${pass.length})`)}</button>` : ''}`
     : `<p class="warn">${t3('Бұл пәндер жұбы бойынша балың 2026 жылғы жалпы конкурстың өту балына әзірге жетпейді. Төмендегі жақын мамандықтар мен ауылдық квотаны қара.', 'По этой паре предметов балл пока не дотягивает до проходного 2026 по общему конкурсу. Посмотри близкие специальности и сельскую квоту ниже.', 'With this subject pair your score does not yet reach any 2026 general passing score. See close majors and the rural quota below.')}</p>`}
   ${rural.length ? head(t3('Ауылдық квотамен мүмкін', 'Возможно по сельской квоте', 'Possible with the rural quota'), rural.length) + `<div class="clist">${rural.slice(0, 8).map(x => row(x, 'rural')).join('')}</div>` : ''}
   ${near.length ? head(t3('Аз ғана жетпейді (10 балға дейін)', 'Немного не хватает (до 10 баллов)', 'Just short (up to 10 points)'), near.length) + `<div class="clist">${near.slice(0, 8).map(x => row(x, 'near')).join('')}</div>` : ''}
   <p class="note">${t3('Өту балы — 2026 жылы грант алған соңғы талапкердің балы (күндізгі толық оқу, жалпы конкурс). Келесі жылы ол өзгеруі мүмкін. Дереккөз: ҒЖБМ — 2026-2027 оқу жылының грант иегерлерінің тізімі.', 'Проходной балл — балл последнего получившего грант в 2026 году (очное, общий конкурс). В следующем году может измениться. Источник: МНВО — список обладателей грантов 2026-2027.', 'Passing score = score of the last 2026 grant winner (full-time, general competition); it may change next year. Source: Ministry list of 2026–2027 grant holders.')}</p>
  </div>`;
};
window.calc.__bz = true;
window.bzMore = () => { LIM = 999; window.calc(); LIM = 15; };
if (document.readyState !== 'loading') setTimeout(ui, 0); else addEventListener('DOMContentLoaded', ui);
})();
