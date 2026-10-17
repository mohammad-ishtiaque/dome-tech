import { data, Link } from "react-router";
import type { Route } from "./+types/news-post";
import { api, SITE_URL } from "~/lib/api.server";
import { markdown } from "~/lib/markdown";
import { JsonLd, seoMeta } from "~/lib/seo";
import { Blobs } from "~/components/sections";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await api.newsPost(params.slug);
  if (!post) throw data("Not found", { status: 404 });
  return { post, url: `${SITE_URL}/news/${post.slug}/`, siteUrl: SITE_URL };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Page not found | Digital Dome" }];
  const { post, url } = loaderData;
  return seoMeta({ title: `${post.title} | Digital Dome`, description: post.summary || post.title, url, image: post.image, type: "article" });
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function NewsPost({ loaderData }: Route.ComponentProps) {
  const { post, url, siteUrl } = loaderData;
  return (
    <>
      <section className="page-hero page-hero--simple">
        <Blobs />
        <div className="container">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Digital Dome</Link><span aria-hidden="true">/</span><Link to="/news/">News &amp; Updates</Link><span aria-hidden="true">/</span>
              <span aria-current="page" className="crumb-current">{post.title}</span>
            </nav>
            <span className="eyebrow"><time dateTime={post.date}>{fmt(post.date)}</time></span>
            <h1>{post.title}</h1>
            {post.summary && <p className="sub">{post.summary}</p>}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {post.image && <img className="article-cover" src={post.image} alt="" />}
          <article className="article prose" dangerouslySetInnerHTML={{ __html: markdown(post.body) }} />
          <p className="article-back"><Link to="/news/">← All news &amp; updates</Link></p>
        </div>
      </section>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "NewsArticle", headline: post.title, description: post.summary, datePublished: post.date,
        mainEntityOfPage: url, image: post.image || `${siteUrl}/og-image.png`,
        author: { "@type": "Organization", name: "Digital Dome", url: siteUrl },
        publisher: { "@type": "Organization", name: "Digital Dome", logo: { "@type": "ImageObject", url: `${siteUrl}/apple-touch-icon.png` } },
      }} />
    </>
  );
}
