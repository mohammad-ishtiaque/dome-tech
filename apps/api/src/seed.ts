// Loads the current website content into MongoDB.
// Runs automatically when the API starts with an empty database.
// `pnpm seed` (API stopped) wipes the content collections and loads it again.
import { readFileSync } from "node:fs";
import type { Background, Page, Product, Section, Settings } from "@dome/shared";
import { JobModel, NewsModel, PageModel, ProductModel, SettingsModel } from "./models/index.js";

const legacy = JSON.parse(readFileSync(new URL("./seed/legacy.json", import.meta.url), "utf8"));

type Header = { eyebrow?: string; title?: string; lead?: string; anchor?: string; background?: Background };
const make = (prefix: string) => {
  let n = 0;
  return (type: Section["type"], header: Header, data: Record<string, unknown> = {}): Section =>
    ({ id: `${prefix}-${++n}`, type, background: "default", ...header, data });
};
const btn = (label: string, href: string, style: "primary" | "secondary" = "primary") => ({ label, href, style });
const items = (list: string[]) => list.map((text) => ({ text }));
const STATS = legacy.STATS.map((s: any) => ({
  value: s.value, unit: s.unit.trim(), title: s.title, text: s.text, meter: s.meter ?? null,
  featured: !!s.feature, tag: s.tag, source: s.source, sourceUrl: s.url,
}));
const REVENUE_ROWS = legacy.REVENUE_MATRIX.map(([name, description, map]: [string, string, Record<string, number>]) => ({
  name, description, products: Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v === 1 ? "core" : "planned"])),
}));
const faq = (list: [string, string][]) => list.map(([question, answer]) => ({ question, answer }));

/* ---------------------------------------------------------------- pages */
function homePage(): Page {
  const s = make("home");
  return {
    slug: "home", title: "Home", numbered: true, seo: { title: legacy.SEO.home.title, description: legacy.SEO.home.desc },
    sections: [
      s("hero", {}, {
        kickerTag: "Somalia", kicker: "A technology company for the Somali digital economy",
        heading: "Building Somalia’s", highlight: "Digital Future",
        subheading: "Digital Dome is building a portfolio of technology platforms and software products designed for Somalia’s rapidly evolving digital economy.",
        bullets: items(["Four products", "One ecosystem", "One growing market"]),
        buttons: [btn("Explore Our Portfolio", "/#portfolio"), btn("Partner With Digital Dome", "/investors/#inquiry", "secondary")],
        visual: "ecosystem", chips: [{ value: "73%", label: "of adults use mobile money" }, { value: "15.6", label: "median age: a mobile-first generation" }],
        showProductStrip: true,
      }),
      s("cards", { anchor: "about", eyebrow: "Who we are", title: "A technology company, not a single app.", lead: "Digital Dome is building technology platforms and software products designed around the realities, behavior and opportunities of the Somali digital economy." }, {
        columns: "2", style: "numbered", items: [
          { title: "Who we are", text: "The parent technology company behind four focused products, with one brand, one leadership team and shared infrastructure." },
          { title: "Why it matters", text: "Somalia is young, mobile-first and already runs on mobile money, yet most local digital services have not been built." },
          { title: "What we’ve built", text: "A portfolio covering business discovery, trusted services, interactive events and enterprise software." },
          { title: "How we create value", text: "Diversified revenue across advertising, commissions, subscriptions, SaaS and enterprise contracts, built on a shared platform." },
        ], chips: [],
      }),
      s("stats", { anchor: "opportunity", background: "soft", eyebrow: "The opportunity", title: "A young, mobile-first market that already pays digitally.", lead: "The mobile phones and mobile-money accounts are already in people’s hands. The local digital services built on top of them are not. Every figure below is sourced and dated." }, {
        items: STATS, note: "Fact: published third-party data · Insight: derived from the cited source · We do not publish projections as facts.",
      }),
      s("productGrid", { anchor: "portfolio", eyebrow: "Our portfolio", title: "Four products. Four distinct market needs.", lead: "From business discovery and trusted digital services to interactive events and enterprise software, Digital Dome builds technology around how Somali consumers, businesses and institutions connect and grow." }),
      s("ecosystem", { anchor: "ecosystem", background: "blue", eyebrow: "One ecosystem", title: "One parent company. Every side of the market.", lead: "Each product serves a different audience through a different digital channel, and all of them share Digital Dome’s brand, technology, payment integrations and distribution." }, {
        parentText: "Parent technology company · shared platform, payments & distribution", audiencesLabel: "Who we serve",
        audiences: items(["Consumers", "Local businesses", "Service providers", "Public figures", "Institutions & NGOs", "Enterprise & government", "The Somali diaspora"]),
      }),
      s("traction", { anchor: "traction", eyebrow: "Traction", title: "Execution, reported honestly.", lead: "We publish only verified progress. Metrics appear here as they are confirmed internally." }, {
        facts: [{ value: "4", label: "Products in the portfolio" }, { value: "2", label: "Markets served: consumer and enterprise" }, { value: "6+", label: "Revenue streams across the portfolio" }],
        emptyTitle: "Verified metrics only",
        emptyText: "User, partner and revenue figures will be published here once each product reaches public beta and the numbers have been verified internally. Qualified investors can request the latest operating update under NDA.",
      }),
      s("revenueMatrix", { anchor: "business-model", background: "soft", eyebrow: "Business model", title: "Diversified revenue across the portfolio.", lead: "Consumer platforms build audience and transaction volume. SomSoft brings in enterprise revenue early. Together they reduce dependence on any single stream." }, { rows: REVENUE_ROWS }),
      s("cards", { anchor: "why", background: "blue", eyebrow: "Why Digital Dome", title: "Built here, for here, by people who understand it.", lead: "Global platforms are not built for this market, and local alternatives are fragmented. That gap gives us room to compete." }, {
        columns: "3", style: "plain", chips: [], items: [
          { icon: "map", title: "Local market understanding", text: "Products designed around how Somali people actually search, pay, gather and do business." },
          { icon: "globe", title: "Somali-language & cultural relevance", text: "Native-language experiences and culturally grounded products that global platforms do not prioritize." },
          { icon: "wallet", title: "Mobile-money native", text: "Built from day one for the payment rails most Somali adults already use every day." },
          { icon: "layers", title: "Portfolio leverage", text: "Shared technology, brand and payment integrations lower the cost of each new product." },
          { icon: "share", title: "First-party distribution", text: "Every product can cross-promote the others. Businesses on SomSpot are natural SomSoft clients." },
          { icon: "building", title: "Consumer + enterprise", text: "Serving both markets balances long-term platform value with nearer-term contract revenue." },
        ],
      }),
      s("roadmap", { anchor: "growth", eyebrow: "Growth vision", title: "Somalia first. Then scale, based on evidence.", lead: "A roadmap, not a promise. Each step depends on reaching product-market fit in the step before it." }, {
        phases: [
          { label: "Now", tag: "Focus", title: "Win Somalia", text: "Launch and prove the portfolio in the home market.", variant: "highlight", items: items(["Bring each product to public beta and launch", "Win SomSoft enterprise clients", "Establish telecom and mobile-money partnerships"]) },
          { label: "Next", tag: "Evaluate", title: "Reach the diaspora", text: "Extend to Somali communities worldwide where the products already fit.", variant: "normal", items: items(["Fagaaro events for global audiences", "Shifaa remote sessions across borders", "Diaspora-to-home commerce and services"]) },
          { label: "Later", tag: "Evidence-based", title: "Adjacent markets", text: "Consider other relevant markets only where product-market fit is clear.", variant: "muted", items: items(["Replicate proven playbooks", "Package SomSoft SaaS for similar economies", "Expand only with strong unit economics"]) },
        ],
      }),
      s("faq", { eyebrow: "FAQ", title: "Digital Dome at a glance" }, { items: faq(legacy.HOME_FAQ) }),
      s("inquiry", { anchor: "partner", background: "blue", eyebrow: "Investment & partnerships", title: "Help build Somalia’s digital future.", lead: "Digital Dome is building for long-term scale. We welcome conversations with investors, telecom operators, financial-technology partners, enterprises and strategic organizations that share our vision for Somalia’s digital future." }, {
        paths: [
          { title: "Invest in Digital Dome", text: "Angel, venture, strategic and diaspora investors", interest: "invest" },
          { title: "Strategic Partnerships", text: "Telecom, mobile-money, fintech and enterprise partners", interest: "telecom" },
          { title: "Request Investor Information", text: "Investor deck and data-room access under NDA", interest: "info" },
        ],
        showContactDetails: false, formTitle: "Start a conversation", formText: "Tell us who you are and what you’re interested in. We respond to every serious inquiry within two business days.",
      }),
    ],
  };
}

function investorsPage(): Page {
  const s = make("investors");
  return {
    slug: "investors", title: "Investors & Partners", numbered: true, seo: { title: legacy.SEO.investors.title, description: legacy.SEO.investors.desc },
    sections: [
      s("pageHero", { eyebrow: "Investor relations", title: "A portfolio approach to the Somali digital economy.", lead: "Four products, shared infrastructure and diversified revenue, built for a young, mobile-first market that already transacts digitally." }, {
        buttons: [btn("Request Investor Information", "#inquiry"), btn("Read the thesis", "#thesis", "secondary")],
        facts: [{ label: "Company", value: "Digital Dome, parent technology company" }, { label: "Home market", value: "Somalia, then the Somali diaspora" }, { label: "Portfolio", value: "SomSpot · Shifaa · Fagaaro · SomSoft" }, { label: "Stage", value: "Early stage, building & launching" }],
      }),
      s("cards", { anchor: "thesis", eyebrow: "Investment thesis", title: "Why Digital Dome, why Somalia, why now.", lead: "Four reasons we believe a focused local technology company can build durable value in this market." }, {
        columns: "2", style: "numbered", chips: [], items: [
          { title: "A young market coming online", text: "The median age is 15.6 (UN WPP 2024), and only 27.6% of people are online (DataReportal 2026). Most digital adoption is still ahead." },
          { title: "The payment rails already exist", text: "About 73% of adults use mobile money (World Bank). Our products can charge from day one using methods people already trust." },
          { title: "Underserved by global platforms", text: "Global products are not built for Somali language, geography, culture or payments. That leaves room for local platforms to lead." },
          { title: "Portfolio economics", text: "Shared technology, brand and distribution lower the cost of each product. SomSoft enterprise revenue helps fund platform growth and reduces risk." },
        ],
      }),
      s("stats", { background: "soft", eyebrow: "Market evidence", title: "Sourced, dated, verifiable.", lead: "We separate published facts from our own analysis. Projections are never presented as facts." }, { items: STATS }),
      s("revenueMatrix", { eyebrow: "Revenue models by product", title: "Multiple ways to earn, across the portfolio." }, { rows: REVENUE_ROWS }),
      s("cards", { background: "blue", eyebrow: "Go-to-market", title: "Distribution that compounds.", lead: "Each channel strengthens the others, and every product benefits from the portfolio’s reach." }, {
        columns: "4", style: "plain", chips: [], items: [
          { title: "Partner distribution", text: "Telecom and mobile-money partnerships for payments, bundling and reach at national scale." },
          { title: "Community-led growth", text: "Public figures on Fagaaro and practitioners on Shifaa bring their own audiences with them." },
          { title: "Direct SME & enterprise sales", text: "SomSoft sells directly to organizations. SomSpot businesses are a warm pipeline." },
          { title: "Cross-portfolio funnel", text: "Users and businesses move between products under one trusted parent brand." },
        ],
      }),
      s("table", { eyebrow: "Competitive landscape", title: "Where we fit.", lead: "Today’s alternatives are global platforms that were not built for this market, or informal, offline channels." }, {
        columns: items(["Need", "Global platforms", "Informal / offline", "Digital Dome"]), highlightLast: true,
        rows: [
          ["Local discovery", "Thin, often outdated Somali business data; address-based search", "Word of mouth, scattered social posts", "SomSpot: structured, landmark-aware, Somali-first"],
          ["Trusted services", "Not addressed", "Referrals with no transparency or privacy", "Shifaa: vetted profiles, private booking, mobile-money payment"],
          ["Digital events", "Generic streaming; hard to charge with local payment methods", "Physical gatherings, limited reach", "Fagaaro: mobile-money ticketing, diaspora-ready"],
          ["Business software", "Expensive, remote, not localized", "One-off freelance builds, no support", "SomSoft: local delivery, long-term support, sector SaaS"],
        ].map((cells) => ({ cells: items(cells) })),
      }),
      s("roadmap", { background: "soft", eyebrow: "12–24 month roadmap", title: "What we’re focused on next.", lead: "Indicative and subject to funding, partnerships and product-market-fit evidence." }, {
        phases: [
          { label: "0–6 months", tag: "Build", title: "Launch-ready portfolio", variant: "highlight", items: items(["Complete core builds and internal testing", "SomSoft enterprise engagements", "Onboard founding businesses, practitioners and hosts"]) },
          { label: "6–12 months", tag: "Launch", title: "Public betas in Somalia", variant: "normal", items: items(["Public beta of consumer products", "Mobile-money payment integrations live", "First verified traction metrics published"]) },
          { label: "12–24 months", tag: "Scale", title: "Monetize & extend", variant: "muted", items: items(["Turn on core revenue streams per product", "First sector SaaS product from SomSoft", "Evaluate diaspora expansion"]) },
        ],
      }),
      s("checklist", { eyebrow: "Partnership strategy", title: "Built to partner with telecom and mobile-money leaders." }, {
        intro: "Telecom operators and mobile-money providers are natural partners. They bring reach and payment infrastructure, and we bring products that create new digital transactions and engagement on their networks.",
        button: [btn("Discuss a partnership", "?interest=telecom#inquiry")],
        items: [
          { title: "Integration", text: "Mobile-money payments embedded across products." },
          { title: "Distribution", text: "Bundles, SMS and in-app promotion to reach subscribers at scale." },
          { title: "Commercial", text: "Revenue-sharing and co-marketing on new digital services." },
          { title: "Investment", text: "Strategic corporate investment aligned with digital-services growth." },
          { title: "Enterprise", text: "SomSoft as a delivery partner for digital-transformation projects." },
        ],
      }),
      s("team", { background: "soft", eyebrow: "Leadership", title: "The team building Digital Dome." }),
      s("steps", { eyebrow: "Investor materials", title: "How to access the investor deck and data room.", lead: "Sensitive financials and forecasts are never published on this site. Qualified parties get access through a simple, confidential process." }, {
        items: [
          { title: "Submit an inquiry", text: "Use the form below with your name, organization and interest." },
          { title: "Introductory call", text: "A short conversation with leadership to understand fit." },
          { title: "NDA", text: "A mutual confidentiality agreement protects both parties." },
          { title: "Deck & data room", text: "Access to the investor deck, financial model and diligence materials." },
        ],
      }),
      s("inquiry", { anchor: "inquiry", background: "blue", eyebrow: "Get in touch", title: "Let’s talk.", lead: "Digital Dome is building for long-term scale. We welcome conversations with investors, telecom operators, financial-technology partners, enterprises and strategic organizations that share our vision for Somalia’s digital future." }, {
        paths: [
          { title: "Invest in Digital Dome", text: "Angel, venture, strategic and diaspora investors", interest: "invest" },
          { title: "Strategic Partnerships", text: "Telecom, mobile-money, fintech and enterprise partners", interest: "telecom" },
          { title: "Request Investor Information", text: "Investor deck and data-room access under NDA", interest: "info" },
        ],
        showContactDetails: true, formTitle: "Start a conversation", formText: "Tell us who you are and what you’re interested in. We respond to every serious inquiry within two business days.",
      }),
      s("richText", {}, { body: "*Forward-looking statements: this page contains statements about plans, roadmaps and market opportunities that reflect Digital Dome’s current expectations. They are not guarantees of future performance and involve risks and uncertainties. Nothing on this website is an offer to sell or a solicitation to buy any security. Market statistics are attributed to their original publishers and dates.*" }),
    ],
  };
}

function aboutPage(): Page {
  const s = make("about");
  const brand = (slug: string, audience: string, value: string) => {
    const p = legacy.PRODUCTS.find((x: any) => x.slug === slug);
    return { cells: items([p.fullName || p.name, p.role, audience, value]) };
  };
  return {
    slug: "about", title: "About", numbered: true,
    seo: { title: "About Digital Dome | Somali Technology Company", description: "Digital Dome is a technology company building digital platforms and software products for Somalia and the wider Somali market. Learn who we are and what we build." },
    sections: [
      s("pageHero", { eyebrow: "About Digital Dome", title: "A technology company for the Somali digital economy.", lead: "Digital Dome is building technology platforms and software products designed around the realities, behavior and opportunities of the Somali digital economy." }, { buttons: [], facts: [] }),
      s("cards", { eyebrow: "Who we are", title: "One company, a portfolio of products.", lead: "Digital Dome is a technology company building a portfolio of digital products for Somalia and the wider Somali market. We are the parent company behind SomSpot, Shifaa, Fagaaro and SomSoft." }, {
        columns: "2", style: "numbered", chips: [], items: [
          { title: "Who Digital Dome is", text: "A professionally managed technology company with one brand, one leadership team and shared infrastructure across its products." },
          { title: "Why the market matters", text: "Somalia is young, mobile-first and already pays with mobile money, yet most local digital services have not been built." },
          { title: "What we have built", text: "Four products covering business discovery, trusted services, interactive events and enterprise software." },
          { title: "How we create value", text: "Diversified revenue across advertising, commissions, subscriptions, SaaS and enterprise contracts." },
        ],
      }),
      s("table", { background: "soft", eyebrow: "Brand architecture", title: "How the parent company and its products fit together.", lead: "Digital Dome is the parent technology company. Each product serves a distinct audience and market need." }, {
        columns: items(["Brand", "Role", "Primary audience", "Core value"]), highlightLast: false,
        rows: [
          brand("somspot", "Consumers and local businesses", "Discover businesses, services and places."),
          brand("shifaa", "Consumers and practitioners", "Connect users with trusted Ruqyah practitioners and related services."),
          brand("fagaaro", "Public figures, community leaders, organizations and audiences", "Host and join paid or interactive digital events."),
          brand("somsoft", "Businesses, institutions, NGOs, government and enterprises", "Build software, systems, websites, SaaS and digital transformation solutions."),
        ],
      }),
      s("cards", { eyebrow: "Who we work with", title: "Built for partners as much as for users." }, {
        columns: "3", style: "plain", chips: [], items: [
          { title: "Investors", text: "Angel, venture, strategic corporate and diaspora investors seeking exposure to the Somali digital economy.", href: "/investors/", linkLabel: "Investor information" },
          { title: "Telecom & payment partners", text: "Telecom and mobile-money operators interested in integration, distribution or commercial partnerships.", href: "/investors/?interest=telecom#inquiry", linkLabel: "Discuss a partnership" },
          { title: "Enterprise customers", text: "Companies, NGOs, institutions, schools, clinics, hotels and retailers that need software or digital services.", href: "/somsoft/", linkLabel: "SomSoft by Digital Dome" },
          { title: "Future team members", text: "Engineers, designers and operators who want to build technology for this market.", href: "/careers/", linkLabel: "Careers" },
          { title: "Media & ecosystem", text: "Journalists, accelerators, startup organizations, government agencies and development stakeholders.", href: "/contact/", linkLabel: "Contact us" },
        ],
      }),
      s("team", { background: "soft", eyebrow: "Leadership", title: "The team building Digital Dome." }),
      s("cta", { title: "Want to know more?", lead: "Read the investment thesis, or get in touch with the team." }, {
        variant: "band", buttons: [btn("Investors & Partners", "/investors/"), btn("Contact us", "/contact/", "secondary")],
      }),
    ],
  };
}

function simplePages(): Page[] {
  const news = make("news"), careers = make("careers"), contact = make("contact");
  return [
    {
      slug: "news", title: "News & Updates",
      seo: { title: "News & Updates | Digital Dome", description: "Product launches, milestones and partnership news from Digital Dome, the technology company behind SomSpot, Shifaa, Fagaaro and SomSoft." },
      sections: [
        news("pageHero", { eyebrow: "News & updates", title: "What’s new at Digital Dome.", lead: "Product launches, milestones and partnership news, published as they happen." }, { buttons: [], facts: [] }),
        news("newsList", {}, { limit: 0 }),
      ],
    },
    {
      slug: "careers", title: "Careers", numbered: true,
      seo: { title: "Careers at Digital Dome | Build Technology for Somalia", description: "Join Digital Dome and help build digital products for Somalia and the wider Somali market. See open roles or introduce yourself to the team." },
      sections: [
        careers("pageHero", { eyebrow: "Careers", title: "Help build Somalia’s digital future.", lead: "We are building four products for a young, mobile-first market. If that sounds like work you want to do, we would like to hear from you." }, { buttons: [], facts: [] }),
        careers("cards", { eyebrow: "Working here", title: "What you would be building." }, {
          columns: "3", style: "accent", chips: [], items: [
            { title: "Products for a real local need", text: "Business discovery, trusted services, digital events and enterprise software, designed for how people in Somalia actually live and work." },
            { title: "Consumer and enterprise work", text: "Consumer platforms on one side and client software through SomSoft on the other, under one company." },
            { title: "An early-stage company", text: "Digital Dome is at the start of its journey, so the people who join now shape the products and how the company works." },
          ],
        }),
        careers("jobsList", { anchor: "roles", background: "soft", eyebrow: "Open roles", title: "Current openings." }, {
          emptyTitle: "There are no open roles right now",
          emptyText: "We still like to hear from engineers, designers and operators who want to work on these products. Tell us about yourself and what you would like to do.",
        }),
      ],
    },
    {
      slug: "contact", title: "Contact",
      seo: { title: "Contact Digital Dome | Investors, Partners & Clients", description: "Contact Digital Dome about investment, telecom and mobile-money partnerships, SomSoft software projects, media inquiries or general questions." },
      sections: [
        contact("pageHero", { eyebrow: "Contact", title: "Let’s talk.", lead: "Whether you are an investor, a partner, a potential client or a journalist, this is the fastest way to reach the Digital Dome team." }, { buttons: [], facts: [] }),
        contact("inquiry", { anchor: "inquiry", title: "How can we help?" }, {
          paths: [
            { title: "Investors & partners", text: "Investment, telecom and mobile-money partnerships", interest: "invest" },
            { title: "Software for your organization", text: "Custom software, apps, websites and systems from SomSoft", interest: "enterprise" },
            { title: "Media & general questions", text: "Press, ecosystem and everything else", interest: "media" },
          ],
          showContactDetails: true, formTitle: "Send us a message", formText: "We respond within two business days.",
        }),
      ],
    },
    legalPage("privacy", "Privacy Policy", "How Digital Dome collects, uses and protects personal information submitted through somdigitaldome.com, and how to request access or deletion.", [
      ["Information we collect", "When you contact us through this website, we collect the details you provide: your name, organization, email address, area of interest and message. We use privacy-conscious analytics that do not use advertising cookies, so we can understand aggregate site usage."],
      ["How we use it", "We use your information only to respond to your inquiry, manage the resulting business relationship and improve this website. We do not sell personal information."],
      ["Sharing", "We share information only with service providers that help us operate this website (for example, hosting), under appropriate confidentiality obligations, or where required by law."],
      ["Retention", "We keep inquiry information only for as long as needed for the purposes above, or as required by law."],
      ["Your choices", `You may ask us to access, correct or delete your personal information by emailing [${legacy.DATA.contact.general}](mailto:${legacy.DATA.contact.general}).`],
      ["Product privacy", "SomSpot, Shifaa, Fagaaro and SomSoft each have their own privacy terms covering use of those products."],
    ]),
    legalPage("terms", "Terms of Use", "Terms of use for somdigitaldome.com, including no offer of securities, forward-looking information, third-party data and intellectual property.", [
      ["Use of this website", "This website provides general information about Digital Dome and its products. By using it, you agree to these terms."],
      ["No offer of securities", "Nothing on this website is an offer to sell, or a solicitation of an offer to buy, any security or investment. Any investment discussion takes place separately and under appropriate agreements."],
      ["Forward-looking information", "Roadmaps, plans and market descriptions reflect current expectations and may change. They are not guarantees of future results."],
      ["Third-party data", "Market statistics are attributed to their publishers. We do not guarantee the accuracy of third-party data."],
      ["Intellectual property", "The Digital Dome, SomSpot, Shifaa, Fagaaro and SomSoft names, logos and content are the property of Digital Dome and may not be used without permission."],
      ["Contact", `Questions about these terms: [${legacy.DATA.contact.general}](mailto:${legacy.DATA.contact.general}).`],
    ]),
  ];
}

function legalPage(slug: string, title: string, description: string, parts: [string, string][]): Page {
  const s = make(slug);
  return {
    slug, title, seo: { title: `${title} | Digital Dome`, description },
    sections: [
      s("pageHero", { title, lead: `Last updated: ${legacy.DATA.updated}` }, { buttons: [], facts: [] }),
      s("richText", {}, { body: parts.map(([h, t]) => `## ${h}\n\n${t}`).join("\n\n") }),
    ],
  };
}

/* ------------------------------------------------------------- products */
const CONCEPT: Record<string, { device: "phone" | "browser"; concept: Product["mockup"]["concept"]; icon: Product["icon"] }> = {
  somspot: { device: "phone", concept: "list", icon: "pin" },
  shifaa: { device: "phone", concept: "profiles", icon: "heart" },
  fagaaro: { device: "phone", concept: "event", icon: "broadcast" },
  somsoft: { device: "browser", concept: "dashboard", icon: "code" },
};

function product(p: any, order: number): Product {
  const s = make(p.slug);
  const sections: Section[] = [
    s("cards", { eyebrow: "Problem & solution", title: `Why ${p.name} needs to exist.` }, {
      columns: "2", style: "accent", chips: [], items: [{ tag: "The problem", title: "The problem", text: p.problem }, { tag: "Our solution", title: "Our solution", text: p.solution }],
    }),
    s("cards", { background: "soft", eyebrow: "Who it serves", title: "Users and customers" }, {
      columns: "3", style: "accent", chips: [], items: p.users.map(([title, text]: [string, string]) => ({ title, text })),
    }),
    s("steps", { anchor: "how", eyebrow: "How it works", title: "Simple for users. Valuable for the market." }, {
      items: p.steps.map(([title, text]: [string, string]) => ({ title, text })),
    }),
  ];
  if (p.services) {
    sections.push(s("cards", { eyebrow: "Services", title: "Services today", lead: "SomSoft is positioned as a scalable technology business, not a freelance development shop. Repeated client needs become subscription products for priority sectors:" }, {
      columns: "3", style: "plain", items: p.services.map(([title, text]: [string, string]) => ({ title, text })), chips: items(p.sectors),
    }));
  }
  sections.push(
    s("cards", { background: "soft", eyebrow: "Revenue model & market", title: `How ${p.name} makes money`, lead: p.opportunity }, {
      columns: p.revenue.length >= 4 ? "4" : "3", style: "plain", chips: [],
      items: p.revenue.map(([kind, title, text]: [string, string, string]) => ({ tag: kind === "Future" ? "Planned" : "Core", title, text })),
    }),
    s("checklist", { eyebrow: "Key differentiators", title: `What sets ${p.name} apart` }, {
      items: p.diff.map(([title, text]: [string, string]) => ({ title, text })), button: [],
    }),
    s("cta", { title: `Next milestone: ${p.next[0]}`, lead: p.next[1] }, { variant: "milestone", buttons: [btn("Investor information", "/investors/?interest=info#inquiry")] }),
    s("faq", { eyebrow: "FAQ", title: `${p.name}: common questions` }, { items: faq(legacy.PRODUCT_FAQ[p.slug]) }),
  );
  const c = CONCEPT[p.slug];
  return {
    slug: p.slug, order, name: p.name, fullName: p.fullName, role: p.role, color: p.hex, icon: c.icon,
    status: legacy.DATA.status[p.slug], promise: p.promise, purpose: p.purpose, market: p.market, monetization: p.monetization, channel: p.channel,
    mockup: { device: c.device, concept: c.concept },
    heroButtons: [
      btn(p.slug === "somsoft" ? "Discuss a project" : `Partner on ${p.name}`, `/investors/?interest=${p.slug === "somsoft" ? "enterprise" : "strategic"}#inquiry`),
      btn("How it works", "#how", "secondary"),
    ],
    seo: { title: legacy.SEO[p.slug].title, description: legacy.SEO[p.slug].desc },
    sections, published: true,
  };
}

function settings(): Settings & { key: string } {
  const d = legacy.DATA;
  return {
    key: "site", siteName: "Digital Dome", domain: "https://somdigitaldome.com", tagline: "Building Somalia’s Digital Future",
    footerText: "Building technology platforms and software products for the Somali digital economy.",
    contact: { email: d.contact.general, phone: d.contact.phone || "", location: d.contact.location },
    social: d.social, milestones: d.milestones, metrics: d.metrics, team: d.leadership, updatedLabel: d.updated,
    headerCta: { label: "Partner With Us", href: "/investors/#inquiry" },
  };
}

/* ------------------------------------------------------------------ run */
export async function seed() {
  await Promise.all([PageModel.deleteMany({}), ProductModel.deleteMany({}), NewsModel.deleteMany({}), JobModel.deleteMany({}), SettingsModel.deleteMany({})]);
  await SettingsModel.create(settings());
  await PageModel.insertMany([homePage(), investorsPage(), aboutPage(), ...simplePages()]);
  await ProductModel.insertMany(legacy.PRODUCTS.map(product));
  await NewsModel.insertMany(legacy.NEWS.map((n: any) => ({ ...n, published: true })));
  const [pages, products] = await Promise.all([PageModel.countDocuments(), ProductModel.countDocuments()]);
  console.log(`Seeded ${pages} pages, ${products} products, ${legacy.NEWS.length} news post(s) and site settings.`);
}

// `pnpm seed`: run directly to reset the content (stop the API first).
if (process.argv.includes("--reset")) {
  const { connectDb } = await import("./db.js");
  const mongoose = (await import("mongoose")).default;
  await connectDb();
  await seed();
  await mongoose.disconnect();
  process.exit(0);
}
