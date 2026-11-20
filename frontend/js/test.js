/* BilimIzde — мамандық таңдау тесті (2-нұсқа).
   3 бөлім: қызығушылық, пәндер, жұмыс стилі. Нәтиже: салалар, ҰБТ пәндері, нақты мамандықтар.
   Әр жауап тегтерге ұпай береді: сала кілттері (ped, art, hum, soc, bus, nat, ict, eng, agr, vet, health, serv)
   және ҰБТ бейіндік пәндері (M, P, I, B, C, G, H, F, L, K). */
(() => {
const L = () => window.BZ_LANG || 'kk';
const li = () => ({ kk: 0, ru: 1, en: 2 }[L()] || 0);
const t3 = (kk, ru, en) => [kk, ru, en][li()];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = { g(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, s(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ҰБТ бейіндік пәндері */
const SUBJ = {
  M: ['Математика', 'Математика', 'Mathematics'], P: ['Физика', 'Физика', 'Physics'], I: ['Информатика', 'Информатика', 'Computer Science'],
  B: ['Биология', 'Биология', 'Biology'], C: ['Химия', 'Химия', 'Chemistry'], G: ['География', 'География', 'Geography'],
  H: ['Дүниежүзі тарихы', 'Всемирная история', 'World History'], F: ['Шет тілі', 'Иностранный язык', 'Foreign Language'],
  L: ['Құқық негіздері', 'Основы права', 'Fundamentals of Law'], K: ['Тіл және әдебиет', 'Язык и литература', 'Language and literature'],
};
const SKEY = { 'Математика': 'M', 'Физика': 'P', 'Информатика': 'I', 'Биология': 'B', 'Химия': 'C', 'География': 'G', 'Дүниежүзі тарихы': 'H', 'Шет тілі': 'F', 'Құқық негіздері': 'L' };
const subjOf = m => { const c = m.combo_kk || m.combo || ''; if (c.startsWith('Шығарма')) return []; return c ? [...new Set(c.split('+').map(x => x.trim()).map(x => SKEY[x] || (/тіл|әдебиет/i.test(x) ? 'K' : null)).filter(Boolean))] : []; };

/* Салалар (FIELDS кілттері) */
const FN = {
  ped: ['Білім беру', 'Образование', 'Education'], art: ['Өнер', 'Искусство', 'Arts'], hum: ['Гуманитарлық ғылымдар', 'Гуманитарные науки', 'Humanities'],
  soc: ['Әлеуметтік ғылымдар, журналистика', 'Социальные науки, журналистика', 'Social sciences, journalism'], bus: ['Бизнес, басқару, құқық', 'Бизнес, управление, право', 'Business, management, law'],
  nat: ['Жаратылыстану ғылымдары', 'Естественные науки', 'Natural sciences'], ict: ['IT және байланыс', 'IT и связь', 'IT and communications'],
  eng: ['Инженерия, өндіріс, құрылыс', 'Инженерия, производство, строительство', 'Engineering, manufacturing, construction'],
  agr: ['Ауыл шаруашылығы', 'Сельское хозяйство', 'Agriculture'], vet: ['Ветеринария', 'Ветеринария', 'Veterinary'],
  health: ['Денсаулық сақтау', 'Здравоохранение', 'Healthcare'], serv: ['Қызмет көрсету, туризм, спорт', 'Услуги, туризм, спорт', 'Services, tourism, sport'],
};

/* Сұрақтар: [бөлім, [kk,ru,en], [[kk,ru,en,'тег:ұпай,...'], ...]] */
const Q = [
 // I. Қызығушылық
 [1, ['Бос уақытта не істегенді ұнатасың?', 'Чем любишь заниматься в свободное время?', 'What do you enjoy doing in your free time?'], [
   ['Есеп, жұмбақ, логикалық ойын шешу', 'Решать задачи, головоломки, логические игры', 'Solving problems, puzzles, logic games', 'M:2,eng:1,ict:1'],
   ['Бағдарлама, сайт немесе ойын жасау', 'Создавать программы, сайты или игры', 'Building programs, websites or games', 'ict:3,I:2'],
   ['Сурет салу, музыка, бейне түсіру', 'Рисовать, заниматься музыкой, снимать видео', 'Drawing, music, making videos', 'art:3'],
   ['Кітап оқу, жазу, пікірталас', 'Читать, писать, спорить и обсуждать', 'Reading, writing, debating', 'hum:2,soc:1,K:1']]],
 [1, ['Мектепте қай тақырып саған ерекше қызық?', 'Какая тема в школе тебе особенно интересна?', 'Which school topic interests you most?'], [
   ['Адам ағзасы, ауру мен емдеу', 'Организм человека, болезни и лечение', 'The human body, illness and treatment', 'health:3,B:2,C:1'],
   ['Заттардың құрамы, реакциялар', 'Состав веществ, реакции', 'What substances are made of, reactions', 'C:2,nat:2,eng:1'],
   ['Елдер, табиғат, климат', 'Страны, природа, климат', 'Countries, nature, climate', 'G:2,nat:1,serv:1'],
   ['Тарих, саясат, халықаралық қатынастар', 'История, политика, международные отношения', 'History, politics, international relations', 'H:2,soc:2,hum:1']]],
 [1, ['Қай жоба саған көбірек ұнар еді?', 'Какой проект тебе понравился бы больше?', 'Which project would you enjoy more?'], [
   ['Робот немесе құрылғы құрастыру', 'Собрать робота или устройство', 'Building a robot or device', 'eng:3,P:2'],
   ['Мобильді қосымша жасау', 'Сделать мобильное приложение', 'Making a mobile app', 'ict:3,I:2,M:1'],
   ['Шағын бизнес ашып, ақша есептеу', 'Открыть небольшой бизнес и считать деньги', 'Starting a small business and managing money', 'bus:3,M:1'],
   ['Балаларға сабақ беру немесе үйірме өткізу', 'Вести уроки или кружок для детей', 'Teaching children or running a club', 'ped:3']]],
 [1, ['Қай мәселені шешкің келеді?', 'Какую проблему тебе хотелось бы решать?', 'Which problem would you like to solve?'], [
   ['Науқастарды емдеу, денсаулықты сақтау', 'Лечить больных, беречь здоровье', 'Treating patients, protecting health', 'health:3,B:1'],
   ['Таза су, экология, қоршаған орта', 'Чистая вода, экология, окружающая среда', 'Clean water, ecology, the environment', 'nat:2,eng:1,G:1,B:1'],
   ['Азық-түлік, егін, мал', 'Продовольствие, урожай, скот', 'Food, crops, livestock', 'agr:3,B:1'],
   ['Әділеттілік, адам құқығы', 'Справедливость, права человека', 'Justice, human rights', 'bus:2,L:2,soc:1,H:1']]],
 [1, ['Қай кәсіп иесімен бір күн өткізгің келеді?', 'С кем из профессионалов ты хотел(а) бы провести день?', 'Which professional would you like to shadow for a day?'], [
   ['Хирург немесе фармацевт', 'Хирург или фармацевт', 'A surgeon or pharmacist', 'health:3,C:1,B:1'],
   ['Сәулетші немесе құрылыс инженері', 'Архитектор или инженер-строитель', 'An architect or civil engineer', 'eng:2,art:1,M:1'],
   ['Журналист немесе аудармашы', 'Журналист или переводчик', 'A journalist or translator', 'soc:2,hum:2,F:1'],
   ['Банкир немесе экономист', 'Банкир или экономист', 'A banker or economist', 'bus:3,M:1']]],
 [1, ['Жануарларға қалай қарайсың?', 'Как ты относишься к животным?', 'How do you feel about animals?'], [
   ['Оларды емдеп, күткім келеді', 'Хочу их лечить и ухаживать', 'I want to treat and care for them', 'vet:3,B:2'],
   ['Ферма, мал шаруашылығы қызық', 'Интересна ферма, животноводство', 'Farming and livestock interest me', 'agr:3,B:1'],
   ['Ұнайды, бірақ мамандық ретінде емес', 'Нравятся, но не как профессия', 'I like them, but not as a career', ''],
   ['Табиғатты, жабайы әлемді зерттеу қызық', 'Интересно изучать природу и дикую жизнь', 'Studying nature and wildlife interests me', 'nat:2,B:1,G:1']]],
 [1, ['Қай іс-шара саған жақын?', 'Какое мероприятие тебе ближе?', 'Which event appeals to you?'], [
   ['Хакатон немесе IT-олимпиада', 'Хакатон или IT-олимпиада', 'A hackathon or IT olympiad', 'ict:3,I:1,M:1'],
   ['Спорт жарысы', 'Спортивные соревнования', 'A sports competition', 'serv:3,B:1'],
   ['Концерт, көрме, театр', 'Концерт, выставка, театр', 'A concert, exhibition, theatre', 'art:3'],
   ['Дебат, модель ООН', 'Дебаты, модель ООН', 'A debate, Model UN', 'soc:2,hum:1,H:1,F:1']]],
 [1, ['Саяхаттағанда не қызықтырады?', 'Что тебе интересно в путешествиях?', 'What interests you when travelling?'], [
   ['Жаңа тіл, мәдениет, адамдар', 'Новые языки, культура, люди', 'New languages, cultures, people', 'F:2,hum:1,serv:1'],
   ['Қонақүй, мейрамхана, сервис қалай жұмыс істейді', 'Как устроены отели, рестораны, сервис', 'How hotels, restaurants and service work', 'serv:3,bus:1'],
   ['Табиғат, тау, жер бедері', 'Природа, горы, рельеф', 'Nature, mountains, landscapes', 'G:2,nat:1'],
   ['Тарихи ескерткіштер, мұражайлар', 'Исторические памятники, музеи', 'Historic monuments, museums', 'hum:2,H:2']]],
 [1, ['Үйде бір нәрсе бұзылса не істейсің?', 'Если дома что-то сломалось, что ты делаешь?', 'When something breaks at home, what do you do?'], [
   ['Өзім ашып, жөндеуге тырысамын', 'Пытаюсь сам(а) разобрать и починить', 'I open it up and try to fix it', 'eng:3,P:1'],
   ['Интернеттен себебін іздеймін', 'Ищу причину в интернете', 'I look up the cause online', 'ict:1,I:1,eng:1'],
   ['Шебер шақырамын, өзгеге сенемін', 'Вызываю мастера', 'I call a repair person', 'bus:1'],
   ['Отбасындағыларға көмектесіп, ұйымдастырамын', 'Помогаю семье и организую процесс', 'I help my family and organise things', 'soc:1,ped:1']]],
 [1, ['Электр, машина, механизм туралы білгің келе ме?', 'Хочешь разбираться в электричестве, машинах, механизмах?', 'Do you want to understand electricity, machines and mechanisms?'], [
   ['Иә, өте қызық', 'Да, очень интересно', 'Yes, very much', 'eng:3,P:2'],
   ['Аздап', 'Немного', 'A little', 'eng:1'],
   ['Жоқ, адамдармен жұмыс қызығырақ', 'Нет, работать с людьми интереснее', 'No, working with people is more interesting', 'soc:1,ped:1,serv:1'],
   ['Жоқ, мәтін мен идеялар қызығырақ', 'Нет, тексты и идеи интереснее', 'No, texts and ideas are more interesting', 'hum:2,K:1']]],
 // II. Пәндер
 [2, ['Қай пән саған оңай әрі ұнайды?', 'Какой предмет даётся тебе легко и нравится?', 'Which subject is easy and enjoyable for you?'], [
   ['Математика', 'Математика', 'Mathematics', 'M:3'], ['Физика', 'Физика', 'Physics', 'P:3'],
   ['Информатика', 'Информатика', 'Computer Science', 'I:3'], ['Ешқайсысы', 'Ни один из них', 'None of these', '']]],
 [2, ['Ал мына пәндердің қайсысы?', 'А из этих предметов?', 'And among these subjects?'], [
   ['Биология', 'Биология', 'Biology', 'B:3'], ['Химия', 'Химия', 'Chemistry', 'C:3'],
   ['География', 'География', 'Geography', 'G:3'], ['Ешқайсысы', 'Ни один из них', 'None of these', '']]],
 [2, ['Мына пәндердің қайсысы жақын?', 'Какой из этих предметов тебе ближе?', 'Which of these subjects is closest to you?'], [
   ['Дүниежүзі тарихы', 'Всемирная история', 'World History', 'H:3'], ['Шет тілі', 'Иностранный язык', 'Foreign Language', 'F:3'],
   ['Құқық негіздері', 'Основы права', 'Fundamentals of Law', 'L:3'], ['Қазақ / орыс тілі мен әдебиеті', 'Казахский / русский язык и литература', 'Kazakh / Russian language and literature', 'K:3']]],
 [2, ['Есепті қалай шығарғанды ұнатасың?', 'Как тебе нравится решать задачи?', 'How do you like to solve problems?'], [
   ['Формула мен сандар арқылы', 'Через формулы и числа', 'With formulas and numbers', 'M:2,P:1'],
   ['Тәжірибе жасап, бақылап', 'Ставя опыты и наблюдая', 'By experimenting and observing', 'C:1,B:1,nat:2'],
   ['Мәтінді талдап, дәлел келтіріп', 'Анализируя текст и приводя доводы', 'By analysing texts and arguing', 'K:1,H:1,hum:1,L:1'],
   ['Сурет, схема, макет арқылы', 'Через рисунки, схемы, макеты', 'With drawings, diagrams, models', 'art:2,eng:1']]],
 [2, ['Олимпиадаға қай пәннен барар едің?', 'По какому предмету пошёл(ла) бы на олимпиаду?', 'Which subject olympiad would you enter?'], [
   ['Математика немесе информатика', 'Математика или информатика', 'Maths or computer science', 'M:2,I:2'],
   ['Биология немесе химия', 'Биология или химия', 'Biology or chemistry', 'B:2,C:2'],
   ['Тарих немесе география', 'История или география', 'History or geography', 'H:2,G:2'],
   ['Ағылшын тілі немесе әдебиет', 'Английский или литература', 'English or literature', 'F:2,K:2']]],
 [2, ['Ағылшын тілін қаншалықты жақсы көресің?', 'Насколько тебе нравится английский язык?', 'How much do you like English?'], [
   ['Өте ұнайды, еркін сөйлегім келеді', 'Очень нравится, хочу говорить свободно', 'I love it and want to be fluent', 'F:3,soc:1'],
   ['Қалыпты', 'Нормально', 'It\'s fine', 'F:1'],
   ['Онша емес', 'Не очень', 'Not really', ''],
   ['Басқа шет тілі (қытай, түрік, араб т.б.) қызық', 'Интересен другой язык (китайский, турецкий, арабский и т.д.)', 'Another language (Chinese, Turkish, Arabic etc.) interests me', 'hum:2,F:1']]],
 [2, ['Сурет, музыка немесе спорт бойынша дайындығың бар ма?', 'Есть ли у тебя подготовка в рисовании, музыке или спорте?', 'Do you have training in art, music or sport?'], [
   ['Иә, сурет немесе дизайн', 'Да, рисование или дизайн', 'Yes, drawing or design', 'art:3'],
   ['Иә, музыка, ән, би немесе театр', 'Да, музыка, вокал, танцы или театр', 'Yes, music, singing, dance or theatre', 'art:3'],
   ['Иә, спорт', 'Да, спорт', 'Yes, sport', 'serv:3'],
   ['Жоқ', 'Нет', 'No', '']]],
 // III. Жұмыс стилі
 [3, ['Қай ортада жұмыс істегің келеді?', 'В какой обстановке хочешь работать?', 'Where would you like to work?'], [
   ['Кеңсе, компьютер алдында', 'Офис, за компьютером', 'An office, at a computer', 'ict:1,bus:2'],
   ['Зертхана немесе аурухана', 'Лаборатория или больница', 'A lab or hospital', 'health:2,nat:2'],
   ['Ашық ауада, далада, объектіде', 'На открытом воздухе, на объекте', 'Outdoors, on site', 'eng:2,agr:2,G:1'],
   ['Мектеп, сахна немесе адамдар арасында', 'Школа, сцена или среди людей', 'A school, stage or among people', 'ped:2,art:1,serv:1']]],
 [3, ['Көбіне кіммен немесе немен жұмыс істегің келеді?', 'С кем или с чем хочешь работать чаще всего?', 'Who or what do you want to work with most?'], [
   ['Адамдармен', 'С людьми', 'With people', 'ped:1,health:1,soc:1,serv:1'],
   ['Деректер мен сандармен', 'С данными и числами', 'With data and numbers', 'M:1,ict:1,bus:1'],
   ['Техника мен құралдармен', 'С техникой и инструментами', 'With machines and tools', 'eng:2,P:1'],
   ['Табиғатпен, өсімдік пен жануармен', 'С природой, растениями и животными', 'With nature, plants and animals', 'agr:1,vet:1,nat:1,B:1']]],
 [3, ['Сен үшін ең маңыздысы не?', 'Что для тебя важнее всего?', 'What matters most to you?'], [
   ['Жоғары жалақы', 'Высокая зарплата', 'A high salary', 'bus:1,ict:1,eng:1'],
   ['Адамдарға көмектесу', 'Помогать людям', 'Helping people', 'health:2,ped:1,soc:1'],
   ['Шығармашылық еркіндік', 'Творческая свобода', 'Creative freedom', 'art:2,ict:1'],
   ['Тұрақтылық, мемлекеттік қызмет', 'Стабильность, госслужба', 'Stability, public service', 'bus:1,L:1,ped:1']]],
 [3, ['Қай рөл саған сай?', 'Какая роль тебе подходит?', 'Which role suits you?'], [
   ['Жетекші, ұйымдастырушы', 'Лидер, организатор', 'A leader or organiser', 'bus:2,soc:1'],
   ['Зерттеуші, сарапшы', 'Исследователь, аналитик', 'A researcher or analyst', 'nat:2,M:1,ict:1'],
   ['Жасаушы, құрастырушы', 'Создатель, конструктор', 'A maker or builder', 'eng:2,ict:1,art:1'],
   ['Көмекші, кеңесші', 'Помощник, консультант', 'A helper or adviser', 'health:1,ped:1,soc:1,serv:1']]],
 [3, ['Ұзақ оқуға дайынсың ба (мысалы, медицина 6–7 жыл)?', 'Готов(а) ли ты долго учиться (например, медицина 6–7 лет)?', 'Are you ready for long training (e.g. medicine, 6–7 years)?'], [
   ['Иә, мақсатым болса', 'Да, если есть цель', 'Yes, if I have a goal', 'health:2'],
   ['4 жыл жеткілікті', '4 года достаточно', '4 years is enough', ''],
   ['Тезірек жұмысқа шыққым келеді', 'Хочу быстрее начать работать', 'I want to start working sooner', 'serv:1,bus:1'],
   ['Білмеймін', 'Не знаю', 'Not sure', '']]],
 [3, ['Қай жерде тұрып жұмыс істегің келеді?', 'Где хочешь жить и работать?', 'Where would you like to live and work?'], [
   ['Ірі қалада, офисте', 'В большом городе, в офисе', 'In a big city, in an office', 'bus:1,ict:1'],
   ['Өндіріс орнында, кен орнында', 'На производстве, месторождении', 'At a plant or oil/mining field', 'eng:2'],
   ['Ауылда, өз шаруашылығымда', 'В селе, в своём хозяйстве', 'In a village, on my own farm', 'agr:2,vet:1'],
   ['Шетелде немесе саяхаттап', 'За границей или в разъездах', 'Abroad or travelling', 'F:1,serv:1,soc:1']]],
 [3, ['Жұмыста не жасағың келеді?', 'Что хочешь делать на работе?', 'What do you want to do at work?'], [
   ['Бір нәрсені жобалау, сызу', 'Проектировать, чертить', 'Design and draft things', 'eng:2,art:1,M:1'],
   ['Бағдарлама жазу, деректерді талдау', 'Писать программы, анализировать данные', 'Write code, analyse data', 'ict:2,I:1,M:1'],
   ['Сөйлеу, жазу, түсіндіру', 'Говорить, писать, объяснять', 'Speak, write, explain', 'soc:1,ped:1,hum:1,K:1'],
   ['Сату, келіссөз жүргізу', 'Продавать, вести переговоры', 'Sell and negotiate', 'bus:2,serv:1']]],
 [3, ['Стресске қалай қарайсың?', 'Как ты относишься к стрессу?', 'How do you handle stress?'], [
   ['Жедел шешім қабылдай аламын', 'Могу быстро принимать решения', 'I can make quick decisions', 'health:1,bus:1'],
   ['Тыныш, біркелкі жұмыс ұнайды', 'Нравится спокойная, размеренная работа', 'I prefer calm, steady work', 'nat:1,hum:1'],
   ['Командада жақсы жұмыс істеймін', 'Хорошо работаю в команде', 'I work well in a team', 'soc:1,eng:1,ict:1'],
   ['Жалғыз жұмыс істегенді ұнатамын', 'Предпочитаю работать один(одна)', 'I prefer working alone', 'art:1,ict:1']]],
];
const PART = { 1: ['Қызығушылық', 'Интересы', 'Interests'], 2: ['Пәндер', 'Предметы', 'Subjects'], 3: ['Жұмыс стилі', 'Стиль работы', 'Work style'] };

function score(ans) {
  const w = {};
  ans.forEach((a, i) => { if (a == null) return; const tags = Q[i][2][a][3]; tags && tags.split(',').forEach(t => { const [k, v] = t.split(':'); w[k] = (w[k] || 0) + (+v || 1); }); });
  const F = Object.keys(FN), S = Object.keys(SUBJ);
  const fmax = Math.max(1, ...F.map(k => w[k] || 0)), smax = Math.max(1, ...S.map(k => w[k] || 0));
  const fs = Object.fromEntries(F.map(k => [k, (w[k] || 0) / fmax])), ss = Object.fromEntries(S.map(k => [k, (w[k] || 0) / smax]));
  const res = (window.majors || []).map(m => {
    const f = fieldOf(m.code), sj = subjOf(m), cre = isCre(m);
    const fv = f ? fs[f] || 0 : 0;
    const sv = sj.length ? sj.reduce((a, k) => a + (ss[k] || 0), 0) / sj.length : (cre ? fs.art || 0 : fv * 0.6);
    let v = fv * 0.55 + sv * 0.45;
    if (cre && (fs.art || 0) < 0.5) v *= 0.4;
    const why = [];
    if (f && fv >= 0.6) why.push(t3('қызығушылығың «', 'твои интересы в сфере «', 'your interest in "') + (FN[f] || [])[li()] + t3('» саласына сай', '»', '"'));
    sj.filter(k => (ss[k] || 0) >= 0.6).forEach(k => why.push(t3('ұнайтын пәнің: ', 'любимый предмет: ', 'a favourite subject: ') + SUBJ[k][li()]));
    if (cre && (fs.art || 0) >= 0.6) why.push(t3('шығармашылық қабілетің бар', 'есть творческие способности', 'you have creative skills'));
    return { m, v, why };
  }).filter(x => x.v > 0.15).sort((a, b) => b.v - a.v);
  return { fs, ss, res };
}

window.BZ_TEST = el => {
  let i = 0; const ans = LS.g('bz-test-ans', []).slice(0, Q.length);
  if (ans.length === Q.length && ans.every(a => a != null)) i = Q.length;
  const pct = x => Math.round(x * 100);
  const draw = () => {
    if (i >= Q.length) return result();
    const [part, q, o] = Q[i];
    el.innerHTML = `<p class="xm">${t3('Бөлім', 'Часть', 'Part')} ${part}/3 · ${PART[part][li()]} · ${i + 1} / ${Q.length}</p>
    <div class="gbar"><i style="left:0;width:${i / Q.length * 100}%"></i></div><h3>${esc(q[li()])}</h3>
    <div class="xo">${o.map((a, j) => `<button class="ch${ans[i] === j ? ' on' : ''}" data-j="${j}">${esc(a[li()])}</button>`).join('')}</div>
    <p>${i ? `<button class="btn alt" id="tBk">← ${t3('Артқа', 'Назад', 'Back')}</button>` : ''}</p>`;
    if (i) el.querySelector('#tBk').onclick = () => { i--; draw(); };
    el.querySelector('.xo').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; ans[i] = +b.dataset.j; LS.s('bz-test-ans', ans); i++; draw(); };
  };
  const result = () => {
    const { fs, ss, res } = score(ans);
    const sc = parseInt((document.getElementById('score') || {}).value) || LS.g('bz-score', null);
    const fTop = Object.entries(fs).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const sTop = Object.entries(ss).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const top = res.slice(0, 12), best = top[0] ? top[0].v : 1;
    const plan = window.BZ_PLAN_GET ? BZ_PLAN_GET() : { majors: [] };
    const bar = (l, v) => `<div class="drow"><span>${esc(l)}</span><b>${pct(v)}%</b></div><div class="gbar"><i style="left:0;width:${pct(v)}%"></i></div>`;
    const g26 = c => (window.G26 || {})[c];
    el.innerHTML = `<p class="xm">${t3('Нәтиже', 'Результат', 'Result')}${sc != null ? ` · ${t3('ҰБТ балың', 'твой балл ЕНТ', 'your UNT score')}: ${sc}` : ''}</p>
    <div class="xg"><div class="xc"><h3>${t3('Саған жақын салалар', 'Подходящие сферы', 'Fields that suit you')}</h3>${fTop.map(([k, v]) => bar(FN[k][li()], v)).join('')}</div>
    <div class="xc"><h3>${t3('Саған жақын ҰБТ пәндері', 'Подходящие предметы ЕНТ', 'UNT subjects that suit you')}</h3>${sTop.map(([k, v]) => bar(SUBJ[k][li()], v)).join('') || `<p class="xm">—</p>`}</div></div>
    <h3>${t3('Саған сай мамандықтар', 'Подходящие специальности', 'Majors that suit you')}</h3>
    <div class="tres">${top.map(({ m, v, why }) => {
      const t = parseInt(m.grantScore), g = g26(m.code), inP = (plan.majors || []).includes(m.code);
      const ch = sc == null ? '' : sc >= t ? `<span class="chance hi">${t3('Шекке жетесің', 'Порог пройден', 'Above threshold')}</span>` : `<span class="chance low">${t3('Шекке', 'До порога', 'Short by')} ${t - sc} ${t3('балл жетпейді', 'балл.', 'pts')}</span>`;
      return `<div class="trow"><div class="tmain"><span class="code">${m.code}</span> <b>${esc(m.name)}</b> <small class="tm">${t3('сәйкестік', 'совпадение', 'match')} ${pct(v / best)}%</small>
       <div class="tmeta">${m.combo ? esc(m.combo) + ' · ' : ''}${t3('шектік', 'порог', 'threshold')} ${t}${g ? ` · ${t3('грант 2026', 'гранты 2026', 'grants 2026')}: ${g[0]}` : ''} ${ch}</div>
       ${why.length ? `<div class="twhy">${t3('Неге', 'Почему', 'Why')}: ${esc(why.slice(0, 3).join('; '))}</div>` : ''}</div>
       <div class="tact"><button class="ch" data-open="${m.code}">${t3('Толығырақ', 'Подробнее', 'Details')}</button><button class="ch" data-plan="${m.code}" ${inP ? 'disabled' : ''}>${inP ? t3('✓ Жоспарда', '✓ В плане', '✓ In plan') : t3('＋ Жоспарға', '＋ В план', '＋ To plan')}</button></div></div>`;
    }).join('')}</div>
    <p class="note">${t3('Тест — бағдар ғана. Сәйкестік сенің жауаптарыңнан есептеледі, ал шектік балл мен грант саны — 2026 жылғы ресми деректер. Шешім қабылдамас бұрын мамандық бетін және ЖОО талаптарын қара.', 'Тест — лишь ориентир. Совпадение считается по твоим ответам, а пороговый балл и число грантов — официальные данные 2026 года. Перед решением изучи страницу специальности и требования вузов.', 'The quiz is only a guide. The match is based on your answers; thresholds and grant numbers are official 2026 data. Check the major page and university requirements before deciding.')}</p>
    <p><button class="btn" id="tRe">${t3('Қайта өту', 'Пройти заново', 'Retake')}</button></p>`;
    el.querySelector('#tRe').onclick = () => { ans.length = 0; LS.s('bz-test-ans', []); i = 0; draw(); };
    el.querySelector('.tres').onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.open) openMajor(b.dataset.open);
      if (b.dataset.plan && window.BZ_PLAN_GET) { const p = BZ_PLAN_GET(); if (!p.majors.includes(b.dataset.plan)) { p.majors.push(b.dataset.plan); BZ_PLAN_SET(p); } b.disabled = true; b.textContent = t3('✓ Жоспарда', '✓ В плане', '✓ In plan'); }
    };
    try { window.BZ_TRACK && BZ_TRACK('page', 'test-done'); } catch (e) {}
  };
  draw();
};
window.BZ_TEST_Q = Q.length;
})();
