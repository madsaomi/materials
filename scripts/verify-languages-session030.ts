import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { getDocs, renderMarkdown } from "../lib/knowledge";

const backup = "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session030";
function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? markdownFiles(path.join(dir, entry.name)) : entry.name.endsWith(".md") ? [path.join(dir, entry.name)] : []);
}
const docs = new Map(getDocs().map(doc => [doc.slug, doc]));
const stats: Record<string, { notes: number; oldIds: number; currentInternalLinks: number; closedDetails: number }> = {};
const changed = new Set<string>();
for (const section of ["english", "japanese", "korean", "chinese", "navigation"]) {
  const root = path.join(backup, section);
  const result = { notes: 0, oldIds: 0, currentInternalLinks: 0, closedDetails: 0 };
  for (const file of markdownFiles(root)) {
    const slug = path.relative(root, file).replaceAll("\\", "/").slice(0, -3);
    assert(!changed.has(slug), `Repeated backup note: ${slug}`);
    changed.add(slug);
    const doc = docs.get(slug);
    assert(doc, `Current note missing: ${slug}`);
    const raw = fs.readFileSync(path.join("knowledge", slug + ".md"), "utf8");
    const beforeRaw = fs.readFileSync(file, "utf8");
    assert.notEqual(raw, beforeRaw, `Backup without change: ${slug}`);
    assert(!slug.includes("/vocabulary/"), `Vocabulary restoration outside this batch: ${slug}`);
    const before = load(renderMarkdown(matter(beforeRaw).content, slug).html);
    const current = load(doc.html);
    const idList = current("[id]").map((_, e) => current(e).attr("id")!).get();
    const idSet = new Set(idList);
    assert.equal(idList.length, idSet.size, `Duplicate IDs: ${slug}`);
    for (const id of before("[id]").map((_, e) => before(e).attr("id")!).get()) {
      assert(idSet.has(id), `Lost ID: ${slug}#${id}`);
      result.oldIds++;
    }
    const beforeLinks = before('a[href^="/doc/"],a[href^="#"]').map((_, e) => before(e).attr("href")!).get();
    const currentLinks = current('a[href^="/doc/"],a[href^="#"]').map((_, e) => current(e).attr("href")!).get();
    const linkSet = new Set(currentLinks);
    for (const href of beforeLinks) assert(linkSet.has(href), `Lost original internal link: ${slug} -> ${href}`);
    result.currentInternalLinks += currentLinks.length;
    assert.equal(current("details[open]").length, 0, `Solutions open by default: ${slug}`);
    assert.equal((raw.match(/<details(?:\s[^>]*)?>/g) || []).length, (raw.match(/<\/details>/g) || []).length, `Unbalanced details: ${slug}`);
    result.closedDetails += current("details").length;
    if (/\/(?:reading|practice\/exercises)$/.test(slug)) assert(current("details").length >= 2, `Missing hidden answers: ${slug}`);
    if (section === "navigation") assert.equal(matter(raw).data.editorial, "manual");
    result.notes++;
  }
  stats[section] = result;
}
for (const prefix of ["", "knowledge/"]) for (const language of ["english", "japanese", "korean", "chinese"]) for (let n = 6; n <= 10; n++) for (const type of ["reading", "practice/exercises"]) {
  assert(changed.has(`${prefix}languages/${language}/a2/unit-${String(n).padStart(2, "0")}/${type}`), "Missing expected reading/practice");
}
const expected = { english: 30, japanese: 34, korean: 30, chinese: 30, navigation: 16 };
for (const [section, count] of Object.entries(expected)) assert.equal(stats[section].notes, count);
const totals = Object.values(stats).reduce((a, b) => ({ notes: a.notes + b.notes, oldIds: a.oldIds + b.oldIds, currentInternalLinks: a.currentInternalLinks + b.currentInternalLinks, closedDetails: a.closedDetails + b.closedDetails }), { notes: 0, oldIds: 0, currentInternalLinks: 0, closedDetails: 0 });
const report = { session: 30, date: "2026-10-18", documents: docs.size, logicalUnits: 20, retainedEditions: 2, notesBySection: stats, totals, files: [...changed].sort(), unfinishedChineseVocabularyNotInScope: 1636 };
fs.writeFileSync("languages-session030-verification.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ status: "PASS", ...totals, notesBySection: stats }));
