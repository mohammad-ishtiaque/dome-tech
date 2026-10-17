import type { Section } from "./sections";
import { type Field, opts } from "./fields";

export interface Seo {
  title?: string;
  description?: string;
}

export interface Page {
  _id?: string;
  slug: string;            // "home", "about", "investors", … (URL: "/" for home, "/<slug>/" otherwise)
  title: string;           // name shown in the dashboard
  seo: Seo;
  numbered?: boolean;      // show 01, 02… in section eyebrows
  sections: Section[];
  updatedAt?: string;
}

export const PRODUCT_STATUSES = ["In development", "Testing", "Beta", "Launching", "Live"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductIcon = "pin" | "heart" | "broadcast" | "code" | "star" | "chart";

export interface Product {
  _id?: string;
  slug: string;
  order: number;
  name: string;
  fullName?: string;
  role: string;              // one-line category, e.g. "Local business discovery platform"
  color: string;             // hex accent color
  icon: ProductIcon;
  logo?: string;             // uploaded logo (replaces the generated icon)
  status: ProductStatus;
  promise: string;           // hero subheadline
  purpose: string;           // card text on the homepage
  market: string;
  monetization: string;
  channel: string;
  mockup: {
    device: "phone" | "browser";
    screenshot?: string;     // uploaded screen shown in the hero frame
    title?: string;          // concept screen text when no screenshot
    subtitle?: string;
    concept?: "list" | "profiles" | "event" | "dashboard"; // illustrative screen used until a screenshot is uploaded
  };
  heroButtons: { label: string; href: string; style?: "primary" | "secondary" }[];
  seo: Seo;
  sections: Section[];       // page body below the product header
  published: boolean;
}

export interface NewsPost {
  _id?: string;
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;              // markdown
  image?: string;
  published: boolean;
}

export interface Job {
  _id?: string;
  title: string;
  location?: string;
  type?: "Full-time" | "Part-time" | "Contract" | "Internship";
  summary?: string;
  body: string;              // markdown
  open: boolean;
  order: number;
}

export interface Inquiry {
  _id?: string;
  name: string;
  email: string;
  org?: string;
  interest: string;
  message?: string;
  page?: string;
  status: "new" | "read" | "archived";
  createdAt?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  linkedin?: string;
}

export interface Settings {
  siteName: string;
  domain: string;
  tagline: string;
  footerText: string;
  contact: { email: string; phone?: string; location: string };
  social: { label: string; url: string }[];
  milestones: { state: "done" | "current" | "next"; label: string }[];
  metrics: { value: string; label: string; asOf?: string }[];
  team: TeamMember[];
  updatedLabel: string;      // e.g. "October 2026", shown next to traction
  headerCta: { label: string; href: string };
}

// Dashboard form definitions
export const PRODUCT_FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "fullName", label: "Full name (optional)", type: "text", help: "e.g. SomSoft by Digital Dome" },
  { key: "slug", label: "URL", type: "text", required: true, help: "Lowercase, no spaces: /somspot/" },
  { key: "role", label: "Category line", type: "text", required: true },
  { key: "color", label: "Brand color", type: "color", required: true },
  { key: "icon", label: "Icon", type: "select", options: opts(["pin", "Map pin"], ["heart", "Heart"], ["broadcast", "Broadcast"], ["code", "Code"], ["star", "Star"], ["chart", "Chart"]) },
  { key: "logo", label: "Logo (optional, replaces the icon)", type: "image" },
  { key: "status", label: "Status", type: "select", options: PRODUCT_STATUSES.map((s) => ({ value: s, label: s })) },
  { key: "promise", label: "Headline promise", type: "textarea", required: true },
  { key: "purpose", label: "Short purpose (portfolio card)", type: "textarea" },
  { key: "market", label: "Target market", type: "text" },
  { key: "monetization", label: "Monetization", type: "text" },
  { key: "channel", label: "Channel", type: "text", help: "e.g. Consumer · SME" },
  { key: "published", label: "Show on website", type: "boolean" },
];

export const SETTINGS_FIELDS: Field[] = [
  { key: "siteName", label: "Site name", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "footerText", label: "Footer text", type: "textarea" },
  { key: "updatedLabel", label: "Traction 'last updated' label", type: "text" },
];
