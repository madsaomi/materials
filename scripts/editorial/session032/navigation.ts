import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../../../lib/knowledge";
const backup = "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session032/navigation";
if (fs.existsSync(path.join(backup, "manifest.json"))) throw new Error("Session032 navigation already applied");
const topics: Record<string,string[]> = {
  "english": [
    "Передать фон и последовательность событий поездки",
    "Уточнить автора/предмет через относительное придаточное",
    "Различить обязанность, запрет, совет и условие",
    "Сопоставить даты архива и сохранить событие при пассиве",
    "Выбрать время по результату, процессу и плану"
  ],
  "japanese": [
    "Различить пассив и побуждение, сохранить роли участников",
    "Выбрать уважительную форму с нужной точки зрения",
    "Различить условие, последовательность и независимое решение",
    "Понять письменный регистр и переписать сообщение",
    "Отделить чужое сообщение от собственного впечатления"
  ],
  "korean": [
    "Различить пассив и побуждение без механической подстановки",
    "Выбрать вежливый стиль и уважение к участнику",
    "Выразить условие и сохранить смысл предположения",
    "Сопоставить письменное сообщение с разговорной репликой",
    "Передать чужие слова и проверить тип высказывания"
  ],
  "chinese": [
    "Проверить роли в сообщении с пассивной конструкцией",
    "Сформулировать просьбу и сохранить адресата",
    "Отличить зависимый от погоды план от независимого",
    "Сопоставить объявление с сообщением в чате",
    "Проверить источник слуха и сообщение о переносе встречи"
  ]
};
const edits: { slug: string; raw: string; next: string }[] = [];
for (const prefix of ["", "knowledge/"]) for (const [language, goals] of Object.entries(topics)) for (const level of [false, true]) {
  const slug = `${prefix}languages/${language}/${level ? "b1/" : ""}_contents`;
  const raw = fs.readFileSync(path.join("knowledge", slug + ".md"), "utf8");
  const parsed = matter(raw);
  const base = level ? "" : "b1/";
  const rows = goals.map((goal, i) => {
    const unit = String(i + 11).padStart(2, "0");
    return `| ${unit}. ${goal} | [Чтение](${base}unit-${unit}/reading.md) | [Три задачи с объяснением](${base}unit-${unit}/practice/exercises.md) | [Модель и справочник](${base}unit-${unit}/grammar/core.md) |`;
  }).join("\n");
  const route = `## ${level ? "Учебный маршрут: уроки 11–15" : "Продолжение: уроки 11–15"}\n\n${level ? "Опирайтесь на модели первых десяти уроков. В этой части нужно проследить время, роли участников и условия ситуации, затем объяснить собственный выбор формы." : "После первых десяти уроков продолжайте в папке B1. У каждой ситуации теперь есть короткое чтение и самостоятельная практика; к длинному справочнику можно обращаться за конкретным правилом."}\n\n| Задача урока | Основной текст | Самостоятельная работа | Грамматика |\n|---|---|---|---|\n${rows}\n\n${level ? "### Порядок работы с ситуацией\n\n1. Прочитайте обзор и учебную модель. Найдите, кто действует, когда и для кого.\n2. Прочитайте короткий текст без перевода. Для каждого ответа укажите строку текста или расчёт по явно данным числам.\n3. Решите три задачи письменно, затем откройте объяснённый ключ. Сравните форму и смысл; возможные варианты учитывайте по условию.\n4. Измените время, участника или условие и составьте свою реплику. На следующем занятии повторите трудную модель без конспекта.\n\nК прежним большим банкам переходите по необходимости. Совпадение с готовым ключом само по себе не доказывает понимания." : "[Открыть содержание B1](b1/_contents.md)."}\n\n`;
  let body: string;
  if (level) {
    const heading = /^# .+\r?\n/.exec(parsed.content);
    if (!heading) throw new Error("Title missing: " + slug);
    body = heading[0] + "\n" + route + parsed.content.slice(heading[0].length).replace(/^\s*Выберите урок или материал\.[^\n]*\r?\n/, "");
  } else {
    const anchor = "## Как пройти один урок";
    if (!parsed.content.includes(anchor)) throw new Error("Session029 route missing: " + slug);
    body = parsed.content.replace(anchor, route + anchor);
  }
  const old = load(renderMarkdown(parsed.content, slug).html), current = load(renderMarkdown(body, slug).html);
  const ids = new Set(current("[id]").map((_, e) => current(e).attr("id")!).get());
  for (const id of old("[id]").map((_, e) => old(e).attr("id")!).get()) if (!ids.has(id)) body += `\n<span id="${id}" aria-hidden="true"></span>\n`;
  edits.push({ slug, raw, next: matter.stringify(body, { ...parsed.data, editorial: "manual", language_revision: "2026-10-18", language_session: 32 }) });
}
for (const { slug, raw, next } of edits) {
  const saved = path.join(backup, slug + ".md");
  fs.mkdirSync(path.dirname(saved), { recursive: true });
  if (fs.existsSync(saved)) throw new Error("Do not overwrite before-image: " + slug);
  fs.writeFileSync(saved, raw);
  fs.writeFileSync(path.join("knowledge", slug + ".md"), next);
}
fs.writeFileSync(path.join(backup, "manifest.json"), JSON.stringify({ changed: edits.map(e => e.slug) }, null, 2));
console.log(`Session032 navigation: ${edits.length} course/B1 contents updated.`);
