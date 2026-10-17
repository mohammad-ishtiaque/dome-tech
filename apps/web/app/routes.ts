import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/page.tsx", { id: "home" }),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
  route("inquiry", "routes/inquiry.ts"),
  route("uploads/:file", "routes/uploads.ts"),
  route("news/:slug", "routes/news-post.tsx"),
  // Any other single segment: a page from the dashboard (/about/) or a product (/somspot/).
  route(":slug", "routes/page.tsx", { id: "page" }),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
