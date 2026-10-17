import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router";
import { api } from "./api";

/** Loads JSON from the dashboard API. */
export function useLoad<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try { setData(await api.get<T>(path)); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, [path]);
  useEffect(() => { reload(); }, [reload]);
  return { data, setData, error, loading, reload };
}

/** Editable copy of a document with a "has unsaved changes" flag and leave-page protection. */
export function useDraft<T>(initial: T | null) {
  const [draft, setDraftState] = useState<T | null>(initial);
  const saved = useRef<string>(JSON.stringify(initial));
  useEffect(() => { setDraftState(initial); saved.current = JSON.stringify(initial); }, [initial]);
  const dirty = draft !== null && JSON.stringify(draft) !== saved.current;
  const setDraft = useCallback((fn: (d: T) => T) => setDraftState((d) => (d ? fn(d) : d)), []);
  const markSaved = useCallback((value: T) => { saved.current = JSON.stringify(value); setDraftState(value); }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("You have unsaved changes. Leave without saving?")) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);

  return { draft, setDraft, dirty, markSaved };
}

/** Immutable update of a nested value by path, e.g. set(obj, ["data", "items", 2, "title"], "Hi"). */
export function setIn<T>(obj: T, path: (string | number)[], value: unknown): T {
  if (!path.length) return value as T;
  const [head, ...rest] = path;
  const copy: any = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  copy[head] = setIn(copy[head] ?? (typeof rest[0] === "number" ? [] : {}), rest, value);
  return copy;
}
