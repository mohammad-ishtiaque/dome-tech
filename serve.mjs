// Tiny zero-dependency preview server: `node serve.mjs` → http://localhost:4173
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const root = join(import.meta.dirname, "site");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".xml": "application/xml", ".txt": "text/plain" };

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  else if (!extname(p)) { res.writeHead(301, { Location: p + "/" }); return res.end(); }
  const file = normalize(join(root, p));
  try {
    if (!file.startsWith(root + sep)) throw new Error("outside root");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": types[".html"] });
    res.end(await readFile(join(root, "404.html")));
  }
}).listen(4173, () => console.log("Preview: http://localhost:4173"));
