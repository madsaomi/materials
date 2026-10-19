import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";

const walk = (root: string): string[] => fs.readdirSync(root, {withFileTypes: true}).flatMap(e => e.name.startsWith(".") ? [] : e.isDirectory() ? walk(path.join(root,e.name)) : e.name.endsWith(".md") ? [path.join(root,e.name)] : []);
const files = walk("knowledge");
const titles = new Map<string, number>();
const hashes = new Map<string, number>();
const raw = new Map<string, string>();
let lines = 0;
for (const file of files) {
  const bytes = fs.readFileSync(file);
  const text = bytes.toString("utf8");
  const slug = path.relative("knowledge", file).replaceAll("\\", "/").slice(0,-3);
  raw.set(slug,text);
  lines += text.split(/\r?\n/).length;
  const parsed = matter(text.replace(/^\uFEFF/, ""));
  const title = String(parsed.data.title || /^#\s+(.+)$/m.exec(parsed.content)?.[1] || path.basename(slug).replaceAll("-", " "));
  titles.set(title,(titles.get(title)||0)+1);
  const hash = createHash("sha256").update(bytes).digest("hex");
  hashes.set(hash,(hashes.get(hash)||0)+1);
}
const backup = "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb";
const edited = new Set<string>();
for (const name of ["textbook-before-session027", "programming-before-session028"]) {
  const root = path.join(backup,name);
  for (const file of walk(root)) {
    const slug = path.relative(root,file).replaceAll("\\", "/").slice(0,-3);
    if (raw.has(slug)) edited.add(slug);
  }
}
for (const report of ["languages-verification.json", "languages-session030-verification.json", "reports/session032/verification.json", "reports/session033/verification.json"]) {
  for (const slug of JSON.parse(fs.readFileSync(report,"utf8")).files) edited.add(slug);
}
let mirrorPairs=0, same=0;
for (const [slug,text] of raw) if (!slug.startsWith("knowledge/") && raw.has("knowledge/"+slug)) {
  mirrorPairs++;
  if (text === raw.get("knowledge/"+slug)) same++;
}
const titleDuplicates = [...titles.values()].filter(n=>n>1);
const exactDuplicates = [...hashes.values()].filter(n=>n>1);
const result={documents:files.length,lines,titleGroupsWithDuplicates:titleDuplicates.length,extraTitleCopies:titleDuplicates.reduce((n,c)=>n+c-1,0),textbookUniqueEditedFilesSessions027to033:edited.size,session033Files:JSON.parse(fs.readFileSync("reports/session033/verification.json","utf8")).files.length,exactFileDuplicateGroups:exactDuplicates.length,extraExactFileCopies:exactDuplicates.reduce((n,c)=>n+c-1,0),samePathMirrorPairs:mirrorPairs,identicalSamePathMirrors:same,differingSamePathMirrors:mirrorPairs-same};
fs.writeFileSync("reports/session033/metrics.json",JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
