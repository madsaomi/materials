import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../lib/knowledge";
const backup = "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session030/navigation";
if (fs.existsSync(path.join(backup, "manifest.json"))) throw new Error("Session030 navigation already applied");
const topics: Record<string, string[]> = {
  english: ["Погода сейчас и впечатления: raining / interesting / interested", "Описать путь и отличить место от входа внутрь", "Прочитать время и согласовать встречу", "Отличить жизненный опыт от прошлого эпизода", "Рассказать об обязанностях и текущей задаче"],
  japanese: ["Различить процесс, состояние и подготовку: ている / てある / ておく", "Отличить освоенное умение от желания научиться", "Проследить направление подарка и помощи", "Сравнить вещи по цене и массе, проверить бюджет", "Различить условие, совет и опыт поездки"],
  korean: ["Описать действие сейчас и порядок подготовки", "Выразить возможность и условие", "Указать получателя подарка и помощи", "Сравнить покупки и проверить расчёт", "Различить опыт поездки и принятое решение"],
  chinese: ["Различить действие в процессе, результат и изменение с 了", "Различить возможность увидеть, понять и закончить", "Указать, кому дают и кому помогают: 给 / 帮", "Сравнить цены и вычислить остаток бюджета", "Прочитать время и условный план с 就 / 才"],
};
const edits: { slug: string; raw: string; next: string }[] = [];
for (const prefix of ["", "knowledge/"]) for (const [language, goals] of Object.entries(topics)) for (const level of [false, true]) {
  const slug = `${prefix}languages/${language}/${level ? "a2/" : ""}_contents`;
  const raw = fs.readFileSync(path.join("knowledge", slug + ".md"), "utf8");
  const parsed = matter(raw);
  const base = level ? "" : "a2/";
  const rows = goals.map((goal, i) => {
    const unit = String(i + 6).padStart(2, "0");
    return `| ${unit}. ${goal} | [Чтение](${base}unit-${unit}/reading.md) | [Три задачи с объяснением](${base}unit-${unit}/practice/exercises.md) | [Модель и справочник](${base}unit-${unit}/grammar/core.md) |`;
  }).join("\n");
  const route = `## ${level ? "Учебный маршрут: уроки 06–10" : "Продолжение: уроки 06–10"}\n\n${level ? "Опирайтесь на модели первых пяти уроков. В этой части нужно проследить время, роли участников и условия ситуации, затем объяснить собственный выбор формы." : "После начальных пяти уроков продолжайте в папке A2. У каждой ситуации теперь есть короткое чтение и самостоятельная практика; к длинному справочнику можно обращаться за конкретным правилом."}\n\n| Задача урока | Основной текст | Самостоятельная работа | Грамматика |\n|---|---|---|---|\n${rows}\n\n${level ? "### Порядок работы с ситуацией\n\n1. Прочитайте обзор и учебную модель. Найдите, кто действует, когда и для кого.\n2. Прочитайте короткий текст без перевода. Для каждого ответа укажите строку текста или расчёт по явно данным числам.\n3. Решите три задачи письменно, затем откройте объяснённый ключ. Сравните форму и смысл; возможные варианты учитывайте по условию.\n4. Измените время, участника или условие и составьте свою реплику. На следующем занятии повторите трудную модель без конспекта.\n\nК прежним большим банкам переходите по необходимости. Совпадение с готовым ключом само по себе не доказывает понимания." : "[Открыть содержание A2](a2/_contents.md)."}\n\n`;
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
  edits.push({ slug, raw, next: matter.stringify(body, { ...parsed.data, editorial: "manual", language_revision: "2026-10-18", language_session: 30 }) });
}
for (const { slug, raw, next } of edits) {
  const saved = path.join(backup, slug + ".md");
  fs.mkdirSync(path.dirname(saved), { recursive: true });
  if (fs.existsSync(saved)) throw new Error("Do not overwrite before-image: " + slug);
  fs.writeFileSync(saved, raw);
  fs.writeFileSync(path.join("knowledge", slug + ".md"), next);
}
fs.writeFileSync(path.join(backup, "manifest.json"), JSON.stringify({ changed: edits.map(e => e.slug) }, null, 2));
console.log(`Session030 navigation: ${edits.length} course/A2 contents updated.`);
