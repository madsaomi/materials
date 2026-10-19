export const levels: Record<string, string> = {
  a1: "A1 · Начальный",
  a2: "A2 · Базовый",
  b1: "B1 · Средний",
  b2: "B2 · Выше среднего",
  c1: "C1 · Продвинутый",
  c2: "C2 · Свободное владение",
  foundation: "Основы",
  practice: "Практика",
  advanced: "Углубление",
  reference: "Справочник",
};
export const names: Record<string, string> = {
  languages: "Языки",
  english: "Английский",
  chinese: "Китайский",
  japanese: "Японский",
  korean: "Корейский",
  programming: "Программирование",
  python: "Python",
  go: "Go",
  rust: "Rust",
  javascript: "JavaScript",
  philosophy: "Философия",
  eastern: "Восточная философия",
  western: "Западная философия",
  practices: "Практики",
  meditation: "Медитация",
  yoga: "Йога",
  productivity: "Продуктивность",
  journaling: "Дневник",
  psychology: "Психология",
  books: "Книги",
  tools: "Инструменты",
  mnemonics: "Мнемотехника",
  overview: "Обзор библиотеки",
  "study-plans": "Планы обучения",
  comparison: "Сравнение языков",
  core: "Общие основы",
  grammar: "Грамматика",
  vocabulary: "Словарь",
  exams: "Экзамены",
  reading: "Чтение",
  writing: "Письмо",
  projects: "Проекты",
  snippets: "Примеры кода",
  algorithms: "Алгоритмы",
  patterns: "Паттерны",
  foundations: "Основы памяти",
  "core-techniques": "Техники памяти",
  "practical-domains": "Прикладные задачи",
  "languages-integration": "Память и языки",
  units: "Уроки",
  guides: "Руководства",
  genre: "Жанры",
  notes: "Конспекты",
  read: "Списки чтения",
  wishlist: "Хочу прочитать",
};
export const logical = (slug: string) => slug.replace(/^knowledge\//, "");
export function label(path: string): string {
  const last = path.split("/").at(-1) || "";
  const unit = /^unit-(\d+)$/.exec(last);
  return !last
    ? "Библиотека"
    : levels[last] ||
        names[last] ||
        (unit ? `Урок ${unit[1]}` : last.replaceAll("-", " "));
}
export function subject(slug: string) {
  const parts = logical(slug).split("/");
  return parts.length === 1
    ? "overview"
    : ["languages", "programming", "philosophy", "practices"].includes(
          parts[0],
        ) &&
        parts.length > 2 &&
        !levels[parts[1]]
      ? parts.slice(0, 2).join(" / ")
      : parts[0];
}
export const categoryLabel = (category: string) =>
  label(category.replaceAll(" / ", "/"));
export const docUrl = (slug: string) =>
  "/doc/" + slug.split("/").map(encodeURIComponent).join("/");
export const folderUrl = (folder: string) =>
  folder ? "/?" + new URLSearchParams({ folder }) : "/";
export interface Note {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  relativePath: string;
  data: Record<string, unknown>;
  toc: { level: number; text: string; id: string }[];
  html: string;
  readingTime: number;
  modified: number;
  collection: string;
  excerpt: string;
  searchText: string;
  searchFolded: string;
  links: string[];
  catalogFolder: string;
  catalogLevel: string;
  legacySlugs: string[];
  isContents: boolean;
}
export function order(a: Note, b: Note) {
  const rank = (n: Note) => {
    const p = logical(n.slug);
    return [
      Number(/\/unit-(\d+)\//.exec(p)?.[1] || 0),
      (
        {
          _contents: 0,
          overview: 1,
          dialogue: 2,
          core: 3,
          syntax: 3,
          usage: 4,
          words: 5,
          exercises: 6,
          practice: 6,
          reading: 7,
          test: 8,
        } as Record<string, number>
      )[p.split("/").at(-1)!] ?? 20,
    ];
  };
  const x = rank(a),
    y = rank(b);
  return (
    x[0] - y[0] ||
    x[1] - y[1] ||
    a.title.localeCompare(b.title, "ru") ||
    a.slug.localeCompare(b.slug)
  );
}
export interface Folder {
  path: string;
  label: string;
  children: string[];
  files: { doc: Note; variants: Note[] }[];
  contents: Note[];
  count: number;
}
export function treeFor(docs: Note[]) {
  const tree = new Map<string, Folder>();
  const counts = new Map<string, Set<string>>();
  const make = (p: string) => {
    if (!tree.has(p)) {
      tree.set(p, {
        path: p,
        label: label(p),
        children: [],
        files: [],
        contents: [],
        count: 0,
      });
      counts.set(p, new Set());
    }
    return tree.get(p)!;
  };
  make("");
  const variants = new Map<string, Note[]>();
  for (const d of docs) {
    const key = logical(d.slug);
    variants.set(key, [...(variants.get(key) || []), d]);
  }
  for (const [key, copies] of variants) {
    copies.sort(
      (a, b) =>
        Number(a.slug.startsWith("knowledge/")) -
        Number(b.slug.startsWith("knowledge/")),
    );
    const parts = key.split("/").slice(0, -1);
    let parent = "";
    for (const part of parts) {
      const p = [parent, part].filter(Boolean).join("/");
      make(p);
      if (!make(parent).children.includes(p)) make(parent).children.push(p);
      parent = p;
    }
    if (copies[0].isContents) make(parent).contents = copies;
    else {
      make(parent).files.push({ doc: copies[0], variants: copies.slice(1) });
      for (let i = 0; i <= parts.length; i++)
        counts.get(parts.slice(0, i).join("/"))!.add(key);
    }
  }
  const rank = (p: string) =>
    p.split("/").at(-1) === "reference"
      ? 99
      : Object.keys(levels).indexOf(p.split("/").at(-1)!) < 0
        ? 20
        : Object.keys(levels).indexOf(p.split("/").at(-1)!);
  for (const node of tree.values()) {
    node.count = counts.get(node.path)!.size;
    node.children.sort(
      (a, b) => rank(a) - rank(b) || label(a).localeCompare(label(b), "ru"),
    );
    node.files.sort((a, b) => order(a.doc, b.doc));
  }
  return tree;
}
