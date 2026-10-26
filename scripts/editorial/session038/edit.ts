/** Guarded retained-bank corrections; requires the immutable post037 snapshot. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

type Edit = {
  language: string;
  part: string;
  edition: "both" | "mirror";
  id: string;
  before: string;
  after: string;
  sources: string[];
};
const backup = process.argv[2];
assert(backup && path.isAbsolute(backup), "Pass the absolute post037 snapshot");
const apply = process.argv.includes("--apply");
const check = process.argv.includes("--check");
const manifest = JSON.parse(
  fs.readFileSync(path.join(backup, "manifest.json"), "utf8"),
) as { session: number; targets: string[]; hashes: Record<string, string> };
assert.equal(manifest.session, 38);
assert.equal(manifest.targets.length, 12);
const edits = JSON.parse(
  fs.readFileSync("scripts/editorial/session038/edits.json", "utf8"),
) as Edit[];
const plans = manifest.targets.map((slug) => {
  const relative = slug + ".md";
  const original = fs.readFileSync(path.join(backup, relative));
  assert.equal(
    createHash("sha256").update(original).digest("hex"),
    manifest.hashes[relative],
  );
  const language = /languages\/(english|japanese|korean)\//.exec(slug)![1];
  const part = slug.endsWith("/core") ? "core" : "usage";
  const mirror = slug.startsWith("knowledge/");
  const chosen = edits.filter(
    (e) =>
      e.language === language &&
      e.part === part &&
      (e.edition === "both" || mirror),
  );
  const oldText = original.toString("utf8");
  const eol = oldText.includes("\r\n") ? "\r\n" : "\n";
  let result = oldText.replaceAll("\r\n", "\n");
  for (const edit of chosen) {
    assert.equal(
      result.split(edit.before).length - 1,
      1,
      `Non-unique/missing original: ${slug}:${edit.id}`,
    );
    result = result.replace(edit.before, edit.after);
  }
  const proposed = Buffer.from(result.replaceAll("\n", eol), "utf8");
  const destination = path.join("knowledge", relative);
  const current = fs.readFileSync(destination);
  assert(
    current.equals(original) || current.equals(proposed),
    `Manual changes detected; stop: ${slug}`,
  );
  return {
    slug,
    destination,
    proposed,
    current,
    changed: !proposed.equals(original),
    edits: chosen.map((e) => e.id),
  };
});
// Validate every candidate before writing any file.
if (check)
  for (const plan of plans)
    assert(
      plan.current.equals(plan.proposed),
      `Current text differs from plan: ${plan.slug}`,
    );
if (apply)
  for (const plan of plans)
    if (!plan.current.equals(plan.proposed))
      fs.writeFileSync(plan.destination, plan.proposed);
const report = {
  session: 38,
  date: "2026-10-26",
  mode: apply ? "apply" : check ? "verify-current" : "dry-run",
  candidateFiles: plans.length,
  changedFiles: plans.filter((p) => p.changed).length,
  ruleEntries: edits.length,
  physicalReplacementOccurrences: plans.reduce((n, p) => n + p.edits.length, 0),
  files: plans.map((p) => ({
    slug: p.slug,
    changed: p.changed,
    edits: p.edits,
  })),
  limits:
    "Exact in-place grammar corrections; primary usage and Session036 introductions remain intact. No independent peer review in038. Some source access limitations are documented in README.",
};
fs.mkdirSync("reports/session038", { recursive: true });
fs.writeFileSync(
  "reports/session038/edits.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    mode: report.mode,
    candidates: report.candidateFiles,
    changed: report.changedFiles,
    rules: report.ruleEntries,
    occurrences: report.physicalReplacementOccurrences,
  }),
);
