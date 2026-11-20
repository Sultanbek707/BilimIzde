/* BilimIzde — әр университеттің пікірлері мен талқылауы.
   Университет бетіндегі <section class="urev" data-uni="КОД"> ішіне салынады.
   Оқу — бәріне ашық, жазу — тек тіркелген қолданушыға (сервер тексереді). */
(function () {
  const T = s => (window.BZ_T ? BZ_T(s) : s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KIND = { plus: ['👍', 'Жақсы жағы'], minus: ['👎', 'Кемшілігі'], q: ['❓', 'Сұрақ'], exp: ['💬', 'Тәжірибе'] };
  const ROLE = { student: 'Студент', grad: 'Түлек', applicant: 'Талапкер' };
  const when = iso => { try { return new Date(iso).toLocaleDateString(({ ru: 'ru-RU', en: 'en-GB' })[window.BZ_LANG] || 'kk-KZ', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const hdr = async () => (window.BZ_AUTH_HEADERS ? await BZ_AUTH_HEADERS() : {});

  async function call(code, opt) {
    const h = { ...(await hdr()), ...(opt && opt.body ? { 'Content-Type': 'application/json' } : {}) };
    const r = await fetch(`/api/uni/${code}/posts${opt && opt.id ? '/' + opt.id : ''}`, { method: (opt && opt.method) || 'GET', headers: h, body: opt && opt.body ? JSON.stringify(opt.body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || r.status);
    return j;
  }

  function postHtml(p, reply) {
    const k = KIND[p.kind] || KIND.exp;
    return `<article class="rv${reply ? ' rp' : ''}" data-id="${p.id}">
      <div class="rh"><b>${esc(p.author || T('Қолданушы'))}</b><span class="rr">${T(ROLE[p.role] || '')}</span>${reply ? '' : `<span class="rk k-${p.kind}">${k[0]} ${T(k[1])}</span>`}<time>${when(p.created_at)}</time></div>
      <p>${esc(p.text).replace(/\n/g, '<br>')}</p>
      <div class="rft">${reply ? '' : `<button type="button" class="rb" data-a="reply">${T('Жауап беру')}${p.replies && p.replies.length ? ` · ${p.replies.length}` : ''}</button>`}${p.mine ? `<button type="button" class="rb del" data-a="del">${T('Өшіру')}</button>` : ''}</div>
      ${reply ? '' : `<div class="rps">${(p.replies || []).map(x => postHtml(x, true)).join('')}</div><form class="rf rf-r" hidden><textarea maxlength="1500" rows="2" placeholder="${T('Жауабыңды жаз…')}" required></textarea><button class="btn" type="submit">${T('Жіберу')}</button></form>`}
    </article>`;
  }

  async function render(el) {
    const code = el.dataset.uni;
    el.dataset.done = '1';
    el.innerHTML = `<h4 class="dsec">${T('Студенттер пікірі мен талқылау')}</h4><p class="note">${T('Осы университетте оқитын немесе оқыған студенттер жақсы және кем жағын айтып, бір-бірінің сұрағына жауап береді.')}</p>
      <div class="rfil" role="tablist"></div>
      <form class="rf rf-new">
        <div class="rsel"><select name="role" aria-label="${T('Кім ретінде жазасың')}"><option value="student">${T('Мен осында оқимын')}</option><option value="grad">${T('Мен осында оқыдым')}</option><option value="applicant">${T('Мен талапкермін')}</option></select>
        <select name="kind" aria-label="${T('Пікір түрі')}">${Object.entries(KIND).map(([k, v]) => `<option value="${k}"${k === 'exp' ? ' selected' : ''}>${v[0]} ${T(v[1])}</option>`).join('')}</select></div>
        <textarea name="text" maxlength="1500" rows="3" placeholder="${T('Оқу, оқытушылар, жатақхана, тамақ, студенттік өмір туралы жаз…')}" required></textarea>
        <div class="rfa"><small class="rmsg" role="status"></small><button class="btn" type="submit">${T('Жариялау')}</button></div>
      </form>
      <div class="rlist"><p class="note">${T('Жүктелуде…')}</p></div>`;
    let data = null, filter = '';
    const list = el.querySelector('.rlist'), fil = el.querySelector('.rfil'), msg = el.querySelector('.rmsg');
    const draw = () => {
      const c = data.counts || {};
      fil.innerHTML = [['', T('Барлығы'), data.total], ...Object.entries(KIND).map(([k, v]) => [k, `${v[0]} ${T(v[1])}`, c[k] || 0])]
        .map(([k, l, n]) => `<button type="button" class="ch${k === filter ? ' on' : ''}" data-k="${k}">${l} <small>${n}</small></button>`).join('');
      const P = data.posts.filter(p => !filter || p.kind === filter);
      list.innerHTML = P.length ? P.map(p => postHtml(p)).join('') : `<p class="note rempty">${data.total ? T('Бұл түрде пікір әлі жоқ.') : T('Әзірге пікір жоқ. Бірінші болып жаз!')}</p>`;
    };
    const load = async () => { try { data = await call(code); draw(); } catch (e) { list.innerHTML = `<p class="note">${T('Пікірлерді жүктеу мүмкін болмады.')}</p>`; } };
    const needLogin = () => { if (window.BZ_USER) return false; msg.textContent = T('Жазу үшін алдымен кір.'); window.BZ_LOGIN && BZ_LOGIN(); return true; };

    fil.onclick = e => { const b = e.target.closest('button'); if (!b || !data) return; filter = b.dataset.k; draw(); };
    el.querySelector('.rf-new').onsubmit = async e => {
      e.preventDefault(); if (needLogin()) return;
      const f = e.target, text = f.text.value.trim(); if (!text) return;
      f.querySelector('button').disabled = true; msg.textContent = '';
      try { data = await call(code, { method: 'POST', body: { text, kind: f.kind.value, role: f.role.value } }); f.text.value = ''; filter = ''; draw(); msg.textContent = T('Жарияланды'); }
      catch (err) { msg.textContent = T(/429|көп/.test(err.message) ? 'Тым жиі жазып жатырсың, сәл күт.' : 'Жариялау мүмкін болмады.'); }
      f.querySelector('button').disabled = false;
    };
    list.onclick = async e => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const art = b.closest('article.rv'), id = +art.dataset.id;
      if (b.dataset.a === 'reply') { const f = art.querySelector('.rf-r'); f.hidden = !f.hidden; if (!f.hidden) f.querySelector('textarea').focus(); return; }
      if (b.dataset.a === 'del' && confirm(T('Пікірді өшіресің бе?'))) { try { data = await call(code, { method: 'DELETE', id }); draw(); } catch (err) { alert(T('Өшіру мүмкін болмады.')); } }
    };
    list.onsubmit = async e => {
      e.preventDefault(); if (needLogin()) return;
      const f = e.target, art = f.closest('article.rv'), text = f.querySelector('textarea').value.trim(); if (!text) return;
      f.querySelector('button').disabled = true;
      try { data = await call(code, { method: 'POST', body: { text, parent_id: +art.dataset.id, role: el.querySelector('.rf-new').role.value } }); draw(); }
      catch (err) { alert(T('Жіберу мүмкін болмады.')); f.querySelector('button').disabled = false; }
    };
    await load();
    // Чат сияқты: бет ашық тұрғанда 30 секунд сайын жаңарады (жауап жазып жатқанда емес)
    const t = setInterval(() => {
      if (!document.body.contains(el)) { clearInterval(t); return; }
      if (document.hidden || el.contains(document.activeElement) && document.activeElement.tagName === 'TEXTAREA') return;
      load();
    }, 30000);
    addEventListener('bz-auth', () => document.body.contains(el) && load());
  }

  const scan = () => document.querySelectorAll('section.urev[data-uni]:not([data-done])').forEach(render);
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  scan();
})();
