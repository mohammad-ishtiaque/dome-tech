import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------- toasts */
type Toast = { id: number; text: string; kind: "ok" | "err" };
const ToastCtx = createContext<(text: string, kind?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: "ok" | "err" = "ok") => {
    // In the shareable preview nothing reaches the real website, so say so.
    const text = import.meta.env.VITE_DEMO === "1" ? message.replace(" — live on the website", " (preview only)") : message;
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "err" ? 6000 : 3000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast toast--${t.kind}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ----------------------------------------------------------------- modal */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? " modal--wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <header><h2>{title}</h2><button className="icon-btn" type="button" onClick={onClose} aria-label="Close">✕</button></header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ page header */
export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; back?: React.ReactNode }) {
  return (
    <div className="page-header">
      <div>
        {back}
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export function Loading() { return <div className="loading" aria-busy="true">Loading…</div>; }
export function ErrorBox({ text, retry }: { text: string; retry?: () => void }) {
  return <div className="error-box">{text}{retry && <button className="btn btn--sm" onClick={retry}>Try again</button>}</div>;
}
export function Empty({ children }: { children: React.ReactNode }) { return <div className="empty">{children}</div>; }

/** Save bar shown at the bottom of every editor. */
export function SaveBar({ dirty, saving, onSave, extra }: { dirty: boolean; saving: boolean; onSave: () => void; extra?: React.ReactNode }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (dirty && !saving) onSave(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [dirty, saving, onSave]);
  return (
    <div className={`savebar${dirty ? " is-dirty" : ""}`}>
      <span>{saving ? "Saving…" : dirty ? "You have unsaved changes" : "All changes saved"}</span>
      <div className="actions">
        {extra}
        <button className="btn btn--primary" type="button" disabled={!dirty || saving} onClick={onSave}>{saving ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}

export const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
