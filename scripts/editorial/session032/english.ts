import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../../../lib/knowledge";
import { units } from "./english-content";
import { fix } from "./english-fixes";
const backup="C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session032/english";
const apply=process.argv.includes("--apply");
const check=process.argv.includes("--check");
assert(!(apply&&check));
if(apply&&fs.existsSync(path.join(backup,"manifest.json"))) throw new Error("Already applied; use --check");
const fold=(title:string,s:string)=>`<details>\n<summary>${title}</summary>\n\n${s}\n\n</details>`;
const numbered=(a:string[])=>a.map((s,i)=>`${i+1}. ${s}`).join("\n");
const render=(raw:string,slug:string)=>load(renderMarkdown(matter(raw).content,slug).html);
const extraSources:Record<number,string>={
  "11": "[British Council: Present Perfect](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-perfect).",
  "12": "[British Council: non-defining clauses](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/relative-clauses-non-defining-relative-clauses). [British Council: пассив](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/passives).",
  "13": "[Cambridge: if и условия](https://dictionary.cambridge.org/grammar/british-grammar/third-conditional). [British Council: stative verbs](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/stative-verbs).",
  "14": "[British Council: Past Continuous/Past Simple](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/past-continuous-past-simple). [British Council: даты](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/when-time-dates).",
  "15": "[British Council: Present Perfect](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-perfect). [British Council: будущие формы](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/future-forms-will-be-going-present-continuous)."
};
const plans:{slug:string;raw:string;next:string}[]=[];
let oldIds=0;
for(const prefix of ["","knowledge/"]) for(const u of units) for(const part of ["reading","practice/exercises","grammar/core"]) {
  const slug=`${prefix}languages/english/b1/unit-${u.n}/${part}`;
  const file=path.join("knowledge",slug+".md");
  const current=fs.readFileSync(file,"utf8");
  const raw=check?fs.readFileSync(path.join(backup,slug+".md"),"utf8"):current;
  const p=matter(raw);const old=fix(u.n,part,p.content.replace(/\r\n/g,"\n"));
  const retained=old.replace(/^# .+\r?\n/,"").trim();
  const links=part==="reading"?"[Практика](practice/exercises.md) · [Грамматика](grammar/core.md) · [Обзор](overview.md)":"[Чтение](../reading.md) · [Обзор](../overview.md)";
  const source=`[Основное правило](${u.source}). Ситуация и задания написаны для библиотеки. ${extraSources[u.n]}`;
  let body="";
  if(part==="reading") body=`# Английский · Урок ${u.n} — чтение: ${u.title}${prefix?" · дополнительная версия":""}\n\n## Перед чтением\n\nПрочитайте вымышленную ситуацию без перевода. Для ответа найдите строку-доказательство; отделяйте факт от плана, мнения и отсутствующих данных.\n\n## Короткий текст\n\n${u.text}\n\n## Опорные слова\n\n| Выражение | Значение |\n|---|---|\n${u.words.map(([a,b])=>`| ${a} | ${b} |`).join("\n")}\n\n## Вопросы до ключа\n\n${numbered(u.questions)}\n\n${fold("Объяснённые ответы",numbered(u.answers))}\n\n${fold("Перевод после своей попытки",u.translation)}\n\n## Перенос\n\nПерескажите ситуацию тремя фразами. Измените один факт и покажите, какие ответы теперь нужно изменить. Не выдавайте свой вариант за сведения исходного текста.\n\n${links}\n\n## Дополнительное чтение прежней редакции\n\nСохранены длинные тексты и старые вопросы; весь этот банк ещё не прошёл предметную вычитку. Исторические, статистические и справочные утверждения требуют отдельной проверки.\n\n${fold("Открыть прежние тексты и словари",retained)}\n`;
  if(part==="practice/exercises") body=`# Английский · Урок ${u.n} — самостоятельная практика: ${u.title}${prefix?" · дополнительная версия":""}\n\n## Работа с условиями\n\nПрочитайте [короткий текст](../reading.md), затем выполните три задачи письменно до раскрытия ключа. Отдельно заданные факты не меняют событий чтения.\n\n${u.tasks.map((t,i)=>`## Задание ${i+1}\n\n${t}`).join("\n\n")}\n\n${fold("Решения и объяснения",u.solutions.map((t,i)=>`**Задание ${i+1}.** ${t}`).join("\n\n"))}\n\n## Проверка переноса\n\nСоставьте свою пару примеров. Подпишите, что в ней факт, фон, результат или условие. Объясните форму по смыслу, а не только совпадением с образцом.\n\n${links} · [Грамматика](../grammar/core.md)\n\n## Опора для проверки\n\n${source}\n\n## Дополнительный банк\n\nСтарые задания и решения сохранены, подтверждённые ошибки этой партии исправлены. Полная вычитка всех ключей ещё не завершена.\n\n${fold("Открыть прежние упражнения и ключи",retained)}\n`;
  if(part==="grammar/core") body=`# Английский · Урок ${u.n} — грамматика: ${u.title}\n\n## Учебная модель\n\n${u.core}\n\n${links} · [Практика](../practice/exercises.md)\n\n## Подробные справочные разделы\n\nВыбирайте нужную тему после основной модели; не обязательно проходить весь объём за один подход. Предметная проверка расширенных разделов продолжается. Метка B1 сохраняет структуру папок и не подтверждает полного экзаменационного покрытия.\n\n${retained}\n\n## Источники уточнений\n\n${source}\n`;
  if(check) body=matter(current).content;
  const before=render(raw,slug), after=load(renderMarkdown(body,slug).html);
  const ids=new Set(after("[id]").map((_,e)=>after(e).attr("id")!).get());
  const oldList=before("[id]").map((_,e)=>before(e).attr("id")!).get();oldIds+=oldList.length;
  const missing=oldList.filter(id=>!ids.has(id));
  if(check) assert.equal(missing.length,0,`Lost IDs: ${slug}`);
  else body+="\n"+missing.map(id=>`<span id="${id}" aria-hidden="true"></span>`).join("\n")+"\n";
  const next=matter.stringify(body,{...p.data,teaching_revision:"2026-10-18",editorial_session:32});
  const $=render(next,slug);const all=$("[id]").map((_,e)=>$(e).attr("id")).get();assert.equal(all.length,new Set(all).size,slug);
  const currentLinks=new Set($("a[href]").map((_,e)=>$(e).attr("href")).get());
  for(const href of before('a[href^="/doc/"],a[href^="#"]').map((_,e)=>before(e).attr("href")!).get()) assert(currentLinks.has(href),`Lost link ${slug} -> ${href}`);
  assert.equal($("details[open]").length,0);assert.equal((body.match(/<details>/g)||[]).length,(body.match(/<\/details>/g)||[]).length,slug);
  plans.push({slug,raw,next});
}
if(apply) {
  for(const p of plans) assert(!fs.existsSync(path.join(backup,p.slug+".md")),"Original backup already exists");
  for(const p of plans) {const file=path.join(backup,p.slug+".md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,p.raw,{flag:"wx"});fs.writeFileSync(path.join("knowledge",p.slug+".md"),p.next);}
  fs.writeFileSync(path.join(backup,"manifest.json"),JSON.stringify({changed:plans.map(p=>p.slug)},null,2));
}
console.log(JSON.stringify({mode:check?"check":apply?"apply":"dry-run",notes:plans.length,oldIds}));
