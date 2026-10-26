import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import { load } from "cheerio";
import { getDocs, renderMarkdown } from "../lib/knowledge";
import { chapters } from "./programming-content";
const backup = process.argv[2];
assert(backup && path.isAbsolute(backup));
// Educational interpreters are opt-in; the site and its normal checks use Node.js.
const tools: Record<string, string | undefined> = {
  python: process.env.LESSON_PYTHON,
  javascript: process.execPath,
  go: process.env.LESSON_GO,
  rust: process.env.LESSON_RUSTC,
};
const examples = path.join(backup, "runnable-examples");
fs.mkdirSync(examples, { recursive: true });
const runs: { name: string; status: string }[] = [];
for (const c of chapters)
  for (const [kind, code] of [
    ["example", c.code],
    ["solution", c.solution],
  ]) {
    const name = `${c.language}-${c.unit}-${kind}`;
    const ext = { python: "py", javascript: "cjs", go: "go", rust: "rs" }[
      c.language
    ];
    const file = path.join(examples, name + "." + ext);
    const standalone =
      c.language === "python" && c.unit === "03" && kind === "solution"
        ? c.code + "\n" + code
        : code;
    fs.writeFileSync(file, standalone);
    const executable = tools[c.language];
    if (!executable) {
      runs.push({
        name,
        status:
          "not executed: interpreter/compiler not configured; complete source exported",
      });
      continue;
    }
    let args: string[] = [file];
    if (c.language === "go") args = ["run", file];
    if (c.language === "rust") {
      const binary = path.join(
        examples,
        name + (process.platform === "win32" ? ".exe" : ""),
      );
      const compiled = spawnSync(executable, [file, "-o", binary], {
        encoding: "utf8",
        timeout: 60000,
      });
      assert.equal(compiled.status, 0, compiled.stderr);
      const run = spawnSync(binary, [], { encoding: "utf8", timeout: 10000 });
      assert.equal(run.status, 0, run.stderr);
      runs.push({ name, status: "executed" });
      continue;
    }
    const run = spawnSync(executable, args, {
      encoding: "utf8",
      timeout: 10000,
    });
    assert.equal(run.status, 0, `${name}: ${run.stderr}`);
    runs.push({ name, status: "executed" });
  }
const bySlug = new Map(getDocs().map((d) => [d.slug, d]));
let anchors = 0;
const manifest = JSON.parse(
  fs.readFileSync(path.join(backup, "manifest.json"), "utf8"),
) as { changed: string[] };
for (const slug of manifest.changed) {
  const doc = bySlug.get(slug)!;
  assert(doc);
  const original = matter(
    fs.readFileSync(path.join(backup, slug + ".md"), "utf8"),
  ).content;
  const old = load(renderMarkdown(original, slug).html);
  const current = load(doc.html);
  const ids = new Set(
    current("[id]")
      .map((_, e) => current(e).attr("id"))
      .get(),
  );
  for (const id of old("[id]")
    .map((_, e) => old(e).attr("id"))
    .get()) {
    assert(ids.has(id), `lost anchor ${slug}#${id}`);
    anchors++;
  }
  // All old code blocks remain, including those inside the retained solution bank.
  const blocks = old("pre code")
    .map((_, e) => old(e).text())
    .get();
  const currentText = current.text().replace(/\s+/g, " ");
  for (const block of blocks) {
    const normalized = block.replace(/\s+/g, " ").trim();
    assert(currentText.includes(normalized), `lost code ${slug}`);
  }
  if (slug.endsWith("/practice")) {
    assert(current("details").length >= 2);
    assert.equal(current("details[open]").length, 0);
    assert(current.text().includes("Задание без готового ответа"));
  }
}
const result = {
  chapters: chapters.length,
  notes: manifest.changed.length,
  retainedOriginalHeadingIds: anchors,
  executed: runs.filter((r) => r.status === "executed").length,
  notExecuted: runs.filter((r) => r.status !== "executed").length,
  runs,
};
fs.writeFileSync(
  process.env.PROGRAMMING_REPORT || "programming-verification.json",
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify({
    chapters: result.chapters,
    notes: result.notes,
    retainedOriginalHeadingIds: anchors,
    executed: result.executed,
    notExecuted: result.notExecuted,
  }),
);
