import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../../../lib/knowledge";

// Session037 retained-bank corrections. Before-images are mandatory; this is not
// a general migration and must not be run against another editorial baseline.
const backup = process.env.GRAMMAR_BEFORE ||
  "C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/grammar-before-session037";
const fence = String.fromCharCode(96).repeat(3);
type Repair = { id: string; from: string; to: string; count?: number };
const repairs: Record<string, Repair[]> = {
  "1/core": [
    {
      id: "formal-declarative-l",
      from: "После гласной: **ㅂ니다**\nПосле согласной: **습니다**",
      to: "Окончания присоединяются к основе без 다. После гласной — **-ㅂ니다**: 가다 → 갑니다. После согласной кроме ㄹ — **-습니다**: 먹다 → 먹습니다. Конечная ㄹ перед -ㅂ니다 выпадает: 살다 → 삽니다, 만들다 → 만듭니다. Это форма сообщения в 합니다체, а не показатель лица «я/вы».\n\n[국립국어원: выпадение ㄹ перед -ㅂ니다](https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&pageIndex=1&qna_seq=327855) · [한국어기초사전: -ㅂ니다](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=79397&nation=eng).",
    },
    {
      id: "negative-key-complete",
      from: "4. 저는 선생님이 아닙니다 / 아니에요",
      to: "4. 저는 선생님이 아닙니다. / 저는 선생님이 아니에요. В обеих полных версиях 선생님이 относится к 아니다.",
    },
  ],
  "2/core": [
    {
      id: "hayo-regular-scope",
      from: "- Если последняя гласная другая (не ㅏ/ㅗ) → **어요**",
      to: "- Для регулярных основ с другой последней гласной (не ㅏ/ㅗ) → **어요**; 하다 рассматривается отдельно ниже",
    },
    {
      id: "hayo-not-always-contracted",
      from: "- 하다 всегда → **해요**",
      to: "- 하다 → **해요** в обычной разговорной практике. 해요 — сокращённая форма 하여요, а не единственно возможная полная форма. [국립국어원, 한글 맞춤법 §34: 하여 → 해](https://korean.go.kr/kornorms/m/m_regltn.do).",
    },
    {
      id: "progressive-not-only-now",
      from: "**Правило:** основа глагола + 고 있다 — действие происходит прямо сейчас.",
      to: "**Правило:** основа глагола + 고 있다 описывает продолжающееся действие. 먹고 있어요 в текущей ситуации — «ем сейчас», а 어제 여덟 시에 먹고 있었어요 — «вчера в восемь я ел(а)». Время задаётся формой 있다 и контекстом; конструкция не ограничена минутой речи. У некоторых глаголов возможен сохраняющийся результат: 안경을 쓰고 있어요 — «на мне очки». [한국어기초사전: 있다 как вспомогательный глагол](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=72238&lang=eng).",
    },
    {
      id: "go-listing-vs-order",
      from: fence + "\n-고 соединяет два действия в порядке выполнения:\n\n아침에 일어나고 샤워해요.",
      to: "-고 может перечислять равноправные факты или связывать последовательные действия. Порядок устанавливается смыслом: 밥을 먹고 학교에 가요 обычно означает «поел(а), затем иду в школу», а 저는 한국어를 배우고 동생은 일본어를 배워요 — два параллельных факта («я учу корейский, младший брат/сестра — японский»). [한국어기초사전: -고, значения1–2](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=78583).\n\n" + fence + "\n아침에 일어나고 샤워해요.",
    },
    {
      id: "future-l-and-politeness",
      from: "**Правило:** основа + ㄹ/을 거예요 — намерение/план (+ 존댓말 -거예요).",
      to: "**Правило:** после гласной — -ㄹ 거예요 (가다 → 갈 거예요), после согласной кроме ㄹ — -을 거예요 (먹다 → 먹을 거예요). У основы на ㄹ новая ㄹ не добавляется: 살다 → 살 거예요. Форма может выражать план или предположение; 요 делает обращение вежливым. Пишем пробел перед 거예요: 갈 거예요.",
    },
    {
      id: "exam-agent-translation",
      from: "다음 주에 시험을 볼 거예요. — На следующей неделе будет экзамен.",
      to: "다음 주에 시험을 볼 거예요. — На следующей неделе буду сдавать экзамен.",
    },
    {
      id: "work-key-context",
      from: "4. 출근하지 못해요 / 못 가요.",
      to: "4. 출근하지 못해요. / 회사에 못 가요. — Не могу пойти на работу. Во втором варианте место названо явно.",
    },
  ],
  "3/core": [
    {
      id: "ability-l",
      from: "- После гласной/ㄹ: **-ㄹ 수 있다**\n- После согласной: **-을 수 있다**",
      to: "- После гласной добавляем ㄹ: 가다 → 갈 수 있어요.\n- У основы на ㄹ сохраняем одну ㄹ: 만들다 → 만들 수 있어요.\n- После другой согласной — 을: 먹다 → 먹을 수 있어요. Между формой глагола, 수 и 있다 нужны пробелы.\n\n[한국어기초사전: -ㄹ 수 있다](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86664&nation=eng) · [-을 수 있다](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86661).",
    },
    {
      id: "inability-vs-ban",
      from: "여기에서 사진을 찍을 수 없어요. — Здесь нельзя фотографировать.",
      to: "여기에서 사진을 찍을 수 없어요. — Здесь не могу фотографировать (например, из-за неисправной камеры).",
    },
    {
      id: "inability-vs-ban-context",
      from: "Возможность/способность.\n\n" + fence,
      to: "Возможность/способность. По ситуации невозможность может быть связана и с правилами, но сама форма не называет причину ограничения. Для прямого запрета из раздела7 используйте 여기에서 사진을 찍으면 안 돼요 — «Здесь нельзя фотографировать».\n\n" + fence,
    },
  ],
  "4/core": [
    {
      id: "request-noun-vs-action",
      from: "**Структура:** [основа глагола] + 아/어 주세요 (после ㅏ/ㅗ: 아주세요, после других гласных: 어주세요, 하다 → 해주세요)",
      to: "**Структура:** предмет + 주세요 — просьба дать предмет: 물을 주세요. Для просьбы выполнить действие используем основу + -아/어 주세요: 읽어 주세요, 기다려 주세요, 해 주세요. У основ с ㅏ/ㅗ обычно -아, с другими гласными -어; 하다 → 해 주세요. Нерегулярные основы проверяем отдельно: 돕다 → 도와주세요. В 물을 주세요 глагол уже 주다; дополнительное -아/어 перед 주세요 не вставляется.",
    },
    {
      id: "lkkayo-l",
      from: "После гласной: **-ㄹ까요**, после согласной: **-을까요**",
      to: "После гласной добавляем ㄹ: 가다 → 갈까요? После согласной кроме ㄹ — 을까요: 먹다 → 먹을까요? У основы на ㄹ сохраняем одну ㄹ: 만들다 → 만들까요? [한국어기초사전: -ㄹ까요](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=82350&nation=eng) · [-을까요](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=82348).",
    },
    {
      id: "meal-statement-vs-wish",
      from: "맛있게 먹습니다.               — Ем с удовольствием / приятного аппетита.",
      to: "맛있게 먹습니다.               — Ем с удовольствием. (Сообщение, не пожелание.)",
    },
    {
      id: "ge-meaning",
      from: "**Примечание:** Наречие на -게 может модифицировать глаголы действия. Также 잘 먹겠습니다 — более формальная вежливая форма перед едой.",
      to: "**Примечание:** В 맛있게 먹습니다 форма 맛있게 описывает, как едят, а -습니다 завершает сообщение. Пожелание адресату можно выразить 맛있게 드세요 — «Приятного аппетита». 잘 먹겠습니다 произносят перед собственной едой как благодарность за угощение; это другая реплика, а не замена любого наречия на -게. [한국어기초사전: -게](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=77326&nation=eng), [-ㅂ니다: сообщение](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=79397&nation=eng).",
    },
    {
      id: "ability-l",
      from: "После гласной/ㄹ: **-ㄹ 수 있다**, после остальных согласных: **-을 수 있다**",
      to: "После гласной добавляем ㄹ (가다 → 갈 수 있어요), после согласной кроме ㄹ — 을 (먹다 → 먹을 수 있어요). У основы на ㄹ дополнительная ㄹ не нужна: 만들다 → 만들 수 있어요. [한국어기초사전: -ㄹ 수 있다](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=86664&nation=eng).",
    },
    {
      id: "aseo-hada-and-other-construction",
      from: "После ㅏ, ㅗ: **-아서**, после остальных: **-어서**",
      to: "Для регулярных основ с последней гласной ㅏ/ㅗ обычно **-아서**, с другими гласными **-어서**; 하다 → 해서. Учитывайте изменения основы: 배가 고프다 → 배가 고파서, 맵다 → 매워서. [한국어기초사전: -아서, значение2](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80220&nation=eng).",
    },
    {
      id: "gonaiseo-other-construction",
      from: "**Примечание:** -아/어서 выражает причину или основание для действия. Это одна из самых употребительных конструкций в разговорном корейском.",
      to: "**Примечание:** Первые пять примеров показывают причину. Последний, 운동하고 나서 샤워해요, содержит другую конструкцию -고 나서: «закончив тренировку, принимаю душ». Не образуйте из него правило для -아/어서.",
    },
    {
      id: "progressive-time-consistency",
      from: "**Примечание:** -고 있다 описывает процесс, который происходит прямо сейчас. Говоря о человеке с уважением, можно использовать -고 계시다; обычное -고 있어요 тоже вежливо по отношению к слушателю.",
      to: "**Примечание:** -고 있다 описывает продолжающееся действие; в этих примерах оно происходит сейчас. О прошлом можно сказать 먹고 있었어요 — «ел(а) в тот момент». Говоря о человеке с уважением, можно использовать -고 계시다; обычное -고 있어요 тоже вежливо по отношению к слушателю.",
    },
    {
      id: "subject-honorification-and-seated-result",
      from: "**Примечание:** -고 계세요 — это вежливая форма -고 있다. Используется, когда говорящий хочет проявить уважение к действию другого человека.",
      to: "**Примечание:** 계시다 выражает уважение к действующему человеку; 요 отдельно делает речь вежливой по отношению к слушателю. 기다리고 계세요 описывает процесс ожидания. 앉아 계세요 устроено иначе: -아 있다 передаёт состояние после того, как человек сел. Последнее предложение 주문이 준비되고 있어요 — обычный процесс подготовки заказа без возвышения предмета. Не заменяйте любое 있어요 на 계세요.",
    },
    {
      id: "recipient-register",
      from: "**Структура:** [существительное] + 한테 (неформальное) / 에게 (формальное)",
      to: "**Структура:** получатель действия + 한테 / 에게. 한테 преимущественно разговорное, 에게 — нейтральная частица, встречающаяся и в письменной речи. Они сами по себе не выбирают вежливое окончание предложения; уважительная частица к получателю — 께. [한국어기초사전: 한테](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=69714).",
    },
    {
      id: "recipient-register-consistency",
      from: "**Примечание:** 한테 — более разговорная форма, 에게 — более формальная. 께 — уважительный вариант 한테/에게: 선생님께. 씨/님 — элементы обращения и сами эту частицу не заменяют.",
      to: "**Примечание:** 한테 преимущественно разговорное, 에게 — нейтральная частица. 께 — уважительный вариант 한테/에게: 선생님께. 씨/님 — элементы обращения и сами эту частицу не заменяют.",
    },
    {
      id: "recipient-honorific-translation",
      from: "선생님께 질문을 했어요.          — Задал вопрос учителю (формально).",
      to: "선생님께 질문을 했어요.          — Задал(а) вопрос учителю (с уважением к учителю).",
    },
    {
      id: "nikka-reason-not-necessarily-shared",
      from: "**Примечание:** -니까 выражает причину, которую говорящий считает очевидной или которую разделяет с собеседником. Часто переводится как \"ведь\", \"раз\".",
      to: "**Примечание:** -(으)니까 выделяет основание для следующей мысли или действия; собеседник не обязан уже знать или разделять это основание. Сравните сообщение 비가 와서 우산을 가져왔어요 — «Из-за дождя я взял(а) зонт» и совет 비가 오니까 우산을 가져가세요 — «Раз идёт дождь, возьмите зонт». [한국어기초사전: -니까](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80139&nation=eng).",
    },
    {
      id: "hungry-translation",
      from: "배가 고프니까 밥을 먹었어요.     — Потому что голоден, поел рисом.",
      to: "배가 고프니까 밥을 먹었어요.     — Был(а) голоден/голодна, поэтому поел(а).",
    },
    {
      id: "neun-dongan-relative-time",
      from: "**Примечание:** -는 동안 означает «пока, в течение (параллельного действия)». Присоединяется к основе глагола в настоящем времени.",
      to: "**Примечание:** -는 동안 задаёт период продолжающегося действия, на фоне которого происходит другое. Форма -는 здесь не ограничивает весь рассказ настоящим: 기다리는 동안 메뉴를 봤어요 уже описывает прошлое. При плане возможно 친구가 요리하는 동안 제가 상을 차릴 거예요 — «Пока друг будет готовить, я накрою на стол». Время устанавливается по всему предложению. [한국어기초사전: -는 동안](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=85732&nation=eng).",
    },
    {
      id: "relative-time-l",
      from: "**Примечание:** -(으)ㄹ 때 выражает время «когда...». После гласной/ㄹ — ㄹ 때, после согласной — 을 때.",
      to: "**Примечание:** -(으)ㄹ 때 выражает время «когда...»: 가다 → 갈 때; 먹다 → 먹을 때. У основы на ㄹ дополнительная ㄹ и 으 не нужны: 만들다 → 만들 때. Эта форма может описывать привычную или ожидаемую ситуацию, а не только будущее.",
    },
  ],
  "5/core": [
    {
      id: "weather-predicate-structure",
      from: "**Структура:** 날씨 + глагол / прилагательное",
      to: "**Структура зависит от явления:** 날씨가 맑아요 / 흐려요 — о состоянии погоды; 비가 와요 / 눈이 와요 — об осадках; 바람이 불어요 — о ветре. Не подставляйте 날씨 вместо 비 в 비가 와요. [한국어기초사전: 흐리다, значение5](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=89184).",
    },
    {
      id: "embedded-negative-translation",
      from: "비가 올 것 같지 않아요.      — Похоже, дождя не будет.",
      to: "비가 올 것 같지 않아요.      — Не похоже, что пойдёт дождь.",
    },
    {
      id: "go-parts-of-speech",
      from: "**Структура:** [основа глагола] + 고 + [глагол]",
      to: "**Структура:** основа глагола или прилагательного + -고 + следующая часть предложения; для 이다 — 학생이고. Это позволяет соединять не только действия, но и состояния: 날씨가 좋고 바람이 불어요. [한국어기초사전: -고, значение1](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=78583).",
    },
    {
      id: "neunde-noun-and-existentials",
      from: "**Структура:** [основа глагола] + 는데, [основа прилагательного] + (으)ㄴ데",
      to: "**Структура в настоящем:** глагол действия + -는데, прилагательное + -(으)ㄴ데, существительное + -인데. Есть особенности основ: 춥다 → 추운데, 살다 → 사는데; 있다/없다 → 있는데/없는데. Поэтому 주말인데 в примере ниже содержит именное сказуемое, а не пропущенный глагол действия.",
    },
    {
      id: "purpose-reo-l",
      from: "После гласной: **-러 가다**, после согласной: **-으러 가다**",
      to: "После гласной и ㄹ — **-러 가다**: 보다 → 보러 가요; 놀다 → 놀러 가요. После другой согласной — **-으러 가다**: 먹다 → 먹으러 가요. Это цель движения, а не окончание будущего времени. [한국어기초사전: -러](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80300&nation=eng).",
    },
    {
      id: "honorific-examples-distinguished",
      from: "## 12. -고 계세요 (вежливая форма продолженного действия)\n\n" + fence,
      to: "## 12. -고 계세요 (вежливая форма продолженного действия)\n\n계시다 относится к человеку, о котором говорят с уважением. В примерах ниже 기다리고 계세요 — процесс ожидания с уважением к официанту; 앉아 계세요 — состояние сидящего гостя (-아 있다). Заказ и погода получают обычное 있어요; их присутствие в списке не делает эти фразы примерами -고 계세요. О различии уважения к субъекту и вежливого 요 см. уточнение ниже.\n\n" + fence,
    },
    {
      id: "hungry-translation",
      from: "배가 고프니까 밥을 먹었어요.     — Потому что голоден, поел рисом.",
      to: "배가 고프니까 밥을 먹었어요.     — Был(а) голоден/голодна, поэтому поел(а).",
    },
    {
      id: "hungry-prompt",
      from: "9. \"Переведите на корейский: Потому что голоден, поел рисом\"",
      to: "9. \"Переведите на корейский: Был(а) голоден/голодна, поэтому поел(а)\"",
    },
    {
      id: "recipient-honorific-translation",
      from: "선생님께 질문을 했어요.          — Задал вопрос учителю (формально).",
      to: "선생님께 질문을 했어요.          — Задал(а) вопрос учителю (с уважением к учителю).",
    },
  ],
};
const mirrorRepairs: Record<string, Repair[]> = {
  "2/usage": [
    {
      id: "mirror-hayo-not-blanket",
      from: "Если последняя гласная основы ㅏ или ㅗ — добавляем -아요 (가다 -> 가요, 보다 -> 봐요). Для всех остальных гласных — -어요 (먹다 -> 먹어요, 마시다 -> 마셔요). Глаголы на 하다 всегда переходят в 해요.",
      to: "Для регулярной основы с последней гласной ㅏ/ㅗ выбираем -아요 (가다 → 가요, 보다 → 봐요), с другой гласной — -어요 (먹다 → 먹어요, 마시다 → 마셔요). 하다 отдельно даёт обычную краткую форму 해요 из 하여요. Это схема для регулярных форм, а не отмена чередований: 듣다 → 들어요, 춥다 → 추워요. [국립국어원, 한글 맞춤법 §34: 하여 → 해](https://korean.go.kr/kornorms/m/m_regltn.do).",
    },
    {
      id: "mirror-hayo-not-always-contracted",
      from: "✅ 해요 — Глагол 하다 в разговорном стиле всегда имеет форму 해요.",
      to: "✅ 해요 — Для этой разговорной практики используем краткую форму 해요. Полная форма 하여요 возможна; 하다어요 ошибочно из-за сохранённого словарного 다 и неверного присоединения.",
    },
  ],
  "4/usage": [
    {
      id: "request-object-not-prohibited",
      from: "✅ 물을 주세요 («Дайте воды») или 도와주세요 («Помогите»). Не смешивайте существительное с глагольной просьбой.",
      to: "✅ 물을 주세요 («Дайте воды») или 도와주세요 («Помогите»). Для просьбы дать воду нужен 주다, а не 돕다. Существительное может быть объектом глагольной просьбы: 이 책을 읽어 주세요 — «Прочитайте эту книгу, пожалуйста». Ошибка здесь в выборе действия, а не в сочетании существительного и глагола.",
    },
  ],
  "5/usage": [
    {
      id: "mirror-weather-predicate",
      from: "Слова 날씨 (погода), 비 (дождь), 눈 (снег) используются с глаголами 오다 (идти) или 내리다 (выпадать): 비가 와요.",
      to: "Для дождя и снега возможны 오다/내리다: 비가 와요, 눈이 내려요. Со словом 날씨 описываем состояние: 날씨가 맑아요 / 흐려요. Не переносите модель осадков на 날씨: оно не становится подлежащим к 오다 в значении «идёт дождь». [한국어기초사전: 흐리다, значение5](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=89184).",
    },
  ],
};

function replaceUnique(raw: string, r: Repair): string {
  const variants = [...new Set([r.from, r.from.replaceAll("\n", "\r\n")])];
  const present = variants.filter((v) => raw.includes(v));
  assert.equal(present.length, 1, "Missing/ambiguous repair " + r.id);
  const needle = present[0];
  assert.equal(raw.split(needle).length - 1, r.count || 1, "Unexpected occurrence count: " + r.id);
  const replacement = needle.includes("\r\n") ? r.to.replaceAll("\n", "\r\n") : r.to;
  return raw.split(needle).join(replacement);
}
function rendered(raw: string, slug: string) {
  return load(renderMarkdown(matter(raw).content, slug).html);
}
function metadata(raw: string) {
  return /^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(raw)?.[0] || "";
}
const plans: { slug: string; before: string; after: string; repairs: string[] }[] = [];
for (const prefix of ["", "knowledge/"]) {
  for (let unit = 1; unit <= 5; unit++) {
    for (const kind of ["core", "usage"]) {
      const slug = prefix + "languages/korean/a1/unit-" + String(unit).padStart(2, "0") + "/grammar/" + kind;
      const before = fs.readFileSync(path.join(backup, slug + ".md"), "utf8");
      let after = before;
      const selected = [...(repairs[unit + "/" + kind] || []), ...(prefix ? mirrorRepairs[unit + "/" + kind] || [] : [])];
      for (const r of selected) after = replaceUnique(after, r);
      const marker = kind === "core" ? "## Расширенный справочник урока" : "<summary>Прежний разбор";
      assert(before.includes(marker), "Missing retained-bank boundary: " + slug);
      assert.equal(after.slice(0, after.indexOf(marker)), before.slice(0, before.indexOf(marker)), "Session036 block changed: " + slug);
      assert.equal(metadata(after), metadata(before), "Frontmatter bytes changed: " + slug);
      const old = rendered(before, slug);
      const next = rendered(after, slug);
      const ids = next("[id]").map((_, el) => next(el).attr("id")).get();
      assert.equal(new Set(ids).size, ids.length, "Duplicate IDs: " + slug);
      old("[id]").each((_, el) => assert(ids.includes(old(el).attr("id")!), "Lost ID: " + slug + "#" + old(el).attr("id")));
      const hrefs = new Set(next("a[href]").map((_, el) => next(el).attr("href")).get());
      old("a[href]").each((_, el) => assert(hrefs.has(old(el).attr("href")!), "Lost href: " + slug + " " + old(el).attr("href")));
      plans.push({ slug, before, after, repairs: selected.map((r) => r.id) });
    }
  }
}
if (process.argv.includes("--apply")) {
  for (const p of plans) assert.equal(fs.readFileSync(path.join("knowledge", p.slug + ".md"), "utf8"), p.before, "Current content differs from before-image: " + p.slug);
  for (const p of plans) if (p.before !== p.after) fs.writeFileSync(path.join("knowledge", p.slug + ".md"), p.after, "utf8");
}
if (!process.argv.includes("--plan")) {
  for (const p of plans) assert.equal(fs.readFileSync(path.join("knowledge", p.slug + ".md"), "utf8"), p.after, "Unexpected current text: " + p.slug);
}
const changed = plans.filter((p) => p.before !== p.after);
const report = {
  session: 37,
  language: "korean",
  inspectedFiles: plans.length,
  changedFiles: changed.length,
  replacementOccurrences: changed.reduce((n, p) => n + p.repairs.length, 0),
  preserved: ["Session036 teaching-prefix bytes", "frontmatter bytes", "all rendered IDs/aliases", "all existing hrefs", "unchanged candidates"],
  changed: changed.map((p) => ({ path: "knowledge/" + p.slug + ".md", repairs: p.repairs })),
  unchanged: plans.filter((p) => p.before === p.after).map((p) => "knowledge/" + p.slug + ".md"),
};
if (!process.argv.includes("--plan")) fs.writeFileSync("reports/session037/korean-verification.json", JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ status: process.argv.includes("--plan") ? "PLANNED" : "PASS", ...report }, null, 2));
