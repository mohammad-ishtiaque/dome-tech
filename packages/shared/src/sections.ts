// Section library. Every page (and every product page) is an ordered list of sections.
// Adding a new section type = add it to SECTION_TYPES here + a React component in apps/web.
import { type Field, buttonFields, opts } from "./fields";

export type Background = "default" | "soft" | "blue";

export interface Button {
  label: string;
  href: string;
  style?: "primary" | "secondary";
}

/** Fields every section has. `data` holds the type-specific content. */
export interface Section<T extends SectionType = SectionType, D = Record<string, unknown>> {
  id: string;
  type: T;
  hidden?: boolean;
  background?: Background;
  anchor?: string;   // optional #id so menus/buttons can link to the section
  eyebrow?: string;  // small label above the heading
  title?: string;
  lead?: string;     // intro paragraph under the heading
  data: D;
}

export interface SectionTypeDef {
  label: string;
  description: string;
  /** Show the shared eyebrow / title / lead header fields in the editor. */
  header: boolean;
  fields: Field[];
  defaults: Record<string, unknown>;
}

export const ICONS = opts(["", "None"], ["map", "Map pin"], ["globe", "Globe / language"], ["wallet", "Wallet"], ["layers", "Layers"], ["share", "Share"], ["building", "Building"], ["trend", "Growth"], ["hand", "Handshake"], ["doc", "Document"], ["shield", "Shield"], ["flag", "Flag"], ["rocket", "Rocket"]);

const markdownHelp = "Supports **bold**, *italic*, [links](/path), ## headings and - lists.";

export const SECTION_TYPES = {
  hero: {
    label: "Hero (homepage)",
    description: "Large opening section with headline, buttons and the ecosystem visual.",
    header: false,
    fields: [
      { key: "kickerTag", label: "Kicker tag", type: "text", help: "Small pill above the headline, e.g. Somalia" },
      { key: "kicker", label: "Kicker text", type: "text" },
      { key: "heading", label: "Headline", type: "text", required: true },
      { key: "highlight", label: "Highlighted words", type: "text", help: "Shown in the blue gradient after the headline" },
      { key: "subheading", label: "Subheadline", type: "textarea" },
      { key: "bullets", label: "Supporting points", type: "list", itemLabel: "point", fields: [{ key: "text", label: "Text", type: "text" }] },
      { key: "buttons", label: "Buttons", type: "list", itemLabel: "button", maxItems: 2, fields: buttonFields },
      { key: "visual", label: "Visual", type: "select", options: opts(["ecosystem", "Product ecosystem"], ["image", "Image"]) },
      { key: "image", label: "Image (if visual = image)", type: "image" },
      { key: "chips", label: "Floating stat chips", type: "list", itemLabel: "chip", maxItems: 2, fields: [
        { key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] },
      { key: "showProductStrip", label: "Show product strip under the hero", type: "boolean" },
    ],
    defaults: { heading: "New headline", visual: "ecosystem", bullets: [], buttons: [], chips: [], showProductStrip: true },
  },
  pageHero: {
    label: "Page header",
    description: "Opening section for inner pages: title, intro and optional buttons.",
    header: true,
    fields: [
      { key: "buttons", label: "Buttons", type: "list", itemLabel: "button", maxItems: 2, fields: buttonFields },
      { key: "image", label: "Image (optional, shown on the right)", type: "image" },
      { key: "facts", label: "Fact row under the header (optional)", type: "list", itemLabel: "fact", maxItems: 4, fields: [
        { key: "label", label: "Label", type: "text" }, { key: "value", label: "Value", type: "text" }] },
    ],
    defaults: { buttons: [], facts: [] },
  },
  stats: {
    label: "Statistics",
    description: "Number cards with optional progress bar and a source line.",
    header: true,
    fields: [
      { key: "items", label: "Statistics", type: "list", itemLabel: "statistic", fields: [
        { key: "value", label: "Number", type: "text", required: true, help: "e.g. 19.7" },
        { key: "unit", label: "Unit", type: "text", help: "e.g. M, %, yrs" },
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Description", type: "textarea" },
        { key: "meter", label: "Progress bar (0–100, optional)", type: "number" },
        { key: "featured", label: "Highlight (blue card)", type: "boolean" },
        { key: "tag", label: "Tag", type: "select", options: opts(["Fact", "Fact"], ["Insight", "Insight"]) },
        { key: "source", label: "Source", type: "text" },
        { key: "sourceUrl", label: "Source link", type: "url" },
      ] },
      { key: "note", label: "Note under the cards", type: "text" },
    ],
    defaults: { items: [] },
  },
  cards: {
    label: "Cards",
    description: "Grid of cards: points, benefits, services, thesis items, revenue streams.",
    header: true,
    fields: [
      { key: "columns", label: "Columns", type: "select", options: opts(["2", "2 columns"], ["3", "3 columns"], ["4", "4 columns"]) },
      { key: "style", label: "Card style", type: "select", options: opts(["plain", "Plain"], ["numbered", "Numbered (01, 02…)"], ["accent", "Accent border"]) },
      { key: "items", label: "Cards", type: "list", itemLabel: "card", fields: [
        { key: "icon", label: "Icon (optional)", type: "select", options: ICONS },
        { key: "tag", label: "Tag (optional)", type: "text", help: "e.g. Core, Planned" },
        { key: "title", label: "Title", type: "text", required: true },
        { key: "text", label: "Text", type: "textarea" },
        { key: "href", label: "Link (optional)", type: "url" },
        { key: "linkLabel", label: "Link text", type: "text" },
      ] },
      { key: "chips", label: "Chips under the cards (optional)", type: "list", itemLabel: "chip", fields: [{ key: "text", label: "Text", type: "text" }] },
    ],
    defaults: { columns: "3", style: "plain", items: [], chips: [] },
  },
  productGrid: {
    label: "Product portfolio",
    description: "Cards for every product, with status, market and monetization. Content comes from Products.",
    header: true,
    fields: [],
    defaults: {},
  },
  ecosystem: {
    label: "Ecosystem diagram",
    description: "Parent company with all products beneath it, and the audiences served.",
    header: true,
    fields: [
      { key: "parentText", label: "Text next to Digital Dome", type: "text" },
      { key: "audiencesLabel", label: "Audiences label", type: "text" },
      { key: "audiences", label: "Audiences", type: "list", itemLabel: "audience", fields: [{ key: "text", label: "Audience", type: "text" }] },
    ],
    defaults: { audiences: [] },
  },
  traction: {
    label: "Traction",
    description: "Milestones, key facts and verified metrics (metrics and milestones are managed in Settings).",
    header: true,
    fields: [
      { key: "facts", label: "Key facts", type: "list", itemLabel: "fact", maxItems: 3, fields: [
        { key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] },
      { key: "emptyTitle", label: "Title when no metrics are published", type: "text" },
      { key: "emptyText", label: "Text when no metrics are published", type: "textarea" },
    ],
    defaults: { facts: [] },
  },
  revenueMatrix: {
    label: "Revenue matrix",
    description: "Table of revenue streams against products.",
    header: true,
    fields: [
      { key: "rows", label: "Revenue streams", type: "list", itemLabel: "revenue stream", fields: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "text" },
        { key: "products", label: "Per product", type: "productMap", options: opts(["", "—"], ["core", "Core"], ["planned", "Planned"]) },
      ] },
    ],
    defaults: { rows: [] },
  },
  steps: {
    label: "Steps",
    description: "Numbered process, e.g. how it works.",
    header: true,
    fields: [
      { key: "items", label: "Steps", type: "list", itemLabel: "step", fields: [
        { key: "title", label: "Title", type: "text", required: true }, { key: "text", label: "Text", type: "textarea" }] },
    ],
    defaults: { items: [] },
  },
  roadmap: {
    label: "Roadmap",
    description: "Phases side by side, e.g. Now / Next / Later.",
    header: true,
    fields: [
      { key: "phases", label: "Phases", type: "list", itemLabel: "phase", fields: [
        { key: "label", label: "Label", type: "text", help: "e.g. Now, 0–6 months" },
        { key: "tag", label: "Tag", type: "text", help: "e.g. Focus" },
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Text", type: "textarea" },
        { key: "items", label: "Points", type: "list", itemLabel: "point", fields: [{ key: "text", label: "Text", type: "text" }] },
        { key: "variant", label: "Look", type: "select", options: opts(["normal", "Normal"], ["highlight", "Highlighted (blue)"], ["muted", "Muted"]) },
      ] },
    ],
    defaults: { phases: [] },
  },
  table: {
    label: "Table",
    description: "Comparison or information table.",
    header: true,
    fields: [
      { key: "columns", label: "Column headings", type: "list", itemLabel: "column", fields: [{ key: "text", label: "Heading", type: "text" }] },
      { key: "rows", label: "Rows", type: "list", itemLabel: "row", fields: [
        { key: "cells", label: "Cells (left to right)", type: "list", itemLabel: "cell", fields: [{ key: "text", label: "Text", type: "text" }] }] },
      { key: "highlightLast", label: "Highlight the last column", type: "boolean" },
    ],
    defaults: { columns: [], rows: [], highlightLast: false },
  },
  textImage: {
    label: "Text and image",
    description: "Text block next to an image.",
    header: true,
    fields: [
      { key: "body", label: "Text", type: "markdown", help: markdownHelp },
      { key: "image", label: "Image", type: "image" },
      { key: "imageAlt", label: "Image description (for accessibility and SEO)", type: "text" },
      { key: "imagePosition", label: "Image position", type: "select", options: opts(["right", "Right"], ["left", "Left"]) },
      { key: "buttons", label: "Buttons", type: "list", itemLabel: "button", maxItems: 2, fields: buttonFields },
    ],
    defaults: { imagePosition: "right", buttons: [] },
  },
  richText: {
    label: "Text",
    description: "Formatted text: paragraphs, headings, lists and links.",
    header: true,
    fields: [{ key: "body", label: "Text", type: "markdown", help: markdownHelp }],
    defaults: { body: "" },
  },
  checklist: {
    label: "Checklist",
    description: "Points with check marks, e.g. key differentiators.",
    header: true,
    fields: [
      { key: "intro", label: "Text beside the list (optional)", type: "textarea" },
      { key: "items", label: "Points", type: "list", itemLabel: "point", fields: [
        { key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "text" }] },
      { key: "button", label: "Button (optional)", type: "list", itemLabel: "button", maxItems: 1, fields: buttonFields },
    ],
    defaults: { items: [], button: [] },
  },
  screenshots: {
    label: "App screenshots",
    description: "Gallery of app screens in phone or browser frames.",
    header: true,
    fields: [
      { key: "device", label: "Frame", type: "select", options: opts(["phone", "Phone"], ["browser", "Browser / desktop"]) },
      { key: "images", label: "Screens", type: "list", itemLabel: "screen", fields: [
        { key: "image", label: "Screenshot", type: "image", required: true },
        { key: "caption", label: "Caption", type: "text" }] },
    ],
    defaults: { device: "phone", images: [] },
  },
  faq: {
    label: "FAQ",
    description: "Questions and answers (also added to Google search data).",
    header: true,
    fields: [
      { key: "items", label: "Questions", type: "list", itemLabel: "question", fields: [
        { key: "question", label: "Question", type: "text", required: true },
        { key: "answer", label: "Answer", type: "textarea", required: true }] },
    ],
    defaults: { items: [] },
  },
  cta: {
    label: "Call to action",
    description: "Highlighted banner with buttons.",
    header: true,
    fields: [
      { key: "variant", label: "Look", type: "select", options: opts(["band", "Banner"], ["milestone", "Milestone (with flag icon)"]) },
      { key: "buttons", label: "Buttons", type: "list", itemLabel: "button", maxItems: 2, fields: buttonFields },
    ],
    defaults: { variant: "band", buttons: [] },
  },
  inquiry: {
    label: "Inquiry form",
    description: "Contact form with quick-choice options. Messages appear in the dashboard under Inquiries.",
    header: true,
    fields: [
      { key: "paths", label: "Quick choices", type: "list", itemLabel: "choice", maxItems: 4, fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "text", label: "Text", type: "text" },
        { key: "interest", label: "Pre-selects", type: "select", options: opts(["invest", "Investing"], ["info", "Investor information"], ["telecom", "Telecom / mobile money"], ["strategic", "Strategic partnership"], ["enterprise", "SomSoft project"], ["media", "Media"], ["general", "General question"]) }] },
      { key: "showContactDetails", label: "Show email and location under the choices", type: "boolean" },
      { key: "formTitle", label: "Form title", type: "text" },
      { key: "formText", label: "Form intro", type: "text" },
    ],
    defaults: { paths: [], formTitle: "Start a conversation" },
  },
  newsList: { label: "News list", description: "Latest news & updates (managed under News).", header: true, fields: [
    { key: "limit", label: "How many posts (0 = all)", type: "number" }], defaults: { limit: 0 } },
  jobsList: { label: "Open roles", description: "Job openings (managed under Careers).", header: true, fields: [
    { key: "emptyTitle", label: "Title when there are no roles", type: "text" },
    { key: "emptyText", label: "Text when there are no roles", type: "textarea" }], defaults: {} },
  team: { label: "Leadership", description: "Team members (managed under Settings → Team). Hidden when empty.", header: true, fields: [], defaults: {} },
} satisfies Record<string, SectionTypeDef>;

export type SectionType = keyof typeof SECTION_TYPES;

export const BACKGROUNDS = opts(["default", "Light"], ["soft", "Soft blue"], ["blue", "Deep blue"]);

export function newSection(type: SectionType): Section {
  const def = SECTION_TYPES[type] as SectionTypeDef;
  return { id: crypto.randomUUID(), type, background: "default", data: structuredClone(def.defaults) };
}
