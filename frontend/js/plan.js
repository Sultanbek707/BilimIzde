/* BilimIzde — «Менің жоспарым» және грант мүмкіндігінің бағасы.
   Жоспар осы құрылғыда (localStorage) сақталады, кірген қолданушыда серверге де синхрондалады (auth.js). */
(function () {
  const LS = {
    g(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    s(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = s => (window.BZ_T ? BZ_T(s) : s);

  const getPlan = () => Object.assign({ majors: [], unis: [] }, LS.g('bz-plan', {}));
  const setPlan = p => { LS.s('bz-plan', p); window.dispatchEvent(new CustomEvent('bz-plan-change', { detail: p })); };
  window.BZ_PLAN_GET = getPlan;
  window.BZ_PLAN_SET = setPlan;
  const score = () => { const v = LS.g('bz-score', null); return typeof v === 'number' ? v : null; };

  /* ---- Мүмкіндік бағасы ---- */
  const range = s => { const m = String(s || '').match(/(\d+)\s*-\s*(\d+)/); return m ? [+m[1], +m[2]] : null; };
  const LEVEL = {
    high: ['Жоғары', 'hi'], mid: ['Орташа', 'mid'], low: ['Төмен', 'low'], none: ['Шекке жетпейді', 'no'], unk: ['Дерек жоқ', 'unk'],
  };
  const badge = lv => `<b class="chance ${LEVEL[lv][1]}">${LEVEL[lv][0]}</b>`;
  // ЖОО бойынша: грантқа түскендердің балл ауқымы [min, max]
  function uniChance(sc, u) {
    const r = range(u.grantScore); if (!r || sc == null) return 'unk';
    const [lo, hi] = r; if (sc < lo) return 'low';
    return sc >= lo + (hi - lo) * 0.5 ? 'high' : 'mid';
  }
  // Мамандық бойынша: шектік бал + белгілі болса өту балдары
  function majorChance(sc, m) {
    if (sc == null) return 'unk';
    if (sc < +m.grantScore) return 'none';
    const ps = (window.PS || {})[m.code];
    const g = ps && ps.gen && Object.values(ps.gen).slice(-1)[0];
    if (!g) return 'unk';
    const [mx, mn] = g; // [max, min]
    if (sc < mn) return 'low';
    return sc >= mn + (mx - mn) * 0.4 ? 'high' : 'mid';
  }
  // Нақты жұп: мамандық + ЖОО (өткен жылғы өту балы белгілі болса)
  function pairPassing(code, uc) {
    const mu = (window.MU || {})[code]; if (!mu) return null;
    const y = Object.keys(mu).sort().pop();
    const row = (mu[y] || []).find(r => r[0] === uc);
    return row ? { year: y, pass: row[1], grants: row[2] } : null;
  }
  function pairChance(sc, p) { if (sc == null || !p) return 'unk'; return sc >= p.pass + 5 ? 'high' : sc >= p.pass - 3 ? 'mid' : 'low'; }
  window.BZ_CHANCE = { uniChance, majorChance, pairPassing, pairChance, badge };

  /* ---- Жоспар беті ---- */
  const UXU = c => ((window.UX || {}).universities || {})[c] || {};
  function render(e) {
    const p = getPlan(), sc = score();
    const M = p.majors.map(c => majors.find(m => m.code === c)).filter(Boolean);
    const U = p.unis.map(c => universities.find(u => u.code === c)).filter(Boolean);
    const empty = !M.length && !U.length;
    const scoreBox = `<div class="plan-score"><label>ҰБТ балың <input id="plScore" type="number" min="0" max="140" value="${sc ?? ''}" placeholder="мысалы 110"></label>
      <button class="btn" id="plSave">Сақтау</button><span class="note">Балды енгізсең, әр ЖОО мен мамандыққа грант мүмкіндігін бағалаймын</span></div>`;
    const addBox = `<div class="plan-add"><input id="plQ" list="plList" placeholder="ЖОО немесе мамандық қосу: атауы, коды, шифры (B057)"><datalist id="plList">${
      majors.map(m => `<option value="${m.code} ${esc(m.name)}">`).join('')}${universities.map(u => `<option value="${u.code} ${esc(u.name)}">`).join('')}</datalist>
      <button class="btn" id="plAdd">Жоспарға қосу</button></div>`;
    let html = scoreBox + addBox;
    if (empty) {
      html += `<div class="nodata"><p><b>Жоспарың әзірге бос.</b></p><p>ЖОО немесе мамандық бетіндегі «＋ Жоспарға қосу» батырмасын бас немесе жоғарыдағы жолға атауын жаз. Таңдағандарың, олардың шектік балы, грант мүмкіндігі және түсу мерзімдері осы жерге жиналады.</p></div>`;
    }
    if (M.length) {
      html += `<h4 class="dsec">Мамандықтар <small>${M.length}</small></h4><div class="tw"><table class="ptable"><thead><tr><th>Шифр</th><th>Мамандық</th><th>Шектік бал</th><th>Грант 2026</th><th>Мүмкіндік</th><th></th></tr></thead><tbody>${
        M.map(m => { const g = (window.G26 || {})[m.code]; return `<tr><td><a href="#/major/${m.code}"><b>${m.code}</b></a></td><td>${esc(m.name)}</td><td>${m.grantScore}</td><td>${g ? g[0].toLocaleString('ru-RU') : '—'}</td><td>${badge(majorChance(sc, m))}</td><td><button class="xbtn" data-rm="m:${m.code}" aria-label="Алып тастау">✕</button></td></tr>`; }).join('')}</tbody></table></div>`;
    }
    if (U.length) {
      html += `<h4 class="dsec">Университеттер <small>${U.length}</small></h4><div class="tw"><table class="ptable"><thead><tr><th>Код</th><th>ЖОО</th><th>Қала</th><th>Грант балдары</th><th>Оқу ақысы</th><th>Жатақхана</th><th>Мүмкіндік</th><th></th></tr></thead><tbody>${
        U.map(u => { const x = UXU(u.code); return `<tr><td><a href="#/uni/${u.code}"><b>${u.code}</b></a></td><td>${esc(u.name)}</td><td>${esc(u.city)}</td><td>${u.grantScore}</td><td>${u.tuition}</td><td>${x.dorm ? 'Бар' : '—'}</td><td>${badge(uniChance(sc, u))}</td><td><button class="xbtn" data-rm="u:${u.code}" aria-label="Алып тастау">✕</button></td></tr>`; }).join('')}</tbody></table></div>`;
    }
    if (M.length && U.length) {
      const pairs = [];
      M.forEach(m => U.forEach(u => {
        const offered = (UXU(u.code).programs || []).includes(m.code);
        pairs.push({ m, u, offered, pp: pairPassing(m.code, u.code) });
      }));
      html += `<h4 class="dsec">Мамандық × ЖОО</h4><p class="note">Таңдаған мамандығың таңдаған университетіңде бар ма және өткен жылғы өту балы қандай</p><div class="tw"><table class="ptable"><thead><tr><th>Мамандық</th><th>ЖОО</th><th>Оқытыла ма</th><th>Өту балы</th><th>Мүмкіндік</th></tr></thead><tbody>${
        pairs.map(({ m, u, offered, pp }) => `<tr><td>${m.code}</td><td>${esc(u.name)}</td><td>${offered ? '✓ Иә' : '✕ Жоқ'}</td><td>${pp ? `${pp.pass} (${pp.year})` : '—'}</td><td>${offered ? badge(pp ? pairChance(sc, pp) : uniChance(sc, u)) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
    }
    html += `<h4 class="dsec">Негізгі мерзімдер</h4><ol class="plan-dates">
      <li><b>Маусым</b> ҰБТ нәтижесі, ЖОО қабылдау комиссиялары жұмысын бастайды</li>
      <li><b>Шілде</b> Грант конкурсына өтінім: eGov.kz немесе eGov Mobile</li>
      <li><b>Тамыз</b> Грант нәтижелері, ЖОО-ға құжат тапсыру</li>
      <li><b>Қыркүйек</b> Оқу жылының басы</li></ol>
      <p class="note">2026 жылғы ресми мерзімдер «Құжат» бетінде. 2027 жылы күндер ауысуы мүмкін, testcenter.kz мен ЖОО сайтын тексеріп отыр.</p>`;
    html += `<p class="note"><b>Мүмкіндік қалай есептеледі:</b> ЖОО бойынша — грантқа түскендердің балл ауқымы (ЖОО бетіндегі «Грант балдары»), мамандық бойынша — шектік бал мен белгілі болса өткен жылғы өту балдары. Бұл болжам ғана: нақты нәтиже сол жылғы конкурсқа байланысты.</p>`;
    if (!empty) html += `<div class="plan-actions"><button class="btn" onclick="print()">Басып шығару / PDF</button><button class="btn ghost" id="plClear">Жоспарды тазалау</button></div>`;
    e.innerHTML = html;

    $('plSave').onclick = () => { const v = parseInt($('plScore').value); LS.s('bz-score', isNaN(v) ? null : Math.max(0, Math.min(140, v))); render(e); };
    const add = () => {
      const q = ($('plQ').value || '').trim(); if (!q) return;
      const code = q.split(' ')[0].toUpperCase();
      const pl = getPlan();
      const m = majors.find(x => x.code === code) || majors.find(x => x.name.toLowerCase().includes(q.toLowerCase()));
      const u = universities.find(x => x.code === code) || universities.find(x => x.name.toLowerCase().includes(q.toLowerCase()));
      const hit = (/^B/i.test(code) && m) ? ['majors', m.code] : u ? ['unis', u.code] : m ? ['majors', m.code] : null;
      if (!hit) { $('plQ').value = ''; $('plQ').placeholder = T('Ештеңе табылмады'); return; }
      if (!pl[hit[0]].includes(hit[1])) pl[hit[0]].push(hit[1]);
      setPlan(pl); render(e);
    };
    $('plAdd').onclick = add; $('plQ').onkeydown = ev => { if (ev.key === 'Enter') add(); };
    e.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
      const [t, c] = b.dataset.rm.split(':'); const pl = getPlan(); const k = t === 'm' ? 'majors' : 'unis';
      pl[k] = pl[k].filter(x => x !== c); setPlan(pl); render(e);
    });
    if ($('plClear')) $('plClear').onclick = () => { if (confirm(T('Жоспарды тазалау') + '?')) { setPlan({ majors: [], unis: [] }); render(e); } };
  }
  window.BZ_PLAN = render;

  /* ---- ЖОО / мамандық бетіндегі «Жоспарға қосу» батырмасы ---- */
  window.BZ_PLANBTN = (box, key) => {
    const [t, c] = key.split('/'); if (t !== 'uni' && t !== 'major') return;
    if (box.querySelector('.planb')) return;
    const k = t === 'uni' ? 'unis' : 'majors';
    const btn = document.createElement('button'); btn.className = 'btn planb';
    const upd = () => btn.textContent = T(getPlan()[k].includes(c) ? '✓ Жоспарда' : '＋ Жоспарға қосу');
    btn.onclick = () => { const p = getPlan(); p[k] = p[k].includes(c) ? p[k].filter(x => x !== c) : [...p[k], c]; setPlan(p); upd(); };
    upd();
    const fav = box.querySelector('.favb'); fav ? fav.after(btn) : box.prepend(btn);
    // Мамандық бетінде: грант мүмкіндігі
    if (t === 'major') {
      const m = majors.find(x => x.code === c), sc = score(); if (!m) return;
      const lv = majorChance(sc, m);
      const div = document.createElement('div'); div.className = 'chance-box';
      div.innerHTML = sc == null
        ? `<span>Грант мүмкіндігі</span> <a href="#/plan">ҰБТ балыңды енгіз →</a>`
        : `<span>Сенің балың ${sc}: грант мүмкіндігі</span> ${badge(lv)} <small class="note">${lv === 'unk' ? 'Бұл мамандық бойынша өту балдары базада жоқ, тек шектік балмен салыстырылды.' : 'Өткен жылғы өту балдары бойынша болжам.'}</small>`;
      const h = box.querySelector('.dgrid') || box.querySelector('h3');
      if (h) h.after(div);
    }
  };

  /* Есептегіштегі балды жоспар үшін сақтаймыз */
  const hook = () => {
    if (typeof window.calc !== 'function' || window.calc.__bz) return;
    const orig = window.calc;
    window.calc = function () { const v = parseInt(($('score') || {}).value); if (!isNaN(v) && v >= 0 && v <= 140) LS.s('bz-score', v); return orig.apply(this, arguments); };
    window.calc.__bz = true;
  };
  hook(); setTimeout(hook, 500);
})();
