import { Link } from "react-router";
import type { Product } from "@dome/shared";
import { Icon, ProductMark } from "./icons";
import { Blobs, SmartLink, Status } from "./sections";

const CONCEPT_BODY: Record<string, React.ReactNode> = {
  list: (
    <>
      <div className="chiprow"><span>Food</span><span>Clinics</span><span>Hotels</span><span>Shops</span></div>
      <div className="ui-sec">Popular nearby</div>
      {[["R", "Restaurant", "Hodan · Open now", "★ 4.8"], ["P", "Pharmacy", "Wadajir · 0.8 km", "Open"], ["H", "Hotel", "Lido area · 1.2 km", "★ 4.6"], ["E", "Electronics", "Bakara · 2.0 km", "Mobile money"]].map(([a, b, c, d]) => (
        <div key={b} className="ui-card"><span className="ui-thumb">{a}</span><span><b>{b}</b><i>{c}</i></span><span className="pill">{d}</span></div>
      ))}
    </>
  ),
  profiles: (
    <>
      <div className="ui-sec">Available practitioners</div>
      {[["A", "Somali · Arabic · Remote"], ["M", "Somali · In person"], ["Y", "Somali · English · Remote"]].map(([a, c]) => (
        <div key={a} className="ui-card"><span className="ui-thumb">{a}</span><span><b>Practitioner profile</b><i>{c}</i></span><span className="pill">Vetted</span></div>
      ))}
      <div className="ui-card"><span><b>Private session</b><i>Choose a time · Pay with mobile money</i></span></div>
      <span className="ui-btn">Request booking</span>
    </>
  ),
  event: (
    <>
      <div className="ui-hero"><span className="live">LIVE</span><b>Community Q&amp;A Session</b><span>Hosted live · Interactive</span></div>
      <div className="ui-sec">Upcoming events</div>
      {[["T", "Youth & Tech Talk", "Sat · 8:00 PM EAT", "Paid"], ["B", "Business Forum", "Sun · 6:00 PM EAT", "Free"]].map(([a, b, c, d]) => (
        <div key={b} className="ui-card"><span className="ui-thumb">{a}</span><span><b>{b}</b><i>{c}</i></span><span className="pill">{d}</span></div>
      ))}
      <span className="ui-btn">Get ticket · Mobile money</span>
    </>
  ),
};

function Mockup({ p }: { p: Product }) {
  const m = p.mockup || { device: "phone" };
  const style = { ["--accent" as string]: p.color };
  if (m.device === "browser") {
    return (
      <figure className="device-stage" style={style}>
        <div className="browser" aria-hidden={!m.screenshot}>
          <div className="browser-bar"><i /><i /><i /><span>{p.name} · {m.title || "Business dashboard"}</span></div>
          {m.screenshot ? <img src={m.screenshot} alt={`${p.name} screenshot`} /> : (
            <div className="dash">
              <div className="dash-side"><span /><span /><span /><span /><span /></div>
              <div className="dash-main">
                <div className="dash-kpis"><div><i /><b>Orders</b></div><div><i /><b>Stock</b></div><div><i /><b>Payments</b></div></div>
                <div className="dash-chart">{[40, 62, 48, 75, 58, 86, 70, 94].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div>
                <div className="dash-rows"><span /><span style={{ width: "80%" }} /><span style={{ width: "65%" }} /></div>
              </div>
            </div>
          )}
        </div>
        {!m.screenshot && <figcaption>Illustrative interface concept</figcaption>}
      </figure>
    );
  }
  return (
    <figure className="device-stage" style={style}>
      <div className="phone" aria-hidden={!m.screenshot}>
        <div className="screen">
          {m.screenshot ? <img src={m.screenshot} alt={`${p.name} app screen`} /> : (
            <>
              <div className="screen-head">
                <div className="t">{m.title || p.name}</div><div className="s">{m.subtitle || p.role}</div>
                {m.concept === "list" && <div className="screen-search">Search restaurants, clinics…</div>}
              </div>
              <div className="screen-body">{CONCEPT_BODY[m.concept || "list"] || CONCEPT_BODY.list}</div>
              <div className="ui-tabbar"><span /><span /><span /><span /></div>
            </>
          )}
        </div>
      </div>
      {!m.screenshot && <figcaption>Illustrative interface concept</figcaption>}
    </figure>
  );
}

export function ProductHero({ p }: { p: Product }) {
  return (
    <>
      <section className="page-hero" style={{ ["--accent" as string]: p.color }} aria-labelledby="p-title">
        <Blobs />
        <div className="container">
          <div>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link to="/">Digital Dome</Link><span aria-hidden="true">/</span><Link to="/#portfolio">Portfolio</Link><span aria-hidden="true">/</span>
              <span aria-current="page" className="crumb-current">{p.name}</span>
            </nav>
            <div className="ptitle"><ProductMark product={p} /><span className="label">A Digital Dome product<b>{p.role}</b></span></div>
            <h1 id="p-title">{p.fullName || p.name}</h1>
            <p className="sub">{p.promise}</p>
            {p.heroButtons?.length > 0 && (
              <div className="hero-ctas" style={{ marginTop: 32 }}>
                {p.heroButtons.map((b, i) => (
                  <SmartLink key={i} href={b.href} className={(b.style || "primary") === "primary" ? "btn btn--primary" : "btn btn--ghost"} data-track={`CTA: ${p.name} ${b.label}`}>
                    {b.label}{(b.style || "primary") === "primary" && <Icon name="arrow" />}
                  </SmartLink>
                ))}
              </div>
            )}
          </div>
          <Mockup p={p} />
        </div>
      </section>
      <div className="container" style={{ ["--accent" as string]: p.color }}>
        <dl className="fact-row">
          <div><dt>Status</dt><dd><Status value={p.status} /></dd></div>
          <div><dt>Users</dt><dd>{p.market}</dd></div>
          <div><dt>Revenue model</dt><dd>{p.monetization}</dd></div>
          <div><dt>Channel</dt><dd>{p.channel}</dd></div>
        </dl>
      </div>
    </>
  );
}

export function ProductNav({ products, current }: { products: { slug: string; name: string; role: string; color: string; icon?: Product["icon"]; logo?: string }[]; current: string }) {
  return (
    <section className="section section--soft" aria-label="Explore the portfolio">
      <div className="container">
        <h2 style={{ fontSize: "1.4rem", marginBottom: 24 }}>Explore the Digital Dome portfolio</h2>
        <nav className="pnav">
          {products.map((q) => (
            <Link key={q.slug} to={`/${q.slug}/`} style={{ ["--accent" as string]: q.color }} aria-current={q.slug === current ? "page" : undefined}>
              <ProductMark product={q} /><div>{q.name}<span>{q.role}</span></div>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
