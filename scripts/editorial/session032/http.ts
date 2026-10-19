import assert from "node:assert/strict";
import fs from "node:fs";
import { load } from "cheerio";

async function main() {
const checks: {route: string; status: number; bytes?: number; location?: string}[] = [];
const routes = ["/", "/?folder=languages", "/api/search.json"];
for (const language of ["english", "japanese", "korean", "chinese"]) {
  routes.push(`/doc/languages/${language}/_contents`, `/doc/languages/${language}/b1/_contents`);
  routes.push(`/doc/languages/${language}/b1/unit-15/reading`, `/doc/languages/${language}/b1/unit-15/practice/exercises`);
}
routes.push("/doc/knowledge/languages/korean/b1/_contents", "/doc/knowledge/languages/chinese/b1/unit-13/reading", "/doc/languages/english/a1/unit-01/reading");
for (const route of routes) {
  const response = await fetch("http://127.0.0.1:5000" + route, {signal: AbortSignal.timeout(120000)});
  assert.equal(response.status, 200, route);
  const body = await response.text();
  if (route === "/api/search.json") assert.equal(JSON.parse(body).length, 1348);
  else {
    const $ = load(body);
    assert.equal($('a[href]').filter((_, e) => /\.md(?:[#?]|$)/.test($(e).attr('href')!)).length, 0, route);
    if (route.endsWith("/b1/_contents")) assert(body.includes("11–15"), route);
    if (/\/unit-15\/(?:reading|practice\/exercises)$/.test(route)) {
      assert($("details").length >= 2, route);
      assert.equal($("details[open]").length, 0, route);
    }
  }
  checks.push({route, status: response.status, bytes: Buffer.byteLength(body)});
}
const old = "/doc/languages/english/units/unit-14/reading?from=session032";
const redirect = await fetch("http://127.0.0.1:5000" + old, {redirect: "manual"});
assert.equal(redirect.status, 308);
assert.equal(redirect.headers.get("location"), "/doc/languages/english/b1/unit-14/reading?from=session032");
checks.push({route: old, status: redirect.status, location: redirect.headers.get("location")!});
const missing = await fetch("http://127.0.0.1:5000/doc/nonexistent-session032");
assert.equal(missing.status, 404);
checks.push({route: "/doc/nonexistent-session032", status: missing.status});
fs.writeFileSync("reports/session032/http.json", JSON.stringify({checks}, null, 2));
console.log(JSON.stringify({status: "PASS", checks: checks.length, searchEntries: 1348}));
}
main().catch(error => {console.error(error); process.exitCode = 1;});
