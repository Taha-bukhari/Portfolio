import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null when the two keys are missing: the public site then shows its built-in content.
export const supabase = url && key ? createClient(url, key) : null;
