import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getDocs } from "../lib/knowledge";
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Pass backup directory");
if (fs.existsSync(path.join(backup, "finalization.json")))
  throw new Error("Already finalized");
const changed: { slug: string; count: number }[] = [];
function save(slug: string, raw: string, next: string, count: number) {
  const b = path.join(backup, slug + ".md");
  if (!fs.existsSync(b)) {
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.writeFileSync(b, raw);
  }
  fs.writeFileSync(path.join("knowledge", slug + ".md"), next);
  changed.push({ slug, count });
}
for (const doc of getDocs().filter(
  (d) =>
    !d.slug.includes("/english/") &&
    /\/unit-\d+\/(?:practice\/exercises|test)$/.test(d.slug),
)) {
  const raw = fs.readFileSync(path.join("knowledge", doc.slug + ".md"), "utf8");
  const p = matter(raw);
  let depth = 0,
    fence = false;
  const keys: string[] = [];
  const lines = p.content.split(/\r?\n/).map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      return line;
    }
    if (fence) return line;
    if (line.includes("<details")) depth++;
    if (line.includes("</details>")) depth--;
    if (depth || !/^\s*\d+[.)]\s+/.test(line)) return line;
    return line.replace(
      /\*\(([^()\n]*?)\s+→\s+([^()\n]+)\)\*/g,
      (_, hint, answer) => {
        if (answer.includes("___") || answer.includes("＿＿")) return _;
        keys.push(`- **Задание ${/^\s*(\d+)/.exec(line)?.[1]}:** ${answer}`);
        return `*(${hint})*`;
      },
    );
  });
  if (keys.length) {
    const body =
      lines.join("\n") +
      "\n\n## Проверка подсказок к диалогам\n\n<details>\n<summary>Сравнить свои реплики с образцами</summary>\n\n" +
      keys.join("\n") +
      "\n\n</details>\n";
    save(doc.slug, raw, matter.stringify(body, p.data), keys.length);
  }
}
const references: Record<string, [string, string]> = {
  "english/a1/unit-01": [
    "British Council: be и краткие ответы",
    "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple-be",
  ],
  "english/a1/unit-03": [
    "British Council: степени сравнения",
    "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives",
  ],
  "english/b1/unit-14": [
    "British Council: used to / would",
    "https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/past-habits-used-to-would-past-simple",
  ],
  "japanese/a2/unit-06": [
    "Japan Foundation: значения ている",
    "https://www.jpf.go.jp/j/project/japanese/teach/tsushin/grammar/201312.html",
  ],
  "korean/b1/unit-15": [
    "How to Study Korean: пересказ вопросов и предложений",
    "https://www.howtostudykorean.com/unit-3-intermediate-korean-grammar/unit-3-lessons-51-58/lesson-53/",
  ],
};
for (const [unit, [title, url]] of Object.entries(references))
  for (const prefix of ["", "knowledge/"]) {
    const slug = prefix + "languages/" + unit + "/grammar/usage";
    const file = path.join("knowledge", slug + ".md");
    const raw = fs.readFileSync(file, "utf8");
    save(
      slug,
      raw,
      raw +
        `\n## Проверка правила по внешнему источнику\n\n[${title}](${url}). Примеры и мини-задания выше составлены для этой библиотеки; это не копия упражнений источника.\n`,
      0,
    );
  }
fs.writeFileSync(
  path.join(backup, "finalization.json"),
  JSON.stringify(changed, null, 2),
);
console.log(
  `Finalized ${changed.length} files; ${changed.reduce((s, c) => s + c.count, 0)} dialogue answers separated.`,
);
