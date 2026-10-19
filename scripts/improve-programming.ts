import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../lib/knowledge";
import { chapters } from "./programming-content";
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Pass absolute external backup directory");
if (fs.existsSync(path.join(backup, "manifest.json")))
  throw new Error("Already applied");
const root = path.resolve("knowledge");
if (path.resolve(backup).startsWith(root + path.sep))
  throw new Error("External backup required");
const changed: string[] = [];
function write(
  slug: string,
  content: string,
  data: Record<string, unknown> = {},
) {
  const file = path.join(root, slug + ".md");
  const old = fs.readFileSync(file, "utf8");
  const p = matter(old);
  const before = load(renderMarkdown(p.content, slug).html),
    after = load(renderMarkdown(content, slug).html);
  const ids = new Set(
    after("[id]")
      .map((_, e) => after(e).attr("id"))
      .get(),
  );
  const missing = before("[id]")
    .map((_, e) => before(e).attr("id")!)
    .get()
    .filter((id) => !ids.has(id));
  if (missing.length)
    content +=
      "\n\n" +
      missing
        .map(
          (id) =>
            `<span id="${id.replaceAll('"', "&quot;")}" aria-hidden="true"></span>`,
        )
        .join("\n");
  const b = path.join(backup, slug + ".md");
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.writeFileSync(b, old);
  fs.writeFileSync(file, matter.stringify(content, { ...p.data, ...data }));
  changed.push(slug);
}
const fence: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  go: "go",
  rust: "rust",
};
for (const chapter of chapters) {
  const base = `programming/${chapter.language}/${chapter.level}/unit-${chapter.unit}`;
  const syntax = base + "/syntax",
    practice = base + "/practice";
  const oldTheory = matter(
    fs.readFileSync(path.join(root, syntax + ".md"), "utf8"),
  ).content;
  const oldPractice = matter(
    fs.readFileSync(path.join(root, practice + ".md"), "utf8"),
  ).content;
  const title = /^# (.+)$/m.exec(oldTheory)?.[1] || chapter.title;
  const code = (s: string) =>
    "```" + fence[chapter.language] + "\n" + s.trim() + "\n```";
  const setup: Record<string, string> = {
    python:
      "Python 3: сохраните код в lesson.py и выполните python lesson.py. Используется только стандартный язык; установка библиотек не нужна.",
    javascript:
      "Node.js 22+: сохраните код в lesson.cjs и выполните node lesson.cjs. DOM и сеть не используются.",
    go: "Go: сохраните полный пример в main.go и выполните go run main.go. Разобранный пример и решение — отдельные программы, не вставляйте два func main в один файл.",
    rust: "Rust stable: сохраните полный пример в main.rs, выполните rustc main.rs, затем запустите полученный файл. Пример и решение компилируются отдельно.",
  };
  const prerequisite =
    chapter.unit === "01"
      ? "Установка языка и умение запустить небольшой файл. Не требуется предварительно проходить большой справочник ниже."
      : chapter.unit === "02"
        ? "Функции, условия, циклы и материал первого урока этого языка."
        : "Функции, коллекции и обработка результатов из предыдущих уроков.";
  const theory = `# ${title}\n\n## Учебная глава: ${chapter.title}\n\n**Результат:** ${chapter.task.split(":")[0]}.\n\n**Перед началом:** ${prerequisite}\n\n### Подготовка среды\n\n${setup[chapter.language]}\n\n### Идея и границы модели\n\n${chapter.concept}\n\n### Пример целиком\n\nСначала прочитайте код и предскажите, пройдут ли проверки. Затем запустите его. Проверки — часть примера, а не текст ожидаемого вывода.\n\n${code(chapter.code)}\n\n### Разбор по шагам\n\n${chapter.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n### Проверка понимания\n\n${chapter.edge}\n\nОбъясните, какая строка обеспечивает корректность пустого входа или отказа. Укажите, что произойдёт, если убрать эту строку. Если для примера этот случай недопустим, назовите нарушенное предусловие.\n\n### Следующий шаг\n\n[Откройте практику](practice.md), решите задачу без копирования примера и только после этого раскрывайте решение.\n\n## Подробный справочник исходной главы\n\nНиже сохранены прежние пояснения и примеры. Это расширение для выборочного чтения; учебное ядро выше охватывает одну конкретную задачу, а не все темы справочника.\n\n${oldTheory.replace(/^# .+\r?\n/, "").trim()}\n\n## Источник учебного ядра\n\n[Официальная документация](${chapter.source}). Новые примеры составлены для этой базы.\n`;
  write(syntax, theory, { teaching_revision: "2026-10-18" });
  const exercise = `# ${chapter.language.toUpperCase()} · Урок ${chapter.unit} — самостоятельная работа\n\n## Цель практики\n\n${chapter.task}\n\nПеред решением прочитайте [учебное объяснение](syntax.md). Запишите сигнатуру, допустимый вход и ожидаемый результат.\n\n## Задание без готового ответа\n\n${chapter.task}\n\n${chapter.language === "python" && chapter.unit === "03" ? "Решение ниже продолжает класс Cart из разобранного примера. Сначала выполните код этого класса; остальные решения этой серии запускаются отдельными файлами." : "Решение должно запускаться в среде, описанной в теоретической главе. Все данные для проверки находятся в коде; сеть не нужна."}\n\n## Как проверить результат\n\n${chapter.edge}\n\nПроверьте обычный случай, пустой вход или отказ и границу условия там, где они допустимы по контракту. Сначала предскажите результат, затем запускайте код.\n\n## Решение и объяснение\n\n<details>\n<summary>Открыть решение после своей попытки</summary>\n\n${code(chapter.solution)}\n\n${chapter.explanation}\n\n</details>\n\n## Новая ситуация\n\n${chapter.extension}\n\nПрежде чем менять реализацию, запишите хотя бы три ожидаемых сценария. Решение новой ситуации не раскрыто: это задание на перенос, а не повторение готового фрагмента.\n\n## Критерий готовности\n\nВы можете объяснить каждую проверку, отличить нарушение контракта от ошибки реализации и изменить одно требование без случайного изменения остальных. Для проверки попросите себя привести контрпример к неверной реализации.\n\n## Сохранённый банк примеров и решений\n\nСтарые задачи и проекты сохранены ниже отдельным блоком. В них есть готовый код и разная глубина пояснений: используйте их после самостоятельной попытки. Они не объявляются автоматически проверенными новым учебным ядром.\n\n<details>\n<summary>Открыть исходные упражнения и разобранные проекты</summary>\n\n${oldPractice.replace(/^# .+\r?\n/, "").trim()}\n\n</details>\n\n[Вернуться к объяснению](syntax.md)\n`;
  write(practice, exercise, { teaching_revision: "2026-10-18" });
}
// Rewrite existing course contents, retaining all old links and old heading anchors.
for (const lang of ["python", "javascript", "go", "rust"]) {
  const slug = `programming/${lang}/_contents`;
  const old = matter(
    fs.readFileSync(path.join(root, slug + ".md"), "utf8"),
  ).content;
  const own = chapters.filter((c) => c.language === lang);
  write(
    slug,
    `# ${lang.toUpperCase()} — учебный маршрут\n\nПроходите основы → структуры и практику → углубление. В каждой главе сначала прочитайте учебное ядро, затем решите задачу без ключа. Большой справочник и старый банк решений остаются доступны для расширения темы.\n\n## Последовательность уроков\n\n${own.map((c) => `### Урок ${c.unit}. ${c.title}\n\n${c.concept}\n\n[Объяснение](${c.level}/unit-${c.unit}/syntax.md) · [Самостоятельная практика](${c.level}/unit-${c.unit}/practice.md)\n`).join("\n")}\n## Результат курса\n\nСоберите небольшой проект с явно описанным входом и результатом. Добавьте проверки нормального поведения, пустого входа и ожидаемого отказа. Три учебных ядра не заменяют всего языка и не являются свидетельством профессионального уровня.\n\n## Полный каталог сохранённых материалов\n\n${old
      .replace(/^# .+\r?\n/, "")
      .replace(
        "Выберите урок или материал. Внутри урока рекомендуемый порядок: обзор → диалог → грамматика → словарь → упражнения → чтение → проверка знаний.",
        "Подробные справочники, проекты и исходные разделы курса.",
      )
      .trim()}\n`,
    { editorial: "manual" },
  );
}
fs.writeFileSync(
  path.join(backup, "manifest.json"),
  JSON.stringify({ chapters: chapters.length, changed }, null, 2),
);
console.log(
  `Updated ${changed.length} notes for ${chapters.length} programming lessons.`,
);
