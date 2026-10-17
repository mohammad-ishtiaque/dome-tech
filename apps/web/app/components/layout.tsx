import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import type { Layout } from "~/lib/api.server";
import { DomeMark, Icon, ProductMark } from "./icons";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about/", label: "About" },
  { products: true },
  { to: "/investors/", label: "Investors / Partners" },
  { to: "/contact/", label: "Contact" },
] as const;

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Digital Dome home">
      <DomeMark />
      <span className="brand-name">Digital Dome<small>Technology Group</small></span>
    </Link>
  );
}

export function Header({ layout }: { layout: Layout }) {
  const { products, settings } = layout;
  const cta = settings.headerCta?.label ? settings.headerCta : { label: "Partner With Us", href: "/investors/#inquiry" };
  const [solid, setSolid] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drop = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setDropOpen(false); setMobileOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => { document.body.classList.toggle("nav-open", mobileOpen); }, [mobileOpen]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!drop.current?.contains(e.target as Node)) setDropOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setDropOpen(false); setMobileOpen(false); } };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={`site-header${solid ? " is-solid" : ""}`}>
        <div className="container">
          <Brand />
          <nav className="nav" aria-label="Primary">
            {NAV.map((item, i) => "products" in item ? (
              <div key={i} ref={drop} className="nav-drop" data-open={dropOpen}
                onMouseEnter={() => matchMedia("(hover: hover)").matches && setDropOpen(true)}
                onMouseLeave={() => matchMedia("(hover: hover)").matches && setDropOpen(false)}>
                <button type="button" aria-expanded={dropOpen} aria-haspopup="true" onClick={() => setDropOpen((o) => !o)}>Products <Icon name="chev" /></button>
                <div className="nav-menu">
                  {products.map((p) => (
                    <Link key={p.slug} to={`/${p.slug}/`}><ProductMark product={p} /><div><strong>{p.fullName || p.name}</strong><span>{p.role}</span></div></Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={"end" in item} className={({ isActive }) => (isActive ? "active" : undefined)}
                aria-current={location.pathname === item.to ? "page" : undefined}>{item.label}</NavLink>
            ))}
          </nav>
          <Link className="btn btn--primary btn--sm header-cta header-cta--desk" to={cta.href} data-track="CTA: Header">{cta.label}</Link>
          <Link className="btn btn--primary btn--sm header-cta header-cta--mob" to={cta.href} data-track="CTA: Header (mobile)">Invest / Partner</Link>
          <button className="nav-toggle" type="button" aria-controls="mobile-nav" aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((o) => !o)}>
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>
      <nav className={`mobile-nav${mobileOpen ? " is-open" : ""}`} id="mobile-nav" aria-label="Mobile" inert={!mobileOpen}>
        <Link to="/">Home</Link>
        <Link to="/about/">About</Link>
        <p className="label">Products</p>
        {products.map((p) => <Link key={p.slug} to={`/${p.slug}/`}><ProductMark product={p} />{p.name}</Link>)}
        <p className="label">Company</p>
        <Link to="/investors/">Investors / Partners</Link>
        <Link to="/contact/">Contact</Link>
        <Link className="btn btn--primary" to={cta.href}>Partner With Digital Dome</Link>
      </nav>
    </>
  );
}

export function Footer({ layout }: { layout: Layout }) {
  const { settings, products } = layout;
  const c = settings.contact || ({} as Layout["settings"]["contact"]);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Brand />
            <p>{settings.footerText}</p>
          </div>
          <div>
            <h4>Portfolio</h4>
            <ul>{products.map((p) => <li key={p.slug}><Link to={`/${p.slug}/`}>{p.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about/">About</Link></li>
              <li><Link to="/investors/">Investors &amp; Partners</Link></li>
              <li><Link to="/news/">News &amp; Updates</Link></li>
              <li><Link to="/careers/">Careers</Link></li>
              <li><Link to="/contact/">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              {c.email && <li><a href={`mailto:${c.email}`}>{c.email}</a></li>}
              {c.phone && <li><a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a></li>}
              {c.location && <li>{c.location}</li>}
            </ul>
            {settings.social?.length > 0 && (
              <>
                <h4 style={{ marginTop: 24 }}>Follow</h4>
                <ul>{settings.social.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener">{s.label}</a></li>)}</ul>
              </>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {settings.siteName || "Digital Dome"}. All rights reserved.</span>
          <nav aria-label="Legal"><Link to="/privacy/">Privacy Policy</Link><Link to="/terms/">Terms of Use</Link></nav>
        </div>
      </div>
    </footer>
  );
}
