import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { opts, type Field, type Job } from "@dome/shared";
import { api } from "../api";
import { useDraft, useLoad } from "../hooks";
import { FieldGroup } from "../components/fields";
import { Empty, ErrorBox, Loading, PageHeader, SaveBar, useToast } from "../components/ui";

const FIELDS: Field[] = [
  { key: "title", label: "Job title", type: "text", required: true },
  { key: "location", label: "Location", type: "text", help: "e.g. Mogadishu or Remote" },
  { key: "type", label: "Type", type: "select", options: opts(["Full-time", "Full-time"], ["Part-time", "Part-time"], ["Contract", "Contract"], ["Internship", "Internship"]) },
  { key: "summary", label: "Short summary", type: "textarea" },
  { key: "body", label: "Description", type: "markdown", help: "Responsibilities, requirements, how to apply. Use - for lists and ## for headings." },
  { key: "open", label: "Show on the Careers page", type: "boolean" },
];

export function JobsList() {
  const { data, error, reload } = useLoad<Job[]>("/jobs");
  const navigate = useNavigate();
  const toast = useToast();
  const create = async () => {
    try { const j = await api.post<Job>("/jobs", { title: "New role", body: "", open: false, order: data?.length || 0 }); navigate(`/careers/${j._id}`); }
    catch (e) { toast((e as Error).message, "err"); }
  };
  const remove = async (j: Job) => {
    if (!confirm(`Delete “${j.title}”?`)) return;
    try { await api.del(`/jobs/${j._id}`); toast("Role deleted"); reload(); } catch (e) { toast((e as Error).message, "err"); }
  };
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader title="Careers" subtitle="When no roles are open, the Careers page invites people to introduce themselves." actions={<button className="btn btn--primary" onClick={create}>+ New role</button>} />
      {data.length === 0 ? <Empty>No roles yet.</Empty> : (
        <div className="panel">
          <table className="table">
            <thead><tr><th>Role</th><th>Location</th><th>Status</th><th /></tr></thead>
            <tbody>{data.map((j) => (
              <tr key={j._id}>
                <td><Link className="row-link" to={`/careers/${j._id}`}>{j.title}</Link><br /><small className="muted">{j.type}</small></td>
                <td>{j.location}</td>
                <td><span className={`pill${j.open ? "" : " pill--archived"}`}>{j.open ? "Open" : "Hidden"}</span></td>
                <td className="row-actions"><Link className="btn btn--sm" to={`/careers/${j._id}`}>Edit</Link><button className="btn btn--sm btn--ghost" onClick={() => remove(j)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function JobEdit() {
  const { id } = useParams();
  const { data, error, reload } = useLoad<Job>(`/jobs/${id}`);
  const { draft, setDraft, dirty, markSaved } = useDraft<Job>(data);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!draft) return <Loading />;
  const save = async () => {
    setSaving(true);
    try { markSaved(await api.put<Job>(`/jobs/${draft._id}`, draft)); toast("Role saved"); }
    catch (e) { toast((e as Error).message, "err"); }
    finally { setSaving(false); }
  };
  return (
    <>
      <PageHeader back={<Link to="/careers" className="back">← Careers</Link>} title={draft.title || "New role"} subtitle={draft.open ? "Visible on the Careers page" : "Hidden from the website"} />
      <div className="panel"><FieldGroup fields={FIELDS} value={draft} onChange={(v) => setDraft((d) => ({ ...d, ...v }) as Job)} /></div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </>
  );
}
