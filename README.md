# Digital Dome: somdigitaldome.com

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

## Deploy

**Live on Vercel:** https://dome-tech.vercel.app (project `dome-tech`). `vercel.json` builds with `node build.mjs`, serves `site/`, and applies the security and caching headers. To redeploy after changes:

```bash
npx vercel@latest deploy --prod
```

To use the real domain, add `somdigitaldome.com` under Vercel → Project → Settings → Domains and update the DNS records at the registrar.

Any other static host also works. Netlify and Cloudflare Pages read `site/_headers` (HSTS, CSP, nosniff, frame-deny, caching) automatically. Publish directory: `site`. If you add Plausible or a form provider other than Formspree, add its domain to the CSP in `_headers`.

## Content rules followed

- Every market statistic shows its source and date (UN WPP 2024, DataReportal Digital 2026, World Bank). Facts and derived insights are labelled separately.
- No invented metrics, partners, customers or integrations. Traction shows real milestones plus a "verified metrics only" note until numbers exist.
- No financials, forecasts or investor materials are on public pages. The data room is accessed through inquiry, call, NDA and then access.
- Product mockups are labelled "Illustrative interface concept".
