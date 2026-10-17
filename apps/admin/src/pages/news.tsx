import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Field, NewsPost } from "@dome/shared";
import { api, SITE_URL } from "../api";
import { useDraft, useLoad } from "../hooks";
import { FieldGroup } from "../components/fields";
import { Empty, ErrorBox, Loading, PageHeader, SaveBar, useToast } from "../components/ui";
import { slugify } from "./pages";

const FIELDS: Field[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "slug", label: "Address (/news/…/)", type: "text", required: true },
  { key: "summary", label: "Short summary", type: "textarea", help: "1–2 sentences. Used on the news list and in Google." },
  { key: "image", label: "Cover image (optional)", type: "image" },
  { key: "body", label: "Article", type: "markdown", help: "Use ## for headings, - for lists, **bold**, [link text](https://…)." },
  { key: "published", label: "Published (visible on the website)", type: "boolean" },
];
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function NewsList() {
  const { data, error, reload } = useLoad<NewsPost[]>("/news");
  const navigate = useNavigate();
  const toast = useToast();
  const create = async () => {
    try {
      const n = await api.post<NewsPost>("/news", { title: "Untitled update", slug: `update-${Date.now().toString(36)}`, date: new Date().toISOString(), summary: "", body: "", published: false });
      navigate(`/news/${n._id}`);
    } catch (e) { toast((e as Error).message, "err"); }
  };
  const remove = async (n: NewsPost) => {
    if (!confirm(`Delete “${n.title}”?`)) return;
    try { await api.del(`/news/${n._id}`); toast("Post deleted"); reload(); } catch (e) { toast((e as Error).message, "err"); }
  };
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader title="News & updates" subtitle="Posts appear on the News page, newest first." actions={<button className="btn btn--primary" onClick={create}>+ New post</button>} />
      {data.length === 0 ? <Empty>No posts yet.</Empty> : (
        <div className="panel">
          <table className="table">
            <thead><tr><th>Title</th><th>Date</th><th>Status</th><th /></tr></thead>
            <tbody>{data.map((n) => (
              <tr key={n._id}>
                <td><Link className="row-link" to={`/news/${n._id}`}>{n.title}</Link></td>
                <td>{fmt(n.date)}</td>
                <td><span className={`pill${n.published ? "" : " pill--archived"}`}>{n.published ? "Published" : "Draft"}</span></td>
                <td className="row-actions"><Link className="btn btn--sm" to={`/news/${n._id}`}>Edit</Link><button className="btn btn--sm btn--ghost" onClick={() => remove(n)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function NewsEdit() {
  const { id } = useParams();
  const { data, error, reload } = useLoad<NewsPost>(`/news/${id}`);
  const { draft, setDraft, dirty, markSaved } = useDraft<NewsPost>(data);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!draft) return <Loading />;
  const save = async () => {
    setSaving(true);
    try { markSaved(await api.put<NewsPost>(`/news/${draft._id}`, draft)); toast(draft.published ? "Post saved — live on the website" : "Draft saved"); }
    catch (e) { toast((e as Error).message, "err"); }
    finally { setSaving(false); }
  };
  return (
    <>
      <PageHeader back={<Link to="/news" className="back">← News</Link>} title={draft.title || "Untitled update"}
        subtitle={draft.published ? <a href={`${SITE_URL}/news/${draft.slug}/`} target="_blank" rel="noopener">/news/{draft.slug}/ ↗</a> : "Draft: not visible on the website"} />
      <div className="panel stack">
        <div className="field"><label htmlFor="n-date">Publish date</label>
          <input id="n-date" type="date" value={(draft.date || today()).slice(0, 10)} onChange={(e) => setDraft((d) => ({ ...d, date: new Date(`${e.target.value}T09:00:00Z`).toISOString() }))} /></div>
        <FieldGroup fields={FIELDS} value={draft} onChange={(v) => setDraft((d) => {
          const titleChanged = v.title !== d.title && d.slug.startsWith("update-");
          return { ...d, ...v, slug: slugify(String(titleChanged ? v.title : v.slug)) } as NewsPost;
        })} />
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </>
  );
}
