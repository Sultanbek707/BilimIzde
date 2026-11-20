/* BilimIzde — тіркелу (Google немесе телефон нөмірі) Firebase арқылы.
   Сервердегі FIREBASE_PROJECT_ID және FIREBASE_WEB_CONFIG орнатылмаса, бұл модуль ештеңе көрсетпейді. */
(async function () {
  let cfg;
  try { cfg = await api('/api/config'); } catch (e) { return; }
  if (!cfg.auth_enabled || !cfg.firebase) return;

  const T = s => (window.BZ_T ? BZ_T(s) : s);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const V = '10.12.2';
  try {
    await load(`https://www.gstatic.com/firebasejs/${V}/firebase-app-compat.js`);
    await load(`https://www.gstatic.com/firebasejs/${V}/firebase-auth-compat.js`);
  } catch (e) { console.warn('Firebase жүктелмеді', e); return; }
  firebase.initializeApp(cfg.firebase);
  const fa = firebase.auth();
  fa.languageCode = ({ ru: 'ru', en: 'en' })[window.BZ_LANG] || 'kk';

  /* --- Шапкадағы батырма --- */
  const tools = document.getElementById('theme').parentElement;
  const btn = document.createElement('button');
  btn.className = 'btn authb'; btn.type = 'button';
  tools.insertBefore(btn, document.getElementById('theme'));

  /* --- Кіру терезесі --- */
  const dlg = document.createElement('dialog'); dlg.className = 'authdlg';
  dlg.innerHTML = `<form method="dialog" class="authbox">
    <button class="x" value="close" aria-label="${T('Жабу')}">✕</button>
    <h3>${T('BilimIzde-ге кіру')}</h3>
    <p class="note">${T('Кірсең, жоспарың мен таңдаулыларың кез келген құрылғыда сақталады, ал пікірлерің атыңмен шығады.')}</p>
    <button type="button" class="btn gbtn" id="aGoogle">G&nbsp; ${T('Google арқылы кіру')}</button>
    <div class="or">${T('немесе')}</div>
    <label>${T('Телефон нөмірі')}<input id="aPhone" type="tel" placeholder="+7 7__ ___ __ __" autocomplete="tel"></label>
    <button type="button" class="btn" id="aSend">${T('SMS-код жіберу')}</button>
    <div id="aCodeBox" hidden><label>${T('SMS-код')}<input id="aCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code"></label>
      <button type="button" class="btn" id="aVerify">${T('Растау')}</button></div>
    <p class="note" id="aMsg" role="status"></p><div id="aRecaptcha"></div></form>`;
  document.body.appendChild(dlg);
  const MUST = !!cfg.auth_required;
  if (!cfg.auth_phone) dlg.querySelectorAll('.or, label:has(#aPhone), #aSend, #aCodeBox').forEach(n => n.remove());
  if (MUST) {
    dlg.classList.add('must');
    dlg.querySelector('.x').remove();
    dlg.addEventListener('cancel', e => e.preventDefault());  // Esc жаппайды
    dlg.querySelector('h3').insertAdjacentHTML('afterend', `<p class="note">${T('Сайтты қолдану үшін тіркел: бұл бір рет қана, 10 секунд.')}</p>`);
    document.body.classList.add('bz-lock');
  }
  const $ = id => document.getElementById(id);
  const msg = t => { $('aMsg').textContent = T(t); };

  $('aGoogle').onclick = async () => {
    const gp = new firebase.auth.GoogleAuthProvider();
    try { await fa.signInWithPopup(gp); dlg.close(); }
    catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') { try { await fa.signInWithRedirect(gp); return; } catch (e2) {} }
      msg(e.code === 'auth/popup-closed-by-user' ? 'Терезе жабылды' : 'Кіру мүмкін болмады. Қайталап көріңіз');
    }
  };
  let verifier, confirmation;
  if ($('aSend')) $('aSend').onclick = async () => {
    const ph = $('aPhone').value.replace(/[\s()-]/g, '');
    if (!/^\+\d{10,14}$/.test(ph)) { msg('Нөмірді +7 7XX XXX XX XX түрінде жаз'); return; }
    try {
      verifier = verifier || new firebase.auth.RecaptchaVerifier('aRecaptcha', { size: 'invisible' });
      confirmation = await fa.signInWithPhoneNumber(ph, verifier);
      $('aCodeBox').hidden = false; msg('Код жіберілді');
    } catch (e) { msg('SMS жіберу мүмкін болмады. Нөмірді тексер немесе Google арқылы кір'); }
  };
  if ($('aVerify')) $('aVerify').onclick = async () => {
    try { await confirmation.confirm($('aCode').value.trim()); dlg.close(); }
    catch (e) { msg('Код қате'); }
  };

  /* --- Жоспарды серверге синхрондау --- */
  const authHeaders = async () => ({ Authorization: 'Bearer ' + (await fa.currentUser.getIdToken()) });
  let syncing = false;
  async function pushPlan(p) {
    if (!fa.currentUser || syncing) return;
    try { await api('/api/plan', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(await authHeaders()) }, body: JSON.stringify(p) }); } catch (e) {}
  }
  addEventListener('bz-plan-change', e => pushPlan(e.detail));

  fa.onAuthStateChanged(async user => {
    window.BZ_USER = user || null;
    window.BZ_AUTH_HEADERS = user ? authHeaders : null;
    document.body.classList.toggle('bz-lock', MUST && !user);
    if (!user) {
      btn.textContent = T('Кіру'); btn.onclick = () => dlg.showModal();
      if (MUST && !dlg.open) dlg.showModal();
      return;
    }
    if (dlg.open) dlg.close();
    const name = user.displayName || user.phoneNumber || user.email || T('Профиль');
    btn.innerHTML = `👤 ${esc(name.split(' ')[0])}`;
    btn.title = T('Шығу');
    btn.onclick = () => { if (confirm(T('Аккаунттан шығасың ба?'))) fa.signOut(); };
    try {
      const h = await authHeaders();
      await api('/api/auth/me', { method: 'POST', headers: h });
      // Сервердегі жоспар + осы құрылғыдағы жоспар біріктіріледі
      const server = await api('/api/plan', { headers: h });
      const local = window.BZ_PLAN_GET ? BZ_PLAN_GET() : { majors: [], unis: [] };
      const merged = { majors: [...new Set([...server.majors, ...local.majors])], unis: [...new Set([...server.unis, ...local.unis])] };
      syncing = true; window.BZ_PLAN_SET && BZ_PLAN_SET(merged); syncing = false;
      await pushPlan(merged);
      if (document.body.dataset.page === 'plan' && window.BZ_PLAN) BZ_PLAN(document.getElementById('xB'));
    } catch (e) { console.warn('Синхрондау қатесі', e); }
  });
})();
