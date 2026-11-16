# BilimIzde

Қазақ тіліндегі білім порталы. Мұнда Қазақстан университеттері, мамандық шифрлары, ҰБТ шектік балдары, 2025/2026 жылдардағы грант саны және шетелдік университеттер жинақталған. Сайт қазақ, орыс және ағылшын тілдерінде жұмыс істейді.

## Мүмкіндіктер

- Грант есептегіш: ҰБТ балы бойынша мамандықтар мен түсу мүмкіндігін көрсетеді.
- 113 мамандық: шектік балл, пәндер, грант саны, өту балдары.
- Қазақстандағы 81 ЖОО және олардың картасы.
- 44 шетелдік университет: оқу ақысы, талаптар, тарихы.
- Мамандық таңдау тесті, ЖОО мен мамандықтарды салыстыру, құжаттар тізімі, гранттар, FAQ.
- AI кеңесші. Ол сайттағы базаның негізінде жауап береді. `ANTHROPIC_API_KEY` орнатылса, базадан жауап таппаған сұрақтарға тіл моделі жауап береді.
- Клуб: пікірлер серверде сақталады және барлық қолданушыларға көрінеді.

## Құрылымы

```
backend/
  app/
    main.py              FastAPI сервері: API + сайтты көрсету
    data/                барлық мәлімет (JSON)
      majors.json            мамандықтар
      universities.json      Қазақстан ЖОО-лары
      sites.json, site_extra.json   ЖОО сайттары
      fields.json            білім салалары
      grants_2025.json       2025 жылғы грант саны
      grants_2026.json       2026–2027 оқу жылына гранттар
      grants_other_years.json, quotas_2026.json, quota_names_2026.json
      passing_scores.json    грантқа өту балдары
      major_universities.json  мамандық бойынша ЖОО кестесі
      foreign.json           шетелдік университеттер
      foreign_history.json   олардың тарихы
      foreign_wiki.json      Wikipedia беттері (суреттер үшін)
      faq.json               AI білім қоры
  requirements.txt
frontend/
  index.html
  css/style.css
  js/api.js              серверден мәлімет жүктейді
  js/app.js              негізгі логика, беттер, AI
  js/extras.js           грант есептегіш, тіл ауыстыру
render.yaml              Render-ге орналастыру баптауы
```

Мәліметті жаңарту үшін `backend/app/data/` ішіндегі JSON файлын өзгертсең жеткілікті.

## Компьютерде іске қосу

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

- Сайт: http://127.0.0.1:8000
- API құжаттамасы: http://127.0.0.1:8000/docs

AI-ды тіл моделімен іске қосу үшін (міндетті емес):

```bash
set ANTHROPIC_API_KEY=sk-ant-...        # Windows (cmd)
# export ANTHROPIC_API_KEY=sk-ant-...   # macOS / Linux
```

## API

| Сұраныс | Не береді |
|---|---|
| `GET /api/health` | сервердің жағдайы |
| `GET /api/stats` | жалпы сандар |
| `GET /api/search?q=` | мамандық, ЖОО және шетелдік ЖОО бойынша іздеу |
| `GET /api/majors?q=&field=&max_threshold=` | мамандықтар |
| `GET /api/majors/{code}` | толық ақпарат: сала, гранттар, өту балдары, ЖОО кестесі |
| `GET /api/fields` | білім салалары мен 2026 квоталары |
| `GET /api/grant-check?score=110` | балға сай мамандықтар |
| `GET /api/universities?q=&city=&type=` | университеттер |
| `GET /api/universities/{code}` | бір университет |
| `GET /api/cities` | қалалар |
| `GET /api/foreign?q=&country=` | шетелдік университеттер |
| `GET /api/foreign/{id}` | бір шетелдік университет (тарихымен) |
| `GET /api/faq` | AI білім қоры |
| `POST /api/ask` | AI сұрағы `{question, context}` |
| `GET /api/club`, `POST /api/club` | клуб пікірлері `{topic, text}` |
| `GET /api/bootstrap` | сайтқа керек барлық мәлімет бір сұраныспен |

## Render-ге орналастыру (тегін)

1. https://render.com сайтына GitHub аккаунтыңмен кір.
2. **New → Blueprint** бас да, `BilimIzde` репозиторийін таңда. Render `render.yaml` файлын өзі оқиды.
3. Render `ANTHROPIC_API_KEY` мәнін сұрайды. AI керек болмаса, бос қалдыр.
4. **Apply** бас. Бірнеше минуттан кейін сайт `https://bilimizde.onrender.com` сияқты адреспен ашылады.
5. Әр `git push` жасаған сайын сайт өзі жаңарады.

Тегін тарифке қатысты екі ескерту:
- Сайтқа 15 минут ешкім кірмесе, сервер «ұйықтап» қалады. Келесі кіргенде бет 30–50 секундта ашылады.
- Тегін тарифте диск тұрақты емес. Сервер қайта қосылса, клуб пікірлері өшіп қалады. Пікірлер тұрақты сақталсын десең, ақылы Render Disk қосып, `BZ_DB_PATH` айнымалысына сол дисктегі жолды көрсет (мысалы `/var/data/bilimizde.db`), немесе сыртқы дерекқор қолдан.
