import { SITE_URL } from "~/lib/api.server";

export function loader() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /inquiry\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
