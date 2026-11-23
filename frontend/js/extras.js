/* BilimIzde v24: грант есептегіш, мәзір, тіл ауыстыру */
/* ===== BilimIzde v24 ===== */
(()=>{
const $=id=>document.getElementById(id);
const lang=()=>($('lang')&&$('lang').value)||'kk';
const L=(kk,ru,en)=>({kk,ru,en}[lang()]||kk);
window.bzL=L;

/* ---------- Грант есептегіш ---------- */
const grants=c=>{const b=typeof G26!=='undefined'&&G26[c];if(b)return{n:b[1],y:2026};const a=GC[c];return a?{n:a[0],y:2025}:null};
const passing=c=>{const g=(PS[c]||{}).gen;if(!g)return null;const y=Math.max(...Object.keys(g).map(Number));return{y,max:g[y][0],min:g[y][1]}};
function chance(m,s){const p=passing(m.code);if(!p)return{k:'na',t:L('өту балы белгісіз','проходной неизвестен','passing score unknown'),r:2};
 if(s>=p.max)return{k:'hi',t:L(`${p.y}: ең жоғары балдан да жоғары`,`${p.y}: выше максимума`,`${p.y}: above max`),r:0};
 if(s>=p.min)return{k:'mid',t:L(`${p.y}: ${p.min}–${p.max} аралығында`,`${p.y}: в диапазоне ${p.min}–${p.max}`,`${p.y}: within ${p.min}–${p.max}`),r:1};
 return{k:'lo',t:L(`${p.y}: ең төменгі өту балы ${p.min}`,`${p.y}: минимум был ${p.min}`,`${p.y}: min was ${p.min}`),r:3}}
let LIM=15;
window.calc=function(){
 const s=parseInt($('score').value),o=$('calcOut');
 if(isNaN(s)||s<0||s>140){o.innerHTML=`<div class="cres"><p class="warn">${L('0 мен 140 аралығындағы балды енгізіңіз.','Введите балл от 0 до 140.','Enter a score from 0 to 140.')}</p></div>`;return}
 const thrOf=m=>parseInt(m.grantScore);
 const reg=majors.filter(m=>!isCre(m)),cre=majors.filter(isCre);
 const ok=reg.filter(m=>s>=thrOf(m)),no=reg.filter(m=>s<thrOf(m)),crOk=cre.filter(m=>s>=thrOf(m));
 const rows=ok.map(m=>({m,c:chance(m,s),g:grants(m.code)})).sort((a,b)=>a.c.r-b.c.r||((b.g||{}).n||0)-((a.g||{}).n||0));
 const known=rows.filter(r=>r.c.k!=='na');
 const list=rows.slice(0,LIM).map(({m,c,g})=>`<a class="crow" href="#/major/${m.code}"><code>${m.code}</code><span>${esc(m.name)}</span><span class="g">${g?L(`${g.y}: ${g.n} грант`,`${g.y}: ${g.n} грантов`,`${g.y}: ${g.n} grants`):L('грант жоқ','нет грантов','no grants')}</span><span class="tag ${c.k}">${c.t}</span></a>`).join('');
 o.innerHTML=`<div class="cres">
 <p class="sum">${L(`Балыңыз <b>${s}</b>. Шектік балдан өтетін мамандықтар: <b>${ok.length}</b> / ${reg.length}.`,`Ваш балл <b>${s}</b>. Пороговый балл пройден по <b>${ok.length}</b> из ${reg.length} специальностей.`,`Your score is <b>${s}</b>. You pass the threshold for <b>${ok.length}</b> of ${reg.length} majors.`)}${crOk.length?L(` Шығармашылық емтиханы бар бағыттар: <b>${crOk.length}</b>.`,` С творческим экзаменом: <b>${crOk.length}</b>.`,` With a creative exam: <b>${crOk.length}</b>.`):''}${no.length?L(` Шектік балға жетпейтіні: ${no.length}.`,` Не хватает до порога: ${no.length}.`,` Below threshold: ${no.length}.`):''}</p>
 <p class="warn">${L('Шектік балл — конкурсқа қатысу үшін ең төменгі балл ғана. Грантты сол мамандыққа балы ең жоғары үміткерлер алады, сондықтан грант саны көп мамандықта мүмкіндік көбірек.','Пороговый балл — лишь минимум для участия в конкурсе. Грант получают абитуриенты с самыми высокими баллами, поэтому чем больше грантов, тем выше шанс.','The threshold is only the minimum to enter the competition. Grants go to the highest scorers, so more grants means better odds.')}${known.length?'':L(' Бұл тізімде өткен жылғы өту балы әлі енгізілмеген.',' Для этих специальностей проходные баллы ещё не внесены.',' Passing scores are not yet added for these majors.')}</p>
 ${ok.length?`<div class="clist">${list}</div>${rows.length>LIM?`<button class="cmore" onclick="window.bzMore()">${L(`Барлығын көрсету (${rows.length})`,`Показать все (${rows.length})`,`Show all (${rows.length})`)}</button>`:''}`:`<p class="warn">${L('Ақылы бөлімді, колледж негізіндегі қысқартылған бағдарламаны немесе ҰБТ-ны қайта тапсыруды қарастырыңыз.','Рассмотрите платное отделение, сокращённую программу после колледжа или пересдачу ЕНТ.','Consider paid study, a shortened programme after college, or retaking the UNT.')}</p>`}
 </div>`;
};
window.bzMore=()=>{LIM=999;calc();LIM=15};
$('score').addEventListener('keydown',e=>{if(e.key==='Enter')calc()});

/* ---------- Мәзір «Тағы» ---------- */
const more=document.querySelector('header .more');
if(more){
 const mq=matchMedia('(max-width:900px)');const sync=()=>{more.open=mq.matches};sync();mq.addEventListener('change',sync);
 more.addEventListener('click',e=>{if(e.target.tagName==='A'&&!mq.matches)more.open=false});
 document.addEventListener('click',e=>{if(!mq.matches&&more.open&&!more.contains(e.target))more.open=false});
 const mark=()=>{const on=more.querySelector('a.on');more.querySelector('summary').classList.toggle('on',!!on)};addEventListener('hashchange',()=>setTimeout(mark,0));mark();
}

/* ---------- Плиткадағы сандарды жаңарту ---------- */
const LSg=k=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}};
addEventListener('hashchange',()=>{const f=document.querySelector('[data-n="fav"]'),c=document.querySelector('[data-n="club"]');if(f)f.textContent=LSg('bz-fav').length||'＋';if(c)c.textContent=window.BZ_CLUB_N||'＋'});

/* ---------- Тіл ауыстыру: интерфейс мәтіндері ---------- */
const I={
 '.hero h1':['Университетіңді ізде. Мамандығыңды тап.','Найди свой университет. Выбери специальность.','Find your university. Choose your major.'],
 '.hero p':['Қазақстандағы барлық жоғары оқу орындары мен мамандық шифрлары, сондай-ақ ресми деректен тексерілген шетелдік университеттер бір жүйеде.','Все вузы Казахстана и шифры специальностей, а также зарубежные университеты с проверенными официальными данными — в одном месте.','All Kazakhstan universities and major codes, plus foreign universities checked against official sources — in one place.'],
 '.hero .search .btn':['Іздеу','Найти','Search'],
 '#analyzer h2':['ҰБТ балыңызға қарай мүмкіндікті бағалаңыз','Оцените шансы по баллу ЕНТ','Check your chances by UNT score'],
 '#analyzer .calc>div:first-child p':['Жалпы балыңызды енгізіңіз. Шектік балдан өтетін мамандықтарды, 2026 жылғы грант санын және белгілі болса өткен жылғы өту балын көрсетеміз.','Введите общий балл. Покажем специальности, где пройден порог, число грантов на 2026 год и, если известно, прошлогодний проходной балл.','Enter your total score. We show majors where you pass the threshold, 2026 grant counts and, where known, last year\'s passing score.'],
 '#analyzer .row .btn':['Тексеру','Проверить','Check'],
 '#how h2':['Түсудің бес қадамы','Пять шагов к поступлению','Five steps to admission'],
 '#majors h2':['Барлық мамандықтар мен шифрлар','Все специальности и шифры','All majors and codes'],
 '#universities h2':['Барлық университеттер мен кодтары','Все университеты и коды','All universities and codes'],
 '#abroad h2':['Шетелдік университеттер','Зарубежные университеты','Foreign universities'],
 '#ai-helper h2':['BilimIzde AI көмекшісі','AI-помощник BilimIzde','BilimIzde AI assistant'],
 '.more summary':['Тағы','Ещё','More'],
 '#tiles a[href="#/majors"] h3':['Мамандықтар','Специальности','Majors'],
 '#tiles a[href="#/majors"] span':['шифр, пән және балл бойынша','по шифру, предметам и баллу','by code, subjects and score'],
 '#tiles a[href="#/universities"] h3':['Университеттер','Университеты','Universities'],
 '#tiles a[href="#/universities"] span':['код, қала және грант балдары','код, город и баллы','code, city and scores'],
 '#tiles a[href="#/abroad"] h3':['Шетелдік ЖОО','Зарубежные вузы','Study abroad'],
 '#tiles a[href="#/abroad"] span':['талаптар, баға, тарих','требования, цены, история','requirements, fees, history'],
 '#tiles a[href="#/calc"] h3':['Грант есептегіш','Расчёт гранта','Grant calculator'],
 '#tiles a[href="#/calc"] span':['ҰБТ балыңызды тексеріңіз','проверьте свой балл ЕНТ','check your UNT score'],
 '#tiles a[href="#/ai"] h3':['AI кеңесші','AI-советник','AI advisor'],
 '#tiles a[href="#/ai"] span':['ЖОО, мамандық және грант туралы сұрақтар','вопросы о вузах, специальностях и грантах','questions on universities, majors and grants'],
 '#tiles a[href="#/test"] h3':['Мамандық таңдау тесті','Тест по выбору специальности','Major finder quiz'],
 '#tiles a[href="#/test"] span':['сұрақ: саған сай пәндер мен мамандықтар','вопросов: подходящие предметы и специальности','questions: matching subjects and majors'],
 '#tiles a[href="#/compare"] h3':['ЖОО салыстыру','Сравнение вузов','Compare'],
 '#tiles a[href="#/compare"] span':['ЖОО-ны немесе мамандықты қатар салыстыру','сравнение вузов и специальностей','side-by-side universities and majors'],
 '#tiles a[href="#/map"] h3':['Университеттер картасы','Карта вузов','University map'],
 '#tiles a[href="#/map"] span':['қала: қай жерде қанша ЖОО бар','городов: где сколько вузов','cities: where the universities are'],
 '#tiles a[href="#/admit"] h3':['Құжат чек-парағы және күнтізбе','Документы и календарь','Documents & calendar'],
 '#tiles a[href="#/admit"] span':['құжат және 2026 жылғы түсу мерзімдері','документов и сроки поступления 2026','documents and 2026 deadlines'],
 '#tiles a[href="#/grants"] h3':['Грант және шәкіртақы','Гранты и стипендии','Grants & scholarships'],
 '#tiles a[href="#/grants"] span':['бағдарлама: мемлекеттік грант, «Болашақ», шетел','программ: госгрант, «Болашак», зарубежные','programmes: state grant, Bolashak, abroad'],
 '#tiles a[href="#/faq"] h3':['Жиі қойылатын сұрақтар','Частые вопросы','FAQ'],
 '#tiles a[href="#/faq"] span':['ҰБТ, грант және шетелге түсу туралы жауаптар','ответы про ЕНТ, гранты и учёбу за рубежом','answers on UNT, grants and studying abroad'],
 '#tiles a[href="#/club"] h3':['Пікірлер мен әңгімелер','Отзывы и истории','Reviews & stories'],
 '#tiles a[href="#/club"] span':['жазба: түсу тәжірибеңді сақта','записей: сохрани свой опыт','notes: save your experience'],
 '#tiles a[href="#/fav"] h3':['Таңдаулылар','Избранное','Favorites'],
 '#tiles a[href="#/fav"] span':['сақталған ЖОО мен мамандық','сохранённые вузы и специальности','saved universities and majors'],
 '[data-i=s1t]':['Балыңды тексер','Проверь балл','Check your score'],
 '[data-i=s1p]':['ҰБТ балыңды енгіз: шектік балдан өтетін мамандықтар мен грант санын көр.','Введи балл ЕНТ: увидишь, где пройден порог и сколько грантов.','Enter your UNT score to see which majors you qualify for and how many grants there are.'],
 '[data-i=s2t]':['Мамандық таңда','Выбери специальность','Choose a major'],
 '[data-i=s2p]':['Тест тапсыр немесе пәндер жұбы бойынша мамандық шифрын ізде.','Пройди тест или найди шифр по паре предметов.','Take the quiz or search codes by subject pair.'],
 '[data-i=s3t]':['ЖОО тап','Найди вуз','Find a university'],
 '[data-i=s3p]':['Қала, грант балы және оқу ақысы бойынша университеттерді салыстыр.','Сравни вузы по городу, баллам и стоимости.','Compare universities by city, scores and fees.'],
 '[data-i=s4t]':['Құжат тапсыр','Подай документы','Apply'],
 '[data-i=s4p]':['Чек-парақ бойынша құжат жина. Грантқа өтінім eGov арқылы беріледі (2026 жылы 13–20 шілде).','Собери документы по чек-листу. Заявка на грант подаётся через eGov (в 2026 году 13–20 июля).','Gather documents with the checklist. Grant applications go through eGov (13–20 July in 2026).'],
 '[data-i=s5t]':['Шетелді де қара','Посмотри зарубежные','Look abroad too'],
 '[data-i=s5p]':['Шетелдік ЖОО талаптары, бағасы, мерзімдері және стипендиялар.','Требования, цены и сроки зарубежных вузов, стипендии.','Foreign university requirements, fees, deadlines and scholarships.'],
 '[data-i=fAbout]':['Қазақстан мен шетелдегі ЖОО, мамандықтар және гранттар туралы ақпараттық портал. Мәліметтер анықтамалық сипатта: түсер алдында ресми дереккөзбен салыстырыңыз.','Информационный портал о вузах, специальностях и грантах в Казахстане и за рубежом. Данные справочные — перед поступлением сверяйте с официальными источниками.','An information portal on universities, majors and grants in Kazakhstan and abroad. Data is for reference — check official sources before applying.'],
 '[data-i=fSec]':['Бөлімдер','Разделы','Sections'],
 '[data-i=fSrc]':['Ресми дереккөздер','Официальные источники','Official sources'],
 '[data-i=fCon]':['Кері байланыс','Обратная связь','Feedback'],
 '[data-i=fBug]':['Қате таптыңыз ба? Пікір қалдырыңыз','Нашли ошибку? Оставьте отзыв','Found a mistake? Leave a note'],
 '[data-i=fFaq]':['Жиі қойылатын сұрақтар','Частые вопросы','FAQ'],
 '[data-i=fUpd]':['Деректер: univision.kz, ҚР Ғылым және жоғары білім министрлігі, ЖОО ресми сайттары · 2026','Данные: univision.kz, Министерство науки и высшего образования РК, сайты вузов · 2026','Data: univision.kz, Ministry of Science and Higher Education of Kazakhstan, university websites · 2026']
};
const PH={'#q':['Шифр (B057), мамандық, ЖОО коды немесе қала','Шифр (B057), специальность, код вуза или город','Code (B057), major, university code or city'],'#score':['ҰБТ балы, мысалы 110','Балл ЕНТ, например 110','UNT score, e.g. 110']};
const FN={'#/majors':['Мамандықтар','Специальности','Majors'],'#/universities':['Университеттер','Университеты','Universities'],'#/abroad':['Шетелдік ЖОО','Зарубежные вузы','Study abroad'],'#/calc':['Грант есептегіш','Расчёт гранта','Grant calculator'],'#/admit':['Құжат','Документы','Documents'],'#/grants':['Грант','Гранты','Grants'],'#/faq':['FAQ','FAQ','FAQ'],'#/ai':['AI кеңесші','AI-советник','AI advisor']};
function applyLang(){const k={kk:0,ru:1,en:2}[lang()]||0;
 for(const[sel,t]of Object.entries(I))document.querySelectorAll(sel).forEach(el=>el.textContent=t[k]);
 for(const[sel,t]of Object.entries(PH)){const el=document.querySelector(sel);if(el)el.placeholder=t[k]}
 document.querySelectorAll('footer .fnav a').forEach(a=>{const t=FN[a.getAttribute('href')];if(t)a.textContent=t[k]});
 const c=$('count');if(c)c.textContent=L(`Базада ${majors.length} мамандық шифры және ${universities.length} ЖОО бар.`,`В базе ${majors.length} шифров специальностей и ${universities.length} вузов.`,`The database has ${majors.length} major codes and ${universities.length} universities.`);
 const h=document.querySelector('.hints');if(h&&h.firstChild&&h.firstChild.nodeType===3)h.firstChild.textContent=L('Мысалы: ','Например: ','e.g. ');
 const pill=document.querySelector('header .pill');if(pill)pill.textContent=L('Республикалық база, 2026','Республиканская база, 2026','National database, 2026');
 if($('calcOut').innerHTML.trim()&&$('score').value)calc();
}
$('lang').addEventListener('change',applyLang);applyLang();
})();
