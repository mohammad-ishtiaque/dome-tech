// Zero-dependency static build: `node build.mjs` writes HTML pages into ./site
// Copy lives in src/content.mjs; volatile data in site/assets/js/site-data.js.
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { mkdirSync } from "node:fs";
import { SITE, STATS, PRODUCTS, REVENUE_MATRIX, SEO, HOME_FAQ, PRODUCT_FAQ } from "./src/content.mjs";

const OUT = new URL("./site/", import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL("assets/js/site-data.js", OUT), "utf8"), ctx);
const DATA = ctx.window.DD_DATA;
const VERSION = Date.now().toString(36);

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const stateOf = (v) => ({ "in development": "dev", testing: "testing", beta: "beta", launching: "launching", live: "live" })[String(v).toLowerCase()] || "dev";

/* ------------------------------------------------------------------ icons */
const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  lang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16 14.5h2"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13l3 3a2 2 0 003 0l5-5a2 2 0 000-3l-2-2-3 3"/><path d="M3 10l4-4 4 1 2-2M3 10l5 5M21 8l-3-3"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 5-9 12-9 0 7-5 11-9 12z"/><circle cx="14.5" cy="9.5" r="1.5"/></svg>',
};

/* ----------------------------------------------------------- brand marks */
const domeMark = (id = "dm") => `<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f7aff"/><stop offset="1" stop-color="#22c3ee"/></linearGradient></defs>
  <rect width="48" height="48" rx="12" fill="url(#${id})"/>
  <path d="M10 33a14 14 0 0128 0" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M16.5 33a7.5 7.5 0 0115 0" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M8 37.5h32" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
  <circle cx="24" cy="12.5" r="2.4" fill="#fff"/>
</svg>`;

const GLYPH = {
  somspot: '<path d="M24 36s-8-6.4-8-12.4a8 8 0 1116 0C32 29.6 24 36 24 36z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="23.5" r="2.8" fill="#fff"/>',
  shifaa: '<path d="M24 35s-10-6-10-13a5.5 5.5 0 0110-3.2A5.5 5.5 0 0134 22c0 7-10 13-10 13z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M20 23.5h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  fagaaro: '<path d="M21 18.5v11l9-5.5z" fill="#fff"/><path d="M14.5 15.5a13 13 0 000 18M33.5 15.5a13 13 0 010 18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  somsoft: '<path d="M19 17l-7 7 7 7M29 17l7 7-7 7M26 14l-4 20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
};
const pmark = (p) => `<svg class="pmark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="${p.hex}"/>${GLYPH[p.slug]}</svg>`;
const P = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

/* --------------------------------------------------------------- layout */
function head({ title, desc, path, extra = "", noindex = false }) {
  const url = SITE.domain + path;
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"}">
<meta name="author" content="Digital Dome">
<meta name="theme-color" content="#eaf4ff">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Digital Dome">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.domain}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Digital Dome: Building Somalia’s Digital Future">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE.domain}/assets/img/og-image.png">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/styles.css?v=${VERSION}">
<script src="/assets/js/site-data.js?v=${VERSION}" defer></script>
<script src="/assets/js/main.js?v=${VERSION}" defer></script>
<!-- Analytics: add a privacy-friendly script here (e.g. Plausible). CTA events are already wired via data-track. -->
${extra}
</head>`;
}

function header(active) {
  const menu = PRODUCTS.map((p) => `<a href="/${p.slug}/">${pmark(p)}<div><strong>${p.fullName || p.name}</strong><span>${esc(p.role)}</span></div></a>`).join("");
  const mob = PRODUCTS.map((p) => `<a href="/${p.slug}/">${pmark(p)}${p.name}</a>`).join("");
  const cur = (k) => (active === k ? ' aria-current="page"' : "");
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container">
    <a class="brand" href="/" aria-label="Digital Dome home">${domeMark("dmh")}<span class="brand-name">Digital Dome<small>Technology Group</small></span></a>
    <nav class="nav" aria-label="Primary">
      <a href="/#about"${cur("about")}>About</a>
      <div class="nav-drop" data-open="false">
        <button type="button" aria-expanded="false" aria-haspopup="true">Products ${I.chev}</button>
        <div class="nav-menu">${menu}</div>
      </div>
      <a href="/#business-model">Business Model</a>
      <a href="/investors/"${cur("investors")}>Investors &amp; Partners</a>
      <a href="/#partner">Contact</a>
    </nav>
    <a class="btn btn--primary btn--sm header-cta header-cta--desk" href="/investors/#inquiry" data-track="CTA: Header Partner">Partner With Us</a>
    <a class="btn btn--primary btn--sm header-cta header-cta--mob" href="/investors/#inquiry" data-track="CTA: Header Partner (mobile)">Invest / Partner</a>
    <button class="nav-toggle" type="button" aria-controls="mobile-nav" aria-expanded="false" aria-label="Open menu">${I.menu}</button>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
  <a href="/#about">About</a>
  <p class="label">Products</p>
  ${mob}
  <p class="label">Company</p>
  <a href="/#business-model">Business Model</a>
  <a href="/investors/">Investors &amp; Partners</a>
  <a href="/#partner">Contact</a>
  <a class="btn btn--primary" href="/investors/#inquiry" data-track="CTA: Mobile Menu Partner">Partner With Digital Dome</a>
</nav>`;
}

function footer() {
  const c = DATA.contact;
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-about">
        <a class="brand" href="/" aria-label="Digital Dome home">${domeMark("dmf")}<span class="brand-name">Digital Dome<small>Technology Group</small></span></a>
        <p>Building technology platforms and software products for the Somali digital economy.</p>
      </div>
      <div>
        <h4>Portfolio</h4>
        <ul>${PRODUCTS.map((p) => `<li><a href="/${p.slug}/">${p.name}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="/#about">About</a></li>
          <li><a href="/investors/">Investors &amp; Partners</a></li>
          <li><a href="/#business-model">Business Model</a></li>
          <li><a href="/#growth">Growth Vision</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:${c.general}" data-email="general">${c.general}</a></li>
          <li><a href="mailto:${c.investors}" data-email="investors">${c.investors}</a></li>
          <li data-phone hidden></li>
          <li>${esc(c.location)}</li>
        </ul>
        <div data-social-wrap hidden><h4 style="margin-top:24px">Follow</h4><ul data-social></ul></div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>${new Date().getFullYear()}</span> Digital Dome. All rights reserved. · somdigitaldome.com</span>
      <nav aria-label="Legal"><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Use</a></nav>
    </div>
  </div>
</footer>
</body>
</html>`;
}

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const crumbsLd = (items) => ld({ "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.domain + path })) });
const faqLd = (faq) => ld({ "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const faqBlock = (faq, title) => `<section class="section" aria-labelledby="faq-title"><div class="container">
  <div class="section-head reveal"><span class="eyebrow">FAQ</span><h2 id="faq-title">${title}</h2></div>
  <div class="faq reveal">${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
</div></section>`;

const page = (o, body) => `${head(o)}\n<body>\n${header(o.active)}\n<main id="main">\n${body}\n</main>\n${footer()}`;

const sectionHead = (num, eyebrow, h2, lead, split = false) => `<div class="section-head${split ? " section-head--split" : ""} reveal">
  <div><span class="eyebrow"><span class="num">${num}</span>${eyebrow}</span><h2>${h2}</h2></div>
  ${lead ? `<p class="lead">${lead}</p>` : ""}
</div>`;

const statusBadge = (slug) => {
  const v = DATA.status[slug];
  return `<span class="status" data-status="${slug}" data-state="${stateOf(v)}">${esc(v)}</span>`;
};

/* --------------------------------------------------------- shared blocks */
const statCards = () => STATS.map((s) => {
  const [int, dec] = s.value.split(".");
  return `<article class="stat${s.feature ? " stat--feature" : ""} reveal">
    <div class="stat-value"><span data-count="${s.value}">${s.value}</span><small>${esc(s.unit.trim())}</small></div>
    ${s.meter ? `<div class="meter" role="img" aria-label="${s.meter}%"><i style="--w:${s.meter}%"></i></div>` : ""}
    <h3>${esc(s.title)}</h3>
    <p>${esc(s.text)}</p>
    <div class="source"><span class="tag${s.tag === "Insight" ? " tag--insight" : ""}">${s.tag}</span><span>Source: <a href="${s.url}" target="_blank" rel="noopener">${esc(s.source)}</a></span></div>
  </article>`;
}).join("");

const matrix = () => `<div class="matrix-wrap reveal"><table class="matrix">
  <caption class="sr-only">Revenue streams by product</caption>
  <thead><tr><th scope="col" style="text-align:left">Revenue stream</th>${PRODUCTS.map((p) => `<th scope="col">${pmark(p)}${p.name}</th>`).join("")}</tr></thead>
  <tbody>${REVENUE_MATRIX.map(([name, sub, m]) => `<tr><th scope="row">${esc(name)}<small>${esc(sub)}</small></th>${PRODUCTS.map((p) => {
    const v = m[p.slug];
    return `<td>${v === 1 ? '<span class="dot" role="img" aria-label="Core revenue stream"></span>' : v === 2 ? '<span class="dot dot--future" role="img" aria-label="Planned revenue stream"></span>' : '<span class="sr-only">Not applicable</span>'}</td>`;
  }).join("")}</tr>`).join("")}</tbody>
</table></div>
<div class="matrix-legend"><span><i class="dot"></i>Core revenue stream</span><span><i class="dot dot--future"></i>Planned, subject to scale and product-market fit</span></div>`;

function inquiryForm(id = "inquiry") {
  return `<div class="form-card" id="${id}">
  <h3>Start a conversation</h3>
  <p>Tell us who you are and what you’re interested in. We respond to every serious inquiry within two business days.</p>
  <form data-inquiry novalidate>
    <div class="form-grid">
      <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required aria-describedby="f-name-err"><span class="err" id="f-name-err" aria-live="polite"></span></div>
      <div class="field"><label for="f-org">Organization <span class="opt">(optional)</span></label><input id="f-org" name="org" autocomplete="organization"></div>
      <div class="field"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-err"><span class="err" id="f-email-err" aria-live="polite"></span></div>
      <div class="field"><label for="f-interest">I’m interested in</label>
        <select id="f-interest" name="interest" required aria-describedby="f-interest-err">
          <option value="invest">Investing in Digital Dome</option>
          <option value="info">Requesting investor information</option>
          <option value="telecom">Telecom / mobile-money partnership</option>
          <option value="strategic">Other strategic partnership</option>
          <option value="enterprise">SomSoft: software for my organization</option>
          <option value="media">Media or ecosystem inquiry</option>
        </select><span class="err" id="f-interest-err" aria-live="polite"></span></div>
      <div class="field field--full"><label for="f-msg">Message <span class="opt">(optional)</span></label><textarea id="f-msg" name="message" placeholder="A few lines about you, your organization and what you’d like to discuss."></textarea></div>
      <div class="hp" aria-hidden="true"><label for="f-web">Website</label><input id="f-web" name="website" tabindex="-1" autocomplete="off"></div>
      <label class="consent"><input type="checkbox" name="consent" required id="f-consent" aria-describedby="f-consent-err"><span>I agree that Digital Dome may use these details to respond to my inquiry, as described in the <a href="/privacy/">Privacy Policy</a>. <span class="err" id="f-consent-err" aria-live="polite"></span></span></label>
      <div class="form-actions"><button class="btn btn--dark" type="submit" data-track="Form: Inquiry Submit">Send inquiry ${I.arrow}</button><small>No sensitive financial information is shared publicly.</small></div>
      <div class="form-status" role="status" tabindex="-1"></div>
    </div>
  </form>
</div>`;
}

const paths = () => `<div class="paths">
  <button class="path" type="button" data-interest="invest" data-track="CTA: Invest in Digital Dome"><span class="icon">${I.trend}</span><span><strong>Invest in Digital Dome</strong><span>Angel, venture, strategic and diaspora investors</span></span>${I.arrow}</button>
  <button class="path" type="button" data-interest="telecom" data-track="CTA: Strategic Partnerships"><span class="icon">${I.hand}</span><span><strong>Strategic Partnerships</strong><span>Telecom, mobile-money, fintech and enterprise partners</span></span>${I.arrow}</button>
  <button class="path" type="button" data-interest="info" data-track="CTA: Request Investor Information"><span class="icon">${I.doc}</span><span><strong>Request Investor Information</strong><span>Investor deck and data-room access under NDA</span></span>${I.arrow}</button>
</div>`;

function mockup(p) {
  const style = `style="--accent:${p.hex}"`;
  if (p.mock === "dashboard") {
    return `<figure class="device-stage" ${style}><div class="browser" aria-hidden="true">
      <div class="browser-bar"><i></i><i></i><i></i><span>SomSoft · Business dashboard</span></div>
      <div class="dash"><div class="dash-side"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="dash-main"><div class="dash-kpis"><div><i></i><b>Orders</b></div><div><i></i><b>Stock</b></div><div><i></i><b>Payments</b></div></div>
      <div class="dash-chart">${[40, 62, 48, 75, 58, 86, 70, 94].map((h) => `<span style="height:${h}%"></span>`).join("")}</div>
      <div class="dash-rows"><span></span><span style="width:80%"></span><span style="width:65%"></span></div></div></div>
    </div><figcaption>Illustrative interface concept</figcaption></figure>`;
  }
  const bodies = {
    list: `<div class="chiprow"><span>Food</span><span>Clinics</span><span>Hotels</span><span>Shops</span></div>
      <div class="ui-sec">Popular nearby</div>
      ${[["R", "Restaurant", "Hodan · Open now", "★ 4.8"], ["P", "Pharmacy", "Wadajir · 0.8 km", "Open"], ["H", "Hotel", "Lido area · 1.2 km", "★ 4.6"], ["E", "Electronics", "Bakara · 2.0 km", "Mobile money"]].map(([a, b, c, d]) => `<div class="ui-card"><span class="ui-thumb">${a}</span><span><b>${b}</b><i>${c}</i></span><span class="pill">${d}</span></div>`).join("")}`,
    profiles: `<div class="ui-sec">Available practitioners</div>
      ${[["A", "Practitioner profile", "Somali · Arabic · Remote", "Vetted"], ["M", "Practitioner profile", "Somali · In person", "Vetted"], ["Y", "Practitioner profile", "Somali · English · Remote", "Vetted"]].map(([a, b, c, d]) => `<div class="ui-card"><span class="ui-thumb">${a}</span><span><b>${b}</b><i>${c}</i></span><span class="pill">${d}</span></div>`).join("")}
      <div class="ui-card"><span><b>Private session</b><i>Choose a time · Pay with mobile money</i></span></div>
      <span class="ui-btn">Request booking</span>`,
    event: `<div class="ui-hero"><span class="live">LIVE</span><b>Community Q&amp;A Session</b><span>Hosted live · Interactive</span></div>
      <div class="ui-sec">Upcoming events</div>
      ${[["T", "Youth & Tech Talk", "Sat · 8:00 PM EAT", "Paid"], ["B", "Business Forum", "Sun · 6:00 PM EAT", "Free"]].map(([a, b, c, d]) => `<div class="ui-card"><span class="ui-thumb">${a}</span><span><b>${b}</b><i>${c}</i></span><span class="pill">${d}</span></div>`).join("")}
      <span class="ui-btn">Get ticket · Mobile money</span>`,
  };
  const heads = { list: ["SomSpot", "Discover what’s around you", true], profiles: ["Shifaa", "Trusted, private, respectful", false], event: ["Fagaaro", "Live events for every Somali audience", false] };
  const [t, s, search] = heads[p.mock];
  return `<figure class="device-stage" ${style}><div class="phone" aria-hidden="true"><div class="screen">
    <div class="screen-head"><div class="t">${t}</div><div class="s">${s}</div>${search ? '<div class="screen-search">Search restaurants, clinics…</div>' : ""}</div>
    <div class="screen-body">${bodies[p.mock]}</div>
    <div class="ui-tabbar"><span></span><span></span><span></span><span></span></div>
  </div></div><figcaption>Illustrative interface concept</figcaption></figure>`;
}

/* ================================================================ INDEX */
function indexPage() {
  const nodes = [
    ["somspot", 22, 26], ["shifaa", 78, 26], ["fagaaro", 16, 58], ["somsoft", 84, 58],
  ];
  const rail = [["about", "Who we are"], ["opportunity", "Opportunity"], ["portfolio", "Portfolio"], ["ecosystem", "Ecosystem"], ["traction", "Traction"], ["business-model", "Business model"], ["why", "Why Digital Dome"], ["growth", "Growth vision"], ["partner", "Invest & partner"]];

  const siteLd = { "@context": "https://schema.org", "@type": "WebSite", name: "Digital Dome", url: SITE.domain + "/", inLanguage: "en" };
  const orgLd = {
    "@context": "https://schema.org", "@type": "Organization", name: "Digital Dome", url: SITE.domain, alternateName: "Digital Dome Technology Group",
    areaServed: ["Somalia", "Somali diaspora"], address: { "@type": "PostalAddress", addressCountry: "SO", addressLocality: DATA.contact.location.split(",")[0] },
    sameAs: DATA.social.map((x) => x.url),
    logo: SITE.domain + "/assets/img/favicon.svg", email: DATA.contact.general,
    description: "Technology company building a portfolio of digital products for Somalia and the wider Somali market.",
    brand: PRODUCTS.map((p) => ({ "@type": "Brand", name: p.fullName || p.name, description: p.role })),
  };

  const body = `
<section class="hero" aria-labelledby="hero-title"><span class="blob blob--1" aria-hidden="true"></span><span class="blob blob--2" aria-hidden="true"></span><span class="blob blob--3" aria-hidden="true"></span>
  <div class="container">
    <div class="reveal is-in">
      <span class="kicker"><b>Somalia</b>A technology company for the Somali digital economy</span>
      <h1 id="hero-title">Building Somalia’s <span class="accent">Digital Future</span></h1>
      <p class="sub">Digital Dome is building a portfolio of technology platforms and software products designed for Somalia’s rapidly evolving digital economy.</p>
      <ul class="support" aria-label="At a glance"><li>Four products</li><li>One ecosystem</li><li>One growing market</li></ul>
      <div class="hero-ctas">
        <a class="btn btn--primary" href="#portfolio" data-track="CTA: Hero Explore Portfolio">Explore Our Portfolio ${I.arrow}</a>
        <a class="btn btn--ghost" href="/investors/#inquiry" data-track="CTA: Hero Partner">Partner With Digital Dome</a>
      </div>
    </div>
    <div class="dome-visual" aria-label="Digital Dome ecosystem: SomSpot, Shifaa, Fagaaro and SomSoft">
      <svg viewBox="0 0 560 520" aria-hidden="true">
        <defs><linearGradient id="domeStroke" x1="0" x2="1"><stop offset="0" stop-color="#1f7aff" stop-opacity=".1"/><stop offset=".5" stop-color="#1f7aff"/><stop offset="1" stop-color="#22c3ee" stop-opacity=".1"/></linearGradient>
        <radialGradient id="glow"><stop offset="0" stop-color="#5aa9ff" stop-opacity=".45"/><stop offset="1" stop-color="#5aa9ff" stop-opacity="0"/></radialGradient></defs>
        <circle cx="280" cy="340" r="150" fill="url(#glow)" class="pulse"/>
        <path class="orbit" d="M30 400a250 250 0 01500 0"/>
        <path class="orbit orbit--accent" d="M80 400a200 200 0 01400 0"/>
        <path class="orbit" d="M130 400a150 150 0 01300 0"/>
        <path class="orbit" d="M180 400a100 100 0 01200 0"/>
        <path d="M10 400h540" stroke="rgba(31,122,255,.22)"/>
        ${[[123, 135], [437, 135], [90, 302], [470, 302]].map(([x, y]) => `<path d="M280 340L${x} ${y}" stroke="rgba(31,122,255,.35)" stroke-dasharray="3 6"/>`).join("")}
      </svg>
      ${nodes.map(([s, x, y]) => `<a class="dome-node" href="/${s}/" style="left:${x}%;top:${y}%">${pmark(P[s])}<span><strong>${P[s].name}</strong><span>${esc(P[s].channel)}</span></span></a>`).join("")}
      <div class="hero-chip hero-chip--a"><b>73%</b><span>of adults use<br>mobile money</span></div>
      <div class="hero-chip hero-chip--b"><b>15.6</b><span>median age:<br>a mobile-first generation</span></div>
      <div class="dome-core">${domeMark("dmc")}<strong>DIGITAL DOME</strong><span>Parent company</span></div>
    </div>
  </div>
  <div class="hero-strip">
    <div class="container">
      <p>The Digital Dome portfolio</p>
      <ul>${PRODUCTS.map((p) => `<li><a href="/${p.slug}/">${pmark(p)}${p.fullName || p.name}</a></li>`).join("")}</ul>
    </div>
  </div>
</section>

<ol class="pitch-rail" aria-label="Page sections">${rail.map(([id, l]) => `<li><a href="#${id}"><span>${l}</span></a></li>`).join("")}</ol>

<section class="section" id="about" aria-labelledby="about-title">
  <div class="container">
    ${sectionHead("01", "Who we are", '<span id="about-title">A technology company, not a single app.</span>', "Digital Dome is building technology platforms and software products designed around the realities, behavior and opportunities of the Somali digital economy.", true)}
    <div class="thesis">
      <article class="reveal"><h3>Who we are</h3><p>The parent technology company behind four focused products, with one brand, one leadership team and shared infrastructure.</p></article>
      <article class="reveal"><h3>Why it matters</h3><p>Somalia is young, mobile-first and already runs on mobile money, yet most local digital services have not been built.</p></article>
      <article class="reveal"><h3>What we’ve built</h3><p>A portfolio covering business discovery, trusted services, interactive events and enterprise software.</p></article>
      <article class="reveal"><h3>How we create value</h3><p>Diversified revenue across advertising, commissions, subscriptions, SaaS and enterprise contracts, built on a shared platform.</p></article>
    </div>
  </div>
</section>

<section class="section section--soft" id="opportunity" aria-labelledby="opp-title">
  <div class="container">
    ${sectionHead("02", "The opportunity", '<span id="opp-title">A young, mobile-first market that already pays digitally.</span>', "The mobile phones and mobile-money accounts are already in people’s hands. The local digital services built on top of them are not. Every figure below is sourced and dated.", true)}
    <div class="stats">${statCards()}</div>
    <div class="data-legend"><span><span class="tag">Fact</span> Published third-party data</span><span><span class="tag tag--insight">Insight</span> Derived from the cited source</span><span>We do not publish projections as facts.</span></div>
  </div>
</section>

<section class="section" id="portfolio" aria-labelledby="port-title">
  <div class="container">
    ${sectionHead("03", "Our portfolio", '<span id="port-title">Four products. Four distinct market needs.</span>', "From business discovery and trusted digital services to interactive events and enterprise software, Digital Dome builds technology around how Somali consumers, businesses and institutions connect and grow.", true)}
    <div class="portfolio">
      ${PRODUCTS.map((p) => `<a class="pcard reveal" href="/${p.slug}/" style="--accent:${p.hex}" data-track="Portfolio: ${p.name}">
        <div class="pcard-top">${pmark(p)}<div><h3>${p.fullName || p.name}</h3><span class="role">${esc(p.role)}</span></div>${statusBadge(p.slug)}</div>
        <p class="purpose">${esc(p.purpose)}</p>
        <dl><div><dt>Target market</dt><dd>${esc(p.market)}</dd></div><div><dt>Monetization</dt><dd>${esc(p.monetization)}</dd></div></dl>
        <span class="more">Explore ${p.name} ${I.arrow}</span>
      </a>`).join("")}
    </div>
  </div>
</section>

<section class="section section--dark" id="ecosystem" aria-labelledby="eco-title">
  <div class="container">
    ${sectionHead("04", "One ecosystem", '<span id="eco-title">One parent company. Every side of the market.</span>', "Each product serves a different audience through a different digital channel, and all of them share Digital Dome’s brand, technology, payment integrations and distribution.", true)}
    <div class="eco reveal">
      <div class="eco-parent">${domeMark("dme")}<div><strong>DIGITAL DOME</strong><span>Parent technology company · shared platform, payments &amp; distribution</span></div></div>
      <div class="eco-lines" aria-hidden="true"><svg viewBox="0 0 1000 64" preserveAspectRatio="none"><path d="M500 0V24M500 24H125V64M500 24H375V64M500 24H625V64M500 24H875V64"/></svg></div>
      <div class="eco-brands">
        ${PRODUCTS.map((p) => `<a class="eco-brand" href="/${p.slug}/" style="--accent:${p.hex}">${pmark(p)}<h3>${p.fullName || p.name}</h3><p>${esc(p.role)}</p><span class="chan">${esc(p.channel)}</span></a>`).join("")}
      </div>
      <div class="eco-audiences">
        <h3>Who we serve</h3>
        <ul class="chips"><li><i>●</i>Consumers</li><li><i>●</i>Local businesses</li><li><i>●</i>Service providers</li><li><i>●</i>Public figures</li><li><i>●</i>Institutions &amp; NGOs</li><li><i>●</i>Enterprise &amp; government</li><li><i>●</i>The Somali diaspora</li></ul>
      </div>
    </div>
  </div>
</section>

<section class="section" id="traction" aria-labelledby="tr-title">
  <div class="container">
    ${sectionHead("05", "Traction", '<span id="tr-title">Execution, reported honestly.</span>', `We publish only verified progress. Metrics appear here as they are confirmed internally. Last updated <span data-updated>${esc(DATA.updated)}</span>.`, true)}
    <div class="traction">
      <div class="reveal">
        <h3>Milestones</h3>
        <ol class="timeline" data-milestones>${DATA.milestones.map((m) => `<li data-state="${m.state}"><span class="t-state">${{ done: "Completed", current: "In progress", next: "Next" }[m.state]}</span><span class="t-label">${esc(m.label)}</span></li>`).join("")}</ol>
      </div>
      <div class="reveal">
        <div class="portfolio-facts"><div><b>4</b><span>Products in the portfolio</span></div><div><b>2</b><span>Markets served: consumer and enterprise</span></div><div><b>6+</b><span>Revenue streams across the portfolio</span></div></div>
        <div class="metric-grid" data-metrics ${DATA.metrics.length ? "" : "hidden"}>${DATA.metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span>${m.asOf ? `<small>Verified · as of ${esc(m.asOf)}</small>` : ""}</div>`).join("")}</div>
        <div class="verify-note" data-metrics-empty ${DATA.metrics.length ? "hidden" : ""}>
          <div class="icon">${I.shield}</div>
          <h3>Verified metrics only</h3>
          <p>User, partner and revenue figures will be published here once each product reaches public beta and the numbers have been verified internally. Qualified investors can request the latest operating update under NDA.</p>
          <a class="btn btn--outline btn--sm" href="/investors/?interest=info#inquiry" data-track="CTA: Traction Request Update">Request latest update ${I.arrow}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--soft" id="business-model" aria-labelledby="bm-title">
  <div class="container">
    ${sectionHead("06", "Business model", '<span id="bm-title">Diversified revenue across the portfolio.</span>', "Consumer platforms build audience and transaction volume. SomSoft brings in enterprise revenue early. Together they reduce dependence on any single stream.", true)}
    ${matrix()}
  </div>
</section>

<section class="section section--dark" id="why" aria-labelledby="why-title">
  <div class="container">
    ${sectionHead("07", "Why Digital Dome", '<span id="why-title">Built here, for here, by people who understand it.</span>', "Global platforms are not built for this market, and local alternatives are fragmented. That gap gives us room to compete.", true)}
    <div class="adv-grid reveal">
      <div class="adv"><div class="icon">${I.map}</div><h3>Local market understanding</h3><p>Products designed around how Somali people actually search, pay, gather and do business.</p></div>
      <div class="adv"><div class="icon">${I.lang}</div><h3>Somali-language &amp; cultural relevance</h3><p>Native-language experiences and culturally grounded products that global platforms do not prioritize.</p></div>
      <div class="adv"><div class="icon">${I.wallet}</div><h3>Mobile-money native</h3><p>Built from day one for the payment rails most Somali adults already use every day.</p></div>
      <div class="adv"><div class="icon">${I.layers}</div><h3>Portfolio leverage</h3><p>Shared technology, brand and payment integrations lower the cost of each new product.</p></div>
      <div class="adv"><div class="icon">${I.share}</div><h3>First-party distribution</h3><p>Every product can cross-promote the others. Businesses on SomSpot are natural SomSoft clients.</p></div>
      <div class="adv"><div class="icon">${I.building}</div><h3>Consumer + enterprise</h3><p>Serving both markets balances long-term platform value with nearer-term contract revenue.</p></div>
    </div>
  </div>
</section>

<section class="section" id="growth" aria-labelledby="gr-title">
  <div class="container">
    ${sectionHead("08", "Growth vision", '<span id="gr-title">Somalia first. Then scale, based on evidence.</span>', "A roadmap, not a promise. Each step depends on reaching product-market fit in the step before it.", true)}
    <div class="roadmap">
      <article class="phase phase--now reveal"><div class="when"><b>Now</b><i>Focus</i></div><h3>Win Somalia</h3><p>Launch and prove the portfolio in the home market.</p><ul><li>Bring each product to public beta and launch</li><li>Win SomSoft enterprise clients</li><li>Establish telecom and mobile-money partnerships</li></ul></article>
      <article class="phase reveal"><div class="when"><b>Next</b><i>Evaluate</i></div><h3>Reach the diaspora</h3><p>Extend to Somali communities worldwide where the products already fit.</p><ul><li>Fagaaro events for global audiences</li><li>Shifaa remote sessions across borders</li><li>Diaspora-to-home commerce and services</li></ul></article>
      <article class="phase phase--later reveal"><div class="when"><b>Later</b><i>Evidence-based</i></div><h3>Adjacent markets</h3><p>Consider other relevant markets only where product-market fit is clear.</p><ul><li>Replicate proven playbooks</li><li>Package SomSoft SaaS for similar economies</li><li>Expand only with strong unit economics</li></ul></article>
    </div>
  </div>
</section>

${faqBlock(HOME_FAQ, "Digital Dome at a glance")}

<section class="section invest" id="partner" aria-labelledby="inv-title">
  <div class="container invest-grid">
    <div class="reveal">
      <span class="eyebrow"><span class="num">09</span>Investment &amp; partnerships</span>
      <h2 id="inv-title">Help build Somalia’s digital future.</h2>
      <p class="lead">Digital Dome is building for long-term scale. We welcome conversations with investors, telecom operators, financial-technology partners, enterprises and strategic organizations that share our vision for Somalia’s digital future.</p>
      ${paths()}
    </div>
    <div class="reveal">${inquiryForm()}</div>
  </div>
</section>`;

  return page({
    title: SEO.home.title,
    desc: SEO.home.desc,
    path: "/",
    extra: ld(orgLd) + ld(siteLd) + faqLd(HOME_FAQ),
  }, body);
}

/* ======================================================= PRODUCT PAGES */
function productPage(p) {
  const body = `
<section class="page-hero" style="--accent:${p.hex}" aria-labelledby="p-title"><span class="blob blob--1" aria-hidden="true"></span><span class="blob blob--2" aria-hidden="true"></span><span class="blob blob--3" aria-hidden="true"></span>
  <div class="container">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Digital Dome</a><span aria-hidden="true">/</span><a href="/#portfolio">Portfolio</a><span aria-hidden="true">/</span><span aria-current="page" class="crumb-current">${p.name}</span></nav>
      <div class="ptitle">${pmark(p)}<span class="label">A Digital Dome product<b>${esc(p.role)}</b></span></div>
      <h1 id="p-title">${p.fullName || p.name}</h1>
      <p class="sub">${esc(p.promise)}</p>
      <div class="hero-ctas" style="margin-top:32px">
        <a class="btn btn--primary" href="/investors/?interest=${p.slug === "somsoft" ? "enterprise" : "strategic"}#inquiry" data-track="CTA: ${p.name} Hero">${p.slug === "somsoft" ? "Discuss a project" : "Partner on " + p.name} ${I.arrow}</a>
        <a class="btn btn--ghost" href="#how">How it works</a>
      </div>
    </div>
    ${mockup(p)}
  </div>
</section>

<div class="container" style="--accent:${p.hex}">
  <dl class="fact-row">
    <div><dt>Status</dt><dd>${statusBadge(p.slug)}</dd></div>
    <div><dt>Users</dt><dd>${esc(p.market)}</dd></div>
    <div><dt>Revenue model</dt><dd>${esc(p.monetization)}</dd></div>
    <div><dt>Channel</dt><dd>${esc(p.channel)}</dd></div>
  </dl>
</div>

<section class="section" style="--accent:${p.hex}" aria-labelledby="ps-title">
  <div class="container">
    ${sectionHead("01", "Problem &amp; solution", `<span id="ps-title">Why ${p.name} needs to exist.</span>`, "")}
    <div class="two-col">
      <div class="panel panel--problem reveal"><h3><span class="k" style="color:#9a5b00">The problem</span></h3><p>${esc(p.problem)}</p></div>
      <div class="panel panel--solution reveal"><h3><span class="k">Our solution</span></h3><p>${esc(p.solution)}</p></div>
    </div>
  </div>
</section>

<section class="section section--soft" style="--accent:${p.hex}" aria-labelledby="u-title">
  <div class="container">
    ${sectionHead("02", "Who it serves", `<span id="u-title">Users and customers</span>`, "")}
    <div class="users">${p.users.map(([h, t]) => `<div class="user reveal"><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="section" id="how" style="--accent:${p.hex}" aria-labelledby="h-title">
  <div class="container">
    ${sectionHead("03", "How it works", `<span id="h-title">Simple for users. Valuable for the market.</span>`, "")}
    <ol class="steps">${p.steps.map(([h, t]) => `<li class="reveal"><h3>${esc(h)}</h3><p>${esc(t)}</p></li>`).join("")}</ol>
    ${p.services ? `<div class="mt-48"><h3>Services today</h3><div class="services" style="margin-top:20px">${p.services.map(([h, t]) => `<div class="service reveal"><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
      <div class="panel saas-panel mt-48 reveal"><h3>From services to scalable SaaS</h3><p class="muted" style="margin:0">SomSoft is positioned as a scalable technology business, not a freelance development shop. Repeated client needs become subscription products for priority sectors:</p><ul class="sectors">${p.sectors.map((s) => `<li>${s}</li>`).join("")}</ul></div></div>` : ""}
  </div>
</section>

<section class="section section--soft" style="--accent:${p.hex}" aria-labelledby="r-title">
  <div class="container">
    ${sectionHead("04", "Revenue model &amp; market", `<span id="r-title">How ${p.name} makes money</span>`, esc(p.opportunity), true)}
    <div class="revenue">${p.revenue.map(([k, h, t]) => `<div class="rev reveal"><span class="tag${k === "Future" ? " tag--insight" : ""}">${k === "Future" ? "Planned" : "Core"}</span><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="section" style="--accent:${p.hex}" aria-labelledby="d-title">
  <div class="container">
    ${sectionHead("05", "Key differentiators", `<span id="d-title">What sets ${p.name} apart</span>`, "")}
    <ul class="check two-col reveal" style="gap:20px 56px">${p.diff.map(([h, t]) => `<li><strong>${esc(h)}.</strong> ${esc(t)}</li>`).join("")}</ul>
    <div class="next-ms mt-48 reveal">
      <div class="icon">${I.flag}</div>
      <div><h3>Next milestone: ${esc(p.next[0])}</h3><p>${esc(p.next[1])}</p></div>
      <a class="btn btn--primary btn--sm" href="/investors/?interest=info#inquiry" data-track="CTA: ${p.name} Investor Info">Investor information</a>
    </div>
  </div>
</section>

${faqBlock(PRODUCT_FAQ[p.slug], `${p.name}: common questions`)}

<section class="section section--soft" aria-label="Explore the portfolio">
  <div class="container">
    <h2 style="font-size:1.4rem;margin-bottom:24px">Explore the Digital Dome portfolio</h2>
    <nav class="pnav">${PRODUCTS.map((q) => `<a href="/${q.slug}/" style="--accent:${q.hex}"${q === p ? ' aria-current="page"' : ""}>${pmark(q)}<div>${q.name}<span>${esc(q.role)}</span></div></a>`).join("")}</nav>
  </div>
</section>`;

  return page({
    title: SEO[p.slug].title,
    desc: SEO[p.slug].desc,
    extra: crumbsLd([["Home", "/"], ["Portfolio", "/#portfolio"], [p.fullName || p.name, `/${p.slug}/`]]) + faqLd(PRODUCT_FAQ[p.slug]) + ld({ "@context": "https://schema.org", "@type": "Service", name: p.fullName || p.name, serviceType: p.role, description: p.promise, areaServed: "Somalia", provider: { "@type": "Organization", name: "Digital Dome", url: SITE.domain } }),
    path: `/${p.slug}/`,
    active: "products",
  }, body);
}

/* ========================================================= INVESTORS */
function investorsPage() {
  const body = `
<section class="page-hero" aria-labelledby="ir-title"><span class="blob blob--1" aria-hidden="true"></span><span class="blob blob--2" aria-hidden="true"></span><span class="blob blob--3" aria-hidden="true"></span>
  <div class="container">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Digital Dome</a><span aria-hidden="true">/</span><span aria-current="page" class="crumb-current">Investors &amp; Partners</span></nav>
      <span class="eyebrow">Investor relations</span>
      <h1 id="ir-title">A portfolio approach to the Somali digital economy.</h1>
      <p class="sub">Four products, shared infrastructure and diversified revenue, built for a young, mobile-first market that already transacts digitally.</p>
      <div class="hero-ctas" style="margin-top:32px">
        <a class="btn btn--primary" href="#inquiry" data-track="CTA: IR Hero Request Info">Request Investor Information ${I.arrow}</a>
        <a class="btn btn--ghost" href="#thesis">Read the thesis</a>
      </div>
    </div>
    <div class="dome-visual" style="max-width:420px" aria-hidden="true">
      <svg viewBox="0 0 560 520"><defs><linearGradient id="domeStroke" x1="0" x2="1"><stop offset="0" stop-color="#1f7aff" stop-opacity=".1"/><stop offset=".5" stop-color="#1f7aff"/><stop offset="1" stop-color="#22c3ee" stop-opacity=".1"/></linearGradient></defs>
      <path class="orbit" d="M30 400a250 250 0 01500 0"/><path class="orbit orbit--accent" d="M80 400a200 200 0 01400 0"/><path class="orbit" d="M130 400a150 150 0 01300 0"/><path d="M10 400h540" stroke="rgba(31,122,255,.22)"/></svg>
      <div class="dome-core">${domeMark("dmi")}<strong>DIGITAL DOME</strong><span>Investor overview</span></div>
    </div>
  </div>
</section>

<div class="container">
  <dl class="fact-row">
    <div><dt>Company</dt><dd>Digital Dome, parent technology company</dd></div>
    <div><dt>Home market</dt><dd>Somalia, then the Somali diaspora</dd></div>
    <div><dt>Portfolio</dt><dd>SomSpot · Shifaa · Fagaaro · SomSoft</dd></div>
    <div><dt>Stage</dt><dd>Early stage, building &amp; launching</dd></div>
  </dl>
</div>

<section class="section" id="thesis" aria-labelledby="th-title">
  <div class="container">
    ${sectionHead("01", "Investment thesis", '<span id="th-title">Why Digital Dome, why Somalia, why now.</span>', "Four reasons we believe a focused local technology company can build durable value in this market.", true)}
    <div class="thesis">
      <article class="reveal"><h3>A young market coming online</h3><p>The median age is 15.6 (UN WPP 2024), and only 27.6% of people are online (DataReportal 2026). Most digital adoption is still ahead.</p></article>
      <article class="reveal"><h3>The payment rails already exist</h3><p>About 73% of adults use mobile money (World Bank). Our products can charge from day one using methods people already trust.</p></article>
      <article class="reveal"><h3>Underserved by global platforms</h3><p>Global products are not built for Somali language, geography, culture or payments. That leaves room for local platforms to lead.</p></article>
      <article class="reveal"><h3>Portfolio economics</h3><p>Shared technology, brand and distribution lower the cost of each product. SomSoft enterprise revenue helps fund platform growth and reduces risk.</p></article>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="mk-title">
  <div class="container">
    ${sectionHead("02", "Market evidence", '<span id="mk-title">Sourced, dated, verifiable.</span>', "We separate published facts from our own analysis. Projections are never presented as facts.", true)}
    <div class="stats">${statCards()}</div>
  </div>
</section>

<section class="section" aria-labelledby="rm-title">
  <div class="container">
    ${sectionHead("03", "Revenue models by product", '<span id="rm-title">Multiple ways to earn, across the portfolio.</span>', "", false)}
    ${matrix()}
  </div>
</section>

<section class="section section--dark" aria-labelledby="gtm-title">
  <div class="container">
    ${sectionHead("04", "Go-to-market", '<span id="gtm-title">Distribution that compounds.</span>', "Each channel strengthens the others, and every product benefits from the portfolio’s reach.", true)}
    <div class="gtm reveal">
      <div><h3>Partner distribution</h3><p>Telecom and mobile-money partnerships for payments, bundling and reach at national scale.</p></div>
      <div><h3>Community-led growth</h3><p>Public figures on Fagaaro and practitioners on Shifaa bring their own audiences with them.</p></div>
      <div><h3>Direct SME &amp; enterprise sales</h3><p>SomSoft sells directly to organizations. SomSpot businesses are a warm pipeline.</p></div>
      <div><h3>Cross-portfolio funnel</h3><p>Users and businesses move between products under one trusted parent brand.</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="cl-title">
  <div class="container">
    ${sectionHead("05", "Competitive landscape", '<span id="cl-title">Where we fit.</span>', "Today’s alternatives are global platforms that were not built for this market, or informal, offline channels.", true)}
    <div class="compare-wrap reveal"><table class="compare">
      <caption class="sr-only">Competitive landscape comparison</caption>
      <thead><tr><th scope="col">Need</th><th scope="col">Global platforms</th><th scope="col">Informal / offline</th><th scope="col" class="us">Digital Dome</th></tr></thead>
      <tbody>
        <tr><th scope="row">Local discovery</th><td>Thin, often outdated Somali business data; address-based search</td><td>Word of mouth, scattered social posts</td><td class="us">SomSpot: structured, landmark-aware, Somali-first</td></tr>
        <tr><th scope="row">Trusted services</th><td>Not addressed</td><td>Referrals with no transparency or privacy</td><td class="us">Shifaa: vetted profiles, private booking, mobile-money payment</td></tr>
        <tr><th scope="row">Digital events</th><td>Generic streaming; hard to charge with local payment methods</td><td>Physical gatherings, limited reach</td><td class="us">Fagaaro: mobile-money ticketing, diaspora-ready</td></tr>
        <tr><th scope="row">Business software</th><td>Expensive, remote, not localized</td><td>One-off freelance builds, no support</td><td class="us">SomSoft: local delivery, long-term support, sector SaaS</td></tr>
      </tbody>
    </table></div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="road-title">
  <div class="container">
    ${sectionHead("06", "12–24 month roadmap", '<span id="road-title">What we’re focused on next.</span>', "Indicative and subject to funding, partnerships and product-market-fit evidence.", true)}
    <div class="roadmap">
      <article class="phase phase--now reveal"><div class="when"><b>0–6 months</b><i>Build</i></div><h3>Launch-ready portfolio</h3><ul><li>Complete core builds and internal testing</li><li>SomSoft enterprise engagements</li><li>Onboard founding businesses, practitioners and hosts</li></ul></article>
      <article class="phase reveal"><div class="when"><b>6–12 months</b><i>Launch</i></div><h3>Public betas in Somalia</h3><ul><li>Public beta of consumer products</li><li>Mobile-money payment integrations live</li><li>First verified traction metrics published</li></ul></article>
      <article class="phase phase--later reveal"><div class="when"><b>12–24 months</b><i>Scale</i></div><h3>Monetize &amp; extend</h3><ul><li>Turn on core revenue streams per product</li><li>First sector SaaS product from SomSoft</li><li>Evaluate diaspora expansion</li></ul></article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="ps2-title">
  <div class="container two-col">
    <div class="reveal">
      <span class="eyebrow"><span class="num">07</span>Partnership strategy</span>
      <h2 id="ps2-title">Built to partner with telecom and mobile-money leaders.</h2>
      <p class="muted">Telecom operators and mobile-money providers are natural partners. They bring reach and payment infrastructure, and we bring products that create new digital transactions and engagement on their networks.</p>
      <a class="btn btn--dark" href="?interest=telecom#inquiry" data-track="CTA: IR Telecom Partnership">Discuss a partnership ${I.arrow}</a>
    </div>
    <ul class="check reveal">
      <li><strong>Integration.</strong> Mobile-money payments embedded across products.</li>
      <li><strong>Distribution.</strong> Bundles, SMS and in-app promotion to reach subscribers at scale.</li>
      <li><strong>Commercial.</strong> Revenue-sharing and co-marketing on new digital services.</li>
      <li><strong>Investment.</strong> Strategic corporate investment aligned with digital-services growth.</li>
      <li><strong>Enterprise.</strong> SomSoft as a delivery partner for digital-transformation projects.</li>
    </ul>
  </div>
</section>

<section class="section section--soft" data-leadership ${DATA.leadership.length ? "" : "hidden"} aria-labelledby="ld-title">
  <div class="container">
    ${sectionHead("08", "Leadership", '<span id="ld-title">The team building Digital Dome.</span>', "")}
    <div class="team" data-leadership-grid></div>
  </div>
</section>

<section class="section" aria-labelledby="dr-title">
  <div class="container">
    ${sectionHead("09", "Investor materials", '<span id="dr-title">How to access the investor deck and data room.</span>', "Sensitive financials and forecasts are never published on this site. Qualified parties get access through a simple, confidential process.", true)}
    <ol class="steps">
      <li class="reveal"><h3>Submit an inquiry</h3><p>Use the form below with your name, organization and interest.</p></li>
      <li class="reveal"><h3>Introductory call</h3><p>A short conversation with leadership to understand fit.</p></li>
      <li class="reveal"><h3>NDA</h3><p>A mutual confidentiality agreement protects both parties.</p></li>
      <li class="reveal"><h3>Deck &amp; data room</h3><p>Access to the investor deck, financial model and diligence materials.</p></li>
    </ol>
  </div>
</section>

<section class="section invest" id="partner" aria-labelledby="inv-title">
  <div class="container invest-grid">
    <div class="reveal">
      <span class="eyebrow"><span class="num">10</span>Get in touch</span>
      <h2 id="inv-title">Let’s talk.</h2>
      <p class="lead">Digital Dome is building for long-term scale. We welcome conversations with investors, telecom operators, financial-technology partners, enterprises and strategic organizations that share our vision for Somalia’s digital future.</p>
      ${paths()}
      <p style="margin-top:28px">Prefer email? <a href="mailto:${DATA.contact.investors}" data-email="investors" style="color:#fff;text-decoration:underline">${DATA.contact.investors}</a></p>
    </div>
    <div class="reveal">${inquiryForm()}</div>
  </div>
</section>

<div class="container"><p class="disclaimer">Forward-looking statements: this page contains statements about plans, roadmaps and market opportunities that reflect Digital Dome’s current expectations. They are not guarantees of future performance and involve risks and uncertainties. Nothing on this website is an offer to sell or a solicitation to buy any security. Market statistics are attributed to their original publishers and dates.</p><div style="height:64px"></div></div>`;

  return page({
    title: SEO.investors.title,
    desc: SEO.investors.desc,
    extra: crumbsLd([["Home", "/"], ["Investors & Partners", "/investors/"]]),
    path: "/investors/",
    active: "investors",
  }, body);
}

/* =========================================================== LEGAL */
function legalPage(kind) {
  const isP = kind === "privacy";
  const title = isP ? "Privacy Policy" : "Terms of Use";
  const sections = isP ? [
    ["Information we collect", "When you contact us through this website, we collect the details you provide: your name, organization, email address, area of interest and message. We use privacy-conscious analytics that do not use advertising cookies, so we can understand aggregate site usage."],
    ["How we use it", "We use your information only to respond to your inquiry, manage the resulting business relationship and improve this website. We do not sell personal information."],
    ["Sharing", "We share information only with service providers that help us operate this website (for example, hosting, form handling and email), under appropriate confidentiality obligations, or where required by law."],
    ["Retention", "We keep inquiry information only for as long as needed for the purposes above, or as required by law."],
    ["Your choices", `You may ask us to access, correct or delete your personal information by emailing <a href="mailto:${DATA.contact.general}" data-email="general">${DATA.contact.general}</a>.`],
    ["Product privacy", "SomSpot, Shifaa, Fagaaro and SomSoft each have their own privacy terms covering use of those products."],
  ] : [
    ["Use of this website", "This website provides general information about Digital Dome and its products. By using it, you agree to these terms."],
    ["No offer of securities", "Nothing on this website is an offer to sell, or a solicitation of an offer to buy, any security or investment. Any investment discussion takes place separately and under appropriate agreements."],
    ["Forward-looking information", "Roadmaps, plans and market descriptions reflect current expectations and may change. They are not guarantees of future results."],
    ["Third-party data", "Market statistics are attributed to their publishers. We do not guarantee the accuracy of third-party data."],
    ["Intellectual property", "The Digital Dome, SomSpot, Shifaa, Fagaaro and SomSoft names, logos and content are the property of Digital Dome and may not be used without permission."],
    ["Contact", `Questions about these terms: <a href="mailto:${DATA.contact.general}" data-email="general">${DATA.contact.general}</a>.`],
  ];
  const body = `<section class="page-hero" style="padding-bottom:64px"><span class="blob blob--1" aria-hidden="true"></span><span class="blob blob--2" aria-hidden="true"></span><span class="blob blob--3" aria-hidden="true"></span><div class="container"><div><h1>${title}</h1><p class="sub">Last updated: <span data-updated>${esc(DATA.updated)}</span></p></div></div></section>
<section class="section"><div class="container prose">
${sections.map(([h, t]) => `<h2>${h}</h2><p>${t}</p>`).join("\n")}
</div></section>`;
  return page({ title: `${title} | Digital Dome`, desc: isP ? "How Digital Dome collects, uses and protects personal information submitted through somdigitaldome.com, and how to request access or deletion." : "Terms of use for somdigitaldome.com, including no offer of securities, forward-looking information, third-party data and intellectual property.", path: `/${kind}/` }, body);
}

function notFound() {
  const body = `<section class="page-hero" style="min-height:70vh;display:flex;align-items:center"><span class="blob blob--1" aria-hidden="true"></span><span class="blob blob--2" aria-hidden="true"></span><span class="blob blob--3" aria-hidden="true"></span><div class="container"><div><span class="eyebrow">404</span><h1>This page doesn’t exist.</h1><p class="sub">The link may be outdated. Everything about Digital Dome starts from the homepage.</p><div class="hero-ctas" style="margin-top:28px"><a class="btn btn--primary" href="/">Go to homepage ${I.arrow}</a><a class="btn btn--ghost" href="/investors/">Investors &amp; Partners</a></div></div></div></section>`;
  return page({ title: "Page not found | Digital Dome", desc: "The page you are looking for could not be found. Visit the Digital Dome homepage or the Investors & Partners page.", path: "/404.html", noindex: true }, body);
}

/* ============================================================ WRITE */
const pages = {
  "/": indexPage(),
  "/investors/": investorsPage(),
  "/privacy/": legalPage("privacy"),
  "/terms/": legalPage("terms"),
  "/404.html": notFound(),
  ...Object.fromEntries(PRODUCTS.map((p) => [`/${p.slug}/`, productPage(p)])),
};
for (const [p, html] of Object.entries(pages)) {
  const file = p.endsWith("/") ? p.slice(1) + "index.html" : p.slice(1);
  if (file.includes("/")) mkdirSync(new URL(file.slice(0, file.lastIndexOf("/")), OUT), { recursive: true });
  writeFileSync(new URL(file, OUT), html);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(new URL("sitemap.xml", OUT), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(pages).filter((p) => p !== "/404.html").map((p) => `  <url><loc>${SITE.domain}${p}</loc><lastmod>${today}</lastmod><changefreq>${p === "/" ? "weekly" : "monthly"}</changefreq><priority>${p === "/" ? "1.0" : /privacy|terms/.test(p) ? "0.3" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`);
writeFileSync(new URL("robots.txt", OUT), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} pages → site/`);
