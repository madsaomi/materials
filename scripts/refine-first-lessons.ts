import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Pass backup directory");
if (fs.existsSync(path.join(backup, "refinements.json")))
  throw new Error("Refinements already applied; inspect report.");
const changed: string[] = [];
function edit(slug: string, fn: (s: string) => string) {
  const file = path.join("knowledge", slug + ".md");
  const raw = fs.readFileSync(file, "utf8");
  const next = fn(raw);
  if (raw === next) return;
  const b = path.join(backup, slug + ".md");
  if (!fs.existsSync(b)) {
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.writeFileSync(b, raw);
  }
  fs.writeFileSync(file, next);
  changed.push(slug);
}
for (const prefix of ["", "knowledge/"]) {
  edit(prefix + "overview/_contents", (raw) => {
    const p = matter(raw);
    p.data.editorial = "manual";
    return matter.stringify(p.content, p.data);
  });
  edit(prefix + "languages/english/a1/unit-01/practice/exercises", (raw) => {
    let s = raw;
    // Turn the remaining solved phonetics exercises into tasks with separate solutions.
    for (const n of [13, 14, 15]) {
      const pattern = new RegExp(
        `(## Упражнение ${n}:[^\\n]*\\n)([\\s\\S]*?)(?=\\n## |\\n---|$)`,
      );
      s = s.replace(pattern, (all, h, body) => {
        if (body.includes("<details>")) return all;
        let answers = body.trim();
        let prompt = "";
        if (n === 13) {
          prompt =
            "К каждому слову подберите слово, отличающееся одним звуком. Слова: sheep, beat, seat, feel, caught, boat, bite, nose. Сверяйте транскрипцию в выбранном варианте английского.\n\n1. sheep — __________\n2. beat — __________\n3. seat — __________\n4. feel — __________\n5. caught — __________\n6. boat — __________\n7. bite — __________\n8. nose — __________";
          answers =
            "Возможные пары: sheep — ship; beat — bit; seat — sit; feel — fill; caught — cot (в вариантах, где эти гласные различаются); boat — boot; bite — bit; nose — noise.\n\nBoat /bəʊt/ и boot /buːt/ отличаются одним гласным сегментом и подходят для упражнения. Дифтонг рассматривается как один гласный сегмент; не нужно объявлять пару неверной из-за записи двумя знаками.";
        }
        if (n === 14) {
          prompt =
            "Прочитайте транскрипцию, затем запишите слово и перевод без словаря. Это чтение по IPA, а не аудиодиктант.\n\n| IPA | Слово | Перевод |\n|---|---|---|\n| /wɜːd/ | ___ | ___ |\n| /ˈwɪndəʊ/ | ___ | ___ |\n| /ðeɪ/ | ___ | ___ |\n| /həʊm/ | ___ | ___ |\n| /ˈtiːtʃə/ | ___ | ___ |\n| /sʌn/ | ___ | ___ |\n| /ˈbɜːθdeɪ/ | ___ | ___ |\n| /ʃuː/ | ___ | ___ |";
        }
        if (n === 15) {
          prompt =
            "Для каждой пары укажите, рифмуется ли она в выбранном произношении. Для точной рифмы сопоставляйте ударный гласный и последующие звуки, а не написание.\n\n1. see — tree\n2. me — name\n3. game — name\n4. light — right\n5. do — who\n6. cat — hat\n7. work — look\n8. book — cook";
        }
        return `${h}\n${prompt}\n\n<details>\n<summary>Показать решение упражнения ${n}</summary>\n\n${answers}\n\n</details>\n`;
      });
    }
    s +=
      "\n\n## Источники для проверки произношения\n\n- [Cambridge: boat](https://dictionary.cambridge.org/pronunciation/english/boat).\n- [Cambridge: boot](https://dictionary.cambridge.org/pronunciation/english/boot).\n- [Cambridge: rhyme](https://dictionary.cambridge.org/dictionary/english/rhyme).\n";
    return s;
  });
  edit(
    prefix + "languages/english/a1/unit-03/grammar/core",
    (s) =>
      s
        .replace(
          "| Длинные прилагательные (2+ слога) | more + Adj | more interesting |",
          "| Большинство длинных; двухсложные проверяйте отдельно | more + Adj | more interesting; но happy → happier |",
        )
        .replace(
          "| Длинные | the most + Adj | the most interesting |",
          "| Большинство длинных | the most + Adj | the most interesting; но happy → the happiest |",
        ) +
      "\n\n## Уточнение правила сравнения\n\nДва слога сами по себе не требуют more/most: happy → happier → the happiest. У многих двухсложных прилагательных выбор зависит от слова; проверяйте словарь. Для трёх и более слогов обычно используются more/most.\n\n[British Council: сравнительная и превосходная степени](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives).\n",
  );
  edit(
    prefix + "languages/english/a1/unit-01/grammar/core",
    (s) =>
      s
        .replace(
          "Произношение в английском подчиняется правилам. Зная их, ты не только правильно читаешь слова, но и понимаешь, почему слово пишется именно так.",
          "У английского чтения есть повторяющиеся модели и исключения. Модели помогают предположить произношение, но не позволяют однозначно вывести его из любого написания. Новое слово проверяйте по транскрипции и записи речи. Ниже преимущественно используются британские словарные варианты.",
        )
        .replace(
          "Самый стабильный: всегда долгий /iː/",
          "Обычно /iː/ в этих примерах",
        )
        .replace("| Всегда /əʊ/ |", "| Обычно /əʊ/ в этих примерах |")
        .replace(
          "Дифтонг с «р»-оттенком",
          "В данном британском варианте без конечного /r/",
        )
        .replace(
          "**Практический приём:** сочетания ai/ay, oa, oi/oy, oo почти не обманывают. Главные «ловушки» — ea (два звука) и ou/ow (по два звука).",
          "**Практический приём:** используйте таблицу как набор частых моделей, а не как гарантию. В частности, oo уже в приведённых примерах имеет разные чтения. Проверяйте целое слово в словаре.",
        )
        .replace(
          "picture, nature, future, teacher",
          "picture, nature, future",
        ) +
      "\n\n## Проверка базовой модели be\n\n[British Council: Present simple — be](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple-be). Фонетические модели сверяйте со словарём для конкретного слова и варианта языка.\n",
  );
}
fs.writeFileSync(
  path.join(backup, "refinements.json"),
  JSON.stringify(changed, null, 2),
);
console.log(`Refined ${changed.length} files.`);
