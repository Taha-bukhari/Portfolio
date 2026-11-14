import { useState } from "react";
import { ArrowUp, ArrowDown, ChevronDown, Trash2, Plus, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useContent } from "../lib/content";
import { ICONS } from "../lib/icons";
import { card, btnPrimary, btnGhost } from "../components/Layout";

export const S = (k, label, type = "text", extra = {}) => ({ k, label, type, ...extra });
const uid = () => Math.random().toString(36).slice(2, 10);
const clone = (v) => JSON.parse(JSON.stringify(v));
const get = (o, path) => path.split(".").reduce((a, k) => a?.[k], o);
const set = (o, path, val) => {
  const [h, ...r] = path.split(".");
  return { ...o, [h]: r.length ? set(o[h] ?? {}, r.join("."), val) : val };
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WIDE = ["textarea", "paras", "pairs", "image", "tags"];

export async function saveDoc(key, value) {
  const { error } = await supabase.from("site_content").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

function check(f, v) {
  const empty = v == null || v === "" || (Array.isArray(v) && v.length === 0);
  if (f.required && empty) return "This field is required.";
  if (empty) return "";
  if (f.type === "url" && v !== "#" && !/^https?:\/\/\S+$/.test(v)) return "Use a full link that starts with http:// or https://";
  if (f.type === "email" && !EMAIL.test(v)) return "That email address does not look right.";
  if (f.type === "phone" && !/^\+?[\d\s()-]{7,20}$/.test(v)) return "Use digits only, for example +92 300 0000000.";
  if (f.type === "number" && (!Number.isFinite(v) || v < 0)) return "Enter a number, 0 or more.";
  if (typeof v === "string" && v.length > (f.max ?? 2000)) return `Please keep this under ${f.max ?? 2000} characters.`;
  return "";
}
const checkAll = (fields, obj) => {
  const e = {};
  fields.forEach((f) => { const m = check(f, get(obj, f.k)); if (m) e[f.k] = m; });
  return e;
};

export const Status = ({ s }) => (s ? <p role="status" className={`text-sm font-semibold ${s.ok ? "text-emerald-300" : "text-red-300"}`}>{s.msg}</p> : null);

function SaveBar({ onSave, busy, status, label = "Save changes" }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={onSave} disabled={busy} className={`${btnPrimary} disabled:opacity-60 disabled:hover:translate-y-0`}>
        {busy && <Loader2 size={18} className="animate-spin" />}{label}
      </button>
      <Status s={status} />
    </div>
  );
}

// ---- inputs ----
const tagsIO = { format: (a) => a.join(", "), parse: (s) => s.split(",").map((x) => x.trim()).filter(Boolean) };
const parasIO = { format: (a) => a.join("\n\n"), parse: (s) => s.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean) };
const pairsIO = {
  format: (a) => a.map(([k, v]) => `${k}: ${v}`).join("\n"),
  parse: (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf(": "); return i < 0 ? [l, ""] : [l.slice(0, i), l.slice(i + 2)]; }),
};

function TextBlock({ io, value, onChange, rows, ...rest }) {
  const [text, setText] = useState(io.format(value ?? []));
  return <textarea {...rest} rows={rows} className="field w-full resize-y" value={text} onChange={(e) => { setText(e.target.value); onChange(io.parse(e.target.value)); }} />;
}

async function compress(file, max = 1600) {
  const bmp = await createImageBitmap(file);
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * r);
  c.height = Math.round(bmp.height * r);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Could not compress the image"))), "image/webp", 0.82));
}

// Picks a file, checks type and size, resizes and compresses it, uploads it to Supabase Storage.
export function ImageField({ value, onChange, folder = "misc" }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setMsg({ ok: false, msg: "Please choose a JPG, PNG or WebP image." });
    if (file.size > 8 * 1024 * 1024) return setMsg({ ok: false, msg: "That file is larger than 8 MB." });
    setBusy(true); setMsg(null);
    try {
      const blob = await compress(file);
      const path = `${folder}/${Date.now()}-${uid().slice(0, 5)}.webp`;
      const { error } = await supabase.storage.from("site-images").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (error) throw error;
      await onChange(supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl);
      setMsg({ ok: true, msg: "Image uploaded." });
    } catch (err) {
      setMsg({ ok: false, msg: `Upload failed: ${err.message}` });
    } finally {
      setBusy(false);
    }
  };
  const remove = () => Promise.resolve(onChange("")).catch((err) => setMsg({ ok: false, msg: `Could not remove: ${err.message}` }));
  return (
    <div className="flex flex-wrap items-center gap-4">
      {value
        ? <img src={value} alt="Preview" className="h-24 w-36 rounded-lg border border-white/10 object-cover" />
        : <div className="grid h-24 w-36 place-items-center rounded-lg border border-dashed border-white/20 text-xs text-white/40">No image</div>}
      <div className="space-y-2">
        <label className={`${btnGhost} cursor-pointer text-sm`}>
          {busy && <Loader2 size={16} className="animate-spin" />}{value ? "Change image" : "Upload image"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} disabled={busy} className="sr-only" />
        </label>
        {value && <button type="button" onClick={remove} className="block text-sm text-white/55 hover:text-red-300">Remove image</button>}
        <p className="text-xs text-white/40">JPG, PNG or WebP, up to 8 MB. Resized and compressed automatically.</p>
        <Status s={msg} />
      </div>
    </div>
  );
}

function Field({ f, idPrefix, value, onChange, error }) {
  const id = `${idPrefix}-${f.k}`.replace(/\./g, "-");
  const base = { id, "aria-invalid": error ? "true" : "false" };
  const txt = (e) => onChange(e.target.value);
  let input;
  switch (f.type) {
    case "textarea":
      input = <textarea {...base} rows={f.rows ?? 3} className="field w-full resize-y" value={value ?? ""} onChange={txt} />; break;
    case "select":
    case "icon": {
      const opts = f.type === "icon" ? Object.keys(ICONS) : f.options;
      input = <select {...base} className="field w-full" value={value ?? ""} onChange={txt}>{opts.map((o) => <option key={o} value={o}>{o}</option>)}</select>; break;
    }
    case "checkbox":
      input = <label className="flex items-center gap-3 text-sm text-white/75"><input {...base} type="checkbox" className="h-5 w-5 accent-ember" checked={!!value} onChange={(e) => onChange(e.target.checked)} />{f.hint}</label>; break;
    case "tags": input = <TextBlock {...base} rows={2} io={tagsIO} value={value} onChange={onChange} />; break;
    case "paras": input = <TextBlock {...base} rows={9} io={parasIO} value={value} onChange={onChange} />; break;
    case "pairs": input = <TextBlock {...base} rows={4} io={pairsIO} value={value} onChange={onChange} />; break;
    case "image": input = <ImageField value={value} onChange={onChange} folder={f.folder} />; break;
    case "number":
      input = <input {...base} type="number" min="0" className="field w-full" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />; break;
    default:
      input = (
        <>
          <input {...base} type={f.type === "email" ? "email" : "text"} list={f.suggest ? `${id}-dl` : undefined} className="field w-full" value={value ?? ""} onChange={txt} />
          {f.suggest && <datalist id={`${id}-dl`}>{f.suggest.map((o) => <option key={o} value={o} />)}</datalist>}
        </>
      );
  }
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/80">{f.label}{f.required && <span className="text-ember"> *</span>}</label>
      {input}
      {f.hint && f.type !== "checkbox" && <p className="mt-1 text-xs text-white/45">{f.hint}</p>}
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

// ---- editors ----
// Edits one document (a group of fields) and saves it to the database.
export function ObjectEditor({ docKey, title, hint, fields }) {
  const c = useContent();
  const [data, setData] = useState(() => clone(c[docKey]));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const save = async () => {
    const errs = checkAll(fields, data);
    setErrors(errs);
    if (Object.keys(errs).length) return setStatus({ ok: false, msg: "Please fix the highlighted fields." });
    setBusy(true); setStatus(null);
    try {
      await saveDoc(docKey, data);
      await c.refresh();
      setStatus({ ok: true, msg: "Saved. Your live website is updated." });
    } catch (e) {
      setStatus({ ok: false, msg: `Could not save: ${e.message}` });
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={`${card} space-y-5 p-5 md:p-6`}>
      <div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {hint && <p className="mt-1 text-sm text-white/55">{hint}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.k} className={WIDE.includes(f.type) ? "sm:col-span-2" : ""}>
            <Field f={f} idPrefix={docKey} value={get(data, f.k)} error={errors[f.k]} onChange={(v) => setData((d) => set(d, f.k, v))} />
          </div>
        ))}
      </div>
      <SaveBar onSave={save} busy={busy} status={status} />
    </section>
  );
}

const IconBtn = ({ label, children, ...p }) => (
  <button type="button" aria-label={label} title={label} {...p}
    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-ember hover:text-ember disabled:opacity-30">{children}</button>
);

// Edits a list of items: add, edit, reorder, remove, then save the whole list.
export function ListEditor({ docKey, title, hint, noun, fields, label, blank }) {
  const c = useContent();
  const [rows, setRows] = useState(() => c[docKey].map((r) => ({ ...clone(r), _k: uid() })));
  const [open, setOpen] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const patch = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? set(r, k, v) : r)));
  const move = (i, d) => setRows((rs) => {
    const j = i + d;
    if (j < 0 || j >= rs.length) return rs;
    const a = [...rs];
    [a[i], a[j]] = [a[j], a[i]];
    return a;
  });
  const remove = (i) => {
    if (window.confirm(`Delete this ${noun}? It disappears from your website when you click Save.`)) setRows((rs) => rs.filter((_, j) => j !== i));
  };
  const add = () => {
    const r = { ...clone(blank), _k: uid() };
    setRows((rs) => [...rs, r]);
    setOpen(r._k);
  };
  const save = async () => {
    const errs = {};
    rows.forEach((r) => { const e = checkAll(fields, r); if (Object.keys(e).length) errs[r._k] = e; });
    setErrors(errs);
    const bad = Object.keys(errs)[0];
    if (bad) { setOpen(bad); return setStatus({ ok: false, msg: "Please fix the highlighted fields." }); }
    setBusy(true); setStatus(null);
    try {
      await saveDoc(docKey, rows.map(({ _k, ...r }) => r));
      await c.refresh();
      setStatus({ ok: true, msg: "Saved. Your live website is updated." });
    } catch (e) {
      setStatus({ ok: false, msg: `Could not save: ${e.message}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${card} space-y-5 p-5 md:p-6`}>
      <div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        {hint && <p className="mt-1 text-sm text-white/55">{hint}</p>}
      </div>
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-white/50">Nothing here yet. Use the Add button to create the first one.</p>}
        {rows.map((r, i) => (
          <div key={r._k} className="rounded-xl border border-white/10 bg-ink/40">
            <div className="flex items-center gap-2 p-3">
              <button type="button" onClick={() => setOpen(open === r._k ? null : r._k)} aria-expanded={open === r._k} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <ChevronDown size={18} className={`shrink-0 transition ${open === r._k ? "rotate-180" : ""}`} />
                <span className="truncate font-semibold">{label(r) || `New ${noun}`}</span>
                {errors[r._k] && <span className="shrink-0 text-xs text-red-300">needs attention</span>}
              </button>
              <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={16} /></IconBtn>
              <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === rows.length - 1}><ArrowDown size={16} /></IconBtn>
              <IconBtn label={`Delete ${noun}`} onClick={() => remove(i)}><Trash2 size={16} /></IconBtn>
            </div>
            {open === r._k && (
              <div className="grid gap-5 border-t border-white/10 p-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.k} className={WIDE.includes(f.type) ? "sm:col-span-2" : ""}>
                    <Field f={f} idPrefix={r._k} value={get(r, f.k)} error={errors[r._k]?.[f.k]} onChange={(v) => patch(i, f.k, v)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className={`${btnGhost} text-sm`}><Plus size={16} />Add {noun}</button>
      <SaveBar onSave={save} busy={busy} status={status} />
    </section>
  );
}
