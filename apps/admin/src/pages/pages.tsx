import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { newSection, pagePath, type Page } from "@dome/shared";
import { api, SITE_URL } from "../api";
import { useDraft, useLoad } from "../hooks";
import { SectionsEditor } from "../components/sections-editor";
import { Empty, ErrorBox, Loading, Modal, PageHeader, SaveBar, fmtDate, useToast } from "../components/ui";

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);

export function PagesList() {
  const { data, error, reload } = useLoad<Page[]>("/pages");
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const remove = async (p: Page) => {
    if (!confirm(`Delete the page “${p.title}”? This can’t be undone.`)) return;
    try { await api.del(`/pages/${p._id}`); toast("Page deleted"); reload(); } catch (e) { toast((e as Error).message, "err"); }
  };
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!data) return <Loading />;
  const sorted = [...data].sort((a, b) => (a.slug === "home" ? -1 : b.slug === "home" ? 1 : a.title.localeCompare(b.title)));
  return (
    <>
      <PageHeader title="Pages" subtitle="Each page is built from sections you can add, edit, reorder or hide." actions={<button className="btn btn--primary" onClick={() => setCreating(true)}>+ New page</button>} />
      <div className="panel">
        <table className="table">
          <thead><tr><th>Page</th><th>Address</th><th>Sections</th><th>Last edited</th><th /></tr></thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p._id}>
                <td><Link to={`/pages/${p._id}`} className="row-link">{p.title}</Link></td>
                <td><a href={`${SITE_URL}${pagePath(p.slug)}`} target="_blank" rel="noopener" className="muted">{pagePath(p.slug)}</a></td>
                <td>{p.sections.length}{p.sections.some((s) => s.hidden) && <small className="muted"> ({p.sections.filter((s) => s.hidden).length} hidden)</small>}</td>
                <td>{fmtDate(p.updatedAt)}</td>
                <td className="row-actions">
                  <Link className="btn btn--sm" to={`/pages/${p._id}`}>Edit</Link>
                  {p.slug !== "home" && <button className="btn btn--sm btn--ghost" onClick={() => remove(p)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {creating && <NewPage onClose={() => setCreating(false)} />}
    </>
  );
}

function NewPage({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const hero = newSection("pageHero");
    hero.title = title;
    try {
      const page = await api.post<Page>("/pages", { title, slug, seo: { title: `${title} | Digital Dome`, description: "" }, numbered: false, sections: [hero] });
      navigate(`/pages/${page._id}`);
    } catch (err) { setError((err as Error).message); }
  };
  return (
    <Modal title="New page" onClose={onClose}>
      <form onSubmit={create} className="stack">
        <div className="field"><label htmlFor="np-title">Page name</label>
          <input id="np-title" value={title} autoFocus required onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} /></div>
        <div className="field"><label htmlFor="np-slug">Address</label>
          <div className="prefix-input"><span>/</span><input id="np-slug" value={slug} required onChange={(e) => { setTouched(true); setSlug(slugify(e.target.value)); }} /><span>/</span></div>
          <small className="help">The page starts with a header section. Add more sections after it’s created. Link to it from a button or the footer.</small></div>
        {error && <div className="error-box">{error}</div>}
        <div className="actions"><button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button><button className="btn btn--primary" type="submit">Create page</button></div>
      </form>
    </Modal>
  );
}

export function SeoFields({ seo, onChange, fallbackTitle }: { seo: { title?: string; description?: string }; onChange: (s: { title?: string; description?: string }) => void; fallbackTitle: string }) {
  const t = seo?.title || "", d = seo?.description || "";
  return (
    <div className="field-grid">
      <div className="field field--full">
        <label htmlFor="seo-title">Search title <span className={`counter${t.length > 60 ? " over" : ""}`}>{t.length}/60</span></label>
        <input id="seo-title" value={t} placeholder={fallbackTitle} onChange={(e) => onChange({ ...seo, title: e.target.value })} />
        <small className="help">Shown in Google results and browser tabs. Keep it under 60 characters.</small>
      </div>
      <div className="field field--full">
        <label htmlFor="seo-desc">Search description <span className={`counter${d.length > 160 ? " over" : ""}`}>{d.length}/160</span></label>
        <textarea id="seo-desc" rows={3} value={d} onChange={(e) => onChange({ ...seo, description: e.target.value })} />
        <small className="help">The summary under the title in Google. 120–160 characters works best.</small>
      </div>
      <div className="seo-preview field--full" aria-label="Google preview">
        <span className="seo-url">{SITE_URL.replace(/^https?:\/\//, "")}</span>
        <strong>{t || fallbackTitle}</strong>
        <p>{d || "Add a description so Google shows a useful summary."}</p>
      </div>
    </div>
  );
}

export function PageEdit() {
  const { id } = useParams();
  const { data, error, reload } = useLoad<Page>(`/pages/${id}`);
  const { draft, setDraft, dirty, markSaved } = useDraft<Page>(data);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"sections" | "seo">("sections");
  const toast = useToast();

  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!draft) return <Loading />;
  const isHome = draft.slug === "home";

  const save = async () => {
    setSaving(true);
    try { markSaved(await api.put<Page>(`/pages/${draft._id}`, draft)); toast("Page saved — live on the website"); }
    catch (e) { toast((e as Error).message, "err"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader
        back={<Link to="/pages" className="back">← Pages</Link>}
        title={draft.title}
        subtitle={<a href={`${SITE_URL}${pagePath(draft.slug)}`} target="_blank" rel="noopener">{pagePath(draft.slug)} ↗</a>}
      />
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "sections"} onClick={() => setTab("sections")}>Sections ({draft.sections.length})</button>
        <button role="tab" aria-selected={tab === "seo"} onClick={() => setTab("seo")}>Page settings & SEO</button>
      </div>
      {tab === "sections" ? (
        <SectionsEditor sections={draft.sections} onChange={(sections) => setDraft((d) => ({ ...d, sections }))} />
      ) : (
        <div className="panel stack">
          <div className="field-grid">
            <div className="field"><label htmlFor="pg-title">Page name</label><input id="pg-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} /></div>
            <div className="field"><label htmlFor="pg-slug">Address</label>
              <div className="prefix-input"><span>/</span><input id="pg-slug" value={isHome ? "" : draft.slug} disabled={isHome} placeholder={isHome ? "(homepage)" : ""} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} /><span>/</span></div>
              {!isHome && <small className="help">Changing the address breaks existing links to this page.</small>}</div>
            <div className="field field--check"><label><input type="checkbox" checked={!!draft.numbered} onChange={(e) => setDraft((d) => ({ ...d, numbered: e.target.checked }))} /> Number the sections (01, 02, 03…)</label></div>
          </div>
          <h3>Search engines (SEO)</h3>
          <SeoFields seo={draft.seo} fallbackTitle={`${draft.title} | Digital Dome`} onChange={(seo) => setDraft((d) => ({ ...d, seo }))} />
        </div>
      )}
      {draft.sections.length === 0 && tab === "sections" && <Empty>Add a section to start building this page.</Empty>}
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </>
  );
}
