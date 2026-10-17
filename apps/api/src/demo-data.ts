// Sample content so every dashboard screen looks realistic for design reviews / Figma capture.
//   pnpm demo-data          add the samples
//   pnpm demo-data --remove remove them again
// Local development only: everything it creates is marked so it can be removed cleanly.
import { copyFileSync, existsSync, mkdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { UserModel, hashPassword } from "./auth.js";
import { InquiryModel, JobModel, NewsModel } from "./models/index.js";
import { UPLOAD_DIR } from "./uploads.js";

if (process.env.NODE_ENV === "production") {
  console.error("demo-data is for local development only.");
  process.exit(1);
}

const DEMO_DOMAIN = "@example.com";           // sample inquiries and users
const DEMO_JOB = "Full-Stack Engineer (sample)";
const DEMO_NEWS = "sample-practitioner-onboarding";
const DEMO_IMAGES = ["og-image.png", "apple-touch-icon.png"]; // copied from the website's public folder

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

await connectDb();
const Media = mongoose.connection.collection("media");

if (process.argv.includes("--remove")) {
  const inq = await InquiryModel.deleteMany({ email: { $regex: `${DEMO_DOMAIN.replace(".", "\\.")}$` } });
  const users = await UserModel.deleteMany({ email: { $regex: `${DEMO_DOMAIN.replace(".", "\\.")}$` } });
  const jobs = await JobModel.deleteMany({ title: DEMO_JOB });
  const news = await NewsModel.deleteMany({ slug: DEMO_NEWS });
  const media = await Media.find({ filename: { $regex: "^demo-" } }).toArray();
  for (const m of media) { try { unlinkSync(join(UPLOAD_DIR, m.filename)); } catch { /* gone */ } }
  await Media.deleteMany({ filename: { $regex: "^demo-" } });
  console.log(`Removed demo data: ${inq.deletedCount} inquiries, ${users.deletedCount} user, ${jobs.deletedCount} job, ${news.deletedCount} news post, ${media.length} images.`);
} else {
  await InquiryModel.insertMany([
    { name: "Amina Yusuf", email: `amina.yusuf${DEMO_DOMAIN}`, org: "Horn Ventures", interest: "invest", page: "/investors/", status: "new",
      message: "We invest in early-stage technology companies in East Africa and would like to learn more about Digital Dome’s portfolio and current round.", createdAt: hoursAgo(2) },
    { name: "Mohamed Farah", email: `m.farah${DEMO_DOMAIN}`, org: "Coastal Telecom", interest: "telecom", page: "/", status: "new",
      message: "Our mobile-money team is interested in a distribution partnership for SomSpot and Fagaaro. Could we schedule a call next week?", createdAt: hoursAgo(7) },
    { name: "Hodan Ali", email: `hodan.ali${DEMO_DOMAIN}`, org: "Banadir Clinics", interest: "enterprise", page: "/somsoft/", status: "read",
      message: "We need a patient booking and records system for three clinics. Please share how SomSoft usually scopes a project like this.", createdAt: hoursAgo(30) },
    { name: "Abdi Warsame", email: `abdi.w${DEMO_DOMAIN}`, org: "", interest: "media", page: "/contact/", status: "archived",
      message: "I’m writing a feature on Somali tech startups and would love a short interview with the founders.", createdAt: hoursAgo(80) },
  ]);

  if (!(await JobModel.exists({ title: DEMO_JOB }))) {
    await JobModel.create({ title: DEMO_JOB, location: "Mogadishu or remote", type: "Full-time", open: false, order: 0,
      summary: "Build and ship features across our consumer apps and client projects.",
      body: "## What you’ll do\n\n- Build web and mobile features end to end\n- Work closely with product and design\n\n## What we’re looking for\n\n- 3+ years with TypeScript, React and Node.js\n- Experience with mobile-money integrations is a plus" });
  }
  if (!(await NewsModel.exists({ slug: DEMO_NEWS }))) {
    await NewsModel.create({ slug: DEMO_NEWS, title: "Shifaa opens practitioner onboarding (sample)", date: new Date().toISOString(), published: false,
      summary: "A sample draft post used for design reviews.", body: "This is a sample draft. It is not visible on the website." });
  }
  if (!(await UserModel.exists({ email: `editor${DEMO_DOMAIN}` }))) {
    await UserModel.create({ email: `editor${DEMO_DOMAIN}`, name: "Sample Editor", role: "editor",
      passwordHash: await hashPassword(randomBytes(16).toString("hex")), lastLoginAt: hoursAgo(20) });
  }

  const publicDir = fileURLToPath(new URL("../../web/public/", import.meta.url));
  mkdirSync(UPLOAD_DIR, { recursive: true });
  for (const file of DEMO_IMAGES) {
    const filename = `demo-${file}`;
    if (!existsSync(join(publicDir, file)) || (await Media.findOne({ filename }))) continue;
    copyFileSync(join(publicDir, file), join(UPLOAD_DIR, filename));
    await Media.insertOne({ url: `/uploads/${filename}`, filename, type: "image/png", size: statSync(join(publicDir, file)).size, alt: "", createdAt: new Date(), updatedAt: new Date() });
  }
  console.log("Added demo data: 4 inquiries, 1 draft job, 1 draft news post, 1 sample editor, sample images.\nRemove it with: pnpm demo-data --remove");
}

await mongoose.disconnect();
process.exit(0);
