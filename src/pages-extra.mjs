// About, News / Updates, Careers and Contact pages.
// News posts and job openings are JSON files in /content, written through the content manager (/admin).
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { markdown } from "./markdown.mjs";

const BLOBS = '<span class="blob blob--1" aria-hidden="true"></span><span class="blob blob--2" aria-hidden="true"></span><span class="blob blob--3" aria-hidden="true"></span>';

function readCollection(dir) {
  const url = new URL(`../content/${dir}/`, import.meta.url);
  if (!existsSync(url)) return [];
  return readdirSync(url).filter((f) => f.endsWith(".json")).map((f) => ({
    slug: f.replace(/\.json$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""),
    ...JSON.parse(readFileSync(new URL(f, url), "utf8")),
  }));
}
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function extraPages({ page, sectionHead, I, esc, PRODUCTS, pmark, DATA, SITE, inquiryForm, crumbsLd, ld }) {
  const NEWS = readCollection("news").filter((n) => n.title && n.date).sort((a, b) => new Date(b.date) - new Date(a.date));
  const JOBS = readCollection("careers").filter((j) => j.title && j.open !== false);
  const crumbs = (label, parent) => `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Digital Dome</a><span aria-hidden="true">/</span>${parent ? `<a href="${parent[1]}">${parent[0]}</a><span aria-hidden="true">/</span>` : ""}<span aria-current="page" class="crumb-current">${label}</span></nav>`;
  const hero = (crumb, eyebrow, h1, sub, extra = "") => `<section class="page-hero page-hero--simple">${BLOBS}<div class="container"><div>${crumb}<span class="eyebrow">${eyebrow}</span><h1>${h1}</h1><p class="sub">${sub}</p>${extra}</div></div></section>`;
  const ctaBand = (h, p, links) => `<div class="cta-band reveal"><div><h2>${h}</h2><p>${p}</p></div><div class="actions">${links}</div></div>`;

  /* ----------------------------------------------------------- ABOUT */
  const BRANDS = [
    ["somspot", "Consumers and local businesses", "Discover businesses, services and places."],
    ["shifaa", "Consumers and practitioners", "Connect users with trusted Ruqyah practitioners and related services."],
    ["fagaaro", "Public figures, community leaders, organizations and audiences", "Host and join paid or interactive digital events."],
    ["somsoft", "Businesses, institutions, NGOs, government and enterprises", "Build software, systems, websites, SaaS and digital transformation solutions."],
  ];
  const about = page({
    title: "About Digital Dome | Somali Technology Company",
    desc: "Digital Dome is a technology company building digital platforms and software products for Somalia and the wider Somali market. Learn who we are and what we build.",
    path: "/about/", active: "about",
    extra: crumbsLd([["Home", "/"], ["About", "/about/"]]),
  }, `
${hero(crumbs("About"), "About Digital Dome", "A technology company for the Somali digital economy.", "Digital Dome is building technology platforms and software products designed around the realities, behavior and opportunities of the Somali digital economy.")}

<section class="section" aria-labelledby="ab-who">
  <div class="container">
    ${sectionHead("01", "Who we are", '<span id="ab-who">One company, a portfolio of products.</span>', "Digital Dome is a technology company building a portfolio of digital products for Somalia and the wider Somali market. We are the parent company behind SomSpot, Shifaa, Fagaaro and SomSoft.", true)}
    <div class="thesis">
      <article class="reveal"><h3>Who Digital Dome is</h3><p>A professionally managed technology company with one brand, one leadership team and shared infrastructure across its products.</p></article>
      <article class="reveal"><h3>Why the market matters</h3><p>Somalia is young, mobile-first and already pays with mobile money, yet most local digital services have not been built.</p></article>
      <article class="reveal"><h3>What we have built</h3><p>Four products covering business discovery, trusted services, interactive events and enterprise software.</p></article>
      <article class="reveal"><h3>How we create value</h3><p>Diversified revenue across advertising, commissions, subscriptions, SaaS and enterprise contracts.</p></article>
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="ab-brands">
  <div class="container">
    ${sectionHead("02", "Brand architecture", '<span id="ab-brands">How the parent company and its products fit together.</span>', "Digital Dome is the parent technology company. Each product serves a distinct audience and market need.", true)}
    <div class="compare-wrap reveal"><table class="compare brands">
      <caption class="sr-only">Digital Dome brands, roles, audiences and core value</caption>
      <thead><tr><th scope="col">Brand</th><th scope="col">Role</th><th scope="col">Primary audience</th><th scope="col">Core value</th></tr></thead>
      <tbody>${BRANDS.map(([slug, audience, value]) => {
        const p = PRODUCTS.find((x) => x.slug === slug);
        return `<tr><th scope="row"><a class="brand-cell" href="/${slug}/">${pmark(p)}${p.fullName || p.name}</a></th><td>${esc(p.role)}</td><td>${audience}</td><td>${value}</td></tr>`;
      }).join("")}</tbody>
    </table></div>
  </div>
</section>

<section class="section" aria-labelledby="ab-aud">
  <div class="container">
    ${sectionHead("03", "Who we work with", '<span id="ab-aud">Built for partners as much as for users.</span>', "", false)}
    <div class="audience">
      <a class="aud reveal" href="/investors/"><h3>Investors</h3><p>Angel, venture, strategic corporate and diaspora investors seeking exposure to the Somali digital economy.</p><span>Investor information ${I.arrow}</span></a>
      <a class="aud reveal" href="/investors/?interest=telecom#inquiry"><h3>Telecom &amp; payment partners</h3><p>Telecom and mobile-money operators interested in integration, distribution or commercial partnerships.</p><span>Discuss a partnership ${I.arrow}</span></a>
      <a class="aud reveal" href="/somsoft/"><h3>Enterprise customers</h3><p>Companies, NGOs, institutions, schools, clinics, hotels and retailers that need software or digital services.</p><span>SomSoft by Digital Dome ${I.arrow}</span></a>
      <a class="aud reveal" href="/careers/"><h3>Future team members</h3><p>Engineers, designers and operators who want to build technology for this market.</p><span>Careers ${I.arrow}</span></a>
      <a class="aud reveal" href="/contact/"><h3>Media &amp; ecosystem</h3><p>Journalists, accelerators, startup organizations, government agencies and development stakeholders.</p><span>Contact us ${I.arrow}</span></a>
    </div>
  </div>
</section>

<section class="section section--soft" data-leadership ${DATA.leadership.length ? "" : "hidden"} aria-labelledby="ab-lead">
  <div class="container">
    ${sectionHead("04", "Leadership", '<span id="ab-lead">The team building Digital Dome.</span>', "")}
    <div class="team" data-leadership-grid></div>
  </div>
</section>

<section class="section"><div class="container">
  ${ctaBand("Want to know more?", "Read the investment thesis, or get in touch with the team.", `<a class="btn btn--white" href="/investors/" data-track="CTA: About Investors">Investors &amp; Partners</a><a class="btn btn--ghost-light" href="/contact/" data-track="CTA: About Contact">Contact us</a>`)}
</div></section>`);

  /* ------------------------------------------------------------ NEWS */
  const newsCard = (n) => `<a class="news-card reveal" href="/news/${n.slug}/"><time datetime="${esc(n.date)}">${fmtDate(n.date)}</time><h3>${esc(n.title)}</h3><p>${esc(n.summary || "")}</p><span class="more">Read update ${I.arrow}</span></a>`;
  const news = page({
    title: "News & Updates | Digital Dome",
    desc: "Product launches, milestones and partnership news from Digital Dome, the technology company behind SomSpot, Shifaa, Fagaaro and SomSoft.",
    path: "/news/", active: "news",
    extra: crumbsLd([["Home", "/"], ["News & Updates", "/news/"]]),
  }, `
${hero(crumbs("News &amp; Updates"), "News &amp; updates", "What’s new at Digital Dome.", "Product launches, milestones and partnership news, published as they happen.")}
<section class="section"><div class="container">
  ${NEWS.length ? `<div class="news-grid">${NEWS.map(newsCard).join("")}</div>` : `<div class="empty reveal"><h2>No updates yet</h2><p>Launch and partnership news will be published here. For anything else, <a href="/contact/">get in touch</a>.</p></div>`}
</div></section>`);

  const posts = Object.fromEntries(NEWS.map((n) => [`/news/${n.slug}/`, page({
    title: `${n.title} | Digital Dome`,
    desc: n.summary || n.title,
    path: `/news/${n.slug}/`, active: "news",
    extra: crumbsLd([["Home", "/"], ["News & Updates", "/news/"], [n.title, `/news/${n.slug}/`]]) + ld({
      "@context": "https://schema.org", "@type": "NewsArticle", headline: n.title, description: n.summary || "", datePublished: n.date,
      mainEntityOfPage: `${SITE.domain}/news/${n.slug}/`, image: `${SITE.domain}/assets/img/og-image.png`,
      author: { "@type": "Organization", name: "Digital Dome", url: SITE.domain },
      publisher: { "@type": "Organization", name: "Digital Dome", logo: { "@type": "ImageObject", url: `${SITE.domain}/assets/img/apple-touch-icon.png` } },
    }),
  }, `
<section class="page-hero page-hero--simple">${BLOBS}<div class="container"><div>${crumbs(esc(n.title), ["News &amp; Updates", "/news/"])}<span class="eyebrow"><time datetime="${esc(n.date)}">${fmtDate(n.date)}</time></span><h1>${esc(n.title)}</h1>${n.summary ? `<p class="sub">${esc(n.summary)}</p>` : ""}</div></div></section>
<section class="section"><div class="container">
  <article class="article prose">${markdown(n.body)}</article>
  <p class="article-back"><a href="/news/">← All news &amp; updates</a></p>
</div></section>`)]));

  /* --------------------------------------------------------- CAREERS */
  const mail = DATA.contact.general;
  const job = (j) => `<details class="job reveal"><summary><span><strong>${esc(j.title)}</strong><span class="job-meta">${[j.location, j.type].filter(Boolean).map(esc).join(" · ")}</span></span></summary>
    <div class="job-body">${j.summary ? `<p>${esc(j.summary)}</p>` : ""}<div class="prose">${markdown(j.body)}</div>
    <a class="btn btn--primary btn--sm" href="mailto:${mail}?subject=${encodeURIComponent("Application: " + j.title)}" data-track="Careers: Apply">Apply by email ${I.arrow}</a></div></details>`;
  const careers = page({
    title: "Careers at Digital Dome | Build Technology for Somalia",
    desc: "Join Digital Dome and help build digital products for Somalia and the wider Somali market. See open roles or introduce yourself to the team.",
    path: "/careers/", active: "careers",
    extra: crumbsLd([["Home", "/"], ["Careers", "/careers/"]]),
  }, `
${hero(crumbs("Careers"), "Careers", "Help build Somalia’s digital future.", "We are building four products for a young, mobile-first market. If that sounds like work you want to do, we would like to hear from you.")}
<section class="section" aria-labelledby="ca-why"><div class="container">
  ${sectionHead("01", "Working here", '<span id="ca-why">What you would be building.</span>', "", false)}
  <div class="users">
    <div class="user reveal"><h3>Products for a real local need</h3><p>Business discovery, trusted services, digital events and enterprise software, designed for how people in Somalia actually live and work.</p></div>
    <div class="user reveal"><h3>Consumer and enterprise work</h3><p>Consumer platforms on one side and client software through SomSoft on the other, under one company.</p></div>
    <div class="user reveal"><h3>An early-stage company</h3><p>Digital Dome is at the start of its journey, so the people who join now shape the products and how the company works.</p></div>
  </div>
</div></section>
<section class="section section--soft" id="roles" aria-labelledby="ca-roles"><div class="container">
  ${sectionHead("02", "Open roles", '<span id="ca-roles">Current openings.</span>', "", false)}
  ${JOBS.length ? `<div class="jobs">${JOBS.map(job).join("")}</div>` : `<div class="empty reveal"><h3>There are no open roles right now</h3><p>We still like to hear from engineers, designers and operators who want to work on these products. Tell us about yourself and what you would like to do.</p><a class="btn btn--primary btn--sm" href="mailto:${mail}?subject=${encodeURIComponent("Introducing myself to Digital Dome")}" data-email="general" data-keep-text data-track="Careers: Introduce">Introduce yourself ${I.arrow}</a></div>`}
</div></section>`);

  /* --------------------------------------------------------- CONTACT */
  const contact = page({
    title: "Contact Digital Dome | Investors, Partners & Clients",
    desc: "Contact Digital Dome about investment, telecom and mobile-money partnerships, SomSoft software projects, media inquiries or general questions.",
    path: "/contact/", active: "contact",
    extra: crumbsLd([["Home", "/"], ["Contact", "/contact/"]]) + ld({ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Digital Dome", url: `${SITE.domain}/contact/` }),
  }, `
${hero(crumbs("Contact"), "Contact", "Let’s talk.", "Whether you are an investor, a partner, a potential client or a journalist, this is the fastest way to reach the Digital Dome team.")}
<section class="section"><div class="container contact-grid">
  <div class="reveal">
    <h2 class="h-sm">How can we help?</h2>
    <div class="contact-list">
      <a class="contact-item" href="/investors/"><span class="icon">${I.trend}</span><span><strong>Investors &amp; partners</strong><span>Investment thesis, market data and the data-room process</span></span></a>
      <a class="contact-item" href="/somsoft/"><span class="icon">${I.layers}</span><span><strong>Software for your organization</strong><span>Custom software, apps, websites and systems from SomSoft</span></span></a>
      <a class="contact-item" href="/careers/"><span class="icon">${I.rocket}</span><span><strong>Careers</strong><span>Open roles and how to introduce yourself</span></span></a>
    </div>
    <dl class="contact-details">
      <div><dt>Email</dt><dd><a href="mailto:${mail}" data-email="general">${mail}</a></dd></div>
      <div data-phone-row hidden><dt>Phone</dt><dd data-phone hidden></dd></div>
      <div><dt>Location</dt><dd>${esc(DATA.contact.location)}</dd></div>
    </dl>
  </div>
  <div class="reveal">${inquiryForm()}</div>
</div></section>`);

  return { "/about/": about, "/news/": news, ...posts, "/careers/": careers, "/contact/": contact };
}
