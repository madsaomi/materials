/** Check freshly rendered grammar content on the existing Next.js preview. */
import assert from "node:assert/strict";
import fs from "node:fs";
import matter from "gray-matter";
import { load } from "cheerio";
import { renderMarkdown } from "../../../lib/knowledge";

async function main() {
  const base = process.env.GRAMMAR_PREVIEW_URL || "http://127.0.0.1:5000";
  const checks: {
    route: string;
    status: number;
    bytes?: number;
    location?: string;
  }[] = [];
  const text = (value: string) => value.replace(/\s+/g, " ").trim();
  async function request(route: string, redirect: RequestRedirect = "follow") {
    return fetch(base + route, {
      redirect,
      signal: AbortSignal.timeout(120000),
    });
  }
  for (const route of [
    "/healthz",
    "/",
    "/?folder=languages",
    "/api/search.json",
  ]) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    const body = await response.text();
    if (route === "/api/search.json")
      assert.equal(JSON.parse(body).length, 1348);
    checks.push({ route, status: 200, bytes: Buffer.byteLength(body) });
  }
  for (const language of ["english", "japanese", "korean"]) {
    const slugs: string[] = [];
    for (const [level, unit] of [
      ["a1", "01"],
      ["a2", "08"],
      ["b1", "15"],
    ])
      for (const part of ["core", "usage"])
        slugs.push(
          `languages/${language}/${level}/unit-${unit}/grammar/${part}`,
        );
    slugs.push(`knowledge/languages/${language}/a2/unit-08/grammar/usage`);
    for (const slug of slugs) {
      const route = "/doc/" + slug;
      const response = await request(route);
      assert.equal(response.status, 200, route);
      const body = await response.text();
      const $ = load(body);
      const source = matter(
        fs.readFileSync("knowledge/" + slug + ".md", "utf8"),
      ).content;
      const expected = load(renderMarkdown(source, slug).html);
      assert.equal(
        text($(".prose").text()),
        text(expected("body").text()),
        `Preview differs from saved grammar: ${slug}`,
      );
      assert.equal(
        $(".prose a[href]").filter((_, element) =>
          /\.md(?:[#?]|$)/.test($(element).attr("href")!),
        ).length,
        0,
        route,
      );
      assert.equal($(".prose details[open]").length, 0, route);
      if (slug.endsWith("/usage"))
        assert($(".prose details").length >= 1, route);
      checks.push({ route, status: 200, bytes: Buffer.byteLength(body) });
    }
    const previewRoute = `/api/preview/languages/${language}/a1/unit-01/grammar/core`;
    const preview = await request(previewRoute);
    assert.equal(preview.status, 200);
    const data = await preview.json();
    assert(data.title && data.excerpt);
    checks.push({ route: previewRoute, status: 200 });
  }
  const query =
    "/api/search?q=" + encodeURIComponent("грамматика") + "&domain=languages";
  const search = await request(query);
  assert.equal(search.status, 200);
  assert((await search.json()).total > 0);
  checks.push({ route: query, status: 200 });
  const old =
    "/doc/languages/english/units/unit-01/grammar/core?from=grammar036&resume=example";
  const redirect = await request(old, "manual");
  assert.equal(redirect.status, 308);
  const location =
    "/doc/languages/english/a1/unit-01/grammar/core?from=grammar036&resume=example";
  assert.equal(redirect.headers.get("location"), location);
  checks.push({ route: old, status: 308, location });
  const missing = "/doc/nonexistent-grammar036";
  assert.equal((await request(missing)).status, 404);
  checks.push({ route: missing, status: 404 });
  fs.mkdirSync("reports/session036", { recursive: true });
  fs.writeFileSync(
    "reports/session036/http.json",
    JSON.stringify(
      { date: "2026-10-25", status: "PASS", base, checks },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      status: "PASS",
      checks: checks.length,
      searchEntries: 1348,
    }),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
