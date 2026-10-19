function replace(s: string, before: string, after: string) {
  if (!s.includes(before)) throw new Error("Expected legacy wording missing: " + before.slice(0, 85));
  return s.replace(before, after);
}
export function fixCore030(n: string, original: string): string {
  let s = original;
  if (n === "06") {
    s = replace(s, "| fog | It is foggy. | Туман. |", "| be foggy (adjective pattern) | It is foggy. | Туманно. |");
    s = replace(s, "It **always rains** in November. (обычно)", "It **always rains** in November in this imaginary town. (всегда в данном учебном описании)");
    s = replace(s, "| usually | ~80% |", "| usually | обычно; без фиксированного процента |");
    s = replace(s, "| often | ~70% |", "| often | часто; без фиксированного процента |");
    s = replace(s, "| sometimes | ~50% |", "| sometimes | иногда; без фиксированного процента |");
    s = replace(s, "| rarely | ~10% |", "| rarely | редко; без фиксированного процента |");
    s = replace(s, "It never snows in the desert.", "I never walk in heavy snow.");
    s = replace(s, 'We ask **What is the weather like?** (not "How is the weather?" — though both are used informally).', 'Для общего описания погоды используем **What is the weather like?** Вопрос **How is the weather?** тоже употребляется; не объявляйте его грамматической ошибкой.');
  }
  if (n === "07") {
    s = replace(s, "Структура специального вопроса: **вопросительное слово + вспомогательный глагол + подлежащее + ...**", "В вопросе к обстоятельству или дополнению часто используется **вопросительное слово + вспомогательный/модальный глагол + подлежащее + смысловой глагол**: Where does Noor wait? С be: Where is Noor? Если who/which + noun само является подлежащим, отдельное do в нейтральном вопросе не добавляется: Who waits here? Which bus goes to the centre?");
    s = replace(s, "(Мне нужен час, чтобы добраться до работы / дорога занимает у меня полчаса.)", "(Дорога на работу занимает у меня полчаса.)");
    s = replace(s, "| How far is the airport? | About 30 minutes by car. | Около 30 минут на машине. |", "| How far is the airport? | About 30 minutes by car. | В разговоре — оценка пути временем, не ответ в километрах. Для длительности прямо спрашивайте How long does it take? |");
  }
  if (n === "08") {
    s = replace(s, "## 8.11. Три способа говорить о будущем — сводная таблица", "<span id=\"811-три-способа-говорить-о-будущем-сводная-таблица\" aria-hidden=\"true\"></span>\n\n## 8.11. Четыре модели для будущего — сводная таблица");
    s = replace(s, "| расписание по расписанию |", "| событие в установленном расписании |");
    s = replace(s, "| at | Праздники (с «day») | at Christmas, at the weekend | на Рождество, на выходных |", "| at | Праздничный период и устойчивое BrE at the weekend | at Christmas, at the weekend | в рождественский период, на выходных |");
    s = replace(s, "| on | Особые дни | on my birthday, on holiday | в день рождения |", "| on | Конкретные праздничные дни | on my birthday, on Christmas Day | в день рождения, в день Рождества |");
    s = replace(s, "2. **Предсказание / прогноз** без доказательств", "2. **Предсказание / прогноз**, часто как мнение; наличие данных само по себе не запрещает will");
    s = replace(s, "| План | Нет плана | Есть план |", "| Учебная опора для намерений | Часто решение сейчас | Часто намерение, принятое раньше |");
    s = replace(s, "| Формальность | Разговорная, быстрая | Более определённое |", "| Границы различия | Не является общей шкалой формальности или уверенности | Выбор зависит от смысла и контекста |");
    s = replace(s, "(расписание, договорённости) чаще звучит **going to**", "(намерение) подходит **going to**; для согласованной встречи часто используют Present Continuous, а для официального расписания — Present Simple");
    s = replace(s, "- The train **is leaving** at 9 a.m. (Поезд отправляется в 9 утра.)", "- We **are leaving** by train at 9 a.m. (Мы уезжаем поездом в 9 утра — наша договорённость.)");
    s = replace(s, "> **Запомните:** Present Continuous тут означает «уже договорено, есть точное\n> время». Часто используется с расписанием транспорта, встречами, планами\n> на ближайшее время.", "> **Запомните:** Present Continuous может представлять уже устроенный план или договорённость; точное время часто указано, но не обязательно. Для обычного сообщения о расписании транспорта используйте Present Simple: The train leaves at nine.");
    s += "\n\nOn holiday — устойчивое выражение «в отпуске», а не пример on + конкретный праздничный день. Сравните at Christmas / on Christmas Day. Для выходных типичны BrE at the weekend и AmE on the weekend.\n";
  }
  if (n === "09") {
    s = replace(s, "| Наречие | Перевод | Процент |", "| Наречие | Перевод | Точность значения |");
    for (const [word, russian, percent] of [["usually", "обычно", "90%"], ["often", "часто", "70%"], ["sometimes", "иногда", "50%"], ["rarely / seldom", "редко", "20%"]]) s = replace(s, `| ${word} | ${russian} | ${percent} |`, `| ${word} | ${russian} | без фиксированного процента |`);
    s = replace(s, "- Take this medicine **three times a day**. (Принимайте это лекарство три раза в день.)", "- We meet **three times a month**. (Мы встречаемся три раза в месяц.)");
    s = replace(s, "| You **shouldn't** skip breakfast. | Не следует пропускать завтрак. |", "| You **shouldn't** forget your racket. | Не следует забывать ракетку. |");
    s = replace(s, "| some | ✅ I have some water. | ❌ | — |", "| some | I have some water. | В этой базовой модели обычно any | Возможно в предложении/просьбе: Would you like some water? |");
    s = replace(s, "| any | ❌ | ✅ I don't have any water. | ✅ Do you have any water? |", "| any | Возможно «любой»: Choose any racket. | I don't have any water. | Do you have any water? |");
    s = replace(s, "| I have went to gym. | I have **gone / been** to the gym. | went — это Past Simple форма, нужна V3. |", "| I have went to gym. | I have **been** to the gym. / She has **gone** to the gym. | Нужна V3. Been — опыт/возвращение; gone — ушла и ещё не вернулась в обычном значении. Выбор зависит от ситуации. |");
    s = replace(s, "| I play swimming. | I **go** swimming / do swimming. | play используется с командными играми. |", "| I play swimming. | I **go swimming**. | Обычная модель занятия — go swimming. Play употребляется с названиями игр, например tennis/football, а не только с командными видами спорта. |");
    s = replace(s, "| I don't have some water. | I don't have **any** water. | В отрицании — any. |", "| I don't have some water. | I don't have **any** water. | Для нейтрального отрицания наличия используйте any; это не запрет some во всех возможных отрицательных контекстах. |");
  }
  if (n === "10") {
    s = replace(s, "| /s/ | после глухих звуков | works /wɜːks/, reports /rɪˈpɔːts/ |", "| /s/ | после глухих несвистящих звуков основы, например /k/, /t/ | works /wɜːks/, reports /rɪˈpɔːts/ |");
    s = replace(s, "| /z/ | после звонких звуков и гласных | plans /plænz/, manages /ˈmæn.ɪ.dʒɪz/ → /z/ |", "| /z/ | после гласных и звонких звуков основы, кроме группы следующей строки | plans /plænz/, reads /riːdz/ |");
    s = replace(s, "| /ɪz/ | после s, z, x, sh, ch, dʒ | teaches /ˈtiː.tʃɪz/, watches /ˈwɒtʃ.ɪz/ |", "| /ɪz/ | после звуков /s/, /z/, /ʃ/, /ʒ/, /tʃ/, /dʒ/ | teaches /ˈtiː.tʃɪz/, watches /ˈwɒtʃ.ɪz/, manages /ˈmæn.ɪ.dʒɪz/ |");
    s = replace(s, "Запомните: в английском вспомогательный глагол *do/does* всегда появляется в вопросе.", "В нейтральных вопросах к дополнению/обстоятельству с обычным глаголом в Present Simple используйте do/does. Это не относится ко всем английским вопросам: Is she busy? Can she help? Who works here? Have you worked abroad?");
    s = replace(s, "| Отрицание | before V | Staff **are sometimes** tired after calls. |", "| Отрицание с does | after doesn't, before V | She **doesn't usually work** on Sundays. |");
    s = replace(s, "| They wrote the contract. | The contract **was written** yesterday. |", "| They wrote the contract yesterday. | The contract **was written** yesterday. |");
    s = replace(s, "| The company hired him. | He **was hired** in March. |", "| The company hired him in March. | He **was hired** in March. |");
    s = replace(s, "⚠️ was — ед. число, were — мн. число:", "⚠️ В обычном Past Simple: I/he/she/it — was, you/we/they — were (you were и для одного собеседника):");
    s = replace(s, "| in + месяц/год/час дня |", "| in + месяц/год/часть дня |");
    s = replace(s, "| I work engineer. | I work **as an** engineer. | После as нужен артикль. |", "| I work engineer. | I work **as an** engineer. | Перед engineer в таком значении профессии в единственном числе нужен an; это не правило об артикле после любого as. |");
    s = replace(s, "| What are you working? | **What do you do?** | Вопрос о профессии — NOT continuous. |", "| What are you working? | **What do you do?** / **What are you working on?** | Первое — о профессии/занятии, второе — о текущей задаче с on. Выбор определяется нужным вопросом. |");
    s = replace(s, "- **must** — внутреннее или жёсткое правило:", "- **must** — часто обязательство от говорящего или правило; не исключительно внутренняя необходимость:");
  }
  return s;
}

export function fixPractice030(n: string, original: string): string {
  let s = original;
  if (n === "08") {
    s = replace(s, "## Упражнение 3: Will или Going to? (Choose will or going to)\n\nВыберите правильный вариант.", "## Упражнение 3: Will или Going to? (Choose will or going to)\n\nВыберите вариант, который лучше показывает указанную учебную функцию: признаки сейчас — going to, принятое ранее намерение — going to, решение в момент разговора — will. Это контекстная тренировка, а не доказательство, что другая форма всегда неграмматична. В пунктах 3 и 6 решение принимается сейчас; в пункте 4 требуется выразить мнение через will.");
    s = replace(s, "4. Look! It will rain soon (чёрные тучи).", "4. Look! It will rain soon. Чёрные тучи: переформулируйте с going to, чтобы подчеркнуть наблюдаемые признаки; исходная форма не объявляется безусловно неграмматичной.");
  }
  return s;
}

export function fixReading030(n: string, original: string): string {
  if (n !== "09") return original;
  let s = original;
  s = replace(s, "В этом разделе три текста для чтения: о здоровом образе жизни, о травме на тренировке и о выдающемся спортсмене.", "Здесь три расширенных текста: о личном распорядке Анны, вымышленном эпизоде травмы и бегунье-любительнице.");
  s = replace(s, "### Лексика из текста 1", "<span id=\"лексика-из-текста-1\" aria-hidden=\"true\"></span>\n\n### Лексика расширенной темы");
  const from = "Staying healthy is about a few simple daily habits.";
  const start = s.indexOf(from), end = s.indexOf("### Вопросы к тексту 1", start);
  if (start < 0 || end < 0) throw new Error("Legacy lifestyle paragraph not found");
  s = s.slice(0, start) + "Anna is writing about her own daily routine. On Mondays, Wednesdays and Saturdays she walks for thirty minutes. She enjoys these walks, but she does not call ninety minutes a universal exercise target. Different activities and individual circumstances need separate consideration.\n\nAnna likes fruit and vegetables and carries a bottle of water. She usually eats breakfast before work because this routine suits her. Her friend eats at different times. Anna does not use their meal times to predict anyone’s weight or health.\n\nShe usually goes to bed at eleven and gets up at seven. This gives her an eight-hour period between bedtime and getting up; the story does not measure how long she actually sleeps. When she wants a break, she takes a short walk or reads a book.\n\nAnna describes habits that she enjoys. This is a personal account, not a fixed prescription of exercise, water or sleep for every reader.\n\n" + s.slice(end);
  s = replace(s, "1. How often should you exercise, according to the text?", "1. On which days does Anna walk, and for how long each time?");
  s = replace(s, "2. What should you eat to keep a healthy diet?", "2. What food and drink does Anna mention?");
  s = replace(s, "3. Why is skipping breakfast a bad idea?", "3. Why does Anna usually eat breakfast before work?");
  s = replace(s, "4. How many hours of sleep do adults need?", "4. Does the eight-hour period prove that Anna sleeps for exactly eight hours? Explain.");
  s = replace(s, "5. What can you do to reduce stress?", "5. What does Anna do when she wants a break?");
  s = replace(s, "6. What is a healthy lifestyle, in short?", "6. Is Anna’s routine presented as a prescription for every reader?");
  s = replace(s, "1. What are three daily habits that help people stay healthy? *(exercise, healthy diet, enough sleep)*", "1. How many minutes does Anna walk in the described week? *(90; this is her routine, not a universal health threshold.)*");
  s = replace(s, "2. Why should you warm up before training? *(to prevent injuries)*", "2. Does Anna’s bedtime prove her exact sleep duration? *(No. Time in bed and measured time asleep are different.)*");
  s = replace(s, "3. What should you do if you sprain your ankle? *(rest, put a bandage, see a doctor)*", "3. Who helped Mark in the fictional injury episode? *(Tom and a doctor; the episode does not define one treatment for every injury.)*");
  s = replace(s, "4. What is more important in sport — talent or persistence? *(Both, but persistence is key)*", "4. Is Elena’s statement about persistence a proven ranking of causes for everyone? *(No. It is the character’s view.)*");
  s += "\n\n## Уточнение расширенного текста о привычках\n\nУбраны универсальные утверждения «90 минут достаточно», «два литра воды для всех» и причинный вывод о пропуске завтрака. Теперь вопросы проверяют сведения личного распорядка. Для сопоставления исходных числовых советов использованы [NHS: физическая активность взрослых 19–64 лет](https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/) и [NHS: жидкость и гидратация](https://www.nhs.uk/Live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/). Учебная история не заменяет эти рекомендации.\n";
  return s;
}
