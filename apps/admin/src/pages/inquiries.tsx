import { useState } from "react";
import { useOutletContext } from "react-router";
import type { Inquiry } from "@dome/shared";
import { api } from "../api";
import { useLoad } from "../hooks";
import type { ShellContext } from "../components/layout";
import { Empty, ErrorBox, Loading, PageHeader, fmtDate, useToast } from "../components/ui";

const INTERESTS: Record<string, string> = {
  invest: "Investing", info: "Investor information", telecom: "Telecom / mobile money", strategic: "Strategic partnership",
  enterprise: "SomSoft project", media: "Media / ecosystem", general: "General question",
};
const FILTERS = [["new", "New"], ["read", "Read"], ["archived", "Archived"], ["", "All"]] as const;

export function Inquiries() {
  const [filter, setFilter] = useState<string>("new");
  const { data, setData, error, reload } = useLoad<Inquiry[]>(`/inquiries${filter ? `?status=${filter}` : ""}`);
  const [open, setOpen] = useState<string | null>(null);
  const toast = useToast();
  const { refreshCounts } = useOutletContext<ShellContext>();

  const setStatus = async (q: Inquiry, status: Inquiry["status"]) => {
    try { await api.patch(`/inquiries/${q._id}`, { status }); reload(); refreshCounts(); } catch (e) { toast((e as Error).message, "err"); }
  };
  const remove = async (q: Inquiry) => {
    if (!confirm(`Delete the message from ${q.name}? This can’t be undone.`)) return;
    try { await api.del(`/inquiries/${q._id}`); toast("Inquiry deleted"); reload(); refreshCounts(); } catch (e) { toast((e as Error).message, "err"); }
  };
  // Opening a new message marks it read but keeps it in the current list until the next visit.
  const toggle = async (q: Inquiry) => {
    setOpen(open === q._id ? null : q._id!);
    if (q.status !== "new") return;
    setData((list) => list && list.map((x) => (x._id === q._id ? { ...x, status: "read" } : x)));
    try { await api.patch(`/inquiries/${q._id}`, { status: "read" }); refreshCounts(); } catch { /* stays marked locally */ }
  };

  return (
    <>
      <PageHeader title="Inquiries" subtitle="Messages sent through the website’s contact and investor forms." />
      <div className="tabs" role="tablist">
        {FILTERS.map(([k, l]) => <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>{l}</button>)}
      </div>
      {error ? <ErrorBox text={error} retry={reload} /> : !data ? <Loading /> : data.length === 0 ? <Empty>No {filter || ""} inquiries.</Empty> : (
        <div className="inquiry-list">
          {data.map((q) => (
            <div key={q._id} className={`inquiry${q.status === "new" ? " is-new" : ""}${open === q._id ? " is-open" : ""}`}>
              <button type="button" className="inquiry-head" onClick={() => toggle(q)} aria-expanded={open === q._id}>
                <span className="grow"><strong>{q.name}</strong>{q.org && <span className="muted"> · {q.org}</span>}<br /><small className="muted">{INTERESTS[q.interest] || q.interest}</small></span>
                <small className="muted">{fmtDate(q.createdAt)}</small>
                <span className={`pill pill--${q.status}`}>{q.status}</span>
              </button>
              {open === q._id && (
                <div className="inquiry-body">
                  <dl>
                    <div><dt>Email</dt><dd><a href={`mailto:${q.email}`}>{q.email}</a></dd></div>
                    <div><dt>Interest</dt><dd>{INTERESTS[q.interest] || q.interest}</dd></div>
                    {q.page && <div><dt>Sent from</dt><dd>{q.page}</dd></div>}
                  </dl>
                  <p className="message">{q.message || <span className="muted">No message.</span>}</p>
                  <div className="actions">
                    <a className="btn btn--primary btn--sm" href={`mailto:${q.email}?subject=${encodeURIComponent("Re: your inquiry to Digital Dome")}`}>Reply by email</a>
                    {q.status !== "archived" ? <button className="btn btn--sm" onClick={() => setStatus(q, "archived")}>Archive</button> : <button className="btn btn--sm" onClick={() => setStatus(q, "read")}>Move to inbox</button>}
                    {q.status === "read" && <button className="btn btn--sm btn--ghost" onClick={() => setStatus(q, "new")}>Mark as new</button>}
                    <button className="btn btn--sm btn--ghost" onClick={() => remove(q)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
