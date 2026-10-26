# Session036 — корейская грамматика

В первых 15 уроках обновлены 60 существующих заметок: core и usage в каждом из двух сохранённых хранилищ. В начале core появились предметные учебные объяснения с образованием форм, контекстными примерами, переводами, противопоставлениями и типичными ошибками. Usage предлагает 45 новых заданий с закрытыми объяснёнными ответами:90 экземпляров заданий с учётом двух редакций.

Границы этой работы — грамматика. Словари, чтения, диалоги, тестовые страницы, содержание, китайский раздел и приложение этим исполнителем не изменялись. Старый Python-стек не затрагивался.

## Что изменилось в обучении

| Урок | Учебное ядро |
|---|---|
|01|Именное сказуемое 이다/아니다; частицы темы и подлежащего; выбор 이에요/예요|
|02|Основа, 해요체, прошедшее время, стяжения и границы регулярного спряжения|
|03|Цель движения, местонахождение, место действия, направление и вежливые указания|
|04|Заказ предмета, просьба о действии, желание и совместное предложение|
|05|Погода: наблюдение и предположение; время/тип сказуемого перед 것 같다; перечисление и контраст|
|06|Текущий процесс, подготовленный результат, до/после действия, время встречи|
|07|Навык, возможность, отсутствие возможности и разрешение|
|08|Дающий и получатель; 주다/드리다, действие для другого и обещание|
|09|Эталон сравнения, сравнительная оценка, максимум в группе и относительность оценки|
|10|Опыт, желание, намерение и ранее принятое решение|
|11|Деятель, затронутый предмет, каузатив и изменение качества|
|12|Уважение к слушателю, субъекту и получателю как разные решения|
|13|Обычное условие, выделенная гипотеза, необходимое условие и уступка|
|14|Письменный жанр, повествовательные окончания, причина и основание совета|
|15|Пересказ утверждения, предложения, указания и вопроса; источник знания|

## Конкретные исправления

Исправления в прежних разделах применялись к каждой редакции отдельно. Машинный отчёт насчитывает 58 сработавших замен по всем 60 файлам; это счётчик замен фрагментов, а не число независимых грамматических ошибок.

- Убрано безусловное объявление полной формы 의사이에요 ошибкой; для начальной практики рекомендовано обычное 의사예요.
- В -(으)세요 добавлено выпадение ㄹ: 열다 → 여세요.
- Для желания третьего лица вместо абсолютного запрета объяснены наблюдаемое желание и пересказ слов: 싶어 해요 / 싶다고 했어요.
- Исправлено ложное правило «прошедшее время перед -고 запрещено». Официальный ответ 국립국어원 прямо допускает показатели времени в обеих частях. Снято культурное обобщение об обязательной некатегоричности всех говорящих.
- -(으)ㄹ 거예요 больше не названо сокращением -(으)려고 하다. Значения последовательности с -고 и -고 나서 сопоставлены без универсальной формулы сокращения.
- Уточнено, что 못 может выражать недостаток навыка, а не только внешнюю помеху. Условие -(으)면 не ограничено исключительно реальными событиями.
- Сняты календарный запрет недавнего опыта с 적 и объявление всякого 가기로 해요 ошибкой.
- 따뜻해지다 переведено как «становиться тёплым», без постороннего «поправляться».
- В таблицах урока 12 словарные уважительные формы больше не переводятся как обязательно «вы едите/идёте». Обычные формальные окончания также не кодируют лицо.
- В 해라체 разграничены словарная форма и повествование действия: 가다 → 간다; 먹다 → 먹는다. Исправлены 쓸려고 → 쓰려고 и разбор 알려드립니다 через 알리다.
- Абсолютные формулировки об -아/어서 заменены границами выбранной базовой модели. -더라고요 снова связано с вспоминаемым личным опытом, а не с непроверенным слухом.

## Сохранность и проверки

При первоначальном применении scripts/editorial/session036/korean.ts проверил все 60 планов до записи. Сохранены 1999 прежних rendered ID, включая существовавшие aliases; добавлен 1alias для переименованного подзаголовка. Старые внутренние ссылки и frontmatter сопоставлены до/после. Проверены отсутствие дублирующихся ID, баланс details и отсутствие принудительно открытых ответов.

Оба хранилища прочитаны отдельно. В этих 15 уроках core до начала работы совпадали попарно, а usage второй редакции содержали отдельные пояснения. Эти дополнения, исходные примеры, проверки и ссылки сохранены. Удалены лишь два повторяющихся общих абзаца-задания, заменённые предметными проверками; конкретные исправления перечислены выше.

Исходные материалы находятся во внешней неизменяемой копии grammar-before-session036. После прерывания исполнителю поручено заморозить заметки и закончить отчёт; повторного --apply не выполнялось. Последующие общие проверки и независимую рецензию фиксирует главный отчёт Session036.

## Источники и пределы проверки

Новые ситуации, переводы и задания написаны для этой библиотеки. Для значений и формы использовались официальные статьи 한국어기초사전 и ответы 국립국어원; источники привязаны к конкретным утверждениям в заметках. Основные словарные статьи прочитаны через web и публичный HTML официального сайта. Ответ о формальности и статья -더라고요 дополнительно прочитаны после возобновления работы.

Сохранённый из прежней редакции ответ об 이에요/예요 (qna_seq=282616) не удалось повторно загрузить в текущей проверке: web вернул timeout/недоступность. Это ограничение доступности источника, а не подтверждение новой полной проверки этой страницы.

Полная повторная семантическая проверка каждого примера, транскрипции и упражнения больших старых банков не заявляется. Они отделены от нового ядра. Отметки A1/A2/B1 отражают существующую внутреннюю структуру и не подтверждают полного покрытия TOPIK или эквивалентности шкал. Аудио и произношение не проверялись. Публикации, commit/push и развёртывания не выполнялись.

Числовые результаты и точные пути записаны в [korean.json](korean.json); ниже приведён полный перечень 60 файлов и использованных источников.

## Полный список изменённых заметок

| Урок | Основное хранилище | Дополнительное хранилище |
|---|---|---|
|01|[core](../../knowledge/languages/korean/a1/unit-01/grammar/core.md) · [usage](../../knowledge/languages/korean/a1/unit-01/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a1/unit-01/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a1/unit-01/grammar/usage.md)|
|02|[core](../../knowledge/languages/korean/a1/unit-02/grammar/core.md) · [usage](../../knowledge/languages/korean/a1/unit-02/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a1/unit-02/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a1/unit-02/grammar/usage.md)|
|03|[core](../../knowledge/languages/korean/a1/unit-03/grammar/core.md) · [usage](../../knowledge/languages/korean/a1/unit-03/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a1/unit-03/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a1/unit-03/grammar/usage.md)|
|04|[core](../../knowledge/languages/korean/a1/unit-04/grammar/core.md) · [usage](../../knowledge/languages/korean/a1/unit-04/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a1/unit-04/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a1/unit-04/grammar/usage.md)|
|05|[core](../../knowledge/languages/korean/a1/unit-05/grammar/core.md) · [usage](../../knowledge/languages/korean/a1/unit-05/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a1/unit-05/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a1/unit-05/grammar/usage.md)|
|06|[core](../../knowledge/languages/korean/a2/unit-06/grammar/core.md) · [usage](../../knowledge/languages/korean/a2/unit-06/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a2/unit-06/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a2/unit-06/grammar/usage.md)|
|07|[core](../../knowledge/languages/korean/a2/unit-07/grammar/core.md) · [usage](../../knowledge/languages/korean/a2/unit-07/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a2/unit-07/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a2/unit-07/grammar/usage.md)|
|08|[core](../../knowledge/languages/korean/a2/unit-08/grammar/core.md) · [usage](../../knowledge/languages/korean/a2/unit-08/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a2/unit-08/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a2/unit-08/grammar/usage.md)|
|09|[core](../../knowledge/languages/korean/a2/unit-09/grammar/core.md) · [usage](../../knowledge/languages/korean/a2/unit-09/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a2/unit-09/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a2/unit-09/grammar/usage.md)|
|10|[core](../../knowledge/languages/korean/a2/unit-10/grammar/core.md) · [usage](../../knowledge/languages/korean/a2/unit-10/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/a2/unit-10/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/a2/unit-10/grammar/usage.md)|
|11|[core](../../knowledge/languages/korean/b1/unit-11/grammar/core.md) · [usage](../../knowledge/languages/korean/b1/unit-11/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/b1/unit-11/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/b1/unit-11/grammar/usage.md)|
|12|[core](../../knowledge/languages/korean/b1/unit-12/grammar/core.md) · [usage](../../knowledge/languages/korean/b1/unit-12/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/b1/unit-12/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/b1/unit-12/grammar/usage.md)|
|13|[core](../../knowledge/languages/korean/b1/unit-13/grammar/core.md) · [usage](../../knowledge/languages/korean/b1/unit-13/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/b1/unit-13/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/b1/unit-13/grammar/usage.md)|
|14|[core](../../knowledge/languages/korean/b1/unit-14/grammar/core.md) · [usage](../../knowledge/languages/korean/b1/unit-14/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/b1/unit-14/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/b1/unit-14/grammar/usage.md)|
|15|[core](../../knowledge/languages/korean/b1/unit-15/grammar/core.md) · [usage](../../knowledge/languages/korean/b1/unit-15/grammar/usage.md)|[core](../../knowledge/knowledge/languages/korean/b1/unit-15/grammar/core.md) · [usage](../../knowledge/knowledge/languages/korean/b1/unit-15/grammar/usage.md)|

## Официальные источники по конкретным правилам

- [이다: именное сказуемое](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86232). Словарная статья определяет 이다 как средство отнести подлежащее к категории/свойству.
- [국립국어원: 이에요 и 예요](https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&pageIndex=1&qna_seq=282616). После гласной 예요 — сокращённая форма 이에요.
- [-아요: форма и употребление](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86568). Словарь связывает -아요 с последней гласной основы ㅏ/ㅗ и показывает утверждения, вопросы и побуждения.
- [-여: сочетание с 하다](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86095). Статья указывает 하다 и производные на 하다 как окружение формы -여; в разговорной форме встречается 해.
- [에서: место действия и исходная точка](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=68853). В словаре отдельно выделены место действия и исходный пункт; это разные прочтения одной частицы.
- [로: направление и выбор формы](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=85761). Форма 로 употребляется после гласной или ㄹ; статья описывает направление, путь и средство.
- [-고 싶다: желание действия](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=75269). Статья определяет выражение как желание совершить действие и указывает присоединение к глаголу.
- [하다: -어하다](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=62888). Значение 9 описывает выражение чувства через -어하다; эта модель помогает отличать наблюдаемое состояние другого человека.
- [-ㄹ 것 같다: предположение](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=71833). Статья описывает предположение и окружение формы после гласной/ㄹ; у согласной используется -을.
- [국립국어원: время перед -고](https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=&pageIndex=1&qna_seq=320471). Ответ от 9 сентября 2025 подтверждает допустимость -었-/-겠- в обеих соединяемых частях.
- [두다: сохранение результата](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=48279). Вспомогательный 두다 описывает выполнение действия с дальнейшим сохранением результата.
- [-ㄴ: завершённое действие перед существительным](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=78634). Определительная форма -ㄴ описывает предшествующее/завершённое действие; это основа сочетаний типа 만든 후에.
- [-을 수 있다: способность и возможность](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86661). Словарь разделяет значение способности и значение возможного действия/состояния.
- [-아/어 보다: проба и опыт](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=62171). Вспомогательный 보다 позволяет отдельно выразить пробу действия, не утверждая освоенный навык.
- [드리다: почтительная передача](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=61168). В статье приведена конструкция с дающим, получателем и передаваемым предметом.
- [드리다 как вспомогательный глагол](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=59252). Отдельная статья описывает -어 드리다 как почтительное действие для другого лица.
- [보다: частица сравнения](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=70060). Словарь определяет 보다 как обозначение объекта, служащего точкой сравнения; примеры допускают порядок B보다 A.
- [적: прошлый случай](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=71232). Статья связывает 적 со временем/случаем события; не устанавливает запрета на недавний опыт.
- [-기로 하다: решение или обещание](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=78337). Словарь описывает выбор/обещание действия и показывает не только прошедшее, но и принятие решения через -기로 해요.
- [닫히다: значение и управление](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=62364). Словарь даёт модель 1이 닫히다 и описывает закрытие дверей/крышек, включая непроизвольные события.
- [-으시-: уважение к субъекту](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80329). Статья описывает субъектное уважение; отдельно отмечает косвенное уважение через связанный с человеком предмет/состояние.
- [-다면: допущение ситуации](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=68834). Словарь определяет -다면 через допущение факта/ситуации и ограничивает эту форму прилагательными и показателями времени; для глаголов даёт иные варианты.
- [-여야: необходимое условие](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80225). Первое значение описывает необходимое условие; статья также показывает, почему не все употребления формы сводятся к одной схеме.
- [-어서: несколько типов связи](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80215). В словаре различены последовательность, причина и способ; одна графическая форма не означает одну связь.
- [국립국어원: формальность и вежливость](https://korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=84&pageIndex=1&qna_seq=335566). Официальное пояснение различает формальный и неформальный уровни обращения; неформальный 해요체 остаётся вежливым.
- [-는다고: содержание пересказа](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86059). Статья описывает передачу услышанного или мыслей и указывает форму после согласной основы действия, кроме ㄹ.
- [-더라고요: личный опыт](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=82330). Словарная статья связывает форму с содержанием, которое говорящий ранее непосредственно испытал/наблюдал.
