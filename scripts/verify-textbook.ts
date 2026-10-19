import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { getDocs, renderMarkdown } from "../lib/knowledge";
import { lessons } from "./lesson-content";
const backup = process.argv[2];
assert(backup && path.isAbsolute(backup));
const docs = getDocs();
const bySlug = new Map(docs.map((d) => [d.slug, d]));
let overviews = 0,
  usages = 0,
  answersChecked = 0,
  headingAliases = 0;
for (const [lang, units] of Object.entries(lessons))
  for (let n = 1; n <= 15; n++)
    for (const mirror of [false, true]) {
      const prefix = (mirror ? "knowledge/" : "") + "languages/" + lang + "/";
      const overview = docs.find(
        (d) =>
          d.slug.startsWith(prefix) &&
          d.slug.endsWith(`/unit-${String(n).padStart(2, "0")}/overview`),
      )!;
      assert(overview);
      const $ = load(overview.html);
      assert($.text().includes(units[n - 1][3]));
      assert($.text().includes(units[n - 1][4]));
      assert($("details").length > 0);
      assert($("details[open]").length === 0);
      overviews++;
      const usage = bySlug.get(
        overview.slug.replace(/overview$/, "grammar/usage"),
      )!;
      const u = load(usage.html);
      assert(u.text().includes(units[n - 1][1]));
      assert(u.text().includes(units[n - 1][4]));
      assert(u("details").length > 0);
      usages++;
    }
function files(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : e.name.endsWith(".md")
          ? [path.join(dir, e.name)]
          : [],
    );
}
let changed = 0;
const missingAnswers: string[] = [];
for (const file of files(backup)) {
  const slug = path.relative(backup, file).replaceAll("\\", "/").slice(0, -3);
  const current = bySlug.get(slug)!;
  assert(current, `lost note ${slug}`);
  changed++;
  const before = matter(fs.readFileSync(file, "utf8")).content;
  const old = load(renderMarkdown(before, slug).html),
    now = load(current.html);
  const ids = new Set(
    now("[id]")
      .map((_, e) => now(e).attr("id"))
      .get(),
  );
  for (const id of old("[id]")
    .map((_, e) => old(e).attr("id"))
    .get()) {
    assert(ids.has(id), `lost reading anchor ${slug}#${id}`);
    headingAliases++;
  }
  if (/\/unit-\d+\/(?:practice\/exercises|test)$/.test(slug))
    for (const match of before.matchAll(/^\s*\d+[.)]\s+.+?\s+→\s+(.+)$/gm)) {
      const value = match[0].includes("*(")
        ? match[1].trim().replace(/\)\*$/, "")
        : match[1].trim();
      if (value.includes("___") || /^[_\.\s]+$/.test(value)) continue;
      answersChecked++;
      const plain = load(renderMarkdown(value.replace(/[\*_]+$/g, ""), "").html)
        .text()
        .replace(/\s+/g, " ")
        .trim();
      if (!now.text().replace(/\s+/g, " ").includes(plain))
        missingAnswers.push(slug + ": " + value);
    }
  const opens = (current.html.match(/<details(?:\s[^>]*)?>/g) || []).length,
    closes = (current.html.match(/<\/details>/g) || []).length;
  assert.equal(opens, closes, `unbalanced disclosures ${slug}`);
}
assert.equal(overviews, 120);
assert.equal(usages, 120);
fs.writeFileSync(
  path.join(backup, "answer-review.json"),
  JSON.stringify(missingAnswers, null, 2),
);
assert.equal(missingAnswers.length, 0, "lost answer strings; inspect report");
for (const slug of ["overview/_contents", "knowledge/overview/_contents"])
  assert.equal(bySlug.get(slug)!.data.editorial, "manual");
assert(
  !docs.some((d) =>
    d.html.includes(
      "Master core grammatical structures and patterns introduced in this unit.",
    ),
  ),
);
assert(!docs.some((d) => d.html.includes("Common Usage Patterns")));
const result = {
  changedFiles: changed,
  overviews,
  usages,
  originalHeadingIdsRetained: headingAliases,
  originalArrowAnswersChecked: answersChecked,
  missingAnswers,
  notes: docs.length,
};
fs.writeFileSync("textbook-verification.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));

