/** One session, immutable before-images, exactly 60 existing Japanese grammar pages. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { load } from 'cheerio';
import { renderMarkdown } from '../../../lib/knowledge';
import { a1 } from './japanese-a1';
import { a2 } from './japanese-a2';
import { b1 } from './japanese-b1';
import { corrections } from './japanese-corrections';

const backup=process.argv.slice(2).find(arg=>path.isAbsolute(arg));
assert(backup,'Pass absolute grammar-before-session036 directory');
const apply=process.argv.includes('--apply');
const lessons=[...a1,...a2,...b1];
assert.equal(lessons.length,15);
const plans:{file:string; before:string; after:string; ids:number; links:number; corrections:number}[]=[];
const appliedCorrections:{unit:number; from:string; files:number}[]=[];
const hits=new Map<string,number>();
const route='[Обзор урока](../overview.md) · [Грамматика](core.md) · [Применение](usage.md) · [Практика](../practice/exercises.md)';
function ids(source:string,slug:string){const $=load(renderMarkdown(matter(source).content,slug).html);return $('[id]').map((_,el)=>$(el).attr('id')!).get();}
function links(source:string,slug:string){const $=load(renderMarkdown(matter(source).content,slug).html);return $('a[href^="/doc/"],a[href^="#"]').map((_,el)=>$(el).attr('href')!).get();}
for(const lesson of lessons){
  const level=lesson.unit<=5?'a1':lesson.unit<=10?'a2':'b1';
  const unit='unit-'+String(lesson.unit).padStart(2,'0');
  const sources=lesson.sources.map(([title,url])=>`- [${title}](${url})`).join('\n');
  for(const vault of ['', 'knowledge/'])for(const kind of ['core','usage']){
    const slug=`${vault}languages/japanese/${level}/${unit}/grammar/${kind}`;
    const file='knowledge/'+slug+'.md';
    const before: string=fs.readFileSync(path.join(backup,slug+'.md'),'utf8');
    const first=/^# .+$/m.exec(before);assert(first&&first.index!==undefined,`${file}: no title`);
    const prefix=before.slice(0,first.index);
    let retained=before.slice(first.index+first[0].length).trim();
    let fixes=0;
    for(const [from,to] of corrections[lesson.unit]||[]){
      if(from===to)continue;
      if(retained.includes(from)){retained=retained.replaceAll(from,to);fixes++;const key=lesson.unit+'\0'+from;hits.set(key,(hits.get(key)||0)+1);}
    }
    retained=retained.replace('Прочитайте пример, закройте его и объясните своими словами, почему выбрана именно эта форма. Затем измените одного участника или обстоятельство и проверьте, что ещё должно измениться.','');
    retained=retained.replace('Составьте два собственных примера на эту модель. Для каждого укажите ситуацию, участников и смысл выбранной формы. Проверьте не только окончание, но и порядок слов. Не считайте повторение примера по памяти самостоятельным решением.','');
    const title=first[0];
    const content=kind==='core'?lesson.core:lesson.usage;
    let after=`${prefix}${title}\n\n## Учебное ядро: ${lesson.topic}\n${content.trim()}\n\n## Источники нового разбора\n\nПравила сверены по указанным разделам; объяснения, ситуации и задания написаны для этой библиотеки. Ссылки нужны для проверки, а текст урока доступен без сети.\n\n${sources}\n\n## К следующему шагу\n\n${route}\n\n<details>\n<summary>Дополнительный материал прежней версии</summary>\n\n> Ниже сохранены прежние примеры, ссылки и справочные расширения. В этой редакции исправлены отдельные проверенные ошибки, но весь длинный банк не прошёл сплошную языковую проверку. Для первого прохода используйте новый разбор выше.\n\n${retained}\n\n</details>\n`;
    const oldIds=ids(before,slug),newIds=new Set(ids(after,slug));
    const missing=oldIds.filter(id=>!newIds.has(id));
    if(missing.length)after+='\n'+missing.map(id=>`<span id="${id.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')}" aria-hidden="true"></span>`).join('\n')+'\n';
    const finalIds=ids(after,slug);
    assert.equal(finalIds.length,new Set(finalIds).size,`duplicate ID ${file}`);
    assert(oldIds.every(id=>finalIds.includes(id)),`lost ID ${file}`);
    const oldLinks=links(before,slug),finalLinks=new Set(links(after,slug));
    assert(oldLinks.every(link=>finalLinks.has(link)),`lost link ${file}`);
    assert.deepEqual(matter(after).data,matter(before).data,`frontmatter ${file}`);
    assert.equal((after.match(/<details(?:\s[^>]*)?>/g)||[]).length,(after.match(/<\/details>/g)||[]).length,`details ${file}`);
    const current=fs.readFileSync(file,'utf8');
    assert(current===before||current===after,`Preflight: changed since snapshot ${file}`);
    plans.push({file,before,after,ids:oldIds.length,links:oldLinks.length,corrections:fixes});
  }
}
assert.equal(plans.length,60);
for(const [unit,pairs]of Object.entries(corrections))for(const [from,to]of pairs){if(from===to)continue;const count=hits.get(unit+'\0'+from)||0;appliedCorrections.push({unit:Number(unit),from,files:count});}
if(apply)for(const plan of plans)fs.writeFileSync(plan.file,plan.after,'utf8');
const stats={status:'PASS',mode:apply?'applied':'dry-run',language:'japanese',logicalUnits:15,notes:60,newMiniChecks:45,previousIds:plans.reduce((n,p)=>n+p.ids,0),previousInternalLinks:plans.reduce((n,p)=>n+p.links,0),retainedCorrections:plans.reduce((n,p)=>n+p.corrections,0),unmatchedCorrections:appliedCorrections.filter(x=>x.files===0),files:plans.map(p=>p.file)};
if(apply){fs.mkdirSync('reports/session036',{recursive:true});fs.writeFileSync('reports/session036/japanese.json',JSON.stringify(stats,null,2)+'\n','utf8');}
console.log(JSON.stringify(stats,null,2));
