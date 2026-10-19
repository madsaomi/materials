import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { getDocs, renderMarkdown } from "../../../lib/knowledge";

const backup = "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session033";
function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? markdownFiles(path.join(dir, entry.name)) : entry.name.endsWith(".md") ? [path.join(dir, entry.name)] : []);
}
fs.mkdirSync("reports/session033", {recursive:true});
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
    assert(section === "navigation" || new RegExp("/a1/unit-0[1-5]/(?:vocabulary/words|dialogue|test)$").test(slug), "Unexpected scope: "+slug);
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
    if (section !== "navigation") assert(current("details").length >= 2, `Missing hidden answers: ${slug}`);
    if (section === "navigation") assert.equal(matter(raw).data.editorial, "manual");
    result.notes++;
  }
  stats[section] = result;
}
for (const prefix of ["", "knowledge/"]) for (const language of ["english", "japanese", "korean", "chinese"]) for (let n = 1; n <= 5; n++) for (const type of ["vocabulary/words", "dialogue", "test"]) {
  assert(changed.has(`${prefix}languages/${language}/a1/unit-${String(n).padStart(2, "0")}/${type}`), "Missing expected vocabulary/dialogue/test");
}
const expected = { english: 30, japanese:30, korean:30, chinese:30, navigation:16 };
for (const [section, count] of Object.entries(expected)) assert.equal(stats[section].notes, count);
const totals = Object.values(stats).reduce((a, b) => ({ notes: a.notes + b.notes, oldIds: a.oldIds + b.oldIds, currentInternalLinks: a.currentInternalLinks + b.currentInternalLinks, closedDetails: a.closedDetails + b.closedDetails }), { notes: 0, oldIds: 0, currentInternalLinks: 0, closedDetails: 0 });
const report = { session: 33, date: "2026-10-19", documents: docs.size, logicalTeachingSets: 20, activeEntries: 200, dialogues: 20, selfChecks: 20, retainedEditions: 2, notesBySection: stats, totals, files: [...changed].sort(), unfinishedChineseVocabularyNotInScope: 1636 };
fs.writeFileSync("reports/session033/verification.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ status: "PASS", ...totals, notesBySection: stats }));
