export interface Chapter {
  language: string;
  level: string;
  unit: string;
  title: string;
  concept: string;
  steps: string[];
  code: string;
  task: string;
  solution: string;
  explanation: string;
  edge: string;
  extension: string;
  source: string;
}
export const chapters: Chapter[] = [
  {
    language: "python",
    level: "foundation",
    unit: "01",
    title: "Функция, цикл и накопитель",
    concept:
      "Функция получает данные через параметр и возвращает результат. Локальный счётчик создаётся при каждом вызове. Условие выбирает элементы; действие внутри него определяет, считаем мы их или складываем.",
    steps: [
      "Создаём count до цикла.",
      "Перебираем все элементы, включая повторы.",
      "Для положительного числа прибавляем 1.",
      "Возвращаем результат после полного обхода.",
    ],
    code: `def count_positive(numbers):
    count = 0
    for number in numbers:
        if number > 0:
            count += 1
    return count

assert count_positive([-2, 0, 3, 3]) == 2
assert count_positive([]) == 0
assert count_positive([-9]) == 0
`,
    task: "Напишите sum_positive(numbers): сложите строго положительные числа, не изменяя список. Пустой список должен давать 0.",
    solution: `def sum_positive(numbers):
    total = 0
    for number in numbers:
        if number > 0:
            total += number
    return total

assert sum_positive([-2, 0, 3, 3]) == 6
assert sum_positive([]) == 0
values = [1, -1, 2]
assert sum_positive(values) == 3
assert values == [1, -1, 2]
`,
    explanation:
      "Меняется прибавляемое значение: вместо 1 прибавляется сам элемент. Return внутри цикла ошибочно завершил бы функцию после первого элемента.",
    edge: "Повторяющиеся элементы считаются отдельно; 0 не положителен. Накопитель не должен храниться между вызовами.",
    extension:
      "Добавьте порог minimum и заранее определите, включается ли равенство.",
    source: "https://docs.python.org/3/tutorial/controlflow.html",
  },
  {
    language: "python",
    level: "practice",
    unit: "02",
    title: "Словарь частот и нормализация",
    concept:
      "Словарь связывает ключ с количеством. Нормализация определяет, какие записи считаются одинаковыми. Здесь убираем крайние пробелы и меняем регистр; это простая политика для учебных слов, а не полный лингвистический анализ.",
    steps: [
      "Создаём словарь до цикла.",
      "Получаем очищенный ключ.",
      "Пропускаем пустые ключи.",
      "Через get берём прежнее количество либо 0, затем записываем новое.",
    ],
    code: `def frequencies(words):
    counts = {}
    for word in words:
        key = word.strip().lower()
        if key:
            counts[key] = counts.get(key, 0) + 1
    return counts

assert frequencies([" Go ", "go", "Rust", ""]) == {"go": 2, "rust": 1}
assert frequencies([]) == {}
`,
    task: "Напишите unique_clean(words): верните очищенные непустые слова без повторов, сохраняя порядок первого появления.",
    solution: `def unique_clean(words):
    seen = set()
    result = []
    for word in words:
        key = word.strip().lower()
        if key and key not in seen:
            seen.add(key)
            result.append(key)
    return result

assert unique_clean([" Go ", "go", "Rust", "GO"]) == ["go", "rust"]
assert unique_clean(["", " "]) == []
assert unique_clean(["b", "a", "b"]) == ["b", "a"]
`,
    explanation:
      "Множество отвечает на вопрос о повторе, список хранит нужный порядок. Один set не выражает требование порядка первого появления.",
    edge: "Пустая после strip строка должна исчезать. Не меняйте входной список.",
    extension:
      "Сравнивайте по очищенному ключу, но возвращайте написание первого исходного слова. Уточните политику пробелов.",
    source: "https://docs.python.org/3/tutorial/datastructures.html",
  },
  {
    language: "python",
    level: "advanced",
    unit: "03",
    title: "Объект и инвариант состояния",
    concept:
      "Корзина хранит количества товаров. Инвариант: добавляемые количества — положительные целые числа. Неудачное действие не должно менять состояние. Подчёркивание в имени атрибута — соглашение, а не защита доступа.",
    steps: [
      "Создаём отдельный словарь в __init__.",
      "Проверяем количество до изменения словаря.",
      "Прибавляем количество к выбранному товару.",
      "Наружу возвращаем копию, чтобы не отдавать внутренний словарь напрямую.",
    ],
    code: `class Cart:
    def __init__(self):
        self._items = {}
    def add(self, name, quantity):
        if type(quantity) is not int or quantity <= 0:
            raise ValueError("positive integer required")
        self._items[name] = self._items.get(name, 0) + quantity
    def snapshot(self):
        return self._items.copy()

cart = Cart()
cart.add("book", 2)
copy = cart.snapshot()
copy["book"] = 100
assert cart.snapshot() == {"book": 2}
assert Cart().snapshot() == {}
`,
    task: "Проверьте, что неверное добавление не меняет корзину: 0, отрицательное число, True и дробное количество должны отвергаться. Используйте класс из примера.",
    solution: `cart = Cart()
cart.add("book", 2)
for quantity in [0, -1, True, 1.5]:
    try:
        cart.add("pen", quantity)
    except ValueError:
        pass
    else:
        raise AssertionError("validation expected")
    assert cart.snapshot() == {"book": 2}
`,
    explanation:
      "Bool является подклассом int, поэтому здесь намеренно используется точная проверка type. Поверхностной копии достаточно для словаря с целыми значениями; для вложенных изменяемых объектов это уже не общее решение.",
    edge: "Разные корзины должны быть независимы. Проверяйте состояние после ошибки, а не только наличие исключения.",
    extension:
      "Спроектируйте remove: определите поведение для отсутствующего товара и недостаточного количества до написания метода.",
    source: "https://docs.python.org/3/tutorial/classes.html",
  },
  {
    language: "javascript",
    level: "foundation",
    unit: "01",
    title: "Массив и функция без изменения входа",
    concept:
      "Const запрещает переназначение переменной, но не делает массив неизменяемым. Новый результат можно строить отдельно. For…of получает значения; for…in перебирает перечисляемые ключи и для этой задачи не подходит.",
    steps: [
      "Создаём новый массив результата.",
      "Получаем каждое значение через for…of.",
      "Проверяем строгое сравнение с нулём.",
      "Возвращаем результат, не меняя исходный массив.",
    ],
    code: `function positives(numbers) {
  const result = [];
  for (const number of numbers) {
    if (number > 0) result.push(number);
  }
  return result;
}
const values = [-1, 0, 2, 2];
if (JSON.stringify(positives(values)) !== "[2,2]") throw new Error("mixed");
if (JSON.stringify(values) !== "[-1,0,2,2]") throw new Error("changed input");
if (positives([]).length !== 0) throw new Error("empty");
`,
    task: "Напишите sumPositive(numbers) для массива конечных чисел: сложите положительные элементы. Пустой массив даёт 0.",
    solution: `function sumPositive(numbers) {
  let total = 0;
  for (const number of numbers) {
    if (number > 0) total += number;
  }
  return total;
}
if (sumPositive([-1, 0, 2, 2]) !== 4) throw new Error("mixed");
if (sumPositive([]) !== 0) throw new Error("empty");
if (sumPositive([-5]) !== 0) throw new Error("negative");
`,
    explanation:
      "Total объявлен через let, потому что значение меняется. Здесь возвращается число; push не нужен.",
    edge: "Контракт — конечные числа без строк и пропусков. Не переносите выводы о таком массиве на произвольный JSON без проверки.",
    extension:
      "Напишите вариант через filter и reduce. Объясните начальное значение 0 для reduce.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
  },
  {
    language: "javascript",
    level: "practice",
    unit: "02",
    title: "Async-функция и явный результат ошибки",
    concept:
      "Async-функция возвращает Promise. Await внутри try позволяет обработать отклонение. Для учебной проверки передаём загрузчик аргументом, поэтому сеть и браузер не нужны. Проверка структуры данных и обработка отказа — разные обязанности.",
    steps: [
      "Ожидаем результат загрузчика.",
      "Проверяем массив строк.",
      "Очищаем имена, убираем пустые.",
      "Не превращаем ошибку формата в успешный пустой список.",
    ],
    code: `async function loadNames(loader) {
  const data = await loader();
  if (!Array.isArray(data) || data.some(x => typeof x !== "string")) {
    throw new TypeError("array of strings required");
  }
  return data.map(name => name.trim()).filter(Boolean);
}
(async () => {
  const names = await loadNames(async () => [" Ada ", "", "Lin"]);
  if (JSON.stringify(names) !== '["Ada","Lin"]') throw new Error("names");
  let rejected = false;
  try { await loadNames(async () => null); }
  catch (error) { rejected = error instanceof TypeError; }
  if (!rejected) throw new Error("validation");
})().catch(error => { console.error(error); process.exitCode = 1; });
`,
    task: "Напишите tryLoad(loader): при успехе возвращайте {ok: true, names}, при ошибке — {ok: false, error}. Загрузчик здесь уже отвечает за проверку формата.",
    solution: `async function tryLoad(loader) {
  try {
    return { ok: true, names: await loader() };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}
(async () => {
  const empty = await tryLoad(async () => []);
  if (!empty.ok || empty.names.length !== 0) throw new Error("empty is success");
  const bad = await tryLoad(async () => { throw new Error("offline"); });
  if (bad.ok || !bad.error.includes("offline")) throw new Error("failure");
})().catch(error => { console.error(error); process.exitCode = 1; });
`,
    explanation:
      "Флаг ok отличает пустой успешный результат от ошибки. Try без await не ждёт отклонения Promise. Для реального fetch отдельно проверяют response.ok.",
    edge: "Проверьте пустой успех, отказ загрузки и неверную структуру отдельно.",
    extension:
      "Свяжите tryLoad с loadNames через () => loadNames(fakeLoader); сравните отказ сети и ошибку структуры.",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
  },
  {
    language: "javascript",
    level: "advanced",
    unit: "03",
    title: "Замыкание и независимое состояние",
    concept:
      "Замыкание сохраняет доступ к лексической среде. Каждый вызов фабрики создаёт отдельное состояние, а функции одного возвращённого объекта обращаются к общей для них переменной.",
    steps: [
      "Фабрика создаёт локальное value.",
      "Возвращённые методы сохраняют к нему доступ.",
      "Increment меняет сохранённое значение.",
      "Второй вызов фабрики создаёт независимую переменную.",
    ],
    code: `function makeCounter(start = 0) {
  let value = start;
  return {
    increment() { value += 1; return value; },
    read() { return value; }
  };
}
const a = makeCounter(10), b = makeCounter();
if (a.increment() !== 11 || a.increment() !== 12) throw new Error("counter");
if (b.read() !== 0) throw new Error("independent");
`,
    task: "Напишите makeOnce(fn) для синхронной функции без аргументов. После первого успешного вызова сохраняйте результат. После исключения разрешайте повтор.",
    solution: `function makeOnce(fn) {
  let done = false, value;
  return function () {
    if (!done) {
      value = fn();
      done = true;
    }
    return value;
  };
}
let calls = 0;
const once = makeOnce(() => { calls++; return 0; });
if (once() !== 0 || once() !== 0 || calls !== 1) throw new Error("zero");
let tries = 0;
const retry = makeOnce(() => { if (++tries === 1) throw new Error("retry"); return 7; });
try { retry(); } catch {}
if (retry() !== 7 || retry() !== 7 || tries !== 2) throw new Error("retry policy");
`,
    explanation:
      "Отдельный флаг нужен для корректных результатов 0 или undefined. Флаг ставится после fn: при исключении до него не дойдут.",
    edge: "Это контракт синхронной функции. Сохранение отклонённого Promise требует отдельного решения о повторе.",
    extension:
      "Спроектируйте вариант для Promise: какое поведение требуется после отклонения и при двух одновременных вызовах?",
    source:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
  },
  {
    language: "go",
    level: "foundation",
    unit: "01",
    title: "Типизированная функция и обход среза",
    concept:
      "Сигнатура задаёт тип входа и результата. Срез []int может быть пустым, поэтому обращение к первому элементу требует проверки. В range используем _ для неиспользуемого индекса.",
    steps: [
      "Принимаем срез целых чисел.",
      "Создаём счётчик до цикла.",
      "Получаем значения, а не индексы.",
      "Возвращаем итог полного обхода.",
    ],
    code: `package main
import "fmt"
func countPositive(numbers []int) int {
    count := 0
    for _, number := range numbers {
        if number > 0 { count++ }
    }
    return count
}
func main() {
    if countPositive([]int{-2, 0, 3, 3}) != 2 { panic("mixed") }
    if countPositive(nil) != 0 { panic("nil") }
    fmt.Println(countPositive([]int{1, -1, 2}))
}
`,
    task: "Напишите sumPositive(numbers []int) int. Используйте небольшие значения, сумма которых помещается в int. Пустой и nil-срез должны давать 0.",
    solution: `package main
func sumPositive(numbers []int) int {
    total := 0
    for _, number := range numbers {
        if number > 0 { total += number }
    }
    return total
}
func main() {
    if sumPositive([]int{-2, 0, 3, 3}) != 6 { panic("mixed") }
    if sumPositive(nil) != 0 { panic("nil") }
    if sumPositive([]int{}) != 0 { panic("empty") }
    if sumPositive([]int{-9}) != 0 { panic("negative") }
}
`,
    explanation:
      "Суммирование отличается от подсчёта тем, что прибавляется сам элемент. Range по nil-срезу выполняет ноль итераций.",
    edge: "For index := range numbers даёт индексы. Тип int ограничен по диапазону; код не реализует контроль переполнения.",
    extension:
      "Верните одновременно сумму и количество положительных чисел. Сначала определите сигнатуру.",
    source: "https://go.dev/tour/moretypes/16",
  },
  {
    language: "go",
    level: "practice",
    unit: "02",
    title: "Разбор ввода и error как часть контракта",
    concept:
      "Сначала проверяем синтаксис и диапазон при преобразовании строки, затем ограничения задачи. Возвращаемое число следует использовать после проверки error. Неверный ввод не должен молча превращаться в успешный ноль.",
    steps: [
      "Atoi пытается получить int.",
      "При ошибке сохраняем причину через %w.",
      "После успешного разбора проверяем положительность.",
      "Успех возвращает значение вместе с nil.",
    ],
    code: `package main
import (
    "fmt"
    "strconv"
)
func positiveInt(text string) (int, error) {
    value, err := strconv.Atoi(text)
    if err != nil { return 0, fmt.Errorf("parse quantity: %w", err) }
    if value <= 0 { return 0, fmt.Errorf("quantity must be positive") }
    return value, nil
}
func main() {
    value, err := positiveInt("12")
    if err != nil || value != 12 { panic("valid") }
    if _, err := positiveInt("bad"); err == nil { panic("parse") }
    if _, err := positiveInt("0"); err == nil { panic("domain") }
}
`,
    task: "Напишите boundedInt(text string, max int) (int, error): допустим диапазон от 1 до max включительно. max < 1 отвергается до разбора строки.",
    solution: `package main
import (
    "fmt"
    "strconv"
)
func boundedInt(text string, max int) (int, error) {
    if max < 1 { return 0, fmt.Errorf("invalid maximum") }
    value, err := strconv.Atoi(text)
    if err != nil { return 0, fmt.Errorf("parse quantity: %w", err) }
    if value < 1 || value > max { return 0, fmt.Errorf("out of range") }
    return value, nil
}
func main() {
    if v, err := boundedInt("5", 5); err != nil || v != 5 { panic("boundary") }
    for _, text := range []string{"0", "6", "bad", ""} {
        if _, err := boundedInt(text, 5); err == nil { panic("invalid") }
    }
    if _, err := boundedInt("1", 0); err == nil { panic("max") }
}
`,
    explanation:
      "Ошибочный параметр функции, ошибка преобразования и недопустимый диапазон — разные причины отказа. Порядок проверок тоже входит в контракт.",
    edge: "Значение, возвращённое вместе с error, не считать успешным результатом. Оба края диапазона проверять отдельно.",
    extension:
      "Определите, разрешены ли крайние пробелы. Если да, добавьте TrimSpace и соответствующий сценарий проверки.",
    source: "https://go.dev/blog/error-handling-and-go",
  },
  {
    language: "go",
    level: "advanced",
    unit: "03",
    title: "Канал и ответственность за завершение",
    concept:
      "Небуферизованный канал синхронизирует отправку и получение. Range по каналу завершается после его закрытия и чтения оставшихся значений. В примере единственный отправитель отвечает за close.",
    steps: [
      "Создаём канал и запускаем отправителя.",
      "Возвращаем канал только для получения.",
      "Отправитель передаёт все значения и закрывает канал.",
      "Получатель читает до конца.",
    ],
    code: `package main
import "fmt"
func squares(numbers []int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, number := range numbers { out <- number * number }
    }()
    return out
}
func main() {
    total := 0
    for value := range squares([]int{2, 3}) { total += value }
    if total != 13 { panic("sum") }
    fmt.Println(total)
}
`,
    task: "Напишите produce(numbers []int) <-chan int, передающую элементы без изменения и закрывающую канал. Проверьте количество полученных значений для пустого входа и повторов.",
    solution: `package main
func produce(numbers []int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, number := range numbers { out <- number }
    }()
    return out
}
func collectCount(numbers []int) int {
    count := 0
    for range produce(numbers) { count++ }
    return count
}
func main() {
    if collectCount(nil) != 0 { panic("empty") }
    if collectCount([]int{4, 4, 9}) != 3 { panic("count") }
}
`,
    explanation:
      "Закрытие происходит и при пустом входе. Завершение отправляющей горутины само по себе канал не закрывает. Без close получатель продолжит ждать.",
    edge: "Потребитель обязан дочитать канал; ранний выход требует отдельной отмены. Вызывающий код не должен одновременно менять входной срез; умножение предполагается без переполнения.",
    extension:
      "Спроектируйте отмену через context.Context и select с ctx.Done(). Определите, кто создаёт и отменяет контекст.",
    source: "https://go.dev/blog/pipelines",
  },
  {
    language: "rust",
    level: "foundation",
    unit: "01",
    title: "Срез и заимствование без потери владения",
    concept:
      "Параметр &[i32] заимствует последовательность чисел. Функция не забирает Vec во владение и не меняет его. Тип usize подходит для количества элементов.",
    steps: [
      "Передаём &values как заимствование.",
      "Шаблон &number получает копию i32 из ссылки.",
      "Изменяем счётчик, объявленный mut.",
      "Финальное выражение без точки с запятой становится результатом.",
    ],
    code: `fn count_positive(numbers: &[i32]) -> usize {
    let mut count = 0;
    for &number in numbers {
        if number > 0 { count += 1; }
    }
    count
}
fn main() {
    let values = vec![-2, 0, 3, 3];
    assert_eq!(count_positive(&values), 2);
    assert_eq!(count_positive(&[]), 0);
    assert_eq!(values.len(), 4);
}
`,
    task: "Напишите sum_positive(numbers: &[i32]) -> i64. Складывайте положительные числа; для упражнения предположите, что итог помещается в i64.",
    solution: `fn sum_positive(numbers: &[i32]) -> i64 {
    let mut total = 0_i64;
    for &number in numbers {
        if number > 0 { total += i64::from(number); }
    }
    total
}
fn main() {
    assert_eq!(sum_positive(&[-2, 0, 3, 3]), 6);
    assert_eq!(sum_positive(&[]), 0);
    assert_eq!(sum_positive(&[-9]), 0);
}
`,
    explanation:
      "Преобразование в i64 выполняется до сложения. Более широкий тип не делает сумму произвольно длинного входа неограниченной.",
    edge: "После вызова исходный Vec остаётся доступным. Пустой срез должен давать 0, а повторяющиеся элементы учитываются отдельно.",
    extension:
      "Добавьте числовой порог и объясните, почему вход можно оставить неизменяемым заимствованием.",
    source:
      "https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html",
  },
  {
    language: "rust",
    level: "practice",
    unit: "02",
    title: "Option и корректный пустой результат",
    concept:
      "Option<T> отличает Some(value) от None. Число 0 нельзя использовать как универсальный признак отсутствия максимума: вход может состоять только из отрицательных чисел.",
    steps: [
      "До обхода лучший элемент отсутствует.",
      "Первый элемент становится кандидатом независимо от знака.",
      "Остальные сравниваются с кандидатом.",
      "Клиент отдельно рассматривает Some и None.",
    ],
    code: `fn maximum(numbers: &[i32]) -> Option<i32> {
    let mut best: Option<i32> = None;
    for &number in numbers {
        best = Some(match best {
            Some(old) if old > number => old,
            _ => number,
        });
    }
    best
}
fn main() {
    assert_eq!(maximum(&[-8, -3, -5]), Some(-3));
    assert_eq!(maximum(&[]), None);
    assert_eq!(maximum(&[0]), Some(0));
}
`,
    task: "Напишите first_positive(numbers: &[i32]) -> Option<i32>: первое положительное число либо None.",
    solution: `fn first_positive(numbers: &[i32]) -> Option<i32> {
    for &number in numbers {
        if number > 0 { return Some(number); }
    }
    None
}
fn main() {
    assert_eq!(first_positive(&[-2, 0, 7, 3]), Some(7));
    assert_eq!(first_positive(&[-2, 0]), None);
    assert_eq!(first_positive(&[]), None);
}
`,
    explanation:
      "Ранний return здесь корректен, потому что нужен первый подходящий элемент. В задаче суммирования такой ранний выход был бы ошибкой.",
    edge: "Проверьте пустой вход, одни отрицательные числа и совпадение в первом элементе. Не путайте «первое» и «максимальное».",
    extension:
      "Верните индекс как Option<usize> через enumerate. Убедитесь, что индекс 0 не считается отсутствием.",
    source: "https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html",
  },
  {
    language: "rust",
    level: "advanced",
    unit: "03",
    title: "Result и управляемый отказ вместо panic",
    concept:
      "Result отделяет успех от ошибки. Оператор ? возвращает Err из текущей функции; map_err согласует тип ошибки. Некорректный пользовательский ввод здесь — ожидаемый отказ, для которого не нужен unwrap.",
    steps: [
      "Разбираем строку как u32.",
      "Преобразуем ошибку парсера в тип задачи.",
      "Через ? завершаемся при неуспехе.",
      "После разбора отдельно отвергаем 0.",
    ],
    code: `#[derive(Debug, PartialEq)]
enum QuantityError { InvalidNumber, NotPositive }
fn quantity(text: &str) -> Result<u32, QuantityError> {
    let value = text.parse::<u32>()
        .map_err(|_| QuantityError::InvalidNumber)?;
    if value == 0 { return Err(QuantityError::NotPositive); }
    Ok(value)
}
fn main() {
    assert_eq!(quantity("12"), Ok(12));
    assert_eq!(quantity("bad"), Err(QuantityError::InvalidNumber));
    assert_eq!(quantity("0"), Err(QuantityError::NotPositive));
}
`,
    task: "Добавьте bounded_quantity(text: &str, max: u32) и варианты ошибок InvalidMaximum, TooLarge. max = 0 отвергайте до разбора строки. Верхняя граница включена.",
    solution: `#[derive(Debug, PartialEq)]
enum QuantityError { InvalidNumber, NotPositive, InvalidMaximum, TooLarge }
fn bounded_quantity(text: &str, max: u32) -> Result<u32, QuantityError> {
    if max == 0 { return Err(QuantityError::InvalidMaximum); }
    let value = text.parse::<u32>()
        .map_err(|_| QuantityError::InvalidNumber)?;
    if value == 0 { return Err(QuantityError::NotPositive); }
    if value > max { return Err(QuantityError::TooLarge); }
    Ok(value)
}
fn main() {
    assert_eq!(bounded_quantity("5", 5), Ok(5));
    assert_eq!(bounded_quantity("6", 5), Err(QuantityError::TooLarge));
    assert_eq!(bounded_quantity("0", 5), Err(QuantityError::NotPositive));
    assert_eq!(bounded_quantity("bad", 0), Err(QuantityError::InvalidMaximum));
}
`,
    explanation:
      "Порядок проверок определяет ошибку при нескольких нарушениях. Для -1 ошибка будет InvalidNumber: беззнаковый разбор завершится раньше проверки положительности.",
    edge: "Проверьте оба края диапазона и конфликт неверной границы с неверным текстом. Сведение ParseIntError к одному варианту теряет подробную причину.",
    extension:
      "Сохраните исходный ParseIntError внутри enum. Уточните, какую информацию клиент сможет показать при отказе.",
    source:
      "https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html",
  },
];
