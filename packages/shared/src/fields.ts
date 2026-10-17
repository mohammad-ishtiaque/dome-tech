// Field schema: describes an editable field so the dashboard can generate its form automatically.
export type FieldType =
  | "text"        // single line
  | "textarea"    // multi-line plain text
  | "markdown"    // rich text (headings, lists, links)
  | "url"         // link (/path, https://…, mailto:)
  | "image"       // uploaded image URL
  | "color"       // hex color
  | "number"
  | "boolean"
  | "select"      // one of `options`
  | "productMap"  // value per product slug (e.g. revenue matrix)
  | "list";       // repeatable group of `fields`

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  options?: FieldOption[];      // select, productMap
  fields?: Field[];             // list
  itemLabel?: string;           // list: singular name shown on "Add …" buttons
  maxItems?: number;            // list
}

export const opts = (...values: [string, string][]): FieldOption[] => values.map(([value, label]) => ({ value, label }));

// Reusable field groups
export const buttonFields: Field[] = [
  { key: "label", label: "Button text", type: "text", required: true },
  { key: "href", label: "Link", type: "url", required: true },
  { key: "style", label: "Style", type: "select", options: opts(["primary", "Primary (blue)"], ["secondary", "Secondary (outline)"]) },
];
