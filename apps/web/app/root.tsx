import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/root";
import { api } from "./lib/api.server";
import { useSiteEffects } from "./lib/effects";
import { Footer, Header } from "./components/layout";
import { Blobs } from "./components/sections";
import "./styles/site.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" },
];

export async function loader() {
  return { layout: await api.layout() };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <html lang="en" className="no-js">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#eaf4ff" />
        <Meta />
        <Links />
      </head>
      <body>
        {data?.layout && <Header layout={data.layout} />}
        <main id="main">{children}</main>
        {data?.layout && <Footer layout={data.layout} />}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useSiteEffects();
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const detail = isRouteErrorResponse(error) ? (typeof error.data === "string" ? error.data : "") : import.meta.env.DEV && error instanceof Error ? error.message : "";
  return (
    <section className="page-hero" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <Blobs />
      <div className="container">
        <div>
          <span className="eyebrow">{notFound ? "404" : "Something went wrong"}</span>
          <h1>{notFound ? "This page doesn’t exist." : "We couldn’t load this page."}</h1>
          <p className="sub">{notFound ? "The link may be outdated. Everything about Digital Dome starts from the homepage." : detail || "Please try again in a moment."}</p>
          <div className="hero-ctas" style={{ marginTop: 28 }}>
            <Link className="btn btn--primary" to="/">Go to homepage</Link>
            <Link className="btn btn--ghost" to="/contact/">Contact us</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
