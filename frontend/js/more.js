/* BilimIzde — қосымша бет: ҰБТ сынақ тесті.
   Мәтіндер үш тілде осы файлда (kk / ru / en).  */
(() => {
const L = () => window.BZ_LANG || 'kk';
const t3 = (kk, ru, en) => ({ kk, ru, en }[L()] || kk);
const e3 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nm = o => o[L()] || o.kk;
const fmt = n => Number(n).toLocaleString('ru-RU').replace(/,/g, ' ');
const src = (u, l) => `<a class="src" href="${u}" target="_blank" rel="noopener noreferrer">${l || t3('дереккөз', 'источник', 'source')} ↗</a>`;

/* ===== ҰБТ сынақ тесті ===== */
const Q = [
 // Математикалық сауаттылық
 { s: 'm', q: ['Бағасы 12 000 ₸ тауарға 15% жеңілдік жасалды. Жаңа баға қанша?', 'На товар ценой 12 000 ₸ сделали скидку 15%. Какова новая цена?', 'An item costing 12,000 ₸ is discounted by 15%. What is the new price?'], o: ['10 200 ₸', '10 800 ₸', '11 820 ₸', '1 800 ₸'], a: 0 },
 { s: 'm', q: ['3 жұмысшы жұмысты 6 күнде бітіреді. Сондай қарқынмен 9 жұмысшы оны неше күнде бітіреді?', '3 рабочих выполняют работу за 6 дней. За сколько дней с той же скоростью её выполнят 9 рабочих?', '3 workers finish a job in 6 days. At the same rate, how many days will 9 workers take?'], o: ['2', '3', '18', '4'], a: 0 },
 { s: 'm', q: ['Оқушының төрт тест нәтижесі: 70, 85, 90, 75. Орташа балы қанша?', 'Результаты ученика за четыре теста: 70, 85, 90, 75. Каков средний балл?', 'A student scored 70, 85, 90 and 75 on four tests. What is the average?'], o: ['80', '79', ['82,5', '82,5', '82.5'], '85'], a: 0 },
 { s: 'm', q: ['Картаның масштабы 1 : 50 000. Картадағы 4 см нақты жерде қанша?', 'Масштаб карты 1 : 50 000. Сколько на местности составляют 4 см на карте?', 'A map scale is 1 : 50,000. What distance do 4 cm on the map represent?'], o: [['2 км', '2 км', '2 km'], ['20 км', '20 км', '20 km'], ['200 м', '200 м', '200 m'], ['0,2 км', '0,2 км', '0.2 km']], a: 0 },
 // Оқу сауаттылығы (BilimIzde жазған мәтін)
 { s: 'r', q: ['Мәтін: «Айгерім ҰБТ-дан 112 балл алды. Ол таңдаған мамандықтың шектік балы — 75, ал өткен жылы грантқа өту балы 118 болған. Айгерім ақылы бөлімге де дайын, бірақ алдымен грант конкурсына қатысуды шешті.»\nАйгерімнің балы шектік балдан қанша жоғары?', 'Текст: «Айгерим набрала на ЕНТ 112 баллов. Пороговый балл выбранной специальности — 75, а в прошлом году проходной балл на грант был 118. Айгерим готова и к платному отделению, но сначала решила участвовать в конкурсе на грант.»\nНа сколько её балл выше порогового?', 'Text: "Aigerim scored 112 on the UNT. The threshold for her chosen major is 75, and last year\'s passing score for a grant was 118. Aigerim is ready to pay for tuition, but first decided to compete for a grant."\nBy how much does her score exceed the threshold?'], o: ['37', '6', '43', '75'], a: 0 },
 { s: 'r', q: ['Сол мәтін бойынша: қай тұжырым дұрыс?', 'По тому же тексту: какое утверждение верно?', 'Based on the same text: which statement is true?'], o: [['Айгерімнің балы өткен жылғы өту балынан төмен.', 'Балл Айгерим ниже прошлогоднего проходного.', 'Aigerim\'s score is below last year\'s passing score.'], ['Айгерім тек ақылы бөлімге түседі.', 'Айгерим поступает только на платное.', 'Aigerim will only enrol as a paying student.'], ['Айгерім шектік балға жетпеді.', 'Айгерим не набрала пороговый балл.', 'Aigerim did not reach the threshold.'], ['Өткен жылғы өту балы шектік балға тең.', 'Прошлогодний проходной равен пороговому.', 'Last year\'s passing score equals the threshold.']], a: 0 },
 { s: 'r', q: ['Мәтіннің негізгі ойы қандай?', 'Какова основная мысль текста?', 'What is the main idea of the text?'], o: [['Айгерім балын бағалап, грантқа қатысуды таңдады.', 'Айгерим оценила свой балл и решила участвовать в конкурсе на грант.', 'Aigerim assessed her score and chose to compete for a grant.'], ['Шектік бал жыл сайын өседі.', 'Пороговый балл растёт каждый год.', 'The threshold rises every year.'], ['Ақылы оқу тегін.', 'Платное обучение бесплатно.', 'Paid study is free.'], ['ҰБТ-ны екі рет тапсыруға болмайды.', 'ЕНТ нельзя сдавать дважды.', 'The UNT cannot be taken twice.']], a: 0 },
 // Қазақстан тарихы
 { s: 'h', q: ['Қазақстан Республикасының мемлекеттік тәуелсіздігі туралы Конституциялық заң қашан қабылданды?', 'Когда был принят Конституционный закон о государственной независимости Республики Казахстан?', 'When was the Constitutional Law on the State Independence of Kazakhstan adopted?'], o: [['1991 жылғы 16 желтоқсан', '16 декабря 1991 года', 'December 16, 1991'], ['1990 жылғы 25 қазан', '25 октября 1990 года', 'October 25, 1990'], ['1995 жылғы 30 тамыз', '30 августа 1995 года', 'August 30, 1995'], ['1986 жылғы 17 желтоқсан', '17 декабря 1986 года', 'December 17, 1986']], a: 0 },
 { s: 'h', q: ['Қазақстан Республикасының қазіргі Конституциясы қашан референдумда қабылданды?', 'Когда на референдуме была принята действующая Конституция Казахстана?', 'When was Kazakhstan\'s current Constitution adopted by referendum?'], o: [['1995 жылғы 30 тамыз', '30 августа 1995 года', 'August 30, 1995'], ['1993 жылғы 28 қаңтар', '28 января 1993 года', 'January 28, 1993'], ['1991 жылғы 16 желтоқсан', '16 декабря 1991 года', 'December 16, 1991'], ['1997 жылғы 10 желтоқсан', '10 декабря 1997 года', 'December 10, 1997']], a: 0 },
 { s: 'h', q: ['Желтоқсан оқиғасы қай жылы болды?', 'В каком году произошли Декабрьские события?', 'In which year did the December events (Jeltoqsan) take place?'], o: ['1986', '1991', '1979', '1989'], a: 0 },
 { s: 'h', q: ['Елорда Алматыдан Ақмолаға (қазіргі Астана) қай жылы көшірілді?', 'В каком году столица была перенесена из Алматы в Акмолу (ныне Астана)?', 'In which year was the capital moved from Almaty to Akmola (now Astana)?'], o: ['1997', '1994', '1998', '2000'], a: 0 },
 { s: 'h', q: ['Қазақстанда Қазақ хандығының құрылуы ресми түрде қай жылмен байланыстырылады (550 жылдығы 2015 жылы аталып өтті)?', 'С каким годом официально связывают образование Казахского ханства (550-летие отмечали в 2015 году)?', 'Which year is officially associated with the founding of the Kazakh Khanate (its 550th anniversary was marked in 2015)?'], o: ['1465', '1511', '1456', '1731'], a: 0 },
];
const SUBJ = { m: ['Математикалық сауаттылық', 'Математическая грамотность', 'Mathematical literacy'], r: ['Оқу сауаттылығы', 'Грамотность чтения', 'Reading literacy'], h: ['Қазақстан тарихы', 'История Казахстана', 'History of Kazakhstan'] };
const li = () => ({ kk: 0, ru: 1, en: 2 }[L()] || 0);
const pick = x => Array.isArray(x) ? x[li()] : x;
const shuffle = (a, seed) => { const r = a.map((v, i) => [Math.sin(seed * 999 + i * 77) , v]); return r.sort((x, y) => x[0] - y[0]).map(x => x[1]); };

window.BZ_UNT = el => {
  const seed = Date.now() % 1000;
  const items = Q.map((x, i) => ({ ...x, i, ord: shuffle(x.o.map((o, j) => j), seed + i) }));
  el.innerHTML = `
  <h4 class="dsec">${t3('ҰБТ құрылымы (2026)', 'Структура ЕНТ (2026)', 'UNT structure (2026)')}</h4>
  <table class="xt">
   <tr><th>${t3('Пән', 'Предмет', 'Subject')}</th><th>${t3('Тапсырма', 'Заданий', 'Tasks')}</th><th>${t3('Шекті балл', 'Порог', 'Minimum')}</th></tr>
   <tr><td>${pick(SUBJ.h)}</td><td>20</td><td>5</td></tr>
   <tr><td>${pick(SUBJ.r)}</td><td>10</td><td>3</td></tr>
   <tr><td>${pick(SUBJ.m)}</td><td>10</td><td>3</td></tr>
   <tr><td>${t3('Бейіндік пән 1', 'Профильный предмет 1', 'Profile subject 1')}</td><td>40 (50 ${t3('балл', 'баллов', 'points')})</td><td>5</td></tr>
   <tr><td>${t3('Бейіндік пән 2', 'Профильный предмет 2', 'Profile subject 2')}</td><td>40 (50 ${t3('балл', 'баллов', 'points')})</td><td>5</td></tr>
  </table>
  <p class="note">${t3('Барлығы 120 тапсырма, ең жоғары балл — 140, уақыты — 240 минут. 2026 жылы негізгі ҰБТ 10 мамыр – 10 шілде аралығында өтті, оны екі рет тапсыруға болады.', 'Всего 120 заданий, максимум — 140 баллов, время — 240 минут. В 2026 году основное ЕНТ прошло с 10 мая по 10 июля, его можно сдавать дважды.', '120 tasks in total, maximum 140 points, 240 minutes. In 2026 the main UNT ran from May 10 to July 10 and could be taken twice.')} ${src('https://www.gov.kz/memleket/entities/sci/press/news/details/1259037?lang=kk')} ${src('https://informburo.kz/kaz/newskaz/ulttyq-testileu-ortalygy-ubt-ga-daiyndaluga-arnalgan-test-mazmunyn-zanartty')}</p>
  <div class="dgrid"><a class="dbox" href="https://prob-ent.testcenter.kz" target="_blank" rel="noopener noreferrer"><span>${t3('Ұлттық тестілеу орталығы', 'Национальный центр тестирования', 'National Testing Center')}</span><b>${t3('Тегін ресми сынақ ↗', 'Бесплатный официальный пробный тест ↗', 'Free official practice test ↗')}</b></a>
  <a class="dbox" href="https://app.testcenter.kz" target="_blank" rel="noopener noreferrer"><span>app.testcenter.kz</span><b>${t3('Ақылы сынақ ↗', 'Платный пробный тест ↗', 'Paid practice test ↗')}</b></a></div>
  <h4 class="dsec">${t3('Қысқа жаттығу: міндетті пәндер', 'Короткая тренировка: обязательные предметы', 'Quick practice: compulsory subjects')}</h4>
  <ol class="untq">${items.map(x => `<li data-i="${x.i}"><small class="subj">${pick(SUBJ[x.s])}</small><p>${e3(pick(x.q)).replace(/\n/g, '<br>')}</p>${x.ord.map(j => `<label><input type="radio" name="u${x.i}" value="${j}"> ${e3(pick(x.o[j]))}</label>`).join('')}<div class="ufb" aria-live="polite"></div></li>`).join('')}</ol>
  <button class="btn" id="untGo">${t3('Тексеру', 'Проверить', 'Check answers')}</button> <button class="btn alt" id="untRe">${t3('Қайта бастау', 'Заново', 'Restart')}</button>
  <div id="untRes" class="verd" hidden></div>`;
  el.querySelector('#untGo').onclick = () => {
    let ok = 0; const by = {};
    items.forEach(x => {
      const li_ = el.querySelector(`li[data-i="${x.i}"]`), v = li_.querySelector('input:checked'), fb = li_.querySelector('.ufb');
      const good = v && +v.value === x.a; if (good) ok++;
      by[x.s] = by[x.s] || [0, 0]; by[x.s][1]++; if (good) by[x.s][0]++;
      fb.className = 'ufb ' + (good ? 'ok' : 'no');
      fb.textContent = good ? t3('Дұрыс', 'Верно', 'Correct') : t3('Дұрыс жауап: ', 'Правильный ответ: ', 'Correct answer: ') + pick(x.o[x.a]);
    });
    const r = el.querySelector('#untRes'); r.hidden = false; r.className = 'verd ' + (ok >= items.length * 0.7 ? 'ok' : 'no');
    r.innerHTML = `${t3('Нәтиже', 'Результат', 'Result')}: <b>${ok} / ${items.length}</b> · ${Object.entries(by).map(([k, [a, b]]) => `${pick(SUBJ[k])}: ${a}/${b}`).join(' · ')}`;
    try { window.BZ_TRACK && BZ_TRACK('page', 'unt-check'); } catch (e) {}
  };
  el.querySelector('#untRe').onclick = () => window.BZ_UNT(el);
};
})();
