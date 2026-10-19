import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import matter from "gray-matter";
import {load} from "cheerio";
import {renderMarkdown} from "../../../lib/knowledge";
const backup="C:/Users/madsaomi/.codex/visualizations/2026/10/18/01a14e04-f99a-7502-b016-86500b24eccb/languages-before-session033/navigation";
const apply=process.argv.includes("--apply"),check=process.argv.includes("--check");
assert(!(apply&&check));
if(apply) assert(!fs.existsSync(path.join(backup,"manifest.json")),"Already applied");
const topics:Record<string,string[]>={
  english:["Представиться и сохранить профессию/место","Расспросить о рабочем дне","Сравнить цену, размер и личный выбор","Назвать владельца вещи","Заказать продукты и проверить количество"],
  japanese:["Назвать себя и владельца вещи","Время, действие и место в распорядке","Найти человека, вещь и место действия","Согласовать приглашение и место","Рассказать о вчерашних занятиях"],
  korean:["Знакомство и книга в аудитории","Сопоставить учебный распорядок","Уточнить поворот и разрешение","Заказать еду и дополнительную воду","Различить погоду, прогноз и условный план"],
  chinese:["Знакомство в классе и чужая книга","Выбор одежды, примерка и цена","Переспросить маршрут к библиотеке","Попросить порцию и немного воды","Сопоставить погоду и два плана"]
};
const plans:{slug:string;raw:string;next:string}[]=[];
let oldIds=0;
for(const prefix of ["","knowledge/"]) for(const [language,goals] of Object.entries(topics)) for(const level of ["","a1/"]) {
  const slug=prefix+"languages/"+language+"/"+level+"_contents";
  const raw=fs.readFileSync(path.join("knowledge",slug+".md"),"utf8");
  const prior=check?fs.readFileSync(path.join(backup,slug+".md"),"utf8"):raw;
  const p=matter(prior);let body=p.content.replace(/\r\n/g,"\n");
  const base=level?"":"a1/";
  const table=goals.map((goal,i)=>{
    const dir=base+"unit-"+String(i+1).padStart(2,"0")+"/";
    return "| "+(i+1)+". "+goal+" | [Активные слова]("+dir+"vocabulary/words.md) | [Разговор и роли]("+dir+"dialogue.md) | [Самопроверка с ключом]("+dir+"test.md) |";
  }).join("\n");
  const block="## От слов к разговору и самопроверке\n\nВ первых пяти уроках закрепляйте материал в три шага: вспомните активные выражения без перевода, разыграйте короткую сцену с новыми данными, затем выполните проверку до открытия ключа. В каждом тесте указана собственная рубрика; баллы разных тестов и старых банков не складываются.\n\n| Что научиться делать | Словарь | Диалог | Проверка |\n|---|---|---|---|\n"+table+"\n\nЕсли ответ не совпал с образцом, сравните сначала смысл и условия: эквивалентные формулировки учитываются по критериям. Запишите причину ошибки и повторите трудный пункт позже. Перевод и объяснения раскрываются отдельно; длинные прежние подборки остаются дополнительным материалом.\n\n";
  const marker=level?"## Как пройти один урок":"## Продолжение: уроки 06–10";
  assert(body.includes(marker),slug+" insertion point");
  if(check) body=matter(raw).content;
  else body=body.replace(marker,block+marker);
  const before=load(renderMarkdown(p.content,slug).html),after=load(renderMarkdown(body,slug).html);
  const ids=new Set(after("[id]").map((_,e)=>after(e).attr("id")!).get());
  for(const id of before("[id]").map((_,e)=>before(e).attr("id")!).get()){assert(ids.has(id),"Lost ID "+slug+"#"+id);oldIds++;}
  const all=after("[id]").map((_,e)=>after(e).attr("id")!).get();assert.equal(all.length,ids.size);
  const links=new Set(after("a[href]").map((_,e)=>after(e).attr("href")!).get());
  for(const href of before('a[href^="/doc/"],a[href^="#"]').map((_,e)=>before(e).attr("href")!).get())assert(links.has(href),"Lost link "+slug);
  plans.push({slug,raw,next:matter.stringify(body,{...p.data,editorial:"manual",language_session:33,teaching_revision:"2026-10-19"})});
}
if(apply){
  for(const p of plans){assert.equal(fs.readFileSync(path.join("knowledge",p.slug+".md"),"utf8"),p.raw);assert(!fs.existsSync(path.join(backup,p.slug+".md")));}
  for(const p of plans){const file=path.join(backup,p.slug+".md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,p.raw,{flag:"wx"});}
  for(const p of plans)fs.writeFileSync(path.join("knowledge",p.slug+".md"),p.next);
  fs.writeFileSync(path.join(backup,"manifest.json"),JSON.stringify({date:"2026-10-19",files:plans.map(p=>p.slug)},null,2));
}
console.log(JSON.stringify({mode:check?"check":apply?"apply":"dry-run",notes:plans.length,oldIds}));
