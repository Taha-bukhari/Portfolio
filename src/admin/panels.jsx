import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2, Mail, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useContent } from "../lib/content";
import { themes } from "../data";
import { card, btnPrimary, btnGhost } from "../components/Layout";
import { ImageField, Status, saveDoc } from "./editors";

// ---- Messages inbox ----
export function Messages() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else { setErr(""); setRows(data); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const flag = async (m, isRead) => {
    const { error } = await supabase.from("messages").update({ is_read: isRead }).eq("id", m.id);
    if (error) setErr(error.message); else load();
  };
  const show = (m) => { setOpen(open === m.id ? null : m.id); if (!m.is_read) flag(m, true); };
  const del = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("messages").delete().eq("id", m.id);
    if (error) setErr(error.message); else { setOpen(null); load(); }
  };
  const unread = (rows ?? []).filter((m) => !m.is_read).length;
  return (
    <div className="space-y-4">
      {err && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{err}</p>}
      {rows === null && !err && <Loader2 className="animate-spin" />}
      {rows && <p className="text-sm text-white/55">{rows.length} message{rows.length === 1 ? "" : "s"}, {unread} unread.</p>}
      {rows?.length === 0 && <p className={`${card} p-6 text-white/60`}>No messages yet. Messages from your Contact page appear here.</p>}
      {rows?.map((m) => (
        <div key={m.id} className={`${card} overflow-hidden`}>
          <button type="button" onClick={() => show(m)} aria-expanded={open === m.id} className="flex w-full items-center gap-4 p-4 text-left">
            <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.is_read ? "bg-white/15" : "bg-ember"}`} />
            <span className="min-w-0 flex-1">
              <span className={`block truncate ${m.is_read ? "" : "font-bold"}`}>{m.name} <span className="font-normal text-white/50">· {m.inquiry_type}</span></span>
              <span className="block truncate text-sm text-white/50">{m.message}</span>
            </span>
            <span className="hidden shrink-0 text-xs text-white/45 sm:block">{new Date(m.created_at).toLocaleString()}</span>
          </button>
          {open === m.id && (
            <div className="space-y-4 border-t border-white/10 p-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-white/45">Name</dt><dd className="font-semibold">{m.name}</dd></div>
                <div><dt className="text-white/45">Email</dt><dd><a href={`mailto:${m.email}`} className="break-all font-semibold text-volt hover:underline">{m.email}</a></dd></div>
                <div><dt className="text-white/45">Company or organization</dt><dd className="font-semibold">{m.company || "Not given"}</dd></div>
                <div><dt className="text-white/45">Inquiry type</dt><dd className="font-semibold">{m.inquiry_type}</dd></div>
                <div className="sm:col-span-2"><dt className="text-white/45">Received</dt><dd className="font-semibold">{new Date(m.created_at).toLocaleString()}</dd></div>
              </dl>
              <p className="whitespace-pre-wrap rounded-lg bg-ink/50 p-4 text-white/80">{m.message}</p>
              <div className="flex flex-wrap gap-3">
                <a href={`mailto:${m.email}`} className={`${btnGhost} text-sm`}><Mail size={16} />Reply by email</a>
                <button type="button" onClick={() => flag(m, !m.is_read)} className={`${btnGhost} text-sm`}>Mark as {m.is_read ? "unread" : "read"}</button>
                <button type="button" onClick={() => del(m)} className={`${btnGhost} text-sm hover:border-red-400 hover:text-red-300`}><Trash2 size={16} />Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---- Images: every image on the site in one place. Uploading saves straight away. ----
const PLACEHOLDER = "/headshot-placeholder.svg";
function Slot({ title, value, folder, onChange }) {
  return (
    <div className={`${card} p-5`}>
      <p className="mb-4 font-semibold">{title}</p>
      <ImageField value={value} folder={folder} onChange={onChange} />
    </div>
  );
}
export function Images() {
  const c = useContent();
  const [note, setNote] = useState(null);
  const persist = (key, build) => async (url) => {
    await saveDoc(key, build(url));
    await c.refresh();
    setNote({ ok: true, msg: "Saved. Your live website is updated." });
  };
  const swap = (list, i, field) => (url) => list.map((q, j) => (j === i ? { ...q, [field]: url } : q));
  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60">Uploading or removing an image here saves it straight away and updates the live website.</p>
      <Status s={note} />
      <h3 className="font-display text-xl font-bold">Profile photo</h3>
      <Slot title="Home page photo" value={c.profile.photo} folder="profile" onChange={persist("profile", (url) => ({ ...c.profile, photo: url || PLACEHOLDER }))} />
      <h3 className="font-display text-xl font-bold">Project thumbnails</h3>
      {c.projects.map((p, i) => (
        <Slot key={`${p.title}-${i}`} title={p.title} value={p.image} folder="projects" onChange={persist("projects", swap(c.projects, i, "image"))} />
      ))}
      <h3 className="font-display text-xl font-bold">Certificate images</h3>
      {c.achievements.map((a, i) => (
        <Slot key={`${a.title}-${i}`} title={a.title} value={a.image} folder="certificates" onChange={persist("achievements", swap(c.achievements, i, "image"))} />
      ))}
    </div>
  );
}

// ---- Theme switcher with live preview ----
export function ThemeEditor() {
  const c = useContent();
  const saved = c.theme?.name ?? "charcoal";
  const [sel, setSel] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const savedRef = useRef(saved);
  savedRef.current = saved;
  useEffect(() => {
    document.documentElement.dataset.theme = sel;
    return () => { document.documentElement.dataset.theme = savedRef.current; };
  }, [sel]);
  const save = async () => {
    setBusy(true); setStatus(null);
    try {
      await saveDoc("theme", { name: sel });
      await c.refresh();
      setStatus({ ok: true, msg: "Theme saved. Every page of your live website now uses it." });
    } catch (e) {
      setStatus({ ok: false, msg: `Could not save: ${e.message}` });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`${card} space-y-5 p-5 md:p-6`}>
      <p className="text-sm text-white/60">Pick a theme to preview it on this page right now. Nothing changes for visitors until you click Save.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((t) => (
          <button key={t.id} type="button" aria-pressed={sel === t.id} onClick={() => setSel(t.id)}
            className={`rounded-xl border p-4 text-left transition ${sel === t.id ? "border-ember bg-white/5" : "border-white/10 hover:border-white/30"}`}>
            <span className="flex h-10 overflow-hidden rounded-lg">
              {t.swatch.map((hex) => <span key={hex} className="flex-1" style={{ background: hex }} />)}
            </span>
            <span className="mt-3 flex items-center justify-between gap-2 font-semibold">
              {t.name}
              {t.id === saved && <span className="text-xs font-normal text-white/50">Live now</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={busy || sel === saved} className={`${btnPrimary} disabled:opacity-60 disabled:hover:translate-y-0`}>
          {busy && <Loader2 size={18} className="animate-spin" />}Save theme
        </button>
        <button type="button" onClick={() => setSel(saved)} disabled={sel === saved} className={`${btnGhost} disabled:opacity-40`}>Undo preview</button>
        <Status s={status} />
      </div>
    </div>
  );
}

// ---- Account: change password, sign out ----
export function Account({ email, onSignOut }) {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!cur) return setStatus({ ok: false, msg: "Enter your current password." });
    if (pw.length < 10) return setStatus({ ok: false, msg: "Use at least 10 characters for the new password." });
    if (pw !== pw2) return setStatus({ ok: false, msg: "The two new passwords do not match." });
    setBusy(true); setStatus(null);
    const check = await supabase.auth.signInWithPassword({ email, password: cur });
    if (check.error) { setBusy(false); return setStatus({ ok: false, msg: "Your current password is not correct." }); }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setStatus({ ok: false, msg: error.message });
    setCur(""); setPw(""); setPw2("");
    setStatus({ ok: true, msg: "Password changed. Use the new one next time you log in." });
  };
  const input = (id, label, value, set) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/80">{label}</label>
      <input id={id} type="password" autoComplete={id === "cur" ? "current-password" : "new-password"} className="field w-full" value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className={`${card} max-w-lg space-y-5 p-5 md:p-6`}>
        <h3 className="font-display text-xl font-bold">Change password</h3>
        <p className="text-sm text-white/55">Signed in as {email}. Choose a long, unique password (10 characters or more).</p>
        {input("cur", "Current password", cur, setCur)}
        {input("new", "New password", pw, setPw)}
        {input("new2", "Repeat new password", pw2, setPw2)}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={`${btnPrimary} disabled:opacity-60 disabled:hover:translate-y-0`}>
            {busy && <Loader2 size={18} className="animate-spin" />}Change password
          </button>
          <Status s={status} />
        </div>
      </form>
      <button type="button" onClick={onSignOut} className={btnGhost}>Log out</button>
    </div>
  );
}
