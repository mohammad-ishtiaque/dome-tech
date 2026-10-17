// Renders any page built in the dashboard ("/" = home, "/about/" …) or a product page ("/somspot/").
import { data, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/page";
import { api, SITE_URL } from "~/lib/api.server";
import { JsonLd, seoMeta } from "~/lib/seo";
import { needsJobs, needsNews, railItems, Sections, type SectionContext } from "~/components/sections";
import { ProductHero, ProductNav } from "~/components/product-hero";
import type { loader as rootLoader } from "~/root";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug || "home";
  const page = await api.page(slug);
  const product = page ? null : await api.product(slug);
  if (!page && !product) throw data("Not found", { status: 404 });
  const sections = (page || product)!.sections;
  const [news, jobs] = await Promise.all([needsNews(sections) ? api.news() : undefined, needsJobs(sections) ? api.jobs() : undefined]);
  const path = slug === "home" ? "/" : `/${slug}/`;
  return { page, product, news, jobs, url: `${SITE_URL}${path}`, siteUrl: SITE_URL };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Page not found | Digital Dome" }];
  const doc = loaderData.page || loaderData.product!;
  const title = doc.seo?.title || ("name" in doc ? `${doc.name} | Digital Dome` : `${doc.title} | Digital Dome`);
  return seoMeta({ title, description: doc.seo?.description || ("promise" in doc ? doc.promise : ""), url: loaderData.url });
}

export default function PageRoute({ loaderData }: Route.ComponentProps) {
  const root = useRouteLoaderData<typeof rootLoader>("root")!;
  const { page, product, news, jobs, url, siteUrl } = loaderData;
  const ctx: SectionContext = { layout: root.layout, news, jobs };

  if (product) {
    return (
      <div style={{ ["--accent" as string]: product.color }}>
        <ProductHero p={product} />
        <Sections sections={product.sections} ctx={ctx} />
        <ProductNav products={root.layout.products} current={product.slug} />
        <JsonLd data={[
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
            { "@type": "ListItem", position: 2, name: product.fullName || product.name, item: url }] },
          { "@context": "https://schema.org", "@type": "Service", name: product.fullName || product.name, serviceType: product.role, description: product.promise, areaServed: "Somalia",
            provider: { "@type": "Organization", name: "Digital Dome", url: siteUrl } },
        ]} />
      </div>
    );
  }

  const p = page!;
  const rail = p.slug === "home" ? railItems(p.sections, ctx) : [];
  const settings = root.layout.settings;
  return (
    <>
      {rail.length > 0 && (
        <ol className="pitch-rail" aria-label="Page sections">
          {rail.map((r) => <li key={r.id}><a href={`#${r.id}`}><span>{r.label}</span></a></li>)}
        </ol>
      )}
      <Sections sections={p.sections} ctx={ctx} numbered={p.numbered} />
      {p.slug === "home" ? (
        <JsonLd data={[
          { "@context": "https://schema.org", "@type": "Organization", name: settings.siteName || "Digital Dome", url: siteUrl, logo: `${siteUrl}/apple-touch-icon.png`,
            email: settings.contact?.email, areaServed: ["Somalia", "Somali diaspora"], sameAs: (settings.social || []).map((s) => s.url),
            brand: root.layout.products.map((x) => ({ "@type": "Brand", name: x.fullName || x.name, description: x.role })) },
          { "@context": "https://schema.org", "@type": "WebSite", name: settings.siteName || "Digital Dome", url: `${siteUrl}/` },
        ]} />
      ) : (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: p.title, item: url }] }} />
      )}
    </>
  );
}
