import { useRef, useState } from "react";
import { api, type Media } from "../api";
import { useLoad } from "../hooks";
import { Modal, useToast } from "./ui";

/** Uploads one or more files and returns the created media. */
export function useUpload() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | File[]) => {
    setBusy(true);
    const done: Media[] = [];
    try {
      for (const f of Array.from(files)) {
        if (f.size > 8 * 1024 * 1024) { toast(`${f.name} is larger than 8 MB.`, "err"); continue; }
        try { done.push(await api.upload<Media>(f)); } catch (e) { toast(`${f.name}: ${(e as Error).message}`, "err"); }
      }
    } finally { setBusy(false); }
    if (done.length) toast(done.length === 1 ? "Image uploaded" : `${done.length} images uploaded`);
    return done;
  };
  return { upload, busy };
}

/** Pick an existing image or upload a new one. */
export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const { data, reload } = useLoad<Media[]>("/media");
  const { upload, busy } = useUpload();
  const input = useRef<HTMLInputElement>(null);
  return (
    <Modal title="Choose an image" onClose={onClose} wide>
      <div className="picker-top">
        <button className="btn btn--primary" type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Uploading…" : "Upload new image"}</button>
        <span className="muted">PNG, JPG, WebP or GIF, up to 8 MB.</span>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={async (e) => {
          if (!e.target.files?.length) return;
          const [first] = await upload(e.target.files);
          e.target.value = "";
          if (first) { onPick(first.url); onClose(); } else reload();
        }} />
      </div>
      <div className="media-grid">
        {(data || []).map((m) => (
          <button key={m._id} type="button" className="media-tile" onClick={() => { onPick(m.url); onClose(); }}>
            <img src={m.url} alt="" loading="lazy" /><span>{m.filename}</span>
          </button>
        ))}
        {data?.length === 0 && <p className="muted">No images yet. Upload one to get started.</p>}
      </div>
    </Modal>
  );
}

export function ImageField({ value, onChange, id }: { value?: string; onChange: (v: string) => void; id?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="image-field" id={id}>
      {value ? <img src={value} alt="" /> : <div className="image-empty">No image</div>}
      <div className="image-actions">
        <button className="btn btn--sm" type="button" onClick={() => setOpen(true)}>{value ? "Change" : "Choose image"}</button>
        {value && <button className="btn btn--sm btn--ghost" type="button" onClick={() => onChange("")}>Remove</button>}
      </div>
      {open && <MediaPicker onPick={onChange} onClose={() => setOpen(false)} />}
    </div>
  );
}
