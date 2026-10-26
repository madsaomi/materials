/** Maintain existing generated contents pages. Dry-run is the default. */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { label, levels, logical, order } from "../lib/catalog";
import { renderMarkdown } from "../lib/knowledge";

export interface MarkdownFile {
  /** Physical path relative to knowledge/, without the .md extension. */
  slug: string;
  source: string;
}

export interface ContentsNote {
  slug: string;
  title: string;
}

export interface ContentsChange extends MarkdownFile {
  output: string;
  manual: boolean;
  changed: boolean;
}

const materialNames: Record<string, string> = {
  overview: "Обзор урока",
  dialogue: "Диалог",
  core: "Грамматика",
  usage: "Применение грамматики",
  words: "Словарь",
  exercises: "Упражнения",
  reading: "Чтение",
  test: "Проверка знаний",
};

const languageLevels = new Set(["a1", "a2", "b1", "b2", "c1", "c2"]);
const programmingRoute =
  "Сначала объяснение и разобранный код, затем самостоятельная практика. Готовое решение открывайте после своей попытки; справочник используйте для уточнения отдельных тем.";
const generalRoute =
  "Выберите урок или материал. Внутри урока рекомендуемый порядок: обзор → диалог → грамматика → словарь → упражнения → чтение → проверка знаний.";

function isVisible(slug: string): boolean {
  return slug.split("/").every((part) => part && !part.startsWith("."));
}

function isContents(slug: string): boolean {
  return path.posix.basename(slug) === "_contents";
}

function renderedIds(content: string, slug: string): string[] {
  const $ = load(renderMarkdown(content, slug).html);
  return $("[id]")
    .map((_, element) => $(element).attr("id")!)
    .get();
}

/** Keep old section links working even when a generated group disappears. */
function preserveIds(
  previous: string,
  generated: string,
  folder: string,
): string {
  const slug = path.posix.join(folder, "_contents");
  const current = new Set(renderedIds(generated, slug));
  const missing = [...new Set(renderedIds(previous, slug))].filter(
    (id) => !current.has(id),
  );
  if (!missing.length) return generated;
  const escape = (id: string) =>
    id
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  const aliases = missing
    .map((id) => `<span id="${escape(id)}" aria-hidden="true"></span>`)
    .join("\n");
  const firstLine = generated.indexOf("\n") + 1;
  return (
    generated.slice(0, firstLine) +
    "\n" +
    aliases +
    "\n" +
    generated.slice(firstLine)
  );
}

/** Parse just titles, without rendering the whole knowledge base. */
export function contentsNotes(files: readonly MarkdownFile[]): ContentsNote[] {
  return files
    .filter((file) => isVisible(file.slug) && !isContents(file.slug))
    .map(({ slug, source }) => {
      const post = matter(source);
      return {
        slug,
        title: String(
          post.data.title ||
            /^#\s+(.+)$/m.exec(post.content)?.[1] ||
            path.posix.basename(slug),
        ),
      };
    });
}

/** Generate one body, keeping links within its physical vault edition. */
export function renderContents(
  folder: string,
  notes: readonly ContentsNote[],
): string {
  const mirror = folder === "knowledge" || folder.startsWith("knowledge/");
  const visibleFolder = folder === "knowledge" ? "" : logical(folder);
  const folderTitle = visibleFolder
    ? visibleFolder.split("/").map(label).join(" / ")
    : "Библиотека";
  const edition = mirror ? "Дополнительное хранилище" : "Основная библиотека";
  const route =
    visibleFolder === "programming" || visibleFolder.startsWith("programming/")
      ? programmingRoute
      : generalRoute;
  const lines = [`# Содержание: ${folderTitle} — ${edition}`, "", route, ""];
  if (languageLevels.has(path.posix.basename(folder))) {
    lines.push(
      "Уровень отражает организацию текущих материалов и авторские пометки; это не подтверждение полного покрытия CEFR или эквивалентности экзаменам HSK, JLPT и TOPIK.",
      "",
    );
  }

  const groups = new Map<string, ContentsNote[]>();
  for (const note of notes) {
    if (!isVisible(note.slug) || isContents(note.slug)) continue;
    if (folder && !note.slug.startsWith(folder + "/")) continue;
    if (!folder && note.slug.startsWith("knowledge/")) continue;
    const relative = path.posix.relative(folder || ".", note.slug);
    const parts = relative.split("/");
    const group = Object.hasOwn(levels, parts[0])
      ? parts.slice(0, parts.length > 2 ? 2 : 1).join("/")
      : parts.length > 1
        ? parts[0]
        : "";
    groups.set(group, [...(groups.get(group) || []), note]);
  }
  const levelOrder = Object.keys(levels);
  const rank = (group: string) => {
    const index = levelOrder.indexOf(group.split("/")[0]);
    return index < 0 ? 20 : index;
  };
  // Codepoint order matches the old generator's stable group order. Note order
  // intentionally shares the reader's comparator instead of duplicating it.
  const sortedGroups = [...groups].sort(
    ([a], [b]) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0),
  );
  for (const [group, entries] of sortedGroups) {
    lines.push(
      "",
      "## " + (group ? group.split("/").map(label).join(" / ") : "Материалы"),
      "",
    );
    for (const note of [...entries].sort(order)) {
      const relative = path.posix.relative(folder || ".", note.slug + ".md");
      const stem = path.posix.basename(note.slug);
      const name = /\/unit-\d+\//.test("/" + relative)
        ? materialNames[stem] || note.title
        : note.title;
      // Markdown labels must not introduce their own link delimiters.
      const safeName = name.replace(/[\[\]\r\n]/g, "");
      lines.push(`- [${safeName}](${relative})`);
    }
  }
  return lines.join("\n") + "\n";
}

/** Preserve authored pages exactly, and preserve raw metadata on generated ones. */
export function refreshContents(
  source: string,
  folder: string,
  notes: readonly ContentsNote[],
): { output: string; manual: boolean } {
  const post = matter(source);
  if (post.data.editorial === "manual") return { output: source, manual: true };
  // gray-matter content is an exact suffix of the source. This retains comments,
  // quoting, key order, BOM and delimiter line endings without reserializing YAML.
  const prefix = source.slice(0, source.length - post.content.length);
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  return {
    output:
      prefix +
      preserveIds(
        post.content,
        renderContents(folder, notes),
        folder,
      ).replaceAll("\n", newline),
    manual: false,
  };
}

/** Pure plan: never creates a contents file where one does not already exist. */
export function planContents(files: readonly MarkdownFile[]): ContentsChange[] {
  const notes = contentsNotes(files);
  return files
    .filter((file) => isVisible(file.slug) && isContents(file.slug))
    .map((file) => {
      const directory = path.posix.dirname(file.slug);
      const result = refreshContents(
        file.source,
        directory === "." ? "" : directory,
        notes,
      );
      return { ...file, ...result, changed: result.output !== file.source };
    });
}

export function readMarkdownFiles(root: string): MarkdownFile[] {
  const visit = (directory: string): MarkdownFile[] =>
    fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith("."))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
      .flatMap((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory()
          ? visit(file)
          : entry.isFile() && entry.name.endsWith(".md")
            ? [
                {
                  slug: path
                    .relative(root, file)
                    .replaceAll("\\", "/")
                    .slice(0, -3),
                  source: fs.readFileSync(file, "utf8"),
                },
              ]
            : [];
      });
  return visit(root);
}

export function applyContents(
  root: string,
  plan: readonly ContentsChange[],
): number {
  const changes = plan.filter((entry) => entry.changed && !entry.manual);
  const destinations = changes.map((entry) => {
    const file = path.resolve(root, entry.slug + ".md");
    const relative = path.relative(path.resolve(root), file);
    if (relative.startsWith("..") || path.isAbsolute(relative))
      throw new Error(`Contents path escapes knowledge root: ${entry.slug}`);
    if (!isContents(entry.slug) || !isVisible(entry.slug))
      throw new Error(`Not an existing visible contents page: ${entry.slug}`);
    const current = fs.readFileSync(file, "utf8");
    if (current !== entry.source || matter(current).data.editorial === "manual")
      throw new Error(`Contents changed after planning: ${entry.slug}`);
    return file;
  });
  for (let index = 0; index < changes.length; index++)
    fs.writeFileSync(destinations[index], changes[index].output, "utf8");
  return changes.length;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("Usage: pnpm contents:refresh [--dry-run | --check | --apply]");
    console.log(
      "Default: dry-run. Only --apply writes existing generated pages.",
    );
    return;
  }
  if (
    args.some((arg) => !["--apply", "--check", "--dry-run"].includes(arg)) ||
    args.length > 1
  )
    throw new Error("Choose at most one of --dry-run, --check or --apply.");
  const root = path.resolve("knowledge");
  const plan = planContents(readMarkdownFiles(root));
  const manual = plan.filter((entry) => entry.manual).length;
  const changed = plan.filter((entry) => entry.changed);
  console.log(
    `Contents: ${plan.length} existing; ${manual} manual preserved; ${changed.length} generated pages would change.`,
  );
  for (const entry of changed) console.log(`  ${entry.slug}.md`);
  if (args[0] === "--apply") {
    console.log(`Contents refreshed: ${applyContents(root, plan)}.`);
  } else {
    console.log("Dry-run: no knowledge files written.");
    if (args[0] === "--check" && changed.length) process.exitCode = 1;
  }
}

if (/[\\/]refresh-contents\.ts$/.test(process.argv[1] || "")) main();
