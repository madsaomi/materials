import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Backup directory required");
if (fs.existsSync(path.join(backup, "navigation.json")))
  throw new Error("Already applied");
const manifest = JSON.parse(
  fs.readFileSync(path.join(backup, "manifest.json"), "utf8"),
) as { chapters: number; changed: string[] };
const original =
  "Выберите урок или материал. Внутри урока рекомендуемый порядок: обзор → диалог → грамматика → словарь → упражнения → чтение → проверка знаний.";
const route =
  "Сначала объяснение и разобранный код, затем самостоятельная практика. Готовое решение открывайте после своей попытки; справочник используйте для уточнения отдельных тем.";
const changed: string[] = [];
function visit(dir: string) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) {
      visit(file);
      continue;
    }
    if (e.name !== "_contents.md") continue;
    const raw = fs.readFileSync(file, "utf8");
    if (matter(raw).data.editorial === "manual") continue;
    let text = raw.replace(original, route);
    text = text.replace(
      /(- \[[^\n]+\]\([^\n]*practice\.md\))\r?\n(- \[[^\n]+\]\([^\n]*syntax\.md\))/g,
      "$2\n$1",
    );
    if (text === raw) continue;
    const slug = path
      .relative("knowledge", file)
      .replaceAll("\\", "/")
      .slice(0, -3);
    const b = path.join(backup, slug + ".md");
    fs.mkdirSync(path.dirname(b), { recursive: true });
    if (!fs.existsSync(b)) fs.writeFileSync(b, raw);
    fs.writeFileSync(file, text);
    changed.push(slug);
    manifest.changed.push(slug);
  }
}
visit("knowledge/programming");
fs.writeFileSync(
  path.join(backup, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
fs.writeFileSync(
  path.join(backup, "navigation.json"),
  JSON.stringify(changed, null, 2),
);
console.log(
  `Updated ${changed.length} programming contents pages; ${manifest.changed.length} notes total.`,
);
