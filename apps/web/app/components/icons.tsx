import { useId } from "react";
import type { ProductIcon } from "@dome/shared";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PATHS: Record<string, React.ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chev: <path d="M6 9l6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>,
  map: <><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M16 14.5h2" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8" /></>,
  building: <path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01" />,
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
  trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  hand: <><path d="M8 13l3 3a2 2 0 003 0l5-5a2 2 0 000-3l-2-2-3 3" /><path d="M3 10l4-4 4 1 2-2M3 10l5 5M21 8l-3-3" /></>,
  doc: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>,
  rocket: <><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 5-9 12-9 0 7-5 11-9 12z" /><circle cx="14.5" cy="9.5" r="1.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  if (!PATHS[name]) return null;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>{PATHS[name]}</svg>;
}

/** Digital Dome logo mark without the wordmark: navy dome, cloud and phone with a chip (2:1). */
export function DomeMark({ className = "brand-mark" }: { className?: string }) {
  const id = useId();
  return (
    <svg className={className} viewBox="300 192 424 213" aria-hidden="true">
      <defs><clipPath id={id}><rect x="300" y="150" width="424" height="254" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <path d="M306 404a206 206 0 0 1 412 0z" fill="#171547" />
        <g fill="#fff"><circle cx="504" cy="318" r="88" /><circle cx="416" cy="372" r="62" /><circle cx="594" cy="368" r="76" /><rect x="416" y="330" width="178" height="80" /></g>
        <g fill="#1abfef"><circle cx="504" cy="318" r="75" /><circle cx="416" cy="372" r="49" /><circle cx="594" cy="368" r="63" /><rect x="416" y="330" width="178" height="80" /></g>
        <rect x="453" y="287" width="110" height="130" rx="14" fill="#fff" />
        <rect x="466" y="300" width="85" height="120" rx="4" fill="#171547" />
        <path d="M466 322.5h85" stroke="#fff" strokeWidth="5" />
        <rect x="484" y="346" width="48" height="48" fill="#fff" />
        <rect x="494" y="356" width="28" height="28" fill="none" stroke="#171547" strokeWidth="4" />
        <path d="M491 334v12M505 334v12M519 334v12M491 394v12M505 394v12M519 394v12M469 355.5h15M469 369.5h15M469 383.5h15M532 355.5h16M532 369.5h16M532 383.5h16" stroke="#fff" strokeWidth="4" />
      </g>
    </svg>
  );
}

const GLYPHS: Record<ProductIcon, React.ReactNode> = {
  pin: <><path d="M24 36s-8-6.4-8-12.4a8 8 0 1116 0C32 29.6 24 36 24 36z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><circle cx="24" cy="23.5" r="2.8" fill="#fff" /></>,
  heart: <><path d="M24 35s-10-6-10-13a5.5 5.5 0 0110-3.2A5.5 5.5 0 0134 22c0 7-10 13-10 13z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><path d="M20 23.5h8" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>,
  broadcast: <><path d="M21 18.5v11l9-5.5z" fill="#fff" /><path d="M14.5 15.5a13 13 0 000 18M33.5 15.5a13 13 0 010 18" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>,
  code: <path d="M19 17l-7 7 7 7M29 17l7 7-7 7M26 14l-4 20" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
  star: <path d="M24 13l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L24 29.5l-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />,
  chart: <path d="M15 33V24M22 33V16M29 33v-6M36 33V19" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />,
};

/** Product icon: the uploaded logo, or a generated mark in the product color. */
export function ProductMark({ product, className = "pmark" }: { product: { icon?: ProductIcon; color: string; logo?: string; name: string }; className?: string }) {
  if (product.logo) return <img className={className} src={product.logo} alt="" width={48} height={48} style={{ objectFit: "cover" }} />;
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill={product.color} />
      {GLYPHS[product.icon || "star"]}
    </svg>
  );
}
