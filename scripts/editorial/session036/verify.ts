/** Preserve both vaults and the grammar-only scope against immutable before-images. */
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
  "Pass the absolute Session036 backup directory",
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(backup, "manifest.json"), "utf8"),
) as {
  targets: string[];
  hashes: Record<string, string>;
};
assert.equal(manifest.targets.length, 180);
const targets = new Set(manifest.targets);
assert.equal(targets.size, 180);
const docs = new Map(getDocs().map((doc) => [doc.slug, doc]));
assert.equal(docs.size, 1348);
assert.deepEqual(
  [...docs.keys()].sort(),
  Object.keys(manifest.hashes)
    .map((file) => file.slice(0, -3))
    .sort(),
);

const stats: Record<
  string,
  {
    notes: number;
    previousIds: number;
    internalLinks: number;
    closedDetails: number;
  }
> = {};
let untouched = 0;
for (const [file, hash] of Object.entries(manifest.hashes)) {
  const slug = file.slice(0, -3);
  const bytes = fs.readFileSync(path.join("knowledge", file));
  if (!targets.has(slug)) {
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      hash,
      `Outside grammar scope changed: ${file}`,
    );
    untouched++;
    continue;
  }
  assert(
    /^(?:knowledge\/)?languages\/(english|japanese|korean)\/(a1|a2|b1)\/unit-(0[1-9]|1[0-5])\/grammar\/(core|usage)$/.test(
      slug,
    ),
    `Unexpected grammar path: ${slug}`,
  );
  const language = /languages\/(english|japanese|korean)\//.exec(slug)![1];
  const result = (stats[language] ||= {
    notes: 0,
    previousIds: 0,
    internalLinks: 0,
    closedDetails: 0,
  });
  const original = fs.readFileSync(path.join(backup, file), "utf8");
  const source = bytes.toString("utf8");
  assert.notEqual(source, original, `Grammar note not improved: ${slug}`);
  assert.deepEqual(
    matter(source).data,
    matter(original).data,
    `Frontmatter changed: ${slug}`,
  );
  const before = load(renderMarkdown(matter(original).content, slug).html);
  const current = load(docs.get(slug)!.html);
  const oldIds = before("[id]")
    .map((_, element) => before(element).attr("id")!)
    .get();
  const ids = current("[id]")
    .map((_, element) => current(element).attr("id")!)
    .get();
  const idSet = new Set(ids);
  assert.equal(ids.length, idSet.size, `Duplicate heading/alias ID: ${slug}`);
  for (const id of oldIds)
    assert(idSet.has(id), `Lost old anchor: ${slug}#${id}`);
  const oldLinks = before('a[href^="/doc/"],a[href^="#"]')
    .map((_, element) => before(element).attr("href")!)
    .get();
  const currentLinks = current('a[href^="/doc/"],a[href^="#"]')
    .map((_, element) => current(element).attr("href")!)
    .get();
  const linkSet = new Set(currentLinks);
  for (const href of oldLinks)
    assert(linkSet.has(href), `Lost internal link: ${slug} -> ${href}`);
  assert.equal(
    current("details[open]").length,
    0,
    `Answers open by default: ${slug}`,
  );
  assert.equal(
    (source.match(/<details(?:\s[^>]*)?>/g) || []).length,
    (source.match(/<\/details>/g) || []).length,
    `Unbalanced disclosures: ${slug}`,
  );
  if (slug.endsWith("/usage"))
    assert(
      current("details").length >= 1,
      `No separate explained grammar answers: ${slug}`,
    );
  result.notes++;
  result.previousIds += oldIds.length;
  result.internalLinks += currentLinks.length;
  result.closedDetails += current("details").length;
}
assert.equal(untouched, 1168);
for (const language of ["english", "japanese", "korean"])
  assert.equal(stats[language].notes, 60);
const totals = Object.values(stats).reduce(
  (sum, entry) => ({
    notes: sum.notes + entry.notes,
    previousIds: sum.previousIds + entry.previousIds,
    internalLinks: sum.internalLinks + entry.internalLinks,
    closedDetails: sum.closedDetails + entry.closedDetails,
  }),
  { notes: 0, previousIds: 0, internalLinks: 0, closedDetails: 0 },
);
const report = {
  session: 36,
  date: "2026-10-25",
  status: "PASS",
  documents: docs.size,
  logicalUnits: 45,
  grammarPagesPerEdition: 90,
  retainedEditions: 2,
  untouchedNotes: untouched,
  notesByLanguage: stats,
  totals,
  files: [...targets].sort(),
  limits:
    "Structural preservation and scope audit; teaching accuracy is separately source-checked and peer-reviewed. Retained long banks are not claimed exhaustively verified.",
};
fs.mkdirSync("reports/session036", { recursive: true });
fs.writeFileSync(
  "reports/session036/verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    status: "PASS",
    ...totals,
    untouchedNotes: untouched,
    notesByLanguage: stats,
  }),
);
