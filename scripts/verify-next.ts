import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import { getDocs, legacy, renderMarkdown, search } from "../lib/knowledge";
import { treeFor } from "../lib/catalog";
const docs = getDocs();
const bySlug = new Map(docs.map((d) => [d.slug, d]));
const ids = new Map<string, Set<string>>();
const errors: string[] = [];
const diskCount = (dir: string): number =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .reduce(
      (n, e) =>
        n +
        (e.isDirectory()
          ? diskCount(path.join(dir, e.name))
          : Number(e.name.endsWith(".md"))),
      0,
    );
assert.equal(docs.length, diskCount("knowledge"));
assert.equal(docs.length, 1348);
for (const doc of docs) {
  const $ = load(doc.html);
  const found = $("[id]")
    .map((_, el) => $(el).attr("id")!)
    .get();
  if (new Set(found).size !== found.length)
    errors.push(`duplicate IDs: ${doc.slug}`);
  ids.set(doc.slug, new Set(found));
  assert(doc.title);
  assert(
    !/href=["'][^"']*\.md(?:[#?][^"']*)?["']/.test(doc.html),
    `raw Markdown href: ${doc.slug}`,
  );
}
for (const doc of docs) {
  const $ = load(doc.html);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")!;
    if (!href.startsWith("/doc/") && !href.startsWith("#")) return;
    const [target, fragment] = href.startsWith("#")
      ? [doc.slug, href.slice(1)]
      : href.slice(5).split("#");
    const slug = decodeURIComponent(target.split("?")[0]);
    if (!bySlug.has(slug)) errors.push(`missing target ${doc.slug} -> ${href}`);
    else if (fragment && !ids.get(slug)!.has(decodeURIComponent(fragment)))
      errors.push(`missing anchor ${doc.slug} -> ${href}`);
  });
}
for (const target of Object.values(legacy)) assert(bySlug.has(target));
const tree = treeFor(docs);
assert(tree.get("languages/english/a1"));
assert(
  tree.get("languages/english")!.children.includes("languages/english/a1"),
);
assert(tree.get("languages/english/a1/unit-01")!.files.length > 0);
for (const language of ["python", "javascript", "go", "rust"]) {
  for (const [level, unit] of [
    ["foundation", "01"],
    ["practice", "02"],
    ["advanced", "03"],
  ]) {
    const materials = tree
      .get(`programming/${language}/${level}/unit-${unit}`)!
      .files.map((entry) => entry.doc.slug);
    const theory = materials.findIndex((slug) => slug.endsWith("/syntax"));
    const practice = materials.findIndex((slug) => slug.endsWith("/practice"));
    assert(
      theory >= 0 && practice > theory,
      `explanation must precede practice: ${language}/${unit}`,
    );
  }
}
const fixture = renderMarkdown(
  "# Title\n\n```python\n# comment\n```\n\n## Same\n\n## Same\n\n[link](../other.md#same)",
  "folder/note",
);
assert.deepEqual(
  fixture.toc.map((h) => h.id),
  ["same", "same-1"],
);
assert(fixture.html.includes("/doc/other#same"));
assert(search("grammar", "all").total > 0);
assert.equal(search("xyznonexistent928731", "all").total, 0);
fs.writeFileSync(
  "next-verification.json",
  JSON.stringify(
    {
      documents: docs.length,
      legacyPaths: Object.keys(legacy).length,
      folders: tree.size,
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) {
  console.error(
    `${errors.length} integrity errors; see next-verification.json`,
  );
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${docs.length} documents, ${Object.keys(legacy).length} legacy targets, Markdown links, fragments, IDs, hierarchy and search.`,
  );
