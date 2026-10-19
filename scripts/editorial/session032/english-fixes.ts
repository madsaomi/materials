import { slugify } from "../../../lib/knowledge";
function rep(s:string,a:string,b:string) { if(!s.includes(a)) throw new Error("Missing legacy wording: "+a.slice(0,95)); return s.replace(a,b); }
function heading(s:string,a:string,b:string) { return rep(s,a,`<span id="${slugify(a.replace(/^#+\s*/,""))}" aria-hidden="true"></span>\n\n${b}`); }
export function fix(n:number,part:string,raw:string):string {
  let s=raw;
  if(part==="grammar/core") {
    if(n===11) {
      s=rep(s,"ever — когда-нибудь (только в вопросах)","ever — когда-либо; часто в вопросах, но не только в них");
      s=rep(s,"Дополнительно: вместо **have been to** можно сказать **have been in** — «находился какое-то время» (подчёркивает длительность):", "Отдельная модель **have been in** описывает нахождение в месте в течение периода и не является автоматической заменой опыта **have been to**:");
    }
    if(n===12) {
      s=rep(s,"- Не уверены или разговорная речь? → that подойдёт в обоих случаях.","- В определяющем придаточном that может относиться к людям и предметам; это не замена who/which в любом контексте. После запятой в non-defining clause that не используется.");
      s=rep(s,"Если относительное местоимение является **объектом** (на него «падает» действие), его можно опустить. Если оно **подлежащее** — опустить нельзя.","В определяющем придаточном относительное местоимение-дополнение можно опустить: the film (that) I watched. В полном придаточном местоимение-подлежащее сохраняется. В non-defining clause местоимение не опускают даже в роли дополнения.");
      s=rep(s,"Неисчисляемые существительные (music, art, literature, theatre, poetry) не используются с **a/an** и не имеют множественного числа.","В неисчисляемом значении music, art, literature, theatre и poetry не получают a/an или обычное множественное число. Значение слова нужно проверять: a theatre — здание театра, an art — отдельное искусство/умение.");
      s=rep(s,"- ✗ ~~an art~~ — art неисчисляемое: нет a/an.","- Для искусства вообще: art, без a/an. An art возможно в отдельном исчисляемом значении; не объявляйте сочетание безусловно ошибочным.");
      s=rep(s,"| Directors choose the actors. | The actors **are chosen** by the director. |", "| The director chooses the actors. | The actors **are chosen** by the director. |");
      s=rep(s,"- The British Museum is **the most visited** museum in London. — Британский музей — самый посещаемый музей Лондона.","- Of the three museums in this fictional town, this is **the most visited**. — Из трёх музеев вымышленного города этот самый посещаемый по условию примера.");
    }
    if(n===13) {
      s=rep(s,"- Zero = всегда верно:","- Zero = общее или повторяемое условие:");
      s=rep(s,"Некоторые глаголы (state verbs) не используются в Continuous:","Некоторые глаголы состояния (stative verbs) в обычном значении состояния обычно не используются в Continuous:");
      s=rep(s,"Используется для **всегда верных фактов, инструкций, законов**.","Базовая модель описывает общие связи, повторяемые ситуации или правила. Учебный пример не доказывает универсальную техническую истинность его содержания.");
      s=rep(s,"| If you restart the computer, it fixes the problem. | Если перезагрузить компьютер, проблема исправляется. |","| In this demo, if you press Save, the app creates a copy. | В этой учебной демонстрации нажатие Save создаёт копию. |");
      s=rep(s,"| If you click on that link, you get a virus. | Если нажать на ту ссылку, получаешь вирус. |","| In this game, if you click the red square, you lose a point. | В этой учебной игре нажатие красного квадрата отнимает очко. |");
      s=rep(s,"> ⚠️ В части с **if** никогда не ставим will: *If you will update* — ❌ → *If you update* — ✅.","> В базовой модели будущего условия после if ставим Present Simple: If you update…. Это не общий запрет will во всех значениях: например, If you will help me… может выражать готовность помочь. Различайте контексты.");
    }
    if(n===14) {
      s=heading(s,"## 2. Past Continuous vs Past Simple — длительное и короткое действие","## 2. Past Continuous vs Past Simple — процесс и событие");
      s=rep(s,"| Past Simple | V2 | Короткое завершённое действие |","| Past Simple | V2 | Событие, представленное целиком; оно может быть длительным |");
      s=rep(s,"| Past Continuous | was / were + V-ing | Длительное действие в прошлом (фон) |","| Past Continuous | was / were + V-ing | Процесс в выбранный прошлый момент, часто фон |");
      s=rep(s,"**When** + Past Simple (короткое), **while** + Past Continuous (длительное).","Одна частая схема: when + событие, while + процесс. Это учебный пример сочетания, а не правило выбора времени по одному союзу или длительности.");
      s=rep(s,"- С прилагательными и маленькими известными словами: **dos shore** не употребляйте the в выражениях «by sea», «at sea».","- Устойчивые выражения by sea и at sea употребляются без артикля; они не задают правило для любого сочетания со словом sea.");
      s=rep(s,"Названия со словом «республика/королевство/президентство»", "Многие составные названия со словами Republic, Kingdom, States");
    }
    if(n===15) {
      s=rep(s,"Слова-исключения (не используются в Continuous: чувства и состояния):","Глаголы, обычно не используемые в Continuous в значении состояния (другие значения и экспрессивные употребления проверяются по контексту):");
      s=rep(s,"Ошибка русских: с since/for русские часто ставят Past Simple — это неверно.","Если состояние продолжается сейчас, в этой модели нужен Present Perfect, а не Past Simple. Но for может сопровождать завершённый прошлый период: I lived there for two years, then moved away.");
      s=rep(s,"| Present Continuous (с расписанием) |", "| Present Continuous (с договорённостью) |");
      s=rep(s,"a перед согласной, an перед гласной", "a перед согласным звуком, an перед гласным звуком");
      s=rep(s,"Сдвиг: am → was, will → would, have done → had done, today → that day, here → there.","Возможный сдвиг при сообщении из прошлого: am → was, will → would, have done → had done. Он не механический во всех контекстах: сохраняющаяся истина может передаваться без сдвига, а today/here меняются только при изменении временной/пространственной точки отсчёта. В косвенном вопросе нужен порядок утверждения: He asked where she lived.");
      s=rep(s,"on the bus/train/plane (в транспорте, где можно ходить), но in the car (в маленьком авто).","Обычные сочетания: on the bus/train/plane, in the car/taxi. Возможность ходить внутри — вспомогательная ассоциация, а не универсальное правило выбора предлога (сравните on a bicycle).");
    }
  }
  if(part==="practice/exercises"&&n===13) {
    s=heading(s,"## Упражнение 1: Выберите Present Simple или Present Continuous","## Упражнение 1: Привычка, процесс и период до настоящего");
    s=rep(s,"6. We (use / are using) this app for two years already. *(Обычно — см. примечание)*","6. We (have used / have been using) this app for two years and still use it. В этом пункте повторяем Present Perfect: допустимы две формы с разным акцентом.");
    s=rep(s,"6. use (long-term habit — here present simple is natural; present perfect continuous also possible but not yet covered)","6. have used / have been using (период до настоящего; simple показывает факт использования, continuous выделяет процесс/длительность)");
    s=rep(s,"Вставьте подходящий модальный глагол: **must / have to / should**.","Вставьте must / have to / should или их нужную отрицательную форму. В некоторых обязанностях возможны must и have to; ключ указывает варианты. Ориентируйтесь на данное значение, а не на представление о единственно возможном глаголе.");
    s=rep(s,"4. must; 5. should; 6. mustn't; 7. have to; 8. don't have to.","4. must / have to; 5. should; 6. mustn't; 7. have to / must; 8. don't have to.");
    s=rep(s,"8. If you (update) the app, it always (work) better.","8. In this demo, if you (press) Save, the app (create) a copy.");
    s=rep(s,"8. update, works (Zero).","8. press, creates (Zero; заданное поведение учебной демонстрации, не обещание улучшения после любого обновления).");
  }
  return s;
}
