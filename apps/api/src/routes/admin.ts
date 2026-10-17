// Dashboard API. Everything except /auth/login requires a signed-in user.
import express, { Router, type Response } from "express";
import mongoose, { type Model } from "mongoose";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AuthedRequest, UserModel, createSession, destroySession, hashPassword, loginAllowed,
  passwordProblem, recordFailedLogin, requireAdmin, requireAuth, verifyPassword,
} from "../auth.js";
import { InquiryModel, JobModel, NewsModel, PageModel, ProductModel, SettingsModel } from "../models/index.js";
import { UPLOAD_DIR } from "../uploads.js";

export const adminRouter = Router();
const ah = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) =>
  (req: AuthedRequest, res: Response, next: (e?: unknown) => void) => fn(req, res).catch(next);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(["api", "admin", "uploads", "inquiry", "sitemap.xml", "robots.txt", "assets"]);
const strip = (body: Record<string, unknown>) => {
  const { _id, createdAt, updatedAt, ...rest } = body ?? {};
  return rest;
};
const isId = (id: string) => mongoose.isValidObjectId(id);

/* ------------------------------------------------------------------ auth */
adminRouter.post("/auth/login", ah(async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  const password = String(req.body?.password || "");
  const key = `${req.ip}|${email}`;
  if (!loginAllowed(key)) return res.status(429).json({ error: "Too many attempts. Please wait 15 minutes and try again." });
  const user = await UserModel.findOne({ email });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    recordFailedLogin(key);
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  user.lastLoginAt = new Date();
  await user.save();
  await createSession(res, String(user._id));
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
}));

adminRouter.use(requireAuth);

adminRouter.post("/auth/logout", ah(async (req, res) => { await destroySession(req, res); res.json({ ok: true }); }));
adminRouter.get("/auth/me", (req: AuthedRequest, res) => res.json({ user: req.user }));
adminRouter.put("/auth/password", ah(async (req, res) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user || !(await verifyPassword(String(req.body?.current || ""), user.passwordHash))) return res.status(400).json({ error: "Current password is incorrect." });
  const problem = passwordProblem(req.body?.next);
  if (problem) return res.status(400).json({ error: problem });
  user.passwordHash = await hashPassword(req.body.next);
  await user.save();
  res.json({ ok: true });
}));

/* -------------------------------------------------------------- overview */
adminRouter.get("/overview", ah(async (_req, res) => {
  const [pages, products, news, jobs, newInquiries, inquiries, recent] = await Promise.all([
    PageModel.countDocuments(), ProductModel.countDocuments(), NewsModel.countDocuments(), JobModel.countDocuments({ open: true }),
    InquiryModel.countDocuments({ status: "new" }), InquiryModel.countDocuments(),
    InquiryModel.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  res.json({ pages, products, news, jobs, newInquiries, inquiries, recent });
}));

/* ---------------------------------------------------- generic collections */
async function slugTaken(slug: string, exceptId?: string) {
  const q = exceptId ? { slug, _id: { $ne: exceptId } } : { slug };
  const [page, product] = await Promise.all([PageModel.exists(q), ProductModel.exists(q)]);
  return Boolean(page || product);
}

function crud(path: string, model: Model<any>, opts: { sort: Record<string, 1 | -1>; slugged?: boolean; sharedSlugs?: boolean; validate?: (b: any) => string | null; protect?: (doc: any) => string | null }) {
  const checkSlug = async (body: any, id?: string) => {
    if (!opts.slugged) return null;
    if (!SLUG.test(body.slug || "")) return "URL may only contain lowercase letters, numbers and dashes.";
    if (RESERVED.has(body.slug)) return "That URL is reserved. Please choose another.";
    if (opts.sharedSlugs ? await slugTaken(body.slug, id) : await model.exists(id ? { slug: body.slug, _id: { $ne: id } } : { slug: body.slug })) {
      return "Another page or product already uses this URL.";
    }
    return null;
  };

  adminRouter.get(path, ah(async (_req, res) => res.json(await model.find().sort(opts.sort).lean())));
  adminRouter.get(`${path}/:id`, ah(async (req, res) => {
    if (!isId(String(req.params.id))) return res.status(404).json({ error: "Not found" });
    const doc = await model.findById(req.params.id).lean();
    return doc ? res.json(doc) : res.status(404).json({ error: "Not found" });
  }));
  adminRouter.post(path, ah(async (req, res) => {
    const body = strip(req.body);
    const err = opts.validate?.(body) || (await checkSlug(body));
    if (err) return res.status(400).json({ error: err });
    res.status(201).json(await model.create(body));
  }));
  adminRouter.put(`${path}/:id`, ah(async (req, res) => {
    const id = String(req.params.id);
    if (!isId(id)) return res.status(404).json({ error: "Not found" });
    const body = strip(req.body);
    const err = opts.validate?.(body) || (await checkSlug(body, id));
    if (err) return res.status(400).json({ error: err });
    const doc = await model.findByIdAndUpdate(id, body, { returnDocument: "after", runValidators: true }).lean();
    return doc ? res.json(doc) : res.status(404).json({ error: "Not found" });
  }));
  adminRouter.delete(`${path}/:id`, ah(async (req, res) => {
    const id = String(req.params.id);
    if (!isId(id)) return res.status(404).json({ error: "Not found" });
    const doc = await model.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    const blocked = opts.protect?.(doc);
    if (blocked) return res.status(400).json({ error: blocked });
    await model.deleteOne({ _id: id });
    res.json({ ok: true });
  }));
}

const requireTitle = (b: any) => (!String(b.title || "").trim() ? "Please add a title." : null);
crud("/pages", PageModel, { sort: { title: 1 }, slugged: true, sharedSlugs: true, validate: requireTitle,
  protect: (d) => (d.slug === "home" ? "The homepage can’t be deleted." : null) });
crud("/products", ProductModel, { sort: { order: 1 }, slugged: true, sharedSlugs: true,
  validate: (b) => (!String(b.name || "").trim() ? "Please add a product name." : null) });
crud("/news", NewsModel, { sort: { date: -1 }, slugged: true, validate: (b) => requireTitle(b) || (!b.date ? "Please set a publish date." : null) });
crud("/jobs", JobModel, { sort: { order: 1, createdAt: -1 }, validate: requireTitle });

adminRouter.put("/products-order", ah(async (req, res) => {
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids.filter(isId) : [];
  await Promise.all(ids.map((id, order) => ProductModel.updateOne({ _id: id }, { order })));
  res.json({ ok: true });
}));

/* -------------------------------------------------------------- inquiries */
adminRouter.get("/inquiries", ah(async (req, res) => {
  const status = String(req.query.status || "");
  res.json(await InquiryModel.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(500).lean());
}));
adminRouter.patch("/inquiries/:id", ah(async (req, res) => {
  const status = String(req.body?.status || "");
  if (!["new", "read", "archived"].includes(status) || !isId(String(req.params.id))) return res.status(400).json({ error: "Invalid request." });
  res.json(await InquiryModel.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" }).lean());
}));
adminRouter.delete("/inquiries/:id", ah(async (req, res) => {
  if (!isId(String(req.params.id))) return res.status(404).json({ error: "Not found" });
  await InquiryModel.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}));

/* --------------------------------------------------------------- settings */
adminRouter.get("/settings", ah(async (_req, res) => res.json(await SettingsModel.findOne({ key: "site" }).lean())));
adminRouter.put("/settings", ah(async (req, res) => {
  const { key, ...body } = strip(req.body) as Record<string, unknown>;
  res.json(await SettingsModel.findOneAndUpdate({ key: "site" }, body, { returnDocument: "after", upsert: true }).lean());
}));

/* ------------------------------------------------------------------ media */
const MediaModel = mongoose.models.Media || mongoose.model("Media", new mongoose.Schema({
  url: String, filename: String, type: String, size: Number, alt: String,
}, { timestamps: true, versionKey: false }));

// Only raster images: checked by their first bytes, not just the extension.
function sniff(buf: Buffer): { ext: string; type: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return { ext: "png", type: "image/png" };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  if (buf.toString("ascii", 0, 3) === "GIF") return { ext: "gif", type: "image/gif" };
  return null;
}

adminRouter.get("/media", ah(async (_req, res) => res.json(await MediaModel.find().sort({ createdAt: -1 }).limit(500).lean())));
adminRouter.post("/media", express.raw({ type: () => true, limit: "8mb" }), ah(async (req, res) => {
  const buf = req.body as Buffer;
  const kind = Buffer.isBuffer(buf) ? sniff(buf) : null;
  if (!kind) return res.status(400).json({ error: "Please upload a PNG, JPG, WebP or GIF image (max 8 MB)." });
  const base = String(req.headers["x-filename"] || "image").replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "image";
  const filename = `${Date.now().toString(36)}-${base}.${kind.ext}`;
  mkdirSync(UPLOAD_DIR, { recursive: true });
  writeFileSync(join(UPLOAD_DIR, filename), buf);
  const doc = await MediaModel.create({ url: `/uploads/${filename}`, filename, type: kind.type, size: buf.length, alt: "" });
  res.status(201).json(doc);
}));
adminRouter.delete("/media/:id", ah(async (req, res) => {
  if (!isId(String(req.params.id))) return res.status(404).json({ error: "Not found" });
  const doc: any = await MediaModel.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  try { unlinkSync(join(UPLOAD_DIR, doc.filename)); } catch { /* already gone */ }
  await MediaModel.deleteOne({ _id: doc._id });
  res.json({ ok: true });
}));

/* ------------------------------------------------------------------ users */
adminRouter.get("/users", requireAdmin, ah(async (_req, res) => {
  res.json(await UserModel.find().select("-passwordHash").sort({ createdAt: 1 }).lean());
}));
adminRouter.post("/users", requireAdmin, ah(async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase().trim();
  const name = String(req.body?.name || "").trim();
  const role = req.body?.role === "admin" ? "admin" : "editor";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) return res.status(400).json({ error: "Please enter a name and a valid email." });
  const problem = passwordProblem(req.body?.password);
  if (problem) return res.status(400).json({ error: problem });
  if (await UserModel.exists({ email })) return res.status(400).json({ error: "A user with this email already exists." });
  const user = await UserModel.create({ email, name, role, passwordHash: await hashPassword(req.body.password) });
  res.status(201).json({ _id: user._id, email, name, role });
}));
adminRouter.delete("/users/:id", requireAdmin, ah(async (req, res) => {
  if (req.params.id === req.user!.id) return res.status(400).json({ error: "You can’t delete your own account." });
  if (!isId(String(req.params.id))) return res.status(404).json({ error: "Not found" });
  await UserModel.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}));
