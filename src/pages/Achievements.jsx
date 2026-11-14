import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Award, Eye, BadgeCheck } from "lucide-react";
import { Reveal } from "../hooks";
import Modal from "../components/Modal";
import { Section, Head, card, btnPrimary, btnGhost } from "../components/Layout";
import { useContent } from "../lib/content";

const icons = { Awards: Trophy };
const iconFor = (a) => icons[a.category] ?? Award;
const pill = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";

function Actions({ a, onView }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={() => onView(a)} className={`${pill} border border-white/20 hover:border-volt hover:text-volt`}><Eye size={16} />View Certificate</button>
      {a.verify && (
        <a href={a.verify} target="_blank" rel="noreferrer" className={`${pill} bg-ember text-ink hover:-translate-y-0.5`}><BadgeCheck size={16} />Verify Certificate</a>
      )}
    </div>
  );
}

function Featured({ a, onView }) {
  const Icon = iconFor(a);
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-4 animate-pulse rounded-[2rem] bg-gold/20 blur-3xl" />
      <article className="relative flex flex-col gap-6 rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/15 via-panel/85 to-ember/10 p-8 backdrop-blur md:flex-row md:items-center md:p-10">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-ember text-ink"><Icon size={40} /></span>
        <div className="flex-1">
          {a.date && <p className="text-sm font-semibold text-gold">{a.date}</p>}
          <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight md:text-3xl">{a.title}</h3>
          <p className="mt-2 text-white/60">{a.issuer}</p>
          <p className="mt-4 max-w-2xl text-white/75">{a.why}</p>
          <div className="mt-6"><Actions a={a} onView={onView} /></div>
        </div>
      </article>
    </div>
  );
}

function Cert({ a, onView }) {
  const Icon = iconFor(a);
  return (
    <article className={`${card} flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1.5 hover:border-ember/50 hover:shadow-[0_24px_70px_-24px_var(--color-ember)]`}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ember/25 to-volt/25 text-ember"><Icon size={24} /></span>
        {a.date && <p className="pt-1 text-right text-sm font-semibold text-volt">{a.date}</p>}
      </div>
      <h3 className="mt-5 font-display text-xl font-bold leading-snug">{a.title}</h3>
      <p className="mt-1 text-sm text-white/55">{a.issuer}</p>
      <p className="mt-3 text-sm text-white/70">{a.why}</p>
      <div className="mt-6 flex flex-1 items-end"><Actions a={a} onView={onView} /></div>
    </article>
  );
}

function CertImage({ a }) {
  const Icon = iconFor(a);
  if (a.image) return <img src={a.image} alt={`${a.title} certificate`} className="max-h-[70vh] w-full bg-ink object-contain" />;
  return (
    <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-ember/15 via-panel to-volt/15 p-6 text-center">
      <div className="max-w-sm rounded-xl border border-dashed border-white/25 px-8 py-10">
        <Icon size={40} className="mx-auto text-ember" />
        <p className="mt-4 font-display text-lg font-bold">{a.title}</p>
        <p className="mt-1 text-sm text-white/55">Certificate image will be added soon</p>
      </div>
    </div>
  );
}

export default function Achievements() {
  const { achievements } = useContent();
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  // Awards first, then every other category in the order it first appears.
  const groups = [...new Set(achievements.map((a) => a.category))].sort((x, y) => (y === "Awards") - (x === "Awards"));
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-14 md:pt-20">
        <Reveal>
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">Achievements</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">Awards and certificates I have earned along the way.</p>
        </Reveal>
      </section>

      {groups.map((g) => {
        const items = achievements.filter((a) => a.category === g);
        return (
          <Section key={g} pad="py-10">
            <Head title={g} />
            {g === "Awards" ? (
              <div className="space-y-8">
                {items.map((a) => <Reveal key={a.title}><Featured a={a} onView={setOpen} /></Reveal>)}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {items.map((a, i) => <Reveal key={a.title} delay={(i % 2) * 110} className="h-full"><Cert a={a} onView={setOpen} /></Reveal>)}
              </div>
            )}
          </Section>
        );
      })}

      <Section pad="pb-24 pt-10">
        <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ember/15 via-panel/80 to-volt/15 p-8 backdrop-blur md:p-12">
          <h2 className="max-w-md font-display text-2xl font-extrabold md:text-3xl">See what I have built</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects" className={btnPrimary}>View My Projects</Link>
            <Link to="/contact" className={btnGhost}>Get in touch</Link>
          </div>
        </Reveal>
      </Section>

      {open && (
        <Modal label={open.title} onClose={close}>
          <CertImage a={open} />
          <div className="p-6 md:p-8">
            {open.date && <p className="text-sm font-semibold text-volt">{open.date}</p>}
            <h2 className="mt-1 font-display text-2xl font-extrabold">{open.title}</h2>
            <p className="mt-1 text-white/60">{open.issuer}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              {open.verify
                ? <a href={open.verify} target="_blank" rel="noreferrer" className={`${pill} bg-ember text-ink hover:-translate-y-0.5`}><BadgeCheck size={16} />Verify Certificate</a>
                : <span />}
              <button onClick={close} className="rounded-full px-4 py-2 text-sm font-semibold text-white/60 transition hover:text-white">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
