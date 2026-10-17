// Renders a page's section list. Each section type has one component; the look comes from styles/site.css.
import { useState } from "react";
import { Link } from "react-router";
import type { Job, NewsPost, Section, SectionType } from "@dome/shared";
import type { Layout } from "~/lib/api.server";
import { markdown } from "~/lib/markdown";
import { JsonLd } from "~/lib/seo";
import { DomeMark, Icon, ProductMark } from "../icons";
import { InquiryForm } from "../inquiry-form";

export interface SectionContext {
  layout: Layout;
  news?: NewsPost[];
  jobs?: Job[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = { s: Section; d: any; ctx: SectionContext; num?: string };

// Section types that never get a 01/02… number.
const UNNUMBERED: SectionType[] = ["hero", "pageHero", "faq", "cta", "richText"];

export const Blobs = () => (<><span className="blob blob--1" aria-hidden="true" /><span className="blob blob--2" aria-hidden="true" /><span className="blob blob--3" aria-hidden="true" /></>);

export function SmartLink({ href, className, children, ...rest }: { href: string; className?: string; children: React.ReactNode; [k: string]: unknown }) {
  if (/^\/(?!\/)/.test(href)) return <Link to={href} className={className} prefetch="intent" {...rest}>{children}</Link>;
  const external = /^https?:/i.test(href);
  return <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener" } : {})} {...rest}>{children}</a>;
}

function Buttons({ list = [], onDark = false }: { list?: { label: string; href: string; style?: string }[]; onDark?: boolean }) {
  if (!list.length) return null;
  return (
    <div className="hero-ctas">
      {list.map((b, i) => {
        const primary = (b.style || "primary") === "primary";
        const cls = onDark ? (primary ? "btn btn--white" : "btn btn--ghost-light") : (primary ? "btn btn--primary" : "btn btn--ghost");
        return <SmartLink key={i} href={b.href} className={cls} data-track={`CTA: ${b.label}`}>{b.label}{primary && <Icon name="arrow" />}</SmartLink>;
      })}
    </div>
  );
}

function SectionHead({ s, num }: { s: Section; num?: string }) {
  if (!s.eyebrow && !s.title && !s.lead) return null;
  return (
    <div className={`section-head${s.lead && s.title ? " section-head--split" : ""} reveal`}>
      <div>
        {s.eyebrow && <span className="eyebrow">{num && <span className="num">{num}</span>}{s.eyebrow}</span>}
        {s.title && <h2>{s.title}</h2>}
      </div>
      {s.lead && <p className="lead">{s.lead}</p>}
    </div>
  );
}

const bgClass = (s: Section) => (s.background === "soft" ? "section--soft" : s.background === "blue" ? "section--dark" : "");

function Shell({ s, num, className = "", children, head = true }: { s: Section; num?: string; className?: string; children: React.ReactNode; head?: boolean }) {
  return (
    <section className={`section ${bgClass(s)} ${className}`.trim()} id={s.anchor || undefined}>
      <div className="container">
        {head && <SectionHead s={s} num={num} />}
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ hero */
const NODE_POS = [[22, 26], [78, 26], [16, 58], [84, 58], [36, 9], [64, 9]];

function Hero({ d, ctx }: Props) {
  const products = ctx.layout.products.slice(0, NODE_POS.length);
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Blobs />
      <div className="container">
        <div className="reveal is-in">
          {(d.kickerTag || d.kicker) && <span className="kicker">{d.kickerTag && <b>{d.kickerTag}</b>}{d.kicker}</span>}
          <h1 id="hero-title">{d.heading}{d.highlight && <> <span className="accent">{d.highlight}</span></>}</h1>
          {d.subheading && <p className="sub">{d.subheading}</p>}
          {d.bullets?.length > 0 && <ul className="support" aria-label="At a glance">{d.bullets.map((b: any, i: number) => <li key={i}>{b.text}</li>)}</ul>}
          <Buttons list={d.buttons} />
        </div>
        {d.visual === "image" && d.image ? (
          <img className="hero-image" src={d.image} alt="" />
        ) : (
          <div className="dome-visual" aria-label={`Digital Dome ecosystem: ${products.map((p) => p.name).join(", ")}`}>
            <svg viewBox="0 0 560 520" aria-hidden="true">
              <defs>
                <linearGradient id="domeStroke" x1="0" x2="1"><stop offset="0" stopColor="#1f7aff" stopOpacity=".1" /><stop offset=".5" stopColor="#1f7aff" /><stop offset="1" stopColor="#22c3ee" stopOpacity=".1" /></linearGradient>
                <radialGradient id="glow"><stop offset="0" stopColor="#5aa9ff" stopOpacity=".45" /><stop offset="1" stopColor="#5aa9ff" stopOpacity="0" /></radialGradient>
              </defs>
              <circle cx="280" cy="340" r="150" fill="url(#glow)" className="pulse" />
              <path className="orbit" d="M30 400a250 250 0 01500 0" />
              <path className="orbit orbit--accent" d="M80 400a200 200 0 01400 0" />
              <path className="orbit" d="M130 400a150 150 0 01300 0" />
              <path className="orbit" d="M180 400a100 100 0 01200 0" />
              <path d="M10 400h540" stroke="rgba(31,122,255,.22)" />
              {products.map((_, i) => <path key={i} d={`M280 340L${NODE_POS[i][0] * 5.6} ${NODE_POS[i][1] * 5.2}`} stroke="rgba(31,122,255,.35)" strokeDasharray="3 6" />)}
            </svg>
            {products.map((p, i) => (
              <Link key={p.slug} className="dome-node" to={`/${p.slug}/`} style={{ left: `${NODE_POS[i][0]}%`, top: `${NODE_POS[i][1]}%` }}>
                <ProductMark product={p} /><span><strong>{p.name}</strong><span>{p.channel}</span></span>
              </Link>
            ))}
            {d.chips?.[0] && <div className="hero-chip hero-chip--a"><b>{d.chips[0].value}</b><span>{d.chips[0].label}</span></div>}
            {d.chips?.[1] && <div className="hero-chip hero-chip--b"><b>{d.chips[1].value}</b><span>{d.chips[1].label}</span></div>}
            <div className="dome-core"><DomeMark /><strong>DIGITAL DOME</strong><span>Parent company</span></div>
          </div>
        )}
      </div>
      {d.showProductStrip && (
        <div className="hero-strip">
          <div className="container">
            <p>The Digital Dome portfolio</p>
            <ul>{ctx.layout.products.map((p) => <li key={p.slug}><Link to={`/${p.slug}/`}><ProductMark product={p} />{p.fullName || p.name}</Link></li>)}</ul>
          </div>
        </div>
      )}
    </section>
  );
}

function PageHero({ s, d }: Props) {
  return (
    <>
      <section className="page-hero page-hero--simple" id={s.anchor || undefined}>
        <Blobs />
        <div className={`container${d.image ? " page-hero--image" : ""}`}>
          <div>
            {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
            <h1>{s.title}</h1>
            {s.lead && <p className="sub">{s.lead}</p>}
            {d.buttons?.length > 0 && <div style={{ marginTop: 32 }}><Buttons list={d.buttons} /></div>}
          </div>
          {d.image && <img className="page-hero-img" src={d.image} alt="" />}
        </div>
      </section>
      {d.facts?.length > 0 && (
        <div className="container">
          <dl className="fact-row">{d.facts.map((f: any, i: number) => <div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------- content */
function Stats({ s, d, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <div className="stats">
        {(d.items || []).map((it: any, i: number) => (
          <article key={i} className={`stat${it.featured ? " stat--feature" : ""} reveal`}>
            <div className="stat-value"><span data-count={it.value}>{it.value}</span>{it.unit && <small>{it.unit}</small>}</div>
            {it.meter != null && it.meter !== "" && <div className="meter" role="img" aria-label={`${it.meter}%`}><i style={{ ["--w" as string]: `${it.meter}%` }} /></div>}
            {it.title && <h3>{it.title}</h3>}
            {it.text && <p>{it.text}</p>}
            {(it.source || it.tag) && (
              <div className="source">
                {it.tag && <span className={`tag${it.tag === "Insight" ? " tag--insight" : ""}`}>{it.tag}</span>}
                {it.source && <span>Source: {it.sourceUrl ? <a href={it.sourceUrl} target="_blank" rel="noopener">{it.source}</a> : it.source}</span>}
              </div>
            )}
          </article>
        ))}
      </div>
      {d.note && <p className="data-legend">{d.note}</p>}
    </Shell>
  );
}

function Cards({ s, d, num }: Props) {
  const style = d.style || "plain";
  return (
    <Shell s={s} num={num}>
      <div className={`cards cards--${style}`} style={{ ["--cols" as string]: d.columns || 3 }}>
        {(d.items || []).map((it: any, i: number) => {
          const inner = (
            <>
              {it.icon && <span className="card-icon"><Icon name={it.icon} /></span>}
              {style === "numbered" && <span className="card-num">{String(i + 1).padStart(2, "0")}</span>}
              {it.tag && <span className={`tag${/planned|future/i.test(it.tag) ? " tag--insight" : ""}`}>{it.tag}</span>}
              <h3>{it.title}</h3>
              {it.text && <p>{it.text}</p>}
              {it.href && <span className="card-link">{it.linkLabel || "Learn more"} <Icon name="arrow" /></span>}
            </>
          );
          return it.href
            ? <SmartLink key={i} href={it.href} className="card card--link reveal">{inner}</SmartLink>
            : <div key={i} className="card reveal">{inner}</div>;
        })}
      </div>
      {d.chips?.length > 0 && <ul className="sectors reveal">{d.chips.map((c: any, i: number) => <li key={i}>{c.text}</li>)}</ul>}
    </Shell>
  );
}

function ProductGrid({ s, ctx, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <div className="portfolio">
        {ctx.layout.products.map((p) => (
          <Link key={p.slug} className="pcard reveal" to={`/${p.slug}/`} style={{ ["--accent" as string]: p.color }} data-track={`Portfolio: ${p.name}`}>
            <div className="pcard-top"><ProductMark product={p} /><div><h3>{p.fullName || p.name}</h3><span className="role">{p.role}</span></div><Status value={p.status} /></div>
            {p.purpose && <p className="purpose">{p.purpose}</p>}
            <dl><div><dt>Target market</dt><dd>{p.market}</dd></div><div><dt>Monetization</dt><dd>{p.monetization}</dd></div></dl>
            <span className="more">Explore {p.name} <Icon name="arrow" /></span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

export function Status({ value }: { value?: string }) {
  const state = ({ "in development": "dev", testing: "testing", beta: "beta", launching: "launching", live: "live" } as Record<string, string>)[String(value).toLowerCase()] || "dev";
  return <span className="status" data-state={state}>{value || "In development"}</span>;
}

function Ecosystem({ s, d, ctx, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <div className="eco reveal">
        <div className="eco-parent"><DomeMark /><div><strong>DIGITAL DOME</strong>{d.parentText && <span>{d.parentText}</span>}</div></div>
        <div className="eco-lines" aria-hidden="true"><svg viewBox="0 0 1000 64" preserveAspectRatio="none"><path d="M500 0V24M500 24H125V64M500 24H375V64M500 24H625V64M500 24H875V64" /></svg></div>
        <div className="eco-brands">
          {ctx.layout.products.map((p) => (
            <Link key={p.slug} className="eco-brand" to={`/${p.slug}/`}><ProductMark product={p} /><h3>{p.fullName || p.name}</h3><p>{p.role}</p><span className="chan">{p.channel}</span></Link>
          ))}
        </div>
        {d.audiences?.length > 0 && (
          <div className="eco-audiences">
            <h3>{d.audiencesLabel || "Who we serve"}</h3>
            <ul className="chips">{d.audiences.map((a: any, i: number) => <li key={i}><i>●</i>{a.text}</li>)}</ul>
          </div>
        )}
      </div>
    </Shell>
  );
}

const MS_LABEL = { done: "Completed", current: "In progress", next: "Next" } as const;

function Traction({ s, d, ctx, num }: Props) {
  const { milestones = [], metrics = [], updatedLabel } = ctx.layout.settings;
  const lead = [s.lead, updatedLabel && `Last updated ${updatedLabel}.`].filter(Boolean).join(" ");
  return (
    <Shell s={{ ...s, lead }} num={num}>
      <div className="traction">
        <div className="reveal">
          <h3>Milestones</h3>
          <ol className="timeline">{milestones.map((m, i) => <li key={i} data-state={m.state}><span className="t-state">{MS_LABEL[m.state]}</span><span className="t-label">{m.label}</span></li>)}</ol>
        </div>
        <div className="reveal">
          {d.facts?.length > 0 && <div className="portfolio-facts">{d.facts.map((f: any, i: number) => <div key={i}><b>{f.value}</b><span>{f.label}</span></div>)}</div>}
          {metrics.length > 0 ? (
            <div className="metric-grid">{metrics.map((m, i) => <div key={i} className="metric"><b>{m.value}</b><span>{m.label}</span>{m.asOf && <small>Verified · as of {m.asOf}</small>}</div>)}</div>
          ) : (
            <div className="verify-note">
              <div className="icon"><Icon name="shield" /></div>
              <h3>{d.emptyTitle || "Verified metrics only"}</h3>
              {d.emptyText && <p>{d.emptyText}</p>}
              <SmartLink className="btn btn--outline btn--sm" href="/investors/?interest=info#inquiry">Request latest update <Icon name="arrow" /></SmartLink>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function RevenueMatrix({ s, d, ctx, num }: Props) {
  const products = ctx.layout.products;
  return (
    <Shell s={s} num={num}>
      <div className="matrix-wrap reveal">
        <table className="matrix">
          <caption className="sr-only">Revenue streams by product</caption>
          <thead><tr><th scope="col" style={{ textAlign: "left" }}>Revenue stream</th>{products.map((p) => <th key={p.slug} scope="col"><ProductMark product={p} />{p.name}</th>)}</tr></thead>
          <tbody>
            {(d.rows || []).map((r: any, i: number) => (
              <tr key={i}>
                <th scope="row">{r.name}{r.description && <small>{r.description}</small>}</th>
                {products.map((p) => {
                  const v = r.products?.[p.slug];
                  return <td key={p.slug}>{v === "core" ? <span className="dot" role="img" aria-label="Core revenue stream" /> : v === "planned" ? <span className="dot dot--future" role="img" aria-label="Planned revenue stream" /> : <span className="sr-only">Not applicable</span>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="matrix-legend"><span><i className="dot" />Core revenue stream</span><span><i className="dot dot--future" />Planned, subject to scale and product-market fit</span></div>
    </Shell>
  );
}

function Steps({ s, d, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <ol className="steps">{(d.items || []).map((it: any, i: number) => <li key={i} className="reveal"><h3>{it.title}</h3>{it.text && <p>{it.text}</p>}</li>)}</ol>
    </Shell>
  );
}

function Roadmap({ s, d, num }: Props) {
  const cls = (v: string) => (v === "highlight" ? " phase--now" : v === "muted" ? " phase--later" : "");
  return (
    <Shell s={s} num={num}>
      <div className="roadmap" style={{ ["--cols" as string]: Math.min((d.phases || []).length || 1, 4) }}>
        {(d.phases || []).map((p: any, i: number) => (
          <article key={i} className={`phase${cls(p.variant)} reveal`}>
            <div className="when"><b>{p.label}</b>{p.tag && <i>{p.tag}</i>}</div>
            {p.title && <h3>{p.title}</h3>}
            {p.text && <p>{p.text}</p>}
            {p.items?.length > 0 && <ul>{p.items.map((x: any, j: number) => <li key={j}>{x.text}</li>)}</ul>}
          </article>
        ))}
      </div>
    </Shell>
  );
}

function Table({ s, d, num }: Props) {
  const cols = (d.columns || []).map((c: any) => c.text);
  const last = cols.length - 1;
  return (
    <Shell s={s} num={num}>
      <div className="compare-wrap reveal">
        <table className="compare">
          {s.title && <caption className="sr-only">{s.title}</caption>}
          <thead><tr>{cols.map((c: string, i: number) => <th key={i} scope="col" className={d.highlightLast && i === last ? "us" : undefined}>{c}</th>)}</tr></thead>
          <tbody>
            {(d.rows || []).map((r: any, i: number) => (
              <tr key={i}>{(r.cells || []).map((c: any, j: number) => j === 0
                ? <th key={j} scope="row">{c.text}</th>
                : <td key={j} className={d.highlightLast && j === last ? "us" : undefined}>{c.text}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

function TextImage({ s, d, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <div className={`text-image${d.imagePosition === "left" ? " text-image--left" : ""}`}>
        <div className="reveal">
          <div className="prose" dangerouslySetInnerHTML={{ __html: markdown(d.body) }} />
          <div style={{ marginTop: 24 }}><Buttons list={d.buttons} onDark={s.background === "blue"} /></div>
        </div>
        {d.image && <img className="reveal" src={d.image} alt={d.imageAlt || ""} loading="lazy" />}
      </div>
    </Shell>
  );
}

function RichText({ s, d, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <div className="prose article reveal" dangerouslySetInnerHTML={{ __html: markdown(d.body) }} />
    </Shell>
  );
}

function Checklist({ s, d, num }: Props) {
  const list = <ul className={`check reveal${d.intro ? "" : " check--grid"}`}>{(d.items || []).map((it: any, i: number) => <li key={i}>{it.title && <strong>{it.title}. </strong>}{it.text}</li>)}</ul>;
  if (!d.intro && !d.button?.length) return <Shell s={s} num={num}>{list}</Shell>;
  return (
    <Shell s={s} num={num} head={false}>
      <div className="two-col">
        <div className="reveal">
          {s.eyebrow && <span className="eyebrow">{num && <span className="num">{num}</span>}{s.eyebrow}</span>}
          {s.title && <h2>{s.title}</h2>}
          {d.intro && <p className="muted">{d.intro}</p>}
          {d.button?.[0] && <SmartLink className="btn btn--dark" href={d.button[0].href}>{d.button[0].label} <Icon name="arrow" /></SmartLink>}
        </div>
        {list}
      </div>
    </Shell>
  );
}

function Screenshots({ s, d, num }: Props) {
  return (
    <Shell s={s} num={num}>
      <div className={`shots shots--${d.device || "phone"}`}>
        {(d.images || []).filter((x: any) => x.image).map((x: any, i: number) => (
          <figure key={i} className="reveal">
            {d.device === "browser"
              ? <div className="browser browser--static"><div className="browser-bar"><i /><i /><i /></div><img src={x.image} alt={x.caption || ""} loading="lazy" /></div>
              : <div className="phone phone--static"><div className="screen"><img src={x.image} alt={x.caption || ""} loading="lazy" /></div></div>}
            {x.caption && <figcaption>{x.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </Shell>
  );
}

function Faq({ s, d, num }: Props) {
  const items = (d.items || []).filter((x: any) => x.question && x.answer);
  return (
    <Shell s={s} num={num}>
      <div className="faq reveal">
        {items.map((x: any, i: number) => <details key={i} open={i === 0}><summary>{x.question}</summary><p>{x.answer}</p></details>)}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((x: any) => ({ "@type": "Question", name: x.question, acceptedAnswer: { "@type": "Answer", text: x.answer } })) }} />
    </Shell>
  );
}

function Cta({ s, d }: Props) {
  return (
    <section className={`section ${bgClass(s)}`.trim()} id={s.anchor || undefined}>
      <div className="container">
        {d.variant === "milestone" ? (
          <div className="next-ms reveal">
            <div className="icon"><Icon name="flag" /></div>
            <div><h3>{s.title}</h3>{s.lead && <p>{s.lead}</p>}</div>
            {d.buttons?.[0] && <SmartLink className="btn btn--white btn--sm" href={d.buttons[0].href}>{d.buttons[0].label}</SmartLink>}
          </div>
        ) : (
          <div className="cta-band reveal">
            <div>{s.title && <h2>{s.title}</h2>}{s.lead && <p>{s.lead}</p>}</div>
            <div className="actions"><Buttons list={d.buttons} onDark /></div>
          </div>
        )}
      </div>
    </section>
  );
}

function Inquiry({ s, d, ctx, num }: Props) {
  const [interest, setInterest] = useState<string | undefined>();
  const dark = s.background === "blue";
  const contact = ctx.layout.settings.contact || {};
  const formId = `${s.anchor || s.id}-form`;
  const choose = (v: string) => {
    setInterest(v);
    document.getElementById(formId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => document.getElementById(`${formId}-name`)?.focus({ preventScroll: true }), 400);
  };
  return (
    <section className={`section ${dark ? "invest" : "inquiry--light"}`} id={s.anchor || undefined}>
      <div className="container invest-grid">
        <div className="reveal">
          {s.eyebrow && <span className="eyebrow">{num && <span className="num">{num}</span>}{s.eyebrow}</span>}
          {s.title && <h2>{s.title}</h2>}
          {s.lead && <p className="lead">{s.lead}</p>}
          {d.paths?.length > 0 && (
            <div className="paths">
              {d.paths.map((p: any, i: number) => (
                <button key={i} className="path" type="button" aria-pressed={interest === p.interest} onClick={() => choose(p.interest)} data-track={`CTA: ${p.title}`}>
                  <span className="icon"><Icon name={["trend", "hand", "doc", "mail"][i] || "arrow"} /></span>
                  <span><strong>{p.title}</strong>{p.text && <span>{p.text}</span>}</span>
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          )}
          {d.showContactDetails && (
            <dl className="contact-details">
              {contact.email && <div><dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>}
              {contact.phone && <div><dt>Phone</dt><dd><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></dd></div>}
              {contact.location && <div><dt>Location</dt><dd>{contact.location}</dd></div>}
            </dl>
          )}
        </div>
        <div className="reveal"><InquiryForm id={formId} title={d.formTitle} text={d.formText} interest={interest} /></div>
      </div>
    </section>
  );
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function NewsList({ s, d, ctx, num }: Props) {
  const list = (ctx.news || []).slice(0, d.limit > 0 ? d.limit : undefined);
  return (
    <Shell s={s} num={num}>
      {list.length ? (
        <div className="news-grid">
          {list.map((n) => (
            <Link key={n.slug} className="news-card reveal" to={`/news/${n.slug}/`} prefetch="intent">
              <time dateTime={n.date}>{fmtDate(n.date)}</time><h3>{n.title}</h3>{n.summary && <p>{n.summary}</p>}<span className="more">Read update <Icon name="arrow" /></span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty reveal"><h2>No updates yet</h2><p>Launch and partnership news will be published here. For anything else, <Link to="/contact/">get in touch</Link>.</p></div>
      )}
    </Shell>
  );
}

function JobsList({ s, d, ctx, num }: Props) {
  const jobs = ctx.jobs || [];
  const email = ctx.layout.settings.contact?.email;
  return (
    <Shell s={s} num={num}>
      {jobs.length ? (
        <div className="jobs">
          {jobs.map((j) => (
            <details key={j._id} className="job reveal">
              <summary><span><strong>{j.title}</strong><span className="job-meta">{[j.location, j.type].filter(Boolean).join(" · ")}</span></span></summary>
              <div className="job-body">
                {j.summary && <p>{j.summary}</p>}
                <div className="prose" dangerouslySetInnerHTML={{ __html: markdown(j.body) }} />
                {email && <a className="btn btn--primary btn--sm" href={`mailto:${email}?subject=${encodeURIComponent(`Application: ${j.title}`)}`}>Apply by email <Icon name="arrow" /></a>}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="empty reveal">
          <h3>{d.emptyTitle || "There are no open roles right now"}</h3>
          {d.emptyText && <p>{d.emptyText}</p>}
          {email && <a className="btn btn--primary btn--sm" href={`mailto:${email}?subject=${encodeURIComponent("Introducing myself to Digital Dome")}`}>Introduce yourself <Icon name="arrow" /></a>}
        </div>
      )}
    </Shell>
  );
}

function Team({ s, ctx, num }: Props) {
  const team = ctx.layout.settings.team || [];
  return (
    <Shell s={s} num={num}>
      <div className="team">
        {team.map((p, i) => (
          <article key={i} className="person reveal">
            {p.photo && <img src={p.photo} alt={`${p.name}, ${p.role}`} loading="lazy" width={480} height={408} />}
            <div>
              <h3>{p.name}</h3><span className="role">{p.role}</span>
              {p.bio && <p>{p.bio}</p>}
              {p.linkedin && <p><a href={p.linkedin} target="_blank" rel="noopener">LinkedIn</a></p>}
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}

const COMPONENTS: Record<SectionType, React.ComponentType<Props>> = {
  hero: Hero, pageHero: PageHero, stats: Stats, cards: Cards, productGrid: ProductGrid, ecosystem: Ecosystem,
  traction: Traction, revenueMatrix: RevenueMatrix, steps: Steps, roadmap: Roadmap, table: Table, textImage: TextImage,
  richText: RichText, checklist: Checklist, screenshots: Screenshots, faq: Faq, cta: Cta, inquiry: Inquiry,
  newsList: NewsList, jobsList: JobsList, team: Team,
};

/** Whether a section has anything to show (e.g. Leadership is skipped until team members exist). */
function isEmpty(s: Section, ctx: SectionContext) {
  return s.type === "team" && !(ctx.layout.settings.team || []).length;
}

/** Sections that need extra data from the API. */
export const needsNews = (sections: Section[]) => sections.some((s) => s.type === "newsList");
export const needsJobs = (sections: Section[]) => sections.some((s) => s.type === "jobsList");

export function Sections({ sections, ctx, numbered }: { sections: Section[]; ctx: SectionContext; numbered?: boolean }) {
  let n = 0;
  return (
    <>
      {sections.map((s) => {
        const C = COMPONENTS[s.type];
        if (!C || s.hidden || isEmpty(s, ctx)) return null;
        const num = numbered && s.eyebrow && !UNNUMBERED.includes(s.type) ? String(++n).padStart(2, "0") : undefined;
        return <C key={s.id} s={s} d={s.data || {}} ctx={ctx} num={num} />;
      })}
    </>
  );
}

/** Pitch-rail entries (numbered sections with an anchor). */
export function railItems(sections: Section[], ctx: SectionContext) {
  return sections.filter((s) => !s.hidden && !isEmpty(s, ctx) && s.anchor && s.eyebrow && !UNNUMBERED.includes(s.type)).map((s) => ({ id: s.anchor!, label: s.eyebrow! }));
}
