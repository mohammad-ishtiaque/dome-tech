// Small client for the dashboard API (/api/admin). Same origin, cookie-based session.
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** Preview builds (VITE_DEMO=1) run against an in-browser stand-in instead of the real API. */
export const DEMO = import.meta.env.VITE_DEMO === "1";

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

async function request<T>(method: string, path: string, body?: unknown, raw?: { data: Blob; filename: string }): Promise<T> {
  if (import.meta.env.VITE_DEMO === "1") {
    const { demoRequest } = await import("./demo/mock");
    try { return (await demoRequest(method, path, body, raw?.data)) as T; }
    catch (e) {
      const status = (e as { status?: number }).status || 500;
      if (status === 401 && !path.startsWith("/auth/login")) onUnauthorized();
      throw new ApiError((e as Error).message, status);
    }
  }
  const headers: Record<string, string> = { Accept: "application/json", "X-Requested-With": "dome-admin" };
  let payload: BodyInit | undefined;
  if (raw) {
    headers["Content-Type"] = raw.data.type || "application/octet-stream";
    headers["X-Filename"] = raw.filename;
    payload = raw.data;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api/admin${path}`, { method, headers, body: payload, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith("/auth/login")) onUnauthorized();
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Please try again.", res.status);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(file: File) => request<T>("POST", "/media", undefined, { data: file, filename: file.name }),
};

export interface User { id: string; email: string; name: string; role: "admin" | "editor" }
export interface Media { _id: string; url: string; filename: string; type: string; size: number; createdAt: string }

/** Public site address, for "View on site" links. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || "http://localhost:5173";
