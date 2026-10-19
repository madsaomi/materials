import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../lib/knowledge";
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("External backup directory required");
if (fs.existsSync(path.join(backup, "fixes.json")))
  throw new Error("Already applied");
const changes: { slug: string; reason: string }[] = [];
function edit(slug: string, fn: (s: string) => string, reason: string) {
  const file = path.join("knowledge", slug + ".md");
  const raw = fs.readFileSync(file, "utf8");
  let next = fn(raw);
  if (next === raw) return;
  const before = load(renderMarkdown(matter(raw).content, slug).html),
    after = load(renderMarkdown(matter(next).content, slug).html);
  const ids = new Set(
    after("[id]")
      .map((_, e) => after(e).attr("id"))
      .get(),
  );
  const missing = before("[id]")
    .map((_, e) => before(e).attr("id")!)
    .get()
    .filter((id) => !ids.has(id));
  if (missing.length)
    next +=
      "\n\n" +
      missing
        .map(
          (id) =>
            `<span id="${id.replaceAll('"', "&quot;")}" aria-hidden="true"></span>`,
        )
        .join("\n");
  const b = path.join(backup, slug + ".md");
  fs.mkdirSync(path.dirname(b), { recursive: true });
  if (!fs.existsSync(b)) fs.writeFileSync(b, raw);
  fs.writeFileSync(file, next);
  changes.push({ slug, reason });
}
for (const prefix of ["", "knowledge/"]) {
  edit(
    prefix + "languages/english/a1/unit-05/reading",
    (s) =>
      s
        .replace(
          "Breakfast is the most important meal of the day. A good breakfast includes whole grain cereal, milk, fruit, and maybe some eggs. It gives us energy for the morning. Lunch should be a balanced meal with protein, vegetables, and carbohydrates. Dinner should be light. We should avoid eating too much before bed.",
          "Anna has breakfast before work. Her breakfast includes whole grain cereal, milk and fruit. She sometimes has eggs. She likes a small lunch and a light dinner. This is her personal routine, not a rule for everyone.",
        )
        .replace(
          "Cooking at home is healthier than eating out.",
          "Cooking at home is not automatically healthier than every restaurant meal.",
        )
        .replace(
          "We should drink about eight glasses of water a day.",
          "The NHS gives six to eight cups or glasses of fluid a day as a general guide, not a fixed requirement for every person; needs vary.",
        )
        .replace(
          "Some people are vegetarians. They don't eat meat.",
          "Some people are vegetarians. They do not eat meat or fish.",
        )
        .replace(
          "Other people have food allergies. For example, some people are allergic to nuts, dairy, or gluten. It's important to read food labels and ask about ingredients in restaurants.",
          "Some people have food allergies. They need to check ingredients carefully. Preferences, allergies and other dietary needs are not the same thing.",
        )
        .replace(
          "3. What should a good breakfast include?",
          "3. What does Anna have for breakfast in this example?",
        )
        .replace(
          "4. Why is cooking at home better than eating out?",
          "4. What can we control when we cook at home?",
        )
        .replace(
          "5. How many glasses of water should we drink a day?",
          "5. What general guide to fluids does the text attribute to the NHS?",
        )
        .replace(
          "5. About eight glasses.",
          "5. Six to eight cups or glasses of fluid as a general guide; needs vary. It is not a fixed prescription of eight glasses of plain water.",
        )
        .replace(
          "6. Vegetarians don't eat meat; vegans don't eat any animal products.",
          "6. Vegetarians do not eat meat or fish; vegans do not eat animal products.",
        ) +
      "\n\n## Источник уточнения текста о жидкости\n\n[NHS: Water, drinks and hydration](https://www.nhs.uk/Live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/). Уточнены слова fluid и general guide; персональный пример завтрака не используется как универсальное правило.\n",
    "Removed blanket breakfast/dinner/home-cooking claims and fixed eight-glasses prescription and comprehension questions.",
  );
  edit(
    prefix + "languages/english/a1/unit-05/grammar/core",
    (s) =>
      s.replace(
        "Breakfast is the most important meal.",
        "I have breakfast at eight.",
      ),
    "Neutral zero-article example replaces unsupported nutrition slogan.",
  );
  edit(
    prefix + "languages/english/a1/unit-05/practice/exercises",
    (s) =>
      s.replace(
        "___ breakfast is the most important meal.",
        "___ breakfast starts at eight in this story.",
      ),
    "Zero-article exercise keeps grammatical target without medical claim.",
  );
  edit(
    prefix + "languages/english/a1/unit-03/reading",
    (s) =>
      s
        .replace(
          "Tom and Anna are talking about their cities. Tom lives in London, and Anna lives in Moscow. London is smaller than Moscow, but it is the most expensive city in the UK. Moscow is bigger, but it is also very expensive.",
          "Tom and Anna are talking about their cities in a fictional conversation. Tom lives in London, and Anna lives in Moscow. Tom says London feels smaller and very expensive to him. Anna describes Moscow as bigger and expensive too. These are their impressions, not measured rankings.",
        )
        .replace(
          "3. Which city is more expensive?",
          "3. Can we tell which city is more expensive from this text alone? Explain.",
        ) +
      "\n\n## Уточнение к расширенному тексту Comparing Things\n\nНа вопрос о том, какой город дороже, недостаточно данных: в разговоре нет сопоставимой цены или общего измерения стоимости. Субъективные more beautiful / better не выдаются за проверенный рейтинг городов.\n",
    "Fictional opinions distinguished from measured rankings; underdetermined price question corrected.",
  );
}
fs.writeFileSync(
  path.join(backup, "fixes.json"),
  JSON.stringify(changes, null, 2),
);
console.log(`English: ${changes.length} targeted correction edits.`);
