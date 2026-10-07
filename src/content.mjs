// Page copy and product content. Edit here, then run `node build.mjs`.
// Volatile data (status, metrics, team, contact) lives in site/assets/js/site-data.js.

export const SITE = {
  name: "Digital Dome",
  domain: "https://somdigitaldome.com",
  tagline: "Building Somalia’s Digital Future",
};

// Market statistics. Every figure must carry a source and date (Guideline §10).
export const STATS = [
  {
    id: "pop",
    value: "19.7", unit: "M",
    title: "People in Somalia",
    text: "A large, fast-growing domestic market — with a globally connected diaspora on top.",
    source: "UN World Population Prospects 2024 (2025 mid-year estimate)",
    url: "https://population.un.org/wpp/",
    tag: "Fact",
  },
  {
    id: "age",
    value: "15.6", unit: " yrs",
    title: "Median age",
    text: "One of the youngest populations on earth: a generation growing up mobile-first.",
    source: "UN World Population Prospects 2024",
    url: "https://population.un.org/wpp/",
    tag: "Fact",
    feature: true,
  },
  {
    id: "mobile",
    value: "11.5", unit: "M",
    title: "Cellular mobile connections",
    text: "Equivalent to 58.1% of the population, up 7.0% year-on-year.",
    source: "DataReportal, Digital 2026: Somalia (late 2025 data)",
    url: "https://datareportal.com/reports/digital-2026-somalia",
    tag: "Fact",
    meter: 58.1,
  },
  {
    id: "momo",
    value: "73", unit: "%",
    title: "Adults using mobile money",
    text: "Mobile money is already the country’s everyday payment rail, moving an estimated US$2.7B a month.",
    source: "World Bank, Somalia Economic Update (2018) — population aged 16+",
    url: "https://www.worldbank.org/en/news/press-release/2018/09/13/somalia-economic-update-rapid-growth-in-mobile-money",
    tag: "Fact",
    meter: 73,
  },
  {
    id: "internet",
    value: "27.6", unit: "%",
    title: "Internet penetration",
    text: "5.47M people online at the end of 2025. Most of the market is still ahead of us.",
    source: "DataReportal, Digital 2026: Somalia",
    url: "https://datareportal.com/reports/digital-2026-somalia",
    tag: "Fact",
    meter: 27.6,
  },
  {
    id: "gap",
    value: "72", unit: "%",
    title: "Not yet online",
    text: "Mobile money and mobile phones are already widespread, but local digital services are not. That gap is the opportunity we are building for.",
    source: "Derived from DataReportal, Digital 2026: Somalia (100% − 27.6%)",
    url: "https://datareportal.com/reports/digital-2026-somalia",
    tag: "Insight",
    feature: true,
  },
];

export const PRODUCTS = [
  {
    slug: "somspot",
    name: "SomSpot",
    color: "var(--somspot)",
    hex: "#f59e0b",
    role: "Local business discovery platform",
    promise: "Find trusted local businesses, services and places across Somalia, all from one search.",
    purpose: "Helps people discover local businesses, services and places, and helps those businesses get found.",
    market: "Consumers and local businesses in Somali cities",
    monetization: "Promoted listings, advertising, business subscriptions",
    channel: "Consumer · SME",
    problem: "Most local commerce in Somalia is found through word of mouth and scattered social-media posts. There is no reliable, structured, up-to-date source for what exists, where it is and how to reach it. Consumers waste time, and good businesses stay invisible.",
    solution: "SomSpot gives every business a structured, searchable profile with location, hours, contact options and photos, designed around how Somali neighborhoods and landmarks actually work.",
    users: [
      ["Consumers", "Residents and visitors searching for restaurants, shops, clinics, hotels, services and places."],
      ["Local businesses", "SMEs that want to be found, build trust and reach new customers without building their own website."],
      ["Service providers", "Tradespeople and independent professionals who rely on referrals today."],
    ],
    steps: [
      ["Businesses list", "Owners claim a free profile with location, hours, contacts and photos."],
      ["People search", "Search by category, neighborhood or need, in Somali or English."],
      ["Connect instantly", "Call, message or get landmark-based directions in one tap."],
      ["Businesses grow", "Upgrade to promoted placement, richer profiles and customer insights."],
    ],
    revenue: [
      ["Core", "Promoted listings", "Businesses pay for priority placement in relevant searches and categories."],
      ["Core", "Advertising", "Targeted display placements for brands reaching local audiences."],
      ["Core", "Business subscriptions", "Premium profiles, analytics and multi-location management."],
      ["Future", "Leads & bookings", "Fees on qualified leads or bookings once volume justifies it."],
    ],
    opportunity: "Mobile connections already cover 58.1% of the population, and only 27.6% of people are online (DataReportal, 2026). As more people come online, demand for structured local information grows with them. The first platform to build trusted local data has a durable advantage.",
    diff: [
      ["Built for Somali geography", "Landmark and neighborhood-based discovery, not only street addresses."],
      ["Somali-first language", "A native Somali experience with English support."],
      ["Mobile-money aware", "Profiles show which payment methods a business accepts."],
      ["Light by design", "Optimized for low-bandwidth connections and entry-level smartphones."],
    ],
    next: ["Business onboarding & city beta", "Seed the directory with verified listings in a launch city, then open a public beta."],
    mock: "list",
  },
  {
    slug: "shifaa",
    name: "Shifaa",
    color: "var(--shifaa)",
    hex: "#10b981",
    role: "Ruqyah and service connection platform",
    promise: "Connect with trusted Ruqyah practitioners and related services, with transparency and dignity.",
    purpose: "Connects people with trusted Ruqyah practitioners and related services in a private, respectful way.",
    market: "Individuals, families and practitioners in Somalia and the diaspora",
    monetization: "Booking commissions, practitioner subscriptions",
    channel: "Consumer · Practitioner",
    problem: "Finding a credible practitioner today depends on informal referrals. People have little visibility into a practitioner’s background, availability or fees, and privacy is a real concern. Good practitioners have no professional way to be found or to manage bookings.",
    solution: "Shifaa provides vetted practitioner profiles, clear service information, private booking and mobile-money payment, built with cultural and religious sensitivity.",
    users: [
      ["Individuals & families", "People seeking Ruqyah and related services for themselves or a relative, at home or abroad."],
      ["Practitioners", "Ruqyah practitioners who want a professional, trusted channel to manage clients and sessions."],
      ["Related services", "Complementary providers serving the same community need."],
    ],
    steps: [
      ["Browse", "Explore practitioner profiles with services, languages, location and availability."],
      ["Book privately", "Request an in-person or remote session with discreet communication."],
      ["Pay simply", "Pay securely with mobile money."],
      ["Build trust", "Feedback helps the community identify trusted practitioners."],
    ],
    revenue: [
      ["Core", "Booking commission", "A fee on each session booked and paid through the platform."],
      ["Core", "Practitioner subscriptions", "Professional profile tools, scheduling and featured placement."],
      ["Future", "Related services", "Extending to adjacent community and wellbeing service categories."],
    ],
    opportunity: "This is a culturally specific service category that global platforms do not address. Combining mobile-money payments (used by about 73% of Somali adults, per the World Bank) with diaspora demand for remote sessions creates a focused, defensible niche.",
    diff: [
      ["Culturally grounded", "Designed with respect for religious and community norms."],
      ["Practitioner vetting", "A defined onboarding and review process before a profile goes live."],
      ["Privacy-first", "Discreet booking and communication by default."],
      ["Diaspora reach", "Remote sessions connect families abroad with trusted practitioners."],
    ],
    next: ["Practitioner onboarding & pilot", "Finalize the vetting framework, onboard a founding cohort and run a controlled pilot."],
    mock: "profiles",
  },
  {
    slug: "fagaaro",
    name: "Fagaaro",
    color: "var(--fagaaro)",
    hex: "#8b5cf6",
    role: "Interactive digital events platform",
    promise: "Host and join paid or interactive digital events, from community gatherings to public-figure sessions.",
    purpose: "Lets public figures and organizations host paid or interactive digital events for Somali audiences everywhere.",
    market: "Public figures, community leaders, organizations and their audiences",
    monetization: "Ticketing commission, host tools, sponsorship",
    channel: "Creator · Organization · Audience",
    problem: "Somali community events, talks and gatherings increasingly happen online, mostly on global platforms. Those platforms make it hard for hosts to charge with local payment methods, manage audiences or earn from their influence, and they offer no experience built for this community.",
    solution: "Fagaaro gives hosts a simple way to create free or paid events, sell access with mobile money and engage audiences live through Q&A, interaction and replays.",
    users: [
      ["Public figures", "Scholars, artists, thought leaders and creators who want to monetize their audience."],
      ["Organizations", "Community groups, NGOs and businesses running webinars, town halls and launches."],
      ["Audiences", "People in Somalia and across the diaspora who want to take part from anywhere."],
    ],
    steps: [
      ["Create", "A host sets up an event with a description, schedule and free or paid access."],
      ["Sell access", "The audience registers and pays with mobile money."],
      ["Go live", "Interactive sessions with Q&A, polls and audience participation."],
      ["Extend", "Replays and follow-up events keep the community engaged."],
    ],
    revenue: [
      ["Core", "Ticketing commission", "A percentage of each paid ticket sold through Fagaaro."],
      ["Core", "Host tools", "Subscription plans for frequent hosts and organizations."],
      ["Future", "Sponsorship", "Brand-sponsored events and placements, with host consent."],
    ],
    opportunity: "A young population (median age 15.6, per the UN) and a large, connected diaspora make digital community events a natural fit. Local payment rails let hosts earn from audiences that global platforms cannot easily serve.",
    diff: [
      ["Mobile-money ticketing", "Paid access with the payment methods people already use."],
      ["Diaspora-ready", "Built for audiences across time zones and countries."],
      ["Somali-language experience", "An interface and community designed for Somali hosts."],
      ["Interactive by default", "Built for participation, not just broadcast."],
    ],
    next: ["Host pilot program", "Launch with a founding group of hosts and run the first paid events end to end."],
    mock: "event",
  },
  {
    slug: "somsoft",
    name: "SomSoft",
    fullName: "SomSoft by Digital Dome",
    color: "var(--somsoft)",
    hex: "#3b82f6",
    role: "Software and digital solutions arm",
    promise: "Software, systems and digital transformation for Somali businesses and institutions.",
    purpose: "Builds software, systems, websites and SaaS that help Somali organizations operate, scale and compete.",
    market: "Businesses, institutions, NGOs, government and enterprises",
    monetization: "Project contracts, SaaS subscriptions, support retainers",
    channel: "Enterprise · Institution",
    problem: "Somali organizations run on paper, spreadsheets and disconnected tools. International vendors are expensive, remote and rarely understand local workflows or mobile-money payments. Local options are often one-off freelance work with no long-term support.",
    solution: "SomSoft by Digital Dome combines local market understanding with modern engineering. It delivers custom systems today and turns repeated client needs into scalable SaaS products for key sectors.",
    users: [
      ["Businesses", "Retailers, hotels, logistics companies and growing SMEs that need reliable systems."],
      ["Institutions & NGOs", "Schools, clinics and non-profits that need digital operations and reporting."],
      ["Government & enterprise", "Organizations undergoing digital transformation that need a dependable local partner."],
    ],
    steps: [
      ["Discover", "Map the organization’s workflows, constraints and goals."],
      ["Build", "Design and engineer the right system: web, mobile, cloud or integration."],
      ["Launch & support", "Deploy, train teams and maintain the system over time."],
      ["Productize", "Turn repeated sector needs into subscription SaaS products."],
    ],
    revenue: [
      ["Core", "Enterprise software contracts", "Fixed-scope and milestone-based custom development."],
      ["Core", "Implementation & support", "Recurring maintenance, hosting and support retainers."],
      ["Core", "SaaS subscriptions", "Repeatable sector products sold on a monthly or annual plan."],
      ["Future", "Integrations", "Mobile-money and system integrations offered as managed services."],
    ],
    opportunity: "Every sector of the economy needs to digitize, and mobile money is already the default payment rail. A local partner that can build, integrate and support systems, and then productize them, is positioned for recurring enterprise revenue.",
    diff: [
      ["Local understanding", "Workflows, language and payment realities built in from day one."],
      ["Mobile-money integration", "Experience connecting systems to the rails people already use."],
      ["Long-term support", "A dependable partner after launch, not a one-off build."],
      ["Product mindset", "Services inform repeatable SaaS, which builds a scalable technology business."],
    ],
    services: [
      ["Custom software", "Business systems built around real workflows."],
      ["Mobile apps", "iOS and Android apps for customers and teams."],
      ["Websites", "Fast, professional, secure web presence."],
      ["Cloud solutions", "Hosting, migration and scalable infrastructure."],
      ["Mobile-money integrations", "Payments connected to local mobile-money services."],
      ["AI tools", "Practical automation and AI-assisted workflows."],
      ["Business systems", "ERP-style tools for inventory, HR, finance and operations."],
      ["Maintenance & support", "Monitoring, updates and ongoing improvement."],
      ["Digital transformation", "Strategy and delivery for organizations going digital."],
    ],
    sectors: ["Hotels", "Clinics", "Schools", "Retail", "Logistics", "Property management"],
    next: ["First sector SaaS product", "Package a repeatable solution for a priority sector and sign the first subscription clients."],
    mock: "dashboard",
  },
];

// Revenue matrix (Business Model section). 1 = core, 2 = future/planned.
export const REVENUE_MATRIX = [
  ["Advertising & promoted listings", "Visibility for businesses and brands", { somspot: 1, fagaaro: 2 }],
  ["Transaction & booking commissions", "A share of value moved through the platform", { shifaa: 1, somspot: 2 }],
  ["Paid digital events", "Ticketing commission on paid access", { fagaaro: 1 }],
  ["Subscriptions", "Premium tools for businesses, practitioners and hosts", { somspot: 1, shifaa: 1, fagaaro: 1 }],
  ["SaaS fees", "Recurring sector software", { somsoft: 1 }],
  ["Enterprise contracts & custom development", "Project-based engineering", { somsoft: 1 }],
  ["Implementation & support", "Recurring maintenance retainers", { somsoft: 1 }],
  ["Data & analytics services", "Aggregated, anonymized insight, only where appropriate and lawful", { somspot: 2, somsoft: 2 }],
];

// SEO: per-page search titles/descriptions, and FAQ content (rendered + FAQPage schema).
export const SEO = {
  home: {
    title: "Digital Dome | Technology Company in Somalia",
    desc: "Digital Dome is a Somali technology company building digital platforms and software: SomSpot, Shifaa, Fagaaro and SomSoft. Investor and partner info.",
  },
  investors: {
    title: "Invest in Somalia’s Digital Economy | Digital Dome",
    desc: "Investment thesis, sourced market data, business model, roadmap and telecom and mobile-money partnership strategy for Digital Dome, a technology company in Somalia.",
  },
  somspot: {
    title: "SomSpot | Find Local Businesses in Somalia | Digital Dome",
    desc: "SomSpot is a local business discovery platform for Somalia. Find restaurants, shops, clinics, hotels and services near you, and help your business get found.",
  },
  shifaa: {
    title: "Shifaa | Find Trusted Ruqyah Practitioners in Somalia | Digital Dome",
    desc: "Shifaa connects people in Somalia and the diaspora with vetted Ruqyah practitioners and related services, with private booking and mobile-money payment.",
  },
  fagaaro: {
    title: "Fagaaro | Online Events for Somali Audiences | Digital Dome",
    desc: "Fagaaro lets public figures, community leaders and organizations host paid or interactive digital events for Somali audiences worldwide, with mobile-money ticketing.",
  },
  somsoft: {
    title: "SomSoft | Software Development Company in Somalia | Digital Dome",
    desc: "SomSoft by Digital Dome builds custom software, mobile apps, websites, mobile-money integrations and SaaS for businesses, NGOs and institutions in Somalia.",
  },
};

export const HOME_FAQ = [
  ["What is Digital Dome?", "Digital Dome is a technology company building a portfolio of digital products for Somalia and the wider Somali market. Its products are SomSpot, Shifaa, Fagaaro and SomSoft by Digital Dome."],
  ["What does Digital Dome build?", "SomSpot for local business discovery, Shifaa for connecting people with trusted Ruqyah practitioners, Fagaaro for paid and interactive digital events, and SomSoft for custom software, websites, mobile apps and SaaS for organizations."],
  ["Where does Digital Dome operate?", "Digital Dome is focused on Somalia first. Expansion to Somali diaspora markets and other relevant markets will be evaluated based on product-market fit."],
  ["How can I invest in or partner with Digital Dome?", "Submit an inquiry through the Investors & Partners page. After an introductory call and a mutual NDA, qualified investors and partners receive access to the investor deck and data room."],
];

export const PRODUCT_FAQ = {
  somspot: [
    ["What is SomSpot?", "SomSpot is a local business discovery platform for Somalia. It helps people find businesses, services and places, and helps businesses get found by new customers."],
    ["How can my business be listed on SomSpot?", "Businesses will be able to claim a profile with their location, opening hours, contact options and photos. To register early interest, contact Digital Dome through this website."],
    ["Does SomSpot work in Somali?", "Yes. SomSpot is designed as a Somali-first experience with English support, and it is optimized for low-bandwidth connections."],
  ],
  shifaa: [
    ["What is Shifaa?", "Shifaa is a platform that connects people with trusted Ruqyah practitioners and related services in a private, respectful way."],
    ["How are practitioners on Shifaa vetted?", "Every practitioner goes through a defined onboarding and review process before their profile is published."],
    ["Can families outside Somalia use Shifaa?", "Yes. Shifaa is designed to support remote sessions so that families in the diaspora can connect with trusted practitioners."],
  ],
  fagaaro: [
    ["What is Fagaaro?", "Fagaaro is an interactive digital events platform where public figures, community leaders and organizations can host free or paid events for Somali audiences."],
    ["How do audiences pay for Fagaaro events?", "Fagaaro is built for ticketing with mobile money, the payment method most Somali adults already use."],
    ["Can people outside Somalia join Fagaaro events?", "Yes. Fagaaro is designed for audiences across the Somali diaspora and multiple time zones."],
  ],
  somsoft: [
    ["What does SomSoft by Digital Dome do?", "SomSoft builds custom software, mobile apps, websites, business systems, cloud solutions, mobile-money integrations and AI tools for organizations in Somalia, and provides ongoing support."],
    ["Can SomSoft integrate mobile-money payments?", "Yes. Mobile-money integration is one of SomSoft’s core services."],
    ["Which sectors does SomSoft serve?", "SomSoft works with businesses, NGOs, institutions, government and enterprises. It is developing repeatable SaaS products for hotels, clinics, schools, retail, logistics and property management."],
  ],
};
