import express from "express";
import { connectDb } from "./db.js";
import { PageModel } from "./models/index.js";
import { publicRouter } from "./routes/public.js";
import { adminRouter } from "./routes/admin.js";
import { UPLOAD_DIR } from "./uploads.js";
import { seed } from "./seed.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);
// Uploaded images. Long cache: every upload gets a unique file name.
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "365d", immutable: true, fallthrough: false }));

app.use((err: Error & { status?: number; statusCode?: number; type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 404 ? "Not found" : status === 413 ? "That file is too large." : status < 500 ? "Invalid request." : "Something went wrong." });
});

await connectDb();
if ((await PageModel.estimatedDocumentCount()) === 0) {
  console.log("Empty database: loading the current website content…");
  await seed();
}

const port = Number(process.env.PORT) || 4000;
// On the VPS HOST=127.0.0.1 keeps the API private: only nginx and the website can reach it.
const host = process.env.HOST;
const onListen = () => console.log(`API ready on http://${host || "localhost"}:${port}`);
if (host) app.listen(port, host, onListen);
else app.listen(port, onListen);
