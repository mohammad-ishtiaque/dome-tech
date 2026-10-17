import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { PRODUCT_FIELDS, buttonFields, opts, type Field, type Product } from "@dome/shared";
import { api, SITE_URL } from "../api";
import { useDraft, useLoad } from "../hooks";
import { FieldGroup, ListField } from "../components/fields";
import { SectionsEditor } from "../components/sections-editor";
import type { ShellContext } from "../components/layout";
import { ErrorBox, Loading, Modal, PageHeader, SaveBar, useToast } from "../components/ui";
import { SeoFields, slugify } from "./pages";

const MOCKUP_FIELDS: Field[] = [
  { key: "device", label: "Frame", type: "select", options: opts(["phone", "Phone (mobile app)"], ["browser", "Browser (web / desktop)"]) },
  { key: "screenshot", label: "Screenshot shown in the frame", type: "image", help: "Upload a real app screen. Phone: portrait, e.g. 1170 × 2532. Browser: about 1440 px wide." },
  { key: "concept", label: "Sample screen (used until a screenshot is uploaded)", type: "select", options: opts(["list", "Listings"], ["profiles", "Profiles & booking"], ["event", "Events"], ["dashboard", "Dashboard"]) },
  { key: "title", label: "Sample screen title", type: "text" },
  { key: "subtitle", label: "Sample screen subtitle", type: "text" },
];
const HERO_BUTTONS: Field = { key: "heroButtons", label: "Header buttons", type: "list", itemLabel: "button", maxItems: 2, fields: buttonFields };

export function ProductsList() {
  const { data, setData, error, reload } = useLoad<Product[]>("/products");
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const { refreshProducts } = useOutletContext<ShellContext>();

  const move = async (i: number, dir: -1 | 1) => {
    if (!data) return;
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    setData(next);
    try { await api.put("/products-order", { ids: next.map((p) => p._id) }); refreshProducts(); } catch (e) { toast((e as Error).message, "err"); reload(); }
  };
  const remove = async (p: Product) => {
    if (!confirm(`Delete ${p.name}? Its page will disappear from the website. This can’t be undone.`)) return;
    try { await api.del(`/products/${p._id}`); toast("Product deleted"); reload(); refreshProducts(); } catch (e) { toast((e as Error).message, "err"); }
  };

  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader title="Products" subtitle="The order here is the order on the website (menu, homepage, footer)." actions={<button className="btn btn--primary" onClick={() => setCreating(true)}>+ New product</button>} />
      <div className="product-list">
        {data.map((p, i) => (
          <div key={p._id} className="product-row" style={{ ["--accent" as string]: p.color }}>
            <span className="swatch">{p.logo ? <img src={p.logo} alt="" /> : p.name[0]}</span>
            <div className="grow">
              <Link to={`/products/${p._id}`} className="row-link">{p.fullName || p.name}</Link>
              <small className="muted">{p.role} · /{p.slug}/</small>
            </div>
            <span className="pill">{p.status}</span>
            {!p.published && <span className="pill pill--archived">Hidden</span>}
            <div className="item-tools">
              <button className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className="icon-btn" disabled={i === data.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            </div>
            <Link className="btn btn--sm" to={`/products/${p._id}`}>Edit</Link>
            <button className="btn btn--sm btn--ghost" onClick={() => remove(p)}>Delete</button>
          </div>
        ))}
      </div>
      {creating && <NewProduct count={data.length} onClose={() => setCreating(false)} />}
    </>
  );
}

function NewProduct({ count, onClose }: { count: number; onClose: () => void }) {
  const navigate = useNavigate();
  const { refreshProducts } = useOutletContext<ShellContext>();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await api.post<Product>("/products", {
        name, slug: slugify(name), order: count, role: "", color: "#1f7aff", icon: "star", status: "In development",
        promise: "", purpose: "", market: "", monetization: "", channel: "", published: false,
        mockup: { device: "phone", concept: "list" }, heroButtons: [], seo: {}, sections: [],
      });
      refreshProducts();
      navigate(`/products/${p._id}`);
    } catch (err) { setError((err as Error).message); }
  };
  return (
    <Modal title="New product" onClose={onClose}>
      <form onSubmit={create} className="stack">
        <div className="field"><label htmlFor="pr-name">Product name</label><input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></div>
        <small className="help">The product starts hidden. Fill in its details, then tick “Show on website”.</small>
        {error && <div className="error-box">{error}</div>}
        <div className="actions"><button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button><button className="btn btn--primary" type="submit">Create product</button></div>
      </form>
    </Modal>
  );
}

export function ProductEdit() {
  const { id } = useParams();
  const { data, error, reload } = useLoad<Product>(`/products/${id}`);
  const { draft, setDraft, dirty, markSaved } = useDraft<Product>(data);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"details" | "header" | "sections" | "seo">("details");
  const toast = useToast();
  const { refreshProducts } = useOutletContext<ShellContext>();

  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!draft) return <Loading />;
  const save = async () => {
    setSaving(true);
    try { markSaved(await api.put<Product>(`/products/${draft._id}`, draft)); refreshProducts(); toast("Product saved — live on the website"); }
    catch (e) { toast((e as Error).message, "err"); }
    finally { setSaving(false); }
  };
  const tabs = [["details", "Details"], ["header", "Header & mockup"], ["sections", `Page sections (${draft.sections.length})`], ["seo", "SEO"]] as const;

  return (
    <>
      <PageHeader back={<Link to="/products" className="back">← Products</Link>} title={draft.fullName || draft.name}
        subtitle={<><span className="color-dot" style={{ background: draft.color }} /> <a href={`${SITE_URL}/${draft.slug}/`} target="_blank" rel="noopener">/{draft.slug}/ ↗</a>{!draft.published && " · Hidden from website"}</>} />
      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === "details" && <div className="panel"><FieldGroup fields={PRODUCT_FIELDS} value={draft} onChange={(v) => setDraft((d) => ({ ...d, ...v, slug: slugify(String(v.slug ?? d.slug)) }))} /></div>}
      {tab === "header" && (
        <div className="panel stack">
          <h3>App mockup</h3>
          <FieldGroup fields={MOCKUP_FIELDS} value={draft.mockup || {}} onChange={(mockup) => setDraft((d) => ({ ...d, mockup: mockup as Product["mockup"] }))} />
          <h3>Buttons</h3>
          <ListField field={HERO_BUTTONS} value={draft.heroButtons || []} onChange={(heroButtons) => setDraft((d) => ({ ...d, heroButtons: heroButtons as Product["heroButtons"] }))} />
        </div>
      )}
      {tab === "sections" && <SectionsEditor sections={draft.sections} exclude={["hero", "pageHero"]} onChange={(sections) => setDraft((d) => ({ ...d, sections }))} />}
      {tab === "seo" && <div className="panel"><SeoFields seo={draft.seo || {}} fallbackTitle={`${draft.name} | Digital Dome`} onChange={(seo) => setDraft((d) => ({ ...d, seo }))} /></div>}
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </>
  );
}
