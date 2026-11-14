import { useEffect, useState } from "react";
import { Home, User, FolderOpen, Wrench, Briefcase, Trophy, Mail, Inbox, Image as ImageIcon, Palette, KeyRound, LayoutDashboard, LogOut, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useContent } from "../lib/content";
import { card, btnPrimary } from "../components/Layout";
import { ObjectEditor, ListEditor, S } from "./editors";
import { Messages, Images, ThemeEditor, Account } from "./panels";

const small = "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-volt hover:text-volt";
const T = (rows) => rows.map(([k, label, type]) => S(k, label, type ?? "text", { required: true }));
const LEVELS = ["Strong", "Good", "Growing"];

const SECTIONS = [
  { id: "home", label: "Home", icon: Home, desc: "Name, headline, tagline, badge, stat numbers, How I Work cards and call to action text.", render: () => (
    <>
      <ObjectEditor docKey="profile" title="Hero" fields={[
        S("name", "Your name", "text", { required: true, max: 100 }), S("title", "Job title", "text", { required: true, max: 100 }),
        S("tagline", "Tagline", "textarea", { required: true, max: 300, rows: 2 }), S("badge", "Badge text", "text", { required: true, max: 80 })]} />
      <ObjectEditor docKey="texts" title="Home page text" fields={T([
        ["navCta", "Navigation bar button text"], ["homeCta", "Hero button text"], ["homeTeaserTitle", "“What I build” heading"], ["homeTeaserText", "“What I build” intro", "textarea"],
        ["homeFeaturedTitle", "Featured projects heading"], ["homeFeaturedText", "Featured projects intro"], ["homeViewAll", "“View all projects” button"],
        ["homeExperienceTitle", "Experience heading"], ["homeHowTitle", "How I Work heading"], ["homeTechTitle", "Technologies heading"],
        ["homeClosingTitle", "Closing call to action heading"], ["homeClosingText", "Closing call to action text", "textarea"]])} />
      <ListEditor docKey="stats" title="Stat counters" noun="stat" label={(r) => `${r.to}${r.suffix} ${r.label}`} blank={{ label: "", to: 0, suffix: "+" }}
        fields={[S("label", "Label", "text", { required: true, max: 60 }), S("to", "Number", "number", { required: true }), S("suffix", "Suffix (for example + or %)", "text", { max: 3 })]} />
      <ListEditor docKey="principles" title="How I Work cards" noun="card" label={(r) => r.title} blank={{ title: "", text: "" }}
        fields={[S("title", "Title", "text", { required: true, max: 80 }), S("text", "Text", "textarea", { required: true, max: 300 })]} />
    </>) },
  { id: "about", label: "About", icon: User, desc: "Your story, timeline milestones and skill levels.", render: () => (
    <>
      <ObjectEditor docKey="texts" title="About page headings" fields={T([
        ["aboutTitle", "Page heading"], ["aboutJourneyTitle", "Timeline heading"], ["aboutJourneyText", "Timeline intro"],
        ["aboutSkillsTitle", "Skill meters heading"], ["aboutSkillsText", "Skill meters intro"], ["aboutClosingTitle", "Closing card heading"]])} />
      <ObjectEditor docKey="about" title="Your story" fields={[
        S("lead", "Intro line", "textarea", { required: true, rows: 2 }),
        S("story", "Story paragraphs", "paras", { required: true, hint: "Leave a blank line between paragraphs." }),
        S("mission", "Mission statement", "textarea", { required: true }),
        S("facts", "Quick facts", "pairs", { hint: "One per line, written as Label: value" })]} />
      <ListEditor docKey="timeline" title="Timeline milestones" noun="milestone" label={(r) => r.title} blank={{ title: "", date: "", description: "" }}
        hint="Oldest first. Leave the date empty to show no date."
        fields={[S("title", "Title", "text", { required: true, max: 200 }), S("date", "Date", "text", { max: 60 }), S("description", "Description", "textarea", { max: 400 })]} />
      <ListEditor docKey="skills" title="Skill levels" noun="skill" label={(r) => `${r.name} (${r.level})`} blank={{ name: "", level: "Growing" }}
        fields={[S("name", "Skill", "text", { required: true, max: 60 }), S("level", "Level", "select", { options: LEVELS })]} />
    </>) },
  { id: "projects", label: "Projects", icon: FolderOpen, desc: "Add, edit, reorder and remove projects. Updates the Home page and the Projects page.", render: () => (
    <>
      <ObjectEditor docKey="texts" title="Projects page text" fields={T([["projectsTitle", "Page heading"], ["projectsIntro", "Intro text", "textarea"]])} />
      <ListEditor docKey="projects" title="Projects" noun="project" label={(r) => r.title}
        hint="Projects ticked “Show on Home page” appear in the featured section. Order here is the order on the site."
        blank={{ title: "", category: "", description: "", tags: [], image: "", github: "", live: "#", featured: false }}
        fields={[
          S("title", "Title", "text", { required: true, max: 100 }),
          S("category", "Category (becomes a filter tab)", "text", { required: true, max: 60, suggest: ["React Apps", "Next.js Apps", "HTML, CSS & JavaScript Websites"] }),
          S("description", "Description", "textarea", { required: true, max: 300 }),
          S("tags", "Tech tags", "tags", { hint: "Separate with commas." }),
          S("github", "GitHub link", "url", { required: true }), S("live", "Live demo link", "url", { hint: "Use # until you have one." }),
          S("featured", "Home page", "checkbox", { hint: "Show on Home page" }),
          S("image", "Thumbnail", "image", { folder: "projects" })]} />
    </>) },
  { id: "skills", label: "Skills", icon: Wrench, desc: "The skill cards on the Skills page.", render: () => (
    <>
      <ObjectEditor docKey="texts" title="Skills page text" fields={T([["skillsTitle", "Page heading"], ["skillsIntro", "Intro text", "textarea"], ["skillsClosingTitle", "Closing card heading"]])} />
      <ListEditor docKey="skillAreas" title="Skill cards" noun="skill card" label={(r) => r.title}
        blank={{ icon: "Code2", title: "", description: "", technologies: [], usedIn: [] }}
        fields={[
          S("title", "Title", "text", { required: true, max: 100 }), S("icon", "Icon", "icon"),
          S("description", "Description", "textarea", { required: true, max: 400 }),
          S("technologies", "Technologies", "tags", { hint: "Separate with commas." }),
          S("usedIn", "Used in", "tags", { hint: "Project names that match a project become links. Separate with commas." })]} />
    </>) },
  { id: "experience", label: "Experience", icon: Briefcase, desc: "Jobs, internships and teaching shown on the Home page timeline.", render: () => (
    <ListEditor docKey="experience" title="Experience entries" noun="entry" label={(r) => `${r.title}${r.org ? `, ${r.org}` : ""}`}
      hint="Newest first." blank={{ title: "", org: "", dates: "", text: "" }}
      fields={[S("title", "Title", "text", { required: true, max: 100 }), S("org", "Organization", "text", { required: true, max: 100 }),
        S("dates", "Dates", "text", { required: true, max: 60 }), S("text", "Description", "textarea", { required: true, max: 500 })]} />) },
  { id: "achievements", label: "Achievements", icon: Trophy, desc: "Awards and certificates, with verify links and certificate images.", render: () => (
    <ListEditor docKey="achievements" title="Awards and certifications" noun="achievement" label={(r) => r.title}
      hint="Items in the “Awards” category get the large highlight card. Any other category becomes its own group."
      blank={{ title: "", category: "Certifications", date: "", issuer: "", why: "", verify: "", image: "" }}
      fields={[
        S("title", "Title", "text", { required: true, max: 200 }),
        S("category", "Category", "text", { required: true, max: 60, suggest: ["Awards", "Certifications"] }),
        S("date", "Date", "text", { max: 60, hint: "Leave empty to show no date." }), S("issuer", "Issued by", "text", { required: true, max: 250 }),
        S("why", "Why it matters", "textarea", { required: true, max: 400 }), S("verify", "Verify link", "url", { hint: "Leave empty for no Verify button." }),
        S("image", "Certificate image", "image", { folder: "certificates" })]} />) },
  { id: "contact", label: "Contact Info", icon: Mail, desc: "Email, phone, WhatsApp, location and social links, plus Contact page text.", render: () => (
    <>
      <ObjectEditor docKey="profile" title="Contact details" fields={[
        S("socials.email", "Email", "email", { required: true }), S("phone", "Phone number", "phone", { required: true }),
        S("whatsapp", "WhatsApp number", "phone", { hint: "Leave empty to use the phone number." }), S("location", "Location", "text", { required: true, max: 100 }),
        S("socials.linkedin", "LinkedIn link", "url", { required: true }), S("socials.github", "GitHub link", "url", { required: true })]} />
      <ObjectEditor docKey="texts" title="Contact page text" fields={T([["contactTitle", "Page heading"], ["contactIntro", "Line above the form", "textarea"]])} />
    </>) },
  { id: "messages", label: "Messages", icon: Inbox, desc: "Messages sent through your Contact form.", render: () => <Messages /> },
  { id: "images", label: "Images", icon: ImageIcon, desc: "Your profile photo, project thumbnails and certificate images.", render: () => <Images /> },
  { id: "theme", label: "Theme", icon: Palette, desc: "Choose the colors for the whole website.", render: () => <ThemeEditor /> },
  { id: "account", label: "Account", icon: KeyRound, desc: "Change your password or log out.", render: ({ email, signOut }) => <Account email={email} onSignOut={signOut} /> },
];

const Center = ({ children }) => <div className="grid min-h-[70vh] place-items-center px-5">{children}</div>;

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) setErr("Incorrect email or password.");
  };
  return (
    <Center>
      <form onSubmit={submit} className={`${card} w-full max-w-md space-y-5 p-6 md:p-8`}>
        <h1 className="font-display text-3xl font-extrabold">Admin login</h1>
        <div>
          <label htmlFor="em" className="mb-2 block text-sm font-semibold text-white/80">Email</label>
          <input id="em" type="email" autoComplete="username" required className="field w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pw" className="mb-2 block text-sm font-semibold text-white/80">Password</label>
          <input id="pw" type="password" autoComplete="current-password" required className="field w-full" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full justify-center disabled:opacity-60 disabled:hover:translate-y-0`}>
          {busy && <Loader2 size={18} className="animate-spin" />}Log in
        </button>
      </form>
    </Center>
  );
}

function Dashboard({ go }) {
  return (
    <>
      <p className="text-white/65">Choose what you want to edit. Everything you save goes live on your website straight away.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} type="button" onClick={() => go(id)}
            className={`${card} p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_24px_70px_-24px_var(--color-ember)]`}>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-ember/25 to-volt/25 text-ember"><Icon size={22} /></span>
            <span className="mt-4 block font-display text-lg font-bold">{label}</span>
            <span className="mt-1 block text-sm text-white/60">{desc}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Shell({ email, signOut }) {
  const [sec, setSec] = useState("dashboard");
  const current = SECTIONS.find((s) => s.id === sec);
  const nav = [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, ...SECTIONS];
  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Admin Panel</h1>
          <p className="text-sm text-white/50">Signed in as {email}</p>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noreferrer" className={small}><ExternalLink size={16} />View site</a>
          <button type="button" onClick={signOut} className={small}><LogOut size={16} />Log out</button>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
        <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:self-start lg:overflow-visible lg:pb-0">
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setSec(id)} aria-current={sec === id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition lg:rounded-xl ${sec === id ? "bg-gradient-to-r from-ember to-volt text-ink" : "text-white/70 hover:bg-white/5"}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </nav>
        <div key={sec} className="fade-in min-w-0 space-y-6">
          {sec === "dashboard" ? <Dashboard go={setSec} /> : (
            <>
              <div>
                <h2 className="font-display text-3xl font-extrabold">{current.label}</h2>
                <p className="mt-1 text-white/60">{current.desc}</p>
              </div>
              {current.render({ email, signOut })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { loading } = useContent();
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) { setIsAdmin(null); return; }
    supabase.rpc("is_admin").then(({ data, error }) => setIsAdmin(!error && data === true));
  }, [userId]);

  const signOut = () => supabase.auth.signOut();

  if (!supabase) {
    return <Center><p className={`${card} max-w-md p-6 text-white/75`}>The Admin Panel is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as described in the README, then reload.</p></Center>;
  }
  if (session === undefined || loading || (session && isAdmin === null)) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!session) return <Login />;
  if (!isAdmin) {
    return (
      <Center>
        <div className={`${card} max-w-md space-y-4 p-6`}>
          <h1 className="font-display text-2xl font-extrabold">Not an admin account</h1>
          <p className="text-white/70">This account is not set up as the website admin yet. Follow the “make my account the admin” step in the README, then log in again.</p>
          <button type="button" onClick={signOut} className={small}><LogOut size={16} />Log out</button>
        </div>
      </Center>
    );
  }
  return <Shell email={session.user.email} signOut={signOut} />;
}
