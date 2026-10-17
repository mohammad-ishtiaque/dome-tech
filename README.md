# Digital Dome platform

The website now runs on a dynamic platform. Everything (pages, sections, products, news, careers, settings) is managed from a dashboard.

| App | Folder | Tech | Local URL |
|---|---|---|---|
| Website | `apps/web` | React Router v8 (Remix), server-side rendered for SEO | http://localhost:5173 |
| Dashboard | `apps/admin` | React + Vite | http://localhost:5174 |
| API | `apps/api` | Node.js + Express + MongoDB | http://localhost:4000 |
| Shared types & section library | `packages/shared` | TypeScript | |

## Run it locally

Requires Node 24 (`nvm use 24.22.0`) and pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts all three apps. A local MongoDB starts automatically (data in `apps/api/.data`); nothing to install. On first start the database is filled with the current website content.

Create your dashboard login (prints a temporary password once; change it under **Account**):

```bash
pnpm create-admin you@example.com "Your Name"
```

Other commands: `pnpm seed` (reset website content to the original; stop the API first) and `pnpm typecheck`.

## How content works

- Every page is an ordered list of **sections** (hero, cards, stats, FAQ, table, text + image, screenshots, inquiry form…). In the dashboard you can add, edit, reorder, hide or delete sections on any page, and create new pages.
- Section types and their fields are defined once in `packages/shared/src/sections.ts`. The dashboard builds its forms from that list, and `apps/web/app/components/sections` renders them. Adding a new section type = one entry there + one React component.
- Products have their own editor: details, brand color, app mockup screenshot, header buttons, page sections and SEO.
- Contact-form messages are saved in the database and listed under **Inquiries**.
- Uploaded images are stored in `apps/api/uploads` (set `UPLOAD_DIR` on the server).

---

# Previous static version

The sections below describe the original static site (`site/`, `build.mjs`), kept for reference.

## Digital Dome: somdigitaldome.com (static version)

An investor-focused corporate website built to the *Digital Dome Website Developer Guideline*. It is a static site with no framework and no dependencies, which keeps it fast on mobile connections and easy to host anywhere.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Static **HTML5**, pre-rendered | Every word is in the HTML, which is best for SEO and speed |
| Styling | Hand-written **CSS3** (custom properties, grid, `color-mix`, backdrop-filter) | No framework weight; one ~45 KB stylesheet |
| Behaviour | **Vanilla JavaScript** (~7 KB, deferred) | Menu, scroll reveals, counters, form; the site works without it |
| Build | **Node.js** script (`build.mjs`), zero npm dependencies | Shared header/footer/templates, no `npm install` |
| Fonts | Google Fonts: Plus Jakarta Sans + Inter | Modern, highly readable |
| Hosting | Any static host (Netlify / Cloudflare Pages recommended) | HTTPS, CDN, `_headers` support |

## Structure

```
build.mjs              Page templates. Run `node build.mjs` to regenerate site/
src/content.mjs        All copy: products, market stats (with sources), revenue matrix, SEO titles, FAQs
serve.mjs              Local preview: `node serve.mjs` → http://localhost:4173
tools/seo-audit.cjs    `node tools/seo-audit.cjs` checks titles, descriptions, H1s, schema, links
tools/og.html          Source for the social-share image
site/                  ← DEPLOY THIS FOLDER (clean URLs: /somspot/, /investors/ …)
  index.html                       Homepage, a 9-part investor narrative + FAQ
  investors/  somspot/  shifaa/  fagaaro/  somsoft/  privacy/  terms/   (each an index.html)
  404.html, sitemap.xml, robots.txt, site.webmanifest, _headers
  assets/js/site-data.js           ← NON-DEVELOPERS EDIT THIS (no rebuild needed)
```

## SEO

- **Clean URLs** (`/somspot/`) with canonical tags, an XML sitemap (with priorities) and robots.txt.
- **Search-focused titles and descriptions** for every page (all checked by `tools/seo-audit.cjs`), for example "Software Development Company in Somalia" and "Find Local Businesses in Somalia".
- **Structured data (JSON-LD):** Organization, WebSite, BreadcrumbList, Service for each product, FAQPage.
- **FAQ sections** on the homepage and every product page, answering real search questions.
- **Social previews:** Open Graph + Twitter cards with a 1200×630 image.
- **Technical:** one H1 per page, semantic sections, alt text, mobile-first layout, deferred JS, no layout-blocking scripts, 404 marked `noindex`.
- **After launch:** verify the domain in Google Search Console and submit `/sitemap.xml`, add the business to Google Business Profile, and publish regular News/Insights articles. Content is the biggest long-term ranking lever. Somali-language versions of key pages (with `hreflang`) would capture Somali-language searches.

## Updating without a developer

Edit `site/assets/js/site-data.js`, upload it, and you're done:

- **Product status** (`In development` / `Testing` / `Beta` / `Launching` / `Live`) updates on every page.
- **Traction metrics**: add verified numbers only. Cards appear automatically, and the "verified metrics only" note is hidden.
- **Milestones**, **leadership** (the section stays hidden until someone is added), **social links**, **phone**, **form endpoint**.

Running `node build.mjs` afterwards is optional. It writes the same values into the HTML so search engines see them.

## Before launch: needed from Digital Dome (Guideline §11)

| Item | Where it goes |
|---|---|
| Confirm `info@` and `investors@somdigitaldome.com` exist | `site-data.js → contact` |
| Form backend (Formspree, Basin, Netlify Forms…) | `site-data.js → contact.formEndpoint`. Until it's set, the form opens the visitor's email app. |
| Confirm each product's real status | `site-data.js → status` (SomSoft is set to "Launching" and the rest to "In development". **Verify these.**) |
| Confirm milestones | `site-data.js → milestones` |
| Founder/team photos + bios | `site-data.js → leadership`, photos in `site/assets/img/team/` |
| Official logos (if different from the generated marks) | `build.mjs` → `domeMark`, `GLYPH` |
| Real app screenshots (to replace the illustrative mockups) | `build.mjs` → `mockup()` |
| Social links, HQ location | `site-data.js` |
| Legal review of Privacy Policy and Terms | `build.mjs` → `legalPage()` |
| Analytics (Plausible recommended) | Add the script in `head()` in `build.mjs`. CTA, product and form events are already tagged with `data-track`. |
| Google Search Console verification | Add the verification meta tag in `head()` in `build.mjs`, then submit the sitemap |

## Pages

Navigation follows the brief: Home, About, Products (SomSpot, Shifaa, Fagaaro, SomSoft), Investors / Partners, News / Updates, Careers, Contact.

| URL | Source |
|---|---|
| `/`, `/investors/`, product pages, legal pages | `build.mjs` + `src/content.mjs` |
| `/about/`, `/news/`, `/careers/`, `/contact/` | `src/pages-extra.mjs` |
| News posts | one JSON file per post in `content/news/` |
| Job openings | one JSON file per role in `content/careers/` (the page shows a "no open roles" message when empty) |

## Content manager (/admin)

Non-developers add news and job openings at `/admin` (Decap CMS, free and open source). Saving there commits a JSON file to the GitHub repo, and Cloudflare rebuilds the site automatically, usually within a minute.

- Editors sign in with a **GitHub account that has write access to the repo**.
- Login runs through two small Cloudflare Pages Functions in `functions/api/`. They only work on the deployed site, not in the local preview.
- To add a post without the CMS, copy a file in `content/news/` and run `node build.mjs`.

## Deploy (Cloudflare Pages)

One-time setup in the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**, and pick `mohammad-ishtiaque/dome-tech`.
2. Build settings: production branch `main`, framework preset **None**, build command `node build.mjs`, build output directory `site`.
3. **Create a GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth Apps → New):
   - Homepage URL: the site URL, e.g. `https://dome-tech.pages.dev`
   - Authorization callback URL: `https://dome-tech.pages.dev/api/callback`
4. In the Pages project → **Settings → Environment variables** (Production), add:
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (from the OAuth App; mark the secret as encrypted)
   - `CMS_BASE_URL` = the site URL, e.g. `https://dome-tech.pages.dev`
5. Redeploy. `site/_headers` applies the security and caching headers automatically.

When the site moves to `somdigitaldome.com`, add the domain under **Custom domains**, then update `CMS_BASE_URL` and the two OAuth App URLs to the new domain.

After that, every merge to `main` deploys the site, and every other branch gets a preview URL. The earlier Vercel preview (`vercel.json`) can be removed once Cloudflare is live.

## Content rules followed

- Every market statistic shows its source and date (UN WPP 2024, DataReportal Digital 2026, World Bank). Facts and derived insights are labelled separately.
- No invented metrics, partners, customers or integrations. Traction shows real milestones plus a "verified metrics only" note until numbers exist.
- No financials, forecasts or investor materials are on public pages. The data room is accessed through inquiry, call, NDA and then access.
- Product mockups are labelled "Illustrative interface concept".
