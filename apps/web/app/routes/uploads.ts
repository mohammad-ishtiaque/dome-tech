// Serves images uploaded in the dashboard by forwarding to the API.
// On the VPS, nginx can serve /uploads directly from disk instead; this route is the fallback.
import type { Route } from "./+types/uploads";

const API_URL = (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");

export async function loader({ params }: Route.LoaderArgs) {
  if (!/^[a-z0-9-]+\.(png|jpe?g|webp|gif)$/i.test(params.file)) return new Response("Not found", { status: 404 });
  const res = await fetch(`${API_URL}/uploads/${params.file}`);
  if (!res.ok) return new Response("Not found", { status: 404 });
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
