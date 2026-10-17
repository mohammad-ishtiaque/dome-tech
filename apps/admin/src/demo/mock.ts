// Preview mode (VITE_DEMO=1): an in-browser stand-in for the dashboard API, so the dashboard can be
// shared as a clickable preview without a server. Data starts from a snapshot of the real website
// content and is kept in this browser's localStorage. Only included in preview builds.
import seed from "./data.json";

type Doc = Record<string, any> & { _id: string };
type Db = typeof seed & Record<string, any>;

const KEY = "dd-demo-v1";
const AUTH = "dd-demo-auth";
const USER = { id: "demo00000000000000000010", name: "Client Preview", email: "preview@somdigitaldome.com", role: "admin" as const };

class DemoError extends Error { constructor(message: string, public status: number) { super(message); } }

function load(): Db {
  try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch { /* storage unavailable */ }
  return structuredClone(seed) as Db;
}
let db = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota or private mode: keep in memory */ } };
export function resetDemo() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  location.reload();
}

const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
const now = () => new Date().toISOString();
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(["api", "admin", "uploads", "inquiry", "sitemap.xml", "robots.txt", "assets"]);
const strip = ({ _id, createdAt, updatedAt, ...rest }: Doc) => rest;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const COLLECTIONS: Record<string, { key: keyof Db; slugged?: boolean; shared?: boolean; sort: (a: Doc, b: Doc) => number; protect?: (d: Doc) => string | null }> = {
  pages: { key: "pages", slugged: true, shared: true, sort: (a, b) => a.title.localeCompare(b.title), protect: (d) => (d.slug === "home" ? "The homepage can’t be deleted." : null) },
  products: { key: "products", slugged: true, shared: true, sort: (a, b) => (a.order ?? 0) - (b.order ?? 0) },
  news: { key: "news", slugged: true, sort: (a, b) => String(b.date).localeCompare(String(a.date)) },
  jobs: { key: "jobs", sort: (a, b) => (a.order ?? 0) - (b.order ?? 0) },
};

function slugError(name: string, body: Doc, id?: string) {
  const c = COLLECTIONS[name];
  if (!c.slugged) return null;
  if (!SLUG.test(body.slug || "")) return "URL may only contain lowercase letters, numbers and dashes.";
  if (RESERVED.has(body.slug)) return "That URL is reserved. Please choose another.";
  const pools = c.shared ? [db.pages, db.products] : [db[c.key]];
  if (pools.some((list: Doc[]) => list.some((d) => d.slug === body.slug && d._id !== id))) return "Another page or product already uses this URL.";
  return null;
}

export async function demoRequest(method: string, path: string, body?: any, file?: Blob): Promise<unknown> {
  await delay(120);
  const [pathname, query = ""] = path.split("?");
  const parts = pathname.split("/").filter(Boolean);
  const authed = (() => { try { return localStorage.getItem(AUTH) === "1"; } catch { return true; } })();

  // auth
  if (pathname === "/auth/login") { try { localStorage.setItem(AUTH, "1"); } catch { /* ignore */ } return { user: USER }; }
  if (!authed) throw new DemoError("Please sign in.", 401);
  if (pathname === "/auth/logout") { try { localStorage.removeItem(AUTH); } catch { /* ignore */ } return { ok: true }; }
  if (pathname === "/auth/me") return { user: USER };
  if (pathname === "/auth/password") return { ok: true };

  if (pathname === "/overview") {
    const inq = db.inquiries as Doc[];
    return {
      pages: db.pages.length, products: db.products.length, news: db.news.length, jobs: (db.jobs as Doc[]).filter((j) => j.open).length,
      newInquiries: inq.filter((q) => q.status === "new").length, inquiries: inq.length,
      recent: [...inq].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5),
    };
  }

  if (pathname === "/products-order" && method === "PUT") {
    const ids: string[] = body?.ids || [];
    for (const p of db.products as Doc[]) p.order = ids.indexOf(p._id);
    save(); return { ok: true };
  }

  const name = parts[0];
  if (COLLECTIONS[name]) {
    const c = COLLECTIONS[name];
    const list = db[c.key] as Doc[];
    const id = parts[1];
    if (method === "GET" && !id) return [...list].sort(c.sort);
    if (method === "GET") { const d = list.find((x) => x._id === id); if (!d) throw new DemoError("Not found", 404); return d; }
    if (method === "POST") {
      const err = slugError(name, body); if (err) throw new DemoError(err, 400);
      const doc = { ...strip(body), _id: newId(), createdAt: now(), updatedAt: now() };
      list.push(doc); save(); return doc;
    }
    if (method === "PUT") {
      const i = list.findIndex((x) => x._id === id); if (i < 0) throw new DemoError("Not found", 404);
      const err = slugError(name, body, id); if (err) throw new DemoError(err, 400);
      list[i] = { ...list[i], ...strip(body), _id: id, updatedAt: now() }; save(); return list[i];
    }
    if (method === "DELETE") {
      const d = list.find((x) => x._id === id); if (!d) throw new DemoError("Not found", 404);
      const blocked = c.protect?.(d); if (blocked) throw new DemoError(blocked, 400);
      (db as any)[c.key] = list.filter((x) => x._id !== id); save(); return { ok: true };
    }
  }

  if (name === "inquiries") {
    const id = parts[1];
    if (method === "GET") { const status = new URLSearchParams(query).get("status"); return (db.inquiries as Doc[]).filter((q) => !status || q.status === status).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); }
    const q = (db.inquiries as Doc[]).find((x) => x._id === id); if (!q) throw new DemoError("Not found", 404);
    if (method === "PATCH") { q.status = body.status; save(); return q; }
    if (method === "DELETE") { db.inquiries = (db.inquiries as Doc[]).filter((x) => x._id !== id) as any; save(); return { ok: true }; }
  }

  if (name === "settings") {
    if (method === "GET") return db.settings;
    if (method === "PUT") { const { key, ...rest } = strip(body); db.settings = { ...db.settings, ...rest }; save(); return db.settings; }
  }

  if (name === "media") {
    if (method === "GET") return [...db.media].sort((a: Doc, b: Doc) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (method === "POST" && file) {
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new DemoError("Please upload a PNG, JPG, WebP or GIF image (max 8 MB).", 400);
      // Small images are kept as data URLs so they survive a reload; larger ones last for this visit only.
      const url = file.size < 700_000
        ? await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); })
        : URL.createObjectURL(file);
      const doc = { _id: newId(), url, filename: (file as File).name || "image", type: file.type, size: file.size, createdAt: now() };
      (db.media as Doc[]).unshift(doc); save(); return doc;
    }
    if (method === "DELETE") { db.media = (db.media as Doc[]).filter((m) => m._id !== parts[1]) as any; save(); return { ok: true }; }
  }

  if (name === "users") {
    if (method === "GET") return db.users;
    if (method === "POST") {
      if (!body?.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body?.email || "")) throw new DemoError("Please enter a name and a valid email.", 400);
      if (String(body.password || "").length < 10) throw new DemoError("Password must be at least 10 characters.", 400);
      const u = { _id: newId(), name: body.name, email: body.email, role: body.role === "admin" ? "admin" : "editor" };
      (db.users as Doc[]).push(u); save(); return u;
    }
    if (method === "DELETE") { db.users = (db.users as Doc[]).filter((u) => u._id !== parts[1]) as any; save(); return { ok: true }; }
  }

  throw new DemoError("Not available in preview mode.", 404);
}
