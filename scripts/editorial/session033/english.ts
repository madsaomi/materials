import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import matter from "gray-matter";
import {load} from "cheerio";
import {renderMarkdown} from "../../../lib/knowledge";
import {units} from "./english-content";
import {fix,corrections} from "./english-fixes";
const backup="C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session033/english";
const apply=process.argv.includes("--apply"),check=process.argv.includes("--check");
assert(!(apply&&check));
if(apply) assert(!fs.existsSync(path.join(backup,"manifest.json")),"Already applied; use --check");
const fold=(title:string,body:string)=>"<details>\n<summary>"+title+"</summary>\n\n"+body+"\n\n</details>";
const numbered=(items:string[])=>items.map((s,i)=>(i+1)+". "+s).join("\n");
const sources:Record<string,string>={
  "01":"[Cambridge: артикли](https://dictionary.cambridge.org/grammar/british-grammar/the). [British Council: интонация](https://www.teachingenglish.org.uk/professional-development/teachers/knowing-subject/using-intonation).",
  "02":"[British Council: Present Simple](https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar/present-simple). [Cambridge: артикли](https://dictionary.cambridge.org/grammar/british-grammar/the). [Cambridge: person/persons/people](https://dictionary.cambridge.org/grammar/british-grammar/person-persons-or-people).",
  "03":"[British Council: сравнения](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives). [British Council: количество](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/quantifiers).",
  "04":"[British Council: притяжательные формы](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/possessives-pronouns).",
  "05":"[British Council: количество и some/any](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/quantifiers). [Cambridge: неисчисляемый продукт и единицы](https://dictionary.cambridge.org/grammar/british-grammar/the)."
};
const plans:{slug:string;raw:string;next:string}[]=[];
let oldIds=0;
for(const prefix of ["","knowledge/"]) for(const u of units) for(const part of ["vocabulary/words","dialogue","test"]) {
  assert.equal(u.words.length,10);assert.equal(u.tasks.length,8);assert.equal(u.solutions.length,8);
  const slug=prefix+"languages/english/a1/unit-"+u.n+"/"+part;
  const file=path.join("knowledge",slug+".md"),current=fs.readFileSync(file,"utf8");
  const raw=check?fs.readFileSync(path.join(backup,slug+".md"),"utf8"):current;
  const parsed=matter(raw);
  const corrected=fix(u.n,part,parsed.content.replace(/\r\n/g,"\n"));
  const retained=corrected.replace(/^# .+\n/,"").trim();
  const up=part==="vocabulary/words"?"../":"";
  const links="[Обзор]("+up+"overview.md) · [Чтение]("+up+"reading.md) · [Практика]("+up+"practice/exercises.md) · [Грамматика]("+up+"grammar/core.md)";
  const warning="Сохранён расширенный банк прежней редакции. Подтверждённые ошибки этой партии исправлены; полная вычитка всех слов, транскрипций и ключей продолжается. Объём дополнения не задаёт план одного занятия.";
  let body="# Английский · Урок "+u.n+" — "+(part==="vocabulary/words"?"активный словарь":part==="dialogue"?"диалог":"самопроверка")+": "+u.title+(prefix?" · дополнительная версия":"")+"\n\n";
  if(part==="vocabulary/words") {
    body+="## Слова для действия\n\n"+u.goal+"\n\nУчите выражение с примером: прочитайте, закройте правый столбец, восстановите значение, затем составьте свою фразу. Эти 10 опор не заменяют весь расширенный словарь.\n\n| Выражение | Значение здесь | Пример |\n|---|---|---|\n"+u.words.map(w=>"| "+w.join(" | ")+" |").join("\n")+"\n\n## Вспомнить без подсказки\n\n"+u.recall+"\n\n"+fold("Проверить выражения и объяснение",u.recallKey)+"\n\nДалее: [разыграть диалог](../dialogue.md), затем [проверить себя](../test.md).\n\n";
  }
  if(part==="dialogue") {
    body+="## Ситуация и роли\n\n"+u.scene+"\n\n## Основной разговор\n\n"+u.dialogue+"\n\n## Вопросы перед переводом\n\n"+numbered(u.questions)+"\n\n"+fold("Перевод и смысл разговора",u.translation)+"\n\n"+fold("Проверить понимание разговора",numbered(u.answers))+"\n\n## Ролевая попытка\n\n"+u.roleplay+"\n\nСначала говорите по карточке, затем поменяйтесь ролями. Выпишите одну удачную реплику и одну форму, которую нужно повторить. [Активные слова](vocabulary/words.md) · [Самопроверка](test.md).\n\n";
  }
  if(part==="test") {
    body+="## Самостоятельная попытка: восемь пунктов\n\nЗакройте словарь и ключ. Все факты для этой проверки даны ниже: не переносите персонажей и сведения из других текстов. Запишите ответы перед раскрытием решения.\n\n**Карточка:** "+u.card+"\n\n"+numbered(u.tasks)+"\n\n"+fold("Ключ и критерии восьми пунктов",numbered(u.solutions))+"\n\n## Как оценить эту попытку\n\nЗа каждый номер — 1 балл, если выполнены все явно названные условия; иначе 0. В свободном ответе принимается грамматически верный эквивалент, сохраняющий требуемые факты. Описка, которая не меняет слово/смысл и не относится к проверяемой форме, не снимает балл. Максимум 8; старый дополнительный банк в эту сумму не входит.\n\n- 7–8: попробуйте новую ситуацию без готового образца.\n- 4–6: выберите две ошибки и повторите соответствующую модель.\n- 0–3: разберите словарь и диалог, затем повторите с другими данными.\n\nЭто ориентир повторения конкретных задач, не сертификат уровня и не оценка произношения. "+u.retry+"\n\n[Повторить активные слова](vocabulary/words.md) · [Разобрать диалог](dialogue.md).\n\n";
  }
  body+=links+"\n\n## Опоры редакции\n\n"+sources[u.n]+" Ситуации и задания составлены для библиотеки; сведения магазинов и персонажей вымышлены.\n\n## Расширенный материал прежней редакции\n\n"+warning+"\n\n"+fold("Открыть прежнюю подборку",retained)+"\n";
  const before=load(renderMarkdown(parsed.content,slug).html);
  if(check) body=matter(current).content;
  let after=load(renderMarkdown(body,slug).html);
  const ids=new Set(after("[id]").map((_,e)=>after(e).attr("id")!).get());
  const prior=before("[id]").map((_,e)=>before(e).attr("id")!).get();
  oldIds+=prior.length;
  const missing=prior.filter(id=>!ids.has(id));
  if(check) assert.deepEqual(missing,[],slug);
  else body+="\n"+missing.map(id=>'<span id="'+id+'" aria-hidden="true"></span>').join("\n")+"\n";
  after=load(renderMarkdown(body,slug).html);
  const all=after("[id]").map((_,e)=>after(e).attr("id")!).get();
  assert.equal(all.length,new Set(all).size,slug);
  const hrefs=new Set(after("a[href]").map((_,e)=>after(e).attr("href")!).get());
  for(const href of before('a[href^="/doc/"],a[href^="#"]').map((_,e)=>before(e).attr("href")!).get()) assert(hrefs.has(href),"Lost link "+slug+" "+href);
  assert.equal(after("details[open]").length,0);
  assert.equal((body.match(/<details>/g)||[]).length,(body.match(/<\/details>/g)||[]).length,slug);
  assert(after("details").length>=2,slug);
  plans.push({slug,raw:current,next:matter.stringify(body,{...parsed.data,teaching_revision:"2026-10-19",editorial_session:33})});
}
if(apply) {
  for(const p of plans) {
    assert.equal(fs.readFileSync(path.join("knowledge",p.slug+".md"),"utf8"),p.raw,"Concurrent change");
    assert(!fs.existsSync(path.join(backup,p.slug+".md")),"Backup exists");
  }
  // Save every complete before-image before changing the first note.
  for(const p of plans) {const file=path.join(backup,p.slug+".md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,p.raw,{flag:"wx"});}
  for(const p of plans) fs.writeFileSync(path.join("knowledge",p.slug+".md"),p.next);
  fs.writeFileSync(path.join(backup,"manifest.json"),JSON.stringify({date:"2026-10-19",files:plans.map(p=>p.slug),corrections},null,2));
}
console.log(JSON.stringify({mode:check?"check":apply?"apply":"dry-run",notes:plans.length,oldIds,logicalDialogues:5,activeEntries:50,selfCheckItems:40}));
