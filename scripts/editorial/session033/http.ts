import assert from "node:assert/strict";
import fs from "node:fs";
import {load} from "cheerio";
async function main() {
  const checks:{route:string;status:number;bytes?:number;location?:string}[]=[];
  const routes=["/","/?folder=languages","/api/search.json"];
  for(const language of ["english","japanese","korean","chinese"]) {
    routes.push("/doc/languages/"+language+"/_contents","/doc/languages/"+language+"/a1/_contents");
    for(const part of ["vocabulary/words","dialogue","test"])routes.push("/doc/languages/"+language+"/a1/unit-05/"+part);
  }
  routes.push("/doc/knowledge/languages/korean/a1/_contents","/doc/knowledge/languages/chinese/a1/unit-04/test","/doc/languages/english/b1/unit-15/reading");
  for(const route of routes) {
    const res=await fetch("http://127.0.0.1:5000"+route,{signal:AbortSignal.timeout(120000)});
    assert.equal(res.status,200,route);
    const body=await res.text();
    if(route==="/api/search.json")assert.equal(JSON.parse(body).length,1348);
    else{
      const $=load(body);
      assert.equal($("a[href]").filter((_,e)=>/\.md(?:[#?]|$)/.test($(e).attr("href")!)).length,0,route);
      if(route.endsWith("_contents"))assert(body.includes("От слов к разговору и самопроверке"),route);
      else if(route.includes("/a1/")){assert($("details").length>=2,route);assert.equal($("details[open]").length,0,route);}
    }
    checks.push({route,status:res.status,bytes:Buffer.byteLength(body)});
  }
  const searchRoute="/api/search?q="+encodeURIComponent("Покупки по списку")+"&domain=languages";
  const searchRes=await fetch("http://127.0.0.1:5000"+searchRoute);
  assert.equal(searchRes.status,200);
  const found=await searchRes.json();
  assert(found.results.some((r:{slug:string})=>r.slug==="languages/english/a1/unit-05/test"));
  checks.push({route:searchRoute,status:200});
  const previewRoute="/api/preview/languages/english/a1/unit-05/dialogue";
  const previewRes=await fetch("http://127.0.0.1:5000"+previewRoute);
  assert.equal(previewRes.status,200);
  const preview=await previewRes.json();
  assert(preview.title.includes("Покупки по списку"));assert(preview.excerpt);
  checks.push({route:previewRoute,status:200});
  const old="/doc/languages/english/units/unit-05/test?from=session033";
  const redirect=await fetch("http://127.0.0.1:5000"+old,{redirect:"manual"});
  assert.equal(redirect.status,308);
  assert.equal(redirect.headers.get("location"),"/doc/languages/english/a1/unit-05/test?from=session033");
  checks.push({route:old,status:308,location:redirect.headers.get("location")!});
  const missing="/doc/nonexistent-session033";
  assert.equal((await fetch("http://127.0.0.1:5000"+missing)).status,404);
  checks.push({route:missing,status:404});
  fs.writeFileSync("reports/session033/http.json",JSON.stringify({date:"2026-10-19",checks},null,2));
  console.log(JSON.stringify({status:"PASS",checks:checks.length,searchEntries:1348}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
