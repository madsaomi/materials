import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../lib/knowledge";
interface Unit {
  n: string;
  title: string;
  text: string;
  translation: string;
  words: [string, string][];
  questions: string[];
  answers: string[];
  tasks: string[];
  solutions: string[];
  focus: string;
  source: string;
}
const units: Unit[] = [
  {
    n: "01",
    title: "Знакомство в учебной группе",
    text: "Hello. My name is Eva. I am twenty years old. I am from Tashkent. I am a student. My friend Ben is from London. He is an art teacher. We are in the same English class. We are not at work now. We are in a classroom.",
    translation:
      "Здравствуйте. Меня зовут Ева. Мне двадцать лет. Я из Ташкента. Я студентка. Мой друг Бен из Лондона. Он преподаватель изобразительного искусства. Мы в одной группе английского языка. Сейчас мы не на работе. Мы в учебном классе.",
    words: [
      ["twenty years old", "двадцать лет"],
      ["art teacher", "преподаватель изобразительного искусства"],
      ["the same class", "одна и та же группа"],
      ["at work", "на работе"],
      ["classroom", "учебный класс"],
    ],
    questions: [
      "Where is Eva from?",
      "What is Ben’s job?",
      "Are Eva and Ben at work now?",
    ],
    answers: [
      "Eva is from Tashkent. Это прямо сказано в тексте.",
      "He is an art teacher. Называем указанную профессию, не делая выводов о других занятиях Бена.",
      "No, they are not. / No, they aren’t. They are in a classroom. Не добавляйте do к вопросу с are.",
    ],
    tasks: [
      "Вставьте только am/is/are: I ___ a student. Ben ___ an art teacher. We ___ in a classroom.",
      "Преобразуйте Eva is from Tashkent в вопрос да/нет, затем дайте утвердительный краткий ответ с she.",
      "Сохраните указанный смысл: «Бен не на работе сейчас». Постройте отрицательное предложение с Ben, be, at work, now.",
    ],
    solutions: [
      "I am a student. Ben is an art teacher. We are in a classroom. Форма зависит от подлежащего.",
      "Is Eva from Tashkent? — Yes, she is. В вопросе is стоит перед Eva; в утвердительном кратком ответе is не сокращается.",
      "Ben is not at work now. / Ben isn’t at work now. Not ставится после is, does не нужен.",
    ],
    focus:
      "Форма be согласуется с подлежащим. Из текста извлекаем только сообщённые сведения; отсутствие информации не означает отрицательный факт.",
    source:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple-be",
  },
  {
    n: "02",
    title: "Рабочий день и привычки",
    text: "Mila works in a bookshop. On workdays, she opens the shop at nine. She reads the list of orders and makes tea. At one o’clock, she has lunch with her friend Lucy. She does not work on Sundays. On Sundays, she walks in the park and reads at home. Her brother Max works at a school. He does not work in the bookshop.",
    translation:
      "Мила работает в книжном магазине. В рабочие дни она открывает магазин в девять. Она читает список заказов и заваривает чай. В час она обедает с подругой Люси. По воскресеньям она не работает. По воскресеньям она гуляет в парке и читает дома. Её брат Макс работает в школе. Он не работает в книжном магазине.",
    words: [
      ["bookshop", "книжный магазин"],
      ["opens", "открывает"],
      ["orders", "заказы"],
      ["has lunch", "обедает"],
      ["on Sundays", "по воскресеньям"],
    ],
    questions: [
      "What time does Mila open the shop?",
      "Does she work on Sundays?",
      "Does Max work in the same place as Mila?",
    ],
    answers: [
      "She opens the shop at nine. Nine относится ко времени открытия.",
      "No, she doesn’t. В тексте это повторяющаяся привычка, а не только одно воскресенье.",
      "No. Mila works in a bookshop; Max works at a school. Место работы указано для каждого отдельно.",
    ],
    tasks: [
      "Выберите форму для регулярного действия: Mila (open / opens) the shop at nine. Max (work / works) at a school.",
      "Сделайте вопрос и отрицание из She works on Sundays. Используйте does/doesn’t.",
      "Исправьте два предложения: Does Mila opens the shop? Max doesn’t works here.",
    ],
    solutions: [
      "Mila opens the shop at nine. Max works at a school. Для третьего лица единственного числа в утверждении нужен -s.",
      "Does she work on Sundays? She doesn’t work on Sundays. После does/doesn’t используется базовая форма work.",
      "Does Mila open the shop? Max doesn’t work here. Показатель третьего лица уже есть в does.",
    ],
    focus:
      "В утверждении he/she/it получает -s/-es. В вопросе и отрицании после does/doesn’t глагол остаётся в базовой форме.",
    source:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple?page=1",
  },
  {
    n: "03",
    title: "Сравнение вещей: цена и мнение",
    text: "There are two bags in the shop. The red bag is old and cheap. It costs ten pounds. The blue bag is new and costs twenty pounds. The blue bag is more expensive than the red bag. Tom likes the red bag because it is small. Anna likes the blue bag because it is big. They like different things. The text gives no information about the quality of the bags.",
    translation:
      "В магазине две сумки. Красная сумка старая и дешёвая. Она стоит десять фунтов. Синяя сумка новая и стоит двадцать фунтов. Синяя сумка дороже красной. Тому нравится красная сумка, потому что она маленькая. Анне нравится синяя сумка, потому что она большая. Им нравятся разные вещи. В тексте нет информации о качестве сумок.",
    words: [
      ["cheap", "дешёвый"],
      ["costs", "стоит"],
      ["more expensive than", "дороже, чем"],
      ["because", "потому что"],
      ["quality", "качество"],
    ],
    questions: [
      "Which bag is more expensive?",
      "Why does Tom like the red bag?",
      "Does the text prove that the blue bag is better quality?",
    ],
    answers: [
      "The blue bag. Она стоит двадцать фунтов, красная — десять.",
      "Because it is small. Это предпочтение Тома, а не общее правило о хороших сумках.",
      "No. The text gives no information about quality. Цена и новизна сами по себе не доказывают качество.",
    ],
    tasks: [
      "Заполните: The blue bag is ___ (expensive) than the red bag. Используйте сравнительную степень.",
      "Заполните: Anna is ___ (happy) today than yesterday. Не используйте more.",
      "Выберите: Tom is (careful / carefully). He chooses his bag (careful / carefully).",
    ],
    solutions: [
      "more expensive. У этого прилагательного сравнительная форма строится через more.",
      "happier. В happy перед -er y меняется на i; два слога не означают обязательное more.",
      "Tom is careful. He chooses his bag carefully. Прилагательное описывает Тома, наречие — способ выбора.",
    ],
    focus:
      "Сравнение должно иметь понятную точку отсчёта. Не превращайте мнение героя или цену в недоказанный общий вывод.",
    source:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives",
  },
  {
    n: "04",
    title: "Члены семьи и владельцы вещей",
    text: "My name is Leo. I have a sister. Her name is Mia. We live with our father. He has a small car. Mia has a green bike. Her bike is in the garden. My bike is blue. It is in the garage. We like cycling, but our father prefers walking. On Saturdays, we go to the park together.",
    translation:
      "Меня зовут Лео. У меня есть сестра. Её зовут Мия. Мы живём с нашим отцом. У него небольшая машина. У Мии зелёный велосипед. Её велосипед в саду. Мой велосипед синий. Он в гараже. Мы любим кататься на велосипеде, но наш отец предпочитает ходить пешком. По субботам мы вместе идём в парк.",
    words: [
      ["her bike", "её велосипед"],
      ["our father", "наш отец"],
      ["garden", "сад"],
      ["garage", "гараж"],
      ["prefers walking", "предпочитает ходить пешком"],
    ],
    questions: [
      "What colour is Mia’s bike?",
      "Where is Leo’s bike?",
      "Does their father prefer cycling?",
    ],
    answers: [
      "It is green. Her относится к Мии.",
      "It is in the garage. Не перепутайте с велосипедом Мии в саду.",
      "No, he doesn’t. He prefers walking. В кратком ответе повторяется вспомогательный глагол does.",
    ],
    tasks: [
      "Вставьте have/has: Leo ___ a sister. Mia ___ a bike. They ___ two bikes.",
      "Сделайте вопрос из Mia has a bike. Используйте does, затем дайте краткий ответ по тексту.",
      "Выберите владельца: Mia’s bike is green. (Her / His) bike is in the garden. Leo and Mia live with (their / our) father — здесь о них рассказывает другой человек.",
    ],
    solutions: [
      "Leo has a sister. Mia has a bike. They have two bikes. Has используется с третьим лицом единственного числа.",
      "Does Mia have a bike? — Yes, she does. Это совпадает с текстом; после does используется have.",
      "Her; their. Her отсылает к Мии, their — к Лео и Мии с точки зрения другого рассказчика.",
    ],
    focus:
      "Отличайте форму has в утверждении от have после does. При выборе my/your/her/their учитывайте владельца и то, кто говорит.",
    source:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/possessives-adjectives",
  },
  {
    n: "05",
    title: "Список покупок и количество",
    text: "Ben is in a small shop. He has a list. He needs two apples and a loaf of bread. He also wants some milk. There is no milk in the shop today, so he buys two bottles of water. He does not need any rice. At home, he checks the list again. The apples, bread and water are in his bag, but the milk is not.",
    translation:
      "Бен в небольшом магазине. У него есть список. Ему нужны два яблока и буханка хлеба. Он также хочет молока. Сегодня в магазине нет молока, поэтому он покупает две бутылки воды. Рис ему не нужен. Дома он снова проверяет список. Яблоки, хлеб и вода у него в сумке, а молока нет.",
    words: [
      ["a loaf of bread", "буханка хлеба"],
      ["some milk", "немного молока / молоко"],
      ["two bottles of water", "две бутылки воды"],
      ["any rice", "рис в отрицательном предложении"],
      ["checks", "проверяет"],
    ],
    questions: [
      "How many apples does Ben need?",
      "Does he buy milk? Why or why not?",
      "How much water does he buy, according to the text?",
    ],
    answers: [
      "Two apples. Apple — исчисляемое существительное.",
      "No. There is no milk in the shop today. Желание купить не означает совершённую покупку.",
      "Two bottles of water. Считаются бутылки, а water в этом значении неисчисляемо; объём каждой бутылки не указан.",
    ],
    tasks: [
      "Выберите: two (apple / apples), some (bread / breads), two (bottle / bottles) of water. Обычные продукты, без значений «разные сорта».",
      "Заполните вопросами о количестве: How (many / much) apples? How (many / much) water?",
      "Вставьте some/any в нейтральном сообщении, не в предложении угощения: I have ___ bread. I don’t have ___ rice.",
    ],
    solutions: [
      "two apples; some bread; two bottles of water. Число меняет apples и bottles; вещество bread в этом значении не получает множественное число.",
      "How many apples? How much water? Many с исчисляемым множественным, much с неисчисляемым.",
      "I have some bread. I don’t have any rice. Это базовая модель утверждения и отрицания; не универсальное правило для всех значений some/any.",
    ],
    focus:
      "Считайте предметы или единицы измерения. Важно отличать потребность, наличие в магазине и то, что действительно куплено.",
    source:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/common-problems-count-uncount-nouns",
  },
];
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Absolute external backup required");
if (fs.existsSync(path.join(backup, "manifest.json")))
  throw new Error("Already applied");
const changes: { slug: string; kind: string }[] = [];
function write(slug: string, body: string, kind: string) {
  const file = path.join("knowledge", slug + ".md");
  const raw = fs.readFileSync(file, "utf8"),
    p = matter(raw);
  const old = load(renderMarkdown(p.content, slug).html),
    now = load(renderMarkdown(body, slug).html);
  const ids = new Set(
    now("[id]")
      .map((_, e) => now(e).attr("id"))
      .get(),
  );
  const lost = old("[id]")
    .map((_, e) => old(e).attr("id")!)
    .get()
    .filter((id) => !ids.has(id));
  if (lost.length)
    body +=
      "\n\n" +
      lost
        .map(
          (id) =>
            `<span id="${id.replaceAll('"', "&quot;")}" aria-hidden="true"></span>`,
        )
        .join("\n");
  const b = path.join(backup, slug + ".md");
  fs.mkdirSync(path.dirname(b), { recursive: true });
  if (!fs.existsSync(b)) fs.writeFileSync(b, raw);
  fs.writeFileSync(
    file,
    matter.stringify(body, { ...p.data, language_revision: "2026-10-18" }),
  );
  changes.push({ slug, kind });
}
for (const unit of units)
  for (const prefix of ["", "knowledge/"]) {
    const base = prefix + `languages/english/a1/unit-${unit.n}`;
    for (const type of ["reading", "practice/exercises"]) {
      const slug = base + "/" + type;
      const old = matter(
        fs.readFileSync(path.join("knowledge", slug + ".md"), "utf8"),
      ).content;
      let body = "";
      if (type === "reading") {
        body = `# Английский · Урок ${unit.n} — чтение: ${unit.title}${prefix ? " · дополнительная версия" : ""}\n\n## Перед чтением\n\nЭто короткая учебная история. Сначала найдите участников и основную ситуацию без перевода. Затем отвечайте по сведениям текста: если данных нет, так и укажите.\n\n## Текст для первого чтения\n\n${unit.text}\n\n## Вопросы без подсказки\n\n${unit.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n## Полезные выражения\n\n| Выражение | Значение в тексте |\n|---|---|\n${unit.words.map(([a, b]) => `| ${a} | ${b} |`).join("\n")}\n\n## Проверка понимания\n\n<details>\n<summary>Открыть ответы и объяснения</summary>\n\n${unit.answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n</details>\n\n<details>\n<summary>Сравнить свой пересказ с переводом</summary>\n\n${unit.translation}\n\n</details>\n\n## Разбор и перенос\n\n${unit.focus}\n\nЗакройте текст и перескажите его тремя короткими фразами. Потом измените имя, место или количество и проверьте, какие формы должны измениться.\n\n[Практика](practice/exercises.md) · [Грамматика](grammar/core.md) · [Обзор](overview.md)\n\n## Дополнительное чтение исходной версии\n\nЭто расширенный материал, местами сложнее учебного ядра. Старые вопросы и ключи сохранены; не каждый прежний пример прошёл предметную сверку в этой редакции.\n\n<details>\n<summary>Открыть дополнительные тексты, словари и задания</summary>\n\n${old.replace(/^# .+\r?\n/, "").trim()}\n\n</details>\n`;
      } else {
        body = `# Английский · Урок ${unit.n} — самостоятельная практика: ${unit.title}${prefix ? " · дополнительная версия" : ""}\n\n## Цель и порядок работы\n\n${unit.focus}\n\nСначала прочитайте [короткую историю](../reading.md), затем выполните три задания ниже письменно. Для каждого ответа поясните выбор формы; ключ открывайте после своей попытки.\n\n## Три задания в контексте\n\n${unit.tasks.map((q, i) => `### Задание ${i + 1}\n\n${q}`).join("\n\n")}\n\n## Объяснённый ключ\n\n<details>\n<summary>Проверить три задания</summary>\n\n${unit.solutions.map((a, i) => `**Задание ${i + 1}.** ${a}`).join("\n\n")}\n\n</details>\n\n## Примените самостоятельно\n\nСоставьте два новых предложения о себе или вымышленном персонаже. Для каждого выберите вопрос или отрицание. Если вводите новые факты, не выдавайте их за содержание учебного текста.\n\n## Сохранённые упражнения исходной версии\n\nДополнительный банк включает готовые образцы и задания разной сложности. Его наличие не означает независимой проверки всех старых ключей.\n\n<details>\n<summary>Открыть прежние упражнения и решения</summary>\n\n${old.replace(/^# .+\r?\n/, "").trim()}\n\n</details>\n\n[Вернуться к чтению](../reading.md) · [Грамматика](../grammar/core.md) · [Обзор](../overview.md)\n\n## Сверка грамматики\n\n[British Council: соответствующая модель](${unit.source}). История и задания написаны для этой библиотеки.\n`;
      }
      write(slug, body, type);
    }
  }
fs.writeFileSync(
  path.join(backup, "manifest.json"),
  JSON.stringify({ language: "english", changes }, null, 2),
);
console.log(`English: ${changes.length} notes updated.`);
