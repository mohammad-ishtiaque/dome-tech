import { api, SITE_URL } from "~/lib/api.server";

export async function loader() {
  const map = await api.sitemap();
  const urls: { loc: string; lastmod?: string; priority: string }[] = [];
  for (const p of map?.pages || []) {
    urls.push({ loc: p.slug === "home" ? "/" : `/${p.slug}/`, lastmod: p.updatedAt, priority: p.slug === "home" ? "1.0" : /privacy|terms/.test(p.slug) ? "0.3" : "0.8" });
  }
  for (const p of map?.products || []) urls.push({ loc: `/${p.slug}/`, lastmod: p.updatedAt, priority: "0.8" });
  for (const n of map?.news || []) urls.push({ loc: `/news/${n.slug}/`, lastmod: n.updatedAt, priority: "0.6" });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ""}<priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
