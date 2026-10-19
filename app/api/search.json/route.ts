import { getDocs } from "../../../lib/knowledge";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    getDocs().map(
      ({ title, slug, category, categoryLabel, collection, legacySlugs }) => ({
        title,
        slug,
        category,
        categoryLabel,
        collection,
        legacySlugs,
      }),
    ),
  );
}
