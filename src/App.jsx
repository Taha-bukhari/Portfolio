import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Github, Linkedin, Mail } from "lucide-react";
import { nav } from "./data";
import { ContentProvider, useContent } from "./lib/content";
import Home from "./pages/Home";
import About from "./pages/About";
import Achievements from "./pages/Achievements";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const Background = () => (
  <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
    <div className="blob absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-ember/40 blur-[140px]" />
    <div className="blob b absolute -right-40 top-1/3 h-[38rem] w-[38rem] rounded-full bg-volt/35 blur-[150px]" />
    <div className="blob c absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full bg-ember/25 blur-[130px]" />
  </div>
);

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useContent();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const link = ({ isActive }) =>
    `relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-ember after:transition-opacity after:content-[''] ${isActive ? "text-white after:opacity-100" : "text-white/65 after:opacity-0 hover:text-white"}`;
  const mobileLink = ({ isActive }) => `py-3 text-base font-medium ${isActive ? "text-ember" : "text-white/75"}`;
  const cta = "rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-ink shadow-[0_0_30px_-8px_var(--color-ember)] transition hover:-translate-y-0.5";
  return (
    <header className="sticky top-0 z-50">
      <span aria-hidden className={`absolute inset-0 -z-10 backdrop-blur-xl transition-opacity duration-300 ${open ? "bg-ink/95" : "nav-fade bg-ink/70"} ${scrolled || open ? "opacity-100" : "opacity-0"}`} />
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto] items-center gap-6 px-5 lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="justify-self-start font-display text-xl font-extrabold">Taha<span className="text-ember">.</span></Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {nav.map(([label, to]) => <NavLink key={to} to={to} end className={link}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center justify-self-end">
          <Link to="/contact" className={`${cta} hidden lg:inline-flex`}>{t("navCta")}</Link>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col px-5 pb-5 pt-1 lg:hidden" aria-label="Mobile">
          {nav.map(([label, to]) => <NavLink key={to} to={to} end onClick={() => setOpen(false)} className={mobileLink}>{label}</NavLink>)}
          <Link to="/contact" onClick={() => setOpen(false)} className={`${cta} mt-3 text-center`}>{t("navCta")}</Link>
        </nav>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent" />
    </header>
  );
}

function Footer() {
  const { profile } = useContent();
  const s = profile.socials;
  const icons = [[Github, s.github, "GitHub"], [Linkedin, s.linkedin, "LinkedIn"], [Mail, `mailto:${s.email}`, "Email"]];
  return (
    <footer className="border-t border-white/10 bg-ink/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-display font-bold">{profile.name}</p>
          <p className="text-sm text-white/50">{profile.title}, {profile.location}</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-5 text-sm text-white/60">
          {nav.map(([label, to]) => <Link key={to} to={to} className="hover:text-ember">{label}</Link>)}
        </nav>
        <div className="flex gap-3">
          {icons.map(([Icon, href, label]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-ember hover:text-ember">
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

const Admin = lazy(() => import("./admin/Admin"));

function Public() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Background />
      <ContentProvider>
        <Routes>
          <Route path="/admin/*" element={<Suspense fallback={null}><Admin /></Suspense>} />
          <Route path="*" element={<Public />} />
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  );
}
