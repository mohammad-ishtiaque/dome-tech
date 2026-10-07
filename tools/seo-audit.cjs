// SEO audit: `node tools/seo-audit.cjs` (run from project root or site/)
const fs = require("fs"), path = require("path");
const root = fs.existsSync("site") ? "site" : ".";
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith(".html") && pages.push(p); } })(root);
const resolve = (href) => { const u = href.split("#")[0].split("?")[0]; if (!u) return null; const f = path.join(root, u.endsWith("/") ? u + "index.html" : u); return f; };
let problems = [], titles = {}, descs = {};
for (const p of pages) {
  const h = fs.readFileSync(p, "utf8"), rel = path.relative(root, p);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (title.length > 70) problems.push(`${rel}: title ${title.length} chars`);
  if (desc.length < 70 || desc.length > 165) problems.push(`${rel}: description ${desc.length} chars`);
  if (h1 !== 1) problems.push(`${rel}: ${h1} <h1>`);
  if (titles[title]) problems.push(`${rel}: duplicate title`); titles[title] = 1;
  if (descs[desc]) problems.push(`${rel}: duplicate description`); descs[desc] = 1;
  for (const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { problems.push(`${rel}: invalid JSON-LD`); } }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/alt="/.test(m[0])) problems.push(`${rel}: img without alt`);
  for (const m of h.matchAll(/(?:href|src)="(\/[^"]*)"/g)) { const f = resolve(m[1]); if (f && !fs.existsSync(f)) problems.push(`${rel}: broken ${m[1]}`);
    const hash = m[1].split("#")[1]; if (hash && f && fs.existsSync(f) && !fs.readFileSync(f, "utf8").includes(`id="${hash}"`)) problems.push(`${rel}: missing anchor ${m[1]}`); }
  console.log(`${rel.padEnd(22)} title ${String(title.length).padStart(2)} | desc ${String(desc.length).padStart(3)} | ld+json ${(h.match(/application\/ld\+json/g) || []).length}`);
}
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNo SEO problems found.");
