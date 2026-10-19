import { getDocs } from "../../../../lib/knowledge";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const slug = (await params).slug.join("/");
  const doc = getDocs().find((d) => d.slug === slug);
  return doc
    ? Response.json({
        title: doc.title,
        category: doc.categoryLabel,
        excerpt: doc.searchText.slice(0, 360),
        readingTime: doc.readingTime,
      })
    : Response.json({ error: "not_found" }, { status: 404 });
}
