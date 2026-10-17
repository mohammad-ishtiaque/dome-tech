import { useRef, useState } from "react";
import { api, type Media } from "../api";
import { useLoad } from "../hooks";
import { useUpload } from "../components/media";
import { Empty, ErrorBox, Loading, PageHeader, useToast } from "../components/ui";

const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export function MediaLibrary() {
  const { data, error, reload } = useLoad<Media[]>("/media");
  const { upload, busy } = useUpload();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const toast = useToast();

  const add = async (files: FileList | null) => { if (files?.length) { await upload(files); reload(); } };
  const remove = async (m: Media) => {
    if (!confirm(`Delete ${m.filename}? Pages using this image will show a broken image.`)) return;
    try { await api.del(`/media/${m._id}`); toast("Image deleted"); reload(); } catch (e) { toast((e as Error).message, "err"); }
  };
  const copy = async (m: Media) => { await navigator.clipboard.writeText(m.url); toast("Image address copied"); };

  return (
    <>
      <PageHeader title="Media" subtitle="Images used across the website: app screenshots, logos, photos." actions={
        <button className="btn btn--primary" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Uploading…" : "Upload images"}</button>} />
      <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <div className={`dropzone${drag ? " is-drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}>
        Drag images here, or use “Upload images”. PNG, JPG, WebP or GIF, up to 8 MB each.
      </div>
      {error ? <ErrorBox text={error} retry={reload} /> : !data ? <Loading /> : data.length === 0 ? <Empty>No images yet.</Empty> : (
        <div className="media-grid media-grid--library">
          {data.map((m) => (
            <figure key={m._id} className="media-tile">
              <img src={m.url} alt="" loading="lazy" />
              <figcaption><span title={m.filename}>{m.filename}</span><small>{size(m.size)}</small></figcaption>
              <div className="media-actions">
                <button className="btn btn--sm" onClick={() => copy(m)}>Copy link</button>
                <button className="btn btn--sm btn--ghost" onClick={() => remove(m)}>Delete</button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
