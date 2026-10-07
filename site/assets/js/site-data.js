/*
 * DIGITAL DOME — EDITABLE SITE DATA
 * ---------------------------------------------------------------
 * Non-developers: this is the ONLY file you need to edit to update
 * product status, verified traction metrics, leadership and contact
 * details. Save the file and re-upload it; no rebuild is required.
 * (Running `node build.mjs` also bakes these values into the HTML
 * for search engines — recommended but optional.)
 *
 * RULES (from the Website Developer Guideline, section 10):
 *  - Only publish metrics that are real and internally verified.
 *  - Use status labels accurately: "In development", "Testing",
 *    "Beta", "Launching", "Live".
 *  - Never imply partnerships, customers or integrations that do
 *    not exist.
 *  - Empty lists are hidden automatically — nothing placeholder-
 *    looking is ever shown to visitors.
 */
window.DD_DATA = {
  updated: "October 2026",

  contact: {
    general: "info@somdigitaldome.com",     // TODO(client): confirm mailbox exists
    investors: "investors@somdigitaldome.com", // TODO(client): confirm mailbox exists
    phone: "",                              // optional, shown only if filled
    location: "Mogadishu, Somalia",          // TODO(client): confirm
    // Form endpoint (e.g. Formspree, Basin, Netlify Forms, own API).
    // Leave empty to fall back to opening the visitor's email client.
    formEndpoint: ""
  },

  social: [
    // { label: "LinkedIn", url: "https://www.linkedin.com/company/..." },
    // { label: "X", url: "https://x.com/..." }
  ],

  // Allowed: "In development" | "Testing" | "Beta" | "Launching" | "Live"
  status: {
    somspot: "In development",
    shifaa: "In development",
    fagaaro: "In development",
    somsoft: "Launching"
  },

  // VERIFIED traction metrics only. Shown as cards in the Traction section.
  // Example: { value: "120", label: "Businesses onboarded to SomSpot beta", asOf: "Sep 2026" }
  metrics: [],

  // Product milestones. state: "done" | "current" | "next"
  milestones: [
    { state: "done",    label: "Digital Dome formed as parent technology company" },
    { state: "done",    label: "Four-product portfolio defined: SomSpot, Shifaa, Fagaaro, SomSoft" },
    { state: "current", label: "Product build and internal testing across the portfolio" },
    { state: "current", label: "SomSoft by Digital Dome opens for enterprise engagements" },
    { state: "next",    label: "First consumer product public beta in Somalia" },
    { state: "next",    label: "Telecom and mobile-money integration partnerships" }
  ],

  // Leadership. Section is hidden until at least one person is added.
  // { name: "", role: "Founder & CEO", bio: "", photo: "assets/img/team/name.jpg", linkedin: "" }
  leadership: []
};
