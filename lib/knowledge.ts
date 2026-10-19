import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { load } from "cheerio";
import manifest from "../legacy_paths.json";
import { categoryLabel, logical, subject, levels, type Note } from "./catalog";
export const legacy: Record<string, string> = manifest.paths;
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/[\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: false,
  highlight(code, lang): string {
    try {
      return (
        '<div class="highlight"><pre><code class="hljs">' +
        (lang && hljs.getLanguage(lang)
          ? hljs.highlight(code, { language: lang }).value
          : md.utils.escapeHtml(code)) +
        "</code></pre></div>"
      );
    } catch {
      return "";
    }
  },
});
export function renderMarkdown(content: string, slug: string) {
  let first = false;
  const toc: Note["toc"] = [];
  const used = new Map<string, number>();
  const tokens = md.parse(content, {});
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    const level = Number(token.tag.slice(1));
    const inline = tokens[i + 1];
    if (level === 1 && !first) {
      first = true;
      tokens.splice(i, 3);
      i--;
      continue;
    }
    const text = inline.content;
    const base = slugify(text);
    const n = used.get(base) || 0;
    used.set(base, n + 1);
    const id = base + (n ? "-" + n : "");
    token.attrSet("id", id);
    if (level <= 3) toc.push({ level, text, id });
  }
  const html = md.renderer.render(tokens, md.options, {});
  const $ = load(html, null, false);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")!;
    if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) return;
    const m = /^([^?#]+\.md)([?#].*)?$/.exec(href);
    if (m) {
      let target = path.posix
        .normalize(
          path.posix.join(path.posix.dirname(slug), decodeURIComponent(m[1])),
        )
        .slice(0, -3);
      $(el).attr(
        "href",
        "/doc/" +
          target.split("/").map(encodeURIComponent).join("/") +
          (m[2] || ""),
      );
    }
  });
  return { html: $.html(), toc };
}
const root = path.join(process.cwd(), "knowledge");
const cached = new Map<string, { stamp: string; doc: Note }>();
let lastScan = 0;
let docs: Note[] = [];
function files(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : e.name.endsWith(".md")
          ? [path.join(dir, e.name)]
          : [],
    );
}
export function getDocs(): Note[] {
  if (docs.length && Date.now() - lastScan < 1500) return docs;
  const next: Note[] = [];
  const alive = new Set<string>();
  for (const file of files(root)) {
    alive.add(file);
    const stat = fs.statSync(file);
    const stamp = stat.mtimeMs + ":" + stat.size;
    const old = cached.get(file);
    if (old?.stamp === stamp) {
      next.push(old.doc);
      continue;
    }
    const slug = path.relative(root, file).replaceAll("\\", "/").slice(0, -3);
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    let parsed: { data: Record<string, unknown>; content: string };
    try {
      parsed = matter(raw);
    } catch {
      parsed = { data: {}, content: raw };
    }
    const { html, toc } = renderMarkdown(parsed.content, slug);
    const $ = load(html);
    const full = load(html);
    $("script,style,pre").remove();
    const searchable = $.root().text().replace(/\s+/g, " ").trim();
    const category = subject(slug);
    const key = logical(slug);
    const doc: Note = {
      slug,
      title: String(
        parsed.data.title ||
          /^#\s+(.+)$/m.exec(parsed.content)?.[1] ||
          path.basename(slug).replaceAll("-", " "),
      ),
      category,
      categoryLabel: categoryLabel(category),
      relativePath: slug + ".md",
      data: parsed.data,
      toc,
      html,
      readingTime: Math.max(
        1,
        Math.round(parsed.content.split(/\s+/).length / 200),
      ),
      modified: stat.mtimeMs,
      collection: slug.startsWith("knowledge/")
        ? "Дополнительное хранилище"
        : "Основная библиотека",
      excerpt: searchable.slice(0, 180),
      searchText: searchable,
      searchFolded: searchable.toLowerCase(),
      links: full('a[href^="/doc/"]')
        .map((_, e) =>
          decodeURIComponent(full(e).attr("href")!.slice(5).split(/[?#]/)[0]),
        )
        .get(),
      catalogFolder: key.includes("/")
        ? key.slice(0, key.lastIndexOf("/"))
        : "",
      catalogLevel:
        key
          .split("/")
          .slice(0, -1)
          .find((p) => levels[p]) || "",
      legacySlugs: Object.entries(legacy)
        .filter(([, v]) => v === slug)
        .map(([k]) => k),
      isContents: key.split("/").at(-1) === "_contents",
    };
    cached.set(file, { stamp, doc });
    next.push(doc);
  }
  for (const key of cached.keys()) if (!alive.has(key)) cached.delete(key);
  docs = next;
  lastScan = Date.now();
  return docs;
}
export function search(query: string, domain: string) {
  const q = query.slice(0, 200).trim().toLowerCase();
  const words = [...new Set(q.split(/\s+/).filter(Boolean))];
  const found = getDocs()
    .flatMap((doc) => {
      const family = doc.category.split(" / ")[0];
      if (
        domain !== "all" &&
        (domain === "other"
          ? ["languages", "mnemonics", "programming"].includes(family)
          : family !== domain)
      )
        return [];
      const meta =
        `${doc.title} ${doc.slug} ${doc.category} ${doc.categoryLabel}`.toLowerCase();
      if (!words.every((w) => meta.includes(w) || doc.searchFolded.includes(w)))
        return [];
      return [
        {
          doc,
          score:
            (q === doc.title.toLowerCase() ? 100 : 0) +
            words.reduce(
              (n, w) =>
                n +
                (doc.title.toLowerCase().includes(w)
                  ? 10
                  : meta.includes(w)
                    ? 2
                    : 0),
              0,
            ),
        },
      ];
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.doc.title.localeCompare(b.doc.title, "ru") ||
        a.doc.slug.localeCompare(b.doc.slug),
    );
  return {
    total: found.length,
    results: found.slice(0, 40).map(({ doc }) => {
      const at = words.length
        ? Math.min(
            ...words
              .map((w) => doc.searchFolded.indexOf(w))
              .filter((n) => n >= 0),
          )
        : 0;
      const start = Number.isFinite(at) ? Math.max(0, at - 65) : 0;
      return {
        title: doc.title,
        slug: doc.slug,
        categoryLabel: doc.categoryLabel,
        snippet:
          (start ? "…" : "") +
          doc.searchText.slice(start, start + 230) +
          (doc.searchText.length > start + 230 ? "…" : ""),
      };
    }),
  };
}
export function related(current: Note, docs: Note[]) {
  const seen = new Set<string>();
  return docs
    .filter(
      (d) =>
        d.slug !== current.slug &&
        d.title.toLowerCase() !== current.title.toLowerCase(),
    )
    .map((doc) => {
      const out = current.links.includes(doc.slug),
        back = doc.links.includes(current.slug),
        near =
          doc.slug.slice(0, doc.slug.lastIndexOf("/")) ===
          current.slug.slice(0, current.slug.lastIndexOf("/")),
        same = doc.category === current.category;
      return {
        doc,
        score:
          Number(out) * 100 +
          Number(back) * 80 +
          Number(near) * 20 +
          Number(same) * 5 +
          Number(doc.collection === current.collection),
        reason: out
          ? "Ссылка из этой заметки"
          : back
            ? "Ссылается на эту заметку"
            : near
              ? "Рядом в разделе"
              : "Из этой коллекции",
        include: out || back || same,
      };
    })
    .filter((d) => d.include)
    .sort(
      (a, b) =>
        b.score - a.score || a.doc.title.localeCompare(b.doc.title, "ru"),
    )
    .filter(({ doc }) => {
      const k = doc.title.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 4);
}
