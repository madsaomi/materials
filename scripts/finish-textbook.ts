import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getDocs, renderMarkdown } from "../lib/knowledge";
import { load } from "cheerio";
const backup = process.argv[2];
if (!backup || !path.isAbsolute(backup))
  throw new Error("Pass original batch backup directory.");
if (fs.existsSync(path.join(backup, "followup.json")))
  throw new Error("Follow-up already applied; inspect its report.");
const report: { slug: string; changes: string[] }[] = [];
const save = (slug: string, body: string, changes: string[]) => {
  const file = path.join("knowledge", slug + ".md");
  const old = fs.readFileSync(file, "utf8");
  const p = matter(old);
  const b = path.join(backup, slug + ".md");
  if (!fs.existsSync(b)) {
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.writeFileSync(b, old);
  }
  fs.writeFileSync(file, matter.stringify(body, p.data), "utf8");
  report.push({ slug, changes });
};
for (const doc of getDocs().filter((d) =>
  /\/unit-\d+\/(?:practice\/exercises|test)$/.test(d.slug),
)) {
  const raw = fs.readFileSync(path.join("knowledge", doc.slug + ".md"), "utf8");
  let body = matter(raw).content;
  let changes: string[] = [];
  if (doc.slug.includes("/english/")) {
    let inside = 0,
      fence = false,
      section = "";
    const keys: string[] = [];
    const lines = body.split(/\r?\n/).map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fence = !fence;
        return line;
      }
      if (fence) return line;
      if (line.includes("<details")) inside++;
      if (line.includes("</details>")) inside--;
      if (inside) return line;
      const h = /^#{1,6}\s+(.+)$/.exec(line);
      if (h) section = h[1];
      const m = /^(\s*\d+[.)]\s+)(.+?)\s+→\s+(.+)$/.exec(line);
      if (m && !m[3].includes("___") && !/^[_\.\s]+$/.test(m[3])) {
        keys.push(`- **${section}; задание ${m[1].trim()}** ${m[3]}`);
        return m[1] + m[2] + " → __________";
      }
      return line;
    });
    if (keys.length) {
      body =
        lines.join("\n") +
        "\n\n## Дополнительный ключ самопроверки\n\n<details>\n<summary>Проверить оставшиеся задания со стрелкой</summary>\n\n" +
        keys.join("\n") +
        "\n\n</details>\n";
      changes.push(`separated ${keys.length} additional inline answers`);
    }
  }
  // Explicit bold answer labels, which are not Markdown headings.
  const bold =
    /^(\*\*[^\n]*(?:Ответы|Answer key|Answers|答案|답안)[^\n]*\*\*[^\n]*)\r?\n([^\n]+(?:\r?\n(?!\s*$|#|<details>)[^\n]+)*)/gim;
  body = body.replace(bold, (all, label, answers) => {
    if (answers.includes("</details>")) return all;
    changes.push("folded explicit bold answer key");
    return `${label}\n\n<details>\n<summary>Показать ключ этого раздела</summary>\n\n${answers}\n\n</details>`;
  });
  if (doc.slug.endsWith("/english/a1/unit-01/practice/exercises")) {
    const keys: string[] = [];
    body = body.replace(
      /^(\d+\.\s+[^\n]+?)\s+\((am|are|is|is \/ isn't[^\n]*)\)\s*$/gm,
      (_, prompt, answer) => {
        keys.push(
          `- ${prompt.replace("___", answer.startsWith("is /") ? "is" : answer)}`,
        );
        return prompt;
      },
    );
    body = body.replace(
      /^(\d+\.\s+[А-ЯЁ][^\n]+?) — ([A-Z][^\n]+)$/gm,
      (_, prompt, answer) => {
        keys.push(`- **${prompt}** ${answer}`);
        return prompt + " → __________";
      },
    );
    if (keys.length) {
      body +=
        "\n\n## Ключ к первым двум упражнениям\n\n<details>\n<summary>Сверить be и перевод</summary>\n\n" +
        keys.join("\n") +
        "\n\nДля задания 1 сохраняйте утвердительную форму там, где not не указан. При другом контексте She isn’t tired тоже возможно, но это уже другое высказывание.\n\n</details>\n";
      body = body.replace(
        "## Упражнение 1: Заполните пропуски (to be)",
        "## Упражнение 1: Заполните пропуски (to be)\n\nВпишите am, is или are. Сохраните утверждение там, где not не указан; в предложениях с not не добавляйте второе отрицание.",
      );
      changes.push("removed be/translation answers from prompts");
    }
    const sorted =
      "- /iː/: see, meet, tree, week, green\n- /ɪ/: big, fish, sit, milk, six";
    if (body.includes(sorted)) {
      body = body.replace(
        sorted,
        "- /iː/: __________\n- /ɪ/: __________\n\n<details>\n<summary>Сверить распределение гласных</summary>\n\n" +
          sorted +
          "\n\n</details>",
      );
      changes.push("separated vowel grouping solution");
    }
    body = body.replace(
      "Поставь ударение (выдели заглавными) в словах по образцу: waTER → waTER? Нет: следуй правилам из grammar.md.",
      "Выделите ударный слог заглавными: например, apple → APple. Для остальных слов сначала дайте свой вариант, затем проверьте произношение.",
    );
  }
  if (changes.length) save(doc.slug, body, changes);
}
// Replace the thin overview contents with a useful study handbook; keep its old section anchor.
for (const prefix of ["", "knowledge/"]) {
  const slug = prefix + "overview/_contents";
  const body = `# Как учиться по библиотеке${prefix ? " · дополнительная версия" : ""}

Здесь можно пройти тему как урок: **цель → объяснение → пример → самостоятельная работа → проверка → применение**. Справочник отвечает на отдельный вопрос; учебный маршрут помогает освоить действие целиком.

## Выберите учебную задачу

| Если вы хотите… | Начните здесь | Что должно получиться |
|---|---|---|
| Представиться на другом языке | [Английский](../languages/english/_contents.md), [японский](../languages/japanese/_contents.md), [китайский](../languages/chinese/_contents.md), [корейский](../languages/korean/_contents.md) | Короткий рассказ о себе и ответы на вопросы |
| Написать работающую программу | [Программирование](../programming/_contents.md) | Код, который решает задачу и проверен на разных входных данных |
| Понять аргумент и возражение | [Философия](../philosophy/_contents.md) | Тезис, основания и разбор контрпримера |
| Разобраться в психологическом понятии | [Психология](../psychology/_contents.md) | Определение, наблюдаемый пример и границы вывода |
| Освоить приём запоминания | [Мнемотехника](../mnemonics/_contents.md) | Собственная система образов и проверка воспроизведения |
| Применить рабочий приём | [Практики](../practices/_contents.md) | Небольшое выполненное действие и запись результата |
| Извлечь идеи из чтения | [Книги](../books/_contents.md) | Своими словами изложенная идея с указанием места в книге |
| Настроить инструмент | [Инструменты](../tools/_contents.md) | Воспроизводимая последовательность действий и проверяемый результат |

## Как устроен один урок

1. **Цель.** Сформулируйте действие: «могу задать вопрос», «могу обработать список», «могу отличить вывод от предпосылки». «Прочитать 20 страниц» — объём работы, а не умение.
2. **Входная проверка.** Попробуйте один пример до объяснения. Ошибка покажет, на какой шаг обратить внимание.
3. **Объяснение.** Найдите правило и условия его применения. Выпишите одно ограничение: когда модель не подходит?
4. **Разобранный пример.** Для каждого шага ответьте: что изменилось и почему? Простое узнавание знакомой строки ещё не проверяет понимание.
5. **Самостоятельное решение.** Закройте пример, запишите свой ответ. После этого раскрывайте ключ.
6. **Разбор ошибки.** Сравните ход решения, а не только итог. Опишите исправление одной фразой.
7. **Перенос.** Измените входные условия и выполните новую задачу. Вернитесь к ней на другом занятии без предварительного перечитывания.

## Разобранный пример: английское be

**Задача:** превратить She is a teacher в вопрос.

**Шаг 1.** Найдите сказуемое: is. Это форма be, поэтому do не требуется.

**Шаг 2.** Поставьте is перед she: Is she a teacher?

**Шаг 3.** Убедитесь, что смысл сохранён: спрашиваем, является ли она учителем.

**Теперь самостоятельно:** сделайте вопрос из They are students.

<details>
<summary>Сравнить решение</summary>

Are they students? Are ставится перед they; форма is здесь не подходит. Если вы написали Do they are students?, вернитесь к отличию be от обычных смысловых глаголов.

</details>

## Программирование: как работать с примером

Перед запуском кода предскажите результат. После запуска объясните расхождение. Затем проверьте обычный, пустой и пограничный вход.

**Мини-задача:** функция должна возвращать количество элементов списка. Какие проверки нужны?

<details>
<summary>Пример плана проверки</summary>

- Пустой список → 0.
- Один элемент → 1.
- Несколько элементов → их количество.
- Повторяющиеся значения тоже считаются отдельными элементами: [4, 4] → 2.

Этот план проверяет смысл задачи, а не конкретную реализацию. Для других требований набор случаев изменится.

</details>

## Философия и психология: как разбирать утверждение

Разделяйте определение, наблюдение, объяснение и оценку. Выпишите источник и основания, на которых держится вывод. Личный пример может иллюстрировать идею, но не доказывает универсальное правило.

**Мини-задача:** «Два человека сказали, что приложение им помогло, значит оно помогает всем». Что не обосновано?

<details>
<summary>Разбор аргумента</summary>

Из двух сообщений сделан вывод обо всех людях. Не указаны условия, способ измерения помощи и возможные другие объяснения результата. Можно точно сообщить о двух отзывах, но общий вывод требует дополнительных оснований.

</details>

## Мнемотехника, книги и практические разделы

- **Мнемотехника:** придумайте свои образы для конкретного списка, затем проверьте воспроизведение без подсказки. Отдельно проверьте понимание значения; яркий образ не заменяет объяснения.
- **Книги:** отделяйте цитату от своего пересказа. К каждой идее добавляйте вопрос и пример её применения; фиксируйте автора, название и главу/страницу своего издания.
- **Инструменты:** запишите начальное состояние, действие и признак успеха. Обновление интерфейса может изменить инструкцию, поэтому отмечайте версию.
- **Практики:** выбирайте одно небольшое действие и фиксируйте наблюдаемый результат. Личное впечатление и подтверждённый общий эффект — разные виды утверждений.

## Рабочая запись ученика

Скопируйте в свою тетрадь и заполните:

| Поле | Ваша запись |
|---|---|
| Тема и ссылка | |
| Какое действие осваиваю | |
| Моё решение до проверки | |
| Что оказалось неверным | |
| Объяснение исправления | |
| Новый собственный пример | |
| Что воспроизвёл на следующем занятии | |

## Когда двигаться дальше

Переходите к следующему уроку, когда можете объяснить основной пример, решить похожую задачу без ключа и заметить хотя бы одну типичную ошибку. Если этого пока нет, уменьшите объём темы и разберите один новый пример. Не требуется заучивать весь большой справочник перед началом практики.

## Статус материалов

Языковые обзоры и пояснения переработаны в учебный формат. Это редакторское улучшение, а не независимая проверка каждого утверждения всей базы. В китайских справочных словарях остаются явно отмеченные незавершённые записи; не используйте их как готовые карточки. Метки уровней организуют материалы, но не подтверждают полного покрытия экзаменов.

## Справочник

[Подробная карта библиотеки](reference/index.md) сохраняет прежний большой каталог. Его исторические таблицы количества файлов и заявления о полном покрытии уровней следует рассматривать как сведения прежней редакции.
`;
  const linkedBody = prefix
    ? body
        .replace(
          /\]\(\.\.\/(programming|philosophy|psychology|practices|books|tools)\//g,
          "](../../$1/",
        )
        .replace(
          "](reference/index.md)",
          "](../../overview/reference/index.md)",
        )
    : body;
  save(slug, linkedBody, ["study handbook with domain-specific exercises"]);
}
fs.writeFileSync(
  path.join(backup, "followup.json"),
  JSON.stringify(report, null, 2),
);
console.log(`Editorial follow-up: ${report.length} files.`);
