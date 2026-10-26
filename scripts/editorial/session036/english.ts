import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../../../lib/knowledge";
import { lessons } from "./english-content";

const backup = process.env.GRAMMAR_BEFORE || "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/grammar-before-session036";
const previousReportPath = "reports/session036/english-verification.json";
const previousNotes = fs.existsSync(previousReportPath) ? JSON.parse(fs.readFileSync(previousReportPath, "utf8")).notes : [];
const previousHashes = new Map<string, string>(previousNotes.map((n: {slug: string; afterSha256?: string}) => [n.slug, n.afterSha256 || ""]));
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
const replacements: Record<string, [string, string][]> = {
  "1/core": [
    ["- SHE wants coffee (хочу пить — не КОФЕ, а ПЬЮ).", "- SHE wants coffee (кофе хочет ОНА, а не другой человек)."]
  ],
  "1/usage": [
    ["General questions in Present Simple require the auxiliary 'do/does'.", "Обычный вопрос с work в Present Simple требует do/does; с be, модальным глаголом и в нейтральном вопросе к подлежащему модели другие."],
    ["Age is always expressed with the verb 'to be'.", "В этой обычной модели сообщения возраста используется be."]
  ],
  "2/core": [
    ["В английском короткий ответ не может быть просто «yes» или «no» — обязательно повторяется местоимение и форма to be.", "Одиночные Yes и No возможны. В учебной модели краткого ответа с be добавляется местоимение и согласованная форма: Yes, I am. / No, she isn't. Уместность более короткого ответа зависит от контекста и интонации."],
    ["**its** (его/её для неодушевлённого) и **it's** (сокращение от it is = «это есть»)", "**its** (притяжательная форма it) и **it's** (сокращение it is или it has в соответствующей конструкции)"],
    ["Артикль **a/an** не используется с множественным числом и с абстрактными понятиями: **books**, **water**, **love**.", "Артикль **a/an** не используется с множественным числом и неисчисляемым значением: **books**, **water**, **love** в значении любви вообще. Абстрактность сама по себе не определяет исчисляемость: **an idea** правильно."],
    ["При названии профессий артикль обязателен:", "В обычной модели одной профессии с исчисляемым существительным нужен артикль:"],
    ["| an | при первом упоминании | This is an egg. | Это яйцо. |", "| a/an | при первом неопределённом упоминании; выбор по звуку | This is an egg. | Это яйцо. |"]
  ],
  "2/usage": [
    ["### Stative verbs NEVER used in Continuous", "### Stative verbs: выбирайте форму по значению"],
    ["Verbs of perception, cognition, and emotion (know, understand, believe, love, hate, want, need) describe states, not actions: 'I know this rule' (NOT I am knowing).", "В обычном значении состояния know, understand, believe, love, want и need обычно стоят в Simple: I know this rule — «Я знаю это правило». Это не запрет Continuous для всех значений каждого глагола: сравните think «считать» и think about «обдумывать». [British Council: значения stative verbs](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/stative-verbs)."]
  ],
  "3/core": [
    ["She + works + hard + always.", "She + always + works + hard."],
    ["| Времени | когда | always, never, often, sometimes, usually, today, tomorrow |", "| Времени | когда | today, tomorrow, yesterday |"]
  ],
  "3/usage": [
    ["Verbs of sense (look, smell, sound, taste, feel) take ADJECTIVES, not adverbs:", "В значении связки look, smell, sound, taste, feel допускают прилагательное, характеризующее подлежащее:"],
    ["In English 'feel myself' has a literal sexual connotation, and linking verbs take adjectives.", "Для состояния «мне плохо» используйте I feel bad/unwell. Не добавляйте myself по русской модели «чувствую себя». Значение feel myself зависит от контекста; сексуальная трактовка не является обязательной."],
    ["Never say 'more better' or 'more easier'. Use either '-er' or 'more', never both.", "В стандартном сравнении не соединяйте два показателя одной степени: better/easier, не more better/more easier. Усиление much better/much easier возможно."]
  ],
  "4/core": [
    ["- При выборе: *a young friendly man* (не *a friendly young man* — допустимы оба, порядок по возрасту/мнению варьируется).", "- Для обычного описания естественно *a friendly young man*: оценка обычно предшествует возрасту. Порядок может меняться с акцентом; не объявляйте этот пример ошибкой."],
    ["- Также можно **to + verb** после like/love/prefer (менее часто).", "- После like/love/prefer также возможен **to + verb**; частотность и акцент зависят от глагола, контекста и варианта английского."]
  ],
  "4/usage": [
    ["### Have got (British/conversational) vs Have (American/formal)", "### Have got и have: разговорная и нейтральная модели"],
    ["### Saxon Genitive ('s) for people/animals vs 'of' for inanimate things", "### Притяжательность: 's и of — выбор сочетания"],
    ["'John's car', 'The cat's tail', BUT 'The roof of the house' (NOT the house's roof).", "John's car — «машина Джона»; the roof of the house — «крыша дома». Для частей предмета часто выбирают of или сочетание существительных, но запрета 's для всех неодушевлённых нет: the company's name — «название компании». [Cambridge: притяжательность](https://dictionary.cambridge.org/us/grammar/british-grammar/possessive-s)."],
    ["'Have you got a pen?' = 'Do you have a pen?' In the past, only 'had' is used ('I had a dog', never 'I had got').", "Have you got a pen? и Do you have a pen? — «У вас есть ручка?» Have got разговорнее; have употребляется и в британском, и в американском английском. Для обычного прошлого обладания используйте I had a dog — «У меня была собака». Это не запрет последовательности had got в других конструкциях и значениях get. [Cambridge: have got / have](https://dictionary.cambridge.org/grammar/british-grammar/have-got-)."],
    ["After like, love, enjoy, hate, prefer, use the -ing form for general preference: 'I enjoy swimming' (NOT I enjoy to swim).", "После enjoy + глагол нужна -ing-форма: I enjoy swimming. После like/love/hate/prefer возможны также to-инфинитивы. Не обобщайте ограничение enjoy на все эти глаголы. [Cambridge: hate/like/love/prefer](https://dictionary.cambridge.org/grammar/british-grammar/hate)."],
    ["- ❌ The table's leg\n  ✅ The leg of the table — Inanimate objects typically use 'of'.", "- Для обычного названия детали: **the leg of the table / a table leg** — «ножка стола». Это предпочтительные сочетания, а не доказательство запрета притяжательного 's у любого неодушевлённого существительного."]
  ],
  "5/core": [
    ["- Не имеют формы множественного числа: water (NOT waters)", "- В данном неисчисляемом значении не образуют обычное множественное: water. В других значениях возможны формы вроде waters (воды/водные пространства), поэтому проверяйте значение."],
    ["- **some** — в утверждении; **any** — в вопросе и отрицании.", "- В нейтральном сообщении наличия обычно **some**, в вопросе о наличии/отрицании — **any**. Предложения и просьбы могут содержать some: Would you like some tea?"],
    ["**Важно:** после How much/How many и What/Where ставится вспомогательный глагол do/does: *What do you like? Where does she eat?*", "**Важно:** с обычным глаголом в вопросе к дополнению/обстоятельству Present Simple нужны do/does: *What do you like? Where does she eat?* Но *How much is it? How many people are here? Who cooks?* строятся иначе."]
  ],
  "5/usage": [
    ["Advice, information, news, furniture, luggage, bread, progress, money are strictly UNCOUNTABLE:", "В обычных значениях advice, information, news, furniture, luggage, bread, progress и money употребляются как неисчисляемые; специальные значения проверяйте отдельно:"],
    ["But use an article if there's an adjective: 'We had a delicious breakfast'.", "В описании отдельного приёма пищи возможен a/an: We had a delicious breakfast. Само наличие любого определения не даёт универсального правила выбора артикля; конкретный завтрак может иметь the."]
  ],
  "6/usage": [
    ["Weather statements require 'It' as subject: 'It is raining' (NOT Rain goes), 'It is windy' (NOT There is wind).", "Модели It is raining и It is windy используют формальное it. Но The wind is blowing имеет собственное подлежащее. There is wind может сообщать о наличии ветра; его нельзя объявлять грамматически невозможным."]
  ],
  "7/usage": [
    ["- ❌ I am in the bus\n  ✅ I am on the bus", "- Для обычной поездки: I am on the bus; при описании внутреннего пространства возможно in the bus. Прежний учебный вариант I am on the bus"],
    ["'On the bus / train / plane' (you can stand up/walk). 'In the car / taxi' (you must sit inside).", "Для обычной поездки: on the bus/train/plane, in a car/taxi. Возможность встать — ненадёжное объяснение: это устойчивые языковые сочетания, а не правило устройства транспорта."],
    ["'On the bus / train / plane' (you can stand up/walk). 'In the car / taxi' (you must sit inside).", ""],
    ["✅ I am on the bus — Public transport takes 'on'.", "✅ I am on the bus — Для обычного сообщения о поездке естественно on the bus. In the bus возможно при специальном описании внутреннего пространства, поэтому это не безусловно запрещённая последовательность."]
  ],
  "8/usage": [
    ["'The train leaves at 7:00 tomorrow morning' — Use Present Simple, not Future, for timetables and official schedules.", "The train leaves at 7:00 tomorrow morning представляет будущее как расписание. Present Simple — обычный выбор такого сообщения; другие формы возможны при другом акценте, например прогнозе или обещании."],
    ["Days of the week always take 'on'.", "В этом временном сочетании нужен on Monday. Но next Monday не имеет on, а в разговоре сам on перед днём иногда опускается."]
  ],
  "9/usage": [
    ["Did you mention WHEN it happened? If YES (yesterday, in 2021, two days ago, when I was a child) -> strictly PAST SIMPLE. If NO (life experience, connection to now, ever, never, already, yet) -> PRESENT PERFECT.", "Завершённая прошлая рамка обычно ведёт к Past Simple; опыт/результат, рассматриваемый из настоящего, — к Present Perfect. Отсутствие даты не требует Perfect: I dropped the card and picked it up — цепочка прошлых событий. Незавершённый период также может быть назван: I have read two pages today. [British Council: Present Perfect](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect)."]
  ],
  "11/core": [
    ["Yes, I have. / No, I've never.", "Yes, I have. / No, I haven't."]
  ],
  "11/usage": [
    ["The long action is Continuous, the sudden discovery is Simple.", "В этой картине поиск/ходьба уже идёт, а находка представлена событием. Дело не в измеренной длине действия: Past Simple также может обозначать долгое завершённое действие."],
    ["'Know' is stative and cannot take Continuous.", "Know в обычном значении знания здесь описывает состояние, поэтому нейтрально I knew. Не выбирайте время только по внешнему глагольному слову или союзу."],
    ["'While' is typically paired with Continuous: 'While I was cooking...'. 'When' is typically paired with Simple: '...when the phone rang.'", "While I was cooking и when the phone rang — частые модели процесса и события. Но when/while не являются обязательными переключателями времени; сначала определите временную картину."]
  ],
  "13/usage": [
    ["'I must call my mother' (my own desire/duty). 'I have to wear a uniform at work' (company rules require it).", "I must call my mother может подчёркивать личную необходимость, а I have to wear a uniform at work — внешнее правило. Это тенденция, а не жёсткое разделение: Visitors must sign in также сообщает правило учреждения."],
    ["'You should change your password regularly' (Best practice/friendly recommendation).", "You should save your work before leaving — «Вам стоит сохранить работу перед уходом». Это учебный пример совета; грамматическая форма не подтверждает технические рекомендации о паролях."],
    ["'Must' has no past tense form; 'had to' must be used.", "Для конкретной прошлой обязанности в этом сообщении нужна форма had to. У must бывают другие значения; это пояснение относится к обязанности в прошлом."]
  ],
  "14/usage": [
    ["### Would + infinitive: ONLY repeated past actions (NOT states)", "### Would для повторявшихся действий в прошлом"],
    ["- ❌ I used to live here for 5 years\n  ✅ I lived here for 5 years", "- Завершённый период: I lived here for 5 years"],
    ["For a specific duration of time in the past, use regular Past Simple, not 'used to'.", "Если нужно сообщить завершённый пятилетний период, нейтрально I lived here for five years. Сама длительность не является универсальным запретом used to в любом контексте; выбор зависит от смысла прежнего состояния/привычки."],
    ["'Would' cannot be used with stative verbs like 'have', 'be', 'know'.", "Would в значении прошлой привычки обычно не описывает прежние постоянные состояния. Для «раньше у меня были длинные волосы» естественно used to have. Другие значения would рассматриваются отдельно."]
  ],
  "15/usage": [
    ["In Russian present tense is used with 'уже 2 года', but in English an action starting in the past requires Perfect Continuous.", "Для продолжающейся работы до настоящего возможны I have been working here for two years и I have worked here for two years. Состояния вроде know обычно имеют Perfect Simple. Начало в прошлом не требует Continuous автоматически."],
    ["Never put 'will' or 'would' inside the 'if'-clause!", "В обычной модели будущего условия после if используют Present Simple. Это не запрет will/would после if во всех значениях: if может вводить косвенный вопрос или вежливую просьбу."],
    ["In conditional time clauses, 'will' is forbidden after 'if' / 'when'.", "В этом обычном будущем условии после if нужен Present Simple. Не переносите правило на if со значением «ли» в косвенном вопросе: I wonder if it will rain."]
  ]
};

const boilerplate = [
"Прочитайте пример, закройте его и объясните своими словами, почему выбрана именно эта форма. Затем измените одного участника или обстоятельство и проверьте, что ещё должно измениться.",
"### Перенос в свою речь\n\nСоставьте два собственных примера на эту модель. Для каждого укажите ситуацию, участников и смысл выбранной формы. Проверьте не только окончание, но и порядок слов. Не считайте повторение примера по памяти самостоятельным решением."
];
const ids = (body: string, slug: string) => {
  const $ = load(renderMarkdown(matter(body).content, slug).html);
  return $("[id]").map((_, e) => $(e).attr("id")!).get();
};
const internal = (body: string, slug: string) => {
  const $ = load(renderMarkdown(matter(body).content, slug).html);
  return $("a[href]").map((_, e) => $(e).attr("href")!).get()
    .filter(h => h.startsWith("/doc/") || h.startsWith("#")).sort();
};
const escape = (s: string) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
const plans: {slug: string; before: string; after: string; oldIds: number; aliases: number; corrections: number}[] = [];
for (const mirror of ["", "knowledge/"]) for (const lesson of lessons) for (const kind of ["core", "usage"] as const) {
  const level = lesson.unit <= 5 ? "a1" : lesson.unit <= 10 ? "a2" : "b1";
  const slug = mirror + "languages/english/" + level + "/unit-" + String(lesson.unit).padStart(2, "0") + "/grammar/" + kind;
  const source = path.join(backup, slug + ".md");
  assert(fs.existsSync(source), "Missing before-image: " + slug);
  const before = fs.readFileSync(source, "utf8");
  let retained = before.replaceAll("\r\n", "\n");
  let corrections = 0;
  for (const [find, replace] of replacements[lesson.unit + "/" + kind] || []) {
    if (retained.includes(find)) { retained = retained.replaceAll(find, replace); corrections++; }
  }
  const title = /^# .+\n/m.exec(retained);
  assert(title && title.index !== undefined, "Missing title: " + slug);
  const prefix = retained.slice(0, title.index + title[0].length);
  let bank = retained.slice(prefix.length).trim();
  if (kind === "usage") for (const text of boilerplate) bank = bank.replaceAll(text, "");
  let after = prefix + "\n" + lesson[kind] + "\n\n";
  if (kind === "core") {
    after += "## Сохранённые справочные материалы\n\n> Учебный разбор выше обновлён. Ниже сохранены прежние таблицы и расширенные темы; исправлены отмеченные в отчёте конкретные ошибки. Весь старый банк, включая фонетические и предметные примеры, не прошёл полной повторной проверки. Название уровня не подтверждает экзаменационного покрытия.\n\n" + bank + "\n";
  } else {
    after += "### Опора для проверки правила\n\n[Официальный грамматический справочник](" + lesson.source + "). Примеры, ситуации и задания составлены для этой библиотеки.\n\n";
    after += "<details>\n<summary>Сохранённые примеры и дополнительные пояснения прежней версии</summary>\n\n> Этот дополнительный банк сохранён отдельно от нового разбора; он не объявляется полностью проверенным. Исправления конкретных неточностей перечислены в отчёте Session036.\n\n" + bank + "\n\n</details>\n";
  }
  const oldIds = ids(before, slug);
  const afterIds = new Set(ids(after, slug));
  const missing = oldIds.filter(id => !afterIds.has(id));
  if (missing.length) after += "\n<!-- Retained heading aliases for incoming links. -->\n" + missing.map(id => '<span id="' + escape(id) + '"></span>').join("\n") + "\n";
  const currentIds = ids(after, slug);
  assert.equal(new Set(currentIds).size, currentIds.length, "Duplicate IDs: " + slug);
  for (const id of oldIds) assert(currentIds.includes(id), "Lost ID: " + slug + "#" + id);
  const links = internal(after, slug);
  for (const href of internal(before, slug)) assert(links.includes(href), "Lost link: " + slug + " -> " + href);
  assert.equal((after.match(/<details>/g) || []).length, (after.match(/<\/details>/g) || []).length, "Details imbalance " + slug);
  assert(!/<details\s+open/.test(after), "Open solutions: " + slug);
  plans.push({slug, before, after, oldIds:oldIds.length, aliases:missing.length, corrections});
}
assert.equal(plans.length, 60);
for (const plan of plans) {
  const target = path.join("knowledge", plan.slug + ".md");
  const current = fs.readFileSync(target, "utf8");
  assert(current === plan.before || current === plan.after || digest(current) === previousHashes.get(plan.slug), "Current note differs from baseline/planned result: " + target);
}
if (process.argv.includes("--apply")) for (const plan of plans) fs.writeFileSync(path.join("knowledge", plan.slug + ".md"), plan.after, "utf8");
console.log(JSON.stringify({
  mode: process.argv.includes("--apply") ? "applied" : "dry-run",
  files:plans.length,
  oldIds:plans.reduce((n,p)=>n+p.oldIds,0),
  aliases:plans.reduce((n,p)=>n+p.aliases,0),
  correctionOccurrences:plans.reduce((n,p)=>n+p.corrections,0),
  notes:plans.map(({before,after,...stats})=>({...stats,beforeBytes:Buffer.byteLength(before),afterBytes:Buffer.byteLength(after),afterSha256:digest(after)}))
},null,2));

