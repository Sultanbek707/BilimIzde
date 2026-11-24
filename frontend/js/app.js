/* BilimIzde — негізгі логика. Мәліметтер серверден js/api.js арқылы жүктеледі. */


const $=id=>document.getElementById(id);
function fieldOf(c){const n=parseInt(c.replace(/\D/g,''));
 if(c.startsWith('BM'))return'health';if([134,135,234].includes(n))return'hum';if([140,142].includes(n))return'soc';if(n===145)return'bus';if(n===158)return'ict';if(n===157)return null;if(n===183)return'agr';if([126,161,162,265,165,166,167,171,172,173,174,175,176,271].includes(n))return'eng';
 return n<=20?'ped':n<=31?'art':n<=37?'hum':n<=43?'soc':n<=49?'bus':n<=56?'nat':n<=59?'ict':n<=76?'eng':n<=82?'agr':n===83?'vet':n<=89?'health':'serv'}
const isCre=m=>(m.combo_kk||m.combo||'').startsWith('Шығарма');
function renderMajors(d){
 $('mCount').textContent=d.length+' бағыт · толық ақпарат үшін басыңыз';
 $('majorsGrid').innerHTML=d.length?d.map(m=>{const n=parseInt(m.grantScore);
  return `<article class="major" role="button" tabindex="0" aria-label="${m.name}: толық ақпарат" onclick="openMajor('${m.code}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openMajor('${m.code}')}"><span class="code">${m.code}</span><div class="mn"><h3>${m.name}</h3>${m.combo?`<p class="combo"><b>Пәндер:</b> ${m.combo}</p>`:''}</div><div class="mts"><div class="mt"><span>Шектік балл</span><b>${n}</b></div></div><span class="chev" aria-hidden="true">›</span></article>`}).join(''):'<div class="empty">Ештеңе табылмады. Басқа шифр немесе атау енгізіңіз.</div>';
}
function openMajor(c){
 const m=majors.find(x=>x.code===c);if(!m)return;const n=parseInt(m.grantScore),f=FIELDS[fieldOf(c)],cr=isCre(m),sc=parseInt($('score').value);
 const subj=cr?`<div class="drow"><span>Шығармашылық емтихан (екі бейіндік пәннің орнына)</span><b>кемінде 5 + 5</b></div>`:`<div class="drow"><span>Бейіндік пән 1 және 2</span><b>кемінде 5 + 5</b></div>`;
 const verd=!isNaN(sc)&&sc>=0&&sc<=140?`<div class="verd ${sc>=n?'ok':'no'}">Сіздің балыңыз ${sc}: ${sc>=n?'шектік балға жетеді.':`шектік балдан ${n-sc} балл төмен.`}</div>`:'';
 const nat=n===50&&!['agr','vet'].includes(fieldOf(c))?' Ұлттық ЖОО-ларға түсу үшін шек 65 балл.':'';
 $('mBody').innerHTML=`<span class="code">${m.code}</span><h3 id="mName">${m.name}</h3><p class="meta">${f?f[0]:'Білім беру саласы нақтыланбаған'}</p>
 <div class="dgrid"><div class="dbox"><span>Шектік бал (мемлекеттік шек)</span><b>${n} балл</b><div class="gbar" aria-hidden="true"><i style="left:0;width:${n/140*100}%"></i></div><div class="gsc"><span>0</span><span>140</span></div></div><div class="dbox"><span>ҰБТ бейіндік пәндері</span><b>${m.combo||'Ресми тізімнен тексеріңіз'}</b></div></div>${verd}
  ${muHtml(c)}
  ${offeredHtml(c)}
  ${salHtml(c)}
  <p class="note">Ақылы бөлімге түсу үшін жалпы балл жоғарыдағы шектен кем болмауы керек.${nat} ЖОО әр бағдарлама бойынша өту балын жоғарырақ белгілей алады. Нақты грант саны мен өту балын univision.kz сайтынан тексеріңіз.</p>
 ${f?`<h4 class="dsec">Бағыт туралы</h4><p class="dtxt">${f[1]}</p><h4 class="dsec">Қайда жұмыс істеуге болады</h4><p class="dtxt">${f[2]}</p>`:''}
 <p class="note">Дереккөз: ҚР Ғылым және жоғары білім министрлігі, 2026 жылғы шекті баллдар; пәндер жұбы: univision.kz.</p>`;
 $('majDlg').showModal();
}
const lgM=u=>{const w=u.name.replace(/[«»"()]/g,' ').split(/\s+/).filter(x=>/^[A-ZА-ЯӘҒҚҢӨҰҮҺІ]/.test(x)&&!/^(Қазақ|Қазақстан|Қазақстандық|Халықаралық|Ұлттық|Мемлекеттік)$/.test(x));return((w[0]||u.name)[0]+((w[1]||'')[0]||'')).toUpperCase()};
const doms=c=>[...new Set([...(SITES[c]?[SITES[c]]:[]),...(SITE_EXTRA[c]||[])])];
/* Ресми логотип (ЖОО сайтынан, logos.json) бірінші; болмаса сайт белгісі. DuckDuckGo сұр «>» белгісін бермеуі үшін алынды. */
const LGU=d=>/^https?:/.test(d)?[d]:[`https://${d}/apple-touch-icon.png`,`https://www.google.com/s2/favicons?domain=${d}&sz=128`,`https://${d}/favicon.ico`];
const LGL=a=>a.flatMap(LGU);
function lgNext(im){const L=LGL(im.dataset.d.split('|')),i=+im.dataset.i+1;if(i>=L.length){im.remove();return}im.dataset.i=i;im.src=L[i]}
function lgOk(im){const L=LGL(im.dataset.d.split('|'));if(im.naturalWidth<32&&+im.dataset.i<L.length-1){lgNext(im);return}if(im.naturalWidth<16)im.remove();else im.classList.add('ok')}
const lgImg=(a,h,t)=>`<span class="lg" style="--h:${h}"><b class="lgm">${t}</b>${a.length?`<img data-d="${a.join('|')}" data-i="0" src="${LGL(a)[0]}" alt="" loading="lazy" referrerpolicy="no-referrer" onload="lgOk(this)" onerror="lgNext(this)">`:''}</span>`;
const lg=u=>lgImg([...((window.LOGO||{})[u.code]?[LOGO[u.code]]:[]),...doms(u.code)],(+u.code*47)%360,lgM(u));
const lgD=(d,t,h)=>lgImg([d],h,t);
const flg=f=>{let d='';try{d=new URL(f.site).hostname.replace(/^www\./,'')}catch(e){}const w=f.name.split(' (')[0].split(/\s+/).filter(x=>/^[A-Z]/.test(x));const lo=(window.LOGO||{})['f:'+f.id];return (d||lo)?lgImg([...(lo?[lo]:[]),...(d?[d]:[])],(f.name.length*37)%360,((w[0]||'U')[0]+((w[1]||'')[0]||'')).toUpperCase()):''};
/* ===== Ресми деректер: univision.kz (ҚР Ғылым және жоғары білім министрлігінің грант нәтижелері негізінде) ===== */
const YRS=[2023,2024,2025,2026],vv=x=>x==null?'—':x;
/* GC[шифр]=[очная толық, қысқартылған, квота] — 2025 жылғы мемлекеттік грант саны */
/* GY — басқа жылдардағы грант саны (тек тексерілгендері) */
/* G26[шифр]=[барлығы, толық оқу, қысқартылған] — 2026–2027 оқу жылына республикалық бюджеттен бакалавриатқа мемлекеттік білім беру тапсырысы.
   Дереккөз: ҚР Ғылым және жоғары білім министрінің 2024 жылғы 26 сәуірдегі №193 бұйрығы, 1-қосымша (17.07.2026 №340 бұйрықпен енгізілген өзгерістерімен). */
/* 2026: квоталар топқа емес, білім беру саласына бөлінеді (сол бұйрық) */
/* 2025: денсаулық сақтау топтары (univision кестесінде жоқ) — №193 бұйрық, 2025–2026 қосымшасы */
const SRC_GR={u25:'https://univision.kz/grant/count/bachelor.html',dec:'https://zakon.uchet.kz/kaz/docs/G24HN000193',nct:'https://testcenter.kz/?page_id=45050&lang=ru'};
const fmt=n=>n==null?'—':String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function grantHtml(c){const a=GC[c],b=G26[c],f=fieldOf(c);
 if(!a&&!b)return `<p class="note">Бұл топқа 2025 және 2026 жылдары республикалық бюджеттен жалпы конкурсқа грант бөлінбеген немесе ресми тізімде жоқ.</p>`;
 const full25=a?a[0]:null,full26=b?b[1]:null,mx=Math.max(full25||0,full26||0,1);
 const card=(y,full,sub,cls)=>`<div class="gyc ${cls}"><span class="gy-y">${y}</span><b>${full==null?'—':fmt(full)}</b><small>толық күндізгі оқу</small><i class="gy-bar"><i style="width:${full?full/mx*100:0}%"></i></i><em>${sub}</em></div>`;
 let delta='';if(full25!=null&&full26!=null&&full25>0){const d=full26-full25,p=Math.round(d/full25*100);delta=`<p class="gy-d ${d>=0?'up':'down'}">${d>=0?'▲':'▼'} 2026 жылы толық оқуға ${d>=0?'+':''}${fmt(d)} грант (${d>=0?'+':''}${p}%)</p>`}
 const s25=a?`қысқартылған ${fmt(a[1])}${a[2]!=null?` · квота ${fmt(a[2])}`:''}`:'бұл жылы бөлінбеген';
 const s26=b?`қысқартылған ${fmt(b[2])} · барлығы ${fmt(b[0])}`:'бұл жылы бөлінбеген';
 return `<div class="gy">${card(2025,full25,s25,'y25')}${card(2026,full26,s26,'y26')}</div>${delta}
 <div class="xs"><table class="xt"><tr><th>Жыл</th><th>Толық оқу</th><th>Қысқартылған</th><th>Квота</th><th>Барлығы</th></tr>
 <tr><td>2025–2026</td><td><b>${fmt(full25)}</b></td><td>${a?fmt(a[1]):'—'}</td><td>${a&&a[2]!=null?fmt(a[2]):'—'}</td><td>${a?fmt(a[0]+a[1]+(a[2]||0)):'—'}</td></tr>
 <tr><td>2026–2027</td><td><b>${fmt(full26)}</b></td><td>${b?fmt(b[2]):'—'}</td><td>${b&&Q26[f]?`салаға ортақ: ${fmt(Q26[f])}`:'—'}</td><td>${b?fmt(b[0]):'—'}</td></tr></table></div>
 <p class="note">2026–2027: ҚР ҒЖБМ 2024 жылғы 26 сәуірдегі №193 бұйрығы (17.07.2026 өзгерістерімен), республикалық бюджет, жалпы тізім. 2026 жылы квоталар топқа емес, бүкіл салаға бөлінеді${Q26[f]?` («${Q26N[f]}» саласына барлығы ${fmt(Q26[f])} квоталық грант)`:''}. 2025–2026: univision.kz-тегі ҰТО конкурс кестесі${['B084','B085','BM086','BM088','BM089'].includes(c)?' (денсаулық сақтау топтары — №193 бұйрықтың 2025–2026 қосымшасы)':''}. Батыс өңірлер, «Серпін», екі дипломды және облыстық бюджет гранттары бұл санға кірмейді. 2024 жылғы сандар бұйрықта тек конкурстан кейін қайта бөлінген түрде сақталған, сондықтан шатастырмау үшін қосылмады.<br><a href="${SRC_GR.dec}" target="_blank" rel="noopener noreferrer">№193 бұйрық (zakon.uchet.kz)</a> · <a href="${SRC_GR.nct}" target="_blank" rel="noopener noreferrer">ҰТО: 2026–2027 тапсырыс</a> · <a href="${SRC_GR.u25}" target="_blank" rel="noopener noreferrer">univision.kz: 2025</a></p>`}

/* PS[шифр]={gen:{жыл:[max,min]},rural:{жыл:[max,min]}} — грантқа өту балдары (тек тексерілгендері) */
const gcYear=(c,y)=>y===2025?GC[c]:(GY[c]||{})[y];
/* Грант тарихы: әр жыл — жалпы конкурс (грант саны, Max, Min) және ауылдық квота (Max, Min). Белгісіз мән — «—». */
const gcFull=(c,y)=>y===2026?(G26[c]?G26[c][1]:null):y===2025?(GC[c]?GC[c][0]:null):(((GY[c]||{})[y])||[])[0]??null;
const muHtml=c=>{const d=PS[c]||{},g=d.gen||{},r=d.rural||{};
 const mm=(a)=>`<div class="mm"><span>Max: <b>${vv((a||[])[0])}</b></span><span>Min: <b>${vv((a||[])[1])}</b></span></div>`;
 const gen=YRS.map(y=>{const n=gcFull(c,y);return `<div class="hy"><h5>Жалпы конкурс: ${y}</h5>${mm(g[y])}<p class="hg">Грант саны: <b>${n==null?'—':fmt(n)}</b></p></div>`}).join('');
 const rur=YRS.map(y=>`<div class="hy"><h5>Ауылдық квота: ${y}</h5>${mm(r[y])}</div>`).join('');
 const any=YRS.some(y=>g[y]||r[y]);
 return `<details class="acc hist" open><summary>Грантқа өту балдары (Min/Max) және грант саны</summary><div class="ab"><div class="hgrid">${gen}</div><div class="hgrid">${rur}</div>
 <p class="note"><span>Max — грантқа түскендердің ең жоғары балы, Min — ең төменгі балы (күндізгі толық оқу, республикалық тапсырыстың жалпы тізімі). 2026 жылғы балдар ҒЖБМ жариялаған «2026-2027 оқу жылына арналған білім беру гранты иегерлерінің тізімінен» есептелді. Грант саны — республикалық бюджеттен күндізгі толық оқуға жалпы конкурсқа бөлінген гранттар.</span> <span>${any?'2023–2025 жылдардың өту балдары әзірге енгізілмеген («—»).':'2026 жылғы жалпы конкурс тізімінде (күндізгі толық оқу) бұл топ кездеспейді: оның гранттары басқа тізімдерде (мысалы, колледж негізіндегі қысқартылған оқу немесе жеке квоталар). Сондықтан Max/Min көрсетілмеген.'}</span></p>
 <details class="acc sub"><summary>2025 және 2026 жылғы грант бөлінісі толығырақ</summary><div class="ab">${grantHtml(c)}</div></details></div></details>`};
function renderUnis(d){
 $('uCount').textContent=d.length+' ЖОО · толық ақпарат үшін басыңыз';
 $('uniList').innerHTML=d.length?d.map(u=>`<div class="ur" role="button" tabindex="0" aria-label="${u.name}: толық ақпарат" onclick="openUni('${u.code}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openUni('${u.code}')}"><span class="c">${lg(u)}<em>${u.code}</em></span><span class="n">${u.name}<small>${u.type}</small></span><span>${u.city}</span><span class="chev" aria-hidden="true">›</span></div>`).join(''):'<div class="empty">Ештеңе табылмады. Басқа код немесе қала атауын енгізіңіз.</div>';
}

/* ===== ЖОО: жатақхана, әскери кафедра, мамандықтар (ЕПВО тізілімі) ===== */
const UXU=c=>((window.UX||{}).universities||{})[c]||{};
const grpName=g=>{const m=majors.find(x=>x.code===g);if(m)return m.name;const e=((window.UX||{}).extra_groups||{})[g];if(!e)return g;const i={ru:1,en:2}[window.BZ_LANG]||0;return e[i]||e[0]};
const srcA=u=>u?` <a class="src" href="${u}" target="_blank" rel="noopener noreferrer">дереккөз ↗</a>`:'';
/* ===== Рейтинг (QS) және жалақы (ҰСБ) ===== */
function uniRank(c){const R=(window.RANK||{}).universities||{},r=R[c];if(!r)return '';
 const it=[['qs_world_2027','QS World 2027'],['qs_world_2026','QS World 2026'],['qs_asia_2027','QS Asia 2027']].filter(([k])=>r[k]);
 return `<h4 class="relh">Халықаралық рейтинг</h4><div class="facts">${it.map(([k,l])=>`<div class="fact"><i aria-hidden="true">🏆</i><span>${l}</span><b class="yes">${r[k]==='—'?'Тізімнен шықты':'№ '+esc(r[k])}</b>${srcA((RANK.sources||{})[k])}</div>`).join('')}</div><p class="note">QS 2027 бойынша тек ашық жарияланған орындар көрсетілді.</p>`}
function salHtml(c){const S=window.SAL;if(!S)return '';const k=(S.major_sector||{})[c];if(!k)return '';const L=window.BZ_LANG||'kk',sec=S.sectors[k],all=S.sectors.all,nm=x=>L==='ru'?x.ru:L==='en'?x.en:x.kk,f=n=>n.toLocaleString('ru-RU').replace(/,/g,' ');
 const pct=Math.round(sec.wage/all.wage*100);
 return `<h4 class="dsec">Жалақы: сала бойынша орташа</h4><div class="dgrid"><div class="dbox"><span>${esc(nm(sec))}</span><b>${f(sec.wage)} ₸ / ай</b><div class="gbar" aria-hidden="true"><i style="left:0;width:${Math.min(100,sec.wage/1200000*100)}%"></i></div></div><div class="dbox"><span>Ел бойынша орташа</span><b>${f(all.wage)} ₸ / ай</b><small class="pct ${pct>=100?'up':'dn'}">Ел орташасымен салыстырғанда: ${pct}%</small></div></div><p class="note">${esc((S.note||{})[L]||S.note.kk)} Кезең: ${esc(L==='ru'?S.period_ru:L==='en'?S.period_en:S.period)}${srcA(S.source)}</p>`}
function uniFacts(c){const x=UXU(c);
 const dorm=x.dorm===true?'<b class="yes">Бар</b>':'<b class="unk">Расталмады</b>';
 const mil=x.military===true?'<b class="yes">Бар</b>':x.military===false?'<b class="no">Жоқ</b>':'<b class="unk">Расталмады</b>';
 return `<div class="facts"><div class="fact"><i aria-hidden="true">🏠</i><span>Жатақхана</span>${dorm}${srcA(x.dorm_src)}</div><div class="fact"><i aria-hidden="true">🎖</i><span>Әскери кафедра</span>${mil}${srcA(x.military_src)}</div></div>`}
/* Грант конкурсына шекті балл: ЖОО-ның өз кестесі (uni_thresholds.json), болмаса министрлік бекіткен ең төменгі шек */
const NATU=c=>{const u=universities.find(x=>x.code===c);return !!u&&/ұлттық/i.test(u.name)};
function thrMin(uc,g){const m=majors.find(x=>x.code===g);const f=fieldOf(g);let b=+(m&&m.grantScore)||(f==='health'?70:f==='ped'?75:50);
 if(b===50&&NATU(uc)&&f!=='agr'&&f!=='vet')b=65;return b}
function thrOf(uc,g){const U=((window.UT||{}).unis||{})[uc];const v=U&&U.t&&U.t[g];
 if(v&&v[0]!=null)return{v:v[0],own:true,src:U.src};return{v:thrMin(uc,g),own:false}}
function uniPrograms(c){const x=UXU(c),P=x.programs||[];const U=((window.UT||{}).unis||{})[c];
 const tag=g=>{const m=majors.find(y=>y.code===g);const k=m&&(m.combo_kk||m.combo)||'';return k?(k.startsWith('Шығарма')?'Шығармашылық':k.replace(/\s*\+\s*/,' – ')):''};
 const rows=P.map(g=>{const t=thrOf(c,g),has=majors.some(m=>m.code===g),T=tag(g);
  const name=`<b class="tp-n">${esc(grpName(g))}</b>${T?`<span class="tp-t${T==='Шығармашылық'?' cr':''}">${esc(T)}</span>`:''}`;
  return `<${has?`a href="#/major/${g}"`:'div'} class="tp-r"><span class="tp-c">${g.replace(/^BM/,'B')}</span><span class="tp-m">${name}</span><span class="tp-v${t.own?'':' min'}" title="${t.own?'ЖОО белгілеген шекті балл (грант конкурсы)':'Министрлік бекіткен ең төменгі шекті балл. ЖОО өз шегін жоғарырақ қоюы мүмкін.'}">${t.v}${t.own?'':'<small>мин.</small>'}</span></${has?'a':'div'}>`}).join('');
 const body=P.length?`<div class="tp"><div class="tp-h"><span>Код</span><span>Мамандық (БББТ)</span><span>Шекті балл<small>грант конкурсы үшін</small></span></div>${rows}</div>`:`<p class="note">Тізілімде бакалавриат бағдарламалары табылмады. Нақты тізімді ЖОО-дан сұраңыз.</p>`;
 const note=U?`Шекті балл: ЖОО-ның 2026-2027 оқу жылына бекіткен кестесі${srcA(U.src)}. «мин.» белгісі — ЖОО кестесінде жоқ топ, министрлік бекіткен ең төменгі шек көрсетілді.`:`Шекті балл: министрлік бекіткен ең төменгі шек (жалпы 50, ұлттық ЖОО 65, педагогика мен құқық 75, денсаулық сақтау 70, ауыл шаруашылығы мен ветеринария 50). ЖОО өз шегін жоғарырақ қоюы мүмкін — оны ЖОО-ның «Талапкерге» бөлімінен тексеріңіз.`;
 return `<h4 class="relh">Осы университеттегі мамандықтар${P.length?` <small>${P.length} мамандық тобы</small>`:''}</h4>${body}<p class="note">${note}</p><p class="note">Мамандықтар тізімі: Білім беру бағдарламаларының тізілімі (ЕПВО)${srcA(x.programs_src)} · тексерілді 16.11.2026</p>`}
/* ===== Мамандық: оны оқытатын ЖОО-лар ===== */
function offeredHtml(code){const ux=(window.UX||{}).universities||{};
 const L=universities.filter(u=>(ux[u.code]&&ux[u.code].programs||[]).includes(code));
 if(!L.length)return `<h4 class="dsec">Бұл мамандықты оқытатын университеттер</h4><p class="note">Бұл мамандықты оқытатын ЖОО тізілімде табылмады.</p>`;
 const cities=Object.entries(L.reduce((a,u)=>(a[u.city]=(a[u.city]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
 return `<h4 class="dsec">Бұл мамандықты оқытатын университеттер <small>${L.length}</small></h4>
 <div class="chips offc">${[['','Барлық қала',L.length],...cities.map(([c,n])=>[c,c,n])].map(([c,l,n])=>`<button type="button" class="${c?'':'on'}" data-c="${esc(c)}" onclick="offFilter(this)">${esc(l)} <small>${n}</small></button>`).join('')}</div>
 <div class="offl">${L.map(u=>`<a class="ofr" data-c="${esc(u.city)}" href="#/uni/${u.code}"><span class="code">${u.code}</span><b>${esc(u.name)}</b><small>${esc(u.city)}</small></a>`).join('')}</div>
 <p class="note">Дереккөз: Білім беру бағдарламаларының тізілімі (ЕПВО) · тексерілді 16.11.2026</p>`}
function offFilter(b){const box=b.closest('.offc'),c=b.dataset.c;box.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));box.nextElementSibling.querySelectorAll('.ofr').forEach(r=>r.hidden=!!c&&r.dataset.c!==c)}
function openUni(c){
 const u=universities.find(x=>x.code===c);if(!u)return;
 const m=u.grantScore.match(/^(\d+)\s*-\s*(\d+)$/),site=SITES[c];
 const bar=m?`<div class="gbar" aria-hidden="true"><i style="left:${m[1]/140*100}%;width:${(m[2]-m[1])/140*100}%"></i></div><div class="gsc"><span>0</span><span>140</span></div>`:'';
 const link=site?`<a class="btn site" href="https://${site}" target="_blank" rel="noopener noreferrer">Ресми сайтқа өту: ${site} ↗</a>`:`<a class="btn site alt" href="https://www.google.com/search?q=${encodeURIComponent(u.name+' ресми сайт')}" target="_blank" rel="noopener noreferrer">Ресми сайтты іздеу ↗</a>`;
 $('dBody').innerHTML=`${lg(u)}<span class="code" style="margin-left:10px">ЖОО коды ${u.code}</span><h3 id="dName">${u.name}</h3><p class="meta">${u.type}, ${u.city}</p>
 <div class="dgrid"><div class="dbox"><span>Грант балдары</span><b>${u.grantScore}</b>${bar}</div><div class="dbox"><span>Оқу ақысы</span><b>${u.tuition}</b></div></div>
 ${uniFacts(c)}${uniRank(c)}${uniPrograms(c)}
 <p class="note">Көрсетілген мәліметтер анықтамалық. Нақты шарттарды ЖОО-ның ресми сайтынан тексеріңіз.</p>${link}<section class="urev" data-uni="${c}"></section>`;
 $('uniDlg').showModal();
}
['uniDlg','majDlg','forDlg'].forEach(i=>$(i).addEventListener('click',e=>{if(e.target===$(i))$(i).close()}));

const VT=['Нақтылау қажет','Мерзім мен талаптар тексерілген','Ресми дерекпен толық тексерілген'];
/* ===== v23: шетелдік ЖОО тізімі кеңейтілді, деректер жаңартылды (2026 ж. қараша) ===== */
VT.splice(0,3,'Нақтылау қажет','Ішінара тексерілген (оқу ақысы немесе мерзім)','Ресми дерекпен толық тексерілген');

function renderForeign(d){setTimeout(loadPhotos,0);
 $('fCount').textContent=d.length+' университет · толық ақпарат үшін басыңыз';
 $('foreignList').innerHTML=d.length?d.map(f=>`<div class="ur fo" data-id="${f.id}" role="button" tabindex="0" aria-label="${f.name}: толық ақпарат" onclick="openForeign('${f.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openForeign('${f.id}')}"><span class="fh"><span class="ctag">${f.country}</span>${flg(f)}</span><span class="n">${f.name}<i class="vt v${f.ver}" title="${VT[f.ver]}"></i><small>${f.kz}</small></span><span>${f.city}</span><button class="hb" onclick="event.stopPropagation();openForeign('${f.id}',1)">Тарихы →</button></div>`).join(''):'<div class="empty">Ештеңе табылмады.</div>';
}
function openForeign(id,hs){
 const f=FOREIGN.find(x=>x.id===id);if(!f)return;S.lf=f;S.last='f';
 $('fBody').innerHTML=`${flg(f)}<span class="code" style="margin-left:10px">${f.country}</span><h3 id="fName">${f.name}</h3><p class="meta">${f.kz}, ${f.city}</p>
 <div class="dgrid"><div class="dbox"><span>Оқу ақысы</span><b>${f.tuition}</b></div><div class="dbox"><span>Мерзімдер</span><b>${f.deadlines}</b></div></div>
 <p class="note">${f.tuition_note}</p>
 <h4 class="fsec">Мекенжайы</h4><p class="dtxt">${f.address}</p>
 <h4 class="fsec">Түсу талаптары</h4>${f.entry.map(r=>`<div class="drow"><span>${r[0]}</span><b style="white-space:normal;text-align:right;max-width:62%">${r[1]}</b></div>`).join('')}
 <h4 class="fsec">Түсу процесі</h4><ol class="fol">${f.process.map(s=>`<li>${s}</li>`).join('')}</ol>
 <h4 class="fsec">Қаржылық көмек</h4><p class="dtxt">${f.aid}</p>
 <div class="vrf"><b>Деректің тексерілу жағдайы: ${VT[f.ver]}.</b> ${f.status}${f.ver>0?' Тексерілген уақыты: 2026 жылдың қазаны.':''} Бағалар мен мерзімдер өзгереді, өтініш бермес бұрын ресми бетті қараңыз.<br>${f.sources.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener noreferrer">${s[0]}</a>`).join('<br>')}</div>
 <a class="btn site" style="margin-top:16px" href="${f.site}" target="_blank" rel="noopener noreferrer">Ресми сайтқа өту ↗</a>`;
 if(PH[f.id])$('fBody').insertAdjacentHTML('afterbegin',`<img class="fph" src="${PH[f.id]}" alt="${f.name}">`);$('fBody').insertAdjacentHTML('beforeend',histHtml(f.id,hs));$('forDlg').showModal();if(hs)setTimeout(()=>$('hist').scrollIntoView({block:'start'}),80);
}
function filterData(){
 const srch=document.body.dataset.page==='search',g=$('q').value.trim().toLowerCase(),lv=id=>($(id)&&$(id).value||'').trim().toLowerCase();
 const qm=srch?g:lv('mQ'),qu=srch?g:lv('uQ'),qf=srch?g:lv('fQ'),ut=srch?'':($('uT')&&$('uT').value||'');
 renderMajors(majors.filter(m=>(srch||!S.mf||fieldOf(m.code)===S.mf)&&(m.name.toLowerCase().includes(qm)||m.code.toLowerCase().includes(qm)||(m.combo||'').toLowerCase().includes(qm))));
 renderForeign(FOREIGN.filter(f=>(srch||!S.fc||f.country===S.fc)&&[f.name,f.kz,f.country,f.city].join(' ').toLowerCase().includes(qf)));
 renderUnis(universities.filter(u=>(srch||!S.uc||u.city===S.uc)&&(!ut||u.type===ut)&&(u.name.toLowerCase().includes(qu)||u.code.includes(qu)||u.city.toLowerCase().includes(qu))));
}
function hint(v){$('q').value=v;filterData();go('#/search')}
function calc(){
 const s=parseInt($('score').value),o=$('calcOut');
 if(isNaN(s)||s<0||s>140){o.textContent='Қате: 0 мен 140 аралығындағы балды енгізіңіз.';return}
 const ok=majors.filter(m=>!isCre(m)&&s>=parseInt(m.grantScore)),cr=majors.filter(m=>isCre(m)&&s>=parseInt(m.grantScore));
 o.innerHTML=`Сіздің балыңыз: <b>${s}</b>. Шектік балға жететін мамандықтар: <b>${ok.length}</b>. Шығармашылық емтихан тапсырылатын бағыттар: <b>${cr.length}</b>.<div class="chips">${ok.slice(0,14).map(m=>`<span>${m.code} ${m.name}</span>`).join('')}${ok.length>14?`<span>және тағы ${ok.length-14}</span>`:''}</div>`;
}
/* ===== BilimIzde AI: жергілікті «сарапшы» қозғалтқыш ===== */
const KZM={'ә':'а','ғ':'г','қ':'к','ң':'н','ө':'о','ұ':'у','ү':'у','һ':'х','і':'и','ё':'е'};
const nz=s=>String(s).toLowerCase().replace(/[әғқңөұүһіё]/g,c=>KZM[c]).replace(/[^a-zа-я0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const st=w=>w.slice(0,5), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toks=s=>nz(s).split(' ').filter(w=>w.length>2).map(st);
const MN=majors.map(m=>({m,k:[...new Set(toks(m.name))]})), UN=universities.map(u=>({u,k:[...new Set(toks(u.name+' '+u.city))]}));
const idf=(L=>{const d={};L.forEach(e=>e.k.forEach(w=>d[w]=(d[w]||0)+1));return w=>Math.log((L.length+1)/((d[w]||0)+.5))});
const idM=idf(MN),idU=idf(UN);
const SYN=[['программист|кодер|разработ|бағдарламашы|айти|\\bit\\b|компьютер|хакер|интеллект|кибер','ақпараттық технологиялар компьютерлік қауіпсіздік криптология модельдеу'],
['дәрігер|врач|доктор|медицин|хирург|медбике|мейіргер|фармацевт|стоматолог|емші','медицина педиатрия фармация мейіргер медициналық'],
['мұғалім|мугалим|учител|педагог|тәрбиеші|воспитател','мұғалімдерін педагогика даярлау'],
['заңгер|юрист|адвокат|прокурор|судья|құқық|кукык|право','құқық юриспруденция'],
['экономист|банк|финанс|қаржы|бизнес|менеджер|маркетолог|бухгалтер|аудит','экономика қаржы менеджмент маркетинг аудит'],
['инженер|строител|құрылыс|сәулет|архитект|энергет|мұнай|нефть|механик|металл|көлік|транспорт|тау-кен','құрылыс сәулет энергетика мұнай механика металлургия көлік тау-кен'],
['журналист|блогер|тілші|репортер|\\bpr\\b|пиар','журналистика қоғаммен байланыс'],['психолог','психология'],
['аудармашы|переводчик|лингвист|филолог','аударма филология шет тілі'],
['әртіс|актер|артист|музыкант|музыка|өнер|дизайн|хореограф|режиссер|художник|сурет','өнер театр музыка дизайн хореография режиссура бейнелеу'],
['ветеринар|аграр|фермер|агроном|орман|балық','ветеринария өсімдік мал орман балық агроинженерия'],
['турист|мейманхана|отель|ресторан|гид','туризм мейманхана мейрамхана тынығу'],
['тарихшы|археолог|историк','тарих археология этнология'],['дипломат|халықаралық|международн|саясат|политолог','халықаралық саясаттану дипломатия'],
['ұшқыш|пилот|авиация|самолет|ұшақ','әуе ұшатын'],['химик','химия химиялық'],['биолог','биологиялық биология'],['физик','физика'],['математик','математика статистика'],
['экология|қоршаған','қоршаған орта'],['әлеуметтік жұмыс|социальный','әлеуметтік жұмыс']].map(([r,e])=>[new RegExp(nz(r.replace(/\\b/g,'')).replace(/ /g,'|').replace(/\|\|/g,'|')),toks(e)]);
const SUBJ=[['математик','Математика'],['физик','Физика'],['информатик|программир','Информатика'],['биолог','Биология'],['хими','Химия'],['географ','География'],['тарих|истори','Дүниежүзі тарихы'],['шет тил|шетел|агылшын|англий|иностран','Шет тілі'],['казак тил|орыс тил|русск|адебиет|литератур','әдебиеті'],['кукык|право','Құқық'],['шыгармашыл|творч','Шығармашылық']];
const CITYALIAS={ураль:'Орал',семип:'Семей',усть:'Өскемен',алма:'Алматы',нур:'Астана',акмол:'Астана',гурье:'Атырау'};
const CITIES=[...new Set(universities.map(u=>u.city))];
const S={score:null,lm:null,lu:null,flow:null};
const mbox=()=>$('msgs');
const num=s=>parseInt(String(s).replace(/\D/g,''));
const tmin=u=>num(u.tuition.split('-')[0]),tmax=u=>num((u.tuition.split('-')[1]||u.tuition.split('-')[0]));
const thr=m=>parseInt(m.grantScore);
const sc=()=>S.score!=null?S.score:(v=>isNaN(v)||v<0||v>140?null:v)(parseInt($('score').value));
const cm=m=>`<button class="ch" onclick="openMajor('${m.code}')">${m.code} ${esc(m.name.length>46?m.name.slice(0,44)+'…':m.name)} <i>${thr(m)}</i></button>`;
const cu=u=>`<button class="ch" onclick="openUni('${u.code}')">${esc(u.name.length>50?u.name.slice(0,48)+'…':u.name)} <i>${u.city}</i></button>`;
const chips=(a,f,n=10)=>`<div class="chs">${a.slice(0,n).map(f).join('')}${a.length>n?`<span class="more">және тағы ${a.length-n}</span>`:''}</div>`;
function bubble(html,me){const d=document.createElement('div');if(me){d.className='me';d.textContent=html}else d.innerHTML=html;mbox().appendChild(d);mbox().scrollTop=mbox().scrollHeight;return d}
function setQR(a){$('sbadge').textContent=S.score!=null?'Балыңыз: '+S.score:'';$('qr').innerHTML=a.map(t=>`<button onclick="say(this.textContent)">${esc(t)}</button>`).join('')}
function say(t){$('aiIn').value=t;askAI()}
function clearChat(){mbox().innerHTML='';S.flow=null;S.lm=S.lu=null;greet(true)}
function greet(first){bubble(`Сәлеметсіз бе! Мен <b>BilimIzde AI</b> көмекшісімін. Мамандықтар мен университеттерді табуға, ҰБТ балыңызды бағалауға және пән таңдауға көмектесемін. Қазақша да, орысша да жаза беріңіз.`);setQR(['Мамандық таңдау тесті','B057 деген не?','Алматыдағы ЖОО','Ең арзан университеттер','110 балл бар, не істей аламын?','ҰБТ құрылымы'])}
function bestM(q,extra=[]){const t=[...new Set([...toks(q),...extra])];return MN.map(e=>({m:e.m,s:t.reduce((a,w)=>a+(e.k.includes(w)?idM(w):0),0)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||thr(a.m)-thr(b.m))}
function bestU(q){const t=[...new Set(toks(q))];return UN.map(e=>({u:e.u,s:t.reduce((a,w)=>a+(e.k.includes(w)?idU(w):0),0)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s)}
function cityOf(q){const t=nz(q).split(' ');for(const w of t){const s=st(w);for(const c of CITIES)if(st(nz(c))===s)return c;for(const k in CITYALIAS)if(w.startsWith(k))return CITYALIAS[k]}return null}
function uniCard(u){S.lu=u;S.last='u';const g=u.grantScore.match(/^(\d+)\s*-\s*(\d+)$/),site=SITES[u.code];
 return `<b>${esc(u.name)}</b><br>Код: <b>${u.code}</b> · ${u.type} · ${u.city}<br>Грант балдары: <b>${u.grantScore}</b><br>Оқу ақысы: <b>${u.tuition}</b>${g&&sc()!=null?`<br>${sc()>=+g[2]?'Балыңыз бұл ЖОО-ның жоғарғы шегіне де жетеді.':sc()>=+g[1]?'Балыңыз ЖОО-ның ауқымында тұр, бірақ нақты өту балы бағдарламаға байланысты.':'Балыңыз бұл ЖОО-ның төменгі шегінен төмен.'}`:''}<div class="chs"><button class="ch" onclick="openUni('${u.code}')">Толық ақпарат</button>${site?`<a class="ch" href="https://${site}" target="_blank" rel="noopener noreferrer">Ресми сайт ↗</a>`:''}</div>`}
function majCard(m){S.lm=m;S.last='m';const f=FIELDS[fieldOf(m.code)],s=sc();
 return `<b>${m.code} ${esc(m.name)}</b><br>Шектік бал: <b>${thr(m)}</b>${m.combo?`<br>Пәндер: <b>${m.combo}</b>`:''}${f?`<br>Сала: ${f[0]}`:''}${s!=null?`<br>${s>=thr(m)?'Балыңыз шектен асады.':`Шекке жету үшін тағы ${thr(m)-s} балл керек.`}`:''}<div class="chs"><button class="ch" onclick="openMajor('${m.code}')">Толық ақпарат</button></div>`}
function startQuiz(){S.flow={step:1,subj:[]};const o=['Математика','Физика','Информатика','Биология','Химия','География','Тарих','Шет тілі','Тіл және әдебиет','Құқық','Өнер'];
 bubble('Тест: бірнеше сұрақпен саған сай мамандықтарды таңдаймын. <b>1/2.</b> Қай пәндер ұнайды? Бірнешеуін басып, «Дайын» деп жаз.');
 $('qr').innerHTML=o.map(t=>`<button class="tg" onclick="this.classList.toggle('on')">${t}</button>`).join('')+`<button class="go" onclick="quizNext()">Дайын</button>`}
function quizNext(){const sel=[...document.querySelectorAll('#qr .tg.on')].map(b=>b.textContent);if(!sel.length){bubble('Кемінде бір пәнді таңда.');return}
 S.flow={step:2,subj:sel};bubble(sel.join(', '),1);
 if(sc()!=null)return quizEnd();
 bubble('<b>2/2.</b> ҰБТ-дағы болжамды балың қанша? Санды жаз немесе ауқымды таңда.');
 $('qr').innerHTML=[['50–69',50],['70–89',70],['90–109',90],['110–124',110],['125+',125]].map(([l,v])=>`<button onclick="S.score=${v};$('score').value=${v};bubble('${l}',1);quizEnd()">${l}</button>`).join('')}
function quizEnd(){const map={'Тарих':'Дүниежүзі тарихы','Тіл және әдебиет':'әдебиеті','Өнер':'Шығармашылық'},sel=S.flow.subj.map(x=>map[x]||x),s=sc();S.flow=null;
 const r=majors.map(m=>({m,n:sel.filter(x=>(m.combo||'').includes(x)).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n||thr(a.m)-thr(b.m)),ok=r.filter(x=>thr(x.m)<=s),no=r.length-ok.length;
 const both=ok.filter(x=>x.n>1);
 bubble(ok.length?`Балың <b>${s}</b> болса, таңдаған пәндер бойынша <b>${ok.length}</b> мамандық шектік балға жетеді.${both.length?` Екі пәнің де сәйкес келетіндері: <b>${both.length}</b>.`:''}${chips((both.length?both:ok).map(x=>x.m),cm,10)}${no?`Тағы ${no} мамандыққа балың жетпейді, оларға дайындалсаң болады.`:''}`:`Бұл пәндер бойынша балың (${s}) шектен төмен. Балды көтеру үшін дайындықты күшейтіп көр немесе басқа пәндерді таңда.`);
 setQR(['Мамандық таңдау тесті','Шектік балл туралы','Ең арзан университеттер','Алматыдағы ЖОО'])}
const FACTS={ubt:'ҰБТ-да үш міндетті пән (Қазақстан тарихы, Оқу сауаттылығы, Математикалық сауаттылық) және екі бейіндік пән тапсырылады. Барлығы 120 тапсырма, ең жоғары нәтиже 140 балл. Қазақстан тарихы мен әр бейіндік пәннен (немесе шығармашылық емтиханнан) кемінде 5, ал Оқу және Математикалық сауаттылықтан кемінде 3 балл жинау керек.',
 thr:'Мемлекеттік шектік баллдар: Педагогикалық ғылымдар мен Құқық бағыттары үшін 75 балл, Денсаулық сақтау үшін 70, қалған бағыттар үшін 50. Ұлттық ЖОО-ларға түсу шегі 65 балл. ЖОО әр бағдарлама бойынша өту балын жоғарырақ белгілей алады, ал грантқа нақты өту балы әдетте шектен жоғары болады.',
 grant:'2026–2027 оқу жылына бакалавриатқа 75 371 мемлекеттік грант бөлінген. Грант байқауына қатысу үшін ҰБТ-дан шектік балл жинау керек, ал грантты өтініштерді баллға қарай саралап береді. Нақты өту балдарын сайттағы «Өткен жылдар» бетінен қараңыз.'};
function reply(raw){
 const q=nz(raw),low=raw.toLowerCase();let m;
 const ms=low.match(/(?:^|[^a-zа-я0-9])(?:b|в)(m?)\s?(\d{3})(?!\d)/i),sm=/\b(75|70|50)\b\s*бал[а-я]*\s+(мамандык|шек|порог|багыт)/.test(q)?null:q.match(/(\d{2,3})\s*(?:бал|ұпай|упай)/)||q.match(/(?:бал|убт|ент|набрал|жинад)\D{0,12}(\d{2,3})/);
 let scoreSet=false;if(sm&&+sm[1]>=0&&+sm[1]<=140){S.score=+sm[1];$('score').value=S.score;scoreSet=true}
 {const fx=foreignAI(q,low);if(fx&&!scoreSet)return fx}
 if(/^(салем|привет|здравств|hello|hi$|ассалау|кайырлы)/.test(q))return{h:'Сәлем! Қалай көмектесе аламын? Мамандық, ЖОО немесе ҰБТ балы туралы сұраңыз.',qr:['Мамандық таңдау тесті','Алматыдағы ЖОО','ҰБТ құрылымы']};
 if(/рахмет|спасибо|thank|сагол/.test(q))return{h:'Оқасы жоқ! Басқа сұрақ болса, жаза беріңіз.'};
 if(/^(комек|помощ|help)|что умеешь|сен не истей|мумкиндик/.test(q))return{h:`Мен мыналарды істей аламын: <br>• мамандықты шифр немесе атау бойынша табу (B057, «дәрігер», «IT»)<br>• ЖОО-ны код, атау немесе қала бойынша табу<br>• балға қарай мамандықтарды сүзу («110 балл бар»)<br>• пәндер жұбы бойынша іздеу («Математика + Физика»)<br>• ең арзан/қымбат ЖОО, екі ЖОО-ны немесе мамандықты салыстыру<br>• мамандық таңдау тесті`,qr:['Мамандық таңдау тесті','Математика және физика','Салыстыр B057 және B058']};
 if(/тест|викторин|подбер|нени оку|нени оки|не окыр|кайда тус|тандауга/.test(q))return{fn:startQuiz};
 if(/шектик бал|порог|шек бал|минимал/.test(q)||/^\d{2}\s*бал.*шек/.test(q))return{h:FACTS.thr,qr:['75 балл мамандықтар','70 балл мамандықтар','ҰБТ құрылымы']};
 if(/(75|70|50)\s*(бал|порог)/.test(q)&&/мамандык|специальн|список|ким/.test(q)||/мамандык.*\b(75|70)\b/.test(q)){const v=+(q.match(/\b(75|70|50)\b/)||[])[1],a=majors.filter(x=>thr(x)===v);return{h:`Шектік бал <b>${v}</b> болатын мамандықтар: <b>${a.length}</b>.${chips(a,cm,12)}`}}
 if(/(^| )(убт|ент)( |$)/.test(q)&&/курылым|структур|канша|сколько|максимал|пан|предмет|тапсыр|сдава/.test(q))return{h:FACTS.ubt,qr:['Шектік балл туралы','Грант туралы']};
 if(/грант/.test(q)&&!ms&&!/жоо|унив/.test(q))return{h:FACTS.grant,qr:['Шектік балл туралы','ҰБТ құрылымы']};
 if(/салыстыр|сравн|\bvs\b|кайсысы/.test(q)){
  const cs=[...low.matchAll(/(?:^|[^a-zа-я0-9])(?:b|в)(m?)\s?(\d{3})(?!\d)/gi)].map(x=>majors.find(a=>a.code===('B'+x[1]+x[2]).toUpperCase()||a.code==='B'+x[2]||a.code==='BM'+x[2])).filter(Boolean);
  if(cs.length>=2){const[a,b]=cs;return{h:`<table class="cmp"><tr><th></th><th>${a.code}</th><th>${b.code}</th></tr><tr><td>Атауы</td><td>${esc(a.name)}</td><td>${esc(b.name)}</td></tr><tr><td>Шектік бал</td><td>${thr(a)}</td><td>${thr(b)}</td></tr><tr><td>Пәндер</td><td>${a.combo||'—'}</td><td>${b.combo||'—'}</td></tr><tr><td>Сала</td><td>${(FIELDS[fieldOf(a.code)]||['—'])[0]}</td><td>${(FIELDS[fieldOf(b.code)]||['—'])[0]}</td></tr></table>`};}
  const us=[],seen=new Set();q.split(/ және | и | мен |,| vs /).forEach(p=>{const r=bestU(p)[0];if(r&&r.s>1.5&&!seen.has(r.u.code)){seen.add(r.u.code);us.push(r.u)}});
  if(us.length>=2){const[a,b]=us;return{h:`<table class="cmp"><tr><th></th><th>${a.code}</th><th>${b.code}</th></tr><tr><td>Атауы</td><td>${esc(a.name)}</td><td>${esc(b.name)}</td></tr><tr><td>Қала</td><td>${a.city}</td><td>${b.city}</td></tr><tr><td>Түрі</td><td>${a.type}</td><td>${b.type}</td></tr><tr><td>Грант балдары</td><td>${a.grantScore}</td><td>${b.grantScore}</td></tr><tr><td>Оқу ақысы</td><td>${a.tuition}</td><td>${b.tuition}</td></tr></table>`};}
  return{h:'Салыстыру үшін екі мамандық шифрын (мысалы, B057 және B058) немесе екі ЖОО атауын жазыңыз.'}}
 if(ms){const m=majors.find(a=>a.code===('B'+ms[1]+ms[2]).toUpperCase())||majors.find(a=>a.code==='B'+ms[2]||a.code==='BM'+ms[2]);if(m)return{h:majCard(m),qr:['Қандай пәндер керек?','Қайда жұмыс істеймін?']};return{h:`«${esc(ms[0].trim().toUpperCase())}» шифрлы мамандық табылмады. Шифрды тексеріп, қайта жазыңыз.`}}
const fo=FOREIGN.find(f=>f.keys.some(k=>(q+' ').includes(k)));
 if(fo){S.lf=fo;S.last='f';return{h:`<b>${fo.name}</b> (${fo.country}, ${fo.city})<br>Оқу ақысы: <b>${fo.tuition}</b><br>Мерзімдер: ${fo.deadlines}<div class="chs"><button class="ch" onclick="openForeign('${fo.id}')">Толық ақпарат</button></div>`,qr:['Шетелдік университеттер']}}
 if(/шетел|зарубеж|abroad|foreign/.test(q))return{h:`Шетелдік топ университеттер бөлімінде ресми деректен тексерілген университеттер бар. Қазір: ${FOREIGN.length}.${chips(FOREIGN,f=>`<button class="ch" onclick="openForeign('${f.id}')">${f.name.split(' (')[0]} <i>${f.country}</i></button>`,6)}`};
 const uc=q.match(/(?:жоо|вуз|унив\w*|код\w*)\D{0,8}\b(\d{3})\b/)||(/^\d{3}$/.test(q)?[0,q]:null);
 if(uc){const u=universities.find(a=>a.code===uc[1]);if(u)return{h:uniCard(u),qr:['Оқу ақысы қанша?','Ресми сайты қандай?']}}
 const sj=SUBJ.filter(([r])=>new RegExp(r).test(q)).map(x=>x[1]);
 if(sj.length&&(sj.length>1||/пан|предмет|комбинац|кажет|керек|тапсыр|сдава|кандай/.test(q))){const a=majors.filter(m=>sj.every(x=>(m.combo||'').includes(x))),s=sc(),ok=s!=null?a.filter(m=>thr(m)<=s):a;
  if(a.length)return{h:`<b>${sj.join(' + ')}</b> пәндері бар мамандықтар: <b>${a.length}</b>.${s!=null?` Балыңызға (${s}) сәйкес келетіні: <b>${ok.length}</b>.`:''}${chips(ok.length?ok:a,cm,12)}`,qr:['Мамандық таңдау тесті','Шектік балл туралы']}}
 if(/арзан|дешев|cheap|кымбат|дорог/.test(q)||(/окы ак|оку ак|бага|цена|стоим|кун/.test(q)&&!S.lu)){const exp=/кымбат|дорог/.test(q),c=cityOf(q),L=universities.filter(u=>!c||u.city===c).sort((a,b)=>exp?tmax(b)-tmax(a):tmin(a)-tmin(b)).slice(0,6);
  return{h:`${c?c+' қаласында ':''}${exp?'ең қымбат':'ең арзан'} ЖОО-лар:<br>${L.map(u=>`• <b>${esc(u.name)}</b>: ${u.tuition}`).join('<br>')}${chips(L,cu,6)}`}}
 const c=cityOf(q);
 if(c&&/жоо|унив|вуз|институт|академ|окуорын|кайда|кандай|список|тізім|бар|институты|в |да |де |та |те /.test(q+' ')&&(bestU(q.split(nz(c)).join(' '))[0]||{s:0}).s<3){const L=universities.filter(u=>u.city===c);
  return{h:`<b>${c}</b> қаласында <b>${L.length}</b> ЖОО бар.${chips(L,cu,12)}`,qr:['Ең арзан университеттер',`${c} ең қымбат ЖОО`]}}
 const ex=SYN.filter(([r])=>r.test(q)).flatMap(x=>x[1]),bm=bestM(q,ex),bu=bestU(q);
 if(bu[0]&&bu[0].s>=3&&(!bm[0]||bu[0].s>=bm[0].s+1))return{h:uniCard(bu[0].u),qr:['Оқу ақысы қанша?','Ресми сайты қандай?']};
 if(bm.length&&(bm[0].s>=2.4||ex.length)){const s=sc(),pool=bm.filter(x=>x.s>=bm[0].s*.5).map(x=>x.m),ok=s!=null?pool.filter(m=>thr(m)<=s):pool,no=pool.length-ok.length;
  if(bm[0].s>=5.5&&!ex.length&&bm[0].s>bm[1]?.s*1.4)return{h:majCard(bm[0].m),qr:['Қандай пәндер керек?','Қайда жұмыс істеймін?']};
  return{h:`Сұрауыңызға сәйкес <b>${pool.length}</b> мамандық таптым.${s!=null?` Балыңызға (${s}) жететіні: <b>${ok.length}</b>${no?`, жетпейтіні: ${no}`:''}.`:' Балыңызды жазсаңыз, шектік баллға қарай сүзіп беремін.'}${chips(ok.length?ok:pool,cm,10)}`,qr:['Мамандық таңдау тесті','Шектік балл туралы']}}
 const fu=()=>{const l=S.lu;if(!l)return;if(/оку ак|бага|цена|стоим|кун/.test(q))return{h:`<b>${esc(l.name)}</b>: оқу ақысы <b>${l.tuition}</b>.`};if(/грант|бал/.test(q))return{h:`<b>${esc(l.name)}</b>: грант балдары <b>${l.grantScore}</b>.`};if(/сайт|site|силтеме|ссылк/.test(q)){const w=SITES[l.code];return{h:w?`Ресми сайты: <a class="ch" href="https://${w}" target="_blank" rel="noopener noreferrer">${w} ↗</a>`:`Сайт мекенжайы базада жоқ. <a class="ch" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(l.name+' ресми сайт')}">Іздеу ↗</a>`}}if(/кала|город|кайда/.test(q))return{h:`${esc(l.name)}: <b>${l.city}</b> қаласында орналасқан.`}};
 const fm=()=>{const l=S.lm;if(!l)return;if(/пан|предмет|комбин/.test(q))return{h:`<b>${l.code}</b> үшін ҰБТ пәндері: <b>${l.combo||'ресми тізімнен тексеріңіз'}</b>.`};if(/бал|порог|шек/.test(q))return{h:`<b>${l.code}</b> шектік балы: <b>${thr(l)}</b>.`};if(/жумыс|карьер|ким бол|работ|кайда/.test(q)){const f=FIELDS[fieldOf(l.code)];if(f)return{h:`<b>${esc(l.name)}</b> (${f[0]}): ${f[2]}`}}};
 if(!scoreSet)for(const f of S.last==='m'?[fm,fu]:[fu,fm]){const r=f();if(r)return r}
 if(scoreSet){const s=S.score,ok=majors.filter(x=>thr(x)<=s),c75=ok.filter(x=>thr(x)===75).length,c70=ok.filter(x=>thr(x)===70).length;
  return{h:`Балыңыз: <b>${s}</b>. ${ok.length} мамандықтың шектік балына жетесіз (75 балдық бағыттар: ${c75}, денсаулық сақтау: ${c70}). Қай сала қызықтырады? Мысалы, «IT», «медицина», «құрылыс».${s<50?' 50 баллдан төмен болғандықтан, қазір түсу шарты орындалмайды.':''}`,qr:['IT мамандықтары','Медицина','Құрылыс пен энергетика','Мамандық таңдау тесті']}}
 {const kb=kbAnswer(q);if(kb)return kb}
 return{fb:1,h:`«${esc(raw.slice(0,60))}» бойынша нақты жауап таба алмадым. Мына түрде сұрап көріңіз: мамандық шифры (B057), ЖОО коды (021), қала («Шымкенттегі ЖОО»), сала («дәрігер», «IT») немесе «110 балл бар».`,qr:['Көмек','Мамандық таңдау тесті','Ең арзан университеттер']}}
function askAI(){const i=$('aiIn'),raw=i.value.trim();if(!raw)return;i.value='';bubble(raw,1);$('qr').innerHTML='';
 const t=bubble('<span class="dots"><i></i><i></i><i></i></span>');
 setTimeout(()=>{let r;try{if(S.flow&&S.flow.step===2&&/^\d{2,3}$/.test(raw)&&+raw<=140){S.score=+raw;$('score').value=raw;t.remove();return quizEnd()}r=reply(raw)}catch(e){r={h:'Кешіріңіз, сұрауды өңдеу кезінде қате шықты. Басқаша жазып көріңіз.'}}
  t.remove();if(r.fn)return r.fn();if(r.fb&&AI_ENDPOINT)return llm(raw,r);bubble(r.h);setQR(r.qr||['Көмек','Мамандық таңдау тесті','Ең арзан университеттер']);$('sbadge').textContent=S.score!=null?'Балыңыз: '+S.score:''},350+Math.random()*350)}
(function(){const R=window.SpeechRecognition||window.webkitSpeechRecognition,b=$('mic');if(!R){b.style.display='none';return}b.onclick=()=>{const r=new R();r.lang='kk-KZ';r.onresult=e=>{$('aiIn').value=e.results[0][0].transcript;askAI()};r.start()}})();
greet();

$('count').textContent=`Базада ${majors.length} мамандық шифры және ${universities.length} ЖОО бар.`;
filterData();


/* ===== Шетелдік ЖОО: AI көмекшісі ===== */
const FCA=[[/акш|сша|америк|usa/,'АҚШ'],[/улыбритан|британи|англи/,'Ұлыбритания'],[/герман|немис/,'Германия'],[/швейцар/,'Швейцария'],[/канад/,'Канада'],[/австрал/,'Австралия'],[/сингапур/,'Сингапур'],[/кытай|китай/,'Қытай'],[/жапон|япон/,'Жапония'],[/корея/,'Оңтүстік Корея'],[/нидерланд|голланд/,'Нидерланды'],[/гонконг/,'Гонконг'],[/турци|туркия|туркия|turkey/,'Түркия'],[/итали/,'Италия'],[/чехи|прага/,'Чехия']];
function foreignAI(q,low){
 const fp=FOREIGN.filter(f=>f.keys.some(k=>(q+' ').includes(k))),isF=/шетел|зарубеж|abroad|foreign|топ ?20/.test(q);
 const sn=f=>f.name.split(' (')[0],btn=f=>`<button class="ch" onclick="openForeign('${f.id}')">${sn(f)} <i>${f.country}</i></button>`;
 const ie=f=>f.ielts===0?'тест міндетті емес':f.ielts?'IELTS '+f.ielts+'+':'бағдарламаға байланысты';
 const QR=['Ең арзан шетелдік ЖОО','IELTS 6.5 болса қайда түсем?','Ұлыбритания университеттері'];
 if(fp.length>=2&&/салыстыр|сравн|\bvs\b|кайсысы|айырма|и |мен /.test(q)){const[a,b]=fp;
  return{h:`<table class="cmp"><tr><th></th><th>${sn(a)}</th><th>${sn(b)}</th></tr><tr><td>Ел</td><td>${a.country}</td><td>${b.country}</td></tr><tr><td>Оқу ақысы</td><td>${a.fee}</td><td>${b.fee}</td></tr><tr><td>Ағылшын тілі</td><td>${ie(a)}</td><td>${ie(b)}</td></tr><tr><td>Мерзім</td><td>${a.deadlines}</td><td>${b.deadlines}</td></tr></table><div class="chs">${btn(a)}${btn(b)}</div>`,qr:QR}}
 const f=fp.length===1?fp[0]:(!fp.length&&S.last==='f'&&S.lf&&!isF?S.lf:null);
 if(f){const hit=(r,fn)=>r.test(q)?(S.lf=f,S.last='f',{h:fn(),qr:['Түсу процесі қандай?','Қаржылық көмек бар ма?','Шетелдік университеттер']}):null;
  const r=hit(/оку ак|бага|цена|стоим|тулем|канша акша/,()=>`<b>${sn(f)}</b>: ${f.tuition}<br>${f.tuition_note}`)
   ||hit(/тарих|истори|курыл|негиздел|founded/,()=>histText(f))||hit(/мерзим|дедлайн|срок|кашан|когда|deadline/,()=>`<b>${sn(f)}</b>: ${f.deadlines}`)
   ||hit(/ielts|toefl|тил|агылшын|английск/,()=>`<b>${sn(f)}</b>:<br>${f.entry.map(e=>`• ${e[0]}: ${e[1]}`).join('<br>')}`)
   ||hit(/грант|стипенд|шакиртак|комек|aid|тегин|бесплат/,()=>`<b>${sn(f)}</b>: ${f.aid}`)
   ||hit(/мекенжай|адрес|где/,()=>`<b>${sn(f)}</b>: ${f.address}`)
   ||hit(/сайт|site|силтеме|ссылк/,()=>`<a class="ch" href="${f.site}" target="_blank" rel="noopener noreferrer">${sn(f)} ресми сайты ↗</a>`)
   ||hit(/кадам|процесс|тусу|поступ|кандай тус/,()=>`<b>${sn(f)}</b> түсу қадамдары:<br>${f.process.map((s,i)=>`${i+1}. ${s}`).join('<br>')}`);
  if(r)return r}
 if(isF&&/арзан|дешев|cheap|кымбат|дорог/.test(q)){const ex=/кымбат|дорог/.test(q),L=FOREIGN.filter(x=>x.usd!=null).sort((a,b)=>ex?b.usd-a.usd:a.usd-b.usd).slice(0,6);
  return{h:`${ex?'Ең қымбат':'Ең арзан'} шетелдік ЖОО-лар (жылына, шамамен):<br>${L.map(x=>`• <b>${sn(x)}</b> (${x.country}): ${x.fee}`).join('<br>')}<div class="chs">${L.map(btn).join('')}</div>`,qr:QR}}
 const im=low.match(/(?:ielts|айелтс|иелтс|аилтс)\D{0,14}(\d(?:[.,]\d)?)|(\d(?:[.,]\d)?)\s*(?:ielts|айелтс|иелтс|аилтс)/);
 if(im){const v=parseFloat((im[1]||im[2]).replace(',','.'));if(v>=0&&v<=9){const ok=FOREIGN.filter(x=>x.ielts!=null&&x.ielts<=v);
  return{h:ok.length?`IELTS <b>${v}</b> болса, ресми ең төменгі талап бойынша <b>${ok.length}</b> университетке жетесіз. Бағдарламаға қарай жоғарырақ бал сұралуы мүмкін:<div class="chs">${ok.map(btn).join('')}</div>`:`IELTS ${v} көптеген топ университетке аздау. 6.5-тен бастау керек.`,qr:QR}}}
 const fc=FCA.find(([r])=>r.test(q));
 if(fc&&!fp.length&&/жоо|унив|вуз|институт|оку|кайда|тизим|список|шетел|бар/.test(q)){const L=FOREIGN.filter(x=>x.country===fc[1]);
  return L.length?{h:`<b>${fc[1]}</b>: базада <b>${L.length}</b> университет бар.<div class="chs">${L.map(btn).join('')}</div>`,qr:QR}:{h:`${fc[1]} бойынша базада әзірге университет жоқ.`}}
 return null}
/* Ел бойынша сүзгі */
S.fc='';
function fchips(){const cs=[...new Set(FOREIGN.map(f=>f.country))];$('fChips').innerHTML=['Барлығы',...cs].map(c=>`<button class="${(c==='Барлығы'&&!S.fc)||c===S.fc?'on':''}" onclick="S.fc='${c==='Барлығы'?'':c}';fchips();filterData()">${c}</button>`).join('')}
fchips();
/* Лупа: өзі ұшып жүріп, белгілерді бір-бірлеп «табады» (басқарылмайды). Белгіні басса — сол бөлімге өтеді. */
(()=>{const el=$('seek');if(!el)return;
const svg=el.querySelector('svg'),base=$('skBase'),litG=$('skLit'),lens=$('lensG'),lc=$('lcc'),cap=$('skCap'),fx=$('skFx'),trail=$('skTrail'),W=480,H=400,K=1.75,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const CH=[['B057',22,44,'q','B057'],['ҰБТ 140',330,30,'r','#/calc'],['IELTS 6.5',178,26,'r','#/abroad'],['SDU',22,112,'q','SDU'],['MIT',408,92,'r','#/foreign/mit'],['Медицина',20,318,'q','Медицина'],['Алматы',166,350,'q','Алматы'],['Грант',344,322,'r','#/grants']].map(([t,x,y,k,v],i)=>({t,x,y,k,v,i,w:Math.round(t.length*8.6+26),h:26}));
const PT={A:[240,92],B:[404,160],C:[240,228],D:[76,160],E:[158,194],F:[158,252],G:[240,284],H:[322,252],I:[322,194],M:[240,160],T1:[404,214],T2:[404,238]};
const LN=[['A','B'],['B','C'],['C','D'],['D','A'],['A','C'],['D','B'],['E','F'],['F','G'],['G','H'],['H','I'],['B','T1'],['T1','T2']];
const ST=[[40,262],[110,322],[200,384],[292,376],[352,300],[440,282],[452,62],[130,36],[270,14],[68,222],[432,362],[360,64],[14,150],[300,60],[96,92],[452,200]];
const scene=()=>{let s='';
 LN.forEach(([a,b],i)=>{const p=PT[a],q=PT[b];s+=`<path class="ln" pathLength="1" style="animation-delay:${(i*.12).toFixed(2)}s" d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}"/>`});
 s+=`<circle class="ln sh" pathLength="1" cx="240" cy="160" r="15"/>`;
 for(let k=0;k<8;k++){const a=k*Math.PI/4;s+=`<path class="ln sh" pathLength="1" d="M${(240+15*Math.cos(a)).toFixed(1)} ${(160+15*Math.sin(a)).toFixed(1)}L${(240+28*Math.cos(a)).toFixed(1)} ${(160+28*Math.sin(a)).toFixed(1)}"/>`}
 s+=`<path class="ln" pathLength="1" d="M404 214 396 234M404 214 412 234"/>`;
 Object.keys(PT).forEach((k,i)=>{const p=PT[k];s+=`<circle class="nd${k==='T2'?' gold':''}" cx="${p[0]}" cy="${p[1]}" r="${k==='T2'?5.4:3.4}" style="animation-delay:${(i*.37).toFixed(2)}s"/>`});
 ST.forEach((p,i)=>{s+=`<circle class="st" cx="${p[0]}" cy="${p[1]}" r="1.5" style="animation-delay:${(i*.5).toFixed(2)}s"/>`});
 CH.forEach(c=>{s+=`<g class="fl" style="animation-delay:-${(c.i*.9).toFixed(1)}s"><g class="chip" data-i="${c.i}" transform="translate(${c.x} ${c.y})"><rect width="${c.w}" height="${c.h}" rx="13"/><text x="${c.w/2}" y="17.5" text-anchor="middle">${c.t}</text></g></g>`});
 return s};
base.innerHTML=scene();litG.innerHTML=scene();
/* Әр белгіге — сайттың өз деректерінен бір қысқа дерек */
const L=window.BZ_LANG||'kk',tr=(kk,ru,en)=>({ru,en}[L]||kk);
const n=v=>(+v).toLocaleString('ru-RU');
const g57=(window.G26||{}).B057,gSum=Object.values(window.G26||{}).reduce((a,v)=>a+(+v[0]||0),0),alm=(window.universities||[]).filter(u=>/Алматы/.test(u.city||'')).length;
const FACT=[
 g57?tr(`B057 Ақпараттық технологиялар: 2026 жылы ${n(g57[1])} грант`,`B057 Информационные технологии: ${n(g57[1])} грантов в 2026 году`,`B057 Information technology: ${n(g57[1])} grants in 2026`):tr('B057 Ақпараттық технологиялар','B057 Информационные технологии','B057 Information technology'),
 tr('ҰБТ-ның ең жоғары балы — 140. Өз балыңды есептегіште тексер','Максимум ЕНТ — 140 баллов. Проверь свой балл в калькуляторе','The UNT maximum is 140. Check your score in the calculator'),
 tr('Шетелде оқу үшін көбіне IELTS сертификаты керек','Для учёбы за рубежом чаще всего нужен IELTS','Studying abroad usually requires IELTS'),
 tr('SDU және басқа университеттердің толық беті бар','У SDU и других вузов есть подробные страницы','SDU and other universities have full pages'),
 tr('MIT және шетелдік ЖОО — бөлек бөлімде','MIT и зарубежные вузы — в отдельном разделе','MIT and foreign universities have their own section'),
 tr('Медицина мамандықтарына шектік балл — 75','Пороговый балл на медицину — 75','The medicine threshold is 75'),
 alm?tr(`Алматыда ${alm} университет`,`В Алматы ${alm} вузов`,`${alm} universities in Almaty`):tr('Алматы университеттері','Вузы Алматы','Universities in Almaty'),
 gSum?tr(`2026 жылы мамандықтарға ${n(gSum)} грант бөлінді`,`В 2026 году на специальности выделено ${n(gSum)} грантов`,`${n(gSum)} grants for majors in 2026`):tr('Гранттар туралы бәрі','Всё о грантах','All about grants')];
let px=240,py=200,ang=0,typing=0;
const put=()=>{lens.setAttribute('transform',`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${ang.toFixed(1)})`);lc.setAttribute('cx',px.toFixed(1));lc.setAttribute('cy',py.toFixed(1));litG.setAttribute('transform',`translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${K}) translate(${(-px).toFixed(1)} ${(-py).toFixed(1)})`)};
const say=t=>{clearInterval(typing);let k=0;cap.innerHTML='<span class="sk-t"></span><i class="sk-c"></i>';const sp=cap.firstChild;if(reduce){sp.textContent=t;return}typing=setInterval(()=>{sp.textContent=t.slice(0,++k);if(k>=t.length)clearInterval(typing)},26)};
const ctr=i=>{const c=CH[i];return[c.x+c.w/2,c.y+c.h/2]};
const NS='http://www.w3.org/2000/svg',mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
const burst=(x,y)=>{const g=mk('g',{transform:`translate(${x} ${y})`});
 g.appendChild(mk('circle',{class:'bw',r:'10'}));g.appendChild(mk('circle',{class:'bw b2',r:'10'}));
 for(let k=0;k<10;k++){const a=k*Math.PI/5+Math.random()*.4,d=46+Math.random()*30;const s=mk('path',{class:'spk',d:'M0 -4L1.2 -1.2 4 0 1.2 1.2 0 4 -1.2 1.2 -4 0 -1.2 -1.2Z',style:`--dx:${(Math.cos(a)*d).toFixed(1)}px;--dy:${(Math.sin(a)*d).toFixed(1)}px;animation-delay:${(k*.02).toFixed(2)}s`});g.appendChild(s)}
 fx.appendChild(g);setTimeout(()=>g.remove(),1400)};
const mark=(i,on)=>svg.querySelectorAll('.chip[data-i="'+i+'"]').forEach(c=>c.classList.toggle('found',on));
const TR=[];const drawTrail=()=>{trail.innerHTML=TR.map((p,k)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(1+k*.22).toFixed(2)}" opacity="${(k/TR.length*.55).toFixed(2)}"/>`).join('')};
/* Маршрут: араласқан тәртіп, әр сапар — иілген Безье қисығы */
let order=[],step=-1,ph='hold',t0=0,from=[240,200],to=[240,200],cp1=[0,0],cp2=[0,0],dur=1900;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const next=now=>{step++;if(step>=order.length){ph='lap';t0=now;say(tr('Барлығы BilimIzde-де. Белгіні басып, бөлімге өт','Всё это есть в BilimIzde. Нажми на метку, чтобы перейти','It is all in BilimIzde. Tap a label to open it'));return}
 const i=order[step];from=[px,py];to=ctr(i);const dx=to[0]-from[0],dy=to[1]-from[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,b=(Math.random()<.5?-1:1)*Math.min(110,len*.45);
 cp1=[from[0]+dx*.3+nx*b,from[1]+dy*.3+ny*b];cp2=[from[0]+dx*.7+nx*b*.6,from[1]+dy*.7+ny*b*.6];dur=1500+len*2.2;ph='move';t0=now};
const bz=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d};
const restart=now=>{CH.forEach(c=>mark(c.i,false));order=shuffle(CH.map(c=>c.i));step=-1;next(now)};
let last=0;
const frame=now=>{const ox=px,oy=py;
 if(ph==='move'){const k=Math.min(1,(now-t0)/dur),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;px=bz(from[0],cp1[0],cp2[0],to[0],e);py=bz(from[1],cp1[1],cp2[1],to[1],e);
  if(k>=1){const i=order[step];mark(i,true);burst(px,py);say(FACT[i]);ph='hold';t0=now}}
 else if(ph==='hold'){px=to[0]+Math.sin(now/260)*2.5;py=to[1]+Math.cos(now/310)*2.5;if(now-t0>2300)next(now)}
 else if(ph==='lap'){const k=(now-t0)/1000;px=240+150*Math.sin(k*1.1);py=196+80*Math.sin(k*2.2);if(k>6.5){restart(now)}}
 const vx=px-ox;ang+=((Math.max(-18,Math.min(18,vx*3)))-ang)*.12;
 if(now-last>34){TR.push([px,py]);if(TR.length>22)TR.shift();last=now;drawTrail()}
 put();requestAnimationFrame(frame)};
svg.addEventListener('click',e=>{const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H,c=CH.find(c=>x>c.x-8&&x<c.x+c.w+8&&y>c.y-8&&y<c.y+c.h+8);if(!c)return;if(c.k==='q')hint(c.v);else go(c.v)});
if(reduce){const i=0;[px,py]=ctr(i);mark(i,true);put();say(FACT[i]);return}
put();setTimeout(()=>{restart(performance.now());requestAnimationFrame(frame)},900);
})();


/* ===== Шетелдік ЖОО суреттері (Wikipedia / Wikimedia Commons) ===== */
const PH={},PQ={};
function getPhoto(id){if(PQ[id])return PQ[id];return PQ[id]=fetch('https://en.wikipedia.org/api/rest_v1/page/media-list/'+WIKI[id]).then(r=>r.json()).then(j=>{
 const it=(j.items||[]).find(x=>x.type==='image'&&/\.jpe?g$/i.test(x.title)&&!/logo|seal|coat|arms|crest|shield|map|flag|signature|emblem|diagram|portrait/i.test(x.title));if(!it)throw 0;
 const u='https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(it.title.replace(/^File:/,'').replace(/ /g,'_'))+'?width=900';
 return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(u);im.onerror=no;im.src=u})}).then(u=>(PH[id]=u)).catch(()=>null)}
function loadPhotos(){document.querySelectorAll('#foreignList .ur.fo').forEach(el=>{const id=el.dataset.id;if(!WIKI[id])return;
 const set=u=>{if(u){el.style.setProperty('--ph',`url("${u}")`);el.classList.add('ph')}};PH[id]?set(PH[id]):getPhoto(id).then(set)})}


/* ===== Шетелдік ЖОО тарихы ===== */

const histHtml=(id,hs)=>{const H=HIST[id];return H?`<details class="hist" id="hist"${hs?' open':''}><summary>Тарихы</summary><p class="dtxt">${H[0]}</p><ol class="tl">${H[1].map(e=>`<li><b>${e[0]}</b><span>${e[1]}</span></li>`).join('')}</ol></details>`:''};
const histText=f=>{const H=HIST[f.id];return H?`<b>${f.name.split(' (')[0]}</b> тарихы:<br>${H[0]}<br>${H[1].map(e=>`• <b>${e[0]}</b>: ${e[1]}`).join('<br>')}<div class="chs"><button class="ch" onclick="openForeign('${f.id}',1)">Толық тарихын ашу</button></div>`:'Бұл университеттің тарихы базада жоқ.'};
/* ===== AI: білім қоры мен іздеу ===== */
const AI_ENDPOINT=window.BZ_AI?API_BASE+'/api/ask':''; /* backend: /api/ask */ /* нақты LLM серверіңіздің мекенжайы, мысалы 'http://localhost:8787/ask' (ai_server.py қараңыз) */
const STOP=new Set(['канда','калай','деген','кашан','болад','бола','керек','туралы','кандa','айтып','айтшы','жазыл','болып','жаса','бер','бары','кім','неге']);
const stm=s=>nz(s).split(/\s+/).filter(w=>w.length>2).map(w=>w.slice(0,5)).filter(w=>!STOP.has(w));
let KB=null;
function kbInit(){const D=[];
 FAQ.forEach(([k,a])=>D.push({k,h:a}));
 Object.values(FIELDS).forEach(f=>D.push({k:f.join(' '),h:`<b>${f[0]}</b><br>${f[1]}<br>Жұмыс орны: ${f[2]}`}));
 FOREIGN.forEach(f=>{const H=HIST[f.id];D.push({k:[f.name,f.kz,f.country,f.city,H?H[0]+' '+H[1].map(e=>e[1]).join(' '):'',f.aid,f.entry.map(e=>e.join(' ')).join(' ')].join(' '),h:`<b>${f.name}</b> (${f.country}): оқу ақысы ${f.fee}.<br>${H?H[0]:''}<div class="chs"><button class="ch" onclick="openForeign('${f.id}')">Толық ақпарат</button><button class="ch" onclick="openForeign('${f.id}',1)">Тарихы</button></div>`})});
 const df={};D.forEach(d=>{d.s=new Set(stm(d.k));d.s.forEach(w=>df[w]=(df[w]||0)+1)});KB={D,df,N:D.length}}
function kbTop(q,n=3){if(!KB)kbInit();const t=[...new Set(stm(q))];return KB.D.map(d=>{let m=0;const s=t.reduce((a,w)=>a+(d.s.has(w)?(m++,Math.log(1+KB.N/KB.df[w])):0),0);return{d,s,m}}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,n)}
function kbAnswer(q){const r=kbTop(q);if(!r.length||r[0].s<3||(r[0].m<2&&r[0].s<4.5))return null;return{h:r[0].d.h,qr:['Шетелдік ЖОО','Мамандық таңдау тесті','Ең арзан шетелдік ЖОО']}}
function llm(raw,r){const w=bubble('<span class="dots"><i></i><i></i><i></i></span>');
 fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:raw,context:kbTop(nz(raw),4).map(x=>x.d.h.replace(/<[^>]+>/g,' '))})}).then(x=>x.json()).then(j=>{w.remove();bubble(esc(j.answer||r.h).replace(/\n/g,'<br>'))}).catch(()=>{w.remove();bubble(r.h)});setQR(r.qr||['Көмек','Шетелдік ЖОО'])}
/* ===== Беттер ===== */
let CUR=location.hash||'#/';
function go(p){CUR=p;try{history.pushState(null,'',p)}catch(_){}route()}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#/"]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();go(a.getAttribute('href'))});
let DET=null;
const _ou=openUni,_om=openMajor,_of=openForeign;
openUni=c=>{DET={k:'uni',id:c};_ou(c);DET=null};
openMajor=c=>{DET={k:'major',id:c};_om(c);DET=null};
openForeign=(id,hs)=>{DET={k:'foreign',id,hs:hs?1:0};_of(id,hs);DET=null};

function detExtra(){return''}
const KIND={uniDlg:['dBody','/universities','Университеттер'],majDlg:['mBody','/majors','Мамандықтар'],forDlg:['fBody','/abroad','Шетелдік ЖОО']};
const _sm=HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal=function(){const k=KIND[this.id];if(!k||!DET)return _sm.call(this);
 const b=$(k[0]),key=DET.k+'/'+DET.id+(DET.hs?'/h':'');$('detBody').innerHTML=b.innerHTML+detExtra(DET.k,DET.id);b.innerHTML='';$('detBody').dataset.key=key;$('detBack').href='#'+k[1];$('detBack').textContent=k[2];$('detName').textContent=(($('detBody').querySelector('h3')||{}).textContent||'').split(' (')[0];DET=null;
 if(CUR!=='#/'+key)go('#/'+key);else route()};
const PG={home:'Басты бет',calc:'Грант есептегіш',search:'Іздеу нәтижелері',majors:'Мамандықтар',universities:'Университеттер',abroad:'Шетелдік ЖОО',ai:'AI кеңесші',detail:''};
const ACT={uni:'universities',major:'majors',foreign:'abroad'};
const SEC=[['.hero',['home','search']],['#tiles',['home']],['#how',['home']],['#analyzer',['calc']],['#majors',['majors','search']],['#universities',['universities','search']],['#abroad',['abroad','search']],['#ai-helper',['ai']],['#detail',['detail']]];
function route(){const dm=CUR.match(/^#\/(uni|major|foreign)\/([^/]+)(\/h)?/);let p,act;
 if(dm){p='detail';act=ACT[dm[1]];const key=dm[1]+'/'+dm[2]+(dm[3]?'/h':'');
  if($('detBody').dataset.key!==key){const id=decodeURIComponent(dm[2]);({uni:openUni,major:openMajor,foreign:openForeign})[dm[1]](id,dm[3]?1:0);if($('detBody').dataset.key!==key){CUR='#/';return}}}
 else{p=(CUR.match(/^#\/(\w*)/)||[,''])[1]||'home';if(!(p in PG)||p==='detail')p='home';act=p}
 const pp=document.body.dataset.page;document.body.dataset.page=p;if(pp!==p&&(p==='search'||pp==='search'))filterData();
 SEC.forEach(([s,a])=>document.querySelector(s).hidden=!a.includes(p));
 document.querySelectorAll('nav a').forEach(a=>{const on=a.getAttribute('href')==='#/'+act;a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 document.title=(p==='detail'?(($('detBody').querySelector('h3')||{}).textContent||'')+' · ':p==='home'?'':PG[p]+' · ')+'BilimIzde';
 if(p!=='search'&&!(dm&&dm[3]))scrollTo(0,0)}
function chipRow(id,items,cur,set){$(id).innerHTML=[['','Барлығы'],...items].map(([v,l])=>`<button class="${v===cur?'on':''}" data-v="${v}">${l}</button>`).join('');$(id).onclick=e=>{const b=e.target.closest('button');if(!b)return;set(b.dataset.v);chipRow(id,items,b.dataset.v,set);filterData()}}
S.mf='';S.uc='';
['mQ','uQ','fQ','uT'].forEach(id=>{const e=$(id);if(e)e[id==='uT'?'onchange':'oninput']=filterData});
(()=>{const T=[...new Set(universities.map(u=>u.type).filter(Boolean))].sort();$('uT').insertAdjacentHTML('beforeend',T.map(t=>`<option>${t}</option>`).join(''))})();
chipRow('mChips',['ped','art','hum','soc','bus','nat','ict','eng','agr','vet','health','serv'].filter(k=>FIELDS[k]).map(k=>[k,FIELDS[k][0]]),'',v=>S.mf=v);
chipRow('uChips',Object.entries(universities.reduce((a,u)=>(a[u.city]=(a[u.city]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>[x[0],x[0]]),'',v=>S.uc=v);
$('tM').textContent=majors.length;$('tU').textContent=universities.length;$('tF').textContent=FOREIGN.length;
const _hc=()=>{CUR=location.hash||'#/';route()};addEventListener('hashchange',_hc);addEventListener('popstate',_hc);route();

/* Тақырып (күндізгі / түнгі) */
$('theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('bz-theme',t)}catch(e){}};

/* === BilimIzde v16: қосымша модульдер === */
(()=>{
const LS={g(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const X={test:'Мамандық таңдау тесті',compare:'ЖОО салыстыру',map:'Университеттер картасы',admit:'Құжат чек-парағы және күнтізбе',grants:'Грант және шәкіртақы',faq:'Жиі қойылатын сұрақтар',club:'Пікірлер мен әңгімелер',fav:'Таңдаулылар',plan:'Менің жоспарым',unt:'ҰБТ сынақ тесті',about:'Сайт туралы',results:'Өткен жылдардың грант нәтижелері',news:'ЖОО жаңалықтары',masters:'Магистратура: гранттар мен емтихан'};
const NAV={test:'Мамандық тесті',compare:'Салыстыру',map:'Карта',admit:'Құжаттар',grants:'Гранттар',faq:'Сұрақ-жауап',club:'Пікірлер',fav:'Таңдаулылар',plan:'Жоспарым',unt:'Сынақ ҰБТ',about:'Сайт туралы',results:'Өткен жылдар',news:'Жаңалықтар',masters:'Магистратура'};
const T={ru:{calc:'Расчёт гранта',majors:'Специальности',universities:'Университеты',abroad:'Зарубежные вузы',ai:'AI-советник',test:'Тест профориентации',compare:'Сравнение',map:'Карта',admit:'Документы',grants:'Гранты',faq:'Вопросы и ответы',club:'Отзывы',fav:'Избранное',plan:'Мой план',unt:'Пробный ЕНТ',about:'О сайте',results:'Прошлые годы',news:'Новости',masters:'Магистратура'},en:{calc:'Grant calculator',majors:'Majors',universities:'Universities',abroad:'Study abroad',ai:'AI advisor',test:'Major quiz',compare:'Compare',map:'Map',admit:'Documents',grants:'Grants',faq:'Questions',club:'Reviews',fav:'Favorites',plan:'My plan',unt:'UNT practice',about:'About',results:'Past years',news:'News',masters:'Master’s'}};
Object.assign(PG,X);SEC.push(['#x',Object.keys(X)]);
const P={},H=t=>t;const TT={ru:{test:'Тест по выбору специальности',compare:'Сравнение',map:'Карта вузов',admit:'Документы и календарь',grants:'Гранты и стипендии',faq:'Частые вопросы',club:'Отзывы и истории',fav:'Избранное',plan:'Мой план поступления',unt:'Пробный ЕНТ',about:'О сайте',results:'Итоги грантов прошлых лет',news:'Новости вузов',masters:'Магистратура: гранты и экзамен'},en:{test:'Major finder quiz',compare:'Compare',map:'University map',admit:'Documents & calendar',grants:'Grants & scholarships',faq:'FAQ',club:'Reviews & stories',fav:'Favorites',plan:'My admission plan',unt:'UNT practice test',about:'About the site',results:'Past grant results',news:'University news',masters:'Master’s: grants and exam'}};
const XI={"masters": "<path d=\"M3 9l9-5 9 5-9 5-9-5z\"/><path d=\"M7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5\"/><path d=\"M21 9v6\"/>", "test": "<path d=\"M9 6h11M9 12h11M9 18h11\"/><path d=\"M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2\"/>", "compare": "<rect x=\"3.5\" y=\"4\" width=\"7\" height=\"16\" rx=\"1.5\"/><rect x=\"13.5\" y=\"4\" width=\"7\" height=\"16\" rx=\"1.5\"/>", "map": "<path d=\"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z\"/><circle cx=\"12\" cy=\"10\" r=\"2.4\"/>", "admit": "<path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3v5h5M9 13h6M9 17h4\"/>", "grants": "<circle cx=\"12\" cy=\"9\" r=\"5.5\"/><path d=\"M8.5 13.3 7 21l5-2.6 5 2.6-1.5-7.7\"/>", "faq": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01\"/>", "club": "<path d=\"M20 15a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z\"/>", "fav": "<path d=\"M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z\"/>", "plan": "<rect x=\"5\" y=\"4.5\" width=\"14\" height=\"16\" rx=\"2\"/><path d=\"M9 3.5h6v3H9zM8.5 11h7M8.5 15h5\"/>", "unt": "<path d=\"M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z\"/><path d=\"M14.5 7.5l2 2\"/>", "about": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 11v5.5M12 7.8h.01\"/>", "results": "<path d=\"M4 20h16\"/><path d=\"M7 16v-5M12 16V6M17 16v-8\"/>"};
const xi=k=>`<svg class="xi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${XI[k]||''}</svg>`;
const XM=Object.keys(X).filter(k=>k!=='results'&&k!=='news');
const nv=document.querySelector('header nav');nv.insertAdjacentHTML('beforeend',`<details class="more"><summary>Тағы</summary><div>${XM.map(k=>`<a href="#/${k}">${NAV[k]}</a>`).join('')}</div></details>`);
(()=>{const rn=document.querySelector('.rnav');if(!rn)return;const l=LS.g('bz-lang','kk'),lb=k=>(T[l]&&T[l][k])||NAV[k];
rn.insertAdjacentHTML('beforeend',`<a href="#/ai"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg><span>${(T[l]||{}).ai||'AI кеңесші'}</span></a><div class="rmore"><button type="button" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg><span>${{kk:'Тағы',ru:'Ещё',en:'More'}[l]||'Тағы'}</span></button><div class="rmenu" hidden>${XM.map(k=>`<a href="#/${k}">${xi(k)}<span>${lb(k)}</span></a>`).join('')}</div></div>`);
const rm=rn.querySelector('.rmore'),bt=rm.querySelector('button'),mn=rm.querySelector('.rmenu'),tg=o=>{mn.hidden=!o;bt.setAttribute('aria-expanded',o);if(o){const r=bt.getBoundingClientRect();mn.style.left=(r.right+10)+'px';mn.style.top=Math.max(12,Math.min(r.top,innerHeight-mn.offsetHeight-12))+'px'}};
bt.onclick=e=>{e.stopPropagation();tg(mn.hidden)};mn.onclick=()=>tg(false);document.addEventListener('click',e=>{if(!rm.contains(e.target))tg(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')tg(false)});addEventListener('resize',()=>tg(false))})();
const kkN={};nv.querySelectorAll('a').forEach(a=>kkN[a.getAttribute('href').slice(2)]=a.textContent);
function setLang(l){LS.s('bz-lang',l);nv.querySelectorAll('a').forEach(a=>{const k=a.getAttribute('href').slice(2);a.textContent=(T[l]&&T[l][k])||kkN[k]});document.documentElement.lang=l==='kk'?'kk':l}
const ls=$('lang');ls.value=LS.g('bz-lang','kk');ls.onchange=()=>{LS.s('bz-lang',ls.value);location.reload()};setLang(ls.value);
const XD={test:[window.BZ_TEST_Q||26,'сұрақ: салаң, ҰБТ пәндерің және нақты мамандықтар'],compare:['3','ЖОО-ны немесе мамандықты қатар салыстыру'],map:[new Set(universities.map(u=>u.city)).size,'қала: қай жерде қанша ЖОО бар'],admit:['7','құжат және 2026 жылғы түсу мерзімдері'],grants:['13','бағдарлама: мемлекеттік грант, «Болашақ», шетел'],faq:['13','сұрақ-жауап: ҰБТ, шекті балл, грант, квота, шетел'],results:[majors.length,'мамандық: гранттар мен өту балдары, 2024–2026'],news:['24/7','ЖОО, ҰБТ және грант жаңалықтары сағат сайын'],masters:[((window.MS||{}).totals||{}).all_announced||'7M','грант: 2026–2027 магистратура, КТ емтиханы'],club:[window.BZ_CLUB_N||'＋','жазба: түсу тәжірибеңді сақта'],fav:[LS.g('bz-fav',[]).length||'＋','сақталған ЖОО мен мамандық'],plan:[((LS.g('bz-plan',{}).majors||[]).length+(LS.g('bz-plan',{}).unis||[]).length)||'＋','таңдауың: ЖОО, мамандық, мүмкіндік, мерзім'],unt:['ҰБТ','сынақ: оқу сауаттылығы, математикалық сауаттылық, тарих']};
$('tiles').querySelector('.tiles').insertAdjacentHTML('beforeend',Object.keys(X).filter(k=>k!=='about').map((k,i)=>`<a class="tile" href="#/${k}"><small>${String(i+6).padStart(2,'0')}</small><h3>${X[k]}</h3><b data-n="${k}">${XD[k][0]}</b><span>${XD[k][1]}</span><i>→</i></a>`).join(''));
const R0=route;route=function(){R0();const p=document.body.dataset.page;if(X[p]){$('xT').textContent=(TT[LS.g('bz-lang','kk')]||{})[p]||X[p];const b=$('xB');b.innerHTML='';P[p](b);document.title=X[p]+' · BilimIzde'}else fav()};
function fav(){if(document.body.dataset.page!=='detail')return;const b=$('detBody'),k=(b.dataset.key||'').replace('/h','');if(!k||b.querySelector('.favb'))return;const btn=document.createElement('button');btn.className='btn favb';const u=()=>btn.textContent=LS.g('bz-fav',[]).includes(k)?'♥ Таңдаулыдан алу':'♡ Таңдаулыға қосу';btn.onclick=()=>{let a=LS.g('bz-fav',[]);a=a.includes(k)?a.filter(x=>x!==k):[...a,k];LS.s('bz-fav',a);u()};u();const w=document.createElement('div');w.className='det-acts';w.append(btn);b.prepend(w);window.BZ_PLANBTN&&BZ_PLANBTN(b,k)}
P.plan=e=>window.BZ_PLAN?BZ_PLAN(e):(e.textContent='');
P.about=e=>window.BZ_ABOUT?BZ_ABOUT(e):(e.textContent='');
P.unt=e=>window.BZ_UNT?BZ_UNT(e):(e.textContent='');
P.fav=e=>{const a=LS.g('bz-fav',[]);e.innerHTML=a.length?'<div class="chs">'+a.map(k=>{const[t,i]=k.split('/'),o=t==='uni'?universities.find(x=>x.code===i):t==='major'?majors.find(x=>x.code===i):FOREIGN.find(x=>x.id===i);return o?`<a class="ch" href="#/${k}">${esc(o.name)}</a>`:''}).join('')+'</div>':'<p class="xm">Әлі ештеңе жоқ. Университет, мамандық немесе шетелдік ЖОО бетіндегі «Таңдаулыға қосу» батырмасын басыңыз. Тізім осы құрылғыда сақталады.</p>'};
P.compare=e=>{const o='<option value="">—</option>'+universities.map(u=>`<option value="${u.code}">${esc(u.name)}</option>`).join('');e.innerHTML=`<div class="xr">${[0,1,2].map(i=>`<select class="cm" aria-label="ЖОО ${i+1}">${o}</select>`).join('')}</div><div id="cmT" class="xs"></div>`;const Sl=[...e.querySelectorAll('.cm')],sv=LS.g('bz-cmp',[]);Sl.forEach((s,i)=>s.value=sv[i]||'');
const up=()=>{const v=Sl.map(s=>s.value);LS.s('bz-cmp',v);const L=v.filter(Boolean).map(c=>universities.find(u=>u.code===c));$('cmT').innerHTML=L.length<2?'<p class="xm">Кемінде екі ЖОО таңдаңыз.</p>':`<table class="xt"><tr><th></th>${L.map(u=>`<th>${esc(u.name)}</th>`).join('')}</tr>${[['Қала','city'],['Түрі','type'],['Грант балы','grantScore'],['Оқу ақысы','tuition'],['ЖОО коды','code']].map(([l,k])=>`<tr><td>${l}</td>${L.map(u=>`<td>${esc(u[k])}</td>`).join('')}</tr>`).join('')}</table>`};Sl.forEach(s=>s.onchange=up);up()};
const KZB=[[49.2,46.5],[47.5,46.9],[46.8,47.9],[46.5,48.6],[47.1,49.3],[47.9,50.4],[49.0,50.6],[50.8,51.7],[52.4,51.65],[54.1,51.05],[55.7,50.6],[57.0,51.1],[58.8,50.7],[60.5,50.8],[61.0,51.6],[61.6,52.5],[60.9,53.5],[61.2,54.0],[63.0,54.2],[65.0,54.7],[67.5,55.3],[69.0,55.4],[70.8,55.2],[72.5,54.3],[73.4,54.0],[75.0,54.1],[76.8,54.2],[77.8,53.3],[79.5,52.2],[80.6,50.9],[82.5,50.7],[83.3,51.0],[84.9,50.9],[85.5,49.6],[87.3,49.1],[86.6,48.4],[85.7,47.9],[85.5,47.0],[83.9,47.2],[83.0,47.2],[82.3,45.5],[80.9,45.0],[80.3,44.0],[80.2,42.8],[80.2,42.2],[78.4,42.9],[77.0,42.9],[75.2,42.9],[74.2,43.2],[73.5,42.5],[71.8,42.8],[70.9,42.3],[70.5,41.9],[69.4,41.4],[68.4,40.7],[67.0,41.2],[66.2,42.0],[65.5,42.9],[63.5,43.6],[62.0,43.5],[61.0,44.3],[59.0,45.5],[58.3,45.5],[56.0,44.8],[56.0,41.3],[54.7,41.9],[53.0,42.0],[51.4,43.4],[50.4,44.5],[50.8,44.9],[50.1,45.3],[50.3,46.1]];
const CITY={'Алматы':[76.95,43.24],'Арқалық':[66.92,50.25],'Астана':[71.43,51.13],'Атырау':[51.92,47.11],'Ақтау':[51.17,43.65],'Ақтөбе':[57.21,50.28],'Жезқазған':[67.71,47.78],'Көкшетау':[69.40,53.28],'Орал':[51.37,51.23],'Павлодар':[76.97,52.29],'Петропавл':[69.14,54.87],'Рудный':[63.12,52.97],'Семей':[80.23,50.42],'Талдықорған':[78.37,45.02],'Тараз':[71.38,42.90],'Теміртау':[72.96,50.06],'Түркістан':[68.25,43.30],'Шымкент':[69.59,42.32],'Қарағанды':[73.10,49.80],'Қаскелең':[76.61,43.20],'Қостанай':[63.63,53.21],'Қызылорда':[65.51,44.85],'Өскемен':[82.61,49.97]};
const SIDE={'Рудный':'l','Қаскелең':'l','Теміртау':'r','Шымкент':'b','Алматы':'r','Түркістан':'l','Тараз':'t','Қарағанды':'l'};
const mx=lo=>(lo-45.5)*17.4+20,my=la=>(55.8-la)*26+20;
P.map=e=>{const cnt={},by={},TY=[...new Set(universities.map(u=>u.type))].filter(Boolean),UL=universities.filter(u=>!S.mt||u.type===S.mt);UL.forEach(u=>{cnt[u.city]=(cnt[u.city]||0)+1;(by[u.city]=by[u.city]||[]).push(u)});
const W=780,H=450,pt=([a,b])=>[mx(a),my(b)],path=(A,close)=>A.map((p,k)=>{const[x,y]=pt(p);return(k?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join('')+(close?'Z':'');
const smooth=A=>{const P=A.map(pt);let d=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;for(let i=1;i<P.length;i++){const p0=P[i-1],p1=P[i],mxp=(p0[0]+p1[0])/2,myp=(p0[1]+p1[1])/2;d+=i===1?` L${mxp.toFixed(1)} ${myp.toFixed(1)}`:` Q${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${mxp.toFixed(1)} ${myp.toFixed(1)}`}const l=P[P.length-1];return d+` L${l[0].toFixed(1)} ${l[1].toFixed(1)}`};
const ell=(lo,la,rlo,rla)=>{const[x,y]=pt([lo,la]);return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(rlo*17.4).toFixed(1)}" ry="${(rla*26).toFixed(1)}"/>`};
const bd=path(KZB,1);
const caspian=path([[49.2,46.5],[50.3,46.1],[50.1,45.3],[50.8,44.9],[50.4,44.5],[51.4,43.4],[53.0,42.0],[53.4,39.0],[43.5,39.0],[43.5,45.2],[46.6,44.9],[47.4,45.7],[48.2,46.3]],1);
const balkhash=path([[73.4,46.3],[74.3,46.9],[75.5,46.6],[76.5,46.4],[77.8,46.5],[79.2,46.8],[79.0,46.5],[77.5,46.2],[76.3,46.15],[75.2,46.2],[74.3,46.2],[73.6,46.05]],1);
const RIV=[['Ертіс',[[85.5,47.6],[84.2,48.0],[82.6,49.97],[80.23,50.42],[78.6,51.5],[76.97,52.29],[75.5,53.4],[74.4,54.2]]],['Сырдария',[[68.8,40.9],[68.4,42.0],[67.7,43.0],[66.4,44.2],[65.51,44.85],[64.0,45.3],[62.5,45.9],[61.4,46.2]]],['Жайық',[[54.6,51.6],[52.6,51.5],[51.37,51.23],[51.6,49.5],[51.9,47.6],[51.9,47.1],[51.8,46.8]]],['Іле',[[80.2,43.9],[78.5,43.9],[77.1,43.9],[76.0,44.6],[74.9,45.6],[74.6,45.95]]],['Есіл',[[73.3,50.6],[71.4,51.15],[69.7,51.6],[68.7,52.6],[69.0,53.8],[69.14,54.87],[69.6,55.4]]],['Тобыл',[[63.4,51.9],[63.63,53.21],[64.4,54.2],[65.0,54.9]]]];
const rivers=RIV.map(([n,A])=>`<path class="km-riv" d="${smooth(A)}"><title>${n}</title></path>`).join('');
const ks=Object.keys(cnt).filter(c=>CITY[c]),rest=Object.keys(cnt).filter(c=>!CITY[c]),tot=UL.length;
const N=ks.map(c=>{const[ax,ay]=pt(CITY[c]);return{c,n:cnt[c],ax,ay,x:ax,y:ay,r:5+Math.sqrt(cnt[c])*2.6}});
const sep=()=>{for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const a=N[i],b=N[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<.01){dx=1;dy=.3;d=1}const m=a.r+b.r+14;if(d<m){const k=(m-d)/2/d;a.x-=dx*k;a.y-=dy*k;b.x+=dx*k;b.y+=dy*k}}};
for(let t=0;t<250;t++){sep();N.forEach(o=>{o.x+=(o.ax-o.x)*.02;o.y+=(o.ay-o.y)*.02})}for(let t=0;t<60;t++)sep();
/* шоқжұлдыз сызықтары: әр қаланы ең жақын екі көршісімен қосу */
const E=new Set,edges=[];N.forEach((a,i)=>{N.map((b,j)=>[j,Math.hypot(a.ax-b.ax,a.ay-b.ay)]).filter(([j])=>j!==i).sort((p,q)=>p[1]-q[1]).slice(0,2).forEach(([j])=>{const k=i<j?i+'-'+j:j+'-'+i;if(!E.has(k)){E.add(k);edges.push([N[i],N[j]])}})});
const lines=edges.map(([a,b],i)=>`<line class="km-ln" style="animation-delay:${(i*.08).toFixed(2)}s" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>`).join('');
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const stars=Array.from({length:70},(_,i)=>`<circle class="km-st" cx="${(rnd()*W).toFixed(0)}" cy="${(rnd()*H).toFixed(0)}" r="${(rnd()*1.2+.3).toFixed(1)}" style="animation-delay:${(rnd()*4).toFixed(1)}s"/>`).join('');
const big=new Set([...N].sort((a,b)=>b.n-a.n).slice(0,6).map(o=>o.c));
const PL=[];N.forEach(o=>PL.push([o.x-o.r,o.y-o.r,o.x+o.r,o.y+o.r]));const ov=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
const LB={};[...N].sort((a,b)=>b.n-a.n).forEach(o=>{const w=o.c.length*(big.has(o.c)?7.4:6.4)+6,h=14,g=o.r+5,opts=[[o.x+g,o.y-h/2,'start'],[o.x-g-w,o.y-h/2,'end'],[o.x-w/2,o.y-o.r-4-h,'middle'],[o.x-w/2,o.y+o.r+4,'middle']];
 for(const[x,y,a]of opts){const r=[x,y,x+w,y+h];if(x<4||x+w>W-4||y<4||y+h>H-4)continue;if(PL.some(q=>ov(r,q)))continue;PL.push(r);LB[o.c]={x:a==='start'?x:a==='end'?x+w:x+w/2,y:y+11,a};break}});
const cities=N.map((o,i)=>{const lab=big.has(o.c),P0=LB[o.c];
 return `<g class="km-c${lab?' big':''}" tabindex="0" role="button" data-c="${esc(o.c)}" aria-label="${esc(o.c)}: ${o.n} ЖОО">${Math.hypot(o.x-o.ax,o.y-o.ay)>2?`<line class="km-lead" x1="${o.ax.toFixed(1)}" y1="${o.ay.toFixed(1)}" x2="${o.x.toFixed(1)}" y2="${o.y.toFixed(1)}"/>`:''}<circle class="km-pulse" cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="${o.r.toFixed(1)}" style="animation-delay:${(i*.27%2.4).toFixed(2)}s"/><circle class="km-halo" cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="${(o.r+5).toFixed(1)}"/><circle class="km-dot" cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="${o.r.toFixed(1)}"/>${o.n>1?`<text class="km-n" x="${o.x.toFixed(1)}" y="${(o.y+3.6).toFixed(1)}">${o.n}</text>`:''}${P0?`<text class="km-lb${lab?'':' sm'}" x="${P0.x.toFixed(1)}" y="${P0.y.toFixed(1)}" text-anchor="${P0.a}">${esc(o.c)}</text>`:''}</g>`}).join('');
const nb=[['РЕСЕЙ',62,55.5],['ҚЫТАЙ',85.5,45.0],['ӨЗБЕКСТАН',60,41.6],['ҚЫРҒЫЗСТАН',75.5,41.5],['ТҮРІКМЕНСТАН',55.5,40.0]].map(([t,a,b])=>`<text class="km-nb" x="${mx(a).toFixed(0)}" y="${my(b).toFixed(0)}">${t}</text>`).join('');
const wl=[['Каспий теңізі',47.6,43.0],['Балқаш',76.2,47.15],['Арал',61.0,47.0]].map(([t,a,b])=>`<text class="km-wl" x="${mx(a).toFixed(0)}" y="${my(b).toFixed(0)}">${t}</text>`).join('');
const rank=[...Object.entries(cnt)].sort((a,b)=>b[1]-a[1]),top=rank[0][1];
e.innerHTML=`<p class="km-intro">Шеңбер неғұрлым үлкен болса, сол қалада университет соғұрлым көп. Қаланы басыңыз: оң жақта сол қаланың барлық университеттері шығады.</p><div class="km-ty">${['',...TY].map(t=>`<button class="${(S.mt||'')===t?'on':''}" data-t="${esc(t)}">${t?esc(t):'Барлығы'} <small>${t?universities.filter(u=>u.type===t).length:universities.length}</small></button>`).join('')}</div><div class="kmw"><div class="kmap"><div class="km-top"><span><b>${tot}</b> ЖОО</span><span><b>${Object.keys(cnt).length}</b> қала</span><span class="km-lg"><i class="a"></i>1<i class="b"></i>5<i class="c"></i>20+ ЖОО</span></div>
<svg class="km-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Қазақстан университеттерінің интерактивті картасы"><defs>
<radialGradient id="kmLand" cx="62%" cy="45%" r="70%"><stop offset="0" stop-color="#3b2c22"/><stop offset=".55" stop-color="#241d1b"/><stop offset="1" stop-color="#171517"/></radialGradient>
<linearGradient id="kmWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3a4f"/><stop offset="1" stop-color="#0f2232"/></linearGradient>
<pattern id="kmHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="7" stroke="#f2c98a" stroke-opacity=".07" stroke-width="1"/></pattern>
<filter id="kmGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<radialGradient id="kmDot" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff3de"/><stop offset=".45" stop-color="#f2c98a"/><stop offset="1" stop-color="#c9772e"/></radialGradient>
<clipPath id="kmClip"><path d="${bd}"/></clipPath></defs>
<rect width="${W}" height="${H}" class="km-sky"/>${stars}
<path d="${caspian}" fill="url(#kmWater)" class="km-water"/>${nb}
<path d="${bd}" class="km-shadow"/><path d="${bd}" fill="url(#kmLand)"/><path d="${bd}" fill="url(#kmHatch)"/>
<g clip-path="url(#kmClip)" class="km-lakes"><path d="${balkhash}"/>${ell(61.0,46.45,.75,.32)}${ell(81.7,46.1,.45,.18)}${ell(84.0,47.95,.6,.18)}</g>

<g clip-path="url(#kmClip)">${rivers}</g>
<path d="${bd}" class="km-border"/>${wl}
${cities}
</svg>
<div class="km-tip" id="kmTip" hidden></div></div>
<aside class="km-side"><div id="kmSel"></div><h4>Қалалар рейтингі</h4><ol class="km-rank">${rank.map(([c,n],i)=>`<li><button data-c="${esc(c)}"><span class="km-ri">${String(i+1).padStart(2,'0')}</span><span class="km-rn">${esc(c)}</span><i style="--w:${(n/top*100).toFixed(0)}%"></i><b>${n}</b></button></li>`).join('')}</ol>${rest.length?`<p class="xm">Картада жоқ: ${rest.map(esc).join(', ')}</p>`:''}</aside></div>`;
const tip=$('kmTip'),svg=e.querySelector('.km-svg'),wrap=e.querySelector('.kmap');
const sel=c=>{e.querySelectorAll('.km-c').forEach(g=>g.classList.toggle('on',g.dataset.c===c));e.querySelectorAll('.km-rank button').forEach(b=>b.classList.toggle('on',b.dataset.c===c));
 const L=(by[c]||[]).slice().sort((a,b)=>a.code.localeCompare(b.code)),types={};L.forEach(u=>types[u.type]=(types[u.type]||0)+1);
 $('kmSel').innerHTML=`<div class="km-card"><small>Таңдалған қала</small><h3>${esc(c)}</h3><p><b>${L.length}</b> ЖОО · ${Object.entries(types).map(([t,n])=>`${esc(t)} ${n}`).join(' · ')}</p><ul>${L.map(u=>`<li><a href="#/uni/${u.code}">${lg(u)}<span>${esc(u.name)}<small>${esc(u.type||'')}</small></span></a></li>`).join('')}</ul><button class="btn" id="kmGo">Тізіммен ашу →</button></div>`;
 $('kmGo').onclick=()=>{S.uc=c;go('#/universities');filterData()}};
const show=(g,ev)=>{const c=g.dataset.c,L=(by[c]||[]).slice().sort((a,b)=>a.code.localeCompare(b.code));tip.innerHTML=`<b>${esc(c)}</b><span>${L.length} ЖОО</span>${L.slice(0,3).map(u=>`<small>${u.code} · ${esc(u.name.length>42?u.name.slice(0,40)+'…':u.name)}</small>`).join('')}${L.length>3?`<small>және тағы ${L.length-3}</small>`:''}`;tip.hidden=false;
 const r=wrap.getBoundingClientRect(),b=g.querySelector('.km-dot').getBoundingClientRect();let x=b.left-r.left+b.width/2+14,y=b.top-r.top-10;if(x>r.width-230)x=b.left-r.left-230;tip.style.left=Math.max(6,x)+'px';tip.style.top=Math.max(6,y)+'px'};
svg.addEventListener('pointerover',ev=>{const g=ev.target.closest('.km-c');if(g)show(g,ev)});svg.addEventListener('pointerout',ev=>{if(!ev.relatedTarget||!ev.relatedTarget.closest||!ev.relatedTarget.closest('.km-c'))tip.hidden=true});
svg.addEventListener('focusin',ev=>{const g=ev.target.closest('.km-c');if(g)show(g)});svg.addEventListener('focusout',()=>tip.hidden=true);
e.onclick=ev=>{const tb=ev.target.closest('.km-ty button');if(tb){S.mt=tb.dataset.t;P.map(e);return}const g=ev.target.closest('.km-c,.km-rank button');if(g)sel(g.dataset.c)};
e.onkeydown=ev=>{const g=ev.target.closest('.km-c');if(g&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();sel(g.dataset.c)}};
sel(rank[0][0])};
P.results=e=>window.BZ_RESULTS?BZ_RESULTS(e):(e.textContent='');P.masters=e=>window.BZ_MASTERS?BZ_MASTERS(e):(e.textContent='');P.news=e=>window.BZ_NEWS?BZ_NEWS(e):(e.textContent='');
P.test=e=>window.BZ_TEST?BZ_TEST(e):(e.textContent='');
const CK=['Жеке куәлік / төлқұжат','Аттестат немесе диплом','ҰБТ сертификаты','Медициналық анықтама 075-У','6 дана 3×4 фото','Қосымша құжаттар (жеңілдік, олимпиада)','Университет порталында өтініш'];
const CAL=[['20 маусым','ЖОО қабылдау комиссиялары жұмысын бастайды'],['13–20 шілде','Грант конкурсына өтінім: eGov.kz немесе eGov Mobile'],['10 тамызға дейін','Грант нәтижелері eGov жеке кабинетінде'],['25 тамызға дейін','ЖОО-ға құжат қабылдау аяқталады (ақылы бөлім де)'],['1 қыркүйек','Оқу жылының басы']];
P.admit=e=>{const c=LS.g('bz-ck',[]);e.innerHTML=`<div class="xg"><div class="xc"><h3>Чек-парақ</h3>${CK.map((t,i)=>`<label class="xk"><input type="checkbox" data-i="${i}" ${c.includes(i)?'checked':''}> ${t}</label>`).join('')}</div><div class="xc"><h3>Күнтізбе</h3><table class="xt">${CAL.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="xm">2026 жылғы ресми мерзімдер (ҚР Ғылым және жоғары білім министрлігі). 2027 жылы күндер ауысуы мүмкін, сондықтан <a href="https://egov.kz" target="_blank" rel="noopener noreferrer">egov.kz</a> мен ЖОО сайтын тексеріңіз.</p></div></div>`;e.onchange=ev=>{const i=+ev.target.dataset.i;let a=LS.g('bz-ck',[]);a=ev.target.checked?[...a,i]:a.filter(x=>x!==i);LS.s('bz-ck',a)}};
const li=a=>'<ul>'+a.map(x=>`<li>${x}</li>`).join('')+'</ul>';
P.grants=e=>{const it=a=>a.map(([t,d,u,l])=>`<div class="gi"><b>${t}</b><p>${d}</p>${u?`<a href="${u}" target="_blank" rel="noopener noreferrer">${l} ↗</a>`:''}</div>`).join('');e.innerHTML=`<div class="xg"><div class="xc"><h3>Қазақстандағы мүмкіндіктер</h3>${it([['Мемлекеттік білім гранты','ҰБТ нәтижесі бойынша конкурс. Шектік балдан өту — тек қатысу шарты: грантты сол мамандыққа балы ең жоғары үміткерлер алады. Өтінім eGov арқылы беріледі (2026 жылы 13–20 шілде).','https://egov.kz','egov.kz'],['Ауылдық және әлеуметтік квоталар','Грант орындарының бір бөлігі ауыл жастарына, көпбалалы және әлеуметтік осал отбасылардан шыққан үміткерлерге, ерекше білім қажеттілігі бар жастарға бөлінеді. Квотада конкурс жалпы конкурстан бөлек өтеді.','',''],['«Болашақ» халықаралық стипендиясы','Әлемнің жетекші университеттерінде магистратура, докторантура және тағылымдама. Бакалавриатқа берілмейді.','https://bolashak.gov.kz','bolashak.gov.kz'],['Назарбаев Университеті','Түсу NUET және тіл сертификаты арқылы. Түскен студенттердің көпшілігі мемлекеттік грантпен оқиды.','https://nu.edu.kz','nu.edu.kz'],['ЖОО және әкімдік гранттары','Кейбір университеттер өз гранттары мен жеңілдіктерін береді, ал облыс әкімдіктері өңірге қажет мамандықтарға грант бөледі. Әр ЖОО-ның қабылдау комиссиясынан сұраңыз.','','']])}</div><div class="xc"><h3>Шетелдік бағдарламалар</h3>${it([['Chevening — Ұлыбритания','1 жылдық магистратураға толық стипендия. Кемінде 2 жыл жұмыс тәжірибесі керек.','https://www.chevening.org','chevening.org'],['DAAD — Германия','Магистратура, докторантура және зерттеу бағдарламаларына стипендиялар.','https://www.daad.de/en/','daad.de'],['Fulbright — АҚШ','Магистратура мен зерттеу бағдарламаларына АҚШ үкіметінің стипендиясы.','https://foreign.fulbrightonline.org','fulbrightonline.org'],['Erasmus+ / Erasmus Mundus — Еуропа','Алмасу семестрлері және бірнеше елде оқытылатын бірлескен магистратура.','https://erasmus-plus.ec.europa.eu','erasmus-plus.ec.europa.eu'],['Türkiye Bursları — Түркия','Бакалавриаттан докторантураға дейін: оқу ақысы, жатақхана және ай сайынғы шәкіртақы.','https://www.turkiyeburslari.gov.tr','turkiyeburslari.gov.tr'],['Stipendium Hungaricum — Венгрия','Бакалавриат, магистратура және докторантура. Қазақстан серіктес елдер қатарында.','https://stipendiumhungaricum.hu','stipendiumhungaricum.hu'],['GKS — Корея','Корея үкіметінің бакалавриат пен магистратураға арналған стипендиясы.','https://www.studyinkorea.go.kr','studyinkorea.go.kr'],['CSC — Қытай','Қытай үкіметінің стипендиясы: бакалавриат, магистратура, докторантура.','https://www.campuschina.org','campuschina.org']])}</div></div><p class="xm">Талаптар мен мерзім жыл сайын өзгереді. Өтініш бермес бұрын әр бағдарламаның ресми сайтын тексеріңіз.</p>`};
const FAQ_KZ=[["ҰБТ-ға қанша пән кіреді?", "Үш міндетті пән (Қазақстан тарихы, Оқу сауаттылығы, Математикалық сауаттылық) және екі бейіндік пән. Барлығы 120 тапсырма, ең жоғары нәтиже — 140 балл."], ["Шекті балл дегеніміз не?", "Грант конкурсына және ақылы бөлімге қатысу үшін жинау керек ең төменгі балл. 2026 жылы: жалпы 50 балл, ұлттық ЖОО-ларда 65, педагогика мен құқық бағыттарында 75, медицинада 70, ауыл шаруашылығы мен ветеринарияда 50. ЖОО өз шегін бұдан жоғары қоюы мүмкін — оны ЖОО бетіндегі кестеден қара."], ["Шекті балл мен өту балының айырмашылығы неде?", "Шекті балл — конкурсқа қатысуға рұқсат беретін ең төменгі балл. Өту балы — сол жылы грант алған соңғы талапкердің балы; ол бәсекеге байланысты жыл сайын өзгереді. Өткен жылдардың өту балдарын «Өткен жылдар» бетінен көресің."], ["Грант пен ақылы бөлімнің айырмасы?", "Грантты мемлекет төлейді: оқу ақысы толық жабылады, үлгерімің жақсы болса шәкіртақы да төленеді. Ақылы бөлімде оқу ақысын өзің немесе отбасың төлейді."], ["Грантқа өтініш қашан және қалай беріледі?", "2026 жылы өтініштер 13–20 шілде аралығында eGov.kz порталы арқылы немесе ЖОО жанындағы қабылдау орталығында қабылданды. Грант иегерлерінің тізімі 7 тамызда жарияланды, ЖОО-ға құжат тапсыру 25 тамызға дейін созылды. Келер жылдың нақты күндерін министрлік жариялайды."], ["Ауылдық квота деген не?", "Гранттардың бір бөлігі ауылдық жерден келген талапкерлер арасында бөлек конкурспен бөлінеді. Ауылдық квотада өту балы көбіне жалпы конкурстан төмен болады — мамандық бетіндегі «Ауылдық квота» бағанынан көр."], ["Шығармашылық емтихан қай мамандықтарда?", "Өнер, дизайн, музыка, спорт, кейбір педагогикалық бағыттарда бейіндік пәндердің орнына ЖОО-ның өзінде шығармашылық емтихан тапсырылады. Мамандық бетінде «Шығармашылық» деп белгіленген."], ["Менің балыма қай мамандыққа грант бар?", "«Грант есептегіш» бетіне ҰБТ балыңды жаз: шектен өтетін мамандықтар, өткен жылғы өту балына жететіндері және 2026 жылғы грант саны шығады."], ["Балл жетпесе не істеймін?", "Ақылы бөлім, колледж негізінде қысқартылған бағдарлама, келесі жылы қайта тапсыру немесе өту балы төменірек ұқсас мамандық не ЖОО таңдау. Ауылдан болсаң, ауылдық квотаны да қарастыр."], ["Жатақхана мен әскери кафедра бар ма — қайдан білемін?", "Әр университеттің бетінде «Жатақхана» және «Әскери кафедра» карточкалары бар, әрқайсысының жанында дереккөз сілтемесі тұр."], ["Шетелге түсу үшін не керек?", "Тіл сертификаты (IELTS/TOEFL), мектеп транскрипті, мотивациялық хат, ұсыным хаттары, кейде SAT, содан соң виза. Дайындықты 12 ай бұрын баста. «Грант және шәкіртақы» бетінде шетелдік бағдарламалар бар."], ["Сайтқа неге тіркелу керек?", "Тіркелсең, жоспарың мен таңдаулыларың кез келген құрылғыда сақталады, университет беттерінде пікір жаза аласың."], ["Деректер қайдан алынған және қаншалықты жаңа?", "Гранттар мен өту балдары — Ғылым және жоғары білім министрлігінің 2026–2027 оқу жылының ресми құжаттарынан, мамандықтар тізімі — ЕПВО тізілімінен, ЖОО деректері — университеттердің ресми сайттарынан. Әр дерек жанында дереккөз сілтемесі бар. Түсер алдында ресми сайтпен салыстыр."]];
P.faq=e=>{e.innerHTML=FAQ_KZ.map(([q,a])=>`<details class="xd"><summary>${q}</summary><p>${a}</p></details>`).join('')+`<p><a class="btn" href="#/ai">AI кеңесшіден сұрау</a></p>`};
P.club=async e=>{e.innerHTML=`<p class="xm">Өз пікіріңді немесе түсу тәжірибеңді жаз. Жазбалар барлық қолданушыларға көрінеді.</p><div class="xr"><input id="cu" placeholder="ЖОО немесе тақырып" maxlength="80"><textarea id="ct" placeholder="Әңгімең..." maxlength="600"></textarea><button class="btn" id="cb">Жариялау</button></div><p class="xm" id="cm"></p><div id="cl"><p class="xm">Жүктелуде…</p></div>`;
 const draw=r=>{$('cl').innerHTML=r.length?r.map(x=>`<div class="xc upost"><b>${esc(x.topic)}</b><p>${esc(x.text)}</p><small class="xm">${x.author?esc(x.author)+' · ':''}${esc((x.created_at||'').slice(0,10))}</small></div>`).join(''):`<div class="nodata"><p><b>Әзірге жазба жоқ.</b></p><p>Не жазуға болады: қай ЖОО-ға түстің, қанша балмен, қандай құжат керек болды, келесі талапкерге қандай кеңес бересің.</p></div>`};
 try{draw(await api('/api/club'))}catch(_){$('cl').innerHTML='<p class="xm">Серверге қосылу мүмкін болмады.</p>'}
 $('cb').onclick=async()=>{const u=$('cu').value.trim(),t=$('ct').value.trim();if(!t)return;$('cb').disabled=true;
  try{await api('/api/club',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:u||'Пікір',text:t})});$('cu').value='';$('ct').value='';$('cm').textContent='Жарияланды, рахмет!';draw(await api('/api/club'))}
  catch(err){$('cm').textContent=err.status===429?'Тым жиі жазып жатырсыз, біраз күте тұрыңыз.':'Жариялау мүмкін болмады. Кейінірек қайталап көріңіз.'}
  $('cb').disabled=false}};
const C0=P.compare;P.compare=e=>{C0(e);const o='<option value="">—</option>'+majors.map(m=>`<option value="${m.code}">${m.code} ${esc(m.name)}</option>`).join('');e.insertAdjacentHTML('beforeend',`<h3 style="margin:28px 0 12px">Мамандықтарды салыстыру</h3><div class="xr">${[0,1,2].map(i=>`<select class="cmm" aria-label="Мамандық ${i+1}">${o}</select>`).join('')}</div><div id="cmM" class="xs"></div>`);const Sl=[...e.querySelectorAll('.cmm')],sv=LS.g('bz-cmm',[]);Sl.forEach((s,i)=>s.value=sv[i]||'');
const up=()=>{const v=Sl.map(s=>s.value);LS.s('bz-cmm',v);const L=v.filter(Boolean).map(c=>majors.find(m=>m.code===c)),s=sc();$('cmM').innerHTML=L.length<2?'<p class="xm">Кемінде екі мамандық таңдаңыз.</p>':`<table class="xt"><tr><th></th>${L.map(m=>`<th>${m.code}</th>`).join('')}</tr><tr><td>Атауы</td>${L.map(m=>`<td>${esc(m.name)}</td>`).join('')}</tr><tr><td>Шектік балл</td>${L.map(m=>`<td>${thr(m)}</td>`).join('')}</tr><tr><td>Пәндер</td>${L.map(m=>`<td>${esc(m.combo||'ресми тізімнен тексеріңіз')}</td>`).join('')}</tr>${s!=null?`<tr><td>Сіздің балыңыз ${s}</td>${L.map(m=>`<td>${s>=thr(m)?'шектік балдан өтеді':thr(m)-s+' балл шектік балға жетпейді'}</td>`).join('')}</tr>`:''}</table>`};Sl.forEach(x=>x.onchange=up);up()};
route();
})();

