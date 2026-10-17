import { useEffect, useRef, useState } from "react";
import { useFetcher, useLocation } from "react-router";
import { Icon } from "./icons";

export const INTERESTS = [
  ["invest", "Investing in Digital Dome"],
  ["info", "Requesting investor information"],
  ["telecom", "Telecom / mobile-money partnership"],
  ["strategic", "Other strategic partnership"],
  ["enterprise", "SomSoft: software for my organization"],
  ["media", "Media or ecosystem inquiry"],
  ["general", "General question"],
] as const;

type Result = { ok?: boolean; error?: string; errors?: Record<string, string> };

/** Contact / investor form. Posts to /inquiry; the message is saved and shown in the dashboard. */
export function InquiryForm({ title, text, interest, id = "inquiry-form" }: { title?: string; text?: string; interest?: string; id?: string }) {
  const fetcher = useFetcher<Result>();
  const { search, pathname } = useLocation();
  const initial = new URLSearchParams(search).get("interest") || "invest";
  const [value, setValue] = useState(initial);
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const data = fetcher.data;
  const busy = fetcher.state !== "idle";

  useEffect(() => { if (interest) setValue(interest); }, [interest]);
  useEffect(() => {
    if (fetcher.state === "idle" && data) {
      if (data.ok) form.current?.reset();
      status.current?.focus();
    }
  }, [fetcher.state, data]);

  const err = (k: string) => data?.errors?.[k];

  return (
    <div className="form-card" id={id}>
      <h3>{title || "Start a conversation"}</h3>
      {text && <p>{text}</p>}
      <fetcher.Form method="post" action="/inquiry" ref={form} noValidate={false}>
        <input type="hidden" name="page" value={pathname} />
        <div className="form-grid">
          <div className="field">
            <label htmlFor={`${id}-name`}>Full name</label>
            <input id={`${id}-name`} name="name" autoComplete="name" required aria-invalid={!!err("name")} aria-describedby={`${id}-name-err`} />
            <span className="err" id={`${id}-name-err`}>{err("name")}</span>
          </div>
          <div className="field">
            <label htmlFor={`${id}-org`}>Organization <span className="opt">(optional)</span></label>
            <input id={`${id}-org`} name="org" autoComplete="organization" />
          </div>
          <div className="field">
            <label htmlFor={`${id}-email`}>Work email</label>
            <input id={`${id}-email`} name="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} aria-describedby={`${id}-email-err`} />
            <span className="err" id={`${id}-email-err`}>{err("email")}</span>
          </div>
          <div className="field">
            <label htmlFor={`${id}-interest`}>I’m interested in</label>
            <select id={`${id}-interest`} name="interest" value={value} onChange={(e) => setValue(e.target.value)}>
              {INTERESTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor={`${id}-msg`}>Message <span className="opt">(optional)</span></label>
            <textarea id={`${id}-msg`} name="message" placeholder="A few lines about you, your organization and what you’d like to discuss." />
          </div>
          <div className="hp" aria-hidden="true"><label htmlFor={`${id}-web`}>Website</label><input id={`${id}-web`} name="website" tabIndex={-1} autoComplete="off" /></div>
          <label className="consent">
            <input type="checkbox" name="consent" required />
            <span>I agree that Digital Dome may use these details to respond to my inquiry, as described in the <a href="/privacy/">Privacy Policy</a>.</span>
          </label>
          <div className="form-actions">
            <button className="btn btn--dark" type="submit" disabled={busy} data-track="Form: Inquiry Submit">{busy ? "Sending…" : <>Send inquiry <Icon name="arrow" /></>}</button>
            <small>No sensitive financial information is shared publicly.</small>
          </div>
          <div ref={status} tabIndex={-1} role="status"
            className={`form-status${data?.ok ? " is-ok" : data?.error ? " is-err" : ""}`}>
            {data?.ok && "Thank you — your inquiry has been received. The Digital Dome team will respond within two business days."}
            {data?.error}
          </div>
        </div>
      </fetcher.Form>
    </div>
  );
}
