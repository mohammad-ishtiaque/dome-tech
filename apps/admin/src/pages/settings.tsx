import { useState } from "react";
import { opts, type Field, type Settings } from "@dome/shared";
import { api } from "../api";
import { useDraft, useLoad } from "../hooks";
import { FieldGroup } from "../components/fields";
import { ErrorBox, Loading, PageHeader, SaveBar, useToast } from "../components/ui";

const GROUPS: { title: string; help?: string; fields: Field[] }[] = [
  { title: "Contact", help: "Shown in the footer, the Contact page and the investor section.", fields: [
    { key: "contact.email", label: "Email address", type: "text" },
    { key: "contact.phone", label: "Phone / WhatsApp (optional)", type: "text" },
    { key: "contact.location", label: "Location", type: "text" },
  ] },
  { title: "Header & footer", fields: [
    { key: "headerCta.label", label: "Header button text", type: "text" },
    { key: "headerCta.href", label: "Header button link", type: "url" },
    { key: "siteName", label: "Company name", type: "text" },
    { key: "footerText", label: "Footer text", type: "textarea" },
    { key: "social", label: "Social media links", type: "list", itemLabel: "link", fields: [
      { key: "label", label: "Name", type: "text", help: "e.g. LinkedIn" }, { key: "url", label: "Link", type: "url" }] },
  ] },
  { title: "Traction", help: "Used by the Traction section. Publish only real, verified numbers.", fields: [
    { key: "updatedLabel", label: "‘Last updated’ label", type: "text", help: "e.g. October 2026" },
    { key: "milestones", label: "Milestones", type: "list", itemLabel: "milestone", fields: [
      { key: "label", label: "Milestone", type: "text" },
      { key: "state", label: "State", type: "select", options: opts(["done", "Completed"], ["current", "In progress"], ["next", "Next"]) }] },
    { key: "metrics", label: "Verified metrics", type: "list", itemLabel: "metric", fields: [
      { key: "value", label: "Number", type: "text" }, { key: "label", label: "What it measures", type: "text" }, { key: "asOf", label: "As of (date)", type: "text" }] },
  ] },
  { title: "Team", help: "Shown in the Leadership sections. Hidden while empty.", fields: [
    { key: "team", label: "Team members", type: "list", itemLabel: "person", fields: [
      { key: "name", label: "Name", type: "text" }, { key: "role", label: "Job title", type: "text" },
      { key: "bio", label: "Short bio", type: "textarea" }, { key: "photo", label: "Photo", type: "image" },
      { key: "linkedin", label: "LinkedIn link", type: "url" }] },
  ] },
];

// Flatten "contact.email"-style keys into a plain object for the form, and back.
const get = (o: any, k: string) => k.split(".").reduce((v, p) => v?.[p], o);
const set = (o: any, k: string, v: unknown): any => {
  const [head, ...rest] = k.split(".");
  return rest.length ? { ...o, [head]: set(o?.[head] || {}, rest.join("."), v) } : { ...o, [head]: v };
};

export function SettingsPage() {
  const { data, error, reload } = useLoad<Settings>("/settings");
  const { draft, setDraft, dirty, markSaved } = useDraft<Settings>(data);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  if (error) return <ErrorBox text={error} retry={reload} />;
  if (!draft) return <Loading />;
  const save = async () => {
    setSaving(true);
    try { markSaved(await api.put<Settings>("/settings", draft)); toast("Settings saved — live on the website"); }
    catch (e) { toast((e as Error).message, "err"); }
    finally { setSaving(false); }
  };
  return (
    <>
      <PageHeader title="Settings" subtitle="Company details used across every page." />
      {GROUPS.map((g) => {
        const flat = Object.fromEntries(g.fields.map((f) => [f.key, get(draft, f.key)]));
        return (
          <section key={g.title} className="panel stack">
            <div><h2>{g.title}</h2>{g.help && <p className="muted">{g.help}</p>}</div>
            <FieldGroup fields={g.fields} value={flat} onChange={(v) => setDraft((d) => g.fields.reduce((acc, f) => set(acc, f.key, v[f.key]), d))} />
          </section>
        );
      })}
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </>
  );
}
