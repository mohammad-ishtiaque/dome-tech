// Builds form inputs from the shared field schema (packages/shared), so every section type
// and model gets an editor without hand-written forms.
import { createContext, useContext, useId, useState } from "react";
import type { Field } from "@dome/shared";
import { setIn } from "../hooks";
import { ImageField } from "./media";

export interface ProductRef { slug: string; name: string; color: string }
export const ProductsContext = createContext<ProductRef[]>([]);

type Obj = Record<string, any>;

export function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const id = useId();
  const products = useContext(ProductsContext);
  const label = (
    <label htmlFor={id}>
      {field.label}{field.required && <span className="req" aria-hidden="true"> *</span>}
    </label>
  );
  const help = field.help && <small className="help">{field.help}</small>;

  switch (field.type) {
    case "boolean":
      return (
        <div className="field field--check">
          <label><input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {field.label}</label>
          {help}
        </div>
      );
    case "textarea":
    case "markdown":
      return (
        <div className="field field--full">
          {label}
          <textarea id={id} rows={field.type === "markdown" ? 8 : 3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />
          {help}
        </div>
      );
    case "select":
      return (
        <div className="field">
          {label}
          <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {!field.options?.some((o) => o.value === "") && <option value="">—</option>}
            {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {help}
        </div>
      );
    case "color":
      return (
        <div className="field">
          {label}
          <div className="color-input">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || "") ? value : "#1f7aff"} onChange={(e) => onChange(e.target.value)} aria-label={`${field.label} picker`} />
            <input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#1f7aff" maxLength={7} />
          </div>
          {help}
        </div>
      );
    case "number":
      return (
        <div className="field">
          {label}
          <input id={id} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
          {help}
        </div>
      );
    case "image":
      return (
        <div className="field field--full">
          <span className="label">{field.label}</span>
          <ImageField id={id} value={value} onChange={onChange} />
          {help}
        </div>
      );
    case "productMap":
      return (
        <div className="field field--full">
          <span className="label">{field.label}</span>
          <div className="product-map">
            {products.map((p) => (
              <label key={p.slug}>
                <span><i style={{ background: p.color }} />{p.name}</span>
                <select value={value?.[p.slug] ?? ""} onChange={(e) => onChange({ ...(value || {}), [p.slug]: e.target.value })}>
                  {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            ))}
          </div>
        </div>
      );
    case "list":
      return <ListField field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />;
    default:
      return (
        <div className={`field${field.type === "url" ? "" : ""}`}>
          {label}
          <input id={id} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required}
            placeholder={field.type === "url" ? "/page/ or https://…" : undefined} />
          {help}
        </div>
      );
  }
}

/** A group of fields bound to one object. */
export function FieldGroup({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div className="field-grid">
      {fields.map((f) => <FieldInput key={f.key} field={f} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />)}
    </div>
  );
}

function itemTitle(item: Obj, i: number, field: Field) {
  const first = ["title", "label", "name", "question", "text", "value", "caption"].map((k) => item?.[k]).find((v) => typeof v === "string" && v.trim());
  return first || `${field.itemLabel ? field.itemLabel[0].toUpperCase() + field.itemLabel.slice(1) : "Item"} ${i + 1}`;
}

/** Repeatable items with add / remove / reorder. */
export function ListField({ field, value, onChange }: { field: Field; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length <= 3 ? -1 : null); // -1 = all open
  const fields = field.fields || [];
  const isOpen = (i: number) => open === -1 || open === i;
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const full = field.maxItems !== undefined && value.length >= field.maxItems;
  const simple = fields.length === 1 && fields[0].type !== "list";

  return (
    <fieldset className="field field--full list-field">
      <legend>{field.label} <span className="count">{value.length}</span></legend>
      {value.map((item, i) => (
        <div key={i} className={`list-item${simple ? " list-item--simple" : ""}`}>
          {simple ? (
            <div className="list-item-row">
              <FieldInput field={{ ...fields[0], label: "" }} value={item?.[fields[0].key]} onChange={(v) => onChange(setIn(value, [i, fields[0].key], v))} />
              <ItemTools i={i} n={value.length} move={move} remove={() => onChange(value.filter((_, k) => k !== i))} />
            </div>
          ) : (
            <>
              <div className="list-item-head">
                <button type="button" className="list-item-toggle" onClick={() => setOpen(isOpen(i) && open !== -1 ? null : i)} aria-expanded={isOpen(i)}>
                  <span className="chev">{isOpen(i) ? "▾" : "▸"}</span>{itemTitle(item, i, field)}
                </button>
                <ItemTools i={i} n={value.length} move={move} remove={() => onChange(value.filter((_, k) => k !== i))} />
              </div>
              {isOpen(i) && <FieldGroup fields={fields} value={item || {}} onChange={(v) => onChange(setIn(value, [i], v))} />}
            </>
          )}
        </div>
      ))}
      <button type="button" className="btn btn--sm btn--add" disabled={full} onClick={() => { onChange([...value, {}]); setOpen(value.length); }}>
        + Add {field.itemLabel || "item"}
      </button>
      {full && <small className="help">Maximum {field.maxItems}.</small>}
    </fieldset>
  );
}

function ItemTools({ i, n, move, remove }: { i: number; n: number; move: (i: number, d: -1 | 1) => void; remove: () => void }) {
  return (
    <div className="item-tools">
      <button type="button" className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" title="Move up">↑</button>
      <button type="button" className="icon-btn" disabled={i === n - 1} onClick={() => move(i, 1)} aria-label="Move down" title="Move down">↓</button>
      <button type="button" className="icon-btn icon-btn--danger" onClick={() => { if (confirm("Remove this item?")) remove(); }} aria-label="Remove" title="Remove">✕</button>
    </div>
  );
}
