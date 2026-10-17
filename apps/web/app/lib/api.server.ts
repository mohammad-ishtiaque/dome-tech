// Server-only helpers for talking to the Express API. Never imported by browser code.
import type { NewsPost, Job, Page, Product, Settings } from "@dome/shared";

const API_URL = (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");
export const SITE_URL = (process.env.SITE_URL || "https://somdigitaldome.com").replace(/\/$/, "");

export type NavProduct = Pick<Product, "slug" | "name" | "fullName" | "role" | "color" | "icon" | "logo" | "status" | "purpose" | "market" | "monetization" | "channel" | "order">;
export interface Layout { settings: Settings; products: NavProduct[] }

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}/api/public${path}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Response("The website could not load its content. Please try again shortly.", { status: 503 });
  return res.json() as Promise<T>;
}

export const api = {
  layout: () => get<Layout>("/layout") as Promise<Layout>,
  page: (slug: string) => get<Page>(`/pages/${encodeURIComponent(slug)}`),
  product: (slug: string) => get<Product>(`/products/${encodeURIComponent(slug)}`),
  news: (limit = 0) => get<NewsPost[]>(`/news${limit ? `?limit=${limit}` : ""}`) as Promise<NewsPost[]>,
  newsPost: (slug: string) => get<NewsPost>(`/news/${encodeURIComponent(slug)}`),
  jobs: () => get<Job[]>("/jobs") as Promise<Job[]>,
  sitemap: () => get<{ pages: { slug: string; updatedAt: string }[]; products: { slug: string; updatedAt: string }[]; news: { slug: string; updatedAt: string }[] }>("/sitemap"),
  async sendInquiry(body: Record<string, string>, ip?: string) {
    const res = await fetch(`${API_URL}/api/public/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string> } };
  },
};
