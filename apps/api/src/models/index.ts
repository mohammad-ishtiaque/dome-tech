import mongoose, { Schema } from "mongoose";

const { Mixed } = Schema.Types;
const seo = { title: String, description: String };
const opts = { timestamps: true, minimize: false, versionKey: false } as const;

const PageSchema = new Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true },
  seo,
  numbered: { type: Boolean, default: false },
  sections: { type: [Mixed], default: [] },
}, opts);

const ProductSchema = new Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  order: { type: Number, default: 0 },
  name: { type: String, required: true },
  fullName: String,
  role: String,
  color: { type: String, default: "#1f7aff" },
  icon: { type: String, default: "star" },
  logo: String,
  status: { type: String, default: "In development" },
  promise: String,
  purpose: String,
  market: String,
  monetization: String,
  channel: String,
  mockup: { type: Mixed, default: { device: "phone" } },
  heroButtons: { type: [Mixed], default: [] },
  seo,
  sections: { type: [Mixed], default: [] },
  published: { type: Boolean, default: true },
}, opts);

const NewsSchema = new Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  summary: String,
  body: String,
  image: String,
  published: { type: Boolean, default: true },
}, opts);

const JobSchema = new Schema({
  title: { type: String, required: true },
  location: String,
  type: String,
  summary: String,
  body: String,
  open: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, opts);

const InquirySchema = new Schema({
  name: { type: String, required: true, maxlength: 200 },
  email: { type: String, required: true, maxlength: 200 },
  org: { type: String, maxlength: 200 },
  interest: { type: String, required: true, maxlength: 50 },
  message: { type: String, maxlength: 5000 },
  page: { type: String, maxlength: 300 },
  status: { type: String, default: "new" },
}, opts);

// Site-wide settings live in one document with key "site".
const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true, default: "site" },
  siteName: String,
  domain: String,
  tagline: String,
  footerText: String,
  contact: { type: Mixed, default: {} },
  social: { type: [Mixed], default: [] },
  milestones: { type: [Mixed], default: [] },
  metrics: { type: [Mixed], default: [] },
  team: { type: [Mixed], default: [] },
  updatedLabel: String,
  headerCta: { type: Mixed, default: {} },
}, opts);

export const PageModel = mongoose.model("Page", PageSchema);
export const ProductModel = mongoose.model("Product", ProductSchema);
export const NewsModel = mongoose.model("News", NewsSchema);
export const JobModel = mongoose.model("Job", JobSchema);
export const InquiryModel = mongoose.model("Inquiry", InquirySchema);
export const SettingsModel = mongoose.model("Settings", SettingsSchema);
