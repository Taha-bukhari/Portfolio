import { Link } from "react-router-dom";
import { Reveal, useInView } from "../hooks";
import { Section, Head, card, btnPrimary, btnGhost } from "../components/Layout";
import { levelFill } from "../data";
import { useContent } from "../lib/content";

const tone = { Strong: "text-ember", Good: "text-volt", Growing: "text-white/60" };

function Dot({ current }) {
  const [ref, seen] = useInView(0.5);
  return (
    <span ref={ref} aria-hidden
      className={`absolute left-3 top-7 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4 transition duration-700 md:left-1/2 ${seen ? "scale-100 opacity-100" : "scale-0 opacity-0"} ${current ? "animate-pulse bg-volt ring-volt/30" : "bg-ember ring-ember/25"}`} />
  );
}

function Timeline() {
  const { timeline } = useContent();
  return (
    <ol className="relative mx-auto max-w-4xl">
      <span aria-hidden className="absolute bottom-0 left-3 top-0 w-px bg-white/15 md:left-1/2" />
      {timeline.map((m, i) => {
        const onRight = i % 2 === 1;
        return (
          <li key={`${m.title}-${i}`} className="relative mb-10 pl-10 last:mb-0 md:grid md:grid-cols-2 md:gap-14 md:pl-0">
            <Dot current={i === timeline.length - 1} />
            <Reveal from={onRight ? "right" : "left"} className={onRight ? "md:col-start-2" : "md:col-start-1"}>
              <div className={`${card} p-6`}>
                {m.date && <p className="text-sm font-semibold text-volt">{m.date}</p>}
                <h3 className="mt-1 font-display text-lg font-bold leading-snug">{m.title}</h3>
                {m.description && <p className="mt-2 text-sm text-white/65">{m.description}</p>}
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

function Meter({ name, level, delay }) {
  const [ref, seen] = useInView(0.5);
  return (
    <div ref={ref}>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="font-semibold">{name}</span>
        <span className={`text-sm font-semibold ${tone[level] ?? "text-white/60"}`}>{level}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-ember to-volt transition-[width] duration-[1400ms] ease-out"
          style={{ width: seen ? `${levelFill[level] ?? 50}%` : "0%", transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

export default function About() {
  const { about, skills, t } = useContent();
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-14 md:pt-20">
        <Reveal>
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">{t("aboutTitle")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">{about.lead}</p>
        </Reveal>
      </section>

      <Section pad="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6 text-lg leading-relaxed text-white/75">
            {about.story.map((t, i) => <Reveal key={i} delay={i * 100}><p>{t}</p></Reveal>)}
            <Reveal delay={300}>
              <p className="rounded-2xl border border-white/10 bg-gradient-to-br from-ember/15 via-panel/80 to-volt/15 p-8 font-display text-xl font-bold leading-snug text-white backdrop-blur md:text-2xl">{about.mission}</p>
            </Reveal>
          </div>
          <Reveal from="right" delay={150}>
            <dl className={`${card} divide-y divide-white/10 p-2`}>
              {about.facts.map(([k, v]) => (
                <div key={k} className="p-4">
                  <dt className="text-sm text-white/50">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Head title={t("aboutJourneyTitle")} text={t("aboutJourneyText")} />
        <Timeline />
      </Section>

      <Section>
        <Head title={t("aboutSkillsTitle")} text={t("aboutSkillsText")} />
        <div className={`${card} grid gap-x-12 gap-y-8 p-8 md:grid-cols-2`}>
          {skills.map((s, i) => (
            <Reveal key={s.name} delay={(i % 2) * 120}><Meter name={s.name} level={s.level} delay={200 + (i % 2) * 120} /></Reveal>
          ))}
        </div>
      </Section>

      <Section pad="pb-24 pt-6">
        <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ember/15 via-panel/80 to-volt/15 p-8 backdrop-blur md:p-12">
          <h2 className="max-w-md font-display text-2xl font-extrabold md:text-3xl">{t("aboutClosingTitle")}</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects" className={btnPrimary}>View My Projects</Link>
            <Link to="/contact" className={btnGhost}>Get in touch</Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
