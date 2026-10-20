import * as fs from "node:fs";
import * as path from "node:path";

const roots = [
  path.resolve("knowledge/languages/chinese/reference/vocabulary"),
  path.resolve("knowledge/knowledge/languages/chinese/reference/vocabulary"),
];

const backupRoot = path.resolve(
  process.env.USERPROFILE || "C:/Users/madsaomi",
  ".codex/visualizations/2026/10/19/session034-chinese-reference"
);

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");

const PROVENANCE = "<!-- session034-chinese-reference: provenance retained (unfinished warnings preserved) -->";

function walk(dir: string): string[] {
  const out: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(p));
      else if (e.name.endsWith(".md")) out.push(p);
    }
  } catch {}
  return out;
}

function countUnfinished(s: string): number {
  return (s.match(/не проверено|не заполнено/g) || []).length;
}

function backupFile(src: string) {
  const rel = path.relative(process.cwd(), src);
  const dest = path.join(backupRoot, rel.replace(/[\\/]/g, "__"));
  fs.copyFileSync(src, dest);
}

function ensureProvenance(txt: string): string {
  if (txt.includes("session034-chinese-reference")) {
    return txt;
  }
  // Add after first heading if present, else at top
  const lines = txt.split(/\r?\n/);
  if (lines.length > 0 && lines[0].startsWith("#")) {
    // Insert after heading and following blank line if exists
    let idx = 1;
    // skip blank lines
    while (idx < lines.length && lines[idx].trim() === "") idx++;
    lines.splice(idx, 0, PROVENANCE);
    return lines.join("\n");
  }
  return PROVENANCE + "\n\n" + txt;
}

function main() {
  const files = roots.flatMap((r) => walk(r)).filter((f) => fs.existsSync(f));
  let total = 0;
  const details: Array<{ f: string; c: number }> = [];
  for (const f of files) {
    const txt = fs.readFileSync(f, "utf8");
    const c = countUnfinished(txt);
    if (c > 0) {
      total += c;
      details.push({ f: path.relative(process.cwd(), f), c });
    }
  }
  console.log(`Unfinished entries: ${total} across ${details.length} files (both vaults)`);
  for (const d of details) console.log(`  ${d.c}\t${d.f}`);
  
  if (!apply) {
    console.log("\n[CHECK] No changes made. Run with --apply to backup and process.");
    return;
  }
  
  fs.mkdirSync(backupRoot, { recursive: true });
  console.log(`\n[APPLY] Backing up to ${backupRoot}`);
  let modified = 0;
  for (const d of details) {
    const f = path.resolve(d.f);
    backupFile(f);
    const txt = fs.readFileSync(f, "utf8");
    const updated = ensureProvenance(txt);
    if (updated !== txt) {
      fs.writeFileSync(f, updated, "utf8");
      modified++;
      console.log(`  Modified: ${d.f}`);
    } else {
      console.log(`  Backed up (no header change): ${d.f}`);
    }
  }
  console.log(`\n[APPLY] Backed up ${details.length} files, modified ${modified} files. Unfinished warnings preserved.`);
}

main();
