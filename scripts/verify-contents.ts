/** Focused, read-only verification of the Node contents maintenance tool. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../lib/knowledge";
import {
  applyContents,
  contentsNotes,
  planContents,
  readMarkdownFiles,
  renderContents,
  refreshContents,
  type MarkdownFile,
} from "./refresh-contents";

function linkTargets(source: string, slug: string): string[] {
  const $ = load(renderMarkdown(matter(source).content, slug).html);
  return $("a[href]")
    .map((_, element) => $(element).attr("href")!)
    .get();
}

function headingIds(source: string, slug: string): string[] {
  const $ = load(renderMarkdown(matter(source).content, slug).html);
  return $("[id]")
    .map((_, element) => $(element).attr("id")!)
    .get();
}

const manual =
  "\uFEFF---\r\n# Preserve comments and quoting too\r\neditorial: 'manual'\r\ncustom: [a, b]\r\n---\r\n# Авторский маршрут\r\n\r\nНе заменять.\r\n";
const metadata =
  "\uFEFF---\r\n# Keep this formatting\r\ntitle: 'My contents'\r\ncustom:\r\n  source: legacy\r\n---\r\n";
const files: MarkdownFile[] = [
  { slug: "languages/english/_contents", source: manual },
  {
    slug: "languages/english/a1/_contents",
    source:
      '# Old A1\n\n## Retired group\n\n## Retired group\n\n<span id="legacy&amp;&quot;" aria-hidden="true"></span>\n',
  },
  { slug: "knowledge/languages/english/a1/_contents", source: "# Mirror\n" },
  {
    slug: "programming/python/foundation/_contents",
    source: metadata + "# Old\r\n",
  },
  {
    slug: "programming/python/foundation/unit-01/practice",
    source: "# AAA practice\n",
  },
  {
    slug: "programming/python/foundation/unit-01/syntax",
    source: "# ZZZ syntax\n",
  },
  { slug: "languages/english/a1/unit-02/test", source: "# Test\n" },
  { slug: "languages/english/a1/unit-01/reading", source: "# Reading\n" },
  { slug: "languages/english/a1/unit-01/grammar/core", source: "# Grammar\n" },
  { slug: "languages/english/a1/unit-01/overview", source: "# Overview\n" },
  {
    slug: "languages/english/a1/reference/one",
    source: "---\ntitle: 'Metadata [title]'\n---\n# Different heading\n",
  },
  {
    slug: "knowledge/languages/english/a1/unit-01/reading",
    source: "# Mirror reading\n",
  },
  {
    slug: "knowledge/languages/english/a1/unit-01/overview",
    source: "# Mirror overview\n",
  },
  {
    slug: "languages/english/a10/unit-01/reading",
    source: "# Wrong subtree\n",
  },
  { slug: "languages/english/a1/.private/secret", source: "# Hidden\n" },
  { slug: ".private/_contents", source: "# Hidden contents\n" },
  { slug: "languages/english/a1/.draft", source: "# Hidden note\n" },
];

const notes = contentsNotes(files);
assert(!notes.some((note) => note.slug.includes("_contents")));
assert(
  !notes.some(
    (note) => note.slug.includes(".private") || note.slug.includes(".draft"),
  ),
);
assert.equal(
  notes.find((note) => note.slug.endsWith("/reference/one"))!.title,
  "Metadata [title]",
);
const plan = planContents(files);
assert.equal(plan.length, 4, "plan only existing visible contents pages");
assert.equal(
  plan.find((entry) => entry.manual)!.output,
  manual,
  "manual byte preservation",
);
assert.equal(plan.find((entry) => entry.manual)!.changed, false);

const primary = plan.find(
  (entry) => entry.slug === "languages/english/a1/_contents",
)!.output;
assert(primary.includes("Основная библиотека"));
assert(primary.includes("## Урок 01\n"));
assert(
  primary.includes("(unit-01/grammar/core.md)"),
  "nested relative grammar path",
);
assert(primary.includes("[Обзор урока](unit-01/overview.md)"));
assert(primary.includes("[Metadata title](reference/one.md)"));
assert(
  !primary.includes("Wrong subtree") && !primary.includes("Mirror reading"),
);
assert(
  !primary.includes("(_contents.md)"),
  "contents pages are not indexed as notes",
);
assert(
  primary.indexOf("unit-01/overview.md") <
    primary.indexOf("unit-01/grammar/core.md"),
);
assert(
  primary.indexOf("unit-01/grammar/core.md") <
    primary.indexOf("unit-01/reading.md"),
);
assert(
  primary.indexOf("unit-01/reading.md") < primary.indexOf("unit-02/test.md"),
);
assert(primary.includes("не подтверждение полного покрытия CEFR"));
assert(
  !primary.includes("## Retired group"),
  "obsolete group body is regenerated",
);
assert(
  primary.includes('id="retired-group"'),
  "old group has a retained alias",
);
assert(
  primary.includes('id="retired-group-1"'),
  "duplicate heading suffix retained",
);
assert(
  primary.includes('id="legacy&amp;&quot;"'),
  "old raw alias attribute escaped",
);
const primaryIds = headingIds(primary, "languages/english/a1/_contents");
assert(primaryIds.includes('legacy&"'));
assert.equal(
  primaryIds.length,
  new Set(primaryIds).size,
  "aliases do not duplicate new IDs",
);

const mirror = plan.find((entry) =>
  entry.slug.startsWith("knowledge/"),
)!.output;
assert(mirror.includes("Дополнительное хранилище"));
assert(mirror.includes("(unit-01/reading.md)"));
assert(!mirror.includes("../languages") && !mirror.includes("../../../../"));
assert(!mirror.includes("unit-02/test.md"), "do not merge vault editions");
const primaryRoot = renderContents("", notes);
const mirrorRoot = renderContents("knowledge", notes);
assert(
  !primaryRoot.includes("(knowledge/"),
  "primary root excludes mirror notes",
);
assert(
  mirrorRoot.includes("# Содержание: Библиотека — Дополнительное хранилище"),
);
assert(!mirrorRoot.includes("../"), "mirror root stays in its physical vault");

const programming = plan.find((entry) =>
  entry.slug.startsWith("programming/"),
)!.output;
assert(
  programming.startsWith(metadata),
  "raw metadata is retained without YAML serialization",
);
assert.deepEqual(matter(programming).data, matter(metadata).data);
assert(
  programming.indexOf("syntax.md") < programming.indexOf("practice.md"),
  "syntax precedes practice even when its title sorts last",
);
assert(programming.includes("Сначала объяснение и разобранный код"));
assert(
  !/(?<!\r)\n/.test(programming),
  "preserve CRLF style on generated pages",
);
const nextFiles = files.map((file) => ({
  ...file,
  source: plan.find((entry) => entry.slug === file.slug)?.output || file.source,
}));
assert(
  planContents(nextFiles).every((entry) => !entry.changed),
  "second refresh is idempotent",
);
assert.equal(refreshContents(manual, "languages/english", []).output, manual);

// Exercise the explicit writer against a disposable fixture, never knowledge/.
// A concurrent manual edit aborts the whole preflight before any file is written.
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "materials-contents-"));
try {
  for (const file of files.filter(
    (entry) => !entry.slug.includes(".private"),
  )) {
    const target = path.join(temporary, file.slug + ".md");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.source);
  }
  const changed = plan.find((entry) => entry.changed)!;
  const target = path.join(temporary, changed.slug + ".md");
  fs.writeFileSync(target, "---\neditorial: manual\n---\n# Concurrent edit\n");
  assert.throws(() => applyContents(temporary, plan), /changed after planning/);
  assert.equal(
    fs.readFileSync(
      path.join(temporary, "programming/python/foundation/_contents.md"),
      "utf8",
    ),
    metadata + "# Old\r\n",
    "abort before writing other generated pages",
  );
  fs.writeFileSync(target, changed.source);
  assert.equal(applyContents(temporary, plan), 3);
  assert.equal(
    fs.readFileSync(
      path.join(temporary, "languages/english/_contents.md"),
      "utf8",
    ),
    manual,
  );
  assert.equal(
    applyContents(temporary, planContents(readMarkdownFiles(temporary))),
    0,
  );
  const escaping = { ...changed, slug: "../escape/_contents" };
  assert.throws(
    () => applyContents(temporary, [escaping]),
    /escapes knowledge root/,
  );
} finally {
  // Only this freshly created, resolved child of the OS temporary directory.
  const resolved = path.resolve(temporary);
  const relative = path.relative(path.resolve(os.tmpdir()), resolved);
  assert(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
  fs.rmSync(resolved, { recursive: true });
}

// Real library comparison is deliberately read-only, including manual before/after
// bytes. Existing generated text may be stale; applying it is a separate action.
const root = path.resolve("knowledge");
const actualFiles = readMarkdownFiles(root);
const beforeBytes = new Map(
  actualFiles
    .filter((file) => file.slug.endsWith("/_contents"))
    .map((file) => [file.slug, Buffer.from(file.source)]),
);
const realPlan = planContents(actualFiles);
const realNotes = contentsNotes(actualFiles);
assert.equal(actualFiles.length, 1348);
assert.equal(realPlan.length, 131);
const known = new Set(actualFiles.map((file) => file.slug));
let generatedLinks = 0;
let previousIds = 0;
for (const entry of realPlan) {
  const oldIds = headingIds(entry.source, entry.slug);
  const afterIds = headingIds(entry.output, entry.slug);
  const currentIds = new Set(afterIds);
  assert.equal(
    currentIds.size,
    afterIds.length,
    `unique generated IDs: ${entry.slug}`,
  );
  for (const id of oldIds)
    assert(
      currentIds.has(id),
      `lost generated heading/alias: ${entry.slug}#${id}`,
    );
  previousIds += oldIds.length;
  if (entry.manual) {
    assert.equal(entry.output, entry.source);
  } else {
    assert.deepEqual(matter(entry.output).data, matter(entry.source).data);
    const repeated = refreshContents(
      entry.output,
      path.posix.dirname(entry.slug),
      realNotes,
    );
    assert.equal(repeated.output, entry.output, `idempotence: ${entry.slug}`);
    const links = linkTargets(entry.output, entry.slug);
    const directory = path.posix.dirname(entry.slug);
    // Check both the Markdown target and the reader's rewritten destination.
    const rawLinks = [
      ...entry.output.matchAll(/^- \[[^\n]*\]\(([^\n]+\.md)\)\r?$/gm),
    ].map((match) => match[1]);
    assert.equal(
      links.length,
      rawLinks.length,
      `parseable links: ${entry.slug}`,
    );
    for (const href of links) {
      assert(
        href.startsWith("/doc/"),
        `rewritten generated link: ${entry.slug}`,
      );
      assert(
        known.has(decodeURIComponent(href.slice(5))),
        `missing rendered generated target: ${entry.slug} -> ${href}`,
      );
    }
    for (const link of rawLinks) {
      const destination = path.posix
        .normalize(path.posix.join(directory, link))
        .slice(0, -3);
      assert(
        known.has(destination),
        `missing generated target: ${entry.slug} -> ${link}`,
      );
      assert(!destination.endsWith("/_contents"));
      if (entry.slug.startsWith("knowledge/"))
        assert(destination.startsWith("knowledge/"));
      else assert(!destination.startsWith("knowledge/"));
      generatedLinks++;
    }
  }
  assert.deepEqual(
    fs.readFileSync(path.join(root, entry.slug + ".md")),
    beforeBytes.get(entry.slug),
    `real contents bytes unchanged: ${entry.slug}`,
  );
}
console.log(
  JSON.stringify(
    {
      status: "PASS",
      fixtureChecks:
        "manual bytes, metadata, nested paths, vault boundaries, ordering, hidden/contents filtering, idempotence, explicit writer and preflight",
      realDocuments: actualFiles.length,
      existingContents: realPlan.length,
      manualPreserved: realPlan.filter((entry) => entry.manual).length,
      generatedContents: realPlan.filter((entry) => !entry.manual).length,
      generatedLinks,
      previousIdsPreserved: previousIds,
      generatedPagesPendingRefresh: realPlan.filter((entry) => entry.changed)
        .length,
      knowledgeFilesWritten: 0,
    },
    null,
    2,
  ),
);
