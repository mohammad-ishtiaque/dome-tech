// Admin accounts and sessions. Passwords are hashed with scrypt (built into Node); no third-party auth.
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import mongoose, { Schema } from "mongoose";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const UserModel = mongoose.model("User", new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ["admin", "editor"], default: "editor" },
  passwordHash: { type: String, required: true },
  lastLoginAt: Date,
}, { timestamps: true, versionKey: false }));

// Only a SHA-256 of the session token is stored, so a database leak doesn't expose live sessions.
const SessionModel = mongoose.model("Session", new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { versionKey: false }));

export const COOKIE = "dd_admin";
const SESSION_DAYS = 7;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [, saltHex, keyHex] = stored.split("$");
  if (!saltHex || !keyHex) return false;
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

export function passwordProblem(password: unknown) {
  if (typeof password !== "string" || password.length < 10) return "Password must be at least 10 characters.";
  return null;
}

export async function createSession(res: Response, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await SessionModel.create({ tokenHash: sha(token), userId, expiresAt });
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production",
    path: "/api", expires: expiresAt,
  });
}

export async function destroySession(req: Request, res: Response) {
  const token = readCookie(req);
  if (token) await SessionModel.deleteOne({ tokenHash: sha(token) });
  res.clearCookie(COOKIE, { path: "/api" });
}

function readCookie(req: Request) {
  const raw = req.headers.cookie || "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; name: string; role: "admin" | "editor" };
}

/** Requires a valid session. Mutating requests must also send X-Requested-With (CSRF guard). */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.method !== "GET" && req.headers["x-requested-with"] !== "dome-admin") {
    return res.status(403).json({ error: "Missing request header." });
  }
  const token = readCookie(req);
  if (!token) return res.status(401).json({ error: "Please sign in." });
  const session = await SessionModel.findOne({ tokenHash: sha(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  const user = await UserModel.findById(session.userId).lean();
  if (!user) return res.status(401).json({ error: "Please sign in." });
  req.user = { id: String(user._id), email: user.email, name: user.name, role: user.role as "admin" | "editor" };
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Only administrators can do this." });
  next();
}

// Login rate limit: 10 attempts per 15 minutes per IP + email.
const attempts = new Map<string, number[]>();
export function loginAllowed(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((t) => now - t < 15 * 60_000);
  attempts.set(key, recent);
  return recent.length < 10;
}
export function recordFailedLogin(key: string) {
  attempts.set(key, [...(attempts.get(key) || []), Date.now()]);
}
