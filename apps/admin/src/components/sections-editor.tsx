import { useState } from "react";
import { BACKGROUNDS, SECTION_TYPES, newSection, type Field, type Section, type SectionType, type SectionTypeDef } from "@dome/shared";
import { FieldGroup, FieldInput } from "./fields";
import { Modal } from "./ui";

const HEADER_FIELDS: Field[] = [
  { key: "eyebrow", label: "Small label (eyebrow)", type: "text" },
  { key: "title", label: "Heading", type: "text" },
  { key: "lead", label: "Intro text", type: "textarea" },
];
const SETTINGS_FIELDS: Field[] = [
  { key: "background", label: "Background", type: "select", options: BACKGROUNDS },
  { key: "anchor", label: "Link ID (optional)", type: "text", help: "Lets buttons link here, e.g. 'partner' → /#partner" },
];

const def = (t: SectionType) => SECTION_TYPES[t] as SectionTypeDef;

/** Section types not offered for a given context. */
export function SectionsEditor({ sections, onChange, exclude = [] }: { sections: Section[]; onChange: (s: Section[]) => void; exclude?: SectionType[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null); // insert index

  const update = (i: number, s: Section) => onChange(sections.map((x, k) => (k === i ? s : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const duplicate = (i: number) => {
    const copy = { ...structuredClone(sections[i]), id: crypto.randomUUID(), anchor: "" };
    onChange([...sections.slice(0, i + 1), copy, ...sections.slice(i + 1)]);
    setOpen(copy.id);
  };
  const remove = (i: number) => {
    if (!confirm(`Delete the “${sections[i].title || def(sections[i].type).label}” section? You can still discard by not saving.`)) return;
    onChange(sections.filter((_, k) => k !== i));
  };
  const insert = (type: SectionType) => {
    const s = newSection(type);
    const at = adding ?? sections.length;
    onChange([...sections.slice(0, at), s, ...sections.slice(at)]);
    setAdding(null);
    setOpen(s.id);
    setTimeout(() => document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="sections">
      {sections.length === 0 && <div className="empty">This page has no sections yet.</div>}
      {sections.map((s, i) => {
        const d = def(s.type);
        const isOpen = open === s.id;
        return (
          <div key={s.id} id={`sec-${s.id}`} className={`section-card${s.hidden ? " is-hidden" : ""}${isOpen ? " is-open" : ""}`}>
            <div className="section-card-head">
              <button type="button" className="section-card-title" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{s.title || (s.data as any)?.heading || d?.label || s.type}</strong>
                  <small>{d?.label || s.type}{s.background && s.background !== "default" ? ` · ${BACKGROUNDS.find((b) => b.value === s.background)?.label}` : ""}{s.hidden ? " · Hidden" : ""}</small>
                </span>
              </button>
              <div className="item-tools">
                <button type="button" className="icon-btn" title="Move up" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" className="icon-btn" title="Move down" aria-label="Move down" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="icon-btn" title={s.hidden ? "Show on website" : "Hide from website"} aria-label={s.hidden ? "Show" : "Hide"} onClick={() => update(i, { ...s, hidden: !s.hidden })}>{s.hidden ? "◌" : "◉"}</button>
                <button type="button" className="icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => duplicate(i)}>⧉</button>
                <button type="button" className="icon-btn icon-btn--danger" title="Delete" aria-label="Delete" onClick={() => remove(i)}>✕</button>
              </div>
            </div>
            {isOpen && d && (
              <div className="section-card-body">
                <p className="muted">{d.description}</p>
                {d.header && (
                  <>
                    <h4>Heading</h4>
                    <FieldGroup fields={HEADER_FIELDS} value={s as any} onChange={(v) => update(i, { ...s, ...v })} />
                  </>
                )}
                {d.fields.length > 0 && (
                  <>
                    <h4>Content</h4>
                    <FieldGroup fields={d.fields} value={s.data} onChange={(v) => update(i, { ...s, data: v })} />
                  </>
                )}
                <h4>Settings</h4>
                <div className="field-grid">
                  {SETTINGS_FIELDS.map((f) => <FieldInput key={f.key} field={f} value={(s as any)[f.key]} onChange={(v) => update(i, { ...s, [f.key]: v })} />)}
                </div>
              </div>
            )}
            <button type="button" className="add-between" onClick={() => setAdding(i + 1)}>+ Add section here</button>
          </div>
        );
      })}
      <button type="button" className="btn btn--add btn--block" onClick={() => setAdding(sections.length)}>+ Add a section</button>

      {adding !== null && (
        <Modal title="Add a section" onClose={() => setAdding(null)} wide>
          <div className="type-grid">
            {(Object.keys(SECTION_TYPES) as SectionType[]).filter((t) => !exclude.includes(t)).map((t) => (
              <button key={t} type="button" className="type-tile" onClick={() => insert(t)}>
                <strong>{def(t).label}</strong><span>{def(t).description}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
