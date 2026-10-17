// Builds the <head> meta tags for a page (title, description, canonical, social previews, robots).
export interface SeoInput {
  title: string;
  description?: string;
  url: string;          // absolute canonical URL
  image?: string;       // absolute image URL
  noindex?: boolean;
  type?: "website" | "article";
}

export function seoMeta({ title, description = "", url, image, noindex, type = "website" }: SeoInput) {
  const img = image || new URL("/og-image.png", url).toString();
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { name: "robots", content: noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1" },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "Digital Dome" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}

/** Renders JSON-LD structured data. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
