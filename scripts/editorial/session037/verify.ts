/** Verify in-place grammar-bank edits against the snapshot taken after Session036. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { load } from "cheerio";
import { getDocs, renderMarkdown } from "../../../lib/knowledge";

const backup = process.argv[2];
assert(
  backup && path.isAbsolute(backup),
  "Pass the absolute Session037 snapshot directory",
);
const baseline = JSON.parse(
  fs.readFileSync(path.join(backup, "manifest.json"), "utf8"),
) as {
  targets: string[];
  hashes: Record<string, string>;
};
assert.equal(baseline.targets.length, 60);
const allowed = new Set(baseline.targets);
const docs = new Map(getDocs().map((doc) => [doc.slug, doc]));
assert.equal(docs.size, 1348);
assert.deepEqual(
  [...docs.keys()].sort(),
  Object.keys(baseline.hashes)
    .map((file) => file.slice(0, -3))
    .sort(),
);
const changed: string[] = [];
const stats: Record<
  string,
  { notes: number; previousIds: number; internalLinks: number }
> = {};
let unchanged = 0;
const boundaries: Record<string, { core: string; usage: string }> = {
  english: {
    core: "## Сохранённые справочные материалы",
    usage:
      "<details>\n<summary>Сохранённые примеры и дополнительные пояснения прежней версии",
  },
  japanese: {
    core: "<details>\n<summary>Дополнительный материал прежней версии",
    usage: "<details>\n<summary>Дополнительный материал прежней версии",
  },
  korean: {
    core: "## Расширенный справочник урока",
    usage:
      "<details>\n<summary>Прежний разбор и дополнительные пояснения этой версии",
  },
};

function teachingEntry(source: string, language: string, slug: string): string {
  const normalized = source.replaceAll("\r\n", "\n");
  const marker =
    boundaries[language][slug.endsWith("/core") ? "core" : "usage"];
  const boundary = normalized.indexOf(marker);
  assert(boundary >= 0, `Missing retained-bank boundary: ${slug}`);
  return normalized.slice(0, boundary);
}

for (const [file, hash] of Object.entries(baseline.hashes)) {
  const slug = file.slice(0, -3);
  const bytes = fs.readFileSync(path.join("knowledge", file));
  if (createHash("sha256").update(bytes).digest("hex") === hash) {
    unchanged++;
    continue;
  }
  assert(allowed.has(slug), `Outside A1 grammar scope: ${file}`);
  const language = /languages\/(english|japanese|korean)\//.exec(slug)![1];
  const result = (stats[language] ||= {
    notes: 0,
    previousIds: 0,
    internalLinks: 0,
  });
  const beforeRaw = fs.readFileSync(path.join(backup, file), "utf8");
  const currentRaw = bytes.toString("utf8");
  assert.equal(
    teachingEntry(currentRaw, language, slug),
    teachingEntry(beforeRaw, language, slug),
    `Session036 teaching entry changed: ${slug}`,
  );
  assert.deepEqual(
    matter(currentRaw).data,
    matter(beforeRaw).data,
    `Metadata changed: ${slug}`,
  );
  const before = load(renderMarkdown(matter(beforeRaw).content, slug).html);
  const current = load(docs.get(slug)!.html);
  const oldIds = before("[id]")
    .map((_, element) => before(element).attr("id")!)
    .get();
  const currentIds = current("[id]")
    .map((_, element) => current(element).attr("id")!)
    .get();
  const idSet = new Set(currentIds);
  assert.equal(idSet.size, currentIds.length, `Repeated ID: ${slug}`);
  for (const id of oldIds) assert(idSet.has(id), `Lost ID: ${slug}#${id}`);
  const beforeLinks = before('a[href^="/doc/"],a[href^="#"]')
    .map((_, element) => before(element).attr("href")!)
    .get();
  const currentLinks = current('a[href^="/doc/"],a[href^="#"]')
    .map((_, element) => current(element).attr("href")!)
    .get();
  const hrefSet = new Set(currentLinks);
  for (const href of beforeLinks)
    assert(hrefSet.has(href), `Lost internal link: ${slug} -> ${href}`);
  assert.equal(
    current("details[open]").length,
    0,
    `Answers open by default: ${slug}`,
  );
  assert.equal(
    (currentRaw.match(/<details(?:\s[^>]*)?>/g) || []).length,
    (currentRaw.match(/<\/details>/g) || []).length,
    `Unbalanced details: ${slug}`,
  );
  changed.push(slug);
  result.notes++;
  result.previousIds += oldIds.length;
  result.internalLinks += currentLinks.length;
}
assert(changed.length > 0, "No grammar improvement found");
for (const language of ["english", "japanese", "korean"])
  assert(stats[language]?.notes > 0, `No grammar improvement in ${language}`);
assert.equal(changed.length + unchanged, 1348);
const report = {
  session: 37,
  date: "2026-10-25",
  status: "PASS",
  documents: docs.size,
  candidateFiles: allowed.size,
  changedFiles: changed.length,
  unchangedMarkdown: unchanged,
  notesByLanguage: stats,
  files: changed.sort(),
  session036TeachingEntries:
    "Unchanged (line endings normalized for comparison)",
  limits:
    "Structural preservation and exact edit scope; grammar correctness is separately source-checked and peer-reviewed. No comprehensive phonetic/audio/cultural audit.",
};
fs.mkdirSync("reports/session037", { recursive: true });
fs.writeFileSync(
  "reports/session037/verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report));
