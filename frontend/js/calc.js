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
  box.insertAdjacentHTML('beforebegin', `<div id="cxBox" class="cx">
   <div class="cxt" role="tablist"><button type="button" data-m="sum" class="${st.mode !== 'sub' ? 'on' : ''}">${t3('Жалпы балл', 'Общий балл', 'Total score')}</button><button type="button" data-m="sub" class="${st.mode === 'sub' ? 'on' : ''}">${t3('Пәндер бойынша', 'По предметам', 'By subject')}</button></div>
   <div class="cxs" ${st.mode === 'sub' ? '' : 'hidden'}>${SUB.map(([k, n, mx, mn]) => `<label>${n[li()]} <small>(0–${mx}, ${t3('шегі', 'порог', 'min')} ${mn})</small><input type="number" class="cxi" data-k="${k}" min="0" max="${mx}" value="${st.s && st.s[k] != null ? st.s[k] : ''}" placeholder="0–${mx}"></label>`).join('')}<div class="cxsum"></div></div>
   <div class="cxf"><label>${t3('Бейіндік пәндер жұбы', 'Пара профильных предметов', 'Profile subject pair')}<select id="cxPair"><option value="">${t3('Барлық жұп', 'Все пары', 'All pairs')}</option>${pairs.map(([k, v]) => `<option value="${esc(k)}" ${st.pair === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
   <label class="cxc"><input type="checkbox" id="cxG" ${st.onlyG ? 'checked' : ''}> ${t3('Тек 2026 жылы гранты бар', 'Только с грантами 2026', 'Only with 2026 grants')}</label>
   <label class="cxc"><input type="checkbox" id="cxN" ${st.nat ? 'checked' : ''}> ${t3('Ұлттық ЖОО-ға түскім келеді', 'Хочу в национальный вуз', 'I want a national university')}</label></div>
  </div>`);
  const S = $('cxBox');
  const save = () => { const s = {}; S.querySelectorAll('.cxi').forEach(i => { if (i.value !== '') s[i.dataset.k] = +i.value; }); LS.s('bz-calc', { mode: S.querySelector('.cxt .on').dataset.m, s, pair: $('cxPair').value, onlyG: $('cxG').checked, nat: $('cxN').checked }); };
  S.querySelector('.cxt').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.querySelectorAll('.cxt button').forEach(x => x.classList.toggle('on', x === b)); S.querySelector('.cxs').hidden = b.dataset.m !== 'sub'; $('score').readOnly = b.dataset.m === 'sub'; save(); if (b.dataset.m === 'sub') subSum(); };
  S.querySelectorAll('.cxi').forEach(i => i.oninput = () => { subSum(); save(); });
  [$('cxPair'), $('cxG'), $('cxN')].forEach(x => x.onchange = () => { save(); if ($('score').value !== '') window.calc(); });
  if (st.mode === 'sub') { $('score').readOnly = true; subSum(true); }
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
  const pair = $('cxPair') ? $('cxPair').value : '', onlyG = $('cxG') && $('cxG').checked, nat = $('cxN') && $('cxN').checked;
  /* Шектік балы 50 болатын мамандықтар бойынша ұлттық ЖОО-лар үшін шек — 65 (ауыл шаруашылығы мен ветеринариядан басқа) */
  const need = m => { const t = thr(m); return nat && t === 50 && !['agr', 'vet'].includes(fieldOf(m.code)) ? 65 : t; };
  let pool = (window.majors || []).filter(m => !pair || m.combo_kk === pair);
  const reg = pool.filter(m => !cre(m)), creL = pool.filter(cre);
  let ok = reg.filter(m => s >= need(m)), no = reg.filter(m => s < need(m));
  const crOk = creL.filter(m => s >= need(m));
  let rows = ok.map(m => ({ m, c: chance(m, s), g: grants(m.code) }));
  if (onlyG) rows = rows.filter(r => r.g && r.g.n > 0);
  rows.sort((a, b) => a.c.r - b.c.r || ((b.g || {}).n || 0) - ((a.g || {}).n || 0));
  const near = no.map(m => ({ m, d: need(m) - s })).sort((a, b) => a.d - b.d).slice(0, 5);
  const Q = window.Q26 || {}, QN = window.Q26N || {};
  const fields = [...new Set(rows.map(r => fieldOf(r.m.code)).filter(Boolean))].filter(f => Q[f]);
  const totalG = rows.reduce((a, r) => a + ((r.g && r.g.y === 2026) ? r.g.n : 0), 0);
  const list = rows.slice(0, LIM).map(({ m, c, g }) => `<a class="crow" href="#/major/${m.code}"><code>${m.code}</code><span>${esc(m.name)}<small class="cmeta">${m.combo ? esc(m.combo) + ' · ' : ''}${t3('шегі', 'порог', 'min')} ${need(m)}</small></span><span class="g">${g ? t3(`${g.y}: ${fmt(g.n)} грант`, `${g.y}: ${fmt(g.n)} грантов`, `${g.y}: ${fmt(g.n)} grants`) : t3('грант жоқ', 'нет грантов', 'no grants')}</span><span class="tag ${c.k}">${c.t}</span></a>`).join('');
  o.innerHTML = `<div class="cres">
   ${chk.ok ? '' : `<p class="warn"><b>${t3('Назар аудар:', 'Внимание:', 'Note:')}</b> ${t3('бір пәннен шекті балл жиналмаса, жалпы балл жеткілікті болса да грант конкурсына қатыса алмайсың', 'если по одному предмету не набран порог, участвовать в конкурсе на грант нельзя, даже при достаточном общем балле', 'if you miss the minimum in any subject, you cannot enter the grant competition even with a high total')} (${esc(chk.fails.join(', '))}).</p>`}
   <p class="sum">${t3(`Балың <b>${s}</b>. Шектік балдан өтетін мамандықтар: <b>${ok.length}</b> / ${reg.length}`, `Твой балл <b>${s}</b>. Порог пройден по <b>${ok.length}</b> из ${reg.length} специальностей`, `Your score is <b>${s}</b>. You pass the threshold for <b>${ok.length}</b> of ${reg.length} majors`)}${pair ? t3(' (таңдалған пәндер жұбы бойынша)', ' (по выбранной паре предметов)', ' (for the selected subject pair)') : ''}.${crOk.length ? t3(` Шығармашылық емтиханы бар: <b>${crOk.length}</b>.`, ` С творческим экзаменом: <b>${crOk.length}</b>.`, ` With a creative exam: <b>${crOk.length}</b>.`) : ''}${totalG ? t3(` Бұл мамандықтарға 2026 жылы барлығы <b>${fmt(totalG)}</b> грант бөлінген.`, ` На эти специальности в 2026 году выделено всего <b>${fmt(totalG)}</b> грантов.`, ` These majors had <b>${fmt(totalG)}</b> grants in total in 2026.`) : ''}</p>
   ${rows.length ? `<div class="clist">${list}</div>${rows.length > LIM ? `<button class="cmore" onclick="window.bzMore()">${t3(`Барлығын көрсету (${rows.length})`, `Показать все (${rows.length})`, `Show all (${rows.length})`)}</button>` : ''}` : `<p class="warn">${t3('Бұл сүзгі бойынша шекке жететін мамандық жоқ. Ақылы бөлімді, ҰБТ-ны қайта тапсыруды немесе басқа пәндер жұбын қарастыр.', 'По этому фильтру нет специальностей с пройденным порогом. Рассмотри платное отделение, пересдачу ЕНТ или другую пару предметов.', 'No majors pass the threshold with this filter. Consider paid study, retaking the UNT or another subject pair.')}</p>`}
   ${near.length ? `<h4 class="dsec">${t3('Шекке жақын мамандықтар', 'Близко к порогу', 'Close to the threshold')}</h4><div class="chips">${near.map(({ m, d }) => `<a href="#/major/${m.code}"><span>${m.code} ${esc(m.name.length > 40 ? m.name.slice(0, 38) + '…' : m.name)} · +${d}</span></a>`).join('')}</div>` : ''}
   ${fields.length ? `<p class="note">${t3('Квота: 2026 жылы квоталық гранттар мамандыққа емес, бүкіл салаға ортақ бөлінді', 'Квота: в 2026 году квотные гранты распределены не по специальностям, а на всю отрасль', 'Quota: in 2026 quota grants were allocated per field, not per major')} — ${fields.map(f => `${esc(QN[f] || f)}: <b>${fmt(Q[f])}</b>`).join('; ')}.</p>` : ''}
   <p class="warn">${t3('Шектік балл — конкурсқа қатысу үшін ең төменгі балл ғана. Грантты балы ең жоғары үміткерлер алады, сондықтан грант саны көп мамандықта мүмкіндік көбірек.', 'Пороговый балл — лишь минимум для участия в конкурсе. Грант получают абитуриенты с самыми высокими баллами, поэтому чем больше грантов, тем выше шанс.', 'The threshold is only the minimum to enter the competition. Grants go to the highest scorers, so more grants means better odds.')}${nat ? t3(' Ұлттық ЖОО-лар үшін шектік балы 50 болатын мамандықтарда шек 65 деп есептелді; ауыл шаруашылығы мен ветеринария бойынша ұлттық ЖОО шегін ЖОО-дан нақтыла.', ' Для национальных вузов порог 50 заменён на 65; для сельского хозяйства и ветеринарии уточняй порог в вузе.', ' For national universities a threshold of 50 is counted as 65; for agriculture and veterinary, check the threshold with the university.') : ''} ${t3('2026 жылдан бастап ЖОО өз шектік балын немесе қосымша емтиханын белгілей алады.', 'С 2026 года вузы могут устанавливать собственный пороговый балл или дополнительный экзамен.', 'From 2026, universities may set their own threshold or an additional exam.')}</p>
   <p class="note">${t3('Дереккөз: ҚР Ғылым және жоғары білім министрлігі — 2026 жылғы шекті баллдар мен грант бөлу (№193 бұйрық); өту балдары: univision.kz.', 'Источник: Министерство науки и высшего образования РК — пороговые баллы и распределение грантов 2026 (приказ №193); проходные баллы: univision.kz.', 'Source: Ministry of Science and Higher Education — 2026 thresholds and grant allocation (order No. 193); passing scores: univision.kz.')}</p>
  </div>`;
};
window.calc.__bz = true;
window.bzMore = () => { LIM = 999; window.calc(); LIM = 15; };
if (document.readyState !== 'loading') setTimeout(ui, 0); else addEventListener('DOMContentLoaded', ui);
})();
