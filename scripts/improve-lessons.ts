import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { getDocs, renderMarkdown } from "../lib/knowledge";
import { lessons } from "./lesson-content";

// One-time editorial batch; backups live outside the knowledge tree.
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Pass an absolute external backup directory.");
const root = path.resolve("knowledge");
if (path.resolve(backup).startsWith(root + path.sep))
  throw new Error("Backup must be outside knowledge.");
if (fs.existsSync(path.join(backup, "manifest.json")))
  throw new Error(
    "Batch already applied; inspect existing report before continuing.",
  );
const docs = getDocs();
const changed: { slug: string; kind: string }[] = [];
function write(slug: string, body: string, kind: string) {
  const file = path.join(root, slug + ".md");
  const old = fs.readFileSync(file, "utf8");
  const parsed = matter(old);
  const before = load(renderMarkdown(parsed.content, slug).html);
  const after = load(renderMarkdown(body, slug).html);
  const ids = new Set(
    after("[id]")
      .map((_, e) => after(e).attr("id")!)
      .get(),
  );
  const missing = before("[id]")
    .map((_, e) => before(e).attr("id")!)
    .get()
    .filter((id) => !ids.has(id));
  if (missing.length)
    body +=
      "\n\n" +
      missing
        .map(
          (id) =>
            `<span id="${id.replaceAll('"', "&quot;")}" aria-hidden="true"></span>`,
        )
        .join("\n") +
      "\n";
  const target = path.join(backup, slug + ".md");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, old, "utf8");
  fs.writeFileSync(file, matter.stringify(body, parsed.data), "utf8");
  changed.push({ slug, kind });
}
const labels: Record<string, string> = {
  english: "Английский",
  japanese: "Японский",
  chinese: "Китайский",
  korean: "Корейский",
};
const intro = (
  title: string,
  rule: string,
  example: string,
  question: string,
  answer: string,
) =>
  `## Учебный разбор: ${title}\n\n### Сначала разберитесь в смысле\n\n${rule}\n\n### Разобранный пример\n\n${example}\n\nПрочитайте пример, закройте его и объясните своими словами, почему выбрана именно эта форма. Затем измените одного участника или обстоятельство и проверьте, что ещё должно измениться.\n\n### Попробуйте без подсказки\n\n${question}\n\n<details>\n<summary>Показать ответ и объяснение</summary>\n\n${answer}\n\n</details>\n\n### Перенос в свою речь\n\nСоставьте два собственных примера на эту модель. Для каждого укажите ситуацию, участников и смысл выбранной формы. Проверьте не только окончание, но и порядок слов. Не считайте повторение примера по памяти самостоятельным решением.\n`;
let overviewCount = 0,
  usageCount = 0;
for (const [lang, units] of Object.entries(lessons)) {
  if (units.length !== 15)
    throw new Error("Each course needs 15 authored lesson focuses.");
  for (let index = 0; index < units.length; index++) {
    const n = index + 1;
    const [title, rule, example, q, a] = units[index];
    for (const mirror of [false, true]) {
      const overview = docs.find(
        (d) =>
          d.slug.startsWith(
            (mirror ? "knowledge/" : "") + `languages/${lang}/`,
          ) && d.slug.endsWith(`/unit-${String(n).padStart(2, "0")}/overview`),
      );
      if (!overview) throw new Error(`Missing overview ${lang}/${n}/${mirror}`);
      const base = overview.slug.slice(0, -"/overview".length);
      const core = docs.find((d) => d.slug === base + "/grammar/core")!;
      const prior = matter(
        fs.readFileSync(path.join(root, overview.slug + ".md"), "utf8"),
      ).content;
      // Retain unique old routes (including mnemonic aids and previous/next units).
      const routes = [...prior.matchAll(/\[([^\]\n]+)\]\(([^)\n]+)\)/g)].filter(
        (m) =>
          ![
            "dialogue.md",
            "grammar/core.md",
            "grammar/usage.md",
            "vocabulary/words.md",
            "practice/exercises.md",
            "reading.md",
            "test.md",
          ].includes(m[2]),
      );
      const coreTopics = core.toc
        .slice(0, 5)
        .map(
          (h) =>
            `- [${h.text.replaceAll("[", "").replaceAll("]", "")}](grammar/core.md#${h.id})`,
        )
        .join("\n");
      const body = `# ${labels[lang]} · Урок ${String(n).padStart(2, "0")} — ${title}${mirror ? " · дополнительная версия" : ""}\n\nЭтот урок организован вокруг задачи: **${title.toLowerCase()}**. Сначала разберите короткую модель, затем примените её в речи и проверьте себя. Подробная грамматика содержит и дополнительные темы: не обязательно проходить весь справочный объём за один подход.\n\n## Чему вы научитесь\n\n- Объяснять своими словами: ${rule.split(". ")[0]}.\n- Разбирать учебный пример по ролям участников и значению формы.\n- Самостоятельно решать задачу: ${q}\n- Применять правило в двух новых фразах, а не только узнавать готовый ответ.\n\n## Что нужно перед началом\n\n${n === 1 ? "Умение читать учебные обозначения. Если письменность ещё незнакома, держите рядом алфавит/таблицу чтения из справочника языка. Не подменяйте произношение русской записью." : "Повторите модели предыдущего урока и выпишите одну оставшуюся трудность. Если вы пришли из поиска, используйте содержание уровня, чтобы найти пропущенные темы."}\n\nМетка папки — способ организации исходного курса; она не подтверждает полного покрытия экзаменационного или международного уровня.\n\n## Короткое объяснение\n\n${rule}\n\n**Пример с разбором.** ${example}\n\n## Маршрут занятия\n\n1. [Диалог](dialogue.md): сначала найдите участников и цель разговора, затем отметьте изучаемую форму. Чтение диалога само по себе не заменяет аудирование.\n2. [Грамматика](grammar/core.md): прочитайте основной блок и сформулируйте правило одним предложением.\n3. [Разбор применения](grammar/usage.md): сопоставьте форму со смыслом, решите мини-задачу до открытия ответа.\n4. [Словарь](vocabulary/words.md): выберите небольшой набор слов, нужных для ваших примеров. Не пытайтесь выучить весь список за один раз.\n5. [Практика](practice/exercises.md): запишите решения отдельно; готовые ответы используйте после попытки.\n6. [Чтение](reading.md): перескажите основную мысль и найдите примеры изученной модели.\n7. [Тест](test.md): выполните без конспекта, затем объясните каждую ошибку.\n\n## Основные разделы грамматики\n\n${coreTopics}\n\n## Самопроверка перед практикой\n\n${q}\n\n<details>\n<summary>Ответ — откройте после своей попытки</summary>\n\n${a}\n\n</details>\n\n## Итог урока\n\nУрок освоен на рабочем уровне, если вы можете объяснить модель, выполнить мини-задачу без подсказки и построить два новых примера. Процент теста используйте как обратную связь по этим заданиям, а не как сертификат владения языком.\n\nНа следующем занятии воспроизведите правило без перечитывания. Если ошиблись, вернитесь к разобранному примеру и сделайте новый вариант той же задачи.\n${routes.length ? "\n## Дополнительные маршруты\n\n" + routes.map((m) => `- [${m[1]}](${m[2]})`).join("\n") + "\n" : ""}`;
      write(overview.slug, body, "lesson-overview");
      overviewCount++;
      const usageSlug = base + "/grammar/usage";
      const usage = docs.find((d) => d.slug === usageSlug)!;
      const oldUsage = matter(
        fs.readFileSync(path.join(root, usageSlug + ".md"), "utf8"),
      ).content;
      const existing = mirror ? oldUsage.replace(/^# .+\r?\n/, "").trim() : "";
      let usageBody = `# ${labels[lang]} · Урок ${String(n).padStart(2, "0")} — применение: ${title}${mirror ? " · дополнительная версия" : ""}\n\n${intro(title, rule, example, q, a)}`;
      if (existing)
        usageBody +=
          "\n## Дополнительные объяснения исходной версии\n\n" +
          existing +
          "\n";
      usageBody +=
        "\n## Учебный маршрут\n\n[Обзор урока](../overview.md) · [Подробная грамматика](core.md) · [Практика](../practice/exercises.md) · [Проверка знаний](../test.md)\n";
      write(
        usageSlug,
        usageBody,
        mirror ? "retained-usage-plus-teaching" : "replaced-generic-usage",
      );
      usageCount++;
    }
  }
}
// Fold only explicitly identified answer sections; keep their headings and IDs.
let answerSections = 0,
  inlineAnswers = 0;
for (const doc of docs.filter((d) =>
  /\/unit-\d+\/(?:practice\/exercises|test)$/.test(d.slug),
)) {
  const old = matter(
    fs.readFileSync(path.join(root, doc.slug + ".md"), "utf8"),
  ).content;
  const lines = old.split(/\r?\n/);
  const out: string[] = [];
  let fence = false;
  let answerLevel = 0;
  let answers: string[] = [];
  let sectionName = "";
  let edits = 0;
  let callout = false;
  const flush = () => {
    if (answers.length) {
      out.push(
        "",
        "<details>",
        "<summary>Проверить ответы к этому блоку</summary>",
        "",
        ...answers,
        "",
        "</details>",
        "",
      );
      answers = [];
      edits++;
      answerSections++;
    }
    answerLevel = 0;
  };
  const extracted: string[] = [];
  const english = doc.slug.includes("/english/");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      (answerLevel ? answers : out).push(line);
      continue;
    }
    if (fence) {
      (answerLevel ? answers : out).push(line);
      continue;
    }
    if (callout) {
      if (/^>/.test(line)) {
        out.push(line.replace(/^> ?/, ""));
        continue;
      }
      out.push("", "</details>", "");
      callout = false;
    }
    if (/^>\s*\[!\w+\]-?\s*.*(?:Ответ|Answer|答|정답)/i.test(line)) {
      out.push("", "<details>", "<summary>Проверить ответы</summary>", "");
      callout = true;
      edits++;
      answerSections++;
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (answerLevel && level <= answerLevel) flush();
      sectionName = heading[2];
      if (
        !answerLevel &&
        /^[^\p{L}\p{N}]*(?:ответы?(?:\s|:|$)|answers?(?:\s|:|$)|answer key|ключ(?:и)?(?:\s|:|$)|答え|答案|解答|답안|정답)/iu.test(
          sectionName,
        )
      ) {
        out.push(line);
        answerLevel = level;
        continue;
      }
    }
    if (answerLevel) {
      answers.push(line);
      continue;
    }
    // A numbered English exercise ending in an explicit arrow answer. Never move blank prompts.
    const match =
      english && !/(?:ответ|answer|ключ|пример)/i.test(sectionName)
        ? /^(\s*\d+[.)]\s+)(.+?)\s+→\s+(.+)$/.exec(line)
        : null;
    if (match && !/^[_\.\s]+$/.test(match[3]) && !match[3].includes("___")) {
      out.push(match[1] + match[2] + " → __________");
      extracted.push(
        `- **${sectionName}; задание ${match[1].trim()}** ${match[3]}`,
      );
      inlineAnswers++;
      edits++;
      continue;
    }
    out.push(line);
  }
  if (answerLevel) flush();
  if (callout) out.push("", "</details>", "");
  if (extracted.length)
    out.push(
      "",
      "## Проверка самостоятельной работы",
      "",
      "Решите задания выше до открытия ключа. Здесь сохранены ответы и пояснения исходного материала; допустимость иных вариантов зависит от контекста.",
      "",
      "<details>",
      "<summary>Открыть ключ к заданиям со стрелкой</summary>",
      "",
      ...extracted,
      "",
      "</details>",
      "",
    );
  if (edits) {
    const body = out.join("\n");
    write(doc.slug, body, "answer-separation");
  }
}
fs.mkdirSync(backup, { recursive: true });
fs.writeFileSync(
  path.join(backup, "manifest.json"),
  JSON.stringify(
    { overviewCount, usageCount, answerSections, inlineAnswers, changed },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    overviewCount,
    usageCount,
    answerSections,
    inlineAnswers,
    changedFiles: changed.length,
  }),
);
