// Read-only content API for the website, plus the inquiry form endpoint.
// The website calls these from the server (React Router loaders/actions), not from the browser.
import { Router } from "express";
import { InquiryModel, JobModel, NewsModel, PageModel, ProductModel, SettingsModel } from "../models/index.js";

export const publicRouter = Router();

const visible = <T extends { hidden?: boolean }>(sections: T[] = []) => sections.filter((s) => !s.hidden);

/** Settings + the product list used by the header, footer and portfolio sections. */
publicRouter.get("/layout", async (_req, res) => {
  const [settings, products] = await Promise.all([
    SettingsModel.findOne({ key: "site" }).lean(),
    ProductModel.find({ published: true }).sort({ order: 1 })
      .select("slug name fullName role color icon logo status purpose market monetization channel order").lean(),
  ]);
  res.json({ settings, products });
});

publicRouter.get("/pages/:slug", async (req, res) => {
  const page = await PageModel.findOne({ slug: req.params.slug }).lean();
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json({ ...page, sections: visible(page.sections) });
});

publicRouter.get("/products/:slug", async (req, res) => {
  const product = await ProductModel.findOne({ slug: req.params.slug, published: true }).lean();
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json({ ...product, sections: visible(product.sections) });
});

publicRouter.get("/news", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 0, 100);
  const query = NewsModel.find({ published: true }).sort({ date: -1 }).select("-body");
  res.json(await (limit ? query.limit(limit) : query).lean());
});

publicRouter.get("/news/:slug", async (req, res) => {
  const post = await NewsModel.findOne({ slug: req.params.slug, published: true }).lean();
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
});

publicRouter.get("/jobs", async (_req, res) => {
  res.json(await JobModel.find({ open: true }).sort({ order: 1, createdAt: -1 }).lean());
});

/** Everything the sitemap needs. */
publicRouter.get("/sitemap", async (_req, res) => {
  const [pages, products, news] = await Promise.all([
    PageModel.find().select("slug updatedAt").lean(),
    ProductModel.find({ published: true }).select("slug updatedAt").lean(),
    NewsModel.find({ published: true }).select("slug updatedAt").lean(),
  ]);
  res.json({ pages, products, news });
});

// Simple in-memory rate limit for the form: 5 submissions per 10 minutes per IP.
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;

publicRouter.post("/inquiries", async (req, res) => {
  const ip = String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (recent.length >= 5) return res.status(429).json({ error: "Too many messages. Please try again later." });
  hits.set(ip, [...recent, now]);

  const b = req.body ?? {};
  if (b.website) return res.status(201).json({ ok: true }); // honeypot: silently accept bots
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const inquiry = {
    name: str(b.name, 200), email: str(b.email, 200), org: str(b.org, 200),
    interest: str(b.interest, 50) || "general", message: str(b.message, 5000), page: str(b.page, 300),
  };
  const errors: Record<string, string> = {};
  if (!inquiry.name) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) errors.email = "Please enter a valid email address.";
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  await InquiryModel.create({ ...inquiry, status: "new" });
  res.status(201).json({ ok: true });
});
