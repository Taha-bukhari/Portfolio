import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { Reveal } from "../hooks";
import { useContent } from "../lib/content";
import { Thumb, Tags, ProjectLinks } from "../components/Project";


function Tabs({ value, onChange, tabs }) {
  const refs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const measure = useCallback(() => {
    const el = refs.current[value];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);
  return (
    <div role="tablist" className="relative flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-panel/60 p-1 backdrop-blur">
      <span aria-hidden className="absolute bottom-1 top-1 rounded-full bg-gradient-to-r from-ember to-volt shadow-[0_0_30px_-6px_var(--color-ember)] transition-all duration-500 ease-out"
        style={{ left: pill.left, width: pill.width }} />
      {tabs.map((t) => (
        <button key={t} ref={(el) => (refs.current[t] = el)} role="tab" aria-selected={t === value} onClick={() => onChange(t)}
          className={`relative z-10 shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 ${t === value ? "text-ink" : "text-white/70 hover:text-white"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Lightbox({ p, onClose }) {
  return (
    <Modal label={p.title} onClose={onClose}>
      <Thumb p={p} />
      <div className="p-6 md:p-8">
        <p className="text-sm font-semibold text-volt">{p.category}</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">{p.title}</h2>
        <p className="mt-3 text-white/75">{p.description}</p>
        <div className="mt-5"><Tags tags={p.tags} /></div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <ProjectLinks p={p} />
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white">Close</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Projects() {
  const { projects, t } = useContent();
  const tabs = ["All", ...new Set(projects.map((p) => p.category))];
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const shown = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-14 md:pt-20">
        <Reveal>
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">{t("projectsTitle")}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">{t("projectsIntro")}</p>
        </Reveal>
        <Reveal delay={120} className="mt-10"><Tabs value={filter} onChange={setFilter} tabs={tabs} /></Reveal>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <Reveal key={`${filter}-${p.title}`} delay={i * 90}>
              <article role="button" tabIndex={0} aria-haspopup="dialog" onClick={() => setOpen(p)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(p); } }}
                className="group h-full cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-panel/60 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-ember/50 hover:shadow-[0_24px_70px_-24px_var(--color-ember)]">
                <Thumb p={p} zoom />
                <div className="p-5">
                  <h2 className="font-display text-lg font-bold">{p.title}</h2>
                  <p className="mt-2 text-sm text-white/65">{p.description}</p>
                  <div className="mt-4"><Tags tags={p.tags} /></div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      {open && <Lightbox p={open} onClose={close} />}
    </>
  );
}
