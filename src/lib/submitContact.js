import { supabase } from "./supabase";

// Called by the Contact form with { name, email, company, type, message }.
// Messages are stored in the Supabase "messages" table and shown in the Admin Panel inbox.
export async function submitContact(v) {
  if (!supabase) {
    // Supabase is not connected: nothing is sent anywhere.
    await new Promise((resolve) => setTimeout(resolve, 900));
    console.info("Contact form is not connected yet. Submission:", v);
    return;
  }
  const { error } = await supabase.from("messages").insert({
    name: v.name, email: v.email, company: v.company || null, inquiry_type: v.type, message: v.message,
  });
  if (error) throw error;
}
