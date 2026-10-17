import { Link } from "react-router";
import type { Inquiry } from "@dome/shared";
import { useAuth } from "../auth";
import { useLoad } from "../hooks";
import { ErrorBox, Loading, PageHeader, fmtDate } from "../components/ui";

interface Overview { pages: number; products: number; news: number; jobs: number; newInquiries: number; inquiries: number; recent: Inquiry[] }

export function Overview() {
  const { user } = useAuth();
  const { data, error, reload } = useLoad<Overview>("/overview");
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!data) return <Loading />;
  const cards = [
    { to: "/inquiries", label: "New inquiries", value: data.newInquiries, hint: `${data.inquiries} in total`, highlight: data.newInquiries > 0 },
    { to: "/pages", label: "Pages", value: data.pages, hint: "Edit any page’s sections" },
    { to: "/products", label: "Products", value: data.products, hint: "Content, colors, screenshots" },
    { to: "/news", label: "News posts", value: data.news, hint: "Updates & announcements" },
    { to: "/careers", label: "Open roles", value: data.jobs, hint: "Shown on the Careers page" },
  ];
  return (
    <>
      <PageHeader title={`Welcome, ${user?.name.split(" ")[0]}`} subtitle="Everything on the website can be changed from here. Saved changes go live immediately." />
      <div className="stat-cards">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className={`stat-card${c.highlight ? " is-highlight" : ""}`}>
            <span>{c.label}</span><b>{c.value}</b><small>{c.hint}</small>
          </Link>
        ))}
      </div>
      <section className="panel">
        <div className="panel-head"><h2>Latest inquiries</h2><Link to="/inquiries">View all →</Link></div>
        {data.recent.length === 0 ? <p className="muted">No inquiries yet. Messages from the website’s contact forms appear here.</p> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Interest</th><th>Received</th><th>Status</th></tr></thead>
            <tbody>
              {data.recent.map((q) => (
                <tr key={q._id}><td><strong>{q.name}</strong><br /><small className="muted">{q.email}</small></td><td>{q.interest}</td><td>{fmtDate(q.createdAt)}</td><td><span className={`pill pill--${q.status}`}>{q.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
