import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../lib/knowledge";
import { units } from "./english-content-session030";
const extraSources: Record<string,string> = {
  "10": "[Cambridge: произношение окончания](https://assets.cambridge.org/97805217/12217/excerpt/9780521712217_excerpt.pdf). [Cambridge: вопросы](https://dictionary.cambridge.org/grammar/british-grammar/questions-wh-questions). [Cambridge: must](https://dictionary.cambridge.org/grammar/british-grammar/must).",
  "06": "[British Council: Present Simple](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple). [Cambridge: позиция наречия](https://dictionary.cambridge.org/grammar/british-grammar/adverbs-and-adverb-phrases-position).",
  "07": "[Cambridge: across, over or through](https://dictionary.cambridge.org/grammar/british-grammar/across-over-or-through).",
  "08": "[British Council: время и даты](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/when-time-dates). [British Council: способы говорить о будущем](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/talking-about-future).",
  "09": "[Cambridge: позиция наречия](https://dictionary.cambridge.org/grammar/british-grammar/adverbs-and-adverb-phrases-position)."
};
import { fixCore030, fixReading030, fixPractice030 } from "./english-fixes-session030";
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
for (const unit of units) for (const prefix of ["", "knowledge/"]) {
 const base = prefix + "languages/english/a2/unit-" + unit.n;
 fixCore030(unit.n, matter(fs.readFileSync(path.join("knowledge", base + "/grammar/core.md"), "utf8")).content);
 fixReading030(unit.n, matter(fs.readFileSync(path.join("knowledge", base + "/reading.md"), "utf8")).content);
 fixPractice030(unit.n, matter(fs.readFileSync(path.join("knowledge", base + "/practice/exercises.md"), "utf8")).content);
}
for (const unit of units)
  for (const prefix of ["", "knowledge/"]) {
    const base = prefix + `languages/english/a2/unit-${unit.n}`;
    for (const type of ["reading", "practice/exercises"]) {
      const slug = base + "/" + type;
      let old = matter(
        fs.readFileSync(path.join("knowledge", slug + ".md"), "utf8"),
      ).content;
      old = type === "reading" ? fixReading030(unit.n, old) : fixPractice030(unit.n, old);
      let body = "";
      if (type === "reading") {
        body = `# Английский · Урок ${unit.n} — чтение: ${unit.title}${prefix ? " · дополнительная версия" : ""}\n\n## Перед чтением\n\nЭто короткая учебная история. Сначала найдите участников и основную ситуацию без перевода. Затем отвечайте по сведениям текста: если данных нет, так и укажите.\n\n## Текст для первого чтения\n\n${unit.text}\n\n## Вопросы без подсказки\n\n${unit.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n## Полезные выражения\n\n| Выражение | Значение в тексте |\n|---|---|\n${unit.words.map(([a, b]) => `| ${a} | ${b} |`).join("\n")}\n\n## Проверка понимания\n\n<details>\n<summary>Открыть ответы и объяснения</summary>\n\n${unit.answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n</details>\n\n<details>\n<summary>Сравнить свой пересказ с переводом</summary>\n\n${unit.translation}\n\n</details>\n\n## Разбор и перенос\n\n${unit.focus}\n\nЗакройте текст и перескажите его тремя короткими фразами. Потом измените имя, место или количество и проверьте, какие формы должны измениться.\n\n[Практика](practice/exercises.md) · [Грамматика](grammar/core.md) · [Обзор](overview.md)\n\n## Дополнительное чтение исходной версии\n\nЭто расширенный материал, местами сложнее учебного ядра. Старые вопросы и ключи сохранены; не каждый прежний пример прошёл предметную сверку в этой редакции.\n\n<details>\n<summary>Открыть дополнительные тексты, словари и задания</summary>\n\n${old.replace(/^# .+\r?\n/, "").trim()}\n\n</details>\n`;
      } else {
        body = `# Английский · Урок ${unit.n} — самостоятельная практика: ${unit.title}${prefix ? " · дополнительная версия" : ""}\n\n## Цель и порядок работы\n\n${unit.focus}\n\nСначала прочитайте [короткую историю](../reading.md), затем выполните три задания ниже письменно. Для каждого ответа поясните выбор формы; ключ открывайте после своей попытки.\n\n## Три задания в контексте\n\n${unit.tasks.map((q, i) => `### Задание ${i + 1}\n\n${q}`).join("\n\n")}\n\n## Объяснённый ключ\n\n<details>\n<summary>Проверить три задания</summary>\n\n${unit.solutions.map((a, i) => `**Задание ${i + 1}.** ${a}`).join("\n\n")}\n\n</details>\n\n## Примените самостоятельно\n\nСоставьте два новых предложения о себе или вымышленном персонаже. Для каждого выберите вопрос или отрицание. Если вводите новые факты, не выдавайте их за содержание учебного текста.\n\n## Сохранённые упражнения исходной версии\n\nДополнительный банк включает готовые образцы и задания разной сложности. Его наличие не означает независимой проверки всех старых ключей.\n\n<details>\n<summary>Открыть прежние упражнения и решения</summary>\n\n${old.replace(/^# .+\r?\n/, "").trim()}\n\n</details>\n\n[Вернуться к чтению](../reading.md) · [Грамматика](../grammar/core.md) · [Обзор](../overview.md)\n\n## Сверка грамматики\n\n[British Council: соответствующая модель](${unit.source}). История и задания написаны для этой библиотеки.\n`;
      }
      write(slug, body, type);
    }
  }
for (const unit of units) for (const prefix of ["", "knowledge/"]) {
 const slug = prefix + "languages/english/a2/unit-" + unit.n + "/grammar/core";
 const original = matter(fs.readFileSync(path.join("knowledge", slug + ".md"), "utf8")).content;
 const corrected = fixCore030(unit.n, original).replace(/^# .+\r?\n/, "").trim();
 const body = "# Английский · Урок " + unit.n + " — грамматика: " + unit.title + "\n\n## Учебное ядро урока\n\n" + unit.core + "\n\n[Короткое чтение](../reading.md) · [Самостоятельная практика](../practice/exercises.md)\n\n## Подробные справочные разделы\n\nДополнительные темы можно проходить после основного чтения и практики. Метка папки не является подтверждением экзаменационного покрытия.\n\n" + corrected + "\n\n## Опоры для проверки модели\n\n[Основное правило](" + unit.source + "). " + extraSources[unit.n] + "\n";
 write(slug, body, "grammar/core");
}
fs.writeFileSync(
  path.join(backup, "manifest.json"),
  JSON.stringify({ language: "english", changes }, null, 2),
);
console.log(`English: ${changes.length} notes updated.`);
