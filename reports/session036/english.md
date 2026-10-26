# Session036 — английская грамматика

Переработаны **60 существующих файлов**: grammar/core.md и grammar/usage.md уроков01–15, по30файлов в каждом из двух хранилищ. Физические уровни сохранены: A1уроки01–05, A2уроки06–10, B1уроки11–15.

В core добавлены15 самостоятельных объяснений: значение модели, образование, контекст и контраст, примеры с переводом, типичные ошибки. В usage добавлены15 конкретных ситуаций и **73 самостоятельных пункта проверки на одну версию** (146пунктов в двух физических копиях), ответы скрыты и объясняют выбор по условию. Примеры и ситуации написаны для библиотеки; упражнения источников не копировались.

## Темы

| Урок | Основной грамматический разбор |
|---|---|
| 01 | Be: профессия, место, возраст, вопросы и краткие ответы |
| 02 | Present Simple/Continuous, состояние и процесс, разные значения think/have |
| 03 | Прилагательное/наречие, good/well, hard/hardly, сравнение |
| 04 | My/mine, притяжательное 's, have/have got, enjoy и like |
| 05 | Исчисляемость по значению, количество, some/any, заказ и would like |
| 06 | Погодные модели, формальное it, -ed/-ing прилагательные |
| 07 | In/into, across/through, указания маршрута, транспорт |
| 08 | Расписание, договорённость, намерение, решение; часы и предлоги |
| 09 | Present Perfect/Past Simple, V3, for/since, been/gone |
| 10 | Рабочие обязанности, do/does, вопрос к подлежащему, задача сейчас |
| 11 | Процесс в прошлом, событие, последовательность, was/were/did |
| 12 | Относительные предложения, роль местоимения, запятые и пассив |
| 13 | Обязанность, запрет, отсутствие необходимости, совет и условие |
| 14 | Прежнее состояние/привычка, used to/would/be used to, пассив и даты |
| 15 | Цель сообщения, результат/деятельность, косвенный вопрос, if = если/ли |

## Конкретные исправления старых материалов

В обоих core, где применимо: разрешён одиночный Yes/No, уточнены its/it's и a/an с абстрактными исчисляемыми значениями; исправлен образец порядка always; убрана ошибочная оценка a friendly young man; ограничение enjoy не переносится на like/love/prefer; some разрешено в предложении угощения; схема do/does не объявляется схемой всех вопросов; краткий ответ No, I've never заменён на No, I haven't. Исправлен явно неверный русский комментарий к смысловому ударению SHE.

Дополнительные usage второй версии сохранены отдельно. Уточнены: stative не является безусловным NEVER для всех значений; связочное/действенное значение look/feel/taste; нет автоматической сексуальной трактовки feel myself; 's возможно с некоторыми неодушевлёнными/организациями; have существует в обоих вариантах языка; had got не запрещается как последовательность во всех иных конструкциях; enjoy отличается от like/love/prefer; артикль с завтраком выбирается по конструкции; погода может иметь собственное подлежащее; in the bus допустимо при особом пространственном акценте; физическая возможность встать не объясняет транспортные предлоги; расписание не запрещает все иные будущие формы; отсутствие даты не требует Perfect; when/while не переключают время автоматически; must выражает и институциональные правила; длительность сама по себе не запрещает used to; длительное действие от прошлого не требует исключительно Perfect Continuous; will после if допустим в других значениях if.

## Проверка сохранности

Скрипт english.ts строит результат из неизменяемых before-images Session036, проверяет все60целевых файлов до записи и допускает повторный запуск только для исходного/ожидаемого результата либо SHA256 предыдущего собственного отчёта. Чужое изменение без такого совпадения останавливает запись.

- Сохранены **1183 ранее существовавших ID**, включая **34 alias-span** для переименованных/убранных общих заголовков.
- Все прежние внутренние ссылки сохранены.
- Повторяющиеся ID и незакрытые/изначально открытые details запрещены проверкой.
- Прежние различия хранилищ сохранены: вторая версия usage содержит свои дополнительные объяснения и навигацию.
- Два повторявшихся общих абзаца с инструкциями убраны из каждого usage; их старые якоря сохранены.
- Dry-run и повторная проверка после применения прошли. Полные корпусные/HTTP проверки выполняет интеграционный агент.

Подробные счётчики по файлам: [english-verification.json](english-verification.json).

Независимый просмотр корейским редактором привёл к двум точным уточнениям нового материала: в уроке05 пример об артикле теперь использует прилагательное late в The late breakfast was delicious; в уроке15 условие проверки4 говорит о проверке страниц, в соответствии с check и ключом. В проверке13.3 прямо запрошен should, чтобы не исключать другие допустимые способы дать совет без основания. Все четыре затронутые физические заметки и авторские данные обновлены прямыми точечными правками, без повторного массового применения.

## Источники точечных грамматических правил

Официальные страницы проверены24октября2026. Они подтверждают конкретные правила, а не полноту курса; новые примеры, цены, персонажи и задания являются самостоятельными учебными конструкциями.

- [British Council: be и краткие ответы](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple-be)
- [British Council: stative verbs и разные значения](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/stative-verbs)
- [British Council: сравнение](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives)
- [Cambridge: притяжательные конструкции](https://dictionary.cambridge.org/us/grammar/british-grammar/possessive-s)
- [Cambridge: have/have got](https://dictionary.cambridge.org/grammar/british-grammar/have-got-)
- [Cambridge: hate, like, love, prefer](https://dictionary.cambridge.org/grammar/british-grammar/hate)
- [British Council: значения count/uncount](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/common-problems-count-uncount-nouns)
- [British Council: -ed/-ing](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/adjectives-ending-ed-ing)
- [Cambridge: across/through](https://dictionary.cambridge.org/grammar/british-grammar/across-over-or-through?q=through)
- [British Council: будущее](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/talking-about-future)
- [British Council: предлоги времени](https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar/prepositions-time)
- [British Council: Present Perfect](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect)
- [British Council: Present Simple](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple)
- [Cambridge: Past Continuous/Past Simple](https://dictionary.cambridge.org/uk/grammar/british-grammar/past-continuous-or-past-simple)
- [British Council: relative clauses](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/relative-pronouns-relative-clauses)
- [British Council: passives](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/passives)
- [British Council: permission/obligation](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation)
- [British Council: past habits](https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/past-habits-used-to-would-past-simple)
- [British Council: Perfect Simple/Continuous](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect-simple-continuous)
- [British Council: косвенные вопросы](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/reported-speech-questions)
- [Cambridge: if в вежливости и косвенных вопросах](https://dictionary.cambridge.org/grammar/british-grammar/conditions)

## Границы работы

Новый основной разбор и ответы предметно проверены. Старые длинные банки сохранены с точечными исправлениями и явным предупреждением: вся фонетика, все предметные утверждения и каждое старое предложение не прошли новой полной проверки. Уровни папок не означают экзаменационную полноту. Словари, диалоги, тесты, чтение, упражнения в других файлах, китайский, contents и приложение в этой подзадаче не редактировались. Нет аудио-проверки, коммита или push.

