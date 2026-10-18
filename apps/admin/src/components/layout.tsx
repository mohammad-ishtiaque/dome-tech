import { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router";
import { SITE_URL } from "../api";
import { useAuth } from "../auth";
import { useLoad } from "../hooks";
import { ProductsContext, type ProductRef } from "./fields";
import { Loading } from "./ui";

const NAV = [
  { to: "/", label: "Overview", icon: "◧", end: true },
  { to: "/pages", label: "Pages", icon: "▤" },
  { to: "/products", label: "Products", icon: "◆" },
  { to: "/news", label: "News", icon: "✎" },
  { to: "/careers", label: "Careers", icon: "◎" },
  { to: "/inquiries", label: "Inquiries", icon: "✉" },
  { to: "/media", label: "Media", icon: "▣" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export function Shell() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const products = useLoad<ProductRef[]>(user ? "/products" : null);
  const overview = useLoad<{ newInquiries: number }>(user ? "/overview" : null);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <ProductsContext.Provider value={products.data || []}>
      <div className={`shell${menu ? " menu-open" : ""}`}>
        <aside className="sidebar">
          <Link to="/" className="brand" onClick={() => setMenu(false)}>
            <img src="/logo.svg" alt="Digital Dome Technology Group" width={78} height={60} />
            <span>Dashboard</span>
          </Link>
          <nav aria-label="Dashboard">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenu(false)}>
                <span className="nav-icon" aria-hidden="true">{n.icon}</span>{n.label}
                {n.to === "/inquiries" && !!overview.data?.newInquiries && <span className="badge">{overview.data.newInquiries}</span>}
              </NavLink>
            ))}
            {user.role === "admin" && <NavLink to="/users" onClick={() => setMenu(false)}><span className="nav-icon" aria-hidden="true">☺</span>Users</NavLink>}
          </nav>
          <div className="sidebar-foot">
            <a href={SITE_URL} target="_blank" rel="noopener" className="btn btn--sm btn--block">View website ↗</a>
            <NavLink to="/account" className="who" onClick={() => setMenu(false)}><strong>{user.name}</strong><small>{user.email}</small></NavLink>
            <button type="button" className="btn btn--sm btn--ghost btn--block" onClick={logout}>Sign out</button>
          </div>
        </aside>
        <div className="main">
          <div className="topbar">
            <button type="button" className="icon-btn" onClick={() => setMenu((m) => !m)} aria-label="Menu">☰</button>
            <strong>Digital Dome</strong>
          </div>
          {import.meta.env.VITE_DEMO === "1" && <PreviewBanner />}
          <main><Outlet context={{ refreshCounts: overview.reload, refreshProducts: products.reload }} /></main>
        </div>
      </div>
    </ProductsContext.Provider>
  );
}

export interface ShellContext { refreshCounts: () => void; refreshProducts: () => void }

function PreviewBanner() {
  return (
    <div className="preview-banner" role="note">
      <span><strong>Preview mode.</strong> Try anything: changes are saved only in your browser and don’t affect the live website.</span>
      <button type="button" className="btn btn--sm" onClick={async () => { const { resetDemo } = await import("../demo/mock"); if (confirm("Reset the preview to its original content?")) resetDemo(); }}>Reset preview</button>
    </div>
  );
}
