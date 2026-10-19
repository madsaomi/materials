import { search } from "../../../lib/knowledge";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const domain = p.get("domain") || "all";
  if (
    !["all", "languages", "mnemonics", "programming", "other"].includes(domain)
  )
    return Response.json({ error: "invalid_domain" }, { status: 400 });
  return Response.json(search(p.get("q") || "", domain));
}
