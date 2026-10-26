import fs from "node:fs";
import path from "node:path";

const files: { markers: number; path: string }[] = [];
function inspect(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) inspect(file);
    else if (entry.name.endsWith(".md")) {
      const markers = (fs.readFileSync(file, "utf8").match(/не проверено|не заполнено/g) || []).length;
      if (markers) files.push({ markers, path: file.replaceAll("\\", "/") });
    }
  }
}
for (const root of ["knowledge", "knowledge/knowledge"])
  for (const language of ["english", "japanese", "korean", "chinese"])
    for (let n = 6; n <= 15; n++) {
      const level = n <= 10 ? "a2" : "b1";
      inspect(path.join(root, "languages", language, level, "unit-" + String(n).padStart(2, "0")));
    }
files.sort((a,b) => a.path.localeCompare(b.path));
console.log(JSON.stringify({ total: files.reduce((sum, file) => sum + file.markers, 0), files }, null, 2));
