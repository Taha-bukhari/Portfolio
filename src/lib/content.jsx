import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { defaults } from "../data";

const Ctx = createContext(null);
export const useContent = () => useContext(Ctx);

// Loads site content from Supabase and merges it over the built-in defaults, so the
// website still looks complete if the database is empty or unreachable.
export function ContentProvider({ children }) {
  const [db, setDb] = useState({});
  const [loading, setLoading] = useState(Boolean(supabase));

  const refresh = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("site_content").select("key,value");
      if (error) throw error;
      setDb(Object.fromEntries((data ?? []).map((r) => [r.key, r.value])));
    } catch (e) {
      console.warn("Showing built-in content:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const ch = supabase.channel("site-content")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  const value = useMemo(() => {
    const m = {};
    for (const k of Object.keys(defaults)) {
      const d = defaults[k], v = db[k];
      m[k] = v == null ? d : Array.isArray(d) ? (Array.isArray(v) ? v : d) : { ...d, ...v };
    }
    m.profile = { ...m.profile, socials: { ...defaults.profile.socials, ...db.profile?.socials } };
    return { ...m, t: (k) => m.texts[k] ?? "", loading, refresh };
  }, [db, loading, refresh]);

  // Apply the theme saved in the database. The theme cached from the last visit is applied by a
  // script in index.html before the page is drawn, so the colors do not flash.
  const dbTheme = db.theme?.name;
  useEffect(() => {
    if (!dbTheme) return;
    document.documentElement.dataset.theme = dbTheme;
    try { localStorage.setItem("theme", dbTheme); } catch { /* ignore */ }
  }, [dbTheme]);

  // First visit (nothing cached yet): the page stays hidden until the saved theme has loaded.
  useEffect(() => {
    if (!loading) document.documentElement.removeAttribute("data-wait");
  }, [loading]);
  useEffect(() => {
    const id = setTimeout(() => document.documentElement.removeAttribute("data-wait"), 2500);
    return () => clearTimeout(id);
  }, []);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
