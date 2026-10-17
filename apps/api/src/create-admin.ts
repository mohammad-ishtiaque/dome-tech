// Creates (or resets) a dashboard administrator.
//   pnpm create-admin you@example.com "Your Name"
// A strong random password is generated and printed once. Change it after signing in.
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { UserModel, hashPassword } from "./auth.js";

const [email, ...nameParts] = process.argv.slice(2);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: pnpm create-admin you@example.com "Your Name"');
  process.exit(1);
}
const name = nameParts.join(" ").trim() || email.split("@")[0];
const password = randomBytes(12).toString("base64url");

await connectDb();
const existing = await UserModel.findOne({ email: email.toLowerCase() });
if (existing) {
  existing.passwordHash = await hashPassword(password);
  existing.role = "admin";
  await existing.save();
} else {
  await UserModel.create({ email, name, role: "admin", passwordHash: await hashPassword(password) });
}
console.log(`\n${existing ? "Password reset for" : "Administrator created:"} ${email}\nTemporary password: ${password}\nSign in to the dashboard and change it under Account.\n`);
await mongoose.disconnect();
process.exit(0);
